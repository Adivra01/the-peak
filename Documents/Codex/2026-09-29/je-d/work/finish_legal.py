from pathlib import Path
import re
p=Path('outputs/legal.html');old=p.read_text();Path('work/before-refonte/legal.html').write_text(old)
home=Path('outputs/index.html').read_text()
head=home.split('<main')[0]
head=re.sub(r'<script type="application/ld\+json">.*?</script>','',head,flags=re.S)
head=re.sub(r'<title>.*?</title>','<title>Mentions légales et politiques | THEPEEAK</title>',head)
head=re.sub(r'(<meta (?:name="description"|property="og:description") content=")[^"]*',r'\1Mentions légales, confidentialité, cookies et conditions d’utilisation du site THEPEEAK.',head)
head=re.sub(r'(<meta property="og:title" content=")[^"]*',r'\1Mentions légales et politiques | THEPEEAK',head)
head=head.replace('href="https://thepeeak.com/"','href="https://thepeeak.com/legal.html"').replace('content="https://thepeeak.com/"','content="https://thepeeak.com/legal.html"')
main=re.search(r'<main>.*?</main>',old,re.S).group().replace('<main>','<main id="main">')
main=main.replace('29 septembre 2026','3 octobre 2026')
main=main.replace('L’espace client utilise un cookie de session HttpOnly, nécessaire à l’authentification, qui expire après huit heures ou lors de la déconnexion. Ce cookie n’est pas utilisé pour la publicité ou le suivi.','L’espace client utilise le stockage local du navigateur pour conserver la session Supabase. Ce stockage est nécessaire à l’authentification et n’est pas utilisé pour la publicité. La déconnexion supprime la session locale ; sa durée dépend des paramètres d’authentification du projet.')
main=main.replace('Google Fonts et cdnjs (Cloudflare)','Google Fonts, cdnjs (Cloudflare) et jsDelivr')
footer=home[home.index('<footer class="site-footer">'):]
p.write_text(head+main+footer)
