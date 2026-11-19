"""Build the Manis Grafika app icons from the teal logo (round 277).

Crops the "MNS" monogram (left part of public/assets/manisgrafika/manis-grafika-logo-teal.png, itself built by
scripts/manisgrafika/build-logo.py from the 1920 px manisgrafika.id logo GIF, round 283), centres it on a white rounded tile (readable on light and dark browser tabs) and
writes the Next.js icon file conventions:
  src/app/favicon.ico   16/32/48 px
  src/app/icon.png      512 px
  src/app/apple-icon.png 180 px (full white square; iOS rounds the corners itself)
Replace with icons cut from the client's vector logo once it arrives. Run: python scripts/manisgrafika/build-favicon.py
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
logo = Image.open(ROOT / "public/assets/manisgrafika/manis-grafika-logo-teal.png").convert("RGBA")
alpha = logo.getchannel("A")
w, h = logo.size

# The monogram ends at the first wide run of empty columns (the gap before the "Manis Grafika" wordmark).
cols = [any(alpha.getpixel((x, y)) > 20 for y in range(h)) for x in range(w)]
end, gap = None, 0
for x, filled in enumerate(cols):
    gap = 0 if filled else gap + 1
    if gap >= 20 and any(cols[:x]):
        end = x - gap + 1
        break
mark = logo.crop((0, 0, end, h))
mark = mark.crop(mark.getchannel("A").getbbox())
print("monogram bbox", mark.size, "end column", end)


def tile(size: int, radius_ratio: float, pad_ratio: float, source: Image.Image = mark) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    ImageDraw.Draw(img).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * radius_ratio), fill=(255, 255, 255, 255))
    inner = int(size * (1 - 2 * pad_ratio))
    m = source.copy()
    m.thumbnail((inner, inner), Image.LANCZOS)
    img.alpha_composite(m, ((size - m.width) // 2, (size - m.height) // 2))
    return img


tile(512, 0.18, 0.12).save(ROOT / "src/app/icon.png", optimize=True)
tile(180, 0.0, 0.14).convert("RGB").save(ROOT / "src/app/apple-icon.png", optimize=True)
# Small sizes: thicker strokes (alpha dilated) and less padding so the mark stays legible at 16 px.
bold = Image.new("RGBA", (mark.width + 20, mark.height + 20), (0, 0, 0, 0))
bold.alpha_composite(mark, (10, 10))
r, g, b, a = bold.split()
bold = Image.merge("RGBA", (Image.new("L", bold.size, 0x2B), Image.new("L", bold.size, 0x58), Image.new("L", bold.size, 0x65), a.filter(ImageFilter.MaxFilter(13))))
ico = tile(256, 0.18, 0.04, bold)
ico.save(ROOT / "src/app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
print("wrote src/app/favicon.ico, icon.png, apple-icon.png")
