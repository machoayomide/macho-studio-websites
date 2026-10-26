/* MACHO SHOPIFY / Privacy-aware event notifications.
 * Cloudflare Pages Advanced Mode: the module MUST forward all non-API requests
 * to env.ASSETS.fetch(request). Configure secrets in Cloudflare, NEVER in git.
 * No IP address, contact details, quiz answers, store URLs, or full referrers logged.
 * Needs ACTIVITY_LOG KV for dashboard; Telegram secrets for chat notifications.
 */
const EVENTS={
 system_test:"🧪 MACHO notification test",page_view:"👁 New page view",returning_visit:"🔁 Returning opted-in visitor",
 time_30s:"⏱ 30 seconds on page",time_120s:"⏱ 2 minutes on page",
 scroll_50:"📜 Scrolled halfway",scroll_90:"📜 Reached page bottom",
 store_check_start:"🧭 Store Check started",store_check_step:"🧭 Store Check progress",
 store_check_complete:"✅ Store Check completed",store_check_restart:"🔄 Store Check restarted",
 service_view:"🛠 Service page visited",service_click:"🛠 Service explored",
 project_view:"📂 Portfolio project opened",
 contact_open:"💬 Contact page visited",brief_prepared:"📝 Project brief prepared",
 whatsapp_click:"📱 WhatsApp contact clicked",email_click:"✉️ Email contact clicked",
 assessment_handoff:"📋 Assessment enquiry opened",copy_report:"📑 Store report copied"
};
const noCache={"Cache-Control":"no-store, private","X-Content-Type-Options":"nosniff","Content-Type":"application/json; charset=utf-8"};
const response=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:noCache});
const safe=(str,max=80)=>typeof str==="string"?str.replace(/[\r\n\t<>]/g," ").slice(0,max):"";
const labelSafe=s=>safe(s,90).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
function sameOrigin(request){const header=request.headers.get("Origin");return !!header&&header===new URL(request.url).origin}
function device(ua){if(/Android|iPhone|iPad|Mobile/i.test(ua))return /iPad/i.test(ua)?"Tablet":"Mobile";return "Desktop"}
function authEqual(a,b){if(!a||!b||a.length!==b.length)return false;let v=0;for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i);return v===0}
async function event(request,env,ctx){
 if(request.method!=="POST")return response({error:"Method not allowed"},405);
 if(!sameOrigin(request))return response({error:"Cross-origin event not accepted"},403);
 if(Number(request.headers.get("Content-Length")||"0")>2200)return response({error:"Event too large"},413);
 let input;try{const raw=await request.text();if(raw.length>2200)return response({error:"Event too large"},413);input=JSON.parse(raw)}catch{return response({error:"Invalid JSON"},400)}
 if(!input||!Object.prototype.hasOwnProperty.call(EVENTS,input.type))return response({error:"Unsupported activity"},400);
 if(input.type==='system_test'&&!authEqual((request.headers.get('Authorization')||'').replace(/^Bearer\s+/i,''),env.ADMIN_DASHBOARD_KEY))return response({error:'Unauthorized'},401);
 const sid=safe(input.session,48),view=safe(input.view,48);
 if(!/^[A-Za-z0-9_-]{8,48}$/.test(sid)||!/^[A-Za-z0-9_-]{8,48}$/.test(view))return response({error:"Invalid session"},400);
 const path=safe(input.path,160).split("?")[0];if(!path.startsWith("/")||path.startsWith("//"))return response({error:"Invalid path"},400);
 const allowedDetail=["step","service","source","channel"];
 const details={};for(const k of allowedDetail){if(typeof input[k]==="string")details[k]=safe(input[k],55)}
 const country=safe(request.cf?.country||"Unknown",4);
 const record={event:input.type,label:EVENTS[input.type],id:crypto.randomUUID(),time:new Date().toISOString(),session:sid.slice(0,12),view:view.slice(0,12),page:path,device:device(request.headers.get("User-Agent")||""),country,site:new URL(request.url).hostname,details};
 if(!env.ACTIVITY_LOG&&!(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID))return response({ok:false,configured:false,error:"Activity backend not configured"},503);
 const jobs=[];
 if(env.ACTIVITY_LOG){const key="e:"+(9999999999999-Date.now()).toString().padStart(13,"0")+":"+record.id; jobs.push(env.ACTIVITY_LOG.put(key,JSON.stringify(record),{expirationTtl:60*60*24*7}).then(()=>({channel:"storage",delivered:true})))}
 if(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID){
  const body="<b>"+labelSafe(record.label)+"</b>\n"+
   "🕒 "+labelSafe(record.time)+"\n"+
   "🔖 "+labelSafe(record.session)+" / "+labelSafe(record.view)+"\n"+
   "🏠 "+labelSafe(record.site)+"\n"+"📄 "+labelSafe(record.page)+"\n"+
   "📱 "+labelSafe(record.device)+" · 🌍 "+labelSafe(record.country)+"\n"+
   Object.entries(details).map(([k,v])=>"• "+labelSafe(k)+": "+labelSafe(v)).join("\n")+
   "\n<i>Anonymous activity · not a confirmed lead or sale</i>";
  const url="https://api.telegram.org/bot"+env.TELEGRAM_BOT_TOKEN+"/sendMessage";
  jobs.push(fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:body,parse_mode:"HTML",disable_web_page_preview:true})}).then(async r=>{let data={};try{data=await r.json()}catch{}if(!r.ok||data.ok!==true)throw Error('Telegram rejected notification');return {channel:'telegram',delivered:true}}));
 }
 if(input.type==='system_test'){
  const results=await Promise.allSettled(jobs);const ok=results.every(r=>r.status==='fulfilled');
  return response({ok,storage:Boolean(env.ACTIVITY_LOG),notifications:Boolean(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID),results:results.map(r=>r.status==='fulfilled'?r.value:{delivered:false,error:'Delivery failed; check the configured channel in Cloudflare.'})},ok?200:502);
 }
 if(jobs.length)ctx.waitUntil(Promise.allSettled(jobs));
 return response({ok:true,queued:true},202);
}
async function report(request,env){
 if(request.method!=="GET")return response({error:"Method not allowed"},405);
 const expected=env.ADMIN_DASHBOARD_KEY;
 const token=(request.headers.get("Authorization")||"").replace(/^Bearer\s+/i,"");
 if(!expected||!authEqual(token,expected))return response({error:"Unauthorized"},401);
 if(!env.ACTIVITY_LOG)return response({error:"KV binding ACTIVITY_LOG not configured",configured:false,telegram:Boolean(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID)},503);
 const keys=await env.ACTIVITY_LOG.list({prefix:"e:",limit:120});
 const list=await Promise.all(keys.keys.map(async row=>{try{const v=await env.ACTIVITY_LOG.get(row.name,"json");return v||null}catch{return null}}));
 const events=list.filter(Boolean);
 return response({events,telegram:Boolean(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID),storage:true,retention:"7 days",limit:120});
}
async function testNotification(request,env,ctx){
 if(request.method!=='POST')return response({error:'Method not allowed'},405);
 if(!sameOrigin(request))return response({error:'Cross-origin test not accepted'},403);
 const token=(request.headers.get('Authorization')||'').replace(/^Bearer\s+/i,'');
 if(!authEqual(token,env.ADMIN_DASHBOARD_KEY))return response({error:'Unauthorized'},401);
 const headers=new Headers(request.headers);headers.set('Content-Type','application/json');headers.delete('Content-Length');
 const test=new Request(request.url,{method:'POST',headers,body:JSON.stringify({type:'system_test',session:'owner-test-session',view:crypto.randomUUID(),path:'/macho-activity/',source:'owner-test'})});
 return event(test,env,ctx);
}
function readiness(env){
 const storage=Boolean(env.ACTIVITY_LOG),notifications=Boolean(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID),dashboard=Boolean(env.ADMIN_DASHBOARD_KEY);
 return {enabled:storage||notifications,storage,notifications,dashboard,missing:[...(!storage?['ACTIVITY_LOG']:[]),...(!dashboard?['ADMIN_DASHBOARD_KEY']:[]),...(!env.TELEGRAM_BOT_TOKEN?['TELEGRAM_BOT_TOKEN']:[]),...(!env.TELEGRAM_CHAT_ID?['TELEGRAM_CHAT_ID']:[])]};
}

