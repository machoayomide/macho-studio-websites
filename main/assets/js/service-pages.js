/* Small progressive enhancements; all routes and content work without this file. */
(()=>{'use strict';
 const path=location.pathname.replace(/\/$/,'').replace(/\.html$/,'')||'/';
 document.querySelectorAll('header nav a').forEach(a=>{const u=new URL(a.href);if(u.origin===location.origin&&u.pathname===path)a.setAttribute('aria-current','page')});
 const toggle=document.getElementById('menu-toggle'),nav=document.getElementById('mobile-nav');
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&toggle&&nav){toggle.setAttribute('aria-expanded','false');nav.classList.remove('open')}});
 if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('macho-reveal');observer.unobserve(entry.target)}}),{threshold:.08});
 document.querySelectorAll('.service-map,.service-capabilities article,.service-tile,.service-problems article,.service-delivery li').forEach((el,i)=>{el.style.setProperty('--reveal-delay',((i%3)*.06)+'s');observer.observe(el)});
})();
