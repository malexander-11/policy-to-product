# Matt & Billy's American Autumn — the A5 print

A small gift print of the road trip from Washington DC to Boston (27 Sept – 10 Oct 2026): an
accurate map of the Northeast in the scrapbook's paper style, the drive as a highlighted dashed road,
the seven places we slept with their dates, the places we passed through, and eleven small drawn
icons. Nothing else — it is meant to be simple.

Everything is built from source in this folder, so any label, date or icon can be changed and the
print re-rendered. (An earlier, busier A3 version with photos is in the git history.)

## The files to send to a printer

| File | Size | Use |
|---|---|---|
| `out/poster-a5-bleed.pdf` | 154 × 216 mm | **Send this one.** A5 with 3 mm bleed on every side; the page colour runs off the edge so there is no white sliver after trimming. Ask for "A5, trim to 148 × 210, 3 mm bleed included". |
| `out/poster-a5.pdf` | 148 × 210 mm | Exact A5 with no bleed, for a printer that asks for the finished size, or to print at home on A4 and trim. |
| `out/poster-preview.png` | 150 dpi | A quick look; the PDFs are vector and far sharper. |

Notes for a UK print shop:

- Portrait A5, single sided, all vector (fonts embedded, no photos), so any digital press handles it.
  Everything important sits at least 8 mm inside the trim.
- The page is a warm cream (`#FCF8EE`), printed as a colour. A 300 gsm uncoated or lightly textured
  white card looks most like the scrapbook. If you would rather have the cream come from the stock
  itself, the page background can be made white instead.
- Chromium rounds the page size to whole pixels, so the files measure 154.2 × 216.2 mm and
  148.2 × 210.2 mm; the extra 0.2 mm is in the bleed and does not matter.

## How it is made

```
scripts/fetch-geodata.cjs   downloads the two Natural Earth files into geodata/ (git-ignored, ~48 MB)
scripts/project.cjs         geodata + data/route.json + data/places.json -> data/map-paths.json, data/placed.json
scripts/compose.cjs         data + template/ + icons/ + fonts/ -> out/poster.html
scripts/render.cjs          out/poster.html -> the two PDFs, the preview PNG and 600 dpi check crops
scripts/verify.cjs          checks the PDFs (size, fonts, nothing rasterised) and the page (nothing overlaps or sits on the road)
scripts/build.cjs           runs the four steps above in order
```

To rebuild after editing anything:

```
cd american-autumn-print
node scripts/build.cjs
```

While tuning label positions, the quick loop is
`node scripts/project.cjs && node scripts/compose.cjs && node scripts/verify.cjs --dom --dump`,
which prints every label's and icon's box in page millimetres and the clashes.

`data/map-paths.json` and `data/placed.json` are committed, so the build works without the raw
geodata; `project.cjs` only runs when `geodata/` is present. To change the map's extent, the
projection or a place's coordinates, download the data first with `node scripts/fetch-geodata.cjs`,
which fetches `ne_10m_admin_1_states_provinces_lakes.geojson` and
`ne_10m_rivers_lake_centerlines.geojson` from the Natural Earth GitHub mirror and checks their size
and sha256 against `data/geodata.lock.json`. (The files are only ever parsed as JSON.)

Requirements: Node 22, the Playwright + Chromium that lives at
`/opt/node22/lib/node_modules/playwright`, and poppler (`pdftoppm`, `pdfinfo`, `pdffonts`,
`pdfimages`) on the PATH. No npm install.

### What lives where

- `data/route.json` — every waypoint's latitude/longitude: `main` (the drive), `spur` (the Cog
  Railway loop) and `extra` (context towns).
- `data/places.json` — the seven stops (label, dates, label offsets in mm), the places on the way,
  context towns, state names, the ocean label, the icons and the compass/scale bar. This is the file
  to edit when a label or icon needs nudging.
- `template/poster.html`, `template/poster.css` — the page; all sizes in mm on the 154 × 216 sheet.
- `icons/*.svg` — original 24 × 24 line drawings (`class="rust"` = the rust accent, `fill-rust` = filled).
  Placed: Capitol dome, cannon, blast furnace, the red Jeep, cadet cap, guitar, hockey stick, Cog
  locomotive, ox, lobster, lighthouse. Drawn but unplaced: coffee cup, hiking boot, obelisk, mailboat,
  tricorn, pizza, anchor.
- `fonts/` — latin subsets of Caveat, Gelasio and Special Elite (SIL Open Font License, `OFL.txt`).

### The map

Natural Earth 1:10m states/provinces (with lakes) and rivers, drawn in a Lambert conformal conic
projection (standard parallels 38° and 45°, central meridian 73.1° W) at 1:5,000,000, so 100 miles
is 32.2 mm on the page. Coastline and state borders are told apart by counting how many polygons
share each edge. Natural Earth data is public domain.
