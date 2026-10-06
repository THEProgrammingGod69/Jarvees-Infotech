"""
Font pipeline. Builds the three self-hosted web fonts in src/fonts/ from the
upstream variable fonts (SIL Open Font License, github.com/google/fonts):

    python3 -m pip install fonttools brotli
    python3 scripts/subset-fonts.py

Each family becomes ONE small variable WOFF2 that contains exactly the
characters this site uses — Latin, punctuation, the rupee sign, arrows and the
few Greek letters on the programme page — limited to the weights the design
uses. Google's own subsets split Latin and "Latin extended" apart, and the
rupee sign (U+20B9) lives in the extended half, so every page showing a
price downloaded an extra 114 KB file for one glyph. This removes that, and
builds no longer need to reach Google Fonts.

Run it again after adding text in a script the fonts do not cover yet (add the
range to UNICODES below).
"""
import io
import pathlib
import sys
import urllib.request

from fontTools import subset
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "fonts"
UPSTREAM = "https://raw.githubusercontent.com/google/fonts/main/ofl"

FAMILIES = [
    # (output name, upstream path, weight range kept)
    ("unbounded", "unbounded/Unbounded%5Bwght%5D.ttf", (500, 600)),
    ("manrope", "manrope/Manrope%5Bwght%5D.ttf", (400, 700)),
    ("jetbrains-mono", "jetbrainsmono/JetBrainsMono%5Bwght%5D.ttf", (400, 500)),
]

UNICODES = (
    "U+0020-007E,U+00A0-00FF,U+0131,U+0152-0153,U+02C6,U+02DA,U+02DC,"  # Latin, Latin-1
    "U+2000-206F,U+2070-209F,U+20AC,U+20B9,U+2122,U+2212,"  # punctuation, sub/superscripts, € ₹ ™ −
    "U+2190-2199,U+21B5,U+2318,U+258D,U+25C6,U+2713,U+276F,"  # arrows and UI symbols
    "U+0394,U+03A3,U+03B2,U+03B7,U+03B8,U+03BB"  # Greek used in the training run and decoding labels
)

FEATURES = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk", "tnum", "case"]


def build(name: str, path: str, weights: tuple[int, int], cache: pathlib.Path) -> None:
    src = cache / f"{name}.ttf"
    if not src.exists():
        print(f"  downloading {path}")
        src.write_bytes(urllib.request.urlopen(f"{UPSTREAM}/{path}").read())
    font = TTFont(src)
    options = subset.Options()
    options.flavor = "woff2"
    options.layout_features = FEATURES
    options.hinting = False
    options.desubroutinize = True
    options.name_IDs = ["*"]
    options.notdef_outline = True
    sub = subset.Subsetter(options)
    sub.populate(unicodes=subset.parse_unicodes(UNICODES))
    sub.subset(font)
    # Round-trip before instancing so every table is fully decompiled.
    tmp = io.BytesIO()
    font.flavor = None
    font.save(tmp)
    font = instancer.instantiateVariableFont(TTFont(io.BytesIO(tmp.getvalue())), {"wght": weights})
    out = OUT / f"{name}.woff2"
    buf = io.BytesIO()
    font.flavor = "woff2"
    font.save(buf)
    out.write_bytes(buf.getvalue())
    print(f"  {out.relative_to(ROOT)}  wght {weights[0]}–{weights[1]}  {len(buf.getvalue()) // 1024} KB")


if __name__ == "__main__":
    cache = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / ".font-cache"
    cache.mkdir(parents=True, exist_ok=True)
    OUT.mkdir(parents=True, exist_ok=True)
    for args in FAMILIES:
        build(*args, cache=cache)
