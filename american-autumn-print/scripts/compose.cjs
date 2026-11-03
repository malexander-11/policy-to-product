// Put the poster together: data + template + icons + fonts -> out/poster.html
// All positions are page mm on the bleed sheet; the map SVG's user unit is 1 mm of the card.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
const json = f => JSON.parse(read(f));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fmt = v => (Math.round(v * 100) / 100).toString();

const paths = json('data/map-paths.json');
const placed = json('data/placed.json');
const places = json('data/places.json');
const prints = json('data/prints.json').prints.filter(p => p.placed);
const quotes = json('data/quotes.json').quotes;
const CARD = placed.card;
const C = ([x, y]) => [x - CARD.x, y - CARD.y];          // page mm -> card mm

// ---- icons: each icons/*.svg becomes two <symbol>s, the ink drawing and a paper-coloured halo ----
const INK = '#2E2419', RUST = '#A63A0C', PAPER = '#FBF4E4';
const symbols = [];
for (const f of fs.readdirSync(path.join(ROOT, 'icons')).filter(f => f.endsWith('.svg')).sort()) {
  const id = f.replace(/\.svg$/, '');
  const inner = read('icons/' + f).replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  const ink = inner.replace(/class="rust"/g, 'stroke="' + RUST + '"').replace(/class="fill-rust"/g, 'fill="' + RUST + '"');
  const halo = inner.replace(/class="(rust|fill-rust)"/g, '').replace(/fill="[^"]*"/g, '').replace(/<(path|circle|ellipse)\b/g, '<$1 fill="none"');
  symbols.push('<symbol id="ic-' + id + '" viewBox="0 0 24 24">' + ink + '</symbol>' +
               '<symbol id="ic-' + id + '-halo" viewBox="0 0 24 24">' + halo + '</symbol>');
}

