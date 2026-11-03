// Project the geography and every placed thing onto the page.
//   geodata/*.geojson + data/route.json + data/places.json
//   -> data/map-paths.json  (land fills, coast, state borders and rivers in card mm, clipped to the card)
//   -> data/placed.json     (page mm of every route point, pin and town; the route curves)
// The geodata files are untrusted downloads: they are only ever JSON.parsed here.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8'));

// ---- the map card on the page (bleed sheet, mm) ----
const CARD = { x: 10, y: 30, w: 134, h: 162 };

// ---- Lambert conformal conic, spherical, in mm at 1:5,000,000 (R = 6371 km / 5,000,000) ----
// Standard parallels 38/45, central meridian -73.1, reference latitude 42.1 at card (79.6, 70.8).
// This matches d3.geoConicConformal().parallels([38,45]).rotate([73.1,0]).center([0,42.1]).scale(1274.2).translate([79.6,70.8]).
const R = 1274.2, LAM0 = -73.1, PHI0 = 42.1, PHI1 = 38, PHI2 = 45, TX = 79.6, TY = 70.8;
const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
const tany = phi => Math.tan(Math.PI / 4 + phi / 2);
const n = Math.log(Math.cos(rad(PHI1)) / Math.cos(rad(PHI2))) / Math.log(tany(rad(PHI2)) / tany(rad(PHI1)));
const F = Math.cos(rad(PHI1)) * Math.pow(tany(rad(PHI1)), n) / n;
function raw(lng, lat) {
  const phi = Math.max(-89.9, Math.min(89.9, lat));
  const r = F / Math.pow(tany(rad(phi)), n);
  const t = n * rad(lng - LAM0);
  return [r * Math.sin(t), F - r * Math.cos(t)];
}
const P0 = raw(LAM0, PHI0);
/** lng/lat -> card mm (y down) */
function project(lng, lat) {
  const p = raw(lng, lat);
  return [TX + R * (p[0] - P0[0]), TY - R * (p[1] - P0[1])];
}
/** card mm -> longitude (for the compass: true north is along the local meridian) */
function lngAt(x, y) {
  const px = (x - TX) / R + P0[0], py = (TY - y) / R + P0[1];
  return LAM0 + deg(Math.atan2(px, F - py) / n);
}
/** card mm -> page mm */
const toPage = ([x, y]) => [+(x + CARD.x).toFixed(2), +(y + CARD.y).toFixed(2)];
const fmt = v => (Math.round(v * 100) / 100).toString();

// ---- clipping rings to the card (Sutherland-Hodgman against each edge of a rectangle) ----
const RECT = { x0: 0, y0: 0, x1: CARD.w, y1: CARD.h };
function cross(a, b, axis, v) {
  const t = (v - a[axis]) / (b[axis] - a[axis]);
  return axis === 0 ? [v, a[1] + t * (b[1] - a[1])] : [a[0] + t * (b[0] - a[0]), v];
}
function clipRing(ring) {
  const edges = [
    [p => p[0] >= RECT.x0, (a, b) => cross(a, b, 0, RECT.x0)],
    [p => p[0] <= RECT.x1, (a, b) => cross(a, b, 0, RECT.x1)],
    [p => p[1] >= RECT.y0, (a, b) => cross(a, b, 1, RECT.y0)],
    [p => p[1] <= RECT.y1, (a, b) => cross(a, b, 1, RECT.y1)]
  ];
  let out = ring;
  for (const [inside, meet] of edges) {
    const inp = out; out = [];
    if (!inp.length) break;
    let prev = inp[inp.length - 1];
    for (const cur of inp) {
      if (inside(cur)) { if (!inside(prev)) out.push(meet(prev, cur)); out.push(cur); }
      else if (inside(prev)) out.push(meet(prev, cur));
      prev = cur;
    }
  }
  return out;
}
const ringPath = ring => ring.length < 3 ? '' : 'M' + ring.map(p => fmt(p[0]) + ' ' + fmt(p[1])).join('L') + 'Z';
const rings = geom => geom.type === 'Polygon' ? geom.coordinates : geom.type === 'MultiPolygon' ? geom.coordinates.flat() : [];
const fillPath = geom => rings(geom).map(r => ringPath(clipRing(r.map(c => project(c[0], c[1]))))).join('');

