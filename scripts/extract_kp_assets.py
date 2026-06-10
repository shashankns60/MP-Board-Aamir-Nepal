import base64
import pathlib
import re

root = pathlib.Path(__file__).resolve().parents[1]
text = root.joinpath("kp.html").read_text(encoding="utf-8")

style_match = re.search(r"<style>(.*?)</style>", text, re.S)
if style_match:
    css = style_match.group(1).strip()
    root.joinpath("resources/css/marksheet-kp.css").write_text(css, encoding="utf-8")
    print("Wrote marksheet-kp.css", len(css))

logo_match = re.search(r'src="(data:image/png;base64,[^"]+)"', text)
if logo_match:
    encoded = logo_match.group(1).split(",", 1)[1]
    out = root / "resources/images/mp-board-marksheet-logo.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(base64.b64decode(encoded))
    print("Wrote logo", out)
