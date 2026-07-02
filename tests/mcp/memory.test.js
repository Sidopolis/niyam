import { test, describe } from 'node:test';
import { strict as assert } from 'node:assert';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { ProjectMemory } from '../../mcp/src/memory.js';

function makeTempDir() {
  return mkdtempSync(join(tmpdir(), 'niyam-memory-test-'));
}

describe('ProjectMemory', () => {
  test('add returns entry with id and rule', () => {
    const dir = makeTempDir();
    try {
      const memory = new ProjectMemory(dir);
      const entry = memory.add({ rule: 'Always use pnpm' });
      assert.ok(entry.id, 'Entry should have an id');
      assert.equal(entry.rule, 'Always use pnpm');
      assert.equal(entry.scope, 'global');
      assert.ok(entry.createdAt, 'Entry should have createdAt');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('getAll returns all learnings', () => {
    const dir = makeTempDir();
    try {
      const memory = new ProjectMemory(dir);
      memory.add({ rule: 'Rule one' });
      memory.add({ rule: 'Rule two' });
      memory.add({ rule: 'Rule three' });
      const all = memory.getAll();
      assert.equal(all.length, 3);
      assert.equal(all[0].rule, 'Rule one');
      assert.equal(all[2].rule, 'Rule three');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('remove deletes by ID', async () => {
    const dir = makeTempDir();
    try {
      const memory = new ProjectMemory(dir);
      const entry = memory.add({ rule: 'To be removed' });
      // Ensure different timestamp-based IDs
      await new Promise(resolve => setTimeout(resolve, 5));
      memory.add({ rule: 'To stay' });
      const removed = memory.remove(entry.id);
      assert.equal(removed, true);
      const all = memory.getAll();
      assert.equal(all.length, 1);
      assert.equal(all[0].rule, 'To stay');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('remove returns false for nonexistent ID', () => {
    const dir = makeTempDir();
    try {
      const memory = new ProjectMemory(dir);
      memory.add({ rule: 'Existing' });
      const removed = memory.remove('nonexistent-id');
      assert.equal(removed, false);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  test('persistence across instances', () => {
    const dir = makeTempDir();
    try {
      const memory1 = new ProjectMemory(dir);
      memory1.add({ rule: 'Persisted rule', scope: 'components/' });

      const memory2 = new ProjectMemory(dir);
      const all = memory2.getAll();
      assert.equal(all.length, 1);
      assert.equal(all[0].rule, 'Persisted rule');
      assert.equal(all[0].scope, 'components/');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
