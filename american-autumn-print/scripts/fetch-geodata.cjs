// Download the Natural Earth files the map is drawn from (public domain, naturalearthdata.com)
// into geodata/, which is git-ignored. The files are data only: everything that reads them
// does so with JSON.parse, nothing in them is ever executed. A lock file records each file's
// size and sha256 so a rebuild can tell whether it has the same data.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const DIR = path.join(ROOT, 'geodata');
const LOCK = path.join(ROOT, 'data', 'geodata.lock.json');
const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const FILES = ['ne_10m_admin_1_states_provinces_lakes.geojson', 'ne_10m_rivers_lake_centerlines.geojson'];

const sha256 = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const lock = fs.existsSync(LOCK) ? JSON.parse(fs.readFileSync(LOCK, 'utf8')) : {};
  for (const name of FILES) {
    const out = path.join(DIR, name);
    if (fs.existsSync(out) && lock[name] && sha256(out) === lock[name].sha256) { console.log(name + ': already present, matches lock'); continue; }
    process.stdout.write(name + ': downloading… ');
    const res = await fetch(BASE + name);
    if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + name);
    const buf = Buffer.from(await res.arrayBuffer());
    JSON.parse(buf.toString('utf8')); // must be valid JSON before it is kept
    fs.writeFileSync(out, buf);
    const entry = { url: BASE + name, bytes: buf.length, sha256: sha256(out) };
    if (lock[name] && lock[name].sha256 !== entry.sha256) console.log('\n  note: differs from the locked copy (upstream changed); lock updated');
    lock[name] = entry;
    console.log((buf.length / 1048576).toFixed(1) + ' MB');
  }
  fs.writeFileSync(LOCK, JSON.stringify(lock, null, 2) + '\n');
  console.log('lock written: ' + path.relative(ROOT, LOCK));
})().catch(e => { console.error(e); process.exit(1); });
