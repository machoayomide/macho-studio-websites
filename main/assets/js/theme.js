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

;(()=>{if(!document.head.querySelector('link[rel="icon"]')){const link=document.createElement('link');link.rel='icon';link.type='image/svg+xml';link.href='/favicon.svg';document.head.append(link)}})();

;(()=>{const header=document.querySelector('.header');if(!header)return;let queued=false;const render=()=>{queued=false;header.classList.toggle('is-condensed',window.scrollY>40)};window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(render)}},{passive:true});render()})();

/* Shared MACHO branding on home and inner pages; specialist areas are content, not logos. */
;(()=>{document.querySelectorAll('.wordmark').forEach(el=>{
 el.setAttribute('aria-label','MACHO home');
 const label=el.querySelector('span:not(.wordmark-icon)');
 if(label)label.innerHTML='MACHO<span class="wordmark-dot">.</span>';
});
document.querySelectorAll('.footer-brand').forEach(el=>{el.innerHTML='MACHO<span>.</span>'});
})();

/* Progressive GSAP/ScrollTrigger enhancement: never blocks first paint or navigation. */
;(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const urls=[
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
  location.pathname.startsWith('/assets/')?'/assets/js/motion-system.js?v=20261019-launch3':'/assets/js/motion-system.js?v=20261019-launch3'
 ];
 const load=url=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.async=true;s.onload=resolve;s.onerror=()=>reject(new Error('Motion library not reachable'));document.head.append(s)});
 const go=()=>load(urls[0]).then(()=>load(urls[1])).then(()=>load(urls[2])).catch(()=>{});
 const start=()=>{if('requestIdleCallback' in window)requestIdleCallback(go,{timeout:1200});else setTimeout(go,200)};
 if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();

/* Optional visitor activity notifications — same privacy design across MACHO sites. */
;(()=>{const s=document.createElement('script');s.defer=true;s.src='/assets/js/visitor-activity.js?v=20261019-launch3';document.head.append(s)})();
