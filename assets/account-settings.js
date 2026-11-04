(() => {
  const boot = async () => {
    let tries = 0;
    while (!window.peakSupabase && tries++ < 80) await new Promise(resolve => setTimeout(resolve, 50));
    const sb = window.peakSupabase;
    if (!sb) return;

    const host = document.querySelector('.admin-user') || document.querySelector('.client-head');
    if (!host) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'account-settings-button';
    button.textContent = 'Mon profil · Paramètres';
    host.insertBefore(button, host.lastElementChild);

    const dialog = document.createElement('dialog');
    dialog.className = 'account-dialog';
    dialog.id = 'account-settings-dialog';
    dialog.setAttribute('aria-labelledby', 'account-settings-title');
    dialog.innerHTML = `<form id="account-settings-form"><header class="account-settings-head"><div><span>ESPACE SÉCURISÉ</span><h2 id="account-settings-title">Profil & accès</h2></div><button type="button" class="account-settings-close" aria-label="Fermer">×</button></header><label>E-mail de connexion<input name="email" type="email" autocomplete="email" maxlength="255" required></label><p class="account-help">Supabase envoie deux confirmations : une à l’adresse actuelle et une à la nouvelle. Valide les deux liens pour activer le changement.</p><p class="account-help account-email-pending" hidden></p><label>Nom complet<input name="full_name" autocomplete="name" maxlength="255"></label><label>Téléphone<input name="phone" type="tel" autocomplete="tel" maxlength="50"></label><label>Entreprise<input name="company" autocomplete="organization" maxlength="255"></label><div class="account-divider">Changer le mot de passe</div><p class="account-help">Laisse les deux champs vides si tu ne souhaites pas le changer.</p><label>Nouveau mot de passe<input name="password" type="password" autocomplete="new-password" minlength="8"></label><label>Confirmer le mot de passe<input name="confirm" type="password" autocomplete="new-password" minlength="8"></label><p class="account-settings-status" role="status" aria-live="polite"></p><div class="account-settings-actions"><button type="button" class="account-settings-close">Annuler</button><button type="submit">Enregistrer les changements</button></div></form>`;
    document.body.append(dialog);

    const form = dialog.querySelector('form');
    const status = dialog.querySelector('.account-settings-status');
    const messages = {
      fr: {
        pending: (pending, current) => `Changement en attente vers ${pending}. Confirme les messages reçus sur l’ancienne et la nouvelle adresse. L’adresse actuelle reste ${current} jusqu’à la seconde validation.`,
        reconnect: 'Reconnecte-toi pour modifier ton profil.', loading: 'Chargement du profil…', saving: 'Enregistrement…', expired: 'Session expirée. Reconnecte-toi.',
        shortPassword: 'Le mot de passe doit contenir au moins 8 caractères.', mismatch: 'Les mots de passe ne correspondent pas.',
        saved: 'Profil enregistré.', failed: 'Impossible d’enregistrer les changements.',
        confirmation: (email, previous) => `Profil enregistré. Pour activer ${email}, valide les deux e-mails de Supabase : celui reçu sur ${previous} et celui reçu sur ${email}. Ne refais pas la demande avant d’avoir confirmé les deux liens.`
      },
      en: {
        pending: (pending, current) => `Change to ${pending} pending. Confirm the links sent to both addresses. Your current address remains ${current} until the second confirmation.`,
        reconnect: 'Sign in again to edit your profile.', loading: 'Loading profile…', saving: 'Saving…', expired: 'Session expired. Sign in again.',
        shortPassword: 'Your password must contain at least 8 characters.', mismatch: 'Passwords do not match.',
        saved: 'Profile saved.', failed: 'Could not save changes.',
        confirmation: (email, previous) => `Profile saved. To activate ${email}, confirm both Supabase emails: one sent to ${previous} and one to ${email}. Do not submit another request before confirming both links.`
      },
      es: {
        pending: (pending, current) => `Cambio a ${pending} pendiente. Confirma los enlaces enviados a ambas direcciones. Tu dirección actual seguirá siendo ${current} hasta la segunda confirmación.`,
        reconnect: 'Vuelve a iniciar sesión para editar tu perfil.', loading: 'Cargando perfil…', saving: 'Guardando…', expired: 'La sesión ha caducado. Inicia sesión de nuevo.',
        shortPassword: 'La contraseña debe tener al menos 8 caracteres.', mismatch: 'Las contraseñas no coinciden.',
        saved: 'Perfil guardado.', failed: 'No se pudieron guardar los cambios.',
        confirmation: (email, previous) => `Perfil guardado. Para activar ${email}, confirma los dos correos de Supabase: el enviado a ${previous} y el enviado a ${email}. No envíes otra solicitud antes de confirmar ambos enlaces.`
      },
      it: {
        pending: (pending, current) => `Modifica a ${pending} in attesa. Conferma i link inviati a entrambi gli indirizzi. L’indirizzo attuale resta ${current} fino alla seconda conferma.`,
        reconnect: 'Accedi di nuovo per modificare il profilo.', loading: 'Caricamento profilo…', saving: 'Salvataggio…', expired: 'Sessione scaduta. Accedi di nuovo.',
        shortPassword: 'La password deve contenere almeno 8 caratteri.', mismatch: 'Le password non coincidono.',
        saved: 'Profilo salvato.', failed: 'Impossibile salvare le modifiche.',
        confirmation: (email, previous) => `Profilo salvato. Per attivare ${email}, conferma entrambe le email di Supabase: quella inviata a ${previous} e quella inviata a ${email}. Non inviare una nuova richiesta prima di confermare entrambi i link.`
      }
    };
    const m = () => messages[window.peakLocale?.language] || messages.fr;
    let originalEmail = '';
    let pendingEmail = '';
    const pendingKey = id => `thepeeak-pending-email-${id}`;
    function updatePendingMessage(user) {
      const message = dialog.querySelector('.account-email-pending');
      const stored = (() => { try { return localStorage.getItem(pendingKey(user.id)) || ''; } catch { return ''; } })();
      pendingEmail = (user.new_email || stored || '').trim();
      if (pendingEmail && pendingEmail.toLowerCase() === (user.email || '').toLowerCase()) {
        pendingEmail = '';
        try { localStorage.removeItem(pendingKey(user.id)); } catch {}
      }
      message.hidden = !pendingEmail;
      message.textContent = pendingEmail ? m().pending(pendingEmail, user.email) : '';
    }

    button.addEventListener('click', async () => {
      dialog.showModal();
      status.textContent = m().loading;
      const { data: { session }, error } = await sb.auth.getSession();
      const user = session?.user;
      if (error || !user) {
        status.textContent = m().reconnect;
        return;
      }
      const { data } = await sb.from('profiles').select('full_name,phone,company').eq('id', user.id).maybeSingle();
      originalEmail = (user.email || '').trim();
      updatePendingMessage(user);
      form.elements.email.value = originalEmail;
      form.elements.full_name.value = data?.full_name || '';
      form.elements.phone.value = data?.phone || '';
      form.elements.company.value = data?.company || '';
      form.elements.password.value = '';
      form.elements.confirm.value = '';
      status.textContent = '';
    });

    dialog.querySelectorAll('.account-settings-close').forEach(element => element.addEventListener('click', () => dialog.close()));
    dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

    form.addEventListener('submit', async event => {
      event.preventDefault();
      const submit = form.querySelector('[type=submit]');
      submit.disabled = true;
      status.textContent = m().saving;
      try {
        const { data: { user }, error: authError } = await sb.auth.getUser();
        if (authError || !user) throw Error(m().expired);

        const email = form.elements.email.value.trim();
        const full_name = form.elements.full_name.value.trim();
        const phone = form.elements.phone.value.trim();
        const company = form.elements.company.value.trim();
        const password = form.elements.password.value;
        const confirm = form.elements.confirm.value;
        if (password || confirm) {
          if (password.length < 8) throw Error(m().shortPassword);
          if (password !== confirm) throw Error(m().mismatch);
        }

        const { error: profileError } = await sb.from('profiles').update({ full_name, phone, company, updated_at: new Date().toISOString() }).eq('id', user.id);
        if (profileError) throw profileError;

        const emailChanged = email.toLowerCase() !== originalEmail.toLowerCase();
        if (emailChanged) {
          if (email.toLowerCase() !== pendingEmail.toLowerCase()) {
            const { error } = await sb.auth.updateUser({ email }, { emailRedirectTo: 'https://thepeeak.com/connexion.html' });
            if (error) throw error;
            pendingEmail = email;
            try { localStorage.setItem(pendingKey(user.id), email); } catch {}
          }
        }
        if (password) {
          const { error } = await sb.auth.updateUser({ password });
          if (error) throw error;
        }

        const name = document.getElementById('welcome');
        if (name && full_name) name.textContent = `Bonjour ${full_name.split(' ')[0]}.`;
        form.elements.password.value = '';
        form.elements.confirm.value = '';
        if (emailChanged) {
          status.textContent = m().confirmation(email, originalEmail);
          updatePendingMessage({...user,new_email:pendingEmail});
        } else {
          status.textContent = m().saved;
        }
      } catch (error) {
        status.textContent = error.message || m().failed;
      } finally {
        submit.disabled = false;
      }
    });
  };
  boot();
})();
