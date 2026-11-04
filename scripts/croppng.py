import sys
from pathlib import Path

import pymupdf
from PIL import Image


def main(args):
    png_path = Path(args[0])
    x0 = float(args[1]); y0 = float(args[2]); x1 = float(args[3]); y1 = float(args[4])
    out = Path(args[5]) if len(args) > 5 else png_path.with_name(png_path.stem + "-crop.png")
    image = Image.open(png_path)
    box = (int(x0 * image.width), int(y0 * image.height), int(x1 * image.width), int(y1 * image.height))
    image.crop(box).save(out)
    print(out)


if __name__ == "__main__":
    main(sys.argv[1:])
