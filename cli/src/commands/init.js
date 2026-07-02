import { readdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { scanProject } from '../scanner.js';
import { composeRules } from '../composer.js';
import { generate, saveConfig, SUPPORTED_TOOLS } from '../generator.js';
import { banner, heading, success, info, warn, ask, confirm, select, multiSelect, colors as c } from '../prompts.js';

export async function initCommand(projectDir, niyamRoot, options = {}) {
  banner();

  // Template mode
  if (options.template) {
    return initFromTemplate(projectDir, niyamRoot, options.template);
  }

  // Step 1: Scan
  heading('Scanning project...');
  const detected = scanProject(projectDir);

  if (detected.length > 0) {
    success(`Detected stacks: ${c.cyan}${detected.join(', ')}${c.reset}`);
  } else {
    info('No stacks auto-detected. You can pick manually.');
  }

  // Step 2: Pick stacks
  const allStacks = listDir(join(niyamRoot, 'stacks'));
  const stacks = await multiSelect(
    'Select tech stacks:',
    allStacks.map(s => detected.includes(s) ? `${s} (detected)` : s)
  );
  const selectedStacks = stacks.map(s => s.replace(' (detected)', ''));

  // Step 3: Pick roles
  const allRoles = listDir(join(niyamRoot, 'roles'));
  const selectedRoles = await multiSelect('Select roles:', allRoles);

  // Step 4: Pick principles
  const allPrinciples = listDir(join(niyamRoot, 'principles'));
  const selectedPrinciples = await multiSelect('Select principles:', allPrinciples);

  // Step 5: Pick workflows
  const allWorkflows = listDir(join(niyamRoot, 'workflows'));
  const selectedWorkflows = await multiSelect('Select workflows:', allWorkflows);

  // Step 6: Pick tool
  const tool = await select('Generate rules for which tool?', SUPPORTED_TOOLS);

  // Step 7: Compose
  heading('Composing rules...');
  const config = {
    stacks: selectedStacks,
    roles: selectedRoles,
    principles: selectedPrinciples,
    workflows: selectedWorkflows,
    tool,
    generatedAt: new Date().toISOString(),
  };

  const composed = composeRules(config, niyamRoot);
  const outputPath = generate(composed, tool, projectDir);
  const configPath = saveConfig(config, projectDir);

  // Done
  console.log('');
  success(`Config saved: ${c.dim}${configPath}${c.reset}`);
  success(`Rules generated: ${c.cyan}${outputPath}${c.reset}`);
  console.log(`\n${c.dim}  Regenerate anytime: ${c.white}npx niyam generate${c.reset}`);
  console.log(`${c.dim}  Add more rules:     ${c.white}npx niyam add <rule>${c.reset}`);
  console.log('');
}

async function initFromTemplate(projectDir, niyamRoot, templateName) {
  const templatePath = join(niyamRoot, 'templates', templateName, 'config.json');
  if (!existsSync(templatePath)) {
    warn(`Template "${templateName}" not found.`);
    const available = listDir(join(niyamRoot, 'templates'));
    info(`Available templates: ${available.join(', ')}`);
    return;
  }

  const template = JSON.parse(readFileSync(templatePath, 'utf8'));
  info(`Using template: ${c.bold}${template.name}${c.reset}`);
  info(template.description);

  const tool = await select('Generate rules for which tool?', SUPPORTED_TOOLS);

  const config = {
    stacks: template.stacks || [],
    roles: template.roles || [],
    principles: template.principles || [],
    workflows: template.workflows || [],
    tool,
    template: templateName,
    generatedAt: new Date().toISOString(),
  };

  const composed = composeRules(config, niyamRoot);
  const outputPath = generate(composed, tool, projectDir);
  const configPath = saveConfig(config, projectDir);

  success(`Config saved: ${c.dim}${configPath}${c.reset}`);
  success(`Rules generated: ${c.cyan}${outputPath}${c.reset}`);
}

function listDir(dir) {
  if (!existsSync(dir)) return [];
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .map(e => e.name)
      .sort();
  } catch { return []; }
}
