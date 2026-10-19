/* Native scrolling keeps every review available without JavaScript. */
(()=>{'use strict';
document.querySelectorAll('[data-testimonials]').forEach(root=>{
 const rail=root.querySelector('.reviews-rail'),cards=[...rail.children],prev=root.querySelector('[data-review-prev]'),next=root.querySelector('[data-review-next]'),pause=root.querySelector('[data-review-pause]'),count=root.querySelector('[data-review-count]'),live=root.querySelector('[data-review-live]'),dots=[...root.querySelectorAll('[data-review-dot]')];
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 let index=0,paused=false,hover=false,focused=false,visible=false,timer=0,scrollFrame=0,drag=null;
 const left=i=>cards[i].offsetLeft-cards[0].offsetLeft;
 const stop=()=>{clearTimeout(timer);timer=0};
 function schedule(){stop();if(!paused&&!hover&&!focused&&visible&&!document.hidden&&!reduce.matches)timer=setTimeout(()=>go(index===cards.length-1?0:index+1,false),6500)}
 function paint(){count.textContent=String(index+1).padStart(2,'0')+' / '+String(cards.length).padStart(2,'0');dots.forEach((d,i)=>d.setAttribute('aria-pressed',String(i===index)))}
 function go(i,manual=true){index=(i+cards.length)%cards.length;rail.scrollTo({left:left(index),behavior:reduce.matches?'instant':'smooth'});paint();if(manual)live.textContent='Review '+(index+1)+' of '+cards.length+': '+cards[index].querySelector('cite').textContent;schedule()}
 prev.addEventListener('click',()=>go(index-1));next.addEventListener('click',()=>go(index+1));dots.forEach((d,i)=>d.addEventListener('click',()=>go(i)));
 function motion(){pause.disabled=reduce.matches;pause.textContent=reduce.matches?'MOTION OFF':paused?'PLAY REVIEWS ▷':'PAUSE REVIEWS Ⅱ';pause.setAttribute('aria-pressed',String(paused||reduce.matches));pause.setAttribute('aria-label',reduce.matches?'Automatic reviews disabled for reduced motion':paused?'Play automatic reviews':'Pause automatic reviews');schedule()}
 pause.addEventListener('click',()=>{paused=!paused;motion()});reduce.addEventListener('change',motion);
 rail.addEventListener('keydown',e=>{if(e.target!==rail)return;const actions={ArrowRight:()=>go(index+1),ArrowLeft:()=>go(index-1),Home:()=>go(0),End:()=>go(cards.length-1)};if(actions[e.key]){e.preventDefault();actions[e.key]()}});
 rail.addEventListener('scroll',()=>{if(scrollFrame)return;scrollFrame=requestAnimationFrame(()=>{scrollFrame=0;const distances=cards.map((_,i)=>Math.abs(left(i)-rail.scrollLeft));index=distances.indexOf(Math.min(...distances));paint()})},{passive:true});
 // Touch uses the browser's own scrolling, so vertical page gestures stay available.
 rail.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button'))return;drag={x:e.clientX,left:rail.scrollLeft,id:e.pointerId};stop();rail.setPointerCapture(e.pointerId);rail.classList.add('is-dragging')});
 rail.addEventListener('pointermove',e=>{if(drag){rail.scrollLeft=drag.left+drag.x-e.clientX}});
 const release=()=>{if(!drag)return;drag=null;rail.classList.remove('is-dragging');go(index,false)};
 rail.addEventListener('pointerup',release);rail.addEventListener('pointercancel',release);rail.addEventListener('lostpointercapture',release);
 root.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){hover=true;stop()}});root.addEventListener('pointerleave',()=>{hover=false;schedule()});
 root.addEventListener('focusin',()=>{focused=true;stop()});root.addEventListener('focusout',()=>requestAnimationFrame(()=>{focused=root.contains(document.activeElement);schedule()}));
 rail.addEventListener('touchstart',stop,{passive:true});rail.addEventListener('touchend',schedule,{passive:true});
 document.addEventListener('visibilitychange',schedule);
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;schedule()},{threshold:.15});io.observe(root);
 root.classList.add('reviews-ready');paint();motion();
});
})();
