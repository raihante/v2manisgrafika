import sys
from pathlib import Path

import pymupdf


def main(args):
    pdf_path = Path(args[0])
    zoom = float(args[1]) if len(args) > 1 else 3.0
    doc = pymupdf.open(pdf_path)
    out_dir = pdf_path.with_suffix("")
    out_dir.mkdir(parents=True, exist_ok=True)
    for page in doc:
        pix = page.get_pixmap(matrix=pymupdf.Matrix(zoom, zoom))
        out = out_dir / f"page-{page.number + 1}.png"
        pix.save(out)
        print(out)


if __name__ == "__main__":
    main(sys.argv[1:])
