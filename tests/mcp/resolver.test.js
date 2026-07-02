import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveRules, getChecklist } from '../../mcp/src/resolver.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const niyamRoot = path.resolve(__dirname, '../../');

describe('resolveRules', () => {
  test('.tsx includes react and typescript', () => {
    const rules = resolveRules('src/components/Button.tsx', niyamRoot);
    assert.ok(rules.includes('react'), `Expected react in [${rules}]`);
    assert.ok(rules.includes('typescript'), `Expected typescript in [${rules}]`);
  });

  test('.py includes python', () => {
    const rules = resolveRules('app/main.py', niyamRoot);
    assert.ok(rules.includes('python'), `Expected python in [${rules}]`);
  });

  test('components/ adds frontend', () => {
    const rules = resolveRules('src/components/Header.tsx', niyamRoot);
    assert.ok(rules.includes('frontend'), `Expected frontend in [${rules}]`);
  });

  test('api/ adds backend and security-first', () => {
    const rules = resolveRules('src/api/users.ts', niyamRoot);
    assert.ok(rules.includes('backend'), `Expected backend in [${rules}]`);
    assert.ok(rules.includes('security-first'), `Expected security-first in [${rules}]`);
  });

  test('Dockerfile adds docker and devops', () => {
    const rules = resolveRules('docker/Dockerfile', niyamRoot);
    assert.ok(rules.includes('docker'), `Expected docker in [${rules}]`);
    assert.ok(rules.includes('devops'), `Expected devops in [${rules}]`);
  });

  test('clean-code always present for source files', () => {
    const tsRules = resolveRules('src/utils.ts', niyamRoot);
    assert.ok(tsRules.includes('clean-code'), `Expected clean-code for .ts in [${tsRules}]`);

    const pyRules = resolveRules('app/service.py', niyamRoot);
    assert.ok(pyRules.includes('clean-code'), `Expected clean-code for .py in [${pyRules}]`);

    const jsRules = resolveRules('lib/helpers.js', niyamRoot);
    assert.ok(jsRules.includes('clean-code'), `Expected clean-code for .js in [${jsRules}]`);
  });
});

describe('getChecklist', () => {
  test('returns universal checks for any rules', () => {
    const checks = getChecklist(['clean-code'], niyamRoot);
    assert.ok(checks.some(c => c.includes('Names reveal intent')));
    assert.ok(checks.some(c => c.includes('Functions are small')));
  });

  test('adds security checks for security-first', () => {
    const checks = getChecklist(['security-first'], niyamRoot);
    assert.ok(checks.some(c => c.includes('Input validated')));
    assert.ok(checks.some(c => c.includes('No secrets hardcoded')));
  });

  test('adds docker checks for docker rules', () => {
    const checks = getChecklist(['docker', 'devops'], niyamRoot);
    assert.ok(checks.some(c => c.includes('Multi-stage build')));
    assert.ok(checks.some(c => c.includes('No secrets in image')));
  });
});