// ---- the map ----
const svg = [];
svg.push('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + CARD.w + ' ' + CARD.h + '" width="' + CARD.w + 'mm" height="' + CARD.h + 'mm" role="img" aria-label="Route map">');
svg.push('<defs><clipPath id="cardclip"><rect x="0" y="0" width="' + CARD.w + '" height="' + CARD.h + '"/></clipPath>' + symbols.join('') + '</defs>');
svg.push('<g clip-path="url(#cardclip)">');
svg.push('<rect x="0" y="0" width="' + CARD.w + '" height="' + CARD.h + '" fill="#D7E4EC"/>');
// land: fills first (lakes are holes, so they stay water), then shores, borders, rivers
svg.push('<g fill-rule="evenodd">');
for (const s of paths.states) svg.push('<path d="' + s.d + '" fill="' + (s.country === 'CAN' ? '#F3EAD6' : '#FBF4E4') + '" data-name="' + esc(s.name) + '"/>');
svg.push('</g>');
svg.push('<g fill="none" stroke="#A3BCCF" stroke-width="0.35" stroke-linejoin="round" stroke-linecap="round">' + paths.coast.map(d => '<path d="' + d + '"/>').join('') + '</g>');
svg.push('<g fill="none" stroke="#CDBB99" stroke-width="0.3" stroke-dasharray="1.2 0.8" stroke-linejoin="round" stroke-linecap="round">' + paths.borders.map(d => '<path d="' + d + '"/>').join('') + '</g>');
svg.push('<g fill="none" stroke="#A3BCCF" stroke-width="0.3" stroke-opacity="0.9" stroke-linejoin="round" stroke-linecap="round">' + paths.rivers.map(r => '<path d="' + r.d + '"/>').join('') + '</g>');
// names
for (const s of places.states) svg.push('<text class="state' + (s.canada ? ' canada' : '') + '" x="' + fmt(s.x - CARD.x) + '" y="' + fmt(s.y - CARD.y) + '" text-anchor="middle"' + (s.size ? ' style="font-size:' + s.size + 'px"' : '') + '>' + esc(s.label) + '</text>');
svg.push('<text class="ocean" x="' + fmt(places.ocean.x - CARD.x) + '" y="' + fmt(places.ocean.y - CARD.y) + '" text-anchor="middle">' + esc(places.ocean.label) + '</text>');
// the road
const routeStyle = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
svg.push('<path id="route-glow" d="' + placed.routeMain + '" ' + routeStyle + ' stroke="#FFE14D" stroke-opacity="0.55" stroke-width="3.6"/>');
svg.push('<path id="spur-glow" d="' + placed.routeSpur + '" ' + routeStyle + ' stroke="#FFE14D" stroke-opacity="0.55" stroke-width="3.6"/>');
svg.push('<path id="route" d="' + placed.routeMain + '" ' + routeStyle + ' stroke="#A63A0C" stroke-width="0.7" stroke-dasharray="2.2 1.4"/>');
svg.push('<path id="spur" d="' + placed.routeSpur + '" ' + routeStyle + ' stroke="#A63A0C" stroke-width="0.7" stroke-dasharray="2.2 1.4"/>');
// leaders from each print's edge to its place
const printRect = p => ({ x: p.x, y: p.y, w: p.w, h: p._h });
const LANDSCAPE = new Set(['1dd98538a3da21cb', 'bdac3f356449b2a6', '7fb71e53e5e9c6e1', '94fca634265ac2f6']);
for (const p of prints) { const imgW = p.w - 6; p._h = 6 + 16 + (LANDSCAPE.has(p.hex) ? imgW * 3 / 4 : imgW * 4 / 3); }
function edgePoint(r, target, deg) {
  // where the ray from the print's centre to the target leaves the print, allowing for its rotation
  const cx = r.x + r.w / 2, cy = r.y + r.h / 2, a = -(deg || 0) * Math.PI / 180;
  const lx = target[0] - cx, ly = target[1] - cy;
  const dx = lx * Math.cos(a) - ly * Math.sin(a), dy = lx * Math.sin(a) + ly * Math.cos(a);   // target in the print's own frame
  const tx = dx ? (r.w / 2) / Math.abs(dx) : Infinity, ty = dy ? (r.h / 2) / Math.abs(dy) : Infinity;
  const t = Math.min(tx, ty), ex = dx * t, ey = dy * t;
  return [cx + ex * Math.cos(-a) - ey * Math.sin(-a), cy + ex * Math.sin(-a) + ey * Math.cos(-a)];
}
svg.push('<g class="leaders" fill="none" stroke="#2E2419" stroke-width="0.3" stroke-dasharray="1 0.9" stroke-linecap="round">');
for (const l of placed.leaders) {
  const p = prints.find(q => q.hex === l.hex); if (!p) continue;
  const a = C(p.from || edgePoint(printRect(p), l.xy, p.rotate)), b = C(l.xy);
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), e = [b[0] - (b[0] - a[0]) / L * 1.6, b[1] - (b[1] - a[1]) / L * 1.6];
  svg.push('<path class="leader" data-to="' + l.to + '" d="M' + fmt(a[0]) + ' ' + fmt(a[1]) + 'L' + fmt(e[0]) + ' ' + fmt(e[1]) + '"/>');
  svg.push('<circle cx="' + fmt(b[0]) + '" cy="' + fmt(b[1]) + '" r="0.7" fill="#FBF4E4" stroke="#2E2419" stroke-width="0.3" stroke-dasharray="none"/>');
}
svg.push('</g>');
// icons: halo then ink, 10 mm, centred on the given point
for (const ic of places.icons) {
  const [x, y] = C([ic.x, ic.y]), s = ic.size || 10;
  svg.push('<g class="icon" data-id="' + ic.id + '">' +
    '<use href="#ic-' + ic.id + '-halo" x="' + fmt(x - s / 2) + '" y="' + fmt(y - s / 2) + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + PAPER + '" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<use href="#ic-' + ic.id + '" x="' + fmt(x - s / 2) + '" y="' + fmt(y - s / 2) + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    (ic.note ? '<text class="icon-note" x="' + fmt(x + ic.noteAt[0]) + '" y="' + fmt(y + ic.noteAt[1]) + '">' + esc(ic.note) + '</text>' : '') + '</g>');
}
// context towns, route towns, then the seven beds
for (const t of placed.context) { const [x, y] = C(t.xy); svg.push('<g class="ctxpt"><circle cx="' + fmt(x) + '" cy="' + fmt(y) + '" r="0.6" fill="#FBF4E4" stroke="#7A6955" stroke-width="0.3"/><text class="lbl ctx" x="' + fmt(x + t.text[0]) + '" y="' + fmt(y + t.text[1]) + '" text-anchor="' + t.anchor + '">' + esc(t.label) + '</text></g>'); }
for (const t of placed.towns) { const [x, y] = C(t.xy); svg.push('<g class="townpt"><circle cx="' + fmt(x) + '" cy="' + fmt(y) + '" r="0.9" fill="#FBF4E4" stroke="#2E2419" stroke-width="0.4"/><text class="lbl town" x="' + fmt(x + t.text[0]) + '" y="' + fmt(y + t.text[1]) + '" text-anchor="' + t.anchor + '">' + esc(t.label) + '</text></g>'); }
for (const p of placed.pins) {
  const [x, y] = C(p.xy), bx = x + p.badge[0], by = y + p.badge[1];
  svg.push('<g class="pin" data-n="' + p.n + '">' +
    '<circle class="pin-dot" cx="' + fmt(x) + '" cy="' + fmt(y) + '" r="1.8" fill="#2E2419" stroke="#FBF4E4" stroke-width="0.9"/>' +
    '<circle class="badge" cx="' + fmt(bx) + '" cy="' + fmt(by) + '" r="2.7" fill="#FCF8EE" stroke="#2E2419" stroke-width="0.35"/>' +
    '<text class="badge-n" x="' + fmt(bx) + '" y="' + fmt(by + 1.15) + '" text-anchor="middle">' + p.n + '</text>' +
    '<text class="lbl" x="' + fmt(x + p.text[0]) + '" y="' + fmt(y + p.text[1]) + '" text-anchor="' + p.anchor + '">' + esc(p.label) + '</text></g>');
}
// compass rose and scale bar
{
  const [x, y] = C([places.compass.x, places.compass.y]), s = places.compass.size / 2;
  svg.push('<g class="compass" transform="translate(' + fmt(x) + ' ' + fmt(y) + ') rotate(' + placed.compassRotate + ')" fill="none" stroke="#2E2419" stroke-width="0.35" stroke-linejoin="round">' +
    '<circle r="' + fmt(s * 0.55) + '" stroke="#7A6955" stroke-dasharray="0.8 0.8"/>' +
    '<path d="M0 ' + fmt(-s) + 'L' + fmt(s * 0.18) + ' 0L0 ' + fmt(s) + 'L' + fmt(-s * 0.18) + ' 0Z" fill="#FBF4E4"/>' +
    '<path d="M0 ' + fmt(-s) + 'L' + fmt(s * 0.18) + ' 0L0 0Z" fill="#A63A0C" stroke="none"/>' +
    '<path d="M' + fmt(-s) + ' 0L0 ' + fmt(-s * 0.18) + 'L' + fmt(s) + ' 0L0 ' + fmt(s * 0.18) + 'Z" fill="#FBF4E4"/>' +
    '<text class="compass-n" x="0" y="' + fmt(-s - 1.2) + '" text-anchor="middle" stroke="none">N</text></g>');
  const [sx, sy] = C([places.scalebar.x, places.scalebar.y]), m100 = placed.mmPer100Miles;
  svg.push('<g class="scale" fill="none" stroke="#2E2419" stroke-width="0.35" stroke-linecap="round">' +
    '<path d="M' + fmt(sx) + ' ' + fmt(sy) + 'H' + fmt(sx + m100) + '"/>' +
    [0, 0.5, 1].map(k => '<path d="M' + fmt(sx + m100 * k) + ' ' + fmt(sy - 1) + 'V' + fmt(sy + 1) + '"/>').join('') +
    '<rect x="' + fmt(sx) + '" y="' + fmt(sy - 0.6) + '" width="' + fmt(m100 / 2) + '" height="1.2" fill="#2E2419" stroke="none" opacity="0.85"/>' +
    [0, 0.5, 1].map(k => '<text class="scale-t" x="' + fmt(sx + m100 * k) + '" y="' + fmt(sy + 3.6) + '" text-anchor="middle" stroke="none">' + (k * 100) + '</text>').join('') +
    '<text class="scale-t" x="' + fmt(sx + m100 + 3) + '" y="' + fmt(sy + 3.6) + '" stroke="none">miles</text></g>');
}
svg.push('</g></svg>');

