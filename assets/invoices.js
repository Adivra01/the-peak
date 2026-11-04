(() => {
  const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const statusLabels={draft:'Brouillon',sent:'Envoyée',partial:'Payée partiellement',paid:'Payée',overdue:'En retard',cancelled:'Annulée'};
  const viewIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const editIcon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="m16.5 3.5 4 4L8 20H4v-4L16.5 3.5Z"/></svg>';
  const termsDefault='Paiement à effectuer avant la date d’échéance.\nMerci pour votre confiance.\nPour toute question, veuillez nous contacter.';
  let db,allInvoices=[],filter='all',activePdfUrl=null,previewGeneration=0;
  const today=()=>new Date().toISOString().slice(0,10);
  const currency=n=>`${new Intl.NumberFormat('fr-FR',{maximumFractionDigits:0}).format(Math.round(Number(n)||0))} FCFA`;
  const dateLabel=value=>value?new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(new Date(`${value}T12:00:00`)):'—';
  const setStatus=(text,error=false)=>{const box=$('invoice-status');box.textContent=text;box.classList.toggle('error',error)};
  const setEditorStatus=(text,error=false)=>{const box=$('invoice-editor-status');box.textContent=text;box.classList.toggle('error',error)};
  const waitDb=()=>new Promise((resolve,reject)=>{let i=0;const poll=()=>window.peakSupabase?resolve(window.peakSupabase):i++>100?reject(Error('Supabase est indisponible.')):setTimeout(poll,50);poll()});
  function bind(){
    document.querySelector('[data-view="billing"]')?.addEventListener('click',loadInvoices);
    $('invoice-new').addEventListener('click',()=>openEditor());
    $('invoice-add-line').addEventListener('click',()=>addLine());
    $('invoice-lines').addEventListener('input',updateTotals);
    $('invoice-lines').addEventListener('click',e=>{if(e.target.closest('[data-invoice-remove]')){e.target.closest('tr').remove();if(!$('invoice-lines').children.length)addLine();updateTotals()}});
    $('invoice-form').addEventListener('input',updateTotals);
    $('invoice-form').addEventListener('submit',saveInvoice);
    $('invoice-preview-draft').addEventListener('click',()=>renderPreview(formData(),true));
    $('invoice-filters').addEventListener('click',e=>{const b=e.target.closest('[data-invoice-filter]');if(!b)return;filter=b.dataset.invoiceFilter;$('invoice-filters').querySelectorAll('[data-invoice-filter]').forEach(x=>x.classList.toggle('active',x===b));renderList()});
    $('invoice-list').addEventListener('click',e=>{const preview=e.target.closest('[data-invoice-view]'),edit=e.target.closest('[data-invoice-edit]');if(preview){const invoice=allInvoices.find(x=>x.id===preview.dataset.invoiceView);if(invoice)renderPreview(invoice)}if(edit){const invoice=allInvoices.find(x=>x.id===edit.dataset.invoiceEdit);if(invoice)openEditor(invoice)}});
    $('invoice-preview-dialog').addEventListener('click',e=>{if(e.target===$('invoice-preview-dialog'))$('invoice-preview-dialog').close();if(e.target.closest('[data-invoice-close]'))$('invoice-preview-dialog').close()});
    $('invoice-preview-dialog').addEventListener('close',()=>{previewGeneration++;if(activePdfUrl){URL.revokeObjectURL(activePdfUrl);activePdfUrl=null}});
    $('invoice-form').elements.status.addEventListener('change',()=>{
      const f=$('invoice-form'),status=f.elements.status.value,total=totals().total;
      if(status==='paid'){f.elements.paid_amount.value=total;if(!f.elements.paid_on.value)f.elements.paid_on.value=today()}
      if(status==='partial'&&!f.elements.paid_on.value)f.elements.paid_on.value=today();
      updateTotals();
    });
    $('invoice-form').elements.paid_amount.addEventListener('input',()=>{
      const f=$('invoice-form'),paid=Number(f.elements.paid_amount.value)||0,total=totals().total;
      if(paid>0&&paid<total)f.elements.status.value='partial';
      else if(paid>=total&&total>0)f.elements.status.value='paid';
      else if(f.elements.status.value==='partial'||f.elements.status.value==='paid')f.elements.status.value='sent';
      if(paid>0&&!f.elements.paid_on.value)f.elements.paid_on.value=today();
      updateTotals();
    });
  }
  function openEditor(invoice){const f=$('invoice-form');f.reset();f.elements.id.value=invoice?.id||'';f.elements.invoice_number.value=invoice?.invoice_number||'';f.elements.status.value=invoice?.status||'draft';f.elements.issued_on.value=invoice?.issued_on||today();f.elements.due_on.value=invoice?.due_on||'';f.elements.paid_on.value=invoice?.paid_on||'';f.elements.paid_amount.value=invoice?.paid_amount??(invoice?.status==='paid'?invoice.total:0);const issuer=invoice?.issuer||{},customer=invoice?.customer||{};for(const key of ['company','address','city','phone','email','website'])f.elements[`issuer_${key}`].value=issuer[key]||({company:'THEPEEAK',city:'Bamako, Mali',phone:'+223 69 65 66 10',email:'contact@thepeeak.com',website:'https://thepeeak.com'}[key]||'');for(const key of ['name','company','address','city','phone','email'])f.elements[`customer_${key}`].value=customer[key]||'';f.elements.payment_terms.value=invoice?.payment_terms||termsDefault;f.elements.tax_rate.value=invoice?.tax_rate??0;$('invoice-editor-title').textContent=invoice?`Modifier ${invoice.invoice_number}`:'Nouvelle facture';setEditorStatus('');$('invoice-lines').innerHTML='';(invoice?.line_items?.length?invoice.line_items:[{}]).forEach(addLine);updateTotals();$('invoice-editor').showModal()}
  function addLine(item={}){const tr=document.createElement('tr');tr.innerHTML=`<td><input class="invoice-item-description" aria-label="Désignation" placeholder="Prestation, produit ou frais" maxlength="300" value="${esc(item.description||'')}"></td><td><input class="invoice-item-quantity" aria-label="Quantité" type="number" min="0" step="0.01" value="${Number(item.quantity??1)}"></td><td><input class="invoice-item-price" aria-label="Prix unitaire en FCFA" type="number" min="0" step="1" value="${Number(item.unit_price||0)}"></td><td class="invoice-item-amount">${currency(item.amount||0)}</td><td><button type="button" class="invoice-remove-line" data-invoice-remove aria-label="Supprimer la ligne">×</button></td>`;$('invoice-lines').append(tr)}
  function getLines(){return [...$('invoice-lines').querySelectorAll('tr')].map(row=>{const description=row.querySelector('.invoice-item-description').value.trim(),quantity=Number(row.querySelector('.invoice-item-quantity').value)||0,unit_price=Number(row.querySelector('.invoice-item-price').value)||0;return{description,quantity,unit_price,amount:Math.round(quantity*unit_price)}}).filter(x=>x.description||x.amount>0)}
  function totals(lines=getLines(),rate=Number($('invoice-form').elements.tax_rate.value)||0){const subtotal=lines.reduce((sum,line)=>sum+line.amount,0),tax_amount=Math.round(subtotal*rate/100);return{subtotal,tax_amount,total:subtotal+tax_amount}}
  function updateTotals(){if(!$('invoice-form'))return;for(const row of $('invoice-lines').querySelectorAll('tr')){const q=Number(row.querySelector('.invoice-item-quantity').value)||0,p=Number(row.querySelector('.invoice-item-price').value)||0;row.querySelector('.invoice-item-amount').textContent=currency(q*p)}const t=totals(),f=$('invoice-form'),paid=Number(f.elements.paid_amount.value)||0;$('invoice-subtotal').textContent=currency(t.subtotal);$('invoice-tax').textContent=currency(t.tax_amount);$('invoice-total').textContent=currency(t.total);$('invoice-balance').textContent=currency(Math.max(0,t.total-paid));if(paid>0&&paid<t.total&&f.elements.status.value==='paid')f.elements.status.value='partial'}
  function formData(){const f=$('invoice-form'),values=new FormData(f),value=k=>String(values.get(k)||'').trim(),lines=getLines(),rate=Number(value('tax_rate'))||0,t=totals(lines,rate),paid_amount=Number(value('paid_amount'))||0,requestedStatus=value('status')||'draft',status=requestedStatus==='cancelled'?'cancelled':paid_amount>0&&paid_amount<t.total?'partial':paid_amount===t.total&&t.total>0?'paid':requestedStatus;return{id:value('id'),invoice_number:value('invoice_number')||`À attribuer · ${new Date(`${value('issued_on')||today()}T12:00:00`).getFullYear()}`,status,issued_on:value('issued_on')||today(),due_on:value('due_on')||null,paid_on:paid_amount>0?(value('paid_on')||today()):null,paid_amount,issuer:Object.fromEntries(['company','address','city','phone','email','website'].map(k=>[k,value(`issuer_${k}`)])),customer:Object.fromEntries(['name','company','address','city','phone','email'].map(k=>[k,value(`customer_${k}`)])),line_items:lines,tax_rate:rate,payment_terms:value('payment_terms')||termsDefault,...t}}
  async function saveInvoice(e){e.preventDefault();const button=$('invoice-form').querySelector('[type="submit"]'),data=formData();if(!data.line_items.length){setEditorStatus('Ajoutez au moins une ligne de prestation ou de produit.',true);return}if(!Number.isSafeInteger(data.paid_amount)||data.paid_amount<0||data.paid_amount>data.total){setEditorStatus('Le montant encaissé doit être compris entre 0 et le total de la facture.',true);return}if(data.status==='partial'&&(data.paid_amount===0||data.paid_amount===data.total)){setEditorStatus('Pour un paiement partiel, indiquez un montant encaissé inférieur au total.',true);return}button.disabled=true;setEditorStatus('Enregistrement…');try{const {data:{user},error:userError}=await db.auth.getUser();if(userError||!user)throw Error('Votre session admin a expiré. Reconnectez-vous puis réessayez.');const payload={invoice_number:data.id?data.invoice_number:'',status:data.status,issued_on:data.issued_on,due_on:data.due_on,paid_on:data.paid_on,paid_amount:data.paid_amount,currency:'XOF',issuer:data.issuer,customer:data.customer,line_items:data.line_items,tax_rate:data.tax_rate,subtotal:data.subtotal,tax_amount:data.tax_amount,total:data.total,payment_terms:data.payment_terms,created_by:user.id,updated_at:new Date().toISOString()};let result;if(data.id)result=await db.from('invoices').update(payload).eq('id',data.id).select('*').single();else result=await db.from('invoices').insert(payload).select('*').single();if(result.error)throw result.error;setStatus(`Facture ${result.data.invoice_number} enregistrée.`);$('invoice-editor').close();await loadInvoices();window.refreshInvoiceDashboard?.()}catch(error){setEditorStatus(error.message||'La facture n’a pas pu être enregistrée.',true)}finally{button.disabled=false}}
  function renderList(){const rows=filter==='all'?allInvoices:allInvoices.filter(x=>x.status===filter);$('invoice-list').innerHTML=rows.length?rows.map(x=>`<tr><td><strong>${esc(x.invoice_number)}</strong><small>${dateLabel(x.issued_on)}</small></td><td>${esc(x.customer?.name||'Client')}<small>${esc(x.customer?.company||x.customer?.email||'')}</small></td><td>${dateLabel(x.issued_on)}</td><td>${dateLabel(x.due_on)}</td><td><span class="invoice-state ${esc(x.status)}">${statusLabels[x.status]||esc(x.status)}</span>${x.paid_on?`<small>Versement le ${dateLabel(x.paid_on)}</small>`:''}</td><td class="invoice-amount">${currency(x.total)}${Number(x.paid_amount)>0&&x.status==='partial'?`<small>Reste ${currency(Math.max(0,x.total-x.paid_amount))}</small>`:''}</td><td class="invoice-actions"><button type="button" class="invoice-action-icon" data-invoice-view="${x.id}" aria-label="Prévisualiser ${esc(x.invoice_number)}" title="Visualiser">${viewIcon}</button><button type="button" class="invoice-action-icon" data-invoice-edit="${x.id}" aria-label="Modifier ${esc(x.invoice_number)}" title="Modifier">${editIcon}</button></td></tr>`).join(''):'<tr><td colspan="7" class="invoice-empty">Aucune facture dans cette vue.</td></tr>'}
  async function loadInvoices(){if(!db)return;const {data,error}=await db.from('invoices').select('*').order('issued_on',{ascending:false}).order('created_at',{ascending:false});if(error){setStatus(error.message,true);return}allInvoices=data||[];renderList()}
  function invoiceRows(rows){return rows.map(row=>`<tr><td>${esc(row.description)}</td><td>${Number(row.quantity||0).toLocaleString('fr-FR')}</td><td>${currency(row.unit_price)}</td><td>${currency(row.amount)}</td></tr>`).join('')||'<tr><td colspan="4" class="invoice-blank-row">Aucune prestation renseignée.</td></tr>'}
  function invoiceTable(rows){return `<div class="invoice-print-lines"><table><thead><tr><th>DÉSIGNATION</th><th>QUANTITÉ</th><th>PRIX UNITAIRE</th><th>MONTANT</th></tr></thead><tbody>${invoiceRows(rows)}</tbody></table></div>`}
  function invoiceMeta(invoice,status){return `<div class="invoice-number-box"><div><span>N° FACTURE</span><strong>${esc(invoice.invoice_number||'À attribuer')}</strong></div><div><span>DATE D’ÉMISSION</span><strong>${dateLabel(invoice.issued_on)}</strong></div><div><span>DATE D’ÉCHÉANCE</span><strong>${dateLabel(invoice.due_on)}</strong></div>${invoice.paid_on?`<div><span>${invoice.status==='partial'?'DERNIER VERSEMENT':'DATE DE PAIEMENT'}</span><strong>${dateLabel(invoice.paid_on)}</strong></div>`:''}<div><span>STATUT</span><strong>${esc(status)}</strong></div></div>`}
  function partyDetails(issuer,customer){return `<section class="invoice-address-grid"><div><h2>FACTURÉ À</h2><span class="invoice-orange-rule"></span><p><strong>${esc(customer.name||'Nom du client')}</strong>${customer.company?`<br>${esc(customer.company)}`:''}${customer.address?`<br>${esc(customer.address)}`:''}${customer.city?`<br>${esc(customer.city)}`:''}${customer.email?`<br>${esc(customer.email)}`:''}${customer.phone?`<br>${esc(customer.phone)}`:''}</p></div><div><h2>ÉMIS PAR</h2><span class="invoice-orange-rule"></span><p><strong>${esc(issuer.company||'THEPEEAK')}</strong>${issuer.address?`<br>${esc(issuer.address)}`:''}${issuer.city?`<br>${esc(issuer.city)}`:''}${issuer.phone?`<br>${esc(issuer.phone)}`:''}${issuer.email?`<br>${esc(issuer.email)}`:''}${issuer.website?`<br>${esc(issuer.website)}`:''}</p></div></section>`}
  function invoicePage(invoice,rows,index,count,options={}){const issuer=invoice.issuer||{},customer=invoice.customer||{},status=statusLabels[invoice.status]||'Brouillon',t=totals(invoice.line_items||[],invoice.tax_rate),first=index===0,last=index===count-1,issuerAddress=`<address><strong>${esc(issuer.company||'THEPEEAK')}</strong>${issuer.address?`<span>${esc(issuer.address)}</span>`:''}${issuer.city?`<span>${esc(issuer.city)}</span>`:''}${issuer.phone?`<span>${esc(issuer.phone)}</span>`:''}${issuer.email?`<span>${esc(issuer.email)}</span>`:''}${issuer.website?`<span>${esc(issuer.website)}</span>`:''}</address>`,header=first?`<header class="invoice-masthead"><div class="invoice-scenery" aria-hidden="true"></div><div class="invoice-brand-block"><img src="thepeeak-logo-horizontal.png" alt="THEPEEAK">${issuerAddress}</div></header><div class="invoice-title-row"><div><h1>FACTURE</h1><span class="invoice-orange-rule"></span></div>${invoiceMeta(invoice,status)}</div>${partyDetails(issuer,customer)}`:`<header class="invoice-continuation-head"><img src="thepeeak-logo-horizontal.png" alt="THEPEEAK"><div><span>FACTURE · SUITE${last?' & RÉCAPITULATIF':''}</span><strong>${esc(invoice.invoice_number||'À attribuer')}</strong></div><small>Page ${index+1} / ${count}</small></header>`;const table=rows.length?invoiceTable(rows):'';const summary=last?`<section class="invoice-summary-row"><div class="invoice-terms"><h2>CONDITIONS DE PAIEMENT</h2><span class="invoice-orange-rule"></span><p>${esc(invoice.payment_terms||termsDefault)}</p></div><div class="invoice-totals"><div><span>SOUS-TOTAL</span><strong>${currency(t.subtotal)}</strong></div><div><span>TVA (${Number(invoice.tax_rate)||0}%)</span><strong>${currency(t.tax_amount)}</strong></div><div class="invoice-grand-total"><span>TOTAL</span><strong>${currency(t.total)}</strong></div>${Number(invoice.paid_amount)>0?`<div class="invoice-payment-row"><span>DÉJÀ RÉGLÉ</span><strong>${currency(invoice.paid_amount)}</strong></div><div class="invoice-balance-row"><span>RESTE À PAYER</span><strong>${currency(Math.max(0,t.total-invoice.paid_amount))}</strong></div>`:''}</div></section><footer class="invoice-signoff"><div class="invoice-thanks"><span class="invoice-orange-rule"></span><p>Merci pour votre confiance.<br>L’équipe<br><strong>${esc(issuer.company||'THEPEEAK')}</strong></p></div><div class="invoice-signature"><span>SIGNATURE / CACHET</span></div><div class="invoice-footer-scenery" aria-hidden="true"></div></footer>`:'';return `<article class="invoice-export-page ${first?'invoice-export-first':''} ${last?'invoice-export-last':''} ${Number(invoice.paid_amount)>0?'invoice-has-payment':''}">${header}${table}${summary}<footer class="invoice-page-foot"><span>THEPEEAK · Build what comes next.</span><span>${esc(invoice.invoice_number||'Facture')}</span></footer></article>`}
  async function buildInvoicePages(invoice){
    const lines=invoice.line_items||[],probe=document.createElement('div');
    probe.className='invoice-export-root';document.body.append(probe);
    try{
      await document.fonts?.ready;
      const fits=async(rows,index,count)=>{
        probe.innerHTML=invoicePage(invoice,rows,index,count);
        const page=probe.firstElementChild;
        await Promise.all([...page.querySelectorAll('img')].map(image=>image.decode().catch(()=>{})));
        return page.scrollHeight<=page.clientHeight+4;
      };
      if(await fits(lines,0,1))return[invoicePage(invoice,lines,0,1)];
      const chunks=[];let remaining=lines.slice();
      while(remaining.length){
        const index=chunks.length;
        if(await fits(remaining,index,index+1)){chunks.push(remaining);break}
        let low=0,high=remaining.length;
        while(low<high){const middle=Math.ceil((low+high)/2);if(await fits(remaining.slice(0,middle),index,index+2))low=middle;else high=middle-1}
        const take=Math.min(low,remaining.length-1);
        if(take<1){
          if(await fits(remaining,index,index+2)){chunks.push(remaining);chunks.push([]);break}
          throw Error('Une ligne ou les informations de la facture dépassent la zone imprimable A4. Raccourcissez la désignation, les coordonnées ou les conditions de paiement.');
        }
        chunks.push(remaining.slice(0,take));remaining=remaining.slice(take);
      }
      return chunks.map((rows,index)=>invoicePage(invoice,rows,index,chunks.length));
    }finally{probe.remove()}
  }
  async function renderPreview(invoice,draft=false){
    try{
      const pages=await buildInvoicePages(invoice),paper=$('invoice-paper');
      if(activePdfUrl){URL.revokeObjectURL(activePdfUrl);activePdfUrl=null}
      paper.innerHTML=`<div class="invoice-preview-pages">${pages.join('')}</div><div class="invoice-screen-actions" id="invoice-screen-actions"><p id="invoice-download-status" role="status" aria-live="polite">Préparation du PDF…</p><button type="button" class="button outline" data-invoice-close>Fermer</button><a class="button primary invoice-download-link" id="invoice-download-link" aria-disabled="true" tabindex="-1">Préparation du PDF…</a></div>`;
      paper.classList.toggle('invoice-is-draft',draft);$('invoice-preview-dialog').showModal();
      preparePdf($('invoice-download-link'),++previewGeneration);
    }catch(error){(draft?setEditorStatus:setStatus)(error.message||'L’aperçu de la facture n’a pas pu être créé.',true)}
  }
  async function preparePdf(link,generation){
    const paper=$('invoice-paper'),preview=paper.querySelector('.invoice-preview-pages');
    const feedback=$('invoice-download-status');
    if(!preview||!window.html2canvas||!window.jspdf?.jsPDF){
      const message='Le module PDF local est indisponible. Rechargez la page puis réessayez.';
      if(feedback)feedback.textContent=message;
      setStatus(message,true);
      return;
    }
    const invoiceNumber=paper.querySelector('.invoice-number-box strong')?.textContent||'facture';
    const filename=`facture-${invoiceNumber.replace(/[^a-z0-9-]+/gi,'-').replace(/^-|-$/g,'')||'THEPEEAK'}.pdf`;
    const root=document.createElement('div');
    root.className='invoice-export-root';
    root.innerHTML=preview.innerHTML;
    if(feedback)feedback.textContent='Création du document en cours…';
    document.body.append(root);
    try{
      await document.fonts?.ready;
      const pages=[...root.querySelectorAll('.invoice-export-page')];
      if(!pages.length)throw Error('Aucune page de facture à exporter.');
      const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
      for(let i=0;i<pages.length;i++){
        const page=pages[i];
        await Promise.all([...page.querySelectorAll('img')].map(image=>image.decode().catch(()=>{})));
        if(page.scrollHeight>page.clientHeight+4)throw Error(`La page ${i+1} dépasse le format A4. Raccourcissez la désignation ou les conditions de paiement.`);
        if(feedback)feedback.textContent=`Création du PDF ${i+1}/${pages.length}…`;
        const canvas=await window.html2canvas(page,{scale:2,useCORS:true,backgroundColor:'#f9fbfc',scrollY:0,windowWidth:page.scrollWidth,windowHeight:page.scrollHeight});
        if(!canvas.width||!canvas.height)throw Error(`La page ${i+1} n’a pas pu être rendue.`);
        if(i)pdf.addPage('a4','portrait');
        pdf.addImage(canvas.toDataURL('image/jpeg',.94),'JPEG',0,0,210,297,undefined,'FAST');
      }
      const blob=pdf.output('blob');
      if(blob.size<1000)throw Error('Le fichier PDF généré est vide.');
      if(generation!==previewGeneration)return;
      activePdfUrl=URL.createObjectURL(blob);
      link.href=activePdfUrl;
      link.download=filename;
      link.removeAttribute('aria-disabled');
      link.removeAttribute('tabindex');
      link.textContent='Télécharger le PDF ↓';
      const message=`${filename} prêt · ${pages.length} page${pages.length>1?'s':''}.`;
      if(feedback)feedback.textContent=message;
      setStatus(message);
    }catch(error){
      const message=error.message||'Le PDF n’a pas pu être créé.';
      if(feedback)feedback.textContent=message;
      setStatus(message,true);
    }finally{
      root.remove();
    }
  }
  async function init(){try{db=await waitDb();const {data:{user},error}=await db.auth.getUser();if(error||!user)return;const {data:profile}=await db.from('profiles').select('role').eq('id',user.id).maybeSingle();if(profile?.role!=='admin')return;bind();window.loadInvoices=loadInvoices;await loadInvoices()}catch(error){setStatus(error.message||'La facturation est indisponible.',true)}}
  init();
})();
