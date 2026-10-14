(function(){'use strict';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#primary-nav');
if(menu&&nav){const setMenu=(open)=>{menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close main menu':'Open main menu');nav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open)};menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});}
// Real 3D scene lives in storefront-3d.js, loaded only on the homepage.
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const filters=[...document.querySelectorAll('[data-filter]')];if(filters.length){filters.forEach(b=>b.addEventListener('click',()=>{filters.forEach(x=>x.classList.toggle('active',x===b));const key=b.dataset.filter;document.querySelectorAll('.filterable').forEach(x=>{x.hidden=key!=='all'&&!x.dataset.category.includes(key)});}));}
const form=document.querySelector('#project-form');if(form){
 const params=new URLSearchParams(location.search);const assessmentRequested=params.get('assessment')==='1';
 let assessmentRecord=null;
 if(assessmentRequested){try{const raw=sessionStorage.getItem('macho_shopify_assessment_v1');const data=raw?JSON.parse(raw):null;if(data&&typeof data.summary==='string'&&Date.now()-data.created<3*60*60*1000){assessmentRecord=data;if(form.elements.project&&!form.elements.project.value)form.elements.project.value='I completed the free MACHO Store Check. Please help me verify the recommended improvements for my store.';const area=document.querySelector('#assessment-carry');if(area){area.hidden=false;area.querySelector('#assessment-preview').textContent=data.summary;}}}catch(e){/* Optional transfer unavailable */}}
 const selected=new URLSearchParams(location.search).get('service');if(selected&&form.elements.service){const choice=[...form.elements.service.options].find(x=>x.value===selected);if(choice)choice.selected=true}form.addEventListener('submit',e=>{e.preventDefault();const status=form.querySelector('.form-status');const output=document.querySelector('#brief-output');if(!form.reportValidity()){status.textContent='Please complete your name, valid email, service and project description.';return}let d=new FormData(form),message=['SHOPIFY PROJECT ENQUIRY','-----------------------','Name: '+d.get('name'),'Email: '+d.get('email'),'Store link: '+(d.get('store')||'Not supplied'),'Shopify plan: '+(d.get('plan')||'Not specified'),'Source: '+(d.get('source')||'Macho Studio for Shopify'),'Service: '+d.get('service'),'Budget: '+(d.get('budget')||'Not specified'),'Timeline: '+(d.get('timeline')||'Not specified'),'','Project details:',String(d.get('project'))].join('\n');
 if(assessmentRecord&&d.get('include_assessment')==='yes')message+='\n\n'+assessmentRecord.summary.slice(0,4000);document.querySelector('#brief-text').value=message;output.hidden=false;const whatsapp=document.querySelector('#send-whatsapp'),email=document.querySelector('#send-email');if(whatsapp)whatsapp.href='https://wa.me/2349160956794?text='+encodeURIComponent(message);if(email)email.href='mailto:machomanexpert@gmail.com?subject='+encodeURIComponent('Shopify project enquiry')+'&body='+encodeURIComponent(message);status.textContent='Your brief is ready. Choose WhatsApp or Email to send it; this page has not sent anything yet.';output.scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'})});const copy=document.querySelector('#copy-brief');copy?.addEventListener('click',async()=>{const textarea=document.querySelector('#brief-text');try{await navigator.clipboard.writeText(textarea.value);copy.textContent='Copied to clipboard ✓'}catch(e){textarea.focus();textarea.select();copy.textContent='Select and copy your brief'}setTimeout(()=>copy.textContent='Copy enquiry text ↗',3500)})}
})();

;(()=>{document.querySelectorAll('.site-header .brand').forEach(el=>{
 const old=el.querySelector('.brand-mark');if(old){const img=document.createElement('img');img.src='/assets/brand-mark.svg';img.width=43;img.height=31;img.alt='';img.className='studio-brand-icon';old.replaceWith(img)}
 const title=el.querySelector('.brand-word');if(title){title.innerHTML='MACHO<span class="brand-dot">.</span>'}
 el.setAttribute('aria-label','MACHO home')
});})();

/* Shared site-wide navigation. Keeps all specialist routes discoverable. */
;(()=>{
 const menuItems=[['Shopify SEO','shopify-seo'],['Conversion & UX','conversion-optimization'],['Backend Fixes','backend-fixes'],['Custom Themes','custom-themes'],['Figma to Shopify','figma-to-shopify'],['Migrations','migrations'],['Integrations','integrations'],['B2B and Wholesale','b2b-wholesale'],['Fixes and Speed','fixes-speed'],['Checkout and Functions','checkout-functions']];
 document.querySelectorAll('header.site-header #primary-nav').forEach(nav=>{
  nav.innerHTML='<a class="nav-store-check" href="/store-check/">Check My Store ↗</a><details class="studio-service-menu"><summary>Services</summary><div class="studio-service-menu-panel"><a href="/services/">All services</a>'+menuItems.map(([name,slug])=>'<a href="/services/'+slug+'/">'+name+'</a>').join('')+'</div></details><a href="/work/">Work</a><a href="/process/">Process</a><a href="/about/">About</a><a href="/faqs/">FAQs</a><a href="/contact/">Contact</a>';
  nav.addEventListener('click',e=>{if(!e.target.closest('a'))return;nav.classList.remove('open');document.body.classList.remove('menu-open');const button=document.querySelector('.menu-toggle');if(button)button.setAttribute('aria-expanded','false')});
  document.addEventListener('click',e=>{const detail=nav.querySelector('details');if(detail&&!detail.contains(e.target))detail.open=false});
 });
 document.querySelectorAll('footer a[href*="solutions/"]').forEach(a=>{const mappings={'custom-theme-development':'custom-themes','shopify-store-design':'figma-to-shopify','shopify-migrations':'migrations','shopify-integrations':'integrations','shopify-b2b':'b2b-wholesale','shopify-fixes-performance':'fixes-speed'};for(const [oldSlug,newSlug] of Object.entries(mappings)){if(a.getAttribute('href')?.includes(oldSlug)){a.href='/services/'+newSlug+'/';break}}});
})();
;(()=>{const header=document.querySelector('.site-header');if(!header)return;
let queued=false;const check=()=>{queued=false;header.classList.toggle('is-condensed',window.scrollY>40)};
window.addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(check)}},{passive:true});check();
})();

/* Universal MACHO identity. Shopify is a discipline, never part of the logo. */
;(()=>{
 document.querySelectorAll('.site-header .brand').forEach(el=>{el.setAttribute('aria-label','MACHO home');const label=el.querySelector('.brand-word');if(label)label.innerHTML='MACHO<span class="brand-dot">.</span>'});
 document.querySelectorAll('footer .big-brand').forEach(el=>el.innerHTML='MACHO<span>.</span>');
 document.querySelectorAll('footer .footer-bottom > span:first-child').forEach(el=>el.textContent='© 2026 MACHO · Independent development.');
 document.querySelectorAll('footer .footer-brand > p').forEach(el=>el.textContent='Independent Shopify development, migrations, and connected ecommerce systems.');
 document.querySelectorAll('footer a[href*="machostudio.dpdns.org"]').forEach(a=>a.textContent='Explore MACHO ↗');
 document.querySelectorAll('footer .studio-disclaimer').forEach(el=>el.textContent='Shopify is a trademark of Shopify Inc. MACHO is independent and is not run by Shopify.');
})();

/* Progressive GSAP/ScrollTrigger enhancement: never blocks first paint or navigation. */
;(()=>{
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 const urls=[
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js',
  'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js',
  '/assets/motion-system.js'
 ];
 const load=url=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.async=true;s.onload=resolve;s.onerror=()=>reject(new Error('Motion library not reachable'));document.head.append(s)});
 const go=()=>load(urls[0]).then(()=>load(urls[1])).then(()=>load(urls[2])).catch(()=>{});
 const start=()=>{if('requestIdleCallback' in window)requestIdleCallback(go,{timeout:1200});else setTimeout(go,200)};
 if(document.readyState==='complete')start();else addEventListener('load',start,{once:true});
})();

/* Load optional first-party visitor activity notice across Shopify pages. */
;(()=>{if(location.pathname.startsWith('/macho-activity/'))return;const s=document.createElement('script');s.defer=true;s.src='/assets/visitor-activity.js';document.head.append(s)})();

/* Preserve the exact catalog capability the visitor selected in their enquiry. */
;(()=>{
 const params=new URLSearchParams(location.search);
 const raw=params.get('topic');
 const topic=typeof raw==='string'?raw.replace(/[<>]/g,'').slice(0,90):'';
 if(!topic)return;
 if(location.pathname.startsWith('/services/')){
  document.querySelectorAll('a[href^="/contact/"]').forEach(a=>{
   const u=new URL(a.href,location.origin);u.searchParams.set('topic',topic);
   a.href=u.pathname+u.search;
  });
 }
 if(location.pathname==='/contact/'){
  const form=document.getElementById('project-form');
  if(form?.elements.project&&!form.elements.project.value)form.elements.project.value='I would like help with '+topic+'. Please review my store and recommend the right scope.';
 }
})();
