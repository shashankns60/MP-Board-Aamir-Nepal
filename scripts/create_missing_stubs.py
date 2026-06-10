"""Create server-busy stubs only for missing result.htmlmpbse links."""
from __future__ import annotations

import re
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
HREF_RE = re.compile(r"""href\s*=\s*["']([^"']+)["']""", re.IGNORECASE)
ALLOWED_PREFIX = "result.htmlmpbse/"


def build_stub_html(home_href: str) -> str:
    return f"""<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Server Busy - MPBSE</title>
    <style>
        body {{ margin: 0; background: #f4f6f8; font-family: Arial, Helvetica, sans-serif; color: #222; }}
        .busy-wrap {{ min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }}
        .busy-card {{
            max-width: 560px; width: 100%; background: #fff; border: 1px solid #d9dee3;
            border-top: 4px solid #8b0000; box-shadow: 0 8px 24px rgba(0,0,0,.08);
            padding: 32px 28px; text-align: center;
        }}
        h1 {{ font-size: 24px; margin: 0 0 12px; color: #8b0000; }}
        h2 {{ font-size: 18px; margin: 0 0 18px; }}
        p {{ font-size: 15px; line-height: 1.6; margin-bottom: 10px; color: #444; }}
        a {{
            display: inline-block; margin-top: 18px; padding: 10px 22px;
            background: #8b0000; color: #fff; text-decoration: none; border-radius: 3px; font-weight: 700;
        }}
    </style>
</head>
<body>
    <div class="busy-wrap">
        <div class="busy-card">
            <h1>Server Busy</h1>
            <h2>सर्वर व्यस्त है</h2>
            <p>The server is temporarily busy due to high traffic. Please try again after some time.</p>
            <p>उच्च ट्रैफ़िक के कारण सर्वर अस्थायी रूप से व्यस्त है। कृपया कुछ समय बाद पुनः प्रयास करें।</p>
            <a href="{home_href}">Back to Home / मुख्य पृष्ठ</a>
        </div>
    </div>
</body>
</html>
"""


def normalize_href(href: str) -> str:
    href = unquote(href.strip())
    href = href.split("#", 1)[0].split("?", 1)[0]
    return href.replace("\\", "/")


def resolve_target(href: str, source_file: Path) -> Path | None:
    href = normalize_href(href)
    if not href.lower().startswith(ALLOWED_PREFIX):
        return None
    target = (source_file.parent / href).resolve()
    try:
        target.relative_to(ROOT)
    except ValueError:
        return None
    return target


def home_href_for(target: Path) -> str:
    depth = len(target.parent.relative_to(ROOT).parts)
    return "/".join([".."] * depth + ["index.html"]) if depth else "index.html"


def needs_stub(target: Path) -> bool:
    return not target.exists() or target.stat().st_size == 0


def collect_targets() -> set[Path]:
    targets: set[Path] = set()
    for html_file in ROOT.glob("*.html"):
        text = html_file.read_text(encoding="utf-8", errors="ignore")
        for match in HREF_RE.finditer(text):
            target = resolve_target(match.group(1), html_file)
            if target is not None and target.suffix.lower() in {".html", ".htm"}:
                targets.add(target)
    return targets


def main() -> None:
    created = 0
    for target in sorted(collect_targets()):
        if not needs_stub(target):
            continue
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(build_stub_html(home_href_for(target)), encoding="utf-8", newline="\n")
        created += 1
        print(f"created: {target.relative_to(ROOT)}")
    print(f"Done. created={created}")


if __name__ == "__main__":
    main()
