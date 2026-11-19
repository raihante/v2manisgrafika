"""Build the Manis Grafika header logos from the largest logo manisgrafika.id publishes (round 283).

Owner 2026-11-19 "perbaiki logo": the round-262 logos were cut from the 888x249 loading GIF and had a binary alpha
(0/255), so every edge was jagged. No vector logo exists on manisgrafika.id (WordPress media search "logo"/"manis",
read-only GET 2026-11-19); the largest raster is the 1920x1080 intro animation `Logo-Manis.gif`, whose last frame
holds the full logo at 1609x486 px (same 3.31 aspect as the old 744x225 files).

Input:   reference/manisgrafika/2026-11-19/logo/Logo-Manis.gif
         (https://manisgrafika.id/wp-content/uploads/2024/08/Logo-Manis.gif)
Outputs: public/assets/manisgrafika/manis-grafika-logo-teal.png   744x225, logo teal #295A63 (GIF colour)
         public/assets/manisgrafika/manis-grafika-logo-white.png  744x225, white
The output size is unchanged, so header/checkout geometry stays the same. The 1609 px frame is supersampled 4x,
softened by a sub-pixel blur and reduced with a box filter, which turns the GIF's binary edge into a smooth alpha ramp.
Run: python scripts/manisgrafika/build-logo.py   (then scripts/manisgrafika/build-favicon.py)
"""
from pathlib import Path
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
SRC = ROOT / "reference/manisgrafika/2026-11-19/logo/Logo-Manis.gif"
OUT = ROOT / "public/assets/manisgrafika"
SIZE = (744, 225)
TEAL = (41, 90, 99)

gif = Image.open(SRC)
gif.seek(gif.n_frames - 1)  # the animation ends on the complete logo
alpha = gif.convert("RGBA").getchannel("A")
alpha = alpha.crop(alpha.getbbox())  # 1609x486
print("logo frame", alpha.size)

# Fit the tight crop into the old 744x225 box (aspect 3.307 vs 3.311: centre it, at most 1 px of padding).
scale = min(SIZE[0] / alpha.width, SIZE[1] / alpha.height)
target = (round(alpha.width * scale), round(alpha.height * scale))
big = alpha.resize((alpha.width * 4, alpha.height * 4), Image.NEAREST).filter(ImageFilter.GaussianBlur(2))
small = big.resize(target, Image.BOX)
mask = Image.new("L", SIZE, 0)
mask.paste(small, ((SIZE[0] - target[0]) // 2, (SIZE[1] - target[1]) // 2))

for name, colour in (("manis-grafika-logo-teal.png", TEAL), ("manis-grafika-logo-white.png", (255, 255, 255))):
    img = Image.new("RGBA", SIZE, colour + (0,))
    img.putalpha(mask)
    img.save(OUT / name, optimize=True)
    print("wrote", name, SIZE, "alpha levels", len(set(mask.get_flattened_data())))
