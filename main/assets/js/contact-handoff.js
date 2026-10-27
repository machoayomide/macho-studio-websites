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
   status.textContent='Sending your project enquiry securely…';
   output.hidden=true;
   button.disabled=true;button.textContent='Sending…';
   try{
     const {sendEnquiry}=await import('/assets/js/enquiry-api.js?v=20261027-form1');
     await sendEnquiry(values);
     status.textContent='Your enquiry was accepted for sending. Thank you — MACHO will review your message and reply to your email.';
     form.reset();
     button.textContent='Send another enquiry ↗';
   }catch(error){
     status.textContent=error?.message||'The enquiry could not be sent. Your details are still in the form.';
     const wa=document.getElementById('macho-whatsapp-link');
     if(wa){
       const brief=['MACHO PROJECT ENQUIRY','Name: '+values.name,'Email: '+values.email,
         'Service: '+values.service,'Timeline: '+values.timeline,'Budget: '+values.budget,
         '','Project details:',values.message].join('\n');
       wa.href='https://wa.me/2349160956794?text='+encodeURIComponent(brief);
       output.hidden=false;
     }
     button.textContent='Try sending again ↗';
   }finally{button.disabled=false}
 });
})();
