import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, extname, basename, dirname } from 'node:path';

// Maps file extensions/patterns to relevant stacks
const EXTENSION_MAP = {
  '.tsx': ['react', 'typescript'],
  '.jsx': ['react'],
  '.ts': ['typescript'],
  '.js': ['node'],
  '.mjs': ['node'],
  '.py': ['python'],
  '.go': ['go'],
  '.rs': ['rust'],
  '.dart': ['flutter'],
  '.vue': ['vue'],
  '.svelte': ['svelte'],
  '.astro': ['astro'],
  '.php': ['laravel'],
  '.css': ['tailwind'],
  '.scss': ['tailwind'],
};

// Maps directory patterns to roles/stacks
const DIRECTORY_MAP = {
  'components': ['react', 'frontend', 'accessibility'],
  'ui': ['frontend', 'ui-ux', 'accessibility'],
  'pages': ['nextjs', 'frontend'],
  'app': ['nextjs', 'frontend'],
  'api': ['backend', 'security-first'],
  'routes': ['backend'],
  'controllers': ['backend'],
  'middleware': ['backend', 'security-first'],
  'auth': ['security-first', 'security'],
  'models': ['backend'],
  'schema': ['backend'],
  'prisma': ['prisma'],
  'migrations': ['backend'],
  'tests': ['testing', 'tdd'],
  'test': ['testing', 'tdd'],
  '__tests__': ['testing', 'tdd'],
  'spec': ['testing', 'tdd'],
  'e2e': ['testing'],
  'cypress': ['testing'],
  'docker': ['docker', 'devops'],
  'infra': ['devops', 'aws'],
  'terraform': ['devops', 'aws'],
  'k8s': ['devops'],
  'kubernetes': ['devops'],
  '.github': ['ci-cd', 'git'],
  'workflows': ['ci-cd'],
  'scripts': ['devops'],
  'deploy': ['deployment', 'devops'],
  'lib': ['clean-code'],
  'utils': ['clean-code'],
  'hooks': ['react', 'frontend'],
  'styles': ['tailwind', 'frontend'],
  'public': ['frontend', 'performance'],
  'assets': ['frontend', 'performance'],
  'docs': ['technical-writer'],
  'supabase': ['supabase'],
};

// Maps filename patterns to relevant rules
const FILENAME_MAP = {
  'Dockerfile': ['docker', 'devops'],
  'docker-compose': ['docker', 'devops'],
  '.env': ['security-first'],
  'package.json': ['node'],
  'tsconfig.json': ['typescript'],
  'tailwind.config': ['tailwind'],
  'next.config': ['nextjs'],
  'svelte.config': ['svelte'],
  'nuxt.config': ['vue'],
  'astro.config': ['astro'],
  'prisma/schema.prisma': ['prisma'],
  'drizzle.config': ['drizzle'],
  'vitest.config': ['testing', 'tdd'],
  'jest.config': ['testing', 'tdd'],
  'playwright.config': ['testing'],
  '.github/workflows': ['ci-cd'],
  'Cargo.toml': ['rust'],
  'go.mod': ['go'],
  'pubspec.yaml': ['flutter'],
  'requirements.txt': ['python'],
  'pyproject.toml': ['python'],
};

export function resolveRules(filePath, niyamRoot, projectConfig = null) {
  const resolved = new Set();
  const ext = extname(filePath);
  const file = basename(filePath);
  const dir = dirname(filePath);
  const dirParts = dir.split(/[/\\]/);

  // 1. Extension-based matching
  if (EXTENSION_MAP[ext]) {
    EXTENSION_MAP[ext].forEach(r => resolved.add(r));
  }

  // 2. Directory-based matching
  for (const part of dirParts) {
    const lower = part.toLowerCase();
    if (DIRECTORY_MAP[lower]) {
      DIRECTORY_MAP[lower].forEach(r => resolved.add(r));
    }
  }

  // 3. Filename-based matching
  for (const [pattern, rules] of Object.entries(FILENAME_MAP)) {
    if (file.includes(pattern) || filePath.includes(pattern)) {
      rules.forEach(r => resolved.add(r));
    }
  }

  // 4. Always include project-configured rules (filtered to relevant)
  if (projectConfig) {
    // Always include selected principles (they're universal)
    projectConfig.principles?.forEach(r => resolved.add(r));
    // Include project workflows if relevant
    if (filePath.includes('.github') || file.includes('ci') || file.includes('deploy')) {
      projectConfig.workflows?.forEach(r => resolved.add(r));
    }
  }

  // 5. Always include clean-code for any source file
  if (['.ts', '.tsx', '.js', '.jsx', '.py', '.go', '.rs', '.dart', '.vue', '.svelte'].includes(ext)) {
    resolved.add('clean-code');
  }

  return [...resolved];
}

export function loadRuleContent(ruleIds, niyamRoot) {
  const content = [];
  const categories = ['stacks', 'roles', 'principles', 'workflows', 'anti-patterns', 'languages'];

  for (const id of ruleIds) {
    for (const category of categories) {
      const rulePath = join(niyamRoot, category, id, 'rules.md');
      if (existsSync(rulePath)) {
        try {
          const text = readFileSync(rulePath, 'utf8');
          content.push(text.trim());
        } catch { /* skip */ }
        break;
      }
    }
  }

  return content.join('\n\n---\n\n');
}

export function getChecklist(ruleIds, niyamRoot) {
  const checks = [];

  // Universal checks
  checks.push('[ ] Names reveal intent');
  checks.push('[ ] Functions are small and focused');
  checks.push('[ ] No duplication');
  checks.push('[ ] Error handling is explicit');

  // Context-specific checks
  if (ruleIds.includes('testing') || ruleIds.includes('tdd')) {
    checks.push('[ ] Tests cover new/changed behavior');
    checks.push('[ ] Tests are deterministic and isolated');
  }
  if (ruleIds.includes('security-first') || ruleIds.includes('security')) {
    checks.push('[ ] Input validated');
    checks.push('[ ] No secrets hardcoded');
    checks.push('[ ] Auth/authz checked');
  }
  if (ruleIds.includes('accessibility')) {
    checks.push('[ ] Semantic HTML used');
    checks.push('[ ] Keyboard navigable');
    checks.push('[ ] ARIA labels where needed');
  }
  if (ruleIds.includes('performance')) {
    checks.push('[ ] No unnecessary re-renders');
    checks.push('[ ] Images optimized');
    checks.push('[ ] Bundle impact considered');
  }
  if (ruleIds.includes('react') || ruleIds.includes('frontend')) {
    checks.push('[ ] Component is accessible');
    checks.push('[ ] Loading/error states handled');
  }
  if (ruleIds.includes('backend')) {
    checks.push('[ ] N+1 queries avoided');
    checks.push('[ ] Rate limiting considered');
    checks.push('[ ] Error responses are informative');
  }
  if (ruleIds.includes('docker') || ruleIds.includes('devops')) {
    checks.push('[ ] Multi-stage build used');
    checks.push('[ ] No secrets in image layers');
  }

  return checks;
}
