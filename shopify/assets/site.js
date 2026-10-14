(function(){'use strict';
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('#primary-nav');
if(menu&&nav){const setMenu=(open)=>{menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close main menu':'Open main menu');nav.classList.toggle('open',open);document.body.classList.toggle('menu-open',open)};menu.addEventListener('click',()=>setMenu(menu.getAttribute('aria-expanded')!=='true'));nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));document.addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});}
// Controlled, accessible layered commerce illustration — no faux WebGL claims.
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
document.querySelectorAll('.commerce-universe').forEach(stage=>{
 const art=stage.querySelector('.commerce-assembly');if(!art)return;
 stage.setAttribute('role','group');
 stage.setAttribute('aria-label','Illustration of storefront design, checkout and inventory systems. Use arrow keys to rotate.');
 let active=false,px=0,py=0,rx=0,ry=0,raf=0,expanded=false;
 const paint=()=>{raf=0;rx+=(px-rx)*.17;ry+=(py-ry)*.17;art.style.setProperty('--ry',(rx*9).toFixed(2)+'deg');art.style.setProperty('--rx',(-ry*6).toFixed(2)+'deg');if(Math.abs(rx-px)>.015||Math.abs(ry-py)>.015)raf=requestAnimationFrame(paint)};
 const set=(x,y)=>{if(reduced)return;px=Math.max(-1,Math.min(1,x));py=Math.max(-1,Math.min(1,y));if(!raf)raf=requestAnimationFrame(paint)};
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;active=true;stage.setPointerCapture?.(e.pointerId)});
 stage.addEventListener('pointermove',e=>{if(!active||reduced)return;const r=stage.getBoundingClientRect();set((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height*2-1)});
 const release=()=>{active=false;set(0,0)};
 stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 stage.addEventListener('keydown',e=>{const delta={ArrowLeft:[-.16,0],ArrowRight:[.16,0],ArrowUp:[0,-.16],ArrowDown:[0,.16]};if(e.key==='Home'){e.preventDefault();set(0,0)}else if(delta[e.key]){e.preventDefault();set(px+delta[e.key][0],py+delta[e.key][1])}});
 const toggle=document.createElement('button');toggle.type='button';toggle.className='scene-mode';toggle.textContent='Explore store layers ↗';toggle.setAttribute('aria-pressed','false');
 const note=document.createElement('span');note.className='scene-explain';note.hidden=true;note.textContent='FRONT: THEME · MIDDLE: CHECKOUT · BACK: STOCK & ORDERS';
 toggle.addEventListener('click',()=>{expanded=!expanded;stage.dataset.expanded=String(expanded);toggle.setAttribute('aria-pressed',String(expanded));toggle.textContent=expanded?'Close store layers ↖':'Explore store layers ↗';note.hidden=!expanded});
 stage.append(toggle,note);
});
const filters=[...document.querySelectorAll('[data-filter]')];if(filters.length){filters.forEach(b=>b.addEventListener('click',()=>{filters.forEach(x=>x.classList.toggle('active',x===b));const key=b.dataset.filter;document.querySelectorAll('.filterable').forEach(x=>{x.hidden=key!=='all'&&!x.dataset.category.includes(key)});}));}
const form=document.querySelector('#project-form');if(form){const selected=new URLSearchParams(location.search).get('service');if(selected&&form.elements.service){const choice=[...form.elements.service.options].find(x=>x.value===selected);if(choice)choice.selected=true}form.addEventListener('submit',e=>{e.preventDefault();const status=form.querySelector('.form-status');const output=document.querySelector('#brief-output');if(!form.reportValidity()){status.textContent='Please complete your name, valid email, service and project description.';return}let d=new FormData(form),message=['SHOPIFY PROJECT ENQUIRY','-----------------------','Name: '+d.get('name'),'Email: '+d.get('email'),'Service: '+d.get('service'),'Budget: '+(d.get('budget')||'Not specified'),'Timeline: '+(d.get('timeline')||'Not specified'),'','Project details:',String(d.get('project'))].join('\n');document.querySelector('#brief-text').value=message;output.hidden=false;const whatsapp=document.querySelector('#send-whatsapp'),email=document.querySelector('#send-email');if(whatsapp)whatsapp.href='https://wa.me/2349160956794?text='+encodeURIComponent(message);if(email)email.href='mailto:machomanexpert@gmail.com?subject='+encodeURIComponent('Shopify project enquiry')+'&body='+encodeURIComponent(message);status.textContent='Your brief is ready. Choose WhatsApp or Email to send it; this page has not sent anything yet.';output.scrollIntoView({block:'nearest',behavior:reduced?'instant':'smooth'})});const copy=document.querySelector('#copy-brief');copy?.addEventListener('click',async()=>{const textarea=document.querySelector('#brief-text');try{await navigator.clipboard.writeText(textarea.value);copy.textContent='Copied to clipboard ✓'}catch(e){textarea.focus();textarea.select();copy.textContent='Select and copy your brief'}setTimeout(()=>copy.textContent='Copy enquiry text ↗',3500)})}
})();

;(()=>{document.querySelectorAll('.site-header .brand').forEach(el=>{
 const old=el.querySelector('.brand-mark');if(old){const img=document.createElement('img');img.src='/assets/brand-mark.svg';img.width=43;img.height=31;img.alt='';img.className='studio-brand-icon';old.replaceWith(img)}
 const title=el.querySelector('.brand-word');if(title){title.innerHTML='MACHO<span class="slash"> / </span><span class="brand-lite">STUDIO</span><span class="brand-dot">.</span><small class="brand-specialism">FOR SHOPIFY</small>'}
 el.setAttribute('aria-label','Macho Studio for Shopify, home')
});})();
