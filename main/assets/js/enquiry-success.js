/* One shared MACHO success experience for Contact and project popup.
 * Call only after /api/enquiry returned ok:true.
 * No submitted details are stored, logged, placed in the URL or shown here.
 */
let activeDialog=null;
function addStyles(){
 if(document.getElementById('macho-enquiry-success-style'))return;
 const link=document.createElement('link');
 link.id='macho-enquiry-success-style';
 link.rel='stylesheet';
 link.href='/assets/css/enquiry-success.css?v=20261027-v1';
 document.head.append(link);
}
export function showEnquirySuccess(){
 addStyles();
 if(activeDialog?.open)activeDialog.close();
 const dialog=document.createElement('dialog');
 dialog.className='macho-success-dialog';
 dialog.setAttribute('aria-labelledby','macho-success-title');
 dialog.setAttribute('aria-describedby','macho-success-copy');
 dialog.innerHTML=`
  <div class="macho-success-shell">
    <header class="macho-success-topbar">
      <span class="macho-success-brand">MACHO<i>.</i></span>
      <span>PROJECT ENQUIRY &nbsp; / &nbsp; CONFIRMATION</span>
    </header>
    <button type="button" class="macho-success-close" aria-label="Close success screen">Close ×</button>
    <div class="macho-success-content">
      <div class="macho-success-grid">
        <section class="macho-success-primary-col">
          <div class="macho-success-mark" aria-hidden="true">
            <svg viewBox="0 0 60 60" fill="none">
              <circle cx="30" cy="30" r="27.5" stroke="currentColor" stroke-width="1.2"/>
              <path d="m17.5 30.5 8 8L42.5 21" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="macho-success-kicker">THANK YOU FOR REACHING OUT</p>
          <h2 class="macho-success-title" id="macho-success-title">Your message<br><em>is on its way.</em></h2>
          <p class="macho-success-copy" id="macho-success-copy">Your project enquiry has been accepted by MACHO's email service. I'll review what you shared and respond using the email address in your enquiry.</p>
          <p class="macho-success-detail">You don't need to submit again. Email acceptance isn't a guarantee of final inbox delivery, but your request has been handed to our sending service.</p>
          <div class="macho-success-actions">
            <a href="/work" class="macho-success-primary">Explore my work <span aria-hidden="true">↗</span></a>
            <button type="button" class="macho-success-secondary" data-close-success>Back to the website <span aria-hidden="true">↗</span></button>
          </div>
        </section>
        <aside class="macho-success-panel" aria-labelledby="macho-success-next">
          <p class="macho-success-panel-kicker">WHAT HAPPENS NEXT &nbsp; / &nbsp; 01–03</p>
          <h3 id="macho-success-next">A good project starts<br><em>with a conversation.</em></h3>
          <ol class="macho-success-steps">
            <li><span>01</span><div><strong>I review your brief</strong><p>I'll look through the goals and details you've shared.</p></div></li>
            <li><span>02</span><div><strong>We continue by email</strong><p>I'll reach out if I need more information or have a next step to suggest.</p></div></li>
            <li><span>03</span><div><strong>We shape the approach</strong><p>We can then agree on the scope, direction, and how to move forward.</p></div></li>
          </ol>
        </aside>
      </div>
    </div>
    <footer class="macho-success-footer">
      <span>CRAFT × CODE × CONNECTED SYSTEMS</span>
      <span>MACHO &nbsp; / &nbsp; NIGERIA · WORLDWIDE</span>
    </footer>
  </div>`;
 dialog.querySelectorAll('[data-close-success],.macho-success-close').forEach(b=>b.addEventListener('click',()=>dialog.close()));
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close()});
 dialog.addEventListener('close',()=>{dialog.remove();if(activeDialog===dialog)activeDialog=null},{once:true});
 document.body.append(dialog);
 activeDialog=dialog;
 if(typeof dialog.showModal==='function'){dialog.showModal();dialog.querySelector('.macho-success-close').focus()}
 else {
   // Never fabricate a sending failure just because the browser lacks <dialog>.
   dialog.setAttribute('open','');
   dialog.style.cssText='display:block;position:fixed;z-index:20000;inset:2vh 2vw;margin:auto;overflow:auto;max-height:96vh;max-width:1080px';
   dialog.querySelector('.macho-success-close').focus();
 }
 return dialog;
}
