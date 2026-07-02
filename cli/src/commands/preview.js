import { loadConfig, generatePreview } from '../generator.js';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
};

export async function run(args) {
  const projectDir = process.cwd();

  const config = loadConfig(projectDir);
  if (!config) {
    console.log(`\n${colors.red}  ✖ Error:${colors.reset} No .niyam/config.json found.`);
    console.log(`  Run ${colors.cyan}niyam init${colors.reset} first.\n`);
    process.exit(1);
  }

  console.log(`\n${colors.cyan}${colors.bold}  ╭─────────────────────────────────────╮
  │          Preview Output              │
  ╰─────────────────────────────────────╯${colors.reset}\n`);

  console.log(`  ${colors.dim}Tool: ${config.tool}${colors.reset}`);
  console.log(`  ${colors.dim}${'─'.repeat(50)}${colors.reset}\n`);

  const preview = generatePreview(config);
  console.log(preview);

  const sizeKb = (Buffer.byteLength(preview, 'utf-8') / 1024).toFixed(1);
  console.log(`\n  ${colors.dim}${'─'.repeat(50)}${colors.reset}`);
  console.log(`  ${colors.dim}Size: ${sizeKb} KB | This is a preview — no files were written.${colors.reset}`);
  console.log(`  ${colors.dim}Run ${colors.cyan}niyam generate${colors.dim} to write the output file.${colors.reset}\n`);
}
