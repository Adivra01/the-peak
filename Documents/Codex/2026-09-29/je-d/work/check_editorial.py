from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,xml.etree.ElementTree as ET
O=Path('outputs').resolve()
class Doc(HTMLParser):
 def __init__(self,s):super().__init__();self.ids=[];self.links=[];self.h1=0;self.json=[];self.capture=False;self.buf='';self.feed(s)
 def handle_starttag(self,t,a):
  d=dict(a)
  if d.get('id'):self.ids.append(d['id'])
  if t=='h1':self.h1+=1
  for key in ['href','src']:
   if key in d:self.links.append(d[key])
  if t=='script' and d.get('type')=='application/ld+json':self.capture=True;self.buf=''
 def handle_data(self,d):
  if self.capture:self.buf+=d
 def handle_endtag(self,t):
  if t=='script' and self.capture:self.json.append(json.loads(self.buf));self.capture=False
files=[O/'index.html',O/'contact.html',O/'realisations.html',O/'sites-a-vendre.html']+list((O/'services').glob('*.html'))+list((O/'guides').glob('*.html'))
errors=[];links=0
for f in files:
 d=Doc(f.read_text())
 if d.h1!=1:errors.append(f'{f.name}: {d.h1} H1')
 if len(d.ids)!=len(set(d.ids)):errors.append(f'{f.name}: duplicate ID')
 for u in d.links:
  v=urlsplit(u)
  if v.scheme or v.netloc:continue
  target=(f.parent/unquote(v.path)).resolve() if v.path else f
  links+=1
  if not target.exists():errors.append(f'{f.name}: missing {u}')
  elif v.fragment and target.suffix=='.html' and v.fragment not in Doc(target.read_text()).ids:errors.append(f'{f.name}: missing anchor {u}')
for u in ET.parse(O/'sitemap.xml').getroot():
 loc=u.find('{*}loc').text
 path=urlsplit(loc).path.lstrip('/') or 'index.html'
 if not (O/path).is_file():errors.append('Sitemap missing '+path)
print(json.dumps({'pages':len(files),'local_links':links,'errors':errors},ensure_ascii=False,indent=2))
