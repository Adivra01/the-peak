(() => {
 const section=document.querySelector('.service-clarity');if(!section)return;
 const faq=document.querySelector('.faq');if(faq){const details=[...faq.querySelectorAll('details')];details.forEach(d=>d.addEventListener('toggle',()=>{if(d.open)details.filter(x=>x!==d).forEach(x=>x.open=false)}))}
 const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
 if(reduced||!window.gsap||!window.ScrollTrigger)return;
 window.gsap.registerPlugin(window.ScrollTrigger);
 window.gsap.fromTo(section.querySelectorAll('.clarity-copy,.clarity-deliverables'),{y:38,opacity:0},{y:0,opacity:1,duration:.9,stagger:.14,ease:'power3.out',scrollTrigger:{trigger:section,start:'top 78%'}});
 window.gsap.utils.toArray('main > .section, .closing').forEach(el=>window.gsap.fromTo(el.querySelectorAll('.wrap > *'),{y:22,opacity:0},{y:0,opacity:1,duration:.7,stagger:.06,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 82%'}}));
})();
