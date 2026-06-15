# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: africademia-full.spec.js >> 18. Erreurs JavaScript >> Pas d'erreur JS — Accueil
- Location: tests/africademia-full.spec.js:928:5

# Error details

```
Error: Erreurs JS sur Accueil : console.error: Failed to load resource: the server responded with a status of 500 (); console.error: Failed to load resource: the server responded with a status of 500 ()

expect(received).toHaveLength(expected)

Expected length: 0
Received length: 2
Received array:  ["console.error: Failed to load resource: the server responded with a status of 500 ()", "console.error: Failed to load resource: the server responded with a status of 500 ()"]
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - navigation [ref=e2]:
    - generic [ref=e3]:
      - link "Africa demia" [ref=e4] [cursor=pointer]:
        - /url: index.html
        - text: Africa
        - generic [ref=e6]: demia
      - generic [ref=e7]:
        - link "Services" [ref=e8] [cursor=pointer]:
          - /url: "#services"
        - link "Notre histoire" [ref=e9] [cursor=pointer]:
          - /url: notre-histoire.html
        - link "Formations" [ref=e10] [cursor=pointer]:
          - /url: "#formations"
        - link "Incubateur" [ref=e11] [cursor=pointer]:
          - /url: "#incubateur"
        - link "FAQ" [ref=e12] [cursor=pointer]:
          - /url: "#faq"
      - generic [ref=e13]:
        - link " Connexion" [ref=e14] [cursor=pointer]:
          - /url: connexion.html
          - generic [ref=e15]: 
          - generic [ref=e16]: Connexion
        - link "Parler à Khadidja" [ref=e17] [cursor=pointer]:
          - /url: "#contact"
  - generic:
    - link "Services":
      - /url: "#services"
    - link "Formations":
      - /url: formations.html
    - link "Incubateur":
      - /url: "#incubateur"
    - link "Notre histoire":
      - /url: notre-histoire.html
    - link "FAQ":
      - /url: "#faq"
    - link "Parler à Khadidja ":
      - /url: "#contact"
      - text: Parler à Khadidja
      - generic: 
    - link " Connexion":
      - /url: connexion.html
      - generic: 
      - text: Connexion
  - banner [ref=e18]:
    - generic [ref=e19]:
      - generic [ref=e20]:
        - generic [ref=e21]:
          - generic [ref=e22]: Agence digitale · Afrique & International
          - heading "Le digital, à la hauteur de votre ambition." [level=1] [ref=e24]:
            - generic [ref=e26]: Le digital,
            - generic [ref=e28]: à la hauteur
            - generic [ref=e30]: de votre
            - generic [ref=e32]: ambition.
          - paragraph [ref=e34]: Sites web, image de marque, publicité et formations propulsées par l'IA. Africademia donne aux entrepreneurs les moyens de bâtir une présence en ligne qui compte — partout dans le monde.
          - generic [ref=e35]:
            - link "Démarrer mon projet " [ref=e36] [cursor=pointer]:
              - /url: "#contact"
              - text: Démarrer mon projet
              - generic [ref=e37]: 
            - link "Voir les services" [ref=e38] [cursor=pointer]:
              - /url: "#services"
          - generic [ref=e39]: +1 000 entrepreneurs accompagnés
        - generic [ref=e44]:
          - generic [ref=e47]:
            - generic [ref=e49]: A
            - img [ref=e54]
            - generic [ref=e58]:
              - generic [ref=e59]:
                - generic [ref=e60]: 12 400
                - generic [ref=e61]: Visiteurs
              - generic [ref=e62]:
                - generic [ref=e63]: ×3.4
                - generic [ref=e64]: ROI
            - generic [ref=e65]:
              - generic [ref=e67]: Site en ligne
              - generic [ref=e68]: 100%
          - generic [ref=e70]:
            - generic [ref=e71]: Visiteurs / mois
            - generic [ref=e72]: 12 400
            - generic [ref=e73]:
              - generic [ref=e74]: 
              - text: +34% ce mois
          - generic [ref=e75]:
            - generic [ref=e76]: ROI campagne
            - generic [ref=e77]: ×3.4
          - generic [ref=e84]:
            - generic [ref=e85]: K
            - generic [ref=e86]:
              - generic [ref=e87]: Khadidja IA
              - generic [ref=e88]: Votre site est en ligne ✓
          - generic [ref=e90]:
            - generic [ref=e91]: 👤
            - generic [ref=e92]: Nouveau client
            - generic [ref=e93]: Inscription sur le site · 5 min
          - generic [ref=e94]:
            - generic [ref=e95]: Commandes
            - generic [ref=e96]: "48"
            - generic [ref=e97]:
              - generic [ref=e98]: 
              - text: +12 ce soir
      - generic [ref=e99]:
        - generic [ref=e100]:
          - generic [ref=e101]: +1 000
          - generic [ref=e102]: entrepreneurs accompagnés
        - generic [ref=e103]:
          - generic [ref=e104]: "7"
          - generic [ref=e105]: pôles d'expertise & formations
        - generic [ref=e106]:
          - generic [ref=e107]: 100%
          - generic [ref=e108]: accompagnement sur-mesure
  - generic [ref=e110]:
    - generic [ref=e111]:
      - generic [ref=e112]: SITES WEB
      - generic [ref=e114]: IMAGE DE MARQUE
      - generic [ref=e116]: META & TIKTOK ADS
      - generic [ref=e118]: VIDÉO IA
      - generic [ref=e120]: FORMATIONS
      - generic [ref=e122]: INCUBATEUR
    - generic [ref=e124]:
      - generic [ref=e125]: SITES WEB
      - generic [ref=e127]: IMAGE DE MARQUE
      - generic [ref=e129]: META & TIKTOK ADS
      - generic [ref=e131]: VIDÉO IA
      - generic [ref=e133]: FORMATIONS
      - generic [ref=e135]: INCUBATEUR
  - generic [ref=e137]:
    - generic [ref=e139]:
      - generic [ref=e140]:
        - generic [ref=e141]:
          - generic [ref=e142]: "01"
          - text: — Nos services
        - heading "Tout ce qu'il faut pour exister et vendre." [level=2] [ref=e143]
      - generic [ref=e144]: Un accompagnement sur-mesure, du premier échange à la mise en ligne. Chaque projet fait l'objet d'un devis personnalisé — adapté à votre marché.
    - generic [ref=e145]:
      - generic [ref=e146]:
        - generic [ref=e147]:
          - generic [ref=e148]:
            - generic [ref=e149]: "01"
            - generic [ref=e150]: Développement
            - heading "Sites web & applications" [level=3] [ref=e151]:
              - text: Sites web &
              - text: applications
            - paragraph [ref=e152]: Vitrines, e-commerce et applications mobiles sur-mesure. Une maquette vous est présentée avant tout engagement.
            - link "Découvrir " [ref=e153] [cursor=pointer]:
              - /url: service-detail.html?slug=creation-site-web
              - text: Découvrir
              - generic [ref=e154]: 
          - generic [ref=e155]:
            - generic [ref=e161]: votresite.com
            - generic [ref=e169]:
              - generic [ref=e170]: ── Khadidja IA ──
              - generic [ref=e171]:
                - generic [ref=e172]:
                  - text: Créer un site vitrine
                  - text: pour ma boutique
                - generic [ref=e174]: ✨ Générer
            - generic [ref=e175]:
              - generic [ref=e176]: 
              - text: Code sur-mesure
            - generic [ref=e177]:
              - generic [ref=e178]: Pages vues
              - generic [ref=e179]: 12K/mois
            - generic [ref=e182]: 247 sessions live
            - generic [ref=e183]:
              - generic [ref=e184]: Conversion
              - generic [ref=e185]: 3.8%
        - generic:
          - generic:
            - generic: "02"
            - generic: Créatif & IA
            - heading "Image de marque & créatif" [level=3]:
              - text: Image de marque
              - text: "& créatif"
            - paragraph: Logos, packs de visuels pour les réseaux sociaux et vidéos publicitaires générées par IA.
            - link "Découvrir ":
              - /url: service-detail.html?slug=marketing-digital
              - text: Découvrir
              - generic: 
          - generic:
            - generic:
              - generic: A
            - generic:
              - generic:
                - generic: 
                - generic: 
            - generic:
              - generic: 
              - text: Vidéo IA générée
            - generic:
              - generic: Abonnés gagnés
              - generic: +1 240
            - generic:
              - generic: 
              - generic: "Portée organique : 48K"
        - generic:
          - generic:
            - generic: "03"
            - generic: Publicité digitale
            - heading "Publicité Meta & TikTok" [level=3]:
              - text: Publicité Meta
              - text: "& TikTok"
            - paragraph: Création et paramétrage complet de campagnes pour amplifier votre visibilité et vos ventes.
            - link "Découvrir ":
              - /url: service-detail.html?slug=publicite
              - text: Découvrir
              - generic: 
          - generic:
            - generic:
              - generic: 
              - text: Facebook Ads
            - generic:
              - generic: 
              - text: TikTok Ads
            - generic:
              - generic: 
              - text: Google Ads
            - generic:
              - generic: ROI moyen
              - generic: ×3.4
            - generic:
              - generic: Budget · Conversions
              - generic:
                - generic: 68%
                - generic: "+124"
            - generic:
              - generic: 
              - text: "CPC moyen :"
              - generic: 0.08 $
        - generic:
          - generic:
            - generic: "04"
            - generic: Infrastructure
            - heading "Hébergement & maintenance" [level=3]:
              - text: Hébergement
              - text: "& maintenance"
            - paragraph: Mise en ligne sécurisée, configuration du domaine, sauvegardes et support technique continu.
            - link "Découvrir ":
              - /url: service-detail.html?slug=hebergement
              - text: Découvrir
              - generic: 
          - generic:
            - generic:
              - generic: 99.9%
              - generic: Uptime garanti
            - generic:
              - generic: 
              - text: SSL + Backups
            - generic:
              - generic: 
              - text: votresite.africa
            - generic:
              - generic: Support
              - generic: 24/7
            - generic:
              - generic: Temps de chargement
              - generic: 0.8s
              - generic: "Score : A+"
            - generic: 3 serveurs actifs
        - generic:
          - generic:
            - generic: "05"
            - generic: Programme élite
            - heading "L'Incubateur Africademia" [level=3]:
              - text: L'Incubateur
              - text: Africademia
            - paragraph: Accompagnement stratégique et investissements ciblés pour les projets à fort potentiel — musique, startups, immobilier et innovation.
            - link "En savoir plus ":
              - /url: "#incubateur"
              - text: En savoir plus
              - generic: 
          - generic:
            - generic:
              - generic: Secteurs
              - generic:
                - generic:
                  - generic: 
                  - text: Musique & Artistes
                - generic:
                  - generic: 
                  - text: Startups Tech
                - generic:
                  - generic: 
                  - text: Immobilier
                - generic:
                  - generic: 
                  - text: Innovation
            - generic:
              - generic: Conditions requises
              - generic:
                - generic:
                  - generic: 
                  - text: Passeport valide
                - generic:
                  - generic: 
                  - text: Compte bancaire actif
                - generic:
                  - generic: 
                  - text: Projet présenté
            - generic:
              - generic: 
              - text: Dossier en évaluation
            - generic:
              - generic: Accompagnement
              - generic: Stratégique
            - generic:
              - generic: Projets accompagnés
              - generic: "47"
              - generic:
                - generic: Musique
                - generic: Tech
                - generic: Immo
      - generic [ref=e188]:
        - generic [ref=e195]: 01 / 05
        - generic [ref=e196]:
          - button "Précédent" [ref=e197] [cursor=pointer]:
            - generic [ref=e198]: 
          - button "Suivant" [ref=e199] [cursor=pointer]:
            - generic [ref=e200]: 
  - generic [ref=e203]:
    - generic [ref=e204]:
      - generic [ref=e205]:
        - generic [ref=e206]:
          - generic [ref=e207]: "02"
          - text: — Sites à vendre
        - heading "Des sites prêts à déployer." [level=2] [ref=e208]
      - generic [ref=e209]: Des projets complets — design, code et contenu — à racheter et déployer immédiatement sous votre marque.
    - generic [ref=e210]:
      - generic [ref=e211] [cursor=pointer]:
        - generic [ref=e212]:
          - generic [ref=e214]: 
          - generic [ref=e215]: Disponible
        - generic [ref=e216]:
          - generic [ref=e217]: Site E-commerce Prêt-à-Porter
          - generic [ref=e218]: Boutique complète avec panier, paiement, gestion stock.
          - generic [ref=e219]:
            - generic [ref=e220]: Next.js
            - generic [ref=e221]: Stripe
            - generic [ref=e222]: Tailwind
          - generic [ref=e223]:
            - generic [ref=e224]: 350 000 FCFA
            - link "Voir les détails " [ref=e225]:
              - /url: projet-detail.html?id=ex1
              - text: Voir les détails
              - generic [ref=e226]: 
      - generic [ref=e227] [cursor=pointer]:
        - generic [ref=e228]:
          - generic [ref=e230]: 
          - generic [ref=e231]: Disponible
        - generic [ref=e232]:
          - generic [ref=e233]: Plateforme Formation en Ligne
          - generic [ref=e234]: "LMS complet : cours vidéo, quiz, certificats, espace élève."
          - generic [ref=e235]:
            - generic [ref=e236]: React
            - generic [ref=e237]: Supabase
            - generic [ref=e238]: Video.js
          - generic [ref=e239]:
            - generic [ref=e240]: 500 000 FCFA
            - link "Voir les détails " [ref=e241]:
              - /url: projet-detail.html?id=ex2
              - text: Voir les détails
              - generic [ref=e242]: 
      - generic [ref=e243] [cursor=pointer]:
        - generic [ref=e244]:
          - generic [ref=e246]: 
          - generic [ref=e247]: Réservé
        - generic [ref=e248]:
          - generic [ref=e249]: Site Vitrine Agence Digitale
          - generic [ref=e250]: Portfolio animé, formulaire de devis, blog intégré.
          - generic [ref=e251]:
            - generic [ref=e252]: HTML
            - generic [ref=e253]: CSS
            - generic [ref=e254]: GSAP
          - generic [ref=e255]:
            - generic [ref=e256]: 180 000 FCFA
            - link "Voir les détails " [ref=e257]:
              - /url: projet-detail.html?id=ex3
              - text: Voir les détails
              - generic [ref=e258]: 
  - generic [ref=e260]:
    - generic [ref=e261]:
      - generic [ref=e262]:
        - generic [ref=e263]:
          - generic [ref=e264]: "03"
          - text: — Formations
        - heading "Apprenez. Lancez. Encaissez." [level=2] [ref=e265]
      - generic [ref=e266]: Formations à paiement direct et prix fixe — accès immédiat dès l'accord. Des PDF complets aux sessions live accompagnées.
    - generic [ref=e267]:
      - link " Débutant PDF Populaire Print On Demand Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité. 40 000 FCFA 25 000 FCFA 4 modules PDF " [ref=e268] [cursor=pointer]:
        - /url: formation-detail.html?slug=print-on-demand&t=afro
        - generic [ref=e270]: 
        - generic [ref=e271]:
          - generic [ref=e272]: Débutant
          - generic [ref=e273]: PDF
          - generic [ref=e274]: Populaire
        - generic [ref=e275]: Print On Demand
        - generic [ref=e276]: Créez et vendez votre marque de vêtements en ligne sans jamais stocker une seule unité.
        - generic [ref=e277]:
          - generic [ref=e278]:
            - generic [ref=e279]: 40 000 FCFA
            - generic [ref=e280]: 25 000 FCFA
            - generic [ref=e281]: 4 modules PDF
          - generic [ref=e283]: 
      - link " Intermédiaire ● Live Nouveau Musique & IA Créez de la musique professionnelle avec l'IA et transformez-la en source de revenus durables. 35 000 FCFA 3 séances live " [ref=e284] [cursor=pointer]:
        - /url: formation-detail.html?slug=musique-ia&t=afro
        - generic [ref=e286]: 
        - generic [ref=e287]:
          - generic [ref=e288]: Intermédiaire
          - generic [ref=e289]: ● Live
          - generic [ref=e290]: Nouveau
        - generic [ref=e291]: Musique & IA
        - generic [ref=e292]: Créez de la musique professionnelle avec l'IA et transformez-la en source de revenus durables.
        - generic [ref=e293]:
          - generic [ref=e294]:
            - generic [ref=e295]: 35 000 FCFA
            - generic [ref=e296]: 3 séances live
          - generic [ref=e298]: 
      - link " Débutant PDF Produits Digitaux Ebooks, templates, tunnels de vente — créez une source de revenus 100% automatisée. 35 000 FCFA 20 000 FCFA 5 modules PDF " [ref=e299] [cursor=pointer]:
        - /url: formation-detail.html?slug=produits-digitaux&t=afro
        - generic [ref=e301]: 
        - generic [ref=e302]:
          - generic [ref=e303]: Débutant
          - generic [ref=e304]: PDF
        - generic [ref=e305]: Produits Digitaux
        - generic [ref=e306]: Ebooks, templates, tunnels de vente — créez une source de revenus 100% automatisée.
        - generic [ref=e307]:
          - generic [ref=e308]:
            - generic [ref=e309]: 35 000 FCFA
            - generic [ref=e310]: 20 000 FCFA
            - generic [ref=e311]: 5 modules PDF
          - generic [ref=e313]: 
      - link " Débutant ● Live Live Sites Web avec l'IA Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique. 45 000 FCFA 3 séances live d'1h " [ref=e314] [cursor=pointer]:
        - /url: formation-detail.html?slug=sites-web-ia&t=afro
        - generic [ref=e316]: 
        - generic [ref=e317]:
          - generic [ref=e318]: Débutant
          - generic [ref=e319]: ● Live
          - generic [ref=e320]: Live
        - generic [ref=e321]: Sites Web avec l'IA
        - generic [ref=e322]: Créez votre site web professionnel en 3 sessions accompagnées, même sans expérience technique.
        - generic [ref=e323]:
          - generic [ref=e324]:
            - generic [ref=e325]: 45 000 FCFA
            - generic [ref=e326]: 3 séances live d'1h
          - generic [ref=e328]: 
      - link " Intermédiaire PDF Immobilier Locatif Maîtrisez les stratégies de sous-location et d'investissement immobilier rentable. 50 000 FCFA 30 000 FCFA 6 modules PDF " [ref=e329] [cursor=pointer]:
        - /url: formation-detail.html?slug=immobilier-locatif&t=afro
        - generic [ref=e331]: 
        - generic [ref=e332]:
          - generic [ref=e333]: Intermédiaire
          - generic [ref=e334]: PDF
        - generic [ref=e335]: Immobilier Locatif
        - generic [ref=e336]: Maîtrisez les stratégies de sous-location et d'investissement immobilier rentable.
        - generic [ref=e337]:
          - generic [ref=e338]:
            - generic [ref=e339]: 50 000 FCFA
            - generic [ref=e340]: 30 000 FCFA
            - generic [ref=e341]: 6 modules PDF
          - generic [ref=e343]: 
      - link " Voir toutes les formations Catalogue complet · Prix fixes · Accès immédiat Catalogue → " [ref=e344] [cursor=pointer]:
        - /url: formations.html
        - generic [ref=e346]: 
        - generic [ref=e347]: Voir toutes les formations
        - generic [ref=e348]: Catalogue complet · Prix fixes · Accès immédiat
        - generic [ref=e349]:
          - generic [ref=e351]: Catalogue →
          - generic [ref=e353]: 
  - generic [ref=e356]:
    - generic [ref=e357]:
      - generic [ref=e358]: Programme spécial
      - heading "L'Incubateur Africademia." [level=2] [ref=e360]
      - paragraph [ref=e361]: Accompagnement stratégique et investissements ciblés pour les projets à fort potentiel — musique, startups, immobilier et business innovants.
    - generic [ref=e362]:
      - generic [ref=e363]:
        - generic [ref=e364]:
          - generic [ref=e365]:
            - generic [ref=e366]: 
            - text: Musique
          - generic [ref=e367]:
            - generic [ref=e368]: 
            - text: Startups
          - generic [ref=e369]:
            - generic [ref=e370]: 
            - text: Immobilier
          - generic [ref=e371]:
            - generic [ref=e372]: 
            - text: Innovation
        - generic [ref=e373]:
          - generic [ref=e374]:
            - generic [ref=e375]: "01"
            - generic [ref=e376]:
              - generic [ref=e377]: Soumettez votre dossier
              - text: Décrivez votre projet en quelques lignes via WhatsApp.
          - generic [ref=e378]:
            - generic [ref=e379]: "02"
            - generic [ref=e380]:
              - generic [ref=e381]: Étude personnalisée
              - text: Notre équipe analyse votre dossier individuellement sous 72h.
          - generic [ref=e382]:
            - generic [ref=e383]: "03"
            - generic [ref=e384]:
              - generic [ref=e385]: Accompagnement & financement
              - text: Stratégie, réseau, investissement selon la validation.
        - generic [ref=e386]:
          - link " Soumettre mon dossier sur WhatsApp" [ref=e387] [cursor=pointer]:
            - /url: https://wa.me/22369656610?text=Bonjour+Africademia+%F0%9F%91%8B+Je+souhaite+candidater+%C3%A0+l%27Incubateur.+Voici+mon+projet+%3A+%5Bsecteur+%2F+id%C3%A9e%5D.+Je+dispose+d%27un+passeport+valide+et+d%27un+compte+bancaire+actif.+Pouvez-vous+%C3%A9tudier+mon+dossier+%3F
            - generic [ref=e388]: 
            - text: Soumettre mon dossier sur WhatsApp
          - generic [ref=e389]:
            - generic [ref=e390]: 
            - text: Réponse sous 72h · Étude gratuite · Aucun engagement
      - generic [ref=e391]:
        - generic [ref=e392]:
          - generic [ref=e393]: Sur étude de dossier
          - generic [ref=e394]: Chaque projet est évalué individuellement par notre équipe.
        - generic [ref=e395]:
          - generic [ref=e396]:
            - generic [ref=e398]: 
            - paragraph [ref=e399]: Passeport valide obligatoire
          - generic [ref=e400]:
            - generic [ref=e402]: 
            - paragraph [ref=e403]: Compte bancaire actif requis
          - generic [ref=e404]:
            - generic [ref=e406]: 
            - paragraph [ref=e407]: Présentation claire du projet
          - generic [ref=e408]:
            - generic [ref=e410]: 
            - paragraph [ref=e411]: Chaque dossier étudié individuellement
  - generic [ref=e414]:
    - paragraph [ref=e415]:
      - generic [ref=e416]: Le
      - generic [ref=e417]: monde
      - generic [ref=e418]: regorge
      - generic [ref=e419]: de
      - generic [ref=e420]: talent.
      - generic [ref=e421]: Africademia
      - text: existe pour le rendre
      - generic [ref=e422]: visible
      - text: — et rentable.
    - generic [ref=e423]: — L'équipe Africademia
  - generic [ref=e425]:
    - generic [ref=e426]:
      - generic [ref=e427]:
        - generic [ref=e428]:
          - generic [ref=e429]: "04"
          - text: — FAQ
        - heading "Vos questions." [level=2] [ref=e430]
      - generic [ref=e431]: Une autre question ? Khadidja, notre assistante digitale, vous répond en quelques secondes.
    - generic [ref=e432]:
      - generic [ref=e433] [cursor=pointer]:
        - generic [ref=e434]:
          - heading "Comment se déroule un projet ?" [level=4] [ref=e435]
          - generic [ref=e436]: +
        - generic [ref=e437]: Tout commence par un échange avec Khadidja, qui cerne votre besoin. Vous recevez ensuite un aperçu (maquette, proposition) et un devis personnalisé. Vous ne vous engagez qu'une fois la direction validée.
      - generic [ref=e438] [cursor=pointer]:
        - generic [ref=e439]:
          - heading "Le devis est-il adapté à mon pays ?" [level=4] [ref=e440]
          - generic [ref=e441]: +
        - generic: "Oui. Chaque devis est construit sur-mesure selon votre marché — Afrique francophone, Europe, Canada ou ailleurs. Aucune mauvaise surprise : vous savez précisément ce que vous obtenez."
      - generic [ref=e442] [cursor=pointer]:
        - generic [ref=e443]:
          - heading "Comment se passent les formations ?" [level=4] [ref=e444]
          - generic [ref=e445]: +
        - generic: "Les formations sont à prix fixe et à paiement direct : dès l'accord, vous recevez le lien de paiement, puis l'accès au PDF complet ou la planification de vos sessions live."
      - generic [ref=e446] [cursor=pointer]:
        - generic [ref=e447]:
          - heading "Qui peut rejoindre l'incubateur ?" [level=4] [ref=e448]
          - generic [ref=e449]: +
        - generic: Les porteurs de projet disposant d'un passeport valide et d'un compte bancaire actif. Chaque dossier est étudié individuellement avant validation.
      - generic [ref=e450] [cursor=pointer]:
        - generic [ref=e451]:
          - heading "Travaillez-vous à l'international ?" [level=4] [ref=e452]
          - generic [ref=e453]: +
        - generic: Absolument. Africademia accompagne les entrepreneurs en Afrique, en Europe, au Canada et partout dans le monde, avec un discours et une offre adaptés à chaque marché.
  - generic [ref=e454]:
    - generic: Ad
    - generic [ref=e455]:
      - heading "Construisons votre marque." [level=2] [ref=e456]:
        - text: Construisons
        - text: votre marque.
      - paragraph [ref=e457]: Parlez à Khadidja, notre assistante digitale. Elle cerne votre besoin et vous oriente vers la bonne solution — en quelques minutes.
      - generic [ref=e458]:
        - link "Démarrer sur WhatsApp " [ref=e459] [cursor=pointer]:
          - /url: https://wa.me/22369656610?text=Bonjour+Khadidja+%F0%9F%91%8B+Je+souhaite+en+savoir+plus+sur+vos+services.
          - text: Démarrer sur WhatsApp
          - generic [ref=e460]: 
        - link "Demander un devis gratuit" [ref=e461] [cursor=pointer]:
          - /url: https://wa.me/22369656610?text=Bonjour+Khadidja+%F0%9F%91%8B+Je+souhaite+un+devis+gratuit+pour+mon+projet.
  - contentinfo [ref=e462]:
    - generic [ref=e463]:
      - generic [ref=e464]:
        - generic [ref=e465]:
          - generic [ref=e466]:
            - text: Africa
            - generic [ref=e468]: demia
          - paragraph [ref=e469]: Le partenaire de croissance digitale des entrepreneurs ambitieux — en Afrique et dans le monde.
        - generic [ref=e470]:
          - generic [ref=e471]:
            - heading "Services" [level=5] [ref=e472]
            - link "Sites web" [ref=e473] [cursor=pointer]:
              - /url: service-detail.html?slug=creation-site-web
            - link "Image de marque" [ref=e474] [cursor=pointer]:
              - /url: service-detail.html?slug=marketing-digital
            - link "Publicité" [ref=e475] [cursor=pointer]:
              - /url: service-detail.html?slug=publicite
            - link "Hébergement" [ref=e476] [cursor=pointer]:
              - /url: service-detail.html?slug=hebergement
          - generic [ref=e477]:
            - heading "Apprendre" [level=5] [ref=e478]
            - link "Formations" [ref=e479] [cursor=pointer]:
              - /url: service-detail.html?slug=ia-sites
            - link "Incubateur" [ref=e480] [cursor=pointer]:
              - /url: "#incubateur"
            - link "Sites avec l'IA" [ref=e481] [cursor=pointer]:
              - /url: service-detail.html?slug=ia-sites
          - generic [ref=e482]:
            - heading "Contact" [level=5] [ref=e483]
            - link "WhatsApp" [ref=e484] [cursor=pointer]:
              - /url: "#contact"
            - link "Devis gratuit" [ref=e485] [cursor=pointer]:
              - /url: "#contact"
            - link "Khadidja" [ref=e486] [cursor=pointer]:
              - /url: "#contact"
      - generic [ref=e487]:
        - generic [ref=e488]: © 2025 Africademia. Tous droits réservés.
        - generic [ref=e489]: Afrique · Europe · Canada · International
  - text: 
```

