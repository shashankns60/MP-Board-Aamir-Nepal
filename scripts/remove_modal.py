"""Remove homepage modal and delete its local linked files."""
from __future__ import annotations

import re
import shutil
from pathlib import Path
from urllib.parse import unquote

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / "index.html", ROOT / "default.html"]


def extract_modal_hrefs(html: str) -> list[str]:
    start = html.find('id="DIVMessageDilog"')
    end = html.find("<!--END IMPORTANT NOTICES-->", start)
    if start == -1 or end == -1:
        return []
    block = html[start:end]
    hrefs: list[str] = []
    for href in re.findall(r'href="([^"]+)"', block):
        href = unquote(href.strip()).split("#", 1)[0].split("?", 1)[0]
        if not href or href.startswith(("http://", "https://", "mailto:", "#", "javascript:")):
            continue
        if href == "result.html":
            continue
        hrefs.append(href)
    return sorted(set(hrefs))


def remove_modal_markup(html: str) -> str:
    html = re.sub(
        r'\s*<div id="RightFloatAds"[\s\S]*?<!--END IMPORTANT NOTICES-->',
        "",
        html,
        count=1,
    )
    html = re.sub(
        r"\n\s*RightFloatAds \{[\s\S]*?\}\n",
        "\n",
        html,
        count=1,
    )
    return html


def remove_modal_js(html: str) -> str:
    html = re.sub(
        r"\s*// Wait for Bootstrap to be ready, then show modal\s*"
        r"setTimeout\(function\(\) \{\s*checkCookie\(\);\s*\}, 1000\);\s*",
        "",
        html,
    )
    html = re.sub(
        r"\s*checkCookie\(\);\s*",
        "",
        html,
        count=1,
    )
    for fn in (
        "OpenModelLink",
        "setCookie",
        "getCookie",
        "checkCookie",
        "ModelCloseFirst",
        "ModelClose",
        "ModelClose1",
    ):
        html = re.sub(
            rf"\s*function {fn}\(\) \{{[\s\S]*?\}}\s*",
            "",
            html,
            count=1,
        )
    return html


def delete_modal_files(hrefs: list[str]) -> None:
    targets: set[Path] = set()

    for href in hrefs:
        targets.add(ROOT / Path(href))

    result_dir = ROOT / "result.htmlmpbse"
    if result_dir.exists():
        targets.add(result_dir)

    for href in hrefs:
        path = ROOT / Path(href)
        if path.suffix.lower() == ".pdf":
            for ext in (".html", ".htm", ".HTML", ".HTM"):
                targets.add(path.with_suffix(ext))
            alt = path.name.replace(".pdf", ".PDF")
            targets.add(path.parent / alt)

    for target in sorted(targets, key=lambda p: len(p.parts), reverse=True):
        if not target.exists():
            continue
        if target.is_dir():
            shutil.rmtree(target)
            print(f"removed dir: {target.relative_to(ROOT)}")
        else:
            target.unlink()
            print(f"removed file: {target.relative_to(ROOT)}")


def main() -> None:
    hrefs = extract_modal_hrefs((ROOT / "index.html").read_text(encoding="utf-8", errors="ignore"))
    delete_modal_files(hrefs)

    for page in PAGES:
        if not page.exists():
            continue
        content = page.read_text(encoding="utf-8", errors="ignore")
        content = remove_modal_markup(content)
        content = remove_modal_js(content)
        page.write_text(content, encoding="utf-8", newline="\n")
        print(f"updated: {page.name}")


if __name__ == "__main__":
    main()
