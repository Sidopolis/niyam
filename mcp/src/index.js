#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';

import { resolveRules, loadRuleContent, getChecklist } from './resolver.js';
import { ProjectMemory } from './memory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const NIYAM_ROOT = resolve(__dirname, '..', '..');

// Detect project directory from CWD or env
const PROJECT_DIR = process.env.NIYAM_PROJECT_DIR || process.cwd();

// Load project config if it exists
function loadProjectConfig() {
  const configPath = resolve(PROJECT_DIR, '.niyam', 'config.json');
  if (!existsSync(configPath)) return null;
  try {
    return JSON.parse(readFileSync(configPath, 'utf8'));
  } catch {
    return null;
  }
}

const projectConfig = loadProjectConfig();
const memory = new ProjectMemory(PROJECT_DIR);

// Create the MCP server
const server = new McpServer({
  name: 'niyam',
  version: '0.1.0',
});

// Tool 1: get_rules — the core tool
// Returns context-aware rules based on the file being edited
server.tool(
  'get_rules',
  'Get relevant coding rules for the file you are currently editing. Returns only the rules that apply to this specific file based on its extension, directory, and project config.',
  {
    file_path: z.string().describe('The file path being edited (relative or absolute)'),
  },
  async ({ file_path }) => {
    const ruleIds = resolveRules(file_path, NIYAM_ROOT, projectConfig);
    const content = loadRuleContent(ruleIds, NIYAM_ROOT);
    
    // Append project learnings
    const learnings = memory.getFormatted(file_path);
    const full = learnings ? `${content}\n\n---\n\n${learnings}` : content;

    return {
      content: [
        {
          type: 'text',
          text: full || 'No specific rules matched for this file.',
        },
      ],
    };
  }
);

// Tool 2: get_checklist — verification checklist for current context
server.tool(
  'get_checklist',
  'Get a verification checklist appropriate for the file being edited. Use this before finishing any change to ensure nothing is missed.',
  {
    file_path: z.string().describe('The file path being edited'),
  },
  async ({ file_path }) => {
    const ruleIds = resolveRules(file_path, NIYAM_ROOT, projectConfig);
    const checks = getChecklist(ruleIds, NIYAM_ROOT);

    return {
      content: [
        {
          type: 'text',
          text: `## Pre-commit Checklist\n\n${checks.join('\n')}`,
        },
      ],
    };
  }
);

// Tool 3: add_learning — persists project-specific corrections
server.tool(
  'add_learning',
  'Record a project-specific learning/correction. Use this when the user corrects your approach — it will be remembered for future sessions.',
  {
    rule: z.string().describe('The concrete rule to remember (e.g., "Always use pnpm, not npm")'),
    scope: z.string().optional().describe('Scope: "global" (default), or a file/directory pattern (e.g., "components/", ".test.ts")'),
  },
  async ({ rule, scope }) => {
    const entry = memory.add({ rule, scope: scope || 'global' });
    return {
      content: [
        {
          type: 'text',
          text: `✓ Learning saved: "${rule}" (scope: ${entry.scope})`,
        },
      ],
    };
  }
);

// Tool 4: get_learnings — retrieve all project learnings
server.tool(
  'get_learnings',
  'Retrieve all stored project learnings. Shows what corrections have been recorded for this project.',
  {},
  async () => {
    const all = memory.getAll();
    if (all.length === 0) {
      return {
        content: [{ type: 'text', text: 'No learnings recorded yet.' }],
      };
    }

    const formatted = all.map(l => 
      `- [${l.id}] ${l.rule} (scope: ${l.scope}, added: ${l.createdAt.split('T')[0]})`
    ).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `## Project Learnings (${all.length})\n\n${formatted}`,
        },
      ],
    };
  }
);

// Tool 5: remove_learning — remove an outdated learning
server.tool(
  'remove_learning',
  'Remove an outdated learning by its ID.',
  {
    id: z.string().describe('The learning ID to remove'),
  },
  async ({ id }) => {
    const removed = memory.remove(id);
    return {
      content: [
        {
          type: 'text',
          text: removed ? `✓ Learning ${id} removed.` : `✗ Learning ${id} not found.`,
        },
      ],
    };
  }
);

// Tool 6: get_context — full context dump for current file (rules + learnings + checklist)
server.tool(
  'get_context',
  'Get the full context bundle for a file: relevant rules, project learnings, and verification checklist. Use at the start of a task.',
  {
    file_path: z.string().describe('The file path being worked on'),
  },
  async ({ file_path }) => {
    const ruleIds = resolveRules(file_path, NIYAM_ROOT, projectConfig);
    const rules = loadRuleContent(ruleIds, NIYAM_ROOT);
    const learnings = memory.getFormatted(file_path);
    const checks = getChecklist(ruleIds, NIYAM_ROOT);

    const sections = [];
    sections.push(`## Active Rules for: ${file_path}\nMatched: ${ruleIds.join(', ')}\n`);
    if (rules) sections.push(rules);
    if (learnings) sections.push(learnings);
    sections.push(`## Verification Checklist\n\n${checks.join('\n')}`);

    return {
      content: [{ type: 'text', text: sections.join('\n\n---\n\n') }],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Niyam MCP server error:', err);
  process.exit(1);
});