# Test source

```ts
  832  | test.describe('16. Accessibilité', () => {
  833  |   test('lang="fr" sur toutes les pages', async ({ page }) => {
  834  |     for (const p of PUBLIC_PAGES.slice(0, 5)) {
  835  |       await page.goto(p.url, { waitUntil: 'domcontentloaded' });
  836  |       const lang = await page.getAttribute('html', 'lang');
  837  |       expect(lang, `lang manquant sur ${p.name}`).toMatch(/^fr/);
  838  |     }
  839  |   });
  840  | 
  841  |   test('charset UTF-8 déclaré', async ({ page }) => {
  842  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  843  |     const charset = await page.evaluate(() =>
  844  |       document.querySelector('meta[charset]')?.getAttribute('charset')
  845  |     );
  846  |     expect(charset?.toLowerCase()).toBe('utf-8');
  847  |   });
  848  | 
  849  |   test('Burger a aria-label', async ({ page }) => {
  850  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  851  |     const label = await page.getAttribute('#navBurger', 'aria-label');
  852  |     expect(label).toBeTruthy();
  853  |   });
  854  | 
  855  |   test('viewport meta tag présent', async ({ page }) => {
  856  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  857  |     const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
  858  |     expect(viewport).toContain('width=device-width');
  859  |     expect(viewport).toContain('initial-scale=1');
  860  |   });
  861  | 
  862  |   test('Images avec loading=lazy', async ({ page }) => {
  863  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  864  |     await page.waitForTimeout(1000);
  865  |     const imgs = page.locator('img[loading="lazy"]');
  866  |     const count = await imgs.count();
  867  |     // Si des images sont présentes (fallback sites à vendre), elles doivent être lazy
  868  |     const allImgs = await page.locator('img').count();
  869  |     if (allImgs > 0 && count === 0) {
  870  |       console.warn('Images présentes sans loading=lazy');
  871  |     }
  872  |   });
  873  | 
  874  |   test('Boutons ont des labels accessibles', async ({ page }) => {
  875  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  876  |     const buttons = page.locator('button:not([aria-label]):not([aria-labelledby])');
  877  |     const count = await buttons.count();
  878  |     for (let i = 0; i < count; i++) {
  879  |       const txt = await buttons.nth(i).innerText();
  880  |       const label = await buttons.nth(i).getAttribute('aria-label');
  881  |       if (!label && !txt.trim()) {
  882  |         console.warn(`Bouton ${i} sans texte ni aria-label`);
  883  |       }
  884  |     }
  885  |   });
  886  | });
  887  | 
  888  | /* ═══════════════════════════════════════════════════════════════════════════
  889  |    17. PERFORMANCES
  890  | ═══════════════════════════════════════════════════════════════════════════ */
  891  | test.describe('17. Performance', () => {
  892  |   test('Loader disparaît en moins de 4s', async ({ page }) => {
  893  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  894  |     await page.waitForTimeout(4000);
  895  |     const loader = page.locator('#afc-loader');
  896  |     const isVisible = await loader.isVisible();
  897  |     expect(isVisible, 'Loader encore visible après 4s').toBe(false);
  898  |   });
  899  | 
  900  |   test('Accueil charge en moins de 8s', async ({ page }) => {
  901  |     const start = Date.now();
  902  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  903  |     const elapsed = Date.now() - start;
  904  |     expect(elapsed, `Trop lent : ${elapsed}ms`).toBeLessThan(8000);
  905  |   });
  906  | 
  907  |   test('CSS principal chargé (variables CSS accessibles)', async ({ page }) => {
  908  |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  909  |     const gold = await page.evaluate(() =>
  910  |       getComputedStyle(document.documentElement).getPropertyValue('--gold').trim()
  911  |     );
  912  |     expect(gold, 'Variables CSS non chargées (--gold manquante)').toBeTruthy();
  913  |   });
  914  | 
  915  |   test('GSAP chargé', async ({ page }) => {
  916  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  917  |     await page.waitForTimeout(500);
  918  |     const gsap = await page.evaluate(() => typeof window.gsap !== 'undefined');
  919  |     expect(gsap, 'GSAP non chargé').toBe(true);
  920  |   });
  921  | });
  922  | 
  923  | /* ═══════════════════════════════════════════════════════════════════════════
  924  |    18. ERREURS JS CRITIQUES
  925  | ═══════════════════════════════════════════════════════════════════════════ */
  926  | test.describe('18. Erreurs JavaScript', () => {
  927  |   for (const p of PUBLIC_PAGES) {
  928  |     test(`Pas d'erreur JS — ${p.name}`, async ({ page }) => {
  929  |       const errs = collectErrors(page);
  930  |       await page.goto(p.url, { waitUntil: 'networkidle' });
  931  |       await page.waitForTimeout(1500);
