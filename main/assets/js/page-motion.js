(()=>{'use strict';
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
if(reduced.matches)return;
const targets=document.querySelectorAll('.footer-cta,.studio-end h2,.reviews-heading,.macho-portrait,.service-detail-heading');
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('macho-reveal-in');io.unobserve(e.target)}})},{threshold:.12});targets.forEach(e=>io.observe(e))}
const stage=document.querySelector('.kinetic-media'),words=[...document.querySelectorAll('.macho-hover-word')];
if(stage&&words.length){let pending=false;stage.addEventListener('pointermove',e=>{if(pending||e.pointerType==='touch')return;pending=true;requestAnimationFrame(()=>{words.forEach(w=>{const r=w.getBoundingClientRect();w.classList.toggle('is-near',Math.hypot(e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)<135)});pending=false})},{passive:true});stage.addEventListener('pointerleave',()=>words.forEach(w=>w.classList.remove('is-near')));words.forEach(w=>w.addEventListener('click',()=>{w.classList.remove('is-burst');requestAnimationFrame(()=>w.classList.add('is-burst'))}));words.forEach(w=>w.addEventListener('animationend',()=>w.classList.remove('is-burst')))}
})();
