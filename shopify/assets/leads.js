/* Explicit email capture. Quiz answers and emails never enter activity alerts. */
(()=>{'use strict';
 document.querySelectorAll('[data-lead-form]').forEach(form=>{
  form.addEventListener('submit',async event=>{
   event.preventDefault();
   const email=form.elements.email.value.trim(),status=form.querySelector('.lead-status'),button=form.querySelector('[type="submit"]');
   if(!email){status.textContent='Add your email to request a follow-up, or skip this form and continue your check.';form.elements.email.focus();return;}
   if(!form.reportValidity())return;
   const kind=form.dataset.leadForm,newsletter=form.elements.newsletter.checked;
   const report=form.elements.shareReport?.checked?document.getElementById('store-check-app')?.dataset.report||'':'';
   const payload={kind,email,newsletter,followup:kind==='store-check',report,website:form.elements.website.value};
   button.disabled=true;status.textContent='Saving…';
   try{
    const res=await fetch('/api/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
    const data=await res.json();
    if(!res.ok||data.ok!==true||data.saved!==true)throw Error(data.error||'We could not save your email. Please retry.');
    status.textContent=kind==='newsletter'?'You are subscribed. Thanks for joining!':newsletter?'Your email is saved for a follow-up, and you have joined the newsletter.':'Your email is saved. MACHO can follow up about your store.';
    form.reset();
   }catch(error){status.textContent=error.message||'We could not save your email. Please retry, or contact hello@macho.studio.';}
   finally{button.disabled=false;}
  });
 });
})();
