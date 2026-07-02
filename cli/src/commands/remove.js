import { loadConfig, saveConfig, generate } from '../generator.js';
import { loadMeta } from '../composer.js';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

const VALID_CATEGORIES = ['stacks', 'roles', 'principles', 'workflows'];

function parseRuleRef(ref) {
  const parts = ref.split('/');
  if (parts.length !== 2) return null;
  const [category, id] = parts;
  if (!VALID_CATEGORIES.includes(category)) return null;
  return { category, id };
}

export async function run(args) {
  const projectDir = process.cwd();

  if (args.length === 0) {
    console.log(`\n${colors.red}  ✖ Error:${colors.reset} No rules specified.`);
    console.log(`\n  ${colors.bold}Usage:${colors.reset} niyam remove <category/rule> [<category/rule> ...]\n`);
    console.log(`  ${colors.bold}Examples:${colors.reset}`);
    console.log(`    ${colors.dim}$ niyam remove stacks/react${colors.reset}`);
    console.log(`    ${colors.dim}$ niyam remove principles/tdd workflows/git${colors.reset}\n`);
    process.exit(1);
  }

  const config = loadConfig(projectDir);
  if (!config) {
    console.log(`\n${colors.red}  ✖ Error:${colors.reset} No .niyam/config.json found.`);
    console.log(`  Run ${colors.cyan}niyam init${colors.reset} first.\n`);
    process.exit(1);
  }

  const removed = [];
  const notFound = [];
  const errors = [];

  for (const ref of args) {
    const parsed = parseRuleRef(ref);
    if (!parsed) {
      errors.push(`"${ref}" — Invalid format. Use category/id (e.g., stacks/react)`);
      continue;
    }

    const { category, id } = parsed;

    if (!config[category] || !config[category].includes(id)) {
      notFound.push(ref);
      continue;
    }

    config[category] = config[category].filter(item => item !== id);
    const meta = loadMeta(category, id);
    removed.push({ ref, name: meta?.name || id });
  }

  if (errors.length > 0) {
    console.log(`\n${colors.red}  ✖ Errors:${colors.reset}`);
    errors.forEach(e => console.log(`    ${colors.red}•${colors.reset} ${e}`));
  }

  if (notFound.length > 0) {
    console.log(`\n${colors.yellow}  ⚠ Not in config:${colors.reset}`);
    notFound.forEach(r => console.log(`    ${colors.yellow}•${colors.reset} ${r}`));
  }

  if (removed.length > 0) {
    saveConfig(projectDir, config);
    const result = generate(config, projectDir);

    console.log(`\n${colors.green}  ✔ Removed ${removed.length} rule${removed.length > 1 ? 's' : ''}:${colors.reset}`);
    removed.forEach(r => console.log(`    ${colors.red}•${colors.reset} ${r.name} ${colors.dim}(${r.ref})${colors.reset}`));
    console.log(`\n  ${colors.dim}Regenerated ${result.filename} (${(result.size / 1024).toFixed(1)} KB)${colors.reset}\n`);
  } else if (errors.length === 0) {
    console.log(`\n  ${colors.dim}No changes made.${colors.reset}\n`);
  }
}
