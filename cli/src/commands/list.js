import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { heading, colors as c } from '../prompts.js';

export async function listCommand(niyamRoot) {
  const categories = ['stacks', 'roles', 'principles', 'workflows', 'templates'];

  for (const category of categories) {
    const dir = join(niyamRoot, category);
    if (!existsSync(dir)) continue;

    heading(`${category.toUpperCase()}`);
    const entries = readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory())
      .sort((a, b) => a.name.localeCompare(b.name));

    for (const entry of entries) {
      const metaPath = join(dir, entry.name, 'meta.json');
      let desc = '';
      if (existsSync(metaPath)) {
        try {
          const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
          desc = meta.description || '';
        } catch { /* skip */ }
      }
      console.log(`  ${c.cyan}${entry.name.padEnd(20)}${c.reset} ${c.dim}${desc}${c.reset}`);
    }
  }
  console.log('');
}

export async function searchCommand(query, niyamRoot) {
  const q = query.toLowerCase();
  const results = [];
  const categories = ['stacks', 'roles', 'principles', 'workflows'];

  for (const category of categories) {
    const dir = join(niyamRoot, category);
    if (!existsSync(dir)) continue;

    const entries = readdirSync(dir, { withFileTypes: true })
      .filter(e => e.isDirectory());

    for (const entry of entries) {
      const metaPath = join(dir, entry.name, 'meta.json');
      const rulesPath = join(dir, entry.name, 'rules.md');
      let match = entry.name.includes(q);

      if (!match && existsSync(metaPath)) {
        try {
          const meta = JSON.parse(readFileSync(metaPath, 'utf8'));
          match = (meta.description || '').toLowerCase().includes(q) ||
                  (meta.tags || []).some(t => t.includes(q));
        } catch { /* skip */ }
      }

      if (!match && existsSync(rulesPath)) {
        try {
          const content = readFileSync(rulesPath, 'utf8').toLowerCase();
          match = content.includes(q);
        } catch { /* skip */ }
      }

      if (match) results.push({ category, name: entry.name });
    }
  }

  if (results.length === 0) {
    console.log(`${c.dim}No results for "${query}"${c.reset}`);
    return;
  }

  heading(`Results for "${query}" (${results.length} found)`);
  for (const r of results) {
    console.log(`  ${c.dim}${r.category}/${c.reset}${c.cyan}${r.name}${c.reset}`);
  }
  console.log('');
}
