(() => {
  const params = new URLSearchParams(location.search);
  const service = document.querySelector('[name="service_interesse"]');
  const subject = document.querySelector('[name="sujet"]');
  if (service && params.has('service')) service.value = params.get('service');
  if (subject && params.has('subject')) subject.value = params.get('subject').slice(0, 255);

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
    'Bonjour THEPEEAK,',
    '',
    'Je vous contacte au sujet de mon projet.',
    `Nom : ${p.nom}`,
    `Téléphone / WhatsApp : ${p.telephone || 'Non renseigné'}`,
    `E-mail : ${p.email || 'Non communiqué'}`,
    `Expertise : ${p.service_interesse || 'À définir'}`,
    `Objet : ${p.sujet}`,
    `Budget indicatif : ${p.budget_estime || 'À discuter'}`,
    '',
    'Mon projet :',
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
      submit.innerHTML = needsEmail
        ? 'Envoyer par e-mail <span class="arrow">↗</span>'
        : 'Continuer sur WhatsApp <span class="arrow">↗</span>';
      status.textContent = needsEmail
        ? 'Votre message sera envoyé à contact@thepeeak.com. Vous recevrez une confirmation ici.'
        : 'WhatsApp est sélectionné. Votre demande complète s’ouvrira dans WhatsApp ; appuyez sur Envoyer pour nous la transmettre.';
    };
    channelInputs.forEach((input) => input.addEventListener('change', updateChannel));
    updateChannel();

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const payload = Object.fromEntries(new FormData(form));
      if (payload.website) return;
      const channel = selectedChannel();
      submit.disabled = true;
      status.textContent = channel === 'email' ? 'Envoi de votre e-mail sécurisé…' : 'Préparation de votre demande WhatsApp…';

      try {
        if (channel === 'whatsapp') {
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
          status.textContent = 'WhatsApp va s’ouvrir avec votre message. Appuyez sur Envoyer pour nous le transmettre.';
          return;
        }

        const response = await fetch('api/send-contact.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(payload)
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.message || 'L’envoi e-mail est indisponible. Réessayez ou choisissez WhatsApp.');
        try {
          await saveRequest(payload);
        } catch (error) {
          console.warn('E-mail transmis, mais enregistrement CRM impossible.', error?.message || '');
        }
        form.reset();
        const defaultChannel = form.querySelector('[name="channel"][value="whatsapp"]');
        if (defaultChannel) defaultChannel.checked = true;
        updateChannel();
        status.textContent = 'Votre e-mail a été transmis à THEPEEAK. Merci, nous reviendrons vers vous.';
      } catch (error) {
        status.textContent = error.message || 'L’envoi a échoué. Réessayez ou contactez-nous sur WhatsApp.';
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
