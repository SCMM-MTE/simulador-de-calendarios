#!/usr/bin/env python3
"""Package only the personal app's public code. No data/imports/repo history."""
import argparse,hashlib,json,shutil
from pathlib import Path
parser=argparse.ArgumentParser();parser.add_argument('output',type=Path);parser.add_argument('--dataset',type=Path);args=parser.parse_args()
repo=Path(__file__).resolve().parents[1];target=args.output.resolve()
if target==repo or repo.is_relative_to(target) or target.is_relative_to(repo):raise SystemExit('Use a separate preview directory outside the repository')
if target.exists() and any(target.iterdir()):raise SystemExit('Output must be empty')
target.mkdir(parents=True,exist_ok=True)
files=['index.html','personal/index.html','personal/app.mjs','personal/styles.css','personal/assets/scmm-logo.svg']+[str(p.relative_to(repo)) for p in sorted((repo/'personal/core').glob('*.mjs'))]
for name in files:
 p=target/name;p.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(repo/name,p)
if args.dataset:
 data=json.loads(args.dataset.read_text());assert data['schema']=='scmm-personal-simulator-v1'
 forbidden={'Nombre','nombre','name','DNI','dni','email','password'}
 def check(value):
  if isinstance(value,dict):
   assert not forbidden.intersection(value), 'Unexpected personal fields'
   for v in value.values():check(v)
  elif isinstance(value,list):
   for v in value:check(v)
 check(data)
 dest=target/'personal/data/default-dataset.json';dest.parent.mkdir(parents=True,exist_ok=True);dest.write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
(target/'404.html').write_text('<!doctype html><html lang="es"><meta charset="utf-8"><title>Ruta no encontrada</title><h1>Esta ruta no existe</h1><a href="/">Volver al simulador</a></html>')
(target/'_headers').write_text("""/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'none'
  Referrer-Policy: no-referrer
  X-Content-Type-Options: nosniff
  X-Robots-Tag: noindex, nofollow
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Cache-Control: no-store
""")
manifest={str(p.relative_to(target)):{'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in sorted(target.rglob('*')) if p.is_file()}
print(json.dumps({'files':len(manifest),'bytes':sum(x['bytes'] for x in manifest.values()),'assignmentDataFiles':1 if args.dataset else 0,'filesList':list(manifest)},indent=2))
