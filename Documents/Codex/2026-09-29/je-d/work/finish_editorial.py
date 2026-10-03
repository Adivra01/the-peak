from pathlib import Path
import re,sys,xml.etree.ElementTree as ET
p=Path('work/build_editorial.py'); s=p.read_text(); s=s.replace("body=head(s['seo'],s['desc'],'services/'+s['slug']+'.html',1,schema)+nav(1)","body=head(s['seo'],s['desc'],'services/'+s['slug']+'.html',1,schema).replace('<body>', '<body data-service=\"'+s['slug']+'\">')+nav(1)"); p.write_text(s)
import build_editorial as b
import build_guides
O=Path('outputs')
for name in ['realisations.html','sites-a-vendre.html']:
 old=(O/name).read_text(); backup=Path('work/before-refonte')/name
 if not backup.exists():backup.write_text(old)
 main=re.search(r'<main\b.*?</main>',old,re.S).group().replace('<main>','<main id="main">')
 dialog=re.search(r'<dialog\b.*?</dialog>',old,re.S).group()
 title=re.search(r'<title>(.*?)</title>',old).group(1)
 desc=re.search(r'<meta name="description" content="([^"]*)"',old).group(1)
 page=b.head(title,desc,name).replace('</head>','<link rel="stylesheet" href="assets/showcase.css"></head>')+b.nav()+main+dialog+b.backend+'<script src="assets/showcase.js" defer></script>'+b.footer()
 (O/name).write_text(page)
urls=['','contact.html','realisations.html','sites-a-vendre.html','legal.html']+['services/'+s['slug']+'.html' for s in b.SERVICES]+['guides/index.html']+['guides/'+g[0]+'.html' for g in b.GUIDES]
root=ET.Element('urlset',xmlns='http://www.sitemaps.org/schemas/sitemap/0.9')
for path in urls:
 u=ET.SubElement(root,'url');ET.SubElement(u,'loc').text=b.BASE+'/'+path
 if path not in ['legal.html']:ET.SubElement(u,'lastmod').text='2026-10-03'
ET.indent(root);ET.ElementTree(root).write(O/'sitemap.xml',encoding='UTF-8',xml_declaration=True)
(O/'robots.txt').write_text('User-agent: *\nAllow: /\n\nSitemap: https://thepeeak.com/sitemap.xml\n')
