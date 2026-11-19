"""Build the Manis Grafika homepage sections (rebrand step 4, owner decisions 2026-11-17: BTV layout unchanged).

Inputs:  public/assets/manisgrafika/*            manisgrafika.id photos (scripts/manisgrafika/download-assets.mjs, plus the
                                                 2026-11-17 downloads: Website-Tengah-scaled, Website-Kiri/Kanan-1/2 originals)
         public/assets/manisgrafika/instagram/   @manisgrafika feed (12 posts visible logged out, ego-browser 2026-11-17)
         reference/manisgrafika/2026-11-17/instagram-downloads.json   post URL per downloaded image
Outputs: public/assets/manisgrafika/home/*.webp  hero and promotion images cut to the BTV slot sizes
         src/data/homepage.json                  `categoryHero`, `promotions`, `social`, `source`, `capturedAt`
                                                 (rails stay with build-catalog.mjs; footer/newsletter with build-shell.mjs)
Run:     python scripts/manisgrafika/build-homepage.py   (after build-catalog.mjs and build-shell.mjs)

Slot sizes are the BTV ones so the layout does not move: category hero 1920x964 desktop / 900x1042 mobile, promotion
1920x1175 desktop / 1200x899 mobile (srcset 352, 832, 1200). Manis Grafika photos are portrait, so desktop slots show
one Instagram photo cropped to fill the slot (owner 2026-11-17: no side-by-side grid, images from Instagram).
"""
import json
import os
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
MG = os.path.join(ROOT, "public", "assets", "manisgrafika")
OUT = os.path.join(MG, "home")
WEB = "/assets/manisgrafika"
os.makedirs(OUT, exist_ok=True)


def load(name):
    return Image.open(os.path.join(MG, name)).convert("RGB")


def cover(im, w, h, focus_y=0.5):
    """Scale to cover w x h, crop centred horizontally and at focus_y vertically."""
    scale = max(w / im.width, h / im.height)
    rw, rh = round(im.width * scale), round(im.height * scale)
    im = im.resize((rw, rh), Image.LANCZOS)
    left = (rw - w) // 2
    top = round((rh - h) * focus_y)
    return im.crop((left, top, left + w, top + h))


def save(im, name):
    im.save(os.path.join(OUT, name), "WEBP", quality=86, method=6)
    return f"{WEB}/home/{name}"


# ---- Hero + promotion images from the @manisgrafika Instagram posts (owner 2026-11-17: "cari gambarnya diinstagram") ----
# Sources: 1080x1350 post images (reference/manisgrafika/2026-11-17/instagram-hires/, list in instagram-hires.json).
# Most posts carry caption text burnt into the image, so every slot is cropped inside a text-free row band [y0, y1].
# Customer memorial cards with readable names are kept out: ig-hires-06, -14 and -27 are not used, and the bands of
# ig-hires-17 and -29 stop above the card on the box.
IG = os.path.join(ROOT, "reference", "manisgrafika", "2026-11-17", "instagram-hires")
IG_META = {os.path.basename(m["file"]): m for m in json.load(open(os.path.join(ROOT, "reference", "manisgrafika", "2026-11-17", "instagram-hires.json"), encoding="utf8"))}


def ig(n):
    return Image.open(os.path.join(IG, f"ig-hires-{n:02d}.jpg")).convert("RGB")


def crop_in(im, w, h, y0, y1, fy=0.5):
    """Largest w:h box inside rows [y0, y1], centred horizontally, placed at fy, scaled to w x h."""
    ch = y1 - y0
    cw = round(ch * w / h)
    if cw > im.width:
        cw = im.width
        ch = round(cw * h / w)
    x = (im.width - cw) // 2
    y = y0 + round((y1 - y0 - ch) * fy)
    return im.crop((x, y, x + cw, y + ch)).resize((w, h), Image.LANCZOS)


def ig_source(n):
    return f"Instagram @manisgrafika {IG_META[f'ig-hires-{n:02d}.jpg']['post']} (image {n:02d})"


