"""Hash the existing static site's inline assets without enabling arbitrary inline execution."""
from base64 import b64encode
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
import sys


class InlineAssets(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.active = None
        self.parts = []
        self.scripts = set()
        self.styles = set()
        self.attributes = set()

    def handle_starttag(self, tag, attributes):
        attributes = dict(attributes)
        if any(name.startswith('on') for name in attributes):
            raise ValueError('Inline event handlers require an explicit review')
        if 'style' in attributes:
            self.attributes.add(self.digest(attributes['style']))
        if tag == 'style' or (tag == 'script' and 'src' not in attributes):
            self.active = tag
            self.parts = []

    @staticmethod
    def digest(text):
        return "'sha256-" + b64encode(sha256(text.encode()).digest()).decode() + "'"

    def handle_data(self, data):
        if self.active:
            self.parts.append(data)

    def handle_endtag(self, tag):
        if tag == self.active:
            target = self.scripts if tag == 'script' else self.styles
            target.add(self.digest(''.join(self.parts)))
            self.active = None


root = Path(__file__).resolve().parents[1]
assets = InlineAssets()
for page in sorted((root / 'public').rglob('*.html')):
    assets.feed(page.read_text())
policy = (
    "default-src 'self'; script-src 'self' " + ' '.join(sorted(assets.scripts))
    + "; style-src 'self' " + ' '.join(sorted(assets.styles))
    # The existing atlas renders dynamic color/opacity attributes from its own static catalog.
    # Script execution remains hash-bound; only style attributes retain their established behavior.
    + "; style-src-attr 'unsafe-inline'"
    + "; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'none'"
)
output = Path(sys.argv[1])
output.write_text('add_header Content-Security-Policy "' + policy + '" always;\n')
print('Static CSP hashes generated:', len(assets.scripts), 'scripts,', len(assets.styles), 'styles,', len(assets.attributes), 'style attributes')
