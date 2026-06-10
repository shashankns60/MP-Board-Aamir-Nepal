"""Remove pageULLI list links and show server-busy modal on click."""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

DEFAULT_MESSAGE = {
    "title": "Server Busy",
    "title_hi": "सर्वर व्यस्त है",
    "p1": "The server is temporarily busy due to high traffic. Please try again after some time.",
    "p2": "उच्च ट्रैफ़िक के कारण सर्वर अस्थायी रूप से व्यस्त है। कृपया कुछ समय बाद पुनः प्रयास करें।",
    "button": "Close / बंद करें",
}

PAGE_MESSAGES = {
    "More_Services.html": {
        "title": "Under Maintenance",
        "title_hi": "रखरखाव जारी है",
        "p1": "These links are currently under maintenance. Please try again after some time.",
        "p2": "ये लिंक वर्तमान में रखरखाव में हैं। कृपया कुछ समय बाद पुनः प्रयास करें।",
        "button": "Close / बंद करें",
    },
}


def build_modal_html(message: dict[str, str]) -> str:
    return f"""
    <div id="academicsServerBusy" class="academics-busy-modal" hidden>
        <div class="academics-busy-overlay" data-close-busy="1"></div>
        <div class="academics-busy-card" role="dialog" aria-modal="true" aria-labelledby="academicsBusyTitle">
            <h1 id="academicsBusyTitle">{message["title"]}</h1>
            <h2>{message["title_hi"]}</h2>
            <p>{message["p1"]}</p>
            <p>{message["p2"]}</p>
            <button type="button" class="academics-busy-close" data-close-busy="1">{message["button"]}</button>
        </div>
    </div>
"""

STYLES = """
        .academics-busy-link {
            cursor: pointer;
            color: inherit;
        }
        .boxtex789 .academics-busy-link {
            display: block;
        }
        .academics-busy-link:hover,
        .academics-busy-link:focus {
            text-decoration: underline;
            outline: none;
        }
        .academics-busy-modal {
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
        }
        .academics-busy-modal[hidden] {
            display: none !important;
        }
        .academics-busy-overlay {
            position: absolute;
            inset: 0;
            background: rgba(0, 0, 0, 0.45);
        }
        .academics-busy-card {
            position: relative;
            max-width: 560px;
            width: 100%;
            background: #fff;
            border: 1px solid #d9dee3;
            border-top: 4px solid #8b0000;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
            padding: 32px 28px;
            text-align: center;
        }
        .academics-busy-card h1 {
            font-size: 24px;
            margin: 0 0 12px;
            color: #8b0000;
        }
        .academics-busy-card h2 {
            font-size: 18px;
            margin: 0 0 18px;
            font-family: "Noto Sans Devanagari", Arial, sans-serif;
        }
        .academics-busy-card p {
            font-size: 15px;
            line-height: 1.6;
            margin-bottom: 10px;
            color: #444;
        }
        .academics-busy-close {
            margin-top: 18px;
            padding: 10px 22px;
            background: #8b0000;
            color: #fff;
            border: 0;
            border-radius: 3px;
            font-weight: 700;
            cursor: pointer;
        }
"""

SCRIPT = """
    <script>
        (function () {
            function showBusyModal(event) {
                if (event) {
                    event.preventDefault();
                }
                var modal = document.getElementById("academicsServerBusy");
                if (modal) {
                    modal.hidden = false;
                }
            }

            function hideBusyModal() {
                var modal = document.getElementById("academicsServerBusy");
                if (modal) {
                    modal.hidden = true;
                }
            }

            document.addEventListener("DOMContentLoaded", function () {
                document.querySelectorAll(".academics-busy-link").forEach(function (item) {
                    item.addEventListener("click", showBusyModal);
                    item.addEventListener("keydown", function (event) {
                        if (event.key === "Enter" || event.key === " ") {
                            showBusyModal(event);
                        }
                    });
                });

                document.querySelectorAll("[data-close-busy]").forEach(function (item) {
                    item.addEventListener("click", hideBusyModal);
                });

                document.addEventListener("keydown", function (event) {
                    if (event.key === "Escape") {
                        hideBusyModal();
                    }
                });
            });
        })();
    </script>
"""


PAGE_BLOCKS = {
    "default": ('<ul class="pageULLI">', "</ul>"),
    "latest-circulars.html": (
        '<table class="table table-bordered table-striped">',
        "</tbody>",
    ),
    "tenders and advertisement.html": (
        '<ol style="list-style-type: decimal; font-weight: bold; color: maroon;',
        "</ol>",
    ),
    "ttable.html": (
        '<section class="faq-wrapper padding-lg"',
        "</section>",
    ),
    "More_Services.html": (
        '<section class="faq-wrapper padding-lg"',
        "</section>",
    ),
}


def strip_links_in_list(html: str, page_name: str) -> str:
    start_marker, end_marker = PAGE_BLOCKS.get(page_name, PAGE_BLOCKS["default"])
    start = html.find(start_marker)
    end = html.find(end_marker, start)
    if start == -1 or end == -1:
        raise RuntimeError(f"Could not find list block in {page_name}")

    end += len(end_marker)
    before = html[:start]
    block = html[start:end]
    after = html[end:]

    if re.search(r"<a\b", block, flags=re.IGNORECASE):
        block = re.sub(
            r"<a\b[^>]*>",
            '<span class="academics-busy-link" role="button" tabindex="0">',
            block,
            flags=re.IGNORECASE,
        )
        block = re.sub(r"</a>", "</span>", block, flags=re.IGNORECASE)

    return before + block + after


def inject_assets(html: str, page_name: str) -> str:
    if "academics-busy-modal" not in html:
        message = PAGE_MESSAGES.get(page_name, DEFAULT_MESSAGE)
        modal_html = build_modal_html(message)
        html = html.replace("</head>", f"    <style>{STYLES}\n    </style>\n</head>", 1)
        html = html.replace('<footer class="footer">', modal_html + "\n    <footer class=\"footer\">", 1)
        html = html.replace("</body>", SCRIPT + "\n</body>", 1)
    return html


def process_page(page: Path) -> None:
    html = page.read_text(encoding="utf-8", errors="ignore")
    html = strip_links_in_list(html, page.name)
    html = inject_assets(html, page.name)
    page.write_text(html, encoding="utf-8", newline="\n")
    print(f"Updated {page.name}")


def main() -> None:
    pages = sys.argv[1:] or ["Student_Services.html"]
    for name in pages:
        process_page(ROOT / name)


if __name__ == "__main__":
    main()
