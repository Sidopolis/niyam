import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { scanProject } from '../../cli/src/scanner.js';

function makeTempDir() {
  return mkdtempSync(join(tmpdir(), 'niyam-test-'));
}

describe('scanProject', () => {
  test('detects react from package.json', () => {
    const dir = makeTempDir();
    try {
      writeFileSync(join(dir, 'package.json'), JSON.stringify({
        dependencies: { react: '^18.0.0' },
      }));
      const result = scanProject(dir);
      assert.ok(result.includes('react'), `Expected react in [${result}]`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('detects typescript from tsconfig.json', () => {
    const dir = makeTempDir();
    try {
      writeFileSync(join(dir, 'tsconfig.json'), '{}');
      const result = scanProject(dir);
      assert.ok(result.includes('typescript'), `Expected typescript in [${result}]`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('detects go from go.mod', () => {
    const dir = makeTempDir();
    try {
      writeFileSync(join(dir, 'go.mod'), 'module example.com/app\n\ngo 1.21');
      const result = scanProject(dir);
      assert.ok(result.includes('go'), `Expected go in [${result}]`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('detects docker from Dockerfile', () => {
    const dir = makeTempDir();
    try {
      writeFileSync(join(dir, 'Dockerfile'), 'FROM node:18-alpine');
      const result = scanProject(dir);
      assert.ok(result.includes('docker'), `Expected docker in [${result}]`);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('returns empty for empty dir', () => {
    const dir = makeTempDir();
    try {
      const result = scanProject(dir);
      assert.deepEqual(result, []);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
