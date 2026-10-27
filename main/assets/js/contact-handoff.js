/* Direct enquiry submission for the standalone MACHO contact page. */
(()=>{
 'use strict';
 const form=document.getElementById('macho-static-contact');
 if(!form)return;
 const selected=new URLSearchParams(location.search).get('service');
 const select=form.querySelector('#svc');
 if(select&&selected&&[...select.options].some(x=>x.value===selected))select.value=selected;
 const status=document.getElementById('macho-static-status');
 const output=document.getElementById('macho-brief-output');
 const button=form.querySelector('[type="submit"]');
 form.addEventListener('submit',async event=>{
   event.preventDefault();
   if(!form.reportValidity()||button.disabled)return;
   const data=new FormData(form);
   const value=k=>String(data.get(k)||'').trim();
   const values={
     name:value('name'),email:value('email'),
     service:select?.selectedOptions[0]?.textContent||'Not specified',
     timeline:value('timing'),budget:value('budget'),
     message:value('message'),website:value('website')
   };
   status.textContent='Sending your message…';
   output.hidden=true;
   button.disabled=true;button.textContent='Sending…';
   let accepted=false;
   try{
     // Load both UI and delivery code BEFORE sending so a missing UI module
     // can never turn a successfully sent enquiry into a misleading error.
     const [{sendEnquiry},{showEnquirySuccess}]=await Promise.all([
       import('/assets/js/enquiry-api.js?v=20261027-form1'),
       import('/assets/js/enquiry-success.js?v=20261027-v1')
     ]);
     await sendEnquiry(values);
     accepted=true;
     form.reset();
     status.textContent='Enquiry accepted. Thanks for contacting MACHO.';
     button.textContent='Send another enquiry ↗';
     showEnquirySuccess();
   }catch(error){
     if(accepted){
       status.textContent='Our email service has your message. Thank you — MACHO will review your message and reply by email.';
       return;
     }
     status.textContent=error?.message||'We could not send your message. Your details are still in the form.';
     const wa=document.getElementById('macho-whatsapp-link');
     if(wa){
       const brief=['MACHO PROJECT ENQUIRY','Name: '+values.name,'Email: '+values.email,
         'Service: '+values.service,'Timeline: '+values.timeline,'Budget: '+values.budget,
         '','Project details:',values.message].join('\n');
       wa.href='https://wa.me/2349160956794?text='+encodeURIComponent(brief);
       output.hidden=false;
     }
     button.textContent='Try again ↗';
   }finally{button.disabled=false}
 });
})();
