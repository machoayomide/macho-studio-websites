/* MACHO site interactions: progressive enhancements, no external dependencies. */
(() => {
 'use strict';
 if (!document.body || !('HTMLDialogElement' in window)) return;
 const $=(q,r=document)=>r.querySelector(q);
 const onContactPage=/^\/contact(?:\.html)?\/?$/.test(location.pathname);
 function makeDialog(kind){
   const d=document.createElement('dialog');
   d.className='macho-dialog macho-'+kind+'-dialog';
   const panel=document.createElement('div'); panel.className='macho-dialog-panel';
   const close=document.createElement('button');close.type='button';close.className='macho-dialog-close';
   close.textContent='Close ×';close.setAttribute('aria-label','Close popup');close.onclick=()=>d.close();
   panel.append(close);d.append(panel);document.body.append(d);
   d.addEventListener('click',e=>{if(e.target===d)d.close()});
   return {dialog:d,panel};
 }
 let project,contact;
 function openProject(href){
   const match=href.match(/^\/case-([a-z0-9-]+)(?:\.html)?$/i);if(!match)return false;
   if(!project)project=makeDialog('project');
   const {dialog,panel}=project;
   const existing=$('.macho-dialog-content',panel);if(existing)existing.remove();
   const content=document.createElement('div');content.className='macho-dialog-content';
   const pending=document.createElement('p');pending.setAttribute('role','status');pending.textContent='Loading project details…';
   content.append(pending);panel.append(content);dialog.showModal();
   const filename='/case-'+match[1]+'.html';
   const id=Symbol('case');dialog._load=id;
   fetch(filename,{credentials:'same-origin'}).then(r=>{if(!r.ok)throw new Error('Unavailable');return r.text()}).then(html=>{
     if(dialog._load!==id)return;
     const doc=new DOMParser().parseFromString(html,'text/html');
     const head=$('.study-hero .wrap',doc),art=$('.study-hero-art',doc),detail=$('.study-main',doc);
     if(!head||!detail)throw new Error('Missing case study');
     content.replaceChildren();
     const intro=document.createElement('div');intro.className='macho-project-intro';
     const kicker=$('.kicker',head),h1=$('h1',head),summary=$('h1 + p',head);
     [kicker,h1,summary].filter(Boolean).forEach(el=>intro.append(el.cloneNode(true)));
     content.append(intro);
     if(art){
       const figure=art.cloneNode(true);
       figure.querySelectorAll('img').forEach(img=>{const fallback=img.getAttribute('data-fallback');if(fallback){img.src=fallback;img.removeAttribute('data-fallback');img.alt='Illustrative project artwork'}});
       content.append(figure);
     }
     const info=detail.cloneNode(true);
     info.querySelectorAll('script,iframe,form').forEach(el=>el.remove());
     info.querySelectorAll('a[href^="https://github.com/"]').forEach(el=>{
       const text=document.createElement('span');text.className='macho-project-source-note';
       text.textContent='Project previously featured in public portfolio';el.replaceWith(text);
     });
     content.append(info);
     if(h1){const title=$('h1',intro);title.id='macho-project-title';dialog.setAttribute('aria-labelledby',title.id)}
     panel.scrollTop=0;
   }).catch(()=>{
     content.replaceChildren();
     const p=document.createElement('p');p.textContent='This project could not be loaded in the popup.';
     const a=document.createElement('a');a.href=filename;a.textContent='Open the full project page ↗';
     content.append(p,a);
   });
   return true;
 }
 function openContact(service){
   if(onContactPage)return false;
   if(!contact){
     contact=makeDialog('contact');
     const form=document.createElement('form');form.className='macho-quick-form';
     form.innerHTML=[
       '<p class="macho-modal-eyebrow">START A PROJECT</p>',
       '<h2 id="macho-quick-title">Let’s build something useful.</h2>',
       '<p>Tell me about your project. Nothing is sent until you choose your email or WhatsApp app.</p>',
       '<div class="macho-quick-fields">',
       '<label>Your name <input name="name" autocomplete="name" required maxlength="120" placeholder="Your name"></label>',
       '<label>Email address <input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@company.com"></label>',
       '<label>Service <select name="service"><option>Not sure yet</option><option>Shopify & ecommerce</option><option>Mobile app development</option><option>Website development</option><option>Wix Studio & Velo</option><option>CRM & integrations</option><option>AI & automation</option></select></label>',
       '<label>Timeline <select name="timeline"><option>Flexible / undecided</option><option>As soon as possible</option><option>Within a month</option><option>1–3 months</option></select></label>',
       '<label class="macho-field-full">What should we build or fix? <textarea name="message" rows="4" required maxlength="3000" placeholder="Your goals, challenges and project details"></textarea></label>',
       '</div><button class="macho-primary-action" type="submit">Prepare message ↗</button>',
       '<p class="macho-privacy-note">This popup does not save or send your details automatically. <a href="/privacy">Privacy</a> · <a href="/contact">Full contact page</a></p>',
       '<div class="macho-send-options" hidden aria-live="polite"></div>'
     ].join('');
     form.addEventListener('submit',e=>{
       e.preventDefault();if(!form.reportValidity())return;
       const d=new FormData(form),v=k=>String(d.get(k)||'').trim();
       const message=['MACHO PROJECT ENQUIRY','Name: '+v('name'),'Email: '+v('email'),'Service: '+v('service'),'Timeline: '+v('timeline'),'','Project details:',v('message')].join('\n');
       const mail='mailto:machomanexpert@gmail.com?subject='+encodeURIComponent('Project enquiry — MACHO')+'&body='+encodeURIComponent(message);
       const wa='https://wa.me/2349160956794?text='+encodeURIComponent(message);
       const options=$('.macho-send-options',form);options.replaceChildren();
       const p=document.createElement('p');p.textContent='Your message is ready. Choose how to send it. Nothing has been sent yet.';
       const a=document.createElement('a');a.href=mail;a.className='macho-primary-action';a.textContent='Open email ↗';
       const b=document.createElement('a');b.href=wa;b.target='_blank';b.rel='noopener noreferrer';b.className='macho-outline-action';b.textContent='Open WhatsApp ↗';
       options.append(p,a,b);options.hidden=false;
     });
     contact.panel.append(form);
   }
   const {dialog}=contact,form=$('form',dialog);
   const codes={shopify:1,apps:2,app:2,web:3,wordpress:3,wix:4,crm:5,automation:6,ai:6};
   const select=$('select[name="service"]',form);if(codes[service])select.selectedIndex=codes[service];
   $('.macho-send-options',form).hidden=true;dialog.setAttribute('aria-labelledby','macho-quick-title');dialog.showModal();
   return true;
 }
 document.addEventListener('click',e=>{
   if(e.defaultPrevented||e.button!==0||e.metaKey||e.ctrlKey||e.altKey||e.shiftKey)return;
   const anchor=e.target.closest('a[href]'),href=anchor?.getAttribute('href')||'';
   if(anchor&&anchor.target==='_blank')return;
   const card=e.target.closest('.case-card');
   const caseHref=/^\/case-[\w-]+(?:\.html)?$/.test(href)?href:card?.querySelector('a[href^="/case-"]')?.getAttribute('href');
   if(caseHref&&openProject(caseHref)){e.preventDefault();return;}
   if(anchor&&!anchor.closest('.macho-quick-form')&&/^\/contact(?:\.html)?(?:\?|$)/.test(href)&&!onContactPage){
     const service=new URL(href,location.href).searchParams.get('service')||'';
     if(openContact(service.toLowerCase()))e.preventDefault();
   }
 });
 document.querySelectorAll('.case-card').forEach(card=>{card.classList.add('macho-case-interactive');card.title='Open project details'});
})();