// Guards against the exact drift bug this project used to have: the module
// list living in more than one hand-maintained place. examples/modules.json
// is the single source of truth (see examples/README.md's "Adding a new lab
// pair"); lab-portal.html's embedded array is meant to be *generated* from
// it via generate_lab_portal_html.py, never hand-edited.
//
// This test fails loudly if someone edits modules.json (or hand-edits
// lab-portal.html) without re-running the generator -- catching the drift
// in CI instead of it silently reappearing.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

function loadModulesJson() {
  return JSON.parse(fs.readFileSync(path.join(here, 'modules.json'), 'utf8'));
}

function loadEmbeddedPortalModules() {
  const html = fs.readFileSync(path.join(here, 'lab-portal.html'), 'utf8');
  const match = html.match(/const MODULES = (\[[\s\S]*?\n\]);/);
  if (!match) throw new Error('MODULES array not found in lab-portal.html');
  // eslint-disable-next-line no-eval
  const modules = eval(match[1]);
  // lab-portal.html is real HTML: generate_lab_portal_html.py's js_string()
  // intentionally escapes a literal "</script>" substring to "<\/script>"
  // so it can't prematurely close the page's real <script> tag. That one
  // backslash is required there and absent from modules.json's plain JSON
  // string (no HTML-parsing concern in JSON) -- strip it back out before
  // comparing, so this test only catches *actual* content drift, not the
  // expected escaping difference between the two contexts.
  return modules.map(m => ({ ...m, hint: m.hint.replace('<\\/script>', '</script>') }));
}

describe('lab-portal.html stays in sync with modules.json', () => {
  it('has an identical module list to examples/modules.json', () => {
    const source = loadModulesJson();
    const embedded = loadEmbeddedPortalModules();
    expect(
      embedded,
      'lab-portal.html is out of sync with modules.json -- run ' +
        '`python3 examples/generate_lab_portal_html.py` and commit the result'
    ).toEqual(source);
  });
});
