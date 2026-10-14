/* MACHO SHOPIFY / Privacy-aware event notifications.
 * Cloudflare Pages Advanced Mode: the module MUST forward all non-API requests
 * to env.ASSETS.fetch(request). Configure secrets in Cloudflare, NEVER in git.
 * No IP address, contact details, quiz answers, store URLs, or full referrers logged.
 * Needs ACTIVITY_LOG KV for dashboard; Telegram secrets for chat notifications.
 */
const EVENTS={
 page_view:"👁 New page view",returning_visit:"🔁 Returning opted-in visitor",
 time_30s:"⏱ 30 seconds on page",time_120s:"⏱ 2 minutes on page",
 scroll_50:"📜 Scrolled halfway",scroll_90:"📜 Reached page bottom",
 store_check_start:"🧭 Store Check started",store_check_step:"🧭 Store Check progress",
 store_check_complete:"✅ Store Check completed",store_check_restart:"🔄 Store Check restarted",
 service_view:"🛠 Service page visited",service_click:"🛠 Service explored",
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
 const sid=safe(input.session,48),view=safe(input.view,48);
 if(!/^[A-Za-z0-9_-]{8,48}$/.test(sid)||!/^[A-Za-z0-9_-]{8,48}$/.test(view))return response({error:"Invalid session"},400);
 const path=safe(input.path,160).split("?")[0];if(!path.startsWith("/")||path.startsWith("//"))return response({error:"Invalid path"},400);
 const allowedDetail=["step","service","source","channel"];
 const details={};for(const k of allowedDetail){if(typeof input[k]==="string")details[k]=safe(input[k],55)}
 const country=safe(request.cf?.country||"Unknown",4);
 const record={event:input.type,label:EVENTS[input.type],id:crypto.randomUUID(),time:new Date().toISOString(),session:sid.slice(0,12),view:view.slice(0,12),page:path,device:device(request.headers.get("User-Agent")||""),country,site:new URL(request.url).hostname,details};
 if(!env.ACTIVITY_LOG&&!env.TELEGRAM_BOT_TOKEN)return response({ok:false,configured:false,error:"Activity backend not configured"},503);
 const jobs=[];
 if(env.ACTIVITY_LOG){const key="e:"+(9999999999999-Date.now()).toString().padStart(13,"0")+":"+record.id; jobs.push(env.ACTIVITY_LOG.put(key,JSON.stringify(record),{expirationTtl:60*60*24*7}))}
 if(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID){
  const body="<b>"+labelSafe(record.label)+"</b>\n"+
   "🕒 "+labelSafe(record.time)+"\n"+
   "🔖 "+labelSafe(record.session)+" / "+labelSafe(record.view)+"\n"+
   "🏠 "+labelSafe(record.site)+"\n"+"📄 "+labelSafe(record.page)+"\n"+
   "📱 "+labelSafe(record.device)+" · 🌍 "+labelSafe(record.country)+"\n"+
   Object.entries(details).map(([k,v])=>"• "+labelSafe(k)+": "+labelSafe(v)).join("\n")+
   "\n<i>Anonymous activity · not a confirmed lead or sale</i>";
  const url="https://api.telegram.org/bot"+env.TELEGRAM_BOT_TOKEN+"/sendMessage";
  jobs.push(fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chat_id:env.TELEGRAM_CHAT_ID,text:body,parse_mode:"HTML",disable_web_page_preview:true})}).then(r=>{if(!r.ok)console.log("Telegram delivery failed",r.status)}).catch(e=>console.log("Telegram request error",String(e).slice(0,140))));
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
export default {
 async fetch(request,env,ctx){
  const path=new URL(request.url).pathname;
  if(path==="/api/activity/ready")return response({enabled:Boolean(env.ACTIVITY_LOG||(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID)),storage:Boolean(env.ACTIVITY_LOG),notifications:Boolean(env.TELEGRAM_BOT_TOKEN&&env.TELEGRAM_CHAT_ID)});
  if(path==="/api/activity")return event(request,env,ctx);
  if(path==="/api/activity/report")return report(request,env);
  if(path.startsWith("/api/activity/"))return response({error:"Not found"},404);
  return env.ASSETS.fetch(request);
 }
};