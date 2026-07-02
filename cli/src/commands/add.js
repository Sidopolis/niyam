import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { composeRules } from '../composer.js';
import { generate, saveConfig } from '../generator.js';
import { success, warn, info, colors as c } from '../prompts.js';

export async function addCommand(rules, projectDir, niyamRoot) {
  const configPath = join(projectDir, '.niyam', 'config.json');
  if (!existsSync(configPath)) {
    warn('No .niyam/config.json found. Run `niyam init` first.');
    return;
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  let added = 0;

  for (const rule of rules) {
    const category = findCategory(rule, niyamRoot);
    if (category) {
      if (!config[category]) config[category] = [];
      if (!config[category].includes(rule)) {
        config[category].push(rule);
        success(`Added ${c.cyan}${rule}${c.reset} (${category})`);
        added++;
      } else {
        info(`${rule} already in config.`);
      }
    } else {
      warn(`Rule "${rule}" not found in any category.`);
    }
  }

  if (added > 0) {
    saveConfig(config, projectDir);
    const composed = composeRules(config, niyamRoot);
    generate(composed, config.tool || 'kiro', projectDir);
    success('Config updated and rules regenerated.');
  }
}

export async function removeCommand(rules, projectDir, niyamRoot) {
  const configPath = join(projectDir, '.niyam', 'config.json');
  if (!existsSync(configPath)) {
    warn('No .niyam/config.json found.');
    return;
  }

  const config = JSON.parse(readFileSync(configPath, 'utf8'));
  for (const rule of rules) {
    for (const cat of ['stacks', 'roles', 'principles', 'workflows']) {
      if (config[cat]?.includes(rule)) {
        config[cat] = config[cat].filter(r => r !== rule);
        success(`Removed ${c.cyan}${rule}${c.reset}`);
      }
    }
  }

  saveConfig(config, projectDir);
  const composed = composeRules(config, niyamRoot);
  generate(composed, config.tool || 'kiro', projectDir);
  success('Rules regenerated.');
}

function findCategory(rule, niyamRoot) {
  for (const cat of ['stacks', 'roles', 'principles', 'workflows']) {
    if (existsSync(join(niyamRoot, cat, rule))) return cat;
  }
  return null;
}
