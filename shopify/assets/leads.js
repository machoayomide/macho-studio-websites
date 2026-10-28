/* Explicit email capture. Quiz answers and emails never enter activity alerts. */
(()=>{'use strict';
 document.querySelectorAll('[data-lead-form]').forEach(form=>{
  if(form.dataset.leadForm==='demo'){
   const params=new URLSearchParams(location.search),service=params.get('service'),topic=(params.get('topic')||'').replace(/[<>]/g,'').slice(0,90);
   if(service&&[...form.elements.service.options].some(o=>o.value===service))form.elements.service.value=service;
   if(topic)form.elements.message.value='I would like to see a demo of '+topic+'.';
  }
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   const email=form.elements.email.value.trim(),status=form.querySelector('.lead-status'),button=form.querySelector('[type="submit"]');
   if(!email){status.textContent='Add your email to request a follow-up, or skip this form and continue your check.';form.elements.email.focus();return;}
   if(!form.reportValidity())return;
   const kind=form.dataset.leadForm,newsletter=form.elements.newsletter.checked;
   const report=form.elements.shareReport?.checked?document.getElementById('store-check-app')?.dataset.report||'':'';
   const payload={kind,email,newsletter,followup:kind==='store-check'||kind==='demo',report,website:form.elements.website.value};
   if(kind==='demo')Object.assign(payload,{name:form.elements.name.value.trim(),service:form.elements.service.value,store:form.elements.store.value.trim(),message:form.elements.message.value.trim()});
   button.disabled=true;status.textContent=kind==='demo'?'Saving your demo request…':'Saving…';
   try{
    const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await res.json();
    if(!res.ok||data.ok!==true||data.saved!==true)throw Error(data.error||'We could not save your email. Please retry.');
    status.textContent=kind==='demo'?'Your demo request is saved. MACHO will follow up by email about an example or walkthrough. No time is booked yet.':kind==='newsletter'?'You are subscribed. Thanks for joining!':newsletter?'Your email is saved for a follow-up, and you have joined the newsletter.':'Your email is saved. MACHO can follow up about your store.';
    form.reset();
   }catch(error){status.textContent=error.message||'We could not save your email. Please retry, or contact hello@macho.studio.';}
   finally{button.disabled=false;}
  });
 });
})();
