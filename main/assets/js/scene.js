(function(){
'use strict';
const stage=document.getElementById('scene-stage');
const workspace=document.getElementById('hero-workspace');
if(!stage||!workspace)return;
const buttons=workspace.querySelectorAll('button[data-switch]');
const ref=workspace.querySelector('.workspace-ref');
const scenes={commerce:'01 / 03',apps:'02 / 03',automation:'03 / 03'};
buttons.forEach(button=>button.addEventListener('click',()=>{
 const selection=button.dataset.switch;
 if(!Object.prototype.hasOwnProperty.call(scenes,selection))return;
 stage.dataset.scene=selection;
 buttons.forEach(other=>{const active=other===button;other.classList.toggle('is-selected',active);other.setAttribute('aria-pressed',active?'true':'false');});
 if(ref)ref.textContent=scenes[selection];
}));
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse=window.matchMedia('(pointer: coarse)').matches;
if(reduced||coarse)return;
let raf=0,rx=0,ry=0;
workspace.addEventListener('pointermove',e=>{
 const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;
 rx=((e.clientX-r.left)/r.width-.5)*7;
 ry=((e.clientY-r.top)/r.height-.5)*6;
 if(raf)return;
 raf=requestAnimationFrame(()=>{stage.style.setProperty('--pointer-x',rx.toFixed(2)+'px');stage.style.setProperty('--pointer-y',ry.toFixed(2)+'px');stage.style.transform=`perspective(1200px) rotateY(${rx*.26}deg) rotateX(${-ry*.26}deg)`;raf=0;});
});
workspace.addEventListener('pointerleave',()=>{stage.style.transform='';stage.style.removeProperty('--pointer-x');stage.style.removeProperty('--pointer-y');});
})();
