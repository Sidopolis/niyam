#!/usr/bin/env node

import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NIYAM_ROOT = resolve(__dirname, '..', '..');
const PROJECT_DIR = process.cwd();

const args = process.argv.slice(2);
const command = args[0] || 'help';

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
};

async function main() {
  switch (command) {
    case 'init': {
      const { initCommand } = await import('./commands/init.js');
      const template = getFlag('--template', args) || getFlag('-t', args);
      await initCommand(PROJECT_DIR, NIYAM_ROOT, { template });
      break;
    }
    case 'add': {
      const { addCommand } = await import('./commands/add.js');
      const rules = args.slice(1).filter(a => !a.startsWith('-'));
      if (rules.length === 0) {
        console.log(`${c.yellow}Usage:${c.reset} niyam add <rule1> [rule2] ...`);
        console.log(`${c.dim}Example: niyam add react typescript tdd${c.reset}`);
        break;
      }
      await addCommand(rules, PROJECT_DIR, NIYAM_ROOT);
      break;
    }
    case 'remove': {
      const { removeCommand } = await import('./commands/add.js');
      const rules = args.slice(1).filter(a => !a.startsWith('-'));
      await removeCommand(rules, PROJECT_DIR, NIYAM_ROOT);
      break;
    }
    case 'list': case 'ls': {
      const { listCommand } = await import('./commands/list.js');
      await listCommand(NIYAM_ROOT);
      break;
    }
    case 'search': case 'find': {
      const { searchCommand } = await import('./commands/list.js');
      const query = args.slice(1).join(' ');
      if (!query) {
        console.log(`${c.yellow}Usage:${c.reset} niyam search <query>`);
        break;
      }
      await searchCommand(query, NIYAM_ROOT);
      break;
    }
    case 'generate': case 'gen': {
      const { generateCommand } = await import('./commands/generate.js');
      const tool = getFlag('--tool', args);
      await generateCommand(PROJECT_DIR, NIYAM_ROOT, { tool });
      break;
    }
    case 'preview': {
      const { previewCommand } = await import('./commands/generate.js');
      await previewCommand(PROJECT_DIR, NIYAM_ROOT);
      break;
    }
    case 'publish': {
      const { run: publishRun } = await import('./commands/publish.js');
      await publishRun(args);
      break;
    }
    case 'update': {
      const { run: updateRun } = await import('./commands/update.js');
      await updateRun(args);
      break;
    }
    case 'help': case '--help': case '-h':
    default:
      printHelp();
      break;
  }
}

function printHelp() {
  console.log(`
${c.white}${c.bold}  नियम · Niyam${c.reset} ${c.dim}v0.1.0${c.reset}
${c.dim}  Modular AI agent rules that compose, not bloat.${c.reset}

${c.white}${c.bold}  Usage:${c.reset}
    niyam <command> [options]

${c.white}${c.bold}  Commands:${c.reset}
    ${c.cyan}init${c.reset}                Interactive setup (scan project, pick rules)
    ${c.cyan}init --template${c.reset}     Use a pre-built template
    ${c.cyan}add${c.reset} <rules...>      Add rule modules to project
    ${c.cyan}remove${c.reset} <rules...>   Remove rule modules
    ${c.cyan}list${c.reset}                List all available rules
    ${c.cyan}search${c.reset} <query>      Search rules by keyword
    ${c.cyan}generate${c.reset}            Regenerate output from config
    ${c.cyan}preview${c.reset}             Preview composed rules without writing
    ${c.cyan}publish${c.reset} [path]       Package a rule module for registry submission
    ${c.cyan}update${c.reset}              Check & apply rule updates from registry
    ${c.cyan}help${c.reset}                Show this help message

${c.white}${c.bold}  Options:${c.reset}
    --template, -t      Template name (startup-saas, enterprise, solo-dev, open-source)
    --tool              Target tool (kiro, cursor, claude-code, copilot, windsurf, codex, aider, gemini)

${c.white}${c.bold}  Examples:${c.reset}
    ${c.dim}$${c.reset} npx niyam init
    ${c.dim}$${c.reset} npx niyam init --template startup-saas
    ${c.dim}$${c.reset} npx niyam add react typescript tdd
    ${c.dim}$${c.reset} npx niyam generate --tool cursor
    ${c.dim}$${c.reset} npx niyam search "state management"

${c.dim}  https://niyam.dev${c.reset}
`);
}

function getFlag(flag, args) {
  const idx = args.indexOf(flag);
  if (idx === -1) return null;
  return args[idx + 1] || null;
}

main().catch((err) => {
  console.error(`${c.yellow}Error:${c.reset} ${err.message}`);
  process.exit(1);
});
