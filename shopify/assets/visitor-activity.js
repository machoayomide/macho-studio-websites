/* MACHO anonymous visitor activity.
 * Explicit consent; no form values, answers, names, emails, URLs with queries or IPs.
 * Activity alerts require Cloudflare Pages _worker.js + secrets configured.
 */
(()=>{'use strict';
if(location.pathname.startsWith('/macho-activity'))return;
const key='macho_activity_consent_v1';
const sidKey='macho_activity_session_v1';
const deviceVisit='macho_activity_return_v1';
const safely=(a)=>{try{return a()}catch{return null}};
const newId=()=>{const ar=new Uint8Array(11);crypto.getRandomValues(ar);return Array.from(ar,x=>x.toString(16).padStart(2,'0')).join('')};
let choice=safely(()=>localStorage.getItem(key)),session=null,view=newId(),sent=new Set(),enabled=false;
const selection=()=>safely(()=>sessionStorage.getItem(sidKey))||newId();
function emit(type,details={}){
 if(!enabled||document.visibilityState==='prerender')return;
 const body={type,session,view,path:location.pathname};
 for(const field of ['step','service','source','channel'])if(typeof details[field]==='string')body[field]=details[field].slice(0,55);
 fetch('/api/activity',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),keepalive:true}).catch(()=>{});
}
function once(type,details){if(sent.has(type))return;sent.add(type);emit(type,details)}
function start(){
 if(enabled)return;enabled=true;session=selection();
 safely(()=>sessionStorage.setItem(sidKey,session));
 const wasHere=safely(()=>localStorage.getItem(deviceVisit));
 emit('page_view');if(wasHere&&wasHere!==session){once('returning_visit')}
 safely(()=>localStorage.setItem(deviceVisit,session));
 if(location.pathname.startsWith('/services/')&&location.pathname!=='/services/')emit('service_view',{service:location.pathname.split('/')[2]||''});
 if(location.pathname==='/contact/')once('contact_open');
 setTimeout(()=>{if(document.visibilityState==='visible')once('time_30s')},30000);
 setTimeout(()=>{if(document.visibilityState==='visible')once('time_120s')},120000);
 updateScroll();
}
function updateScroll(){
 if(!enabled)return;
 const length=Math.max(1,document.documentElement.scrollHeight-innerHeight);
 const fraction=scrollY/length;
 if(fraction>=.5)once('scroll_50');
 if(fraction>=.90)once('scroll_90');
}
addEventListener('scroll',()=>{if(!enabled)return;if(scrollY>0)updateScroll()},{passive:true});
const styles=document.createElement('style');
styles.textContent='.macho-activity-consent{position:fixed;z-index:10500;bottom:20px;left:20px;width:min(410px,calc(100vw - 40px));padding:19px 20px;background:#11271b;color:#f2fff7;box-shadow:0 20px 70px #0007;border:1px solid #8ecc9e80;border-radius:14px;font:500 13px/1.5 Inter,Arial,sans-serif}.macho-activity-consent strong{display:block;font-size:15px;margin-bottom:6px}.macho-activity-consent p{color:#c5dfce;margin:0 0 14px;font-size:12px}.macho-activity-consent .act-buttons{display:flex;gap:10px}.macho-activity-consent button{cursor:pointer;border:1px solid #82c39b;border-radius:8px;padding:10px 13px;background:transparent;color:#fff;font-weight:750;flex:1}.macho-activity-consent button:first-child{background:#a2eac4;border-color:#a2eac4;color:#10281a}.macho-activity-consent button:focus-visible{outline:2px solid white;outline-offset:2px}.macho-activity-consent .act-link{color:#a2eac4;display:inline-block;font-size:11px;margin-top:8px;text-decoration:underline}';
document.head.append(styles);
function banner(){
 if(document.querySelector('.macho-activity-consent'))return;
 const b=document.createElement('aside');b.className='macho-activity-consent';b.setAttribute('aria-label','Visitor activity preference');
 const title=document.createElement('strong');title.textContent='Help MACHO understand visits?';
 const copy=document.createElement('p');copy.textContent='With your permission, we record anonymous page visits and interactions to improve this site and send activity alerts. No form contents or store financial answers are collected.';
 const actions=document.createElement('div');actions.className='act-buttons';
 const allow=document.createElement('button');allow.type='button';allow.textContent='Allow activity';
 const decline=document.createElement('button');decline.type='button';decline.textContent='No thanks';
 const more=document.createElement('a');more.className='act-link';more.href='/privacy/';more.textContent='Privacy information ↗';
 const decide=value=>{safely(()=>localStorage.setItem(key,value));choice=value;b.remove();if(value==='yes')start();else enabled=false};
 allow.onclick=()=>decide('yes');decline.onclick=()=>decide('no');
 actions.append(allow,decline);b.append(title,copy,actions,more);document.body.append(b);
}
function settings(){
 const footers=[...document.querySelectorAll('footer')];const footer=footers.at(-1)||document.body;
 const button=document.createElement('button');button.type='button';button.className='macho-activity-settings';
 button.textContent='Activity preferences';button.style.cssText='background:transparent;border:1px solid currentColor;color:inherit;font-size:11px;border-radius:25px;padding:8px 11px;margin:15px 0;cursor:pointer';
 button.onclick=()=>banner();footer.append(button);
}
function attachActions(){
 document.addEventListener('click',e=>{
  if(!enabled)return;
  const link=e.target.closest('a[href]'),button=e.target.closest('button');
  if(link){
   const url=safely(()=>new URL(link.href,location.href));
   if(url){
    if(url.hostname==='wa.me'||url.hostname==='api.whatsapp.com')emit('whatsapp_click',{source:location.pathname});
    else if(url.protocol==='mailto:')emit('email_click',{source:location.pathname});
    else if(url.origin===location.origin&&url.pathname.startsWith('/services/'))emit('service_click',{service:url.pathname.split('/')[2]||''});
    else if(url.origin===location.origin&&url.pathname.startsWith('/contact/')&&location.pathname==='/store-check/')emit('assessment_handoff');
   }
  }
  if(!button)return;
  if(button.id==='check-start-button')once('store_check_start');
  if(button.id==='check-next'){const step=document.getElementById('check-step-label')?.textContent?.replace(/\s.*/,'')||'';emit('store_check_step',{step});requestAnimationFrame(()=>{const results=document.getElementById('check-results');if(results&&!results.hidden)once('store_check_complete')})}
  if(button.id==='check-restart')emit('store_check_restart');
  if(button.id==='check-copy')emit('copy_report');
  if(button.id==='copy-brief')emit('brief_prepared',{channel:'copy'});
 });
 const form=document.querySelector('#project-form');
 if(form){const output=document.querySelector('#brief-output');if(output){new MutationObserver(()=>{if(!output.hidden)once('brief_prepared')}).observe(output,{attributes:true,attributeFilter:['hidden']})}}
}
function boot(){settings();attachActions();if(choice==='yes')start();else if(choice!=='no')banner()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();