HERO = [  # (label, Instagram image no., text-free rows y0..y1, vertical placement, mobile y1 when the taller crop needs less)
    ("Terbaru", 19, 0, 1040, 0.35, None),
    ("Hardcover", 28, 0, 1040, 0.3, None),
    ("Dompet", 24, 270, 1350, 0.6, None),
    ("Mika", 17, 0, 990, 0.55, 830),
    ("Tasbih", 29, 0, 930, 0.5, 740),
]
# Each title links to its collection, as on the source (round 286, owner "setiap category ada link nya").
HERO_HREF = {"Terbaru": "/collections/new-in"}
category_hero = []
for label, n, y0, y1, fy, my1 in HERO:
    slug = label.lower()
    im = ig(n)
    category_hero.append({
        "label": label,
        "href": HERO_HREF.get(label, f"/collections/{slug}"),
        "image": save(crop_in(im, 1920, 964, y0, y1, fy), f"hero-{slug}-desktop.webp"),
        "mobileImage": save(crop_in(im, 900, 1042, y0, my1 or y1, fy), f"hero-{slug}-mobile.webp"),
        "sourceImage": ig_source(n),
    })

PROMO = [  # (slug, Instagram image no., text-free rows, vertical placement, link)
    ("terbaru", 1, 0, 790, 0.4, "/collections/new-in"),
    ("paket", 5, 0, 1000, 0.45, "/collections/paket"),
    ("hardcover", 23, 0, 1100, 0.4, "/collections/hardcover"),
]
promotions = []
for slug, n, y0, y1, fy, href in PROMO:
    im = ig(n)
    desktop = crop_in(im, 1920, 1175, y0, y1, fy)
    mobile = crop_in(im, 1200, 899, y0, y1, fy)
    srcset = []
    for w in (352, 832, 1200):
        small = mobile if w == 1200 else mobile.resize((w, round(899 * w / 1200)), Image.LANCZOS)
        srcset.append(f"{save(small, f'promo-{slug}-mobile-{w}.webp')} {w}w")
    promotions.append({
        "image": save(desktop, f"promo-{slug}-desktop.webp"),
        "mobileImage": f"{WEB}/home/promo-{slug}-mobile-1200.webp",
        "mobileSrcSet": ", ".join(srcset),
        "href": href,
        "sourceImage": ig_source(n),
    })

# ---- Social section (@manisgrafika) -----------------------------------------------------------------------------------
downloads = json.load(open(os.path.join(ROOT, "reference", "manisgrafika", "2026-11-17", "instagram-downloads.json"), encoding="utf8"))
feed = [d["file"] for d in downloads]
social = {
    "titleLines": ["MANIS", "GRAFIKA"],
    "subtitle": "Momen berharga bersama buku Yasin dan paket hadiah kami. Ikuti kami di ",
    "instagramHandle": "@manisgrafika",
    "instagramUrl": "https://www.instagram.com/manisgrafika/",
    "feedImages": feed,
    "feedLinks": [d["post"] for d in downloads],
    "feedLoops": 1,
    "images": feed,
    "feedSnapshot": "2026-11-17 (instagram.com/manisgrafika, logged out: 12 most recent posts; ego-browser, reference/manisgrafika/2026-11-17/instagram-downloads.json)",
}

path = os.path.join(ROOT, "src", "data", "homepage.json")
homepage = json.load(open(path, encoding="utf8"))
homepage["source"] = "https://manisgrafika.id/ (Manis Grafika rebrand)"
homepage["capturedAt"] = "2026-11-17"
homepage["categoryHero"] = category_hero
homepage["promotions"] = promotions
homepage["social"] = social
with open(path, "w", encoding="utf8", newline="\n") as f:
    f.write(json.dumps(homepage, indent=1, ensure_ascii=False) + "\n")
print(f"hero {len(category_hero)} slides, promotions {len(promotions)}, feed {len(feed)} posts")
