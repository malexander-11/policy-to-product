# Matt & Billy's American Autumn — the A3 print

A gift print of the road trip from Washington DC to Boston (27 Sept – 10 Oct 2026): an accurate
map of the Northeast in the scrapbook's paper style, the route as a highlighted dashed line, the
seven places we slept as numbered pins with a "Where we slept" key, nine photos taped on as
prints, a dozen small drawn icons, and a few handwritten lines from the diary.

Everything is built from source in this folder, so any caption, photo or position can be changed
and the print re-rendered.

## The files to send to a printer

| File | Size | Use |
|---|---|---|
| `out/poster-a3-bleed.pdf` | 303 × 426 mm | **Send this one.** A3 with 3 mm bleed on every side; the page colour runs off the edge so there is no white sliver after trimming. Ask for "A3, trim to 297 × 420, 3 mm bleed included". |
| `out/poster-a3.pdf` | 297 × 420 mm | Exact A3 with no bleed, for a printer that asks for the finished size or for printing at home. |
| `out/poster-preview.png` | 100 dpi | A quick look. It is a low-resolution raster, so it looks softer than the real print; the PDFs are vector with the photos embedded at full size (about 635 dpi on the page). |

Notes for a UK print shop:

- Portrait A3. Everything important sits at least 10 mm inside the trim (13 mm inside the bleed
  edge), so a slightly off-centre trim is fine.
- The page is a warm cream (`#FCF8EE`), printed as a colour. Printing on a white, uncoated or
  lightly textured 200–300 gsm stock will look most like the scrapbook. If you would rather have
  the cream come from the paper itself, say so and the page background can be made white.
- Chromium rounds the page size to whole pixels, so the bleed file measures 303.4 × 426.1 mm
  and the trim file 297.0 × 420.2 mm; the extra 0.2–0.4 mm sits in the bleed and does not matter.
- Fonts are embedded and the photos are the original JPEGs, so nothing needs supplying with the PDF.

## How it is made

```
scripts/fetch-geodata.cjs   downloads the two Natural Earth files into geodata/ (git-ignored, ~48 MB)
scripts/project.cjs         geodata + data/route.json + data/places.json -> data/map-paths.json, data/placed.json
scripts/compose.cjs         data + template/ + icons/ + fonts/ -> out/poster.html
scripts/render.cjs          out/poster.html -> the two PDFs, the preview PNG and 300 dpi check crops
scripts/verify.cjs          checks the PDFs (size, fonts, photos) and the page (nothing overlaps, everything fits)
scripts/build.cjs           runs the four steps above in order
```

To rebuild after editing anything:

```
cd american-autumn-print
node scripts/build.cjs
```

`data/map-paths.json` and `data/placed.json` are committed, so the build works without the raw
geodata; `project.cjs` only runs when `geodata/` is present. To change the map's extent, the
projection or a place's coordinates, download the data first:

```
node scripts/fetch-geodata.cjs
```

That fetches `ne_10m_admin_1_states_provinces_lakes.geojson` and
`ne_10m_rivers_lake_centerlines.geojson` from the Natural Earth GitHub mirror and checks their
size and sha256 against `data/geodata.lock.json`. (The files are only ever parsed as JSON.)

Requirements: Node 22, the Playwright + Chromium that lives at
`/opt/node22/lib/node_modules/playwright`, and poppler (`pdftoppm`, `pdfinfo`, `pdffonts`,
`pdfimages`) on the PATH. No npm install.

### What lives where

- `data/route.json` — every waypoint's latitude/longitude: `main` (the drive), `spur` (the Cog
  Railway loop) and `extra` (context towns).
- `data/places.json` — the pins (hotel, dates, badge and label offsets in mm), town and context
  labels, state names, the ocean label, the icons and the compass/scale bar. This is the file to
  edit when a label or icon needs nudging.
- `data/prints.json` — the nine photos: which scrapbook photo (`public/scrapbook-media/<hex>-f.jpg`),
  caption, day line, position, width, tilt and which place the dotted leader points at. Two
  alternates (Portland Head Light, the TD Garden) are listed with `"placed": false`.
- `data/quotes.json` — the handwritten diary lines.
- `template/poster.html`, `template/poster.css` — the page; all sizes in mm on the 303 × 426 sheet.
- `icons/*.svg` — original 24 × 24 line drawings (`class="rust"` = the rust accent, `fill-rust` = filled).
- `fonts/` — latin subsets of Caveat, Gelasio and Special Elite (SIL Open Font License, `OFL.txt`).

### The map

Natural Earth 1:10m states/provinces (with lakes) and rivers, drawn in a Lambert conformal conic
projection (standard parallels 38° and 45°, central meridian 73.1° W) at 1:3,200,000, so
100 miles is 50.3 mm on the page. Coastline and state borders are told apart by counting how
many polygons share each edge. Natural Earth data is public domain.
