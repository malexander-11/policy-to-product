// Checks on the composed page (in Chromium) and on the rendered PDFs (with poppler).
// Hard failures exit non-zero; soft ones are listed as warnings to tune by hand.
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
const DOM_ONLY = process.argv.includes('--dom');   // skip the PDF checks while tuning the layout
const DUMP = process.argv.includes('--dump');     // print every measured box

(async () => {
  // ---- the PDFs ----
  if (!DOM_ONLY) {
  console.log('PDFs');
  const bleed = path.join(OUT, 'poster-a3-bleed.pdf'), trim = path.join(OUT, 'poster-a3.pdf');
  for (const [f, w, h] of [[bleed, 858.9, 1207.56], [trim, 841.89, 1190.55]]) {
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
  const imgs = run('pdfimages', ['-list', bleed]).split('\n').slice(2).filter(l => /\bimage\b/.test(l)).map(l => l.trim().split(/\s+/));
  const dims = imgs.map(c => [+c[3], +c[4], c[8]]);
  const small = dims.filter(d => Math.max(d[0], d[1]) < 1000);
  check(dims.length >= 9 && small.length === 0, dims.length + ' photos in the PDF, ' + dims.map(d => d[0] + 'x' + d[1] + ' ' + d[2]).join(', '));
  const size = fs.statSync(bleed).size / 1048576;
  check(size < 25, 'file size ' + size.toFixed(1) + ' MB');
  }

  // ---- the page itself ----
  console.log('Page');
  const server = http.createServer((req, res) => { const f = path.normalize(path.join(REPO, decodeURIComponent(req.url.split('?')[0]))); if (!f.startsWith(REPO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); } res.end(fs.readFileSync(f)); });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1145, height: 1610 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('http://127.0.0.1:' + server.address().port + '/american-autumn-print/out/poster.html');
  await page.evaluate(() => document.fonts.ready);
  const r = await page.evaluate(() => {
    const PX = 96 / 25.4;
    const box = el => { const b = el.getBoundingClientRect(); return { x: b.left / PX, y: b.top / PX, w: b.width / PX, h: b.height / PX }; };
    const hit = (a, b, pad = 0) => a.x < b.x + b.w + pad && b.x < a.x + a.w + pad && a.y < b.y + b.h + pad && b.y < a.y + a.h + pad;
    const SAFE = { x: 13, y: 13, w: 277, h: 400 };
    const inside = b => b.x >= SAFE.x && b.y >= SAFE.y && b.x + b.w <= SAFE.x + SAFE.w && b.y + b.h <= SAFE.y + SAFE.h;
    const named = (sel, name) => [...document.querySelectorAll(sel)].map(el => ({ name: name(el), box: box(el) }));
    const prints = named('.print', el => 'print ' + el.querySelector('.cap').textContent.slice(0, 24));
    // a point-in-print test that honours the print's rotation (the bounding box is only an over-estimate)
    const sheet = document.querySelector('.sheet').getBoundingClientRect();
    for (const p of document.querySelectorAll('.print')) {
      const deg = parseFloat((/rotate\(([-\d.]+)deg\)/.exec(p.style.transform) || [0, 0])[1]) || 0;
      const r = { x: p.offsetLeft / PX + sheet.left / PX, y: p.offsetTop / PX + sheet.top / PX, w: p.offsetWidth / PX, h: p.offsetHeight / PX };
      const cx = r.x + r.w / 2, cy = r.y + r.h / 2, a = -deg * Math.PI / 180;
      const idx = [...document.querySelectorAll('.print')].indexOf(p);
      prints[idx].inside = q => { const lx = q.x - cx, ly = q.y - cy, x = lx * Math.cos(a) - ly * Math.sin(a), y = lx * Math.sin(a) + ly * Math.cos(a); return Math.abs(x) <= r.w / 2 && Math.abs(y) <= r.h / 2; };
    }
    const blocks = prints.concat(named('.key', () => 'key'), named('.quote', el => 'note ' + el.querySelector('.q').textContent.slice(0, 20)), named('.title h1 span', () => 'title'), named('.foot', () => 'footer'));
    const labels = named('svg text.lbl', el => 'label ' + el.textContent);
    const marks = named('svg .pin-dot, svg .badge', el => 'pin ' + el.closest('.pin').dataset.n).concat(named('svg .icon', el => 'icon ' + el.dataset.id));
    const svg = document.querySelector('.card svg'), CARD = { x: 16, y: 54 };
    const samples = (sel, tag) => [...document.querySelectorAll(sel)].flatMap(p => { const L = p.getTotalLength(), out = []; for (let d = 0; d <= L; d += 1) { const q = p.getPointAtLength(d); out.push({ tag, x: q.x + CARD.x, y: q.y + CARD.y }); } return out; });
    const route = samples('#route, #spur', 'route'), leaders = samples('.leader', 'leader');
    const pin = (pt, b) => pt.x >= b.x && pt.x <= b.x + b.w && pt.y >= b.y && pt.y <= b.y + b.h;
    const out = { outside: [], overPinOrIcon: [], overLabel: [], routeUnder: [], leaderUnder: [], labelClash: [] };
    for (const b of blocks.concat(labels)) if (!inside(b.box)) out.outside.push(b.name + ' ' + JSON.stringify(b.box));
    for (const p of blocks) {
      for (const m of marks) if (hit(p.box, m.box, 0.5)) out.overPinOrIcon.push(p.name + ' covers ' + m.name);
      for (const l of labels) if (hit(p.box, l.box, 0.3)) out.overLabel.push(p.name + ' covers ' + l.name);
    }
    for (const p of blocks) {
      const under = route.filter(q => pin(q, p.box)).length; if (under) out.routeUnder.push(p.name + ': ' + under + ' mm of route');
      if (!/^print|^key/.test(p.name)) continue;
      const lu = leaders.filter(q => p.inside ? p.inside(q) : pin(q, p.box)).length; if (lu > 3) out.leaderUnder.push(p.name + ': ' + lu + ' mm of leader');
    }
    for (let i = 0; i < labels.length; i++) for (let j = i + 1; j < labels.length; j++) if (hit(labels[i].box, labels[j].box)) out.labelClash.push(labels[i].name + ' / ' + labels[j].name);
    for (const l of labels) for (const m of marks) if (!m.name.startsWith('pin') && hit(l.box, m.box)) out.labelClash.push(l.name + ' / ' + m.name);
    out.titleW = box(document.querySelector('.title h1 span')).w;
    out.dump = blocks.concat(labels, marks).map(b => b.name.padEnd(34) + [b.box.x, b.box.y, b.box.x + b.box.w, b.box.y + b.box.h].map(n => n.toFixed(1).padStart(6)).join(' '));
    out.fonts = ['700 20px Caveat', '500 12px Caveat', '400 12px Gelasio', '700 12px Gelasio', 'italic 12px Gelasio', '12px "Special Elite"'].map(f => f + ':' + document.fonts.check(f));
    out.keyFits = (() => { const k = document.querySelector('.key'), kb = k.getBoundingClientRect(), ob = k.querySelector('ol').getBoundingClientRect(); const pb = parseFloat(getComputedStyle(k).paddingBottom); return ob.bottom <= kb.bottom - pb + 1 && [...k.querySelectorAll('.where,.when')].every(e => e.scrollWidth <= e.clientWidth + 1); })();
    out.capsFit = [...document.querySelectorAll('.print figcaption')].map(c => c.scrollHeight <= c.clientHeight + 1 && c.querySelector('.day').scrollWidth <= c.clientWidth + 1);
    return out;
  });
  if (DUMP) console.log(r.dump.join('\n'));
  check(r.outside.length === 0, 'everything inside the safe area (13 mm in from the bleed edge)' + (r.outside.length ? ': ' + r.outside.join('; ') : ''));
  check(r.overPinOrIcon.length === 0, 'no print, note or key covers a pin, badge or icon' + (r.overPinOrIcon.length ? ': ' + r.overPinOrIcon.join('; ') : ''));
  check(r.overLabel.length === 0, 'no print, note or key covers a place label' + (r.overLabel.length ? ': ' + r.overLabel.join('; ') : ''), true);
  check(r.routeUnder.length === 0, 'the road runs under nothing' + (r.routeUnder.length ? ': ' + r.routeUnder.join('; ') : ''), true);
  check(r.leaderUnder.length === 0, 'leaders cross no print or key' + (r.leaderUnder.length ? ': ' + r.leaderUnder.join('; ') : ''), true);
  check(r.labelClash.length === 0, 'labels clear of each other and of icons' + (r.labelClash.length ? ': ' + r.labelClash.join('; ') : ''), true);
  check(r.titleW <= 250, 'title width ' + r.titleW.toFixed(1) + ' mm (limit 250)');
  check(r.fonts.every(f => /true$/.test(f)), 'fonts loaded: ' + r.fonts.join(' '));
  check(r.keyFits, 'the key fits its note without clipping');
  check(r.capsFit.every(Boolean), 'every caption fits its strip (' + r.capsFit.filter(Boolean).length + '/' + r.capsFit.length + ')');
  check(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join('; ') : ''));
  await browser.close(); server.close();

  console.log(fails.length ? '\nFAILED: ' + fails.length + ' hard, ' + warns.length + ' to tune' : '\nALL HARD CHECKS PASSED' + (warns.length ? ', ' + warns.length + ' to tune by hand' : ''));
  process.exit(fails.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
