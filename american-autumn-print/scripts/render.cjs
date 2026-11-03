// out/poster.html -> out/poster-a3-bleed.pdf (303 x 426 mm, the file for the printer),
//                    out/poster-a3.pdf (297 x 420 mm, no bleed, for printing at home),
//                    out/poster-preview.png (100 dpi) and out/check-*.png (300 dpi crops).
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

const mm = v => Math.round(v * 300 / 25.4);   // mm -> px at 300 dpi
const CROPS = [
  ['check-mountains', 150, 130, 110, 110],
  ['check-boston', 150, 190, 110, 110],
  ['check-print-key', 190, 300, 100, 100],
  ['check-hudson', 90, 215, 80, 80]
];

(async () => {
  const { server, url } = await serve();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1145, height: 1610 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { throw e; });
  await page.goto(url);
  await ready(page);
  const pdfOpts = { printBackground: true, margin: { top: 0, right: 0, bottom: 0, left: 0 }, preferCSSPageSize: false, timeout: 180000 };
  await page.pdf({ ...pdfOpts, width: '303mm', height: '426mm', path: path.join(OUT, 'poster-a3-bleed.pdf') });
  await page.evaluate(() => document.body.classList.add('trim-only'));
  await page.pdf({ ...pdfOpts, width: '297mm', height: '420mm', path: path.join(OUT, 'poster-a3.pdf') });
  await browser.close(); server.close();

  const bleed = path.join(OUT, 'poster-a3-bleed.pdf');
  execFileSync('pdftoppm', ['-png', '-r', '100', '-singlefile', bleed, path.join(OUT, 'poster-preview')]);
  for (const [name, x, y, w, h] of CROPS) {
    execFileSync('pdftoppm', ['-png', '-r', '300', '-singlefile', '-x', String(mm(x)), '-y', String(mm(y)), '-W', String(mm(w)), '-H', String(mm(h)), bleed, path.join(OUT, name)]);
  }
  for (const f of ['poster-a3-bleed.pdf', 'poster-a3.pdf', 'poster-preview.png'].concat(CROPS.map(c => c[0] + '.png')))
    console.log('out/' + f + ': ' + (fs.statSync(path.join(OUT, f)).size / 1048576).toFixed(2) + ' MB');
})().catch(e => { console.error(e); process.exit(1); });
