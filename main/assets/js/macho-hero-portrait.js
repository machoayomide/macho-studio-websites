/* Gentle hero depth, respects reduced-motion and touch devices. */
(()=>{'use strict';
const stage=document.getElementById('kinetic-media'),model=document.getElementById('macho-portrait-scene');
if(!stage||!model||matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer: fine)').matches)return;
let tx=0,ty=0,x=0,y=0,id=0;
const step=()=>{id=0;x+=(tx-x)*.095;y+=(ty-y)*.095;model.style.transform=`perspective(1150px) rotateY(${(x*4).toFixed(2)}deg) rotateX(${(-y*3).toFixed(2)}deg) translate3d(${(x*6).toFixed(1)}px,${(y*4).toFixed(1)}px,0)`;if(Math.abs(tx-x)+Math.abs(ty-y)>.008)id=requestAnimationFrame(step)};
function move(a,b){tx=a;ty=b;if(!id)id=requestAnimationFrame(step)}
stage.addEventListener('pointermove',e=>{const r=stage.getBoundingClientRect();move((e.clientX-r.left)/r.width-.5,(e.clientY-r.top)/r.height-.5)},{passive:true});
stage.addEventListener('pointerleave',()=>move(0,0));
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(id)cancelAnimationFrame(id);id=0}else move(0,0)});
})();