// lines: keep runs of points near the card; the SVG clipPath trims the rest
const NEAR = 15;
const near = p => p[0] > -NEAR && p[0] < CARD.w + NEAR && p[1] > -NEAR && p[1] < CARD.h + NEAR;
function runsPath(projectedPts) {
  const parts = []; let run = [];
  for (const p of projectedPts) { if (near(p)) run.push(p); else if (run.length) { parts.push(run); run = []; } }
  if (run.length) parts.push(run);
  return parts.filter(r => r.length > 1).map(r => 'M' + r.map(p => fmt(p[0]) + ' ' + fmt(p[1])).join('L')).join('');
}
const linePath = coords => runsPath(coords.map(c => project(c[0], c[1])));
const lineFeaturePath = geom => geom.type === 'LineString' ? linePath(geom.coordinates)
  : geom.type === 'MultiLineString' ? geom.coordinates.map(linePath).join('') : '';

function bboxOf(geom) {
  let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
  const walk = a => { if (typeof a[0] === 'number') { if (a[0] < x0) x0 = a[0]; if (a[0] > x1) x1 = a[0]; if (a[1] < y0) y0 = a[1]; if (a[1] > y1) y1 = a[1]; } else a.forEach(walk); };
  walk(geom.coordinates);
  return [x0, y0, x1, y1];
}
const AREA = [-81, 36, -66, 48];
const touches = b => b[2] >= AREA[0] && b[0] <= AREA[2] && b[3] >= AREA[1] && b[1] <= AREA[3];

// ---- the route as a smooth curve through the waypoints (centripetal Catmull-Rom -> cubic Beziers) ----
function curvePath(pts) {
  if (pts.length < 2) return '';
  const ext = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts];
  const last = pts[pts.length - 1], prev = pts[pts.length - 2];
  ext.push([2 * last[0] - prev[0], 2 * last[1] - prev[1]]);
  const d = (a, b) => Math.pow(Math.hypot(b[0] - a[0], b[1] - a[1]), 0.5) || 1e-6;
  let s = 'M' + fmt(pts[0][0]) + ' ' + fmt(pts[0][1]);
  for (let i = 1; i < ext.length - 2; i++) {
    const p0 = ext[i - 1], p1 = ext[i], p2 = ext[i + 1], p3 = ext[i + 2];
    const d1 = d(p0, p1), d2 = d(p1, p2), d3 = d(p2, p3);
    const b1 = [0, 1].map(k => (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2)));
    const b2 = [0, 1].map(k => (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2)));
    s += 'C' + [b1, b2, p2].map(p => fmt(p[0]) + ' ' + fmt(p[1])).join(' ');
  }
  return s;
}

// ---- go ----
const t0 = Date.now();
const land = read('geodata/ne_10m_admin_1_states_provinces_lakes.geojson');
const rivers = read('geodata/ne_10m_rivers_lake_centerlines.geojson');

const feats = land.features.filter(f => ['USA', 'CAN'].includes((f.properties || {}).adm0_a3) && touches(bboxOf(f.geometry)));