// ---- prints, notes, key, footer ----
const printHtml = prints.map(p =>
  '<figure class="print" data-hex="' + p.hex + '" style="left:' + p.x + 'mm;top:' + p.y + 'mm;width:' + p.w + 'mm;height:' + fmt(p._h) + 'mm;transform:rotate(' + p.rotate + 'deg)">' +
  '<i class="tape"></i><img src="../../public/scrapbook-media/' + p.hex + '-f.jpg" alt="' + esc(p.cap) + '">' +
  '<figcaption><span class="cap">' + esc(p.cap) + '</span><span class="day">' + esc(p.day) + '</span></figcaption></figure>').join('\n  ');
const quoteHtml = quotes.map(q =>
  '<div class="quote" style="left:' + q.x + 'mm;top:' + q.y + 'mm;width:' + q.w + 'mm;transform:rotate(' + q.rotate + 'deg)"><span class="q">' + esc(q.text) + '</span><span class="who">' + esc(q.who) + '</span></div>').join('\n  ');
const keyHtml = '<aside class="key"><i class="tape"></i><h2>Where we slept</h2><ol>' +
  placed.pins.map(p => '<li><span class="b">' + p.n + '</span><span><span class="where">' + esc(p.hotel.startsWith(p.label) ? p.hotel : p.label + ' — ' + p.hotel) + '</span><span class="when">' + esc(p.when) + '</span></span></li>').join('') + '</ol></aside>';

