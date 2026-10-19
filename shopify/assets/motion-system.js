/* MACHO MOTION SYSTEM — GSAP ScrollTrigger, decorative motion only.
 * The websites remain readable and navigable with JavaScript or CDNs unavailable.
 */
(()=>{'use strict';
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const gsap=window.gsap,ScrollTrigger=window.ScrollTrigger;
const phone=matchMedia('(max-width: 760px)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
if(!gsap||!ScrollTrigger)return;
gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ignoreMobileResize:true,autoRefreshEvents:'visibilitychange,DOMContentLoaded,load'});
const home=document.body.classList.contains('page-home');
const isMain=!!document.querySelector('.header');
const reveal=(selector,options={})=>{
 const items=[...document.querySelectorAll(selector)];
 items.forEach((el,i)=>{
  if(el.closest('.shopify-kinetic')||el.closest('.macho-orbit-story'))return;
  gsap.fromTo(el,{autoAlpha:0,y:phone?22:38},{y:0,autoAlpha:1,duration:1.05,ease:'power3.out',immediateRender:false,scrollTrigger:{trigger:el,start:'top 91%',once:true,...options},overwrite:'auto'});
 });
};
if(isMain){
 const title=[...document.querySelectorAll('.kinetic-copy h1 > span')];
 if(title.length)gsap.from(title,{yPercent:28,opacity:0,duration:1.2,stagger:.14,ease:'power4.out',delay:.15,clearProps:'transform,opacity'});
 const blurb=document.querySelector('.kinetic-blurb');if(blurb)gsap.from(blurb,{y:21,opacity:0,duration:1,ease:'power2.out',delay:.65,clearProps:'all'});
 const portrait=document.querySelector('.macho-portrait-art');
 if(portrait)gsap.to(portrait,{y:phone?22:68,scale:1.06,ease:'none',scrollTrigger:{trigger:'.kinetic-hero',start:'top top',end:'bottom top',scrub:1.1}});
 reveal('.intro-statement h2,.section-header h2,.about-grid h2,.footer-cta-grid h2,.page-hero h1,.case-hero h1,.page-title,.section h2');
 reveal('.process-grid > *, .home-case-grid > *, .recognition-band .disciplines');
 const expertise=[...document.querySelectorAll('.expertise-row')];
 expertise.forEach((el,i)=>{
  const arrow=el.querySelector('.expertise-arrow');
  if(arrow)gsap.set(arrow,{transformOrigin:'50% 50%'});
  el.addEventListener('mouseenter',()=>arrow&&gsap.to(arrow,{rotation:45,x:5,duration:.4,ease:'power2.out',overwrite:true}));
  el.addEventListener('mouseleave',()=>arrow&&gsap.to(arrow,{rotation:0,x:0,duration:.4,ease:'power2.out',overwrite:true}));
 });
}else{
 reveal('.studio-story h2,.studio-landing-section h2,.detail-section h2');
 reveal('.studio-service-card,.studio-work,.problem-card,.layer-grid article,.studio-proof-strip > div');
 if(home){
  gsap.to('.kinetic-ring.ring-a',{rotation:70,duration:12,repeat:-1,ease:'none'});
  gsap.to('.kinetic-ring.ring-b',{rotation:-75,duration:16,repeat:-1,ease:'none'});
 }
}
const progress=document.createElement('div');progress.className='macho-reading-progress';progress.setAttribute('aria-hidden','true');
progress.innerHTML='<span></span>';document.body.append(progress);
gsap.fromTo(progress.firstChild,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:document.documentElement,start:'top top',end:'bottom bottom',scrub:.25}});
if(fine){
 const magnetic=[...document.querySelectorAll('.kinetic-primary,.kinetic-secondary,.button-mint,.header-cta,.head-cta')].filter(el=>!el.closest('.shopify-kinetic,.macho-orbit-story'));
 magnetic.forEach(el=>{
  let xTo=gsap.quickTo(el,'x',{duration:.28,ease:'power3.out'}),yTo=gsap.quickTo(el,'y',{duration:.28,ease:'power3.out'});
  el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();xTo(((e.clientX-r.left)/r.width-.5)*11);yTo(((e.clientY-r.top)/r.height-.5)*9)});
  el.addEventListener('pointerleave',()=>{xTo(0);yTo(0)});
  el.addEventListener('blur',()=>{xTo(0);yTo(0)});
 });
 document.querySelectorAll('.studio-work,.studio-service-card').forEach(card=>{
  const mx=gsap.quickTo(card,'rotationY',{duration:.35,ease:'power2.out'});
  const my=gsap.quickTo(card,'rotationX',{duration:.35,ease:'power2.out'});
  card.style.transformStyle='preserve-3d';
  card.addEventListener('pointermove',e=>{const r=card.getBoundingClientRect();const x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;mx(x*3.5);my(-y*3)});
  card.addEventListener('pointerleave',()=>{mx(0);my(0)});
 });
}
})();