import { describe, it, expect } from 'vitest';
import moduleConfigs from './moduleConfigs';

describe('moduleConfigs', () => {
  const entries = Object.entries(moduleConfigs);

  it('has 25 modules', () => {
    expect(entries).toHaveLength(25);
  });

  it('has 15 web-track and 10 llm-track modules', () => {
    const web = entries.filter(([, m]) => m.track === 'web');
    const llm = entries.filter(([, m]) => m.track === 'llm');
    expect(web).toHaveLength(15);
    expect(llm).toHaveLength(10);
  });

  it('every entry has a key matching its own id', () => {
    for (const [key, mod] of entries) {
      expect(mod.id).toBe(key);
    }
  });

  it('every entry has the required fields', () => {
    for (const [key, mod] of entries) {
      expect(mod.title, `${key}.title`).toBeTruthy();
      expect(mod.icon, `${key}.icon`).toBeTruthy();
      expect(mod.owasp, `${key}.owasp`).toBeTruthy();
      expect(mod.cwe, `${key}.cwe`).toBeTruthy();
      expect(mod.severity, `${key}.severity`).toBeTruthy();
      expect(mod.description, `${key}.description`).toBeTruthy();
      expect(mod.color, `${key}.color`).toBeTruthy();
      expect(['web', 'llm']).toContain(mod.track);
    }
  });

  it('has no duplicate titles', () => {
    const titles = entries.map(([, m]) => m.title);
    expect(new Set(titles).size).toBe(titles.length);
  });
});
