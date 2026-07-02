import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const LEARNINGS_FILE = 'learnings.json';

export class ProjectMemory {
  constructor(projectDir) {
    this.projectDir = projectDir;
    this.niyamDir = join(projectDir, '.niyam');
    this.filePath = join(this.niyamDir, LEARNINGS_FILE);
    this.learnings = this._load();
  }

  _load() {
    if (!existsSync(this.filePath)) return [];
    try {
      return JSON.parse(readFileSync(this.filePath, 'utf8'));
    } catch {
      return [];
    }
  }

  _save() {
    if (!existsSync(this.niyamDir)) mkdirSync(this.niyamDir, { recursive: true });
    writeFileSync(this.filePath, JSON.stringify(this.learnings, null, 2), 'utf8');
  }

  add(learning) {
    const entry = {
      id: Date.now().toString(36),
      rule: learning.rule,
      context: learning.context || null,
      scope: learning.scope || 'global', // global, file-pattern, directory
      createdAt: new Date().toISOString(),
    };
    this.learnings.push(entry);
    this._save();
    return entry;
  }

  remove(id) {
    const before = this.learnings.length;
    this.learnings = this.learnings.filter(l => l.id !== id);
    this._save();
    return this.learnings.length < before;
  }

  getAll() {
    return this.learnings;
  }

  getRelevant(filePath) {
    return this.learnings.filter(l => {
      if (l.scope === 'global') return true;
      if (l.scope && filePath && filePath.includes(l.scope)) return true;
      return false;
    });
  }

  getFormatted(filePath) {
    const relevant = filePath ? this.getRelevant(filePath) : this.getAll();
    if (relevant.length === 0) return null;
    
    const lines = relevant.map(l => {
      const scope = l.scope === 'global' ? '' : ` [${l.scope}]`;
      return `- ${l.rule}${scope}`;
    });
    
    return `## Project Learnings\n\n${lines.join('\n')}`;
  }
}