// Which edges are shared by two polygons (state/province borders) and which appear once (coast, lake shore)?
// Natural Earth's admin-1 polygons share their vertices exactly along borders, so an edge key is enough.
const key = (a, b) => { const ka = a[0].toFixed(6) + ',' + a[1].toFixed(6), kb = b[0].toFixed(6) + ',' + b[1].toFixed(6); return ka < kb ? ka + '|' + kb : kb + '|' + ka; };
const owners = new Map();
feats.forEach((f, fi) => rings(f.geometry).forEach(ring => {
  for (let i = 1; i < ring.length; i++) { const k = key(ring[i - 1], ring[i]); const o = owners.get(k); if (o) o.count++; else owners.set(k, { count: 1, first: fi }); }
}));
const states = [], coast = [], borders = [];
feats.forEach((f, fi) => {
  const p = f.properties || {};
  const d = fillPath(f.geometry);
  if (d) states.push({ name: p.name, postal: p.postal || p.iso_3166_2, country: p.adm0_a3, d });
  for (const ring of rings(f.geometry)) {
    // walk the ring, collecting runs of consecutive edges of the same kind (a shared edge is drawn once, by its first owner)
    let kind = null, run = [];
    const flush = () => { if (run.length > 1) (kind === 'border' ? borders : coast).push(runsPath(run.map(c => project(c[0], c[1])))); run = []; };
    for (let i = 1; i < ring.length; i++) {
      const o = owners.get(key(ring[i - 1], ring[i]));
      const k = o.count >= 2 ? (o.first === fi ? 'border' : 'skip') : 'coast';
      if (k !== kind) { flush(); kind = k; run = k === 'skip' ? [] : [ring[i - 1]]; }
      if (k !== 'skip') run.push(ring[i]);
    }
    flush();
  }
});
const riverPaths = [];
for (const f of rivers.features) {
  const p = f.properties || {};
  if (p.scalerank > 9 || p.featurecla !== 'River') continue;
  if (!touches(bboxOf(f.geometry))) continue;
  const d = lineFeaturePath(f.geometry);
  if (d) riverPaths.push({ name: p.name || '', d });
}

const route = read('data/route.json');
const places = read('data/places.json');
const all = {};
for (const list of [route.main, route.spur, route.extra]) for (const w of list) all[w.id] = w;
const pt = id => { if (!all[id]) throw new Error('unknown place id: ' + id); return project(all[id].lng, all[id].lat); };

const cx = places.compass.x - CARD.x, cy = places.compass.y - CARD.y;
const placed = {
  card: CARD,
  projection: { type: 'Lambert conformal conic (spherical)', parallels: [PHI1, PHI2], centralMeridian: LAM0, referenceLatitude: PHI0, scale: '1:5,000,000' },
  points: Object.fromEntries(Object.keys(all).map(id => [id, toPage(pt(id))])),
  routeMain: curvePath(route.main.map(w => pt(w.id))),
  routeSpur: curvePath(route.spur.map(w => pt(w.id))),
  pins: places.pins.map(p => ({ ...p, xy: toPage(pt(p.at)) })),
  towns: places.towns.map(t => ({ ...t, xy: toPage(pt(t.at)) })),
  context: places.context.map(t => ({ ...t, xy: toPage(pt(t.at)) })),
  mmPer100Miles: +(100 * 1.609344 / 5).toFixed(2),
  // meridian convergence at the compass: rotate the rose by this so "N" points along the local meridian
  compassRotate: +(n * (lngAt(cx, cy) - LAM0)).toFixed(2)
};

fs.writeFileSync(path.join(ROOT, 'data', 'map-paths.json'), JSON.stringify({ card: CARD, states, coast: coast.filter(Boolean), borders: borders.filter(Boolean), rivers: riverPaths }));
fs.writeFileSync(path.join(ROOT, 'data', 'placed.json'), JSON.stringify(placed, null, 1));
const size = f => (fs.statSync(path.join(ROOT, 'data', f)).size / 1024).toFixed(0) + ' KB';
console.log('map-paths.json: ' + states.length + ' states/provinces, ' + coast.filter(Boolean).length + ' coast runs, ' + borders.filter(Boolean).length + ' border runs, ' + riverPaths.length + ' rivers, ' + size('map-paths.json'));
console.log('placed.json: ' + Object.keys(placed.points).length + ' points, compass rotated ' + placed.compassRotate + '°, ' + size('placed.json') + ' (' + (Date.now() - t0) + ' ms)');
console.log('pins (page mm): ' + placed.pins.map(p => p.label + ' (' + p.xy.join(', ') + ')').join(' · '));