let html = read('template/poster.html');
const fill = (k, v) => { html = html.replace('{{' + k + '}}', () => v); };
fill('fonts', read('fonts/fonts.css').replace(/url\((?!['"]?(?:data|https?):)/g, 'url(../fonts/'));
fill('css', read('template/poster.css'));
fill('title', '<span>Matt &amp; Billy’s American Autumn</span>');
fill('subtitle1', 'Washington DC to Boston · 27 Sept – 10 Oct 2026');
fill('subtitle2', 'Fourteen days · about 1,100 road miles · eight states and D.C.');
fill('map', svg.join('\n'));
fill('prints', printHtml);
fill('quotes', quoteHtml);
fill('key', keyHtml);
fill('stats', 'DC · MD · PA · NJ · NY · CT · MA · NH · ME');
fill('credit', 'Map: Natural Earth · Lambert conformal conic · 1:3,200,000 · drawn from our scrapbook');
fill('hand', 'Made from our scrapbook, written along the way.');
if (/{{\w+}}/.test(html)) throw new Error('unfilled slot: ' + html.match(/{{\w+}}/)[0]);
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'out', 'poster.html'), html);
console.log('out/poster.html: ' + (html.length / 1024).toFixed(0) + ' KB, ' + prints.length + ' prints, ' + places.icons.length + ' icons, ' + quotes.length + ' notes');
