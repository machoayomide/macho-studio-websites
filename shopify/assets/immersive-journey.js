/* Licensed 3D shopping bag, NoLagHere / Sketchfab (CC BY 4.0).
 * No AI-generated model. The store-check journey is independent of this viewer.
 */
(()=>{'use strict';
const journey=document.getElementById('shopify-kinetic'),stage=document.getElementById('commerce-3d');
if(!journey||!stage)return;
const panels=[...journey.querySelectorAll('[data-chapter]')],bar=journey.querySelector('.kinetic-progress-track i'),number=journey.querySelector('.kinetic-progress-label');
const pause=journey.querySelector('#kinetic-pause'),status=journey.querySelector('#kinetic-status');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const saver=!!connection?.saveData||!!connection?.effectiveType?.includes('2g')||(navigator.deviceMemory&&navigator.deviceMemory<=2);
let position=0,chapter=-1,viewer=null,starting=null,loading=false,visible=false,paused=false,lastUpdate=0;
function update(){
 const rect=journey.getBoundingClientRect(),span=Math.max(1,rect.height-innerHeight);
 position=Math.max(0,Math.min(1,-rect.top/span));
 const current=Math.min(3,Math.floor(position*4));
 if(current!==chapter){chapter=current;panels.forEach((p,i)=>{const active=i===chapter;p.classList.toggle('is-current',active);p.setAttribute('aria-hidden',String(!active));p.querySelectorAll('a,button').forEach(a=>a.tabIndex=active?0:-1)});number.textContent=String(chapter+1).padStart(2,'0')}
 bar.style.transform='scaleX('+Math.max(.035,position).toFixed(3)+')';setCamera();
}
let queued=false;
addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update()})},{passive:true});
addEventListener('resize',update,{passive:true});update();
pause?.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume 3D camera motion':'Pause 3D camera motion');pause.textContent=paused?'RESUME MOTION ▶':'PAUSE MOTION Ⅱ';if(!paused)setCamera(true)});
if(reduced){pause.hidden=true;status.textContent='STILL PREVIEW · REDUCED MOTION';return}
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.target!==journey)continue;visible=e.isIntersecting;if(visible&&!loading&&!saver)loadModel()}},{rootMargin:'250px 0px 250px 0px',threshold:.01});observer.observe(journey);
if(saver){
 const button=document.createElement('button');button.type='button';button.className='kinetic-load-button';button.textContent='LOAD 3D SHOPPING BAG ↗';
 button.setAttribute('aria-label','Load licensed shopping bag model from Sketchfab');
 stage.querySelector('.kinetic-fallback')?.append(button);
 button.addEventListener('click',()=>{button.remove();loadModel()},{once:true});
 pause.hidden=true;status.textContent='DATA-SAVER PREVIEW';
}
function loadScript(){
 return new Promise((resolve,reject)=>{if(window.Sketchfab){resolve();return}
 const script=document.createElement('script');script.src='https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js';script.async=true;
 script.onload=resolve;script.onerror=()=>reject(new Error('3D viewer unavailable'));document.head.append(script)});
}
function loadModel(){
 if(loading)return;loading=true;status.textContent='LOADING SHOPPING BAG 3D';
 loadScript().then(()=>{
  if(!window.Sketchfab)throw Error('Viewer library unavailable');
  const frame=document.createElement('iframe');
  frame.className='kinetic-shopping-bag-frame';frame.title='3D shopping bag by NoLagHere on Sketchfab';frame.setAttribute('allow','autoplay; fullscreen; xr-spatial-tracking');
  frame.setAttribute('referrerpolicy','strict-origin-when-cross-origin');
  stage.prepend(frame);
  const client=new window.Sketchfab('1.12.1',frame);
  client.init('cce3843714f74f85858a325f29ec6991',{
   autostart:1,autospin:0,camera:0,scrollwheel:0,dnt:1,transparent:1,max_texture_size:1024,ui_infos:0,ui_annotations:0,ui_vr:0,
   success:api=>{
    viewer=api;api.start();
    api.addEventListener('viewerready',()=>{
     stage.classList.add('model-ready');status.textContent='SHOPPING BAG · REAL 3D';
     api.getCameraLookAt((err,data)=>{
      if(!err&&data&&data.position&&data.target){starting=data;setCamera(true)}
     });
    });
   },
   error:()=>{status.textContent='SHOPPING BAG 3D UNAVAILABLE';stage.classList.add('model-unavailable')}
  });
 }).catch(()=>{status.textContent='SHOPPING BAG 3D UNAVAILABLE';stage.classList.add('model-unavailable');pause.hidden=true});
}
function setCamera(force=false){
 if(!viewer||!starting||!visible||paused)return;
 const now=performance.now();if(!force&&now-lastUpdate<220)return;lastUpdate=now;
 const pos=starting.position,target=starting.target,dx=pos[0]-target[0],dz=pos[2]-target[2];
 const radius=Math.max(.02,Math.hypot(dx,dz)),theta=Math.atan2(dz,dx)+position*Math.PI*2.2;
 const eye=[target[0]+Math.cos(theta)*radius,pos[1]+Math.sin(position*Math.PI*2)*radius*.1,target[2]+Math.sin(theta)*radius];
 viewer.setCameraLookAt(eye,target,force?0:.35);
}
})();