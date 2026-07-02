import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const DETECTORS = [
  {
    stack: 'react',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'react') || hasDep(pkg, 'react-dom');
    },
  },
  {
    stack: 'nextjs',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'next') || exists(dir, 'next.config.js') || exists(dir, 'next.config.ts') || exists(dir, 'next.config.mjs');
    },
  },
  {
    stack: 'vue',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'vue') || exists(dir, 'nuxt.config.ts') || exists(dir, 'nuxt.config.js');
    },
  },
  {
    stack: 'svelte',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'svelte') || exists(dir, 'svelte.config.js') || exists(dir, 'svelte.config.ts');
    },
  },
  {
    stack: 'angular',
    detect: (dir) => exists(dir, 'angular.json') || exists(dir, 'angular.config.json'),
  },
  {
    stack: 'typescript',
    detect: (dir) => exists(dir, 'tsconfig.json'),
  },
  {
    stack: 'tailwind',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'tailwindcss') || exists(dir, 'tailwind.config.js') || exists(dir, 'tailwind.config.ts');
    },
  },
  {
    stack: 'node',
    detect: (dir) => exists(dir, 'package.json') && !exists(dir, 'next.config.js'),
  },
  {
    stack: 'python',
    detect: (dir) => exists(dir, 'pyproject.toml') || exists(dir, 'requirements.txt') || exists(dir, 'setup.py') || exists(dir, 'Pipfile'),
  },
  {
    stack: 'django',
    detect: (dir) => {
      if (!exists(dir, 'manage.py')) return false;
      const req = readFile(dir, 'requirements.txt') || readFile(dir, 'pyproject.toml') || '';
      return req.includes('django') || req.includes('Django');
    },
  },
  {
    stack: 'fastapi',
    detect: (dir) => {
      const req = readFile(dir, 'requirements.txt') || readFile(dir, 'pyproject.toml') || '';
      return req.includes('fastapi');
    },
  },
  {
    stack: 'go',
    detect: (dir) => exists(dir, 'go.mod'),
  },
  {
    stack: 'rust',
    detect: (dir) => exists(dir, 'Cargo.toml'),
  },
  {
    stack: 'flutter',
    detect: (dir) => exists(dir, 'pubspec.yaml'),
  },
  {
    stack: 'laravel',
    detect: (dir) => exists(dir, 'artisan') || exists(dir, 'composer.json'),
  },
  {
    stack: 'remix',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, '@remix-run/node') || hasDep(pkg, '@remix-run/react');
    },
  },
  {
    stack: 'prisma',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'prisma') || hasDep(pkg, '@prisma/client') || exists(dir, 'prisma/schema.prisma');
    },
  },
  {
    stack: 'supabase',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, '@supabase/supabase-js') || exists(dir, 'supabase/config.toml');
    },
  },
  {
    stack: 'docker',
    detect: (dir) => exists(dir, 'Dockerfile') || exists(dir, 'docker-compose.yml') || exists(dir, 'docker-compose.yaml'),
  },
  {
    stack: 'aws',
    detect: (dir) => exists(dir, 'cdk.json') || exists(dir, 'serverless.yml') || exists(dir, 'template.yaml') || exists(dir, 'samconfig.toml'),
  },
  {
    stack: 'shadcn',
    detect: (dir) => exists(dir, 'components.json'),
  },
  {
    stack: 'drizzle',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'drizzle-orm') || exists(dir, 'drizzle.config.ts');
    },
  },
  {
    stack: 'astro',
    detect: (dir) => {
      const pkg = readPkg(dir);
      return hasDep(pkg, 'astro') || exists(dir, 'astro.config.mjs') || exists(dir, 'astro.config.ts');
    },
  },
];

export function scanProject(dir) {
  const detected = [];
  for (const { stack, detect } of DETECTORS) {
    try {
      if (detect(dir)) detected.push(stack);
    } catch {
      // skip detection errors
    }
  }
  return detected;
}

function exists(dir, file) {
  return existsSync(join(dir, file));
}

function readFile(dir, file) {
  const p = join(dir, file);
  if (!existsSync(p)) return null;
  try { return readFileSync(p, 'utf8'); } catch { return null; }
}

function readPkg(dir) {
  const content = readFile(dir, 'package.json');
  if (!content) return {};
  try { return JSON.parse(content); } catch { return {}; }
}

function hasDep(pkg, name) {
  return !!(
    (pkg.dependencies && pkg.dependencies[name]) ||
    (pkg.devDependencies && pkg.devDependencies[name])
  );
}
