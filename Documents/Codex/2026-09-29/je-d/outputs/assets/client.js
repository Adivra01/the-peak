(async()=>{
  const $=id=>document.getElementById(id),say=t=>{$('status').textContent=t};
  const safe=v=>String(v||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  $('logout').addEventListener('click',async e=>{
    const button=e.currentTarget;button.disabled=true;button.textContent='Déconnexion…';
    try{await window.peakSignOut?.()}catch{}
    location.replace(new URL('connexion.html?logged_out=1',location.href).href);
  });
  try{
    let tries=0;while(!window.peakSupabase&&tries++<80)await new Promise(r=>setTimeout(r,50));
    const sb=window.peakSupabase;if(!sb)throw Error('Supabase indisponible.');
    const {data:{user},error}=await sb.auth.getUser();if(error||!user){if(location.protocol==='file:'){say('Cette prévisualisation file:// ne retrouve pas la session Supabase après le changement de fichier. Ouvre le site avec une adresse locale http://localhost pour tester les espaces.');return}location.replace('connexion.html');return}
    const {data:profile,error:profileError}=await sb.from('profiles').select('role,full_name,company,phone').eq('id',user.id).maybeSingle();
    if(profileError)throw profileError;
    if(profile?.role!=='client'){
      const destination=profile?.role==='admin'?'admin.html':'connexion.html';
      location.replace(new URL(destination,location.href).href);
      return;
    }
    $('welcome').textContent=`Bonjour ${(profile?.full_name||user.email||'client').split(' ')[0]}.`;
    $('identity').textContent=`Espace associé à ${user.email}${profile?.company?' · '+profile.company:''}.`;
    const terminationForm=$('termination-form'),terminationStatus=$('termination-status');
    const loadTermination=async()=>{const {data,error}=await sb.from('account_termination_requests').select('id,status,requested_at,admin_note').eq('user_id',user.id).order('requested_at',{ascending:false}).limit(1).maybeSingle();if(error)throw error;if(data?.status==='pending'||data?.status==='processing'){terminationStatus.textContent='Votre demande est en attente de validation par THEPEEAK.';terminationForm.querySelector('[type=submit]').disabled=true;terminationForm.querySelector('[name=confirm]').disabled=true}else if(data?.status==='rejected'){terminationStatus.textContent=`Votre dernière demande a été refusée.${data.admin_note?' Motif : '+data.admin_note:''} Vous pouvez en envoyer une nouvelle.`}else if(data?.status==='approved'){terminationStatus.textContent='Votre compte a été résilié.';terminationForm.hidden=true}};
    terminationForm?.addEventListener('submit',async e=>{e.preventDefault();const submit=terminationForm.querySelector('[type=submit]');if(!terminationForm.elements.confirm.checked)return;submit.disabled=true;terminationStatus.textContent='Envoi de votre demande…';try{const {error}=await sb.from('account_termination_requests').insert({user_id:user.id,client_email:user.email||'',client_name:profile?.full_name||'',reason:terminationForm.elements.reason.value.trim(),status:'pending'});if(error)throw error;terminationForm.elements.confirm.checked=false;await loadTermination()}catch(error){terminationStatus.textContent=error.message||'La demande n’a pas pu être enregistrée.';submit.disabled=false}});
    await loadTermination();
    const {data:projects,error:projectError}=await sb.from('client_projects').select('id,title,service_slug,summary,status,progress,next_step,due_date,updated_at').order('updated_at',{ascending:false});if(projectError)throw projectError;
    const box=$('client-projects'),states={discovery:'Cadrage',design:'Design',development:'Développement',review:'Validation',delivered:'Livré',paused:'En pause'};
    if(box){
      box.innerHTML=projects?.length?projects.map(p=>`<article class="client-card"><span class="eyebrow2">${states[p.status]||p.status} · ${p.progress}%</span><h2>${safe(p.title)}</h2><p>${safe(p.summary)}</p><div class="progress"><i style="width:${p.progress}%"></i></div><p><strong>Prochaine étape :</strong> ${safe(p.next_step||'À définir')}</p><div data-updates="${p.id}"></div></article>`).join(''):'<article class="client-card"><h2>Votre projet apparaîtra ici</h2><p>Une fois votre espace relié à un accompagnement THEPEEAK, vous retrouverez ici les étapes, avancées et prochaines actions.</p></article>';
      for(const p of projects||[]){const target=box.querySelector(`[data-updates="${p.id}"]`);const {data:updates}=await sb.from('project_updates').select('body,created_at').eq('project_id',p.id).order('created_at',{ascending:false}).limit(5);if(target&&updates?.length)target.innerHTML=`<h3>Dernières nouvelles</h3>${updates.map(u=>`<p>${safe(u.body)} <small>${new Date(u.created_at).toLocaleDateString('fr-FR')}</small></p>`).join('')}`}
    }
  }catch(e){say(e.message||'Connexion au compte indisponible.')}
})();
