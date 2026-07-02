import { createInterface } from 'node:readline';

const rl = () => createInterface({ input: process.stdin, output: process.stdout });

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

export const colors = c;

export function ask(question) {
  return new Promise((resolve) => {
    const r = rl();
    r.question(`${c.cyan}? ${c.white}${question} ${c.gray}› ${c.reset}`, (answer) => {
      r.close();
      resolve(answer.trim());
    });
  });
}

export function confirm(question, defaultYes = true) {
  return new Promise((resolve) => {
    const hint = defaultYes ? 'Y/n' : 'y/N';
    const r = rl();
    r.question(`${c.cyan}? ${c.white}${question} ${c.dim}(${hint}) ${c.reset}`, (answer) => {
      r.close();
      const a = answer.trim().toLowerCase();
      if (a === '') resolve(defaultYes);
      else resolve(a === 'y' || a === 'yes');
    });
  });
}

export async function select(question, options) {
  console.log(`\n${c.cyan}? ${c.white}${question}${c.reset}`);
  options.forEach((opt, i) => {
    console.log(`  ${c.dim}${i + 1}.${c.reset} ${opt}`);
  });
  const answer = await ask('Pick a number');
  const idx = parseInt(answer, 10) - 1;
  if (idx >= 0 && idx < options.length) return options[idx];
  return options[0];
}

export async function multiSelect(question, options) {
  console.log(`\n${c.cyan}? ${c.white}${question} ${c.dim}(comma-separated numbers, or 'all')${c.reset}`);
  options.forEach((opt, i) => {
    console.log(`  ${c.dim}${i + 1}.${c.reset} ${opt}`);
  });
  const answer = await ask('Pick numbers');
  if (answer.toLowerCase() === 'all') return [...options];
  const indices = answer.split(',').map(s => parseInt(s.trim(), 10) - 1);
  return indices.filter(i => i >= 0 && i < options.length).map(i => options[i]);
}

export function banner() {
  console.log(`
${c.white}${c.bold}  ┌─────────────────────────────────────┐
  │         ${c.cyan}नियम${c.white} · ${c.bold}Niyam${c.reset}${c.white}${c.bold}               │
  │   ${c.dim}Modular AI rules that compose.${c.reset}${c.white}${c.bold}     │
  └─────────────────────────────────────┘${c.reset}
`);
}

export function success(msg) {
  console.log(`${c.green}✓${c.reset} ${msg}`);
}

export function warn(msg) {
  console.log(`${c.yellow}⚠${c.reset} ${msg}`);
}

export function error(msg) {
  console.log(`${c.red}✗${c.reset} ${msg}`);
}

export function info(msg) {
  console.log(`${c.cyan}ℹ${c.reset} ${msg}`);
}

export function heading(msg) {
  console.log(`\n${c.bold}${c.white}${msg}${c.reset}`);
}
