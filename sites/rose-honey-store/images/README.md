# Image manifest — Rose & Honey Stitch Co.

Every photo the site expects. Until a real file is dropped in, the page renders a labeled
placeholder box in its place, so nothing breaks and you can see exactly what goes where.
Drop the real files into this folder with these **exact names** and they appear with no
code change.

| Filename | Purpose | Recommended size |
|---|---|---|
| `hero.jpg` | Home hero — a beautiful finished piece, styled & well-lit | ~1600×1200 (4:3) |
| `world-apparel.jpg` | Home "what we make" — apparel card | ~1200×900 |
| `world-monogram.jpg` | Home "what we make" — monogram/home card | ~1200×900 |
| `world-baby.jpg` | Home "what we make" — baby/gift card | ~1200×900 |
| `gallery-1.jpg` … `gallery-3.jpg` | Home recent-work teaser (square crops) | ~900×900 |
| `gallery-apparel-1..3.jpg` | Gallery — Apparel category | ~900×900 |
| `gallery-mono-1..3.jpg` | Gallery — Monograms & Home category | ~900×900 |
| `gallery-baby-1..3.jpg` | Gallery — Baby & Gifts category | ~900×900 |
| `team-order.jpg` | Services — teams/bulk section | ~1280×800 (16:10) |
| `founder.jpg` | About — portrait of the maker | ~800×1000 (4:5 portrait) |
| `og-image.jpg` | Social share preview (Open Graph) | **1200×630 exactly** |
| `favicon.png` | Browser tab icon | 512×512 (square) |

Notes:
- **Use real photography for anything showing people** (the `founder.jpg` portrait). Don't
  fill it with an AI image unless you choose to.
- Square gallery shots look best shot square or center-cropped to 1:1.
- Export JPEG (or WebP) around 80% quality and keep each file under ~300KB so pages stay
  fast on mobile.
- `og-image.jpg` must be exactly 1200×630; social platforms crop anything else.
- Match the filename exactly, including case — the markup references these literal names.
- The gallery shows however many tiles you build; to add or remove pieces, copy a
  `<figure class="item cat-...">` block in `gallery.html` and point it at a new filename.
