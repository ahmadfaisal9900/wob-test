"""Static integrity checks; run from any directory with Python 3."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]


class SiteParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.links = []
        self.local_files = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            if attrs['id'] in self.ids:
                self.errors.append(f"Duplicate ID: {attrs['id']}")
            self.ids.add(attrs['id'])
        for key in ('href', 'src'):
            value = attrs.get(key, '')
            if value.startswith('#'):
                self.links.append(value[1:])
            elif value and not urlsplit(value).scheme and not value.startswith('//'):
                self.local_files.append(value)
        for key in ('aria-controls', 'aria-labelledby'):
            self.links.extend(attrs.get(key, '').split())
        if tag == 'img' and 'alt' not in attrs:
            self.errors.append('Image is missing alt text')


parser = SiteParser()
parser.feed((ROOT / 'index.html').read_text(encoding='utf-8'))
for link in parser.links:
    if link not in parser.ids:
        parser.errors.append(f'Missing anchor or ARIA target: {link}')
for filename in parser.local_files:
    if not (ROOT / filename).is_file():
        parser.errors.append(f'Missing local asset: {filename}')
assert (ROOT / '.nojekyll').is_file(), 'Missing .nojekyll'
assert (ROOT / 'assets/images/workplace.jpg').read_bytes()[:2] == b'\xff\xd8', 'Invalid JPEG'
assert not parser.errors, '\n'.join(parser.errors)
print(f'PASS: {len(parser.ids)} unique IDs, all anchor/ARIA targets and local HTML assets exist.')
