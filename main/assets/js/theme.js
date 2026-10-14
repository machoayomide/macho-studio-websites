(function(){
'use strict';
// Gracefully replace externally hosted historical portfolio imagery if blocked/offline.
document.querySelectorAll('img[data-fallback]').forEach(img=>{
 const replaceImage=()=>{
  const local=img.getAttribute('data-fallback');
  if(local && img.src!==local){img.removeAttribute('data-fallback');img.src=local;img.alt='Illustrative project artwork';}
 };
 img.addEventListener('error',replaceImage,{once:true});
 if(img.complete && img.naturalWidth===0)replaceImage();
});
const toggle=document.getElementById('menu-toggle');
const menu=document.getElementById('mobile-nav');
if(toggle&&menu){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));menu.classList.toggle('open',open);});menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');menu.classList.remove('open');}));}
const reduced=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealEls=document.querySelectorAll('.reveal');
if(!reduced&&'IntersectionObserver' in window){const io=new IntersectionObserver((entries)=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');io.unobserve(entry.target);}});},{threshold:.12});revealEls.forEach(el=>io.observe(el));}else{revealEls.forEach(el=>el.classList.add('visible'));}
})();

;(()=>{const art=document.querySelector('.kinetic-wordart'),stage=document.querySelector('.kinetic-media');if(!stage||!art||window.matchMedia('(prefers-reduced-motion: reduce)').matches||window.matchMedia('(pointer: coarse)').matches)return;let pending=false;stage.addEventListener('pointermove',(event)=>{if(pending)return;pending=true;requestAnimationFrame(()=>{const r=stage.getBoundingClientRect();const x=(event.clientX-r.left)/r.width-.5,y=(event.clientY-r.top)/r.height-.5;art.style.setProperty('translate',(x*10).toFixed(1)+'px '+(y*8).toFixed(1)+'px');pending=false})});stage.addEventListener('pointerleave',()=>art.style.removeProperty('translate'))})();

;(()=>{document.querySelectorAll('.wordmark .wordmark-icon').forEach(old=>{const img=document.createElement('img');img.src='/assets/img/brand-mark.svg';img.alt='';img.width=43;img.height=31;img.className='studio-brand-icon';old.replaceWith(img)});})();
