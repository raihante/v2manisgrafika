"""Score pilot targets against source per width.
Usage: python score.py <shots-dir> <width,...> <target,...>
For each target+width: runs clone-website eval_score.py (full page) and a PDP-region pixel diff
(breadcrumbs top -> main-product bottom, aligned at breadcrumbs top). Writes summary.json + diff PNGs.
"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageChops

SCORER = Path(r"C:/Users/Reihan/.codex/skills/clone-website/scripts/eval_score.py")
d = Path(sys.argv[1]); widths = sys.argv[2].split(","); targets = sys.argv[3].split(",")
out = {}

def region(probe):
    c, m = probe["region"]["crumbs"], probe["region"]["main"]
    top = (c or m)["y"]; bottom = m["y"] + m["h"]
    return top, bottom

for w in widths:
    sj = json.load(open(d / f"source-{w}.json", encoding="utf8"))
    simg = Image.open(d / f"source-{w}.png").convert("L")
    for t in targets:
        key = f"{t}-{w}"
        cj = json.load(open(d / f"{key}.json", encoding="utf8"))
        sc_dir = d / f"score-{key}"
        sc_dir.mkdir(exist_ok=True)
        subprocess.run([sys.executable, str(SCORER), str(d / f"source-{w}.json"), str(d / f"{key}.json"),
                        "--shots", str(d / f"source-{w}.png"), str(d / f"{key}.png"), "--out", str(sc_dir)],
                       capture_output=True, text=True)
        card = json.load(open(sc_dir / "scorecard.json", encoding="utf8"))
        # Region diff
        cimg = Image.open(d / f"{key}.png").convert("L")
        st, sb = region(sj); ct, cb = region(cj)
        sh, ch = sb - st, cb - ct
        h = min(sh, ch)
        width = min(simg.width, cimg.width)
        a = simg.crop((0, st, width, st + h)); b = cimg.crop((0, ct, width, ct + h))
        diff = ImageChops.difference(a, b)
        px = list(diff.get_flattened_data()) if hasattr(diff, "get_flattened_data") else list(diff.getdata())
        n = len(px)
        mad = sum(px) / n
        changed = sum(1 for p in px if p > 32) / n * 100
        # band MAD (24 bands)
        bands = []
        for i in range(24):
            y0, y1 = int(h * i / 24), int(h * (i + 1) / 24)
            bd = list(diff.crop((0, y0, width, y1)).getdata())
            bands.append(round(sum(bd) / max(len(bd), 1), 1))
        vis = Image.new("RGB", (width * 3, h))
        vis.paste(a.convert("RGB"), (0, 0)); vis.paste(b.convert("RGB"), (width, 0))
        vis.paste(diff.point(lambda p: 255 if p > 32 else p * 4).convert("RGB"), (width * 2, 0))
        vis.save(d / f"region-{key}.png")
        out[key] = {
            "eval_total": card.get("total"), "eval_pass": card.get("pass"),
            "dims": card.get("scores", {}), "failing": card.get("failing_dimensions"),
            "pageH": [sj["pageH"], cj["pageH"]],
            "region_h": [sh, ch], "region_mad": round(mad, 2), "region_changed_pct": round(changed, 2), "region_bands": bands,
        }
        print(key, json.dumps({k: out[key][k] for k in ("eval_total", "eval_pass", "pageH", "region_h", "region_mad", "region_changed_pct")}), json.dumps(out[key]["dims"]))
json.dump(out, open(d / "summary.json", "w"), indent=2)
