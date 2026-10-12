// Uso: node measure-bundles.mjs   (instala, compila y reporta peso JS/CSS de cada proyecto)
import { execSync } from 'node:child_process';
import { readdirSync, statSync, readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const projects = {
  'inventorypro-react': 'dist',
  'inventorypro-vue': 'dist',
  'inventorypro-svelte': 'dist',
  'inventorypro-angular': 'dist/inventorypro/browser',
};
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
const kb = (n) => (n / 1024).toFixed(2) + ' kB';

const rows = [];
for (const [name, out] of Object.entries(projects)) {
  execSync('npm install --no-audit --no-fund', { cwd: name, stdio: 'inherit' });
  execSync('npm run build', { cwd: name, stdio: 'inherit' });
  let js = 0, jsGz = 0, css = 0, cssGz = 0;
  for (const f of walk(join(name, out))) {
    const buf = readFileSync(f);
    if (f.endsWith('.js')) { js += buf.length; jsGz += gzipSync(buf).length; }
    if (f.endsWith('.css')) { css += buf.length; cssGz += gzipSync(buf).length; }
  }
  rows.push({ proyecto: name, 'JS': kb(js), 'JS gzip': kb(jsGz), 'CSS': kb(css), 'CSS gzip': kb(cssGz), 'Total gzip': kb(jsGz + cssGz) });
}
console.table(rows);
