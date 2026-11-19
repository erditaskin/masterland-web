"""Render the shared static site navigation, including the active route."""
from html import escape
from pathlib import Path
import argparse
import re

ROOT = Path(__file__).resolve().parents[1] / "public"
ROUTES = [
    ("/", "Ana sayfa", "Home"),
    ("/game/", "Oyun", "Game"),
    ("/atlas/", "Atlas", "Atlas"),
    ("/support/", "Destek", "Support"),
    ("/privacy/", "Gizlilik", "Privacy"),
]
FOOTER_ROUTES = [*ROUTES, ("/atlas/tree/", "İçerik ağacı", "Content tree"),
                 ("/delete-account/", "Hesap silme", "Delete account")]


def links(routes, current):
    result = []
    for href, tr, en in routes:
        active = ' aria-current="page"' if href == current else ""
        result.append(f'<a href="{href}"{active} data-tr="{escape(tr)}" data-en="{escape(en)}">{escape(tr)}</a>')
    return "\n".join(result)


def header(current):
    return f"""<header class="site-header">
<div class="site-header-inner">
<a class="site-brand" href="/"><img src="/assets/icon.png" width="33" height="33" alt="">Masterland</a>
<nav class="site-nav" aria-label="Main navigation">{links(ROUTES, current)}</nav>
<div class="site-languages" role="group" aria-label="Dil / Language">
<button type="button" data-set-language="tr" lang="tr" aria-label="Türkçe">TR</button>
<button type="button" data-set-language="en" lang="en" aria-label="English">EN</button>
</div>
</div>
</header>"""


def footer(current):
    return f"""<footer class="site-footer">
<div class="site-footer-inner">
<a class="site-brand" href="/"><img src="/assets/icon.png" width="33" height="33" alt="">Masterland</a>
<nav class="site-footer-nav" aria-label="Footer navigation">{links(FOOTER_ROUTES, current)}</nav>
<small>© 2026 Masterland</small>
</div>
</footer>"""


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    stale = []
    for page in sorted(ROOT.rglob("index.html")):
        relative = page.parent.relative_to(ROOT)
        route = "/" if relative == Path(".") else f"/{relative.as_posix()}/"
        old = page.read_text()
        new = old
        regions = [("header", header(route))]
        if not route.startswith("/atlas/"):
            regions.append(("footer", footer(route)))
        for region, block in regions:
            start, end = f"<!-- site:{region} -->", f"<!-- /site:{region} -->"
            new, count = re.subn(f"{start}.*?{end}", lambda _: f"{start}\n{block}\n{end}", new, flags=re.S)
            if count != 1:
                raise ValueError(f"{page} needs one pair of {region} markers")
        if old != new:
            if args.check:
                stale.append(route)
            else:
                page.write_text(new)
    if stale:
        raise SystemExit("Outdated navigation: " + ", ".join(stale))


if __name__ == "__main__":
    main()
