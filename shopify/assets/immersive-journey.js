/* Official Shopify Shopping Bag, with progressive scroll storytelling.
 * The original SVG remains unmodified. No external model or iframe is used.
 */
(()=>{'use strict';
const journey=document.getElementById('shopify-kinetic'),stage=document.getElementById('commerce-3d');
if(!journey||!stage)return;
const panels=[...journey.querySelectorAll('[data-chapter]')],bar=journey.querySelector('.kinetic-progress-track i'),number=journey.querySelector('.kinetic-progress-label');
const pause=journey.querySelector('#kinetic-pause'),status=journey.querySelector('#kinetic-status');
const reduce=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:760px)'),short=matchMedia('(max-height:550px)');
let paused=false,queued=false,current=-1;
const stacked=()=>reduce.matches||small.matches||short.matches;
function update(){
 queued=false;const isStacked=stacked();document.documentElement.classList.toggle('macho-journey-stacked',isStacked);
 const rect=journey.getBoundingClientRect();const pos=Math.max(0,Math.min(1,-rect.top/Math.max(1,rect.height-innerHeight)));
 const index=Math.min(3,Math.floor(pos*4));
 if(index!==current||isStacked){panels.forEach((p,i)=>{const active=isStacked||i===index;p.classList.toggle('is-current',active);p.setAttribute('aria-hidden',String(!active));p.querySelectorAll('a,button').forEach(a=>{if(active)a.removeAttribute('tabindex');else a.tabIndex=-1})});current=index;}
 if(bar)bar.style.transform='scaleX('+Math.max(.035,pos).toFixed(3)+')';if(number)number.textContent=String(index+1).padStart(2,'0');
 if(pause)pause.hidden=reduce.matches;
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(update)}
pause?.addEventListener('click',()=>{paused=!paused;stage.classList.toggle('is-paused',paused);pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume decorative motion':'Pause decorative motion');pause.textContent=paused?'RESUME MOTION ▶':'PAUSE MOTION Ⅱ'});
const io=new IntersectionObserver(entries=>{for(const entry of entries)stage.classList.toggle('is-offscreen',!entry.isIntersecting)});io.observe(journey);
document.addEventListener('visibilitychange',()=>stage.classList.toggle('is-offscreen',document.hidden));
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',()=>{current=-1;schedule()},{passive:true});reduce.addEventListener('change',()=>{current=-1;update()});
document.documentElement.classList.add('macho-journey-ready');if(status)status.textContent='SHOPIFY · THE SHOPPING BAG';update();
})();
