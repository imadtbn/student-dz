#!/usr/bin/env python3
"""Generate validator-visible WebApplication JSON-LD for every tools/*.html page."""
from pathlib import Path
from html import unescape
import json
import re

ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
BASE = "https://imadtbn.github.io/student-dz"
START = "<!-- Student DZ: WebApplication JSON-LD START -->"
END = "<!-- Student DZ: WebApplication JSON-LD END -->"


def meta(html: str, name: str) -> str:
    pattern = rf'<meta\s+[^>]*name=["\']{re.escape(name)}["\'][^>]*content=["\']([^"\']*)["\'][^>]*>'
    match = re.search(pattern, html, re.I)
    return unescape(match.group(1).strip()) if match else ""


def canonical(html: str) -> str:
    match = re.search(r'<link\s+[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']+)["\'][^>]*>', html, re.I)
    return unescape(match.group(1).strip()) if match else ""


def title(html: str) -> str:
    match = re.search(r'<title\b[^>]*>(.*?)</title>', html, re.I | re.S)
    return unescape(re.sub(r"\s+", " ", match.group(1)).strip()) if match else ""


def application_name(page_title: str) -> str:
    return re.sub(r'\s*[-|–—]\s*Student\s*DZ\s*$', '', page_title, flags=re.I).strip() or page_title


def build_schema(path: Path, html: str) -> str:
    url = canonical(html) or f"{BASE}/tools/{path.name}"
    page_title = title(html)
    name = application_name(page_title)
    description = meta(html, "description")
    schema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "@id": f"{url.split('#', 1)[0]}#webapplication",
        "name": name,
        "url": url,
        "inLanguage": "ar-DZ",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "isPartOf": {"@id": f"{BASE}/#website"},
        "author": {"@id": f"{BASE}/#organization"},
    }
    if description:
        schema["description"] = description
    payload = json.dumps(schema, ensure_ascii=False, indent=2)
    return f"{START}\n<script type=\"application/ld+json\" id=\"studentDzToolSchema\">\n{payload}\n</script>\n{END}"


def process(path: Path) -> bool:
    html = path.read_text(encoding="utf-8")
    block = build_schema(path, html)
    pattern = re.compile(re.escape(START) + r".*?" + re.escape(END), re.S)
    if pattern.search(html):
        updated = pattern.sub(block, html, count=1)
    else:
        head_close = re.search(r"</head>\s*", html, re.I)
        if not head_close:
            raise RuntimeError(f"No </head> found in {path}")
        updated = html[:head_close.start()] + block + "\n\n" + html[head_close.start():]
    if updated != html:
        path.write_text(updated, encoding="utf-8")
        return True
    return False


changed = []
for page in sorted(TOOLS.glob("*.html")):
    if process(page):
        changed.append(page.relative_to(ROOT).as_posix())

print(f"Generated static WebApplication JSON-LD for {len(changed)} tool page(s).")
for item in changed:
    print(item)
