"""Typographic page banners for Manis Grafika (rebrand step 5), replacing the BTV FAQ / Contact Us GIF artwork.

Same pixel sizes as the BTV images so the page layout does not move: FAQ header 1550x1000, contact header 1600x500.
Font: Everett (owner choice, public/fonts); colours: logo teal #2B5865 on white, light-teal rule.
Run: python scripts/manisgrafika/build-page-banners.py
"""
import os
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "public", "assets", "manisgrafika", "pages")
os.makedirs(OUT, exist_ok=True)
TEAL = (43, 88, 101)
LIGHT = (159, 208, 216)
MEDIUM = os.path.join(ROOT, "public", "fonts", "Everett-Medium.woff")
LIGHT_FONT = os.path.join(ROOT, "public", "fonts", "Everett-Light.woff")


def banner(path, size, title, subtitle, title_px, sub_px):
    w, h = size
    im = Image.new("RGB", size, (255, 255, 255))
    d = ImageDraw.Draw(im)
    tf = ImageFont.truetype(MEDIUM, title_px)
    sf = ImageFont.truetype(LIGHT_FONT, sub_px)
    tb = d.textbbox((0, 0), title, font=tf, anchor="ls")
    sb = d.textbbox((0, 0), subtitle, font=sf, anchor="ls")
    gap = round(max(sub_px * 1.9, title_px * 0.5))  # room for descenders (g, Q) and the accent rule
    block = (tb[3] - tb[1]) + gap + (sb[3] - sb[1])
    top = (h - block) / 2
    title_base = top - tb[1]
    d.text((w / 2, title_base), title, font=tf, fill=TEAL, anchor="ms")
    rule_y = round(title_base + title_px * 0.3)
    d.line((w / 2 - sub_px * 2, rule_y, w / 2 + sub_px * 2, rule_y), fill=LIGHT, width=max(3, sub_px // 10))
    d.text((w / 2, title_base + gap - sb[1]), subtitle, font=sf, fill=TEAL, anchor="ms")
    im.save(path, "WEBP", quality=90, method=6)
    return path


banner(os.path.join(OUT, "faq-header.webp"), (1550, 1000), "FAQ", "Pertanyaan yang sering diajukan", 360, 64)
banner(os.path.join(OUT, "hubungi-kami-header.webp"), (1600, 500), "Hubungi Kami", "Kami siap membantu pesanan Anda", 170, 46)
print("banners written to", OUT)
