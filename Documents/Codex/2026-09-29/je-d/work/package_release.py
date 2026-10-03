from pathlib import Path
import shutil
import zipfile

root = Path('outputs')
files = list(root.glob('*.html')) + [root / 'RESEND-HOSTINGER.md']
files += [root / name for name in [
    'favicon.ico', 'thepeeak-logo.png', 'thepeeak-logo-horizontal.png',
    'thepeeak-logo-final.png', 'peak-hero.mp4', 'services-montage.png',
    'robots.txt', 'sitemap.xml', '.htaccess'
]]
for directory in ['assets', 'services', 'guides']:
    files.extend(p for p in (root / directory).rglob('*') if p.is_file() and p.suffix in {
        '.html', '.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.webp', '.mp4', '.woff2', '.ico'
    })
api = root / 'api'
files.extend(p for p in api.rglob('*') if p.is_file() and (p.suffix in {'.php', '.example'} or p.name == '.htaccess'))
files = sorted(set(files))
archive = root / 'THEPEEAK_Refonte_Hostinger_2026-10-03.zip'
with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for path in files:
        z.write(path, path.relative_to(root))
with zipfile.ZipFile(archive) as z:
    names = z.namelist()
    assert 'index.html' in names and 'guides/seo-geo-mali.html' in names
    assert 'api/send-contact.php' in names and 'thepeeak-logo-final.png' in names
    assert not any(n.endswith('/.env') or n == '.env' for n in names)
    assert z.testzip() is None

# Keep the folder and prior Hostinger download names in sync with the canonical package.
static_root = root / 'THEPEEAK_Hostinger_Static'
for path in files:
    target = static_root / path.relative_to(root)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)
for alias in [root / 'THEPEEAK_Hostinger.zip', root / 'THEPEEAK_Hostinger_Static.zip']:
    shutil.copy2(archive, alias)
print(f'{archive}: {len(names)} fichiers, {archive.stat().st_size / 1024 / 1024:.1f} Mio, ZIP testé OK')
print(f'Synchronisé : {static_root} et {root / "THEPEEAK_Hostinger.zip"}, {root / "THEPEEAK_Hostinger_Static.zip"}')
