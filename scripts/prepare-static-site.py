#!/usr/bin/env python3
"""Package the static runtime without authoring images or repository metadata."""
from pathlib import Path
import hashlib
import shutil
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parents[1]
output = ROOT / 'output'
output.mkdir(exist_ok=True)
# A fresh directory avoids deleting or mixing in a previous release.
release = Path(tempfile.mkdtemp(prefix='static-site-', dir=output))
site = release / 'site'
files = [ROOT / name for name in (
    'index.html', 'styles.css', 'studio.css', 'LICENSE', 'THIRD_PARTY_NOTICES.md'
)]
files += sorted((ROOT / 'src').glob('*.js'))
files += sorted(p for p in (ROOT / 'vendor').rglob('*') if p.is_file())
files += sorted(p for p in (ROOT / 'assets').rglob('*') if p.is_file()
                and 'source' not in p.relative_to(ROOT / 'assets').parts
                and p.name != 'asset-manifest.json' and not p.name.startswith('.'))
# Preserve bundled licenses and the provenance referenced by third-party notices.
files += sorted(p for p in (ROOT / 'assets').rglob('*') if p.is_file()
                and 'source' in p.parts and p.suffix == '.txt'
                and 'concepts' not in p.parts)
files += [ROOT / 'assets/logos/source/partner-logos.md']
for source in files:
    target = site / source.relative_to(ROOT)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
(site / '.nojekyll').touch()
archive = release / 'site.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for path in sorted(site.rglob('*')):
        if path.is_file():
            bundle.write(path, path.relative_to(site))
(release / 'SHA256SUMS').write_text(
    f'{hashlib.sha256(archive.read_bytes()).hexdigest()}  site.zip\n'
)
print(site)
print(archive)
print(f'{len(files) + 1} files; ZIP {archive.stat().st_size / 1024 / 1024:.1f} MiB')
