import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, basename } from 'node:path';
import { publishRule } from '../registry.js';
import { success, warn, error, info, colors as c } from '../prompts.js';

export async function run(args) {
  const rulePath = args[1] ? resolve(args[1]) : process.cwd();
  const rulesFile = join(rulePath, 'rules.md');
  const metaFile = join(rulePath, 'meta.json');

  console.log(`\n${c.cyan}  ▸ Publishing rule from:${c.reset} ${rulePath}\n`);

  // Validate required files exist
  if (!existsSync(rulesFile)) {
    error(`Missing ${c.bold}rules.md${c.reset} in ${rulePath}`);
    console.log(`  ${c.dim}A rule module must contain a rules.md file.${c.reset}\n`);
    process.exit(1);
  }

  if (!existsSync(metaFile)) {
    error(`Missing ${c.bold}meta.json${c.reset} in ${rulePath}`);
    console.log(`  ${c.dim}A rule module must contain a meta.json file with id, version, category, description.${c.reset}\n`);
    process.exit(1);
  }

  // Read and validate meta.json
  let meta;
  try {
    meta = JSON.parse(readFileSync(metaFile, 'utf8'));
  } catch (err) {
    error(`Invalid JSON in meta.json: ${err.message}`);
    process.exit(1);
  }

  if (!meta.id && !meta.name) {
    error('meta.json must have an "id" or "name" field.');
    process.exit(1);
  }

  if (!meta.version) {
    meta.version = '0.0.0';
  }

  // Bump version
  const oldVersion = meta.version;
  meta.version = bumpPatch(oldVersion);

  // Write bumped version back
  writeFileSync(metaFile, JSON.stringify(meta, null, 2), 'utf8');
  info(`Version bumped: ${c.dim}${oldVersion}${c.reset} → ${c.green}${meta.version}${c.reset}`);

  // Package the rule
  try {
    const { outputPath, pack } = publishRule(rulePath, meta);
    success(`Packaged: ${c.cyan}${basename(outputPath)}${c.reset}`);

    console.log(`
${c.bold}  Package Details:${c.reset}
    ${c.dim}ID:${c.reset}       ${pack.id}
    ${c.dim}Version:${c.reset}  ${pack.version}
    ${c.dim}Category:${c.reset} ${pack.category}
    ${c.dim}Author:${c.reset}   ${pack.author}
    ${c.dim}Integrity:${c.reset} ${pack.integrity}
    ${c.dim}Output:${c.reset}   ${outputPath}

${c.bold}  To submit to the registry:${c.reset}
    ${c.dim}1.${c.reset} Fork ${c.cyan}https://github.com/niyam-rules/registry${c.reset}
    ${c.dim}2.${c.reset} Add your package entry to ${c.cyan}index.json${c.reset}:

       ${c.dim}{
         "id": "${pack.id}",
         "category": "${pack.category}",
         "version": "${pack.version}",
         "author": "${pack.author}",
         "description": "${pack.description}",
         "url": "https://raw.githubusercontent.com/Sidopolis/niyam/main/${pack.category}/${pack.id}/rules.md"
       }${c.reset}

    ${c.dim}3.${c.reset} Open a Pull Request to ${c.cyan}niyam-rules/registry${c.reset}
    ${c.dim}4.${c.reset} Once merged, users can install with: ${c.cyan}niyam add ${pack.id}${c.reset}
`);
  } catch (err) {
    error(`Publish failed: ${err.message}`);
    process.exit(1);
  }
}

function bumpPatch(version) {
  const parts = version.split('.').map(Number);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join('.');
}
