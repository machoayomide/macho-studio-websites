/* MACHO Store Check — transparent, client-side rule-based recommendations.
 * No tracking, external analytics, API calls or automatic submission.
 * Estimates are self-reported, never treated as verified store diagnostics.
 */
(()=>{'use strict';
const app=document.getElementById('store-check-app');if(!app)return;
const $=(selector,root=app)=>root.querySelector(selector);
const questions=[
 {id:'age',tag:'YOUR STORE',heading:'How long has your store been around?',hint:'An estimate is enough.',options:[['not-live','Not launched yet'],['new','Under 6 months'],['growing','6 months to 2 years'],['mature','More than 2 years'],['unsure','I am not sure']]},
 {id:'sales',tag:'YOUR SALES',heading:'About how much does your store sell each month?',hint:'A rough amount in USD is fine. You do not need the exact sales number, and "Not sure" is perfectly fine.',options:[['none','No sales yet'],['low','Under US$1,000'],['some','US$1,000–10,000'],['mid','US$10,000–50,000'],['high','Over US$50,000'],['unsure','I am not sure']]},
 {id:'traffic',tag:'YOUR VISITORS',heading:'Roughly how many people visit your store monthly?',hint:'You can find this in Shopify Analytics. If you do not know, choose "Not sure".',options:[['few','Fewer than 500'],['medium','500–5,000'],['large','5,000–25,000'],['huge','Over 25,000'],['unsure','I do not know']]},
 {id:'mobile',tag:'YOUR EXPERIENCE',heading:'What happens when someone shops on their phone?',hint:'Go with what you have seen or heard from customers.',options:[['good','Looks good and feels fast'],['slow','Pages are slow to load'],['awkward','Hard to navigate or poorly designed'],['both','Both slow and hard to use'],['unsure','I have not checked']]},
 {id:'salesJourney',tag:'HOW PEOPLE BUY',heading:'What describes the buying journey best?',hint:'If you have not checked, that is useful to know too.',options:[['none','I have not launched or sold yet'],['no-convert','Visitors come but few buy'],['abandon','People add to cart but rarely finish checkout'],['okay','Orders seem to come through normally'],['unsure','I have no idea']]},
 {id:'operations',tag:'BEHIND THE STORE',heading:'What is happening behind the scenes?',hint:'This helps me see if you need design, backend fixes, or automation.',options:[['fine','Orders, stock and apps work well'],['manual','We do a lot manually'],['broken','Apps, orders or checkout rules keep breaking'],['out-of-sync','Inventory or orders get out of sync'],['unsure','I am not sure']]},
 {id:'goals',tag:'WHAT YOU WANT NEXT',heading:'What would you most like to improve?',hint:'Choose up to three. These guide the recommendations.',multiple:true,max:3,options:[['visitors','Bring more visitors from Google'],['design','Make my store look more professional'],['sales','Turn more visitors into customers'],['speed','Improve loading speed'],['systems','Fix integrations, apps or backend issues'],['wholesale','Start selling to wholesale buyers'],['move','Move from another platform to Shopify'],['unsure','I need help deciding']]}
];
const services={
 seo:{name:'Shopify SEO & search visibility',slug:'shopify-seo',desc:'Check indexing, collections, SEO metadata, redirects, and content for search engines.',why:'Your answers show SEO may need a closer look.'},
 cro:{name:'Conversion & checkout review',slug:'conversion-optimization',desc:'Check product pages, carts, and checkout to see what makes shopping hard.',why:'Your answers may show that people visit but do not buy.'},
 theme:{name:'Store design & UX refresh',slug:'custom-themes',desc:'Make store pages, menus, and products easier to use on phones.',why:'Your storefront experience may need a closer look.'},
 speed:{name:'Mobile speed & theme performance',slug:'fixes-speed',desc:'Check slow pages, large images, scripts, and app code.',why:'Mobile performance may be an obstacle.'},
 backend:{name:'Backend fixes & app troubleshooting',slug:'backend-fixes',desc:'Check broken apps, orders, checkout, and Shopify API connections.',why:'Your answers show there may be technical problems to check.'},
 sync:{name:'Inventory & system integrations',slug:'integrations',desc:'Check stock numbers, repeat tasks, marketplaces, and order automation.',why:'Connecting your tools may save time and reduce stock errors.'},
 checkout:{name:'Checkout and discount rules',slug:'checkout-functions',desc:'Check carts, checkout, discounts, and Shopify plan limits.',why:'Your answers show checkout may need a closer look.'},
 launch:{name:'Theme setup & launch readiness',slug:'custom-themes',desc:'Set up key pages, policies, products, phone menus, and launch tests.',why:'A new store needs the basics to work before bigger changes.'},
 b2b:{name:'B2B & wholesale setup',slug:'b2b-wholesale',desc:'Check B2B sign-up forms, company accounts, prices, and bulk orders.',why:'You identified wholesale as a growth goal.'},
 migration:{name:'Shopify store migration',slug:'migrations',desc:'Plan products, collections, customers, redirects, and test checks before moving.',why:'You want to move an existing store to Shopify.'}
};
let step=0,answers={};const start=$('#check-start'),questionArea=$('#check-questions'),resultArea=$('#check-results');
const startBtn=$('#check-start-button'),backBtn=$('#check-back'),nextBtn=$('#check-next'),progress=$('#check-progress-fill'),stepLabel=$('#check-step-label');
const field=$('#check-options'),qtitle=$('#check-question-title'),qtag=$('#check-question-tag'),qhint=$('#check-question-hint'),error=$('#check-error');
function question(){const q=questions[step];qtag.textContent=q.tag;qtitle.textContent=q.heading;qhint.textContent=q.hint;stepLabel.textContent=(step+1)+' OF '+questions.length;progress.style.width=((step+1)/questions.length*100).toFixed(2)+'%';
 field.replaceChildren();
 for(const [value,label] of q.options){const button=document.createElement('button');button.type='button';button.className='check-option';
  const selected=q.multiple?(answers[q.id]||[]).includes(value):answers[q.id]===value;
  button.setAttribute('aria-pressed',String(selected));button.classList.toggle('is-chosen',selected);
  const marker=document.createElement('span');marker.className='check-option-indicator';marker.setAttribute('aria-hidden','true');marker.textContent=selected?'✓':'↗';
  const caption=document.createElement('span');caption.textContent=label;button.append(marker,caption);
  button.addEventListener('click',()=>choose(q,value));field.append(button)}
 backBtn.hidden=step===0;nextBtn.textContent=step===questions.length-1?'SEE MY STORE PLAN ↗':'CONTINUE ↗';error.textContent='';
 const has=q.multiple?(answers[q.id]||[]).length>0:!!answers[q.id];nextBtn.disabled=!has;
}
function choose(q,value){
 if(q.multiple){const old=answers[q.id]||[];let next;
  if(value==='unsure'){next=['unsure']}else{next=old.filter(v=>v!=='unsure');if(next.includes(value))next=next.filter(v=>v!==value);else if(next.length<q.max)next=[...next,value];else{error.textContent='Choose up to three priorities.';return}}
  answers[q.id]=next;
 }else answers[q.id]=value;
 question();
 if(!q.multiple&&matchMedia('(prefers-reduced-motion: reduce)').matches===false){/* Manual Continue remains: avoids skipping unexpectedly */ }
}
function show(stepName){start.hidden=stepName!=='intro';questionArea.hidden=stepName!=='question';resultArea.hidden=stepName!=='result';}
startBtn.addEventListener('click',()=>{show('question');step=0;question();qtitle.focus()});
backBtn.addEventListener('click',()=>{if(step>0){step--;question();qtitle.focus()}});
nextBtn.addEventListener('click',()=>{const q=questions[step],filled=q.multiple?(answers[q.id]||[]).length>0:!!answers[q.id];if(!filled){error.textContent='Please choose an answer to continue.';return}
 if(step<questions.length-1){step++;question();qtitle.focus()}else finish()});
$('#check-restart').addEventListener('click',()=>{answers={};step=0;show('intro');startBtn.focus()});
function evaluate(){
 const scores=Object.fromEntries(Object.keys(services).map(x=>[x,0]));const reasons={};
 const add=(id,amount,explanation)=>{scores[id]+=amount;if(explanation){(reasons[id]||=[]).push(explanation)}};
 const age=answers.age,sales=answers.sales,traffic=answers.traffic,mobile=answers.mobile,buy=answers.salesJourney,ops=answers.operations,g=answers.goals||[];
 if(age==='not-live'){add('launch',6,'Your store has not launched yet.');add('theme',2);if(g.includes('move'))add('migration',5)}
 if(age==='new'){add('launch',3,'Your store is still new.');add('theme',1)}
 if(age==='mature'){add('theme',1)}
 if(mobile==='slow'){add('speed',7,'You reported slow mobile pages.')}
 if(mobile==='awkward'){add('theme',7,'You reported difficult mobile navigation or design.')}
 if(mobile==='both'){add('speed',6,'You reported slow mobile pages.');add('theme',6,'You reported a difficult mobile shopping experience.')}
 if(mobile==='unsure'){add('speed',1,'A mobile check would help establish a baseline.')}
 if(buy==='no-convert'){add('cro',7,'You reported visits without many purchases.')}
 if(buy==='abandon'){add('checkout',7,'You reported cart or checkout abandonment.');add('cro',4)}
 if(buy==='none')add('launch',2);
 if(buy==='unsure')add('cro',1,'Conversion tracking may need an initial check.');
 if(ops==='broken'){add('backend',9,'You reported malfunctioning apps or order rules.');add('checkout',2)}
 if(ops==='out-of-sync'){add('sync',9,'You reported stock or order sync issues.');add('backend',2)}
 if(ops==='manual'){add('sync',7,'You reported repetitive manual operations.')}
 if(ops==='unsure')add('backend',1,'The operational setup has not yet been checked.');
 if(g.includes('visitors'))add('seo',8,'You want more visitors from search.');
 if(g.includes('design'))add('theme',7,'A refreshed storefront is one of your goals.');
 if(g.includes('sales'))add('cro',7,'You want more visits to turn into purchases.');
 if(g.includes('speed'))add('speed',7,'Speed improvement is a stated goal.');
 if(g.includes('systems')){add('backend',6,'You want help fixing apps or technical issues.');add('sync',2)}
 if(g.includes('wholesale'))add('b2b',9,'You plan to sell to wholesale customers.');
 if(g.includes('move'))add('migration',10,'You plan to move an existing store to Shopify.');
 if(traffic==='few'&&buy!=='abandon'&&age!=='not-live')add('seo',2,'You said you have few visitors. It may help to check how people find your store.');
 if((traffic==='large'||traffic==='huge')&&(sales==='none'||sales==='low')&&age!=='not-live')add('cro',5,'You said you get more visitors than sales. This is not a verified conversion rate.');
 if(sales==='high'||sales==='mid'){if(ops==='manual'||ops==='out-of-sync')add('sync',2);}
 if((g.includes('unsure')||g.length===0)&&Object.values(scores).every(x=>x===0))add('backend',1,'A quick store review can help you know where to start.');
 let ranking=Object.entries(scores).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
 if(ranking.length<3){for(const id of ['cro','seo','speed','theme']){if(!ranking.some(x=>x[0]===id))ranking.push([id,0]);if(ranking.length>=3)break}}
 return ranking.slice(0,4).map(([id,score])=>({id,score,...services[id],reason:(reasons[id]||[])[0]||services[id].why}));
}
function safeText(v){return String(v??'').replace(/[<>&]/g,'').slice(0,400)}
function summary(recs){return 'MACHO STORE CHECK — SELF-REPORTED ASSESSMENT\n'+questions.map(q=>q.heading+'\n'+(q.multiple?(answers[q.id]||[]).map(v=>q.options.find(o=>o[0]===v)?.[1]).join(', '):q.options.find(o=>o[0]===answers[q.id])?.[1]||'Not answered')).join('\n\n')+'\n\nThings we may need to check (not a full store audit):\n'+recs.map((x,i)=>(i+1)+'. '+x.name+' — '+x.reason).join('\n')+'\n\nBased on your answers, not verified Shopify Analytics.'}

function buildReport(){
 const notes=[],age=answers.age,mobile=answers.mobile,buy=answers.salesJourney,ops=answers.operations;
 const add=(label,observation,verify)=>notes.push({label,observation,verify});
 if(age==='not-live')add('Store launch readiness','Your store is not live yet. Before paying for ads, check products, shipping, policies, phones, and checkout.','Launch checklist, test orders, product/collection setup and mobile checkout');
 else if(age==='new')add('Early-stage fundamentals','Your store is new. It may help to check analytics and make shopping easy before getting a new design.','Analytics setup, product-page clarity, traffic source mix and customer questions');
 else if(age==='mature')add('Established-store opportunities','Your store has been around for a while. Check theme updates, old integrations, and product groups.','Theme version, app inventory, analytics trends and checkout compatibility');
 if(mobile==='slow'||mobile==='both')add('Reported mobile slowness','You said your store is slow on phones. Images, scripts, apps, or the theme may be the cause. This is not confirmed.','Core Web Vitals, mobile network waterfall, media loading and app scripts');
 if(mobile==='awkward'||mobile==='both')add('Reported mobile shopping friction','Your phone layout or menus may make shopping hard.','Real-device navigation, search, product cards, readability and add-to-cart');
 if(mobile==='unsure')add('Unmeasured mobile experience','You have not tested the store on a phone. It is best to check it on a real phone.','Mobile speed, layout and purchase test on a representative device');
 if(buy==='no-convert')add('Visitors may not be buying','You indicated that visitors arrive but few purchase. That alone does not establish why; product fit, pricing, trust, shipping and checkout could all matter.','Verified traffic, add-to-cart rate, conversion funnel and customer feedback');
 if(buy==='abandon')add('Reported cart or checkout drop-off','You reported abandoned carts or incomplete checkouts. The cause could relate to shipping costs, trust, payment options or usability.','Cart events, checkout steps, shipping disclosures, available payment methods');
 if(buy==='unsure')add('Unknown buying performance','Your checkout performance is unclear, so a measurement check should come before major changes.','Shopify Analytics funnel, test purchases and order status');
 if(ops==='broken')add('Technical issues behind the store','You reported broken apps, order flows or checkout rules. These should be reproduced and traced before changes are deployed.','App errors, logs, webhook delivery, Shopify plan and affected order paths');
 if(ops==='out-of-sync')add('Inventory or order sync issues','You reported information not matching between sales or fulfillment systems. Overselling or manual corrections may result.','SKU mapping, source of truth, inventory updates, API/webhook failure logs');
 if(ops==='manual')add('Time spent on manual operations','You reported repetitive operations. Some work may be automated after business rules and exception handling are clarified.','Repeated order tasks, spreadsheet transfers and tool integration possibilities');
 if(ops==='unsure')add('Unknown backend reliability','The operational side of your store has not been reviewed.','Order notifications, stock accuracy and app/fulfillment flows');
 const goals=answers.goals||[];
 if(goals.includes('visitors'))add('Search visibility goal','You want more visitors from Google. Before SEO work, the store needs a baseline for indexing, search intent and existing organic traffic.','Search Console, catalog indexing, product/collection metadata and search queries');
 if(goals.includes('wholesale'))add('Wholesale expansion','You want to sell to trade buyers. Account access, catalog pricing and order rules need a Shopify-plan compatibility review.','Shopify B2B eligibility, catalogs, onboarding, taxes and payment terms');
 if(goals.includes('move'))add('Platform migration goal','You intend to move to Shopify. Migration quality depends on source platform data and a tested cutover plan.','Products, collections, customer records, redirects and old-vs-new counts');
 if(!notes.length)add('Initial store review recommended','Your answers do not show a clear single problem. That is a reason to review the store rather than prescribe work prematurely.','Live storefront test, basic analytics, operational checks and project goals');
 return notes;
}
function answerLabel(q){if(q.multiple)return(answers[q.id]||[]).map(v=>q.options.find(o=>o[0]===v)?.[1]).filter(Boolean).join(', ')||'Not supplied';return q.options.find(o=>o[0]===answers[q.id])?.[1]||'Not supplied'}
function renderReport(notes){
 const issues=$('#check-issues'),snapshot=$('#check-snapshot');issues.replaceChildren();snapshot.replaceChildren();
 notes.forEach((note,i)=>{const card=document.createElement('article');card.className='check-issue';
 const number=document.createElement('span');number.className='check-issue-num';number.textContent=String(i+1).padStart(2,'0');
 const title=document.createElement('h4');title.textContent=note.label;
 const observation=document.createElement('p');observation.textContent=note.observation;
 const verify=document.createElement('p');verify.className='check-verify';verify.textContent='Expert should verify: '+note.verify;
 card.append(number,title,observation,verify);issues.append(card)});
 questions.forEach(q=>{const row=document.createElement('div');const term=document.createElement('dt');term.textContent=q.heading;const description=document.createElement('dd');description.textContent=answerLabel(q);row.append(term,description);snapshot.append(row)})
}

function finish(){
 const recs=evaluate(),notes=buildReport();show('result');renderReport(notes);
 const cards=$('#check-recommendations');cards.replaceChildren();
 recs.forEach((rec,index)=>{
  const card=document.createElement('article');card.className='check-recommendation';
  const priority=document.createElement('span');priority.className='check-rec-tag';priority.textContent=index===0?'FIRST TO INVESTIGATE':'ALSO WORTH CHECKING';
  const heading=document.createElement('h3');heading.textContent=rec.name;
  const why=document.createElement('p');why.className='check-rec-reason';why.textContent=rec.reason;
  const desc=document.createElement('p');desc.textContent=rec.desc;
  const link=document.createElement('a');link.href='/services/'+rec.slug+'/';link.textContent='Learn about this service ↗';
  card.append(priority,heading,why,desc,link);cards.append(card)
 });
 const text=summary(recs)+'\n\nINITIAL REPORT (SELF-REPORTED SYMPTOMS):\n'+notes.map((n,i)=>(i+1)+'. '+n.label+'\n  '+n.observation+'\n  To verify: '+n.verify).join('\n')+'\n\nIMPORTANT: A MACHO expert must review the real store and its analytics/technical setup before determining which services are needed, if any. No diagnosis or quote has been made.';
 const copy=$('#check-copy');copy.onclick=async()=>{try{await navigator.clipboard.writeText(text);copy.textContent='COPIED ✓';setTimeout(()=>copy.textContent='COPY MY PLAN ↗',2600)}catch(e){copy.textContent='COPY NOT AVAILABLE';setTimeout(()=>copy.textContent='COPY MY PLAN ↗',2600)}};
 const contact=$('#check-contact');contact.href='/contact/?assessment=1&service='+encodeURIComponent(recs[0].slug);
 contact.onclick=()=>{try{sessionStorage.setItem('macho_shopify_assessment_v1',JSON.stringify({summary:text,created:Date.now(),primary:recs[0].slug}))}catch(e){/* optional transfer; users can still copy their plan */}};
 const email=$('#check-email');email.href='mailto:contact@macho.studio?subject='+encodeURIComponent('MACHO store check: request a review')+'&body='+encodeURIComponent(text.slice(0,6000)+'\n\nPlease contact me to discuss.');
 const whatsapp=$('#check-whatsapp');whatsapp.href='https://wa.me/2349160956794?text='+encodeURIComponent(text.slice(0,3800)+'\n\nI would like help reviewing my store.');
 $('#check-result-heading').textContent=(answers.age==='not-live')?'Your store launch priorities.':'Here are areas worth reviewing.';
 $('#check-result-subtitle').textContent='This is your complete self-reported store snapshot with potential issues, what an expert should verify, and services worth considering. It is not a completed Shopify audit.';
 $('#check-results-top').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});$('#check-results-top').focus();
}
show('intro');
})();