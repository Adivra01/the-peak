# Resend — configuration Hostinger pour THEPEEAK

Le site est hébergé comme un site PHP. Le formulaire envoie les demandes par WhatsApp par défaut. Si le visiteur choisit l’e-mail, `api/send-contact.php` appelle directement l’API HTTP de Resend. Le SDK Python montré dans la documentation jointe ne s’applique pas à cette route PHP.

## Configuration du serveur

1. Déployer le contenu du ZIP dans `public_html` sur `thepeeak.com`, en gardant le dossier `api` et `api/.htaccess`.
2. Vérifier que PHP 8.1 ou plus récent et l’extension cURL sont actifs.
3. Dans les variables d’environnement PHP configurées côté serveur Hostinger, définir `RESEND_API_KEY` avec la clé Resend. Ne pas mettre la clé dans un fichier JavaScript, HTML, le dépôt Git ou le ZIP.
4. Si le plan Hostinger ne transmet pas de variable d’environnement à PHP, créer manuellement `public_html/api/.env` sur le serveur à partir de `api/.env.example`, puis y mettre la clé. `api/.htaccess` bloque l’accès HTTP à ce fichier. Ne jamais ajouter la vraie clé au dossier local avant de générer le ZIP.
5. Dans Resend, vérifier le domaine d’envoi `thepeeak.com` et autoriser `contact@thepeeak.com` comme expéditeur. Le destinataire des demandes est aussi `contact@thepeeak.com`; les réponses utilisent l’adresse du visiteur.

## Parcours et diagnostic

- WhatsApp reste le choix par défaut et ouvre le message prérempli. Le visiteur doit appuyer sur **Envoyer** dans WhatsApp.
- Le choix e-mail transmet le formulaire à `api/send-contact.php`. Le site n’annonce la réussite qu’après une réponse HTTP réussie de Resend.
- Si la clé manque, cURL est désactivé, l’expéditeur n’est pas validé ou Resend refuse la requête, le formulaire affiche une erreur et propose WhatsApp.
- Pour vérifier la configuration en production, envoyer une demande réelle depuis `https://thepeeak.com/contact.html` après le déploiement et confirmer la réception dans `contact@thepeeak.com` ainsi que dans le journal des e-mails Resend. Le serveur local statique ne peut pas exécuter cette route PHP.

Une clé Resend publiée dans une conversation ou dans un dépôt doit être révoquée dans Resend et remplacée par une nouvelle clé dans Hostinger.