/* Visitor-supplied project details must never be written to the anonymous activity feed. */
const enquiryAddress = value => typeof value === 'string' && value.length <= 254 &&
  /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && !/[\r\n]/.test(value);
const field = (data, key, limit) => typeof data[key] === 'string' ? data[key].trim().slice(0, limit + 1) : '';
async function enquiryRateKey(request) {
  const ip = request.headers.get('CF-Connecting-IP') || '';
  if (!ip) return null;
  const hour = Math.floor(Date.now() / 3600000);
  const bytes = new TextEncoder().encode('macho-enquiry:' + hour + ':' + ip);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return 'rl:enquiry:' + hour + ':' + [...new Uint8Array(digest)].map(n => n.toString(16).padStart(2, '0')).join('');
}
async function sendEnquiry(request, env) {
  if (request.method !== 'POST') return response({error:'Method not allowed'},405);
  if (!sameOrigin(request)) return response({error:'Request origin not accepted'},403);
  if (!(request.headers.get('Content-Type') || '').toLowerCase().startsWith('application/json'))
    return response({error:'JSON required'},415);
  if (Number(request.headers.get('Content-Length') || '0') > 8000)
    return response({error:'Enquiry is too long'},413);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 8000) return response({error:'Enquiry is too long'},413);
    input = JSON.parse(raw);
  } catch { return response({error:'Invalid enquiry'},400); }
  if (!input || typeof input !== 'object' || Array.isArray(input))
    return response({error:'Invalid enquiry'},400);
  // Hidden honeypot; always reject without forwarding if filled.
  if (input.website) return response({error:'Unable to process this enquiry'},400);
  const name=field(input,'name',120),email=field(input,'email',254),
        service=field(input,'service',90),timeline=field(input,'timeline',90),
        budget=field(input,'budget',90),message=field(input,'message',3000);
  if (name.length < 2 || name.length > 120 || !enquiryAddress(email) ||
      message.length < 10 || message.length > 3000 ||
      service.length > 90 || timeline.length > 90 || budget.length > 90)
    return response({error:'Please enter a valid name, email and project details (at least 10 characters).'},400);
  const recipient=String(env.CONTACT_TO_EMAIL||'').trim();
  const from=String(env.CONTACT_FROM_EMAIL||'enquiries@macho.studio').trim();
  if (!enquiryAddress(recipient) || !enquiryAddress(from) || !from.toLowerCase().endsWith('@macho.studio') ||
      !(env.EMAIL || env.RESEND_API_KEY))
    return response({error:'Online enquiries are temporarily unavailable. Please use WhatsApp or contact MACHO directly.'},503);

  // Anonymous, time-scoped abuse prevention: never store sender details or the IP.
  let rateKey=null;
  if (env.ACTIVITY_LOG) {
    rateKey=await enquiryRateKey(request);
    if(rateKey) {
      try {
        const count=Number(await env.ACTIVITY_LOG.get(rateKey) || '0');
        if(count >= 5) return response({error:'Too many submissions. Please try again later.'},429);
      } catch { /* Email flow should not be blocked by analytics storage. */ }
    }
  }
  const body=[
    'MACHO PROJECT ENQUIRY',
    'Name: '+name,
    'Email: '+email,
    'Service: '+(service||'Not specified'),
    'Timeline: '+(timeline||'Flexible'),
    'Budget: '+(budget||'Not specified'),
    '',
    'Project details:',
    message,
    '',
    'Submitted through the MACHO website.'
  ].join('\n');

  try {
    if (env.EMAIL) {
      const result=await env.EMAIL.send({
        to:recipient, from:{name:'MACHO Website',email:from},
        replyTo:email, subject:'New project enquiry — MACHO', text:body
      });
      if (!result || !result.messageId) throw new Error('No provider receipt');
    } else {
      const mail=await fetch('https://api.resend.com/emails',{
        method:'POST',
        headers:{
          'Authorization':'Bearer '+env.RESEND_API_KEY,
          'Content-Type':'application/json',
          'User-Agent':'MACHO-Portfolio/1.0'
        },
        body:JSON.stringify({
          from:'MACHO Website <'+from+'>',to:[recipient],
          reply_to:email,subject:'New project enquiry — MACHO',text:body
        })
      });
      if (!mail.ok) throw new Error('Email provider rejected request');
      const receipt=await mail.json();
      if (!receipt || !receipt.id) throw new Error('No provider receipt');
    }
  } catch (_) {
    return response({error:'We could not send your enquiry. Nothing was confirmed. Please retry or contact MACHO on WhatsApp.'},502);
  }
  if(rateKey && env.ACTIVITY_LOG) {
    try {
      const count=Number(await env.ACTIVITY_LOG.get(rateKey) || '0');
      await env.ACTIVITY_LOG.put(rateKey,String(count+1),{expirationTtl:3700});
    } catch { /* Already accepted by the mail provider. Never misreport delivery. */ }
  }
  return response({ok:true,accepted:true},202);
}

export default {
 async fetch(request,env,ctx){
  const path=new URL(request.url).pathname;
  const clean=path.replace(/\/$/, "").replace(/\.html$/, "");
  const serviceRoutes={"/practice-shopify":"https://shopify.macho.studio/","/services/shopify":"https://shopify.macho.studio/","/shopify":"https://shopify.macho.studio/","/services/apps":"/practice-apps","/services/web":"/practice-web","/services/wix":"/practice-wix","/services/crm":"/practice-crm","/services/automation":"/practice-automation"};
  if(serviceRoutes[clean])return Response.redirect(new URL(serviceRoutes[clean],request.url),301);
  if(path==="/api/enquiry")return sendEnquiry(request,env);
  if(path==="/api/activity/ready")return response(readiness(env));
  if(path==="/api/activity/test")return testNotification(request,env,ctx);
  if(path==="/api/activity")return event(request,env,ctx);
  if(path==="/api/activity/report")return report(request,env);
  if(path.startsWith("/api/activity/"))return response({error:"Not found"},404);
  return env.ASSETS.fetch(request);
 }
};