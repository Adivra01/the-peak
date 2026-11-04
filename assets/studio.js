(() => {
 'use strict';
 const toggle=document.querySelector('.menu-button'),nav=document.querySelector('.nav-links');
 const closeMenu=()=>{if(!toggle||!nav)return;nav.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.textContent='Menu +'};
 toggle?.addEventListener('click',()=>{const open=!nav.classList.contains('open');nav.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Fermer ×':'Menu +'});
 nav?.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav?.classList.contains('open')){closeMenu();toggle.focus()}});
 const picker=document.getElementById('need-picker');
 if(picker){const update=()=>{const option=picker.selectedOptions[0],slug=option.value;document.getElementById('need-title').textContent=option.dataset.title;document.getElementById('need-description').textContent=option.dataset.description;document.getElementById('need-service').href='services/'+slug+'.html';const q=new URLSearchParams({service:slug,subject:'Mon projet — '+option.textContent.trim()});document.getElementById('need-contact').href='contact.html?'+q.toString()};picker.addEventListener('change',update);update()}
 document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)return;
 const animate=()=>{if(!window.gsap||reduced.matches)return;const targets=document.querySelectorAll('[data-reveal]');if(!('IntersectionObserver' in window))return;const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;window.gsap.fromTo(entry.target,{y:22},{y:0,duration:.75,ease:'power3.out',clearProps:'transform'});observer.unobserve(entry.target)}),{threshold:.12});targets.forEach(el=>observer.observe(el));const heroChildren=document.querySelectorAll('.hero-copy > *');if(heroChildren.length)window.gsap.fromTo(heroChildren,{y:16},{y:0,stagger:.09,duration:.9,ease:'power3.out',clearProps:'transform'})};
 if(window.gsap)animate();else{const script=document.createElement('script');script.src='https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';script.onload=animate;document.head.appendChild(script)}
})();
