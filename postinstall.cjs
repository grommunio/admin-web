const fs = require('node:fs');
const path = require('node:path');
const topDir = __dirname;
const target = path.join(topDir, 'public', 'tinymce');

// Language packs are not part of the npm package
const keep = ['langs', path.join('models', 'langs')];

function clean(dir, rel = '') {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const relPath = path.join(rel, entry);
    if (keep.includes(relPath)) continue;
    if (keep.some(k => k.startsWith(relPath + path.sep))) {
      clean(path.join(dir, entry), relPath);
    } else {
      fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
    }
  }
}

clean(target);
fs.cpSync(path.join(topDir, 'node_modules', 'tinymce'), target, { recursive: true, force: true, dereference: true });
