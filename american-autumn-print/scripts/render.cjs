// out/poster.html -> out/poster-a5-bleed.pdf (154 x 216 mm, the file for the printer),
//                    out/poster-a5.pdf (148 x 210 mm, no bleed, for printing at home),
//                    out/poster-preview.png (150 dpi) and out/check-*.png (600 dpi crops).
const fs = require('fs');
const http = require('http');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium } = require('/opt/node22/lib/node_modules/playwright');

const ROOT = path.join(__dirname, '..');
const REPO = path.join(ROOT, '..');
const OUT = path.join(ROOT, 'out');
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.woff2': 'font/woff2', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };

async function serve() {
  const server = http.createServer((req, res) => {
    const u = decodeURIComponent(req.url.split('?')[0]);
    const f = path.normalize(path.join(REPO, u));
    if (!f.startsWith(REPO) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.statusCode = 404; return res.end(); }
    res.setHeader('content-type', TYPES[path.extname(f)] || 'application/octet-stream');
    res.end(fs.readFileSync(f));
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return { server, url: 'http://127.0.0.1:' + server.address().port + '/american-autumn-print/out/poster.html' };
}

async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => Promise.all([...document.images].map(i => i.decode())));
  const missing = await page.evaluate(() => [...document.images].filter(i => !i.naturalWidth).map(i => i.getAttribute('src')));
  if (missing.length) throw new Error('images failed to load: ' + missing.join(', '));
}

const mm = v => Math.round(v * 600 / 25.4);   // mm -> px at 600 dpi
const CROPS = [
  ['check-mountains', 95, 40, 50, 45],
  ['check-boston', 95, 75, 50, 40],
  ['check-hudson', 55, 100, 45, 40],
  ['check-dc', 12, 140, 45, 45]
];

(async () => {
  const { server, url } = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 582, height: 816 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { throw e; });
  await page.goto(url);
  await ready(page);
  const pdfOpts = { printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: false, timeout: 180000 };
  await page.pdf({ ...pdfOpts, width: '154mm', height: '216mm', path: path.join(OUT, 'poster-a5-bleed.pdf') });
  await page.evaluate(() => document.body.classList.add('trim-only'));
  await page.pdf({ ...pdfOpts, width: '148mm', height: '210mm', path: path.join(OUT, 'poster-a5.pdf') });
  await browser.close(); server.close();

  const bleed = path.join(OUT, 'poster-a5-bleed.pdf');
  execFileSync('pdftoppm', ['-png', '-r', '150', '-singlefile', bleed, path.join(OUT, 'poster-preview')]);
  for (const [name, x, y, w, h] of CROPS) {
    execFileSync('pdftoppm', ['-png', '-r', '600', '-singlefile', '-x', String(mm(x)), '-y', String(mm(y)), '-W', String(mm(w)), '-H', String(mm(h)), bleed, path.join(OUT, name)]);
  }
  for (const f of ['poster-a5-bleed.pdf', 'poster-a5.pdf', 'poster-preview.png'].concat(CROPS.map(c => c[0] + '.png')))
    console.log('out/' + f + ': ' + (fs.statSync(path.join(OUT, f)).size / 1048576).toFixed(2) + ' MB');
})().catch(e => { console.error(e); process.exit(1); });
