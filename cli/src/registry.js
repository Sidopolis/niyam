import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import https from 'node:https';

const REGISTRY_URL = 'https://raw.githubusercontent.com/niyam-rules/registry/main/index.json';
const CACHE_FILENAME = 'registry-cache.json';

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return httpGet(res.headers.location).then(resolve, reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function getCachePath(projectDir) {
  return join(projectDir, '.niyam', CACHE_FILENAME);
}

function sha256(content) {
  return createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * Fetches the registry index from GitHub.
 * Falls back to local cache if offline.
 */
export async function fetchRegistry(projectDir = process.cwd(), registryUrl = REGISTRY_URL) {
  const cachePath = getCachePath(projectDir);

  try {
    const raw = await httpGet(registryUrl);
    const registry = JSON.parse(raw);

    // Cache locally
    const cacheDir = join(projectDir, '.niyam');
    if (!existsSync(cacheDir)) mkdirSync(cacheDir, { recursive: true });
    writeFileSync(cachePath, raw, 'utf8');

    return registry.packages || [];
  } catch (err) {
    // Fallback to cache
    if (existsSync(cachePath)) {
      const cached = JSON.parse(readFileSync(cachePath, 'utf8'));
      return cached.packages || [];
    }
    throw new Error(`Cannot fetch registry and no local cache available: ${err.message}`);
  }
}

/**
 * Packages a rule module into a publishable format.
 * Writes to .niyam/published/ locally.
 */
export function publishRule(rulePath, metadata) {
  const rulesPath = join(rulePath, 'rules.md');
  const metaPath = join(rulePath, 'meta.json');

  if (!existsSync(rulesPath)) {
    throw new Error(`Missing rules.md in ${rulePath}`);
  }
  if (!existsSync(metaPath)) {
    throw new Error(`Missing meta.json in ${rulePath}`);
  }

  const rulesContent = readFileSync(rulesPath, 'utf8');
  const meta = JSON.parse(readFileSync(metaPath, 'utf8'));

  const pack = {
    id: metadata?.id || meta.id || meta.name,
    version: metadata?.version || meta.version || '1.0.0',
    category: metadata?.category || meta.category || 'stacks',
    author: metadata?.author || meta.author || 'unknown',
    description: metadata?.description || meta.description || '',
    publishedAt: new Date().toISOString(),
    integrity: `sha256-${sha256(rulesContent)}`,
    rules: rulesContent,
    meta,
  };

  // Write to .niyam/published/
  const publishDir = join(rulePath, '..', '..', '.niyam', 'published');
  if (!existsSync(publishDir)) mkdirSync(publishDir, { recursive: true });

  const outputPath = join(publishDir, `${pack.id}-${pack.version}.niyam-pack.json`);
  writeFileSync(outputPath, JSON.stringify(pack, null, 2), 'utf8');

  return { outputPath, pack };
}

/**
 * Compares local rule versions against the registry.
 * Returns array of {id, currentVersion, latestVersion, changelog}.
 */
export async function checkUpdates(config, projectDir = process.cwd()) {
  const packages = await fetchRegistry(projectDir);
  const versions = config.versions || {};
  const updates = [];

  // Collect all configured rule IDs
  const configuredRules = [
    ...(config.stacks || []),
    ...(config.roles || []),
    ...(config.principles || []),
    ...(config.workflows || []),
  ];

  for (const id of configuredRules) {
    const registryEntry = packages.find(p => p.id === id);
    if (!registryEntry) continue;

    const currentVersion = versions[id] || '0.0.0';
    const latestVersion = registryEntry.version;

    if (compareVersions(latestVersion, currentVersion) > 0) {
      updates.push({
        id,
        currentVersion,
        latestVersion,
        changelog: registryEntry.changelog || `Updated to ${latestVersion}`,
      });
    }
  }

  return updates;
}

/**
 * Downloads updated rule files from registry and replaces local copies.
 * Updates version pins in config.
 */
export async function updateRules(niyamRoot, updates, projectDir = process.cwd()) {
  const packages = await fetchRegistry(projectDir);
  const configPath = join(projectDir, '.niyam', 'config.json');

  if (!existsSync(configPath)) {
    throw new Error('No .niyam/config.json found');
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  if (!config.versions) config.versions = {};

  for (const update of updates) {
    const registryEntry = packages.find(p => p.id === update.id);
    if (!registryEntry || !registryEntry.url) continue;

    // Download the rule content
    const content = await httpGet(registryEntry.url);

    // Determine category and write path
    const category = registryEntry.category || findRuleCategory(update.id, config);
    const ruleDir = join(niyamRoot, category, update.id);

    if (!existsSync(ruleDir)) mkdirSync(ruleDir, { recursive: true });

    writeFileSync(join(ruleDir, 'rules.md'), content, 'utf8');

    // Update version pin
    config.versions[update.id] = update.latestVersion;
  }

  // Save updated config
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');

  return config;
}

/**
 * Creates a .niyam/lock.json with exact versions of all subscribed rules.
 */
export async function pinVersions(config, projectDir = process.cwd(), niyamRoot) {
  const packages = await fetchRegistry(projectDir);

  const configuredRules = [
    ...(config.stacks || []),
    ...(config.roles || []),
    ...(config.principles || []),
    ...(config.workflows || []),
  ];

  const rules = {};

  for (const id of configuredRules) {
    const registryEntry = packages.find(p => p.id === id);
    const version = config.versions?.[id] || registryEntry?.version || '0.0.0';

    // Compute integrity from local file if available
    let integrity = '';
    if (niyamRoot) {
      const category = registryEntry?.category || findRuleCategory(id, config);
      const rulesPath = join(niyamRoot, category, id, 'rules.md');
      if (existsSync(rulesPath)) {
        const content = readFileSync(rulesPath, 'utf8');
        integrity = `sha256-${sha256(content)}`;
      }
    }

    rules[id] = { version, integrity };
  }

  const lockFile = {
    lockVersion: 1,
    lockedAt: new Date().toISOString(),
    rules,
  };

  const lockPath = join(projectDir, '.niyam', 'lock.json');
  const lockDir = join(projectDir, '.niyam');
  if (!existsSync(lockDir)) mkdirSync(lockDir, { recursive: true });
  writeFileSync(lockPath, JSON.stringify(lockFile, null, 2), 'utf8');

  return { lockPath, lockFile };
}

function findRuleCategory(id, config) {
  for (const cat of ['stacks', 'roles', 'principles', 'workflows']) {
    if (config[cat]?.includes(id)) return cat;
  }
  return 'stacks';
}

function compareVersions(a, b) {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
}
