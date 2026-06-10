import re
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
html = (ROOT / "index.html").read_text(encoding="utf-8", errors="ignore")
start = html.find('id="DIVMessageDilog"')
end = html.find("<!--END IMPORTANT NOTICES-->", start)
block = html[start:end] if start != -1 else ""
hrefs = re.findall(r'href="([^"]+)"', block)
local = []
for href in hrefs:
    href = unquote(href.strip())
    href = href.split("#", 1)[0].split("?", 1)[0]
    if not href or href.startswith(("http://", "https://", "mailto:", "#", "javascript:")):
        continue
    local.append(href)
for item in sorted(set(local)):
    print(item)