> 932  |       expect(errs, `Erreurs JS sur ${p.name} : ${errs.join('; ')}`).toHaveLength(0);
       |                                                                     ^ Error: Erreurs JS sur Accueil : console.error: Failed to load resource: the server responded with a status of 500 (); console.error: Failed to load resource: the server responded with a status of 500 ()
  933  |     });
  934  |   }
  935  | });
  936  | 
  937  | /* ═══════════════════════════════════════════════════════════════════════════
  938  |    19. RESSOURCES 404 (assets CSS/JS)
  939  | ═══════════════════════════════════════════════════════════════════════════ */
  940  | test.describe('19. Ressources manquantes', () => {
  941  |   test('Accueil — aucune ressource CSS/JS en 404', async ({ page }) => {
  942  |     const failed = [];
  943  |     page.on('response', res => {
  944  |       const url = res.url();
  945  |       const st = res.status();
  946  |       if (st === 404 && (url.includes('.css') || url.includes('.js'))) {
  947  |         failed.push(`404: ${url}`);
  948  |       }
  949  |     });
  950  |     await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  951  |     expect(failed, `Ressources manquantes : ${failed.join(', ')}`).toHaveLength(0);
  952  |   });
  953  | 
  954  |   test('Formations — aucune ressource CSS/JS en 404', async ({ page }) => {
  955  |     const failed = [];
  956  |     page.on('response', res => {
  957  |       const st = res.status();
  958  |       const url = res.url();
  959  |       if (st === 404 && (url.includes('.css') || url.includes('.js'))) {
  960  |         failed.push(`404: ${url}`);
  961  |       }
  962  |     });
  963  |     await page.goto('/formations.html', { waitUntil: 'networkidle' });
  964  |     expect(failed, `Ressources manquantes : ${failed.join(', ')}`).toHaveLength(0);
  965  |   });
  966  | });
  967  | 
  968  | /* ═══════════════════════════════════════════════════════════════════════════
  969  |    20. MULTI-VIEWPORT — layout non cassé
  970  | ═══════════════════════════════════════════════════════════════════════════ */
  971  | test.describe('20. Multi-viewport layout', () => {
  972  |   for (const vp of MOBILE_VIEWPORTS) {
  973  |     test(`Accueil — pas de scroll horizontal — ${vp.name}`, async ({ page }) => {
  974  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  975  |       await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  976  |       await page.waitForTimeout(600);
  977  |       const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
  978  |       expect(scrollW, `Scroll horizontal détecté (${scrollW}px > ${vp.width}px)`).toBeLessThanOrEqual(vp.width + 5);
  979  |     });
  980  | 
  981  |     test(`Accueil — H1 visible — ${vp.name}`, async ({ page }) => {
  982  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  983  |       await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  984  |       await page.waitForTimeout(1200);
  985  |       await expect(page.locator('.hero h1')).toBeVisible();
  986  |     });
  987  | 
  988  |     test(`Accueil — bouton CTA visible et cliquable — ${vp.name}`, async ({ page }) => {
  989  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  990  |       await page.goto('/direction-afromodern.html', { waitUntil: 'networkidle' });
  991  |       await page.waitForTimeout(1200);
  992  |       const btn = page.locator('.hero-cta .btn').first();
  993  |       await expect(btn).toBeVisible();
  994  |       const box = await btn.boundingBox();
  995  |       expect(box.width, 'Bouton trop étroit').toBeGreaterThan(50);
  996  |     });
  997  | 
  998  |     test(`Accueil — footer visible en bas — ${vp.name}`, async ({ page }) => {
  999  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  1000 |       await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1001 |       const footer = page.locator('footer');
  1002 |       await expect(footer).toBeAttached();
  1003 |     });
  1004 |   }
  1005 | });
  1006 | 
  1007 | /* ═══════════════════════════════════════════════════════════════════════════
  1008 |    21. MISSION & MARQUEE
  1009 | ═══════════════════════════════════════════════════════════════════════════ */
  1010 | test.describe('21. Mission & Marquee', () => {
  1011 |   test('Section Mission présente', async ({ page }) => {
  1012 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1013 |     await expect(page.locator('.mission')).toBeAttached();
  1014 |     const txt = await page.locator('.mission .big').innerText();
  1015 |     expect(txt).toContain('Africademia');
  1016 |   });
  1017 | 
  1018 |   test('Signature Mission présente', async ({ page }) => {
  1019 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1020 |     await expect(page.locator('.mission .sig')).toBeAttached();
  1021 |   });
  1022 | 
  1023 |   test('Ticker marquee contient 2 tracks (loop)', async ({ page }) => {
  1024 |     await page.goto('/direction-afromodern.html', { waitUntil: 'domcontentloaded' });
  1025 |     const tracks = page.locator('.ticker-track > div');
  1026 |     await expect(tracks).toHaveCount(2);
  1027 |   });
  1028 | });
  1029 | 
  1030 | /* ═══════════════════════════════════════════════════════════════════════════
  1031 |    22. VIDEO MODAL
  1032 | ═══════════════════════════════════════════════════════════════════════════ */
```