import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const TOOL_OUTPUTS = {
  'kiro': { file: 'AGENTS.md', format: 'markdown' },
  'claude-code': { file: 'CLAUDE.md', format: 'markdown' },
  'cursor': { file: '.cursorrules', format: 'markdown' },
  'copilot': { file: 'AGENTS.md', format: 'markdown' },
  'windsurf': { file: '.windsurfrules', format: 'markdown' },
  'codex': { file: 'AGENTS.md', format: 'markdown' },
  'aider': { file: '.aider.md', format: 'markdown' },
  'gemini': { file: 'GEMINI.md', format: 'markdown' },
};

export const SUPPORTED_TOOLS = Object.keys(TOOL_OUTPUTS);

export function generate(composedRules, tool, projectDir) {
  const output = TOOL_OUTPUTS[tool];
  if (!output) throw new Error(`Unsupported tool: ${tool}`);

  const outputPath = join(projectDir, output.file);
  writeFileSync(outputPath, composedRules, 'utf8');
  return outputPath;
}

export function generateAll(composedRules, tools, projectDir) {
  const outputs = [];
  for (const tool of tools) {
    const path = generate(composedRules, tool, projectDir);
    outputs.push({ tool, path });
  }
  return outputs;
}

export function saveConfig(config, projectDir) {
  const niyamDir = join(projectDir, '.niyam');
  if (!existsSync(niyamDir)) mkdirSync(niyamDir, { recursive: true });
  const configPath = join(niyamDir, 'config.json');
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  return configPath;
}

export function loadConfig(projectDir) {
  const configPath = join(projectDir, '.niyam', 'config.json');
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    return null;
  }
}
