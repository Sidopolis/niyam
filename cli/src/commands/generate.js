import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { composeRules } from '../composer.js';
import { generate, SUPPORTED_TOOLS } from '../generator.js';
import { success, warn, info, select, colors as c } from '../prompts.js';

export async function generateCommand(projectDir, niyamRoot, options = {}) {
  const configPath = join(projectDir, '.niyam', 'config.json');
  if (!existsSync(configPath)) {
    warn('No .niyam/config.json found. Run `niyam init` first.');
    return;
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const tool = options.tool || config.tool || 'kiro';

  if (!SUPPORTED_TOOLS.includes(tool)) {
    warn(`Unknown tool "${tool}". Supported: ${SUPPORTED_TOOLS.join(', ')}`);
    return;
  }

  const composed = composeRules(config, niyamRoot);
  const outputPath = generate(composed, tool, projectDir);
  success(`Rules regenerated: ${c.cyan}${outputPath}${c.reset}`);
}

export async function previewCommand(projectDir, niyamRoot) {
  const configPath = join(projectDir, '.niyam', 'config.json');
  if (!existsSync(configPath)) {
    warn('No .niyam/config.json found. Run `niyam init` first.');
    return;
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  const composed = composeRules(config, niyamRoot);

  console.log(`\n${c.dim}─── Preview ───────────────────────────────────────${c.reset}\n`);
  console.log(composed);
  console.log(`\n${c.dim}─── End Preview ───────────────────────────────────${c.reset}\n`);

  const lines = composed.split('\n').length;
  info(`${lines} lines total. Run ${c.white}niyam generate${c.reset} to write to file.`);
}
