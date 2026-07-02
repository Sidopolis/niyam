import { readFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkUpdates, updateRules, pinVersions } from '../registry.js';
import { composeRules } from '../composer.js';
import { generate } from '../generator.js';
import { success, warn, error, info, confirm, colors as c } from '../prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NIYAM_ROOT = resolve(__dirname, '..', '..', '..');

export async function run(args) {
  const projectDir = process.cwd();
  const configPath = join(projectDir, '.niyam', 'config.json');

  if (!existsSync(configPath)) {
    error(`No .niyam/config.json found.`);
    console.log(`  Run ${c.cyan}niyam init${c.reset} first.\n`);
    process.exit(1);
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));

  console.log(`\n${c.cyan}  ▸ Checking for updates...${c.reset}\n`);

  let updates;
  try {
    updates = await checkUpdates(config, projectDir);
  } catch (err) {
    error(`Failed to check updates: ${err.message}`);
    console.log(`  ${c.dim}Check your internet connection or run ${c.cyan}niyam generate${c.reset}${c.dim} to regenerate from local rules.${c.reset}\n`);
    process.exit(1);
  }

  if (updates.length === 0) {
    success('All rules are up to date.');
    console.log('');
    return;
  }

  // Show available updates
  console.log(`  ${c.bold}${updates.length} update${updates.length > 1 ? 's' : ''} available:${c.reset}\n`);

  for (const u of updates) {
    console.log(`    ${c.cyan}${u.id}${c.reset}  ${c.dim}${u.currentVersion}${c.reset} → ${c.green}${u.latestVersion}${c.reset}`);
    if (u.changelog) {
      console.log(`      ${c.dim}${u.changelog}${c.reset}`);
    }
  }
  console.log('');

  // Ask for confirmation
  const proceed = await confirm('Apply updates?');
  if (!proceed) {
    info('Update cancelled.');
    return;
  }

  // Run updates
  console.log(`\n  ${c.cyan}▸ Downloading updates...${c.reset}`);

  try {
    const updatedConfig = await updateRules(NIYAM_ROOT, updates, projectDir);

    // Pin versions
    await pinVersions(updatedConfig, projectDir, NIYAM_ROOT);
    info('Lock file updated.');

    // Regenerate composed output
    console.log(`  ${c.cyan}▸ Regenerating rules...${c.reset}`);
    const freshConfig = JSON.parse(readFileSync(configPath, 'utf8'));
    const composed = composeRules(freshConfig, NIYAM_ROOT);
    const tool = freshConfig.tool || 'kiro';
    const outputPath = generate(composed, tool, projectDir);

    console.log(`
${c.green}  ✔ Updated ${updates.length} rule${updates.length > 1 ? 's' : ''}!${c.reset}

  ${c.bold}Updated:${c.reset}`);

    for (const u of updates) {
      console.log(`    ${c.green}✓${c.reset} ${u.id} → ${c.green}${u.latestVersion}${c.reset}`);
    }

    console.log(`
  ${c.bold}Output:${c.reset}  ${c.cyan}${outputPath}${c.reset}
  ${c.bold}Lock:${c.reset}    ${c.cyan}.niyam/lock.json${c.reset}
`);
  } catch (err) {
    error(`Update failed: ${err.message}`);
    process.exit(1);
  }
}
