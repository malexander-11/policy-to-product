// Put the print together: data + template + icons + fonts -> out/poster.html
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
svg.push('<g fill="none" stroke="#A3BCCF" stroke-width="0.25" stroke-linejoin="round" stroke-linecap="round">' + paths.coast.map(d => '<path d="' + d + '"/>').join('') + '</g>');
svg.push('<g fill="none" stroke="#CDBB99" stroke-width="0.22" stroke-dasharray="0.9 0.6" stroke-linejoin="round" stroke-linecap="round">' + paths.borders.map(d => '<path d="' + d + '"/>').join('') + '</g>');
svg.push('<g fill="none" stroke="#C5D6E2" stroke-width="0.2" stroke-linejoin="round" stroke-linecap="round">' + paths.rivers.map(r => '<path d="' + r.d + '"/>').join('') + '</g>');
// names
for (const s of places.states) svg.push('<text class="state' + (s.canada ? ' canada' : '') + '" x="' + fmt(s.x - CARD.x) + '" y="' + fmt(s.y - CARD.y) + '" text-anchor="middle"' + (s.size ? ' style="font-size:' + s.size + 'px"' : '') + '>' + esc(s.label) + '</text>');
svg.push('<text class="ocean" x="' + fmt(places.ocean.x - CARD.x) + '" y="' + fmt(places.ocean.y - CARD.y) + '" text-anchor="middle">' + esc(places.ocean.label) + '</text>');
// the road
const routeStyle = 'fill="none" stroke-linecap="round" stroke-linejoin="round"';
svg.push('<path id="route-glow" d="' + placed.routeMain + '" ' + routeStyle + ' stroke="#FFE14D" stroke-opacity="0.55" stroke-width="2.4"/>');
svg.push('<path id="spur-glow" d="' + placed.routeSpur + '" ' + routeStyle + ' stroke="#FFE14D" stroke-opacity="0.55" stroke-width="2.4"/>');
svg.push('<path id="route" d="' + placed.routeMain + '" ' + routeStyle + ' stroke="#A63A0C" stroke-width="0.5" stroke-dasharray="1.5 1"/>');
svg.push('<path id="spur" d="' + placed.routeSpur + '" ' + routeStyle + ' stroke="#A63A0C" stroke-width="0.5" stroke-dasharray="1.5 1"/>');
// icons: halo then ink, 6.5 mm, centred on the given point
for (const ic of places.icons) {
  const [x, y] = C([ic.x, ic.y]), s = ic.size || 6.5;
  svg.push('<g class="icon" data-id="' + ic.id + '">' +
    '<use href="#ic-' + ic.id + '-halo" x="' + fmt(x - s / 2) + '" y="' + fmt(y - s / 2) + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + PAPER + '" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<use href="#ic-' + ic.id + '" x="' + fmt(x - s / 2) + '" y="' + fmt(y - s / 2) + '" width="' + s + '" height="' + s + '" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>' +
    (ic.note ? '<text class="icon-note" x="' + fmt(x + ic.noteAt[0]) + '" y="' + fmt(y + ic.noteAt[1]) + '">' + esc(ic.note) + '</text>' : '') + '</g>');
}
// context towns, places on the way, then the seven beds (name + the nights, no key needed)
for (const t of placed.context) { const [x, y] = C(t.xy); svg.push('<g class="ctxpt"><circle cx="' + fmt(x) + '" cy="' + fmt(y) + '" r="0.45" fill="#FBF4E4" stroke="#7A6955" stroke-width="0.25"/><text class="lbl ctx" x="' + fmt(x + t.text[0]) + '" y="' + fmt(y + t.text[1]) + '" text-anchor="' + t.anchor + '">' + esc(t.label) + '</text></g>'); }
for (const t of placed.towns) { const [x, y] = C(t.xy); svg.push('<g class="townpt"><circle cx="' + fmt(x) + '" cy="' + fmt(y) + '" r="0.7" fill="#FBF4E4" stroke="#2E2419" stroke-width="0.3"/><text class="lbl town" x="' + fmt(x + t.text[0]) + '" y="' + fmt(y + t.text[1]) + '" text-anchor="' + t.anchor + '">' + esc(t.label) + '</text></g>'); }
for (const p of placed.pins) {
  const [x, y] = C(p.xy), d = p.dates || [p.text[0], p.text[1] + 2.5];
  svg.push('<g class="pin" data-at="' + p.at + '">' +
    '<circle class="pin-dot" cx="' + fmt(x) + '" cy="' + fmt(y) + '" r="1.1" fill="#2E2419" stroke="#FBF4E4" stroke-width="0.6"/>' +
    '<text class="lbl" x="' + fmt(x + p.text[0]) + '" y="' + fmt(y + p.text[1]) + '" text-anchor="' + p.anchor + '">' + esc(p.label) + '</text>' +
    '<text class="when" x="' + fmt(x + d[0]) + '" y="' + fmt(y + d[1]) + '" text-anchor="' + (p.datesAnchor || p.anchor) + '">' + esc(p.when) + '</text></g>');
}
// compass rose and scale bar
{
  const [x, y] = C([places.compass.x, places.compass.y]), s = places.compass.size / 2;
  svg.push('<g class="compass" transform="translate(' + fmt(x) + ' ' + fmt(y) + ') rotate(' + placed.compassRotate + ')" fill="none" stroke="#2E2419" stroke-width="0.25" stroke-linejoin="round">' +
    '<circle r="' + fmt(s * 0.55) + '" stroke="#7A6955" stroke-dasharray="0.6 0.6"/>' +
    '<path d="M0 ' + fmt(-s) + 'L' + fmt(s * 0.18) + ' 0L0 ' + fmt(s) + 'L' + fmt(-s * 0.18) + ' 0Z" fill="#FBF4E4"/>' +
    '<path d="M0 ' + fmt(-s) + 'L' + fmt(s * 0.18) + ' 0L0 0Z" fill="#A63A0C" stroke="none"/>' +
    '<path d="M' + fmt(-s) + ' 0L0 ' + fmt(-s * 0.18) + 'L' + fmt(s) + ' 0L0 ' + fmt(s * 0.18) + 'Z" fill="#FBF4E4"/>' +
    '<text class="compass-n" x="0" y="' + fmt(-s - 0.8) + '" text-anchor="middle" stroke="none">N</text></g>');
  const [sx, sy] = C([places.scalebar.x, places.scalebar.y]), m100 = placed.mmPer100Miles;
  svg.push('<g class="scale" fill="none" stroke="#2E2419" stroke-width="0.25" stroke-linecap="round">' +
    '<path d="M' + fmt(sx) + ' ' + fmt(sy) + 'H' + fmt(sx + m100) + '"/>' +
    [0, 0.5, 1].map(k => '<path d="M' + fmt(sx + m100 * k) + ' ' + fmt(sy - 0.7) + 'V' + fmt(sy + 0.7) + '"/>').join('') +
    '<rect x="' + fmt(sx) + '" y="' + fmt(sy - 0.4) + '" width="' + fmt(m100 / 2) + '" height="0.8" fill="#2E2419" stroke="none" opacity="0.85"/>' +
    [0, 0.5, 1].map(k => '<text class="scale-t" x="' + fmt(sx + m100 * k) + '" y="' + fmt(sy + 2.6) + '" text-anchor="middle" stroke="none">' + (k * 100) + '</text>').join('') +
    '<text class="scale-t" x="' + fmt(sx + m100 + 2) + '" y="' + fmt(sy + 2.6) + '" stroke="none">miles</text></g>');
}
svg.push('</g></svg>');

// ---- the page ----
let html = read('template/poster.html');
const fill = (k, v) => { html = html.replace('{{' + k + '}}', () => v); };
fill('fonts', read('fonts/fonts.css').replace(/url\((?!['"]?(?:data|https?):)/g, 'url(../fonts/'));
fill('css', read('template/poster.css'));
fill('title', '<span>Matt &amp; Billy’s American Autumn</span>');
fill('subtitle', '<span>Washington DC to Boston · 27 Sept – 10 Oct 2026</span>');
fill('map', svg.join('\n'));
fill('stats', 'Fourteen days · 1,100 road miles · eight states and D.C.');
fill('credit', 'Map: Natural Earth · Lambert conformal conic · 1:5,000,000');
fill('hand', 'Made from our scrapbook, written along the way.');
if (/{{\w+}}/.test(html)) throw new Error('unfilled slot: ' + html.match(/{{\w+}}/)[0]);
fs.mkdirSync(path.join(ROOT, 'out'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'out', 'poster.html'), html);
console.log('out/poster.html: ' + (html.length / 1024).toFixed(0) + ' KB, ' + placed.pins.length + ' pins, ' + placed.towns.length + ' towns, ' + places.icons.length + ' icons');
