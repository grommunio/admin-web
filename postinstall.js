const fse = require('fs-extra');
const path = require('path');
const topDir = __dirname;
const target = path.join(topDir, 'public', 'tinymce');

// Language packs are not part of the npm package
const keep = ['langs', path.join('models', 'langs')];

function clean(dir, rel = '') {
  if (!fse.existsSync(dir)) return;
  for (const entry of fse.readdirSync(dir)) {
    const relPath = path.join(rel, entry);
    if (keep.includes(relPath)) continue;
    if (keep.some(k => k.startsWith(relPath + path.sep))) {
      clean(path.join(dir, entry), relPath);
    } else {
      fse.removeSync(path.join(dir, entry));
    }
  }
}

clean(target);
fse.copySync(path.join(topDir, 'node_modules', 'tinymce'), target, { overwrite: true });
