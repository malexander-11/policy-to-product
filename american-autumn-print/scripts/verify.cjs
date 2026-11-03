// Checks on the composed page (in Chromium) and on the rendered PDFs (with poppler).
// Hard failures exit non-zero; soft ones are listed as warnings to tune by hand.
//   --dom   skip the PDF checks (quick layout loop)
//   --dump  print every measured box (page mm: left top right bottom)
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..');
const OUT = path.join(ROOT, 'out');
const fails = [], warns = [];
const check = (ok, msg, soft) => { console.log((ok ? '  ok   ' : soft ? '  warn ' : '  FAIL ') + msg); if (!ok) (soft ? warns : fails).push(msg); };
const run = (cmd, args) => execFileSync(cmd, args, { encoding: 'utf8' });
const DOM_ONLY = process.argv.includes('--dom');
const DUMP = process.argv.includes('--dump');

(async () => {
  // ---- the PDFs ----
  if (!DOM_ONLY) {
  console.log('PDFs');
  const bleed = path.join(OUT, 'poster-a5-bleed.pdf'), trim = path.join(OUT, 'poster-a5.pdf');
  for (const [f, w, h] of [[bleed, 436.54, 612.28], [trim, 419.53, 595.28]]) {
    const info = run('pdfinfo', [f]);
    const m = /Page size:\s+([\d.]+) x ([\d.]+) pts/.exec(info), pages = +(/Pages:\s+(\d+)/.exec(info) || [])[1];
    const got = m ? [+m[1], +m[2]] : [0, 0];
    check(Math.abs(got[0] - w) < 1.5 && Math.abs(got[1] - h) < 1.5 && pages === 1, path.basename(f) + ': ' + got[0] + ' x ' + got[1] + ' pt (' + (got[0] / 72 * 25.4).toFixed(1) + ' x ' + (got[1] / 72 * 25.4).toFixed(1) + ' mm), ' + pages + ' page');
  }
  const fonts = run('pdffonts', [bleed]).split('\n').slice(2).filter(Boolean);
  const names = fonts.map(l => l.trim().split(/\s+/)[0].replace(/^[A-Z]{6}\+/, ''));
  const bad = names.filter(n => !/Caveat|Gelasio|SpecialElite|Special Elite/i.test(n));
  const embedded = fonts.every(l => /\byes\b/.test(l));
  check(fonts.length >= 3 && bad.length === 0 && embedded, 'fonts embedded: ' + [...new Set(names)].join(', ') + (bad.length ? ' — UNEXPECTED: ' + bad.join(', ') : ''));
  const imgs = run('pdfimages', ['-list', bleed]).split('\n').slice(2).filter(l => /\b(image|smask|stencil)\b/.test(l));
  check(imgs.length === 0, 'nothing rasterised: ' + imgs.length + ' images in the PDF (expected none, the page is all vector)');
  const size = fs.statSync(bleed).size / 1048576;
  check(size < 3, 'file size ' + size.toFixed(2) + ' MB');
  }

  // ---- the page itself ----
  console.log('Page');
  const server = http.createServer((req, res) => { const f = path.normalize(path.join(REPO, decodeURIComponent(req.url.split('?')[0]))); if (!f.startsWith(REPO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.end(fs.readFileSync(f)); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 582, height: 816 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('http://127.0.0.1:' + server.address().port + '/american-autumn-print/out/poster.html');
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => {
    const PX = 96 / 25.4;
    const box = el => { const b = el.getBoundingClientRect(); return { x: b.left / PX, y: b.top / PX, w: b.width / PX, h: b.height / PX }; };
    const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
    const SAFE = { x: 11, y: 11, w: 132, h: 194 };
    const inside = b => b.x >= SAFE.x && b.y >= SAFE.y && b.x + b.w <= SAFE.x + SAFE.w && b.y + b.h <= SAFE.y + SAFE.h;
    const named = (sel, name, grp) => [...document.querySelectorAll(sel)].map(el => ({ name: name(el), box: box(el), grp: grp ? grp(el) : null }));
    const blocks = named('.title h1 span', () => 'title').concat(named('.title .sub span', () => 'subtitle'), named('.foot .stats, .foot .credit, .foot .hand', el => 'footer ' + el.className));
    const labels = named('svg text.lbl', el => 'label ' + el.textContent, el => el.parentNode).concat(named('svg text.when', el => 'date ' + el.closest('.pin').dataset.at, el => el.parentNode), named('svg text.icon-note', el => 'note ' + el.textContent, el => el.parentNode));
    const icons = named('svg .icon use:nth-child(2)', el => 'icon ' + el.parentNode.dataset.id, el => el.parentNode);   // the ink drawing itself, not the group with its note
    const dots = named('svg .pin-dot', el => 'pin ' + el.closest('.pin').dataset.at).concat(named('svg .townpt circle', el => 'dot ' + el.parentNode.querySelector('text').textContent));
    const furniture = named('svg .compass', () => 'compass').concat(named('svg .scale', () => 'scale bar'));
    const CARD = { x: 10, y: 30 };
    const samples = (sel, tag) => [...document.querySelectorAll(sel)].flatMap(p => { const L = p.getTotalLength(), out = []; for (let d = 0; d <= L; d += 0.5) { const q = p.getPointAtLength(d); out.push({ tag, x: q.x + CARD.x, y: q.y + CARD.y }); } return out; });
    const route = samples('#route, #spur', 'route');
    const pin = (pt, b) => pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h;
    const out = { outside: [], clash: [], onRoad: [], crowded: [] };
    for (const b of blocks.concat(labels, icons, furniture)) if (!inside(b.box)) out.outside.push(b.name + ' ' + JSON.stringify(b.box));
    const things = labels.concat(icons, furniture);
    const kin = (a, b) => a.grp && a.grp === b.grp;   // a pin's name and its dates, an icon and its note: allowed to touch
    for (let i = 0; i < things.length; i++) for (let j = i + 1; j < things.length; j++) if (!kin(things[i], things[j]) && hit(things[i].box, things[j].box)) out.clash.push(things[i].name + ' / ' + things[j].name);
    for (const t of things) for (const d of dots) if (hit(t.box, d.box)) out.clash.push(t.name + ' / ' + d.name);
    for (const t of things) { const n = route.filter(q => pin(q, t.box)).length; if (n) out.onRoad.push(t.name + ' (' + (n / 2).toFixed(1) + ' mm)'); }
    for (let i = 0; i < things.length; i++) for (let j = i + 1; j < things.length; j++) if (!kin(things[i], things[j]) && !hit(things[i].box, things[j].box) && hit(things[i].box, things[j].box, 0.5)) out.crowded.push(things[i].name + ' / ' + things[j].name);
    out.titleW = box(document.querySelector('.title h1 span')).w;
    out.fonts = ['700 20px Caveat', '500 12px Caveat', '400 12px Gelasio', '700 12px Gelasio', 'italic 12px Gelasio', '12px "Special Elite"'].map(f => f + ':' + document.fonts.check(f));
    out.footFits = (() => { const h = document.querySelector('.foot .hand'), l = h.previousElementSibling; return h.scrollWidth <= h.clientWidth + 1 && l.getBoundingClientRect().right / PX < h.getBoundingClientRect().left / PX - 2 && l.getBoundingClientRect().height / PX < 7; })();
    out.dump = blocks.concat(labels, icons, dots, furniture).map(b => b.name.padEnd(26) + [b.box.x, b.box.y, b.box.x + b.box.w, b.box.y + b.box.h].map(n => n.toFixed(1).padStart(6)).join(' '));
    return out;
  });
  if (DUMP) console.log(r.dump.join('\n'));
  check(r.outside.length === 0, 'everything inside the safe area (11 mm in from the bleed edge)' + (r.outside.length ? ': ' + r.outside.join('; ') : ''));
  check(r.clash.length === 0, 'labels, icons, compass and scale bar clear of each other and of the dots' + (r.clash.length ? ': ' + r.clash.join('; ') : ''));
  check(r.onRoad.length === 0, 'nothing sits on the road' + (r.onRoad.length ? ': ' + r.onRoad.join('; ') : ''), true);
  check(r.crowded.length === 0, 'at least 0.5 mm between neighbours' + (r.crowded.length ? ': ' + r.crowded.join('; ') : ''), true);
  check(r.titleW <= 125, 'title width ' + r.titleW.toFixed(1) + ' mm (limit 125)');
  check(r.fonts.every(f => /true$/.test(f)), 'fonts loaded: ' + r.fonts.join(' '));
  check(r.footFits, 'the footer fits on one line each side');
  check(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join('; ') : ''));
  await browser.close(); server.close();

  console.log(fails.length ? '\nFAILED: ' + fails.length + ' hard, ' + warns.length + ' to tune' : '\nALL HARD CHECKS PASSED' + (warns.length ? ', ' + warns.length + ' to tune by hand' : ''));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
