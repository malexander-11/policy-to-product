// Full build: project -> compose -> render -> verify. Run `node scripts/fetch-geodata.cjs` first once
// (only needed to regenerate data/map-paths.json; the committed copy is enough to compose and render).
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const steps = fs.existsSync(path.join(ROOT, 'geodata', 'ne_10m_admin_1_states_provinces_lakes.geojson')) ? ['project', 'compose', 'render', 'verify'] : ['compose', 'render', 'verify'];
if (steps[0] !== 'project') console.log('geodata/ not downloaded: using the committed data/map-paths.json');
for (const s of steps) {
  console.log('\n== ' + s);
  execFileSync(process.execPath, [path.join(__dirname, s + '.cjs')], { stdio: 'inherit', cwd: ROOT });
}
