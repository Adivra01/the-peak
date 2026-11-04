(() => {
  const params = new URLSearchParams(location.search);
  const service = document.querySelector('[name="service_interesse"]');
  const subject = document.querySelector('[name="sujet"]');
  if (service && params.has('service')) service.value = params.get('service');
  const lang = () => window.peakLocale?.language || document.documentElement.lang || 'fr';
  const messages = {
    fr:{hello:'Bonjour THEPEEAK,',intro:'Je vous contacte au sujet de mon projet.',name:'Nom',phone:'Téléphone / WhatsApp',email:'E-mail',service:'Expertise',subject:'Objet',budget:'Budget indicatif',project:'Mon projet',missing:'Non renseigné',noEmail:'Non communiqué',undefined:'À définir',discuss:'À discuter',emailButton:'Envoyer par e-mail',whatsappButton:'Continuer sur WhatsApp',emailHelp:'Votre message sera envoyé à contact@thepeeak.com. Vous recevrez une confirmation ici.',whatsappHelp:'WhatsApp est sélectionné. Votre demande complète s’ouvrira dans WhatsApp ; appuyez sur Envoyer pour nous la transmettre.',sending:'Envoi de votre e-mail sécurisé…',preparing:'Préparation de votre demande WhatsApp…',sent:'Votre e-mail a été transmis à THEPEEAK. Merci, nous reviendrons vers vous.',opened:'WhatsApp va s’ouvrir avec votre message. Appuyez sur Envoyer pour nous le transmettre.'},
    en:{hello:'Hello THEPEEAK,',intro:'I am contacting you about my project.',name:'Name',phone:'Phone / WhatsApp',email:'Email',service:'Service',subject:'Subject',budget:'Estimated budget',project:'My project',missing:'Not provided',noEmail:'Not provided',undefined:'To be defined',discuss:'To discuss',emailButton:'Send by email',whatsappButton:'Continue on WhatsApp',emailHelp:'Your message will be sent to contact@thepeeak.com. You will see a confirmation here.',whatsappHelp:'Your complete request will open in WhatsApp; tap Send to deliver it.',sending:'Sending your email securely…',preparing:'Preparing your WhatsApp request…',sent:'Your email has been sent to THEPEEAK. We will get back to you.',opened:'WhatsApp will open with your message. Tap Send to deliver it.'},
    es:{hello:'Hola THEPEEAK,',intro:'Les contacto sobre mi proyecto.',name:'Nombre',phone:'Teléfono / WhatsApp',email:'Correo electrónico',service:'Servicio',subject:'Asunto',budget:'Presupuesto estimado',project:'Mi proyecto',missing:'No indicado',noEmail:'No indicado',undefined:'Por definir',discuss:'Por consultar',emailButton:'Enviar por correo',whatsappButton:'Continuar en WhatsApp',emailHelp:'Su mensaje se enviará a contact@thepeeak.com. Verá una confirmación aquí.',whatsappHelp:'Su solicitud completa se abrirá en WhatsApp; pulse Enviar para transmitirla.',sending:'Enviando su correo de forma segura…',preparing:'Preparando su solicitud de WhatsApp…',sent:'Su correo se ha enviado a THEPEEAK. Le responderemos pronto.',opened:'WhatsApp se abrirá con su mensaje. Pulse Enviar para transmitirlo.'},
    it:{hello:'Buongiorno THEPEEAK,',intro:'Vi contatto per il mio progetto.',name:'Nome',phone:'Telefono / WhatsApp',email:'E-mail',service:'Servizio',subject:'Oggetto',budget:'Budget indicativo',project:'Il mio progetto',missing:'Non indicato',noEmail:'Non indicata',undefined:'Da definire',discuss:'Da discutere',emailButton:'Invia via e-mail',whatsappButton:'Continua su WhatsApp',emailHelp:'Il messaggio sarà inviato a contact@thepeeak.com. Vedrai una conferma qui.',whatsappHelp:'La richiesta completa si aprirà in WhatsApp; premi Invia per trasmetterla.',sending:'Invio sicuro dell’e-mail…',preparing:'Preparazione della richiesta WhatsApp…',sent:'La tua e-mail è stata inviata a THEPEEAK. Ti risponderemo presto.',opened:'WhatsApp si aprirà con il messaggio. Premi Invia per trasmetterlo.'}
  };
  const m = () => messages[lang()] || messages.fr;
  if (subject && params.has('subject')) {
    const original = params.get('subject').slice(0,255);
    let suggested = '';
    const localizeSuggestedSubject = () => {
      if (subject.value && subject.value !== suggested) return;
      suggested = original.split('—').map(part => window.peakLocale?.translate?.(part.trim()) || part.trim()).join(' — ');
      subject.value = suggested;
    };
    localizeSuggestedSubject();
    window.addEventListener('peak:languagechange', localizeSuggestedSubject);
  }

  const saveRequest = async (p) => {
    let tries = 0;
    while (!window.peakSupabase && tries++ < 30) await new Promise((resolve) => setTimeout(resolve, 50));
    if (!window.peakSupabase) throw new Error('Connexion aux demandes indisponible.');
    const { data: { user } } = await window.peakSupabase.auth.getUser();
    const { error } = await window.peakSupabase.from('service_requests').insert({
      user_id: user?.id || null,
      name: p.nom,
      email: p.email || '',
      phone: p.telephone || '',
      service_slug: p.service_interesse || '',
      subject: p.sujet,
      budget: p.budget_estime || '',
      message: p.message,
      source: p.source || 'site'
    });
    if (error) throw error;
  };

  const requestMessage = (p) => [
    m().hello,
    '',
    m().intro,
    `${m().name} : ${p.nom}`,
    `${m().phone} : ${p.telephone || m().missing}`,
    `${m().email} : ${p.email || m().noEmail}`,
    `${m().service} : ${service?.selectedOptions?.[0]?.textContent?.trim() || p.service_interesse || m().undefined}`,
    `${m().subject} : ${p.sujet}`,
    `${m().budget} : ${p.budget_estime || m().discuss}`,
    '',
    `${m().project} :`,
    p.message
  ].join('\n');

  document.querySelectorAll('.contact-form').forEach((form) => {
    const email = form.querySelector('[name="email"]');
    const channelInputs = form.querySelectorAll('[name="channel"]');
    const submit = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');

    const selectedChannel = () => form.querySelector('[name="channel"]:checked')?.value || 'whatsapp';
    const updateChannel = () => {
      const needsEmail = selectedChannel() === 'email';
      email.required = needsEmail;
      email.setAttribute('aria-required', String(needsEmail));
      submit.innerHTML = `${needsEmail ? m().emailButton : m().whatsappButton} <span class="arrow">↗</span>`;
      status.textContent = needsEmail
        ? m().emailHelp : m().whatsappHelp;
    };
    channelInputs.forEach((input) => input.addEventListener('change', updateChannel));
    window.addEventListener('peak:languagechange', updateChannel);
    updateChannel();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const payload = Object.fromEntries(new FormData(form));
      if (payload.website) return;
      const channel = selectedChannel();
      submit.disabled = true;
      status.textContent = channel === 'email' ? m().sending : m().preparing;

      try {
        if (channel === 'whatsapp') {
          window.peakAnalytics?.track?.('whatsapp_click');
          const destination = `https://wa.me/22369656610?text=${encodeURIComponent(requestMessage(payload))}`;
          const whatsappWindow = window.open('about:blank', '_blank');
          if (whatsappWindow) whatsappWindow.opener = null;
          try {
            await Promise.race([
              saveRequest(payload),
              new Promise((resolve) => setTimeout(resolve, 1800))
            ]);
          } catch (error) {
            console.warn('La demande WhatsApp ne figure pas dans le tableau admin.', error?.message || '');
          }
          if (whatsappWindow) whatsappWindow.location.replace(destination);
          else location.assign(destination);
          status.textContent = m().opened;
          return;
        }

        const response = await fetch(new URL('../api/send-contact.php', document.querySelector('script[src*="contact-form.js"]').src), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'L’envoi e-mail est indisponible. Réessayez ou choisissez WhatsApp.');
        window.peakAnalytics?.track?.('contact_submit');
        try {
          await saveRequest(payload);
        } catch (error) {
          console.warn('E-mail transmis, mais enregistrement CRM impossible.', error?.message || '');
        }
        form.reset();
        const defaultChannel = form.querySelector('[name="channel"][value="whatsapp"]');
        if (defaultChannel) defaultChannel.checked = true;
        updateChannel();
        status.textContent = m().sent;
      } catch (error) {
        status.textContent = error.message || 'L’envoi a échoué. Réessayez ou contactez-nous sur WhatsApp.';
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
