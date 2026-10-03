from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import unquote,urlsplit
ROOT=Path('/Users/adiaratoutoure/Documents/Codex/2026-09-29/je-d/outputs').resolve()
class Public(SimpleHTTPRequestHandler):
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_GET(self):
  relative=unquote(urlsplit(self.path).path).lstrip('/') or 'index.html'
  p=(ROOT/relative).resolve()
  if ROOT not in p.parents or any(x.startswith('.') for x in Path(relative).parts) or 'supabase' in Path(relative).parts or p.suffix not in ('.html','.css','.js','.png','.jpg','.jpeg','.webp','.svg','.ico','.mp4','.xml','.txt') or 'THEPEEAK_Hostinger' in relative:
   self.send_error(404);return
  return super().do_GET()
ThreadingHTTPServer(('127.0.0.1',4173),Public).serve_forever()
