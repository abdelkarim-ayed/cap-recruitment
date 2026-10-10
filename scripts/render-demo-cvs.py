"""Synthetic, text-only RenderCV samples. Local authoring tool, not app runtime."""
import json
import os
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / '.local' / 'demo' / 'rendercv-pdfs'
RENDER = Path(os.environ.get('RENDERCV_BIN', ROOT / '.local' / 'rendercv-venv' / 'bin' / 'rendercv'))
if not RENDER.is_file():
    raise SystemExit('Install: python3 -m venv .local/rendercv-venv, then .local/rendercv-venv/bin/pip install "rendercv[full]==2.8"')
OUTPUT.mkdir(parents=True, exist_ok=True, mode=0o700)
profiles = json.loads((ROOT / 'docs' / 'demo-cvs.json').read_text())
for profile in profiles:
    alias = profile['alias']
    # RenderCV rejects .test addresses. example.com is reserved for documentation;
    # these CV contact addresses are never mailed and differ from login identities.
    cv = {'name': profile['name'], 'location': profile['location'], 'email': f'demo.{alias}@example.com', 'sections': {
        'profile': [profile['summary']], 'experience': profile['experience'], 'projects': profile['projects'],
        'education': profile['education'], 'skills': profile['skills'],
        'languages': [{'label': 'Languages', 'details': profile['languages']}],
        'demo notice': ['Synthetic candidate and employment history for software testing. Not a real applicant.'],
    }}
    source = OUTPUT / f'{alias}-cv.yaml'
    # JSON is valid YAML. Retain the exact generator input locally.
    source.write_text(json.dumps({'cv': cv, 'design': {'theme': 'engineeringresumes'}}, indent=2) + '\n')
    subprocess.run([str(RENDER), 'render', str(source), '--pdf-path', str(OUTPUT / f'{alias}-cv.pdf'),
                    '--dont-generate-png', '--dont-generate-html', '--dont-generate-markdown'],
                   cwd=OUTPUT, check=True)
    os.chmod(source, 0o600)
    os.chmod(OUTPUT / f'{alias}-cv.pdf', 0o600)
print(f'Rendered {len(profiles)} synthetic PDF CVs to .local/demo/rendercv-pdfs/. No images generated.')
