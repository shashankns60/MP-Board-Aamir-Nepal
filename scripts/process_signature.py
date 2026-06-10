"""Prepare secretary signature: upscale, dark ink, transparent background."""
from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "resources" / "images" / "secretary-signature-source.png"
OUT = ROOT / "resources" / "images" / "secretary-signature.png"
SCALE = 4


def main():
    img = Image.open(SRC).convert("RGBA")
    width, height = img.size
    img = img.resize((width * SCALE, height * SCALE), Image.Resampling.LANCZOS)
    img = ImageEnhance.Contrast(img).enhance(2.0)
    img = img.filter(ImageFilter.SHARPEN)

    pixels = img.load()
    out_width, out_height = img.size

    for y in range(out_height):
        for x in range(out_width):
            r, g, b, _ = pixels[x, y]
            brightness = (r + g + b) / 3
            alpha = int(255 - brightness)

            if alpha < 25:
                pixels[x, y] = (0, 0, 0, 0)
            else:
                ink = max(0, min(60, int((255 - brightness) * 0.35)))
                pixels[x, y] = (ink, ink, ink, min(255, alpha + 40))

    img.save(OUT, "PNG")
    print(f"Saved {OUT} ({out_width}x{out_height})")


if __name__ == "__main__":
    main()
