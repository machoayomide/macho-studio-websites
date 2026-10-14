/* MACHO / IMMERSIVE COMMERCE
 * True glTF model by Eric Chadwick for Wayfair; Khronos glTF-Sample-Assets, CC BY 4.0.
 * Not AI-generated. The scene uses one WebGL renderer, deferred ~2.7 MB model loading,
 * viewport-based rendering, interpolated scroll chapters and keyboard/pointer input.
 */
(()=>{'use strict';
const journey=document.getElementById('shopify-kinetic'),stage=document.getElementById('commerce-3d');
if(!journey||!stage)return;
const panels=[...journey.querySelectorAll('[data-chapter]')];
const progressBar=journey.querySelector('.kinetic-progress-track i');
const progressLabel=journey.querySelector('.kinetic-progress-label');
const pause=journey.querySelector('#kinetic-pause');
const status=journey.querySelector('#kinetic-status');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 760px)').matches;
const net=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const lowPower=!!net?.saveData || !!net?.effectiveType?.includes('2g') || (navigator.deviceMemory&&navigator.deviceMemory<=2);
let scrollProgress=0,chapter=-1,sceneController=null,loading=false,visible=false,paused=false,loadRequested=false;
const clamp=(v,min=0,max=1)=>Math.min(max,Math.max(min,v));
const state=()=>{const rect=journey.getBoundingClientRect(),range=Math.max(1,rect.height-innerHeight);return clamp(-rect.top/range)};
function selectChapter(n){
 if(chapter===n)return;chapter=n;
 panels.forEach((panel,i)=>{const selected=i===n;panel.classList.toggle('is-current',selected);panel.setAttribute('aria-hidden',String(!selected));panel.querySelectorAll('a,button').forEach(link=>{if(selected)link.removeAttribute('tabindex');else link.tabIndex=-1})});
 progressLabel.textContent=String(n+1).padStart(2,'0');
}
function updateScroll(){
 scrollProgress=state();const n=Math.min(3,Math.floor(scrollProgress*4));
 selectChapter(n);progressBar.style.transform='scaleX('+Math.max(.035,scrollProgress).toFixed(3)+')';
 sceneController?.setProgress(scrollProgress);
}
let scrolling=false;
addEventListener('scroll',()=>{if(scrolling)return;scrolling=true;requestAnimationFrame(()=>{scrolling=false;updateScroll()})},{passive:true});
addEventListener('resize',updateScroll,{passive:true});
updateScroll();
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.target!==journey)continue;visible=e.isIntersecting;sceneController?.setVisible(visible);if(visible&&!loadRequested&&!reduce.matches&&!lowPower)boot()}},{rootMargin:'350px 0px 350px 0px',threshold:.005});
observer.observe(journey);
pause?.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.setAttribute('aria-label',paused?'Resume 3D motion':'Pause 3D motion');pause.innerHTML=paused?'RESUME MOTION <span>▶</span>':'PAUSE MOTION <span>Ⅱ</span>';sceneController?.setPaused(paused)});
if(reduce.matches){status.textContent='STILL EXPERIENCE · REDUCED MOTION';pause.hidden=true;return}
if(lowPower){
 status.textContent='DATA-SAVER PREVIEW';
 const trigger=document.createElement('button');trigger.className='kinetic-load-button';trigger.type='button';trigger.textContent='LOAD INTERACTIVE 3D ↗';trigger.setAttribute('aria-label','Load interactive 3D product model (about 2.7 megabytes)');
 stage.querySelector('.kinetic-fallback')?.append(trigger);
 trigger.addEventListener('click',()=>{trigger.remove();boot()},{once:true});
}
function boot(){
 if(loadRequested)return;loadRequested=true;loading=true;status.textContent='LOADING REAL PRODUCT MODEL';
 Promise.all([import('three'),import('three/addons/loaders/GLTFLoader.js'),import('three/addons/environments/RoomEnvironment.js')])
 .then(async ([T,{GLTFLoader},{RoomEnvironment}])=>{
  if(!document.body.contains(stage))return;
  const renderer=new T.WebGLRenderer({alpha:true,antialias:!mobile,powerPreference:mobile?'low-power':'high-performance',preserveDrawingBuffer:false});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.2:1.65));
  renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
  renderer.setClearColor(0x000000,0);
  renderer.domElement.className='kinetic-canvas';renderer.domElement.setAttribute('aria-hidden','true');
  stage.prepend(renderer.domElement);
  const scene=new T.Scene();
  const camera=new T.PerspectiveCamera(mobile?35:33,1,.1,100);camera.position.set(0,1.55,9.2);
  const ambient=new T.AmbientLight(0xffffff,2.0);scene.add(ambient);
  const key=new T.DirectionalLight(0xf0ffed,4.1);key.position.set(5,8,7);scene.add(key);
  const fill=new T.DirectionalLight(0x7bffe0,2.1);fill.position.set(-6,2,1);scene.add(fill);
  const back=new T.DirectionalLight(0x8fa8ff,3.5);back.position.set(0,5,-7);scene.add(back);
  const pmrem=new T.PMREMGenerator(renderer);
  const environment=new RoomEnvironment(renderer);
  const room=pmrem.fromScene(environment,.04);scene.environment=room.texture;environment.dispose();pmrem.dispose();
  const pivot=new T.Group();scene.add(pivot);
  const fetchUrl='https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Assets@main/Models/GlassHurricaneCandleHolder/glTF-Binary/GlassHurricaneCandleHolder.glb';
  const loader=new GLTFLoader();
  const gltf=await loader.loadAsync(fetchUrl,progress=>{if(progress.total>0){status.textContent='LOADING 3D · '+Math.round(progress.loaded/progress.total*100)+'%'}});
  const model=gltf.scene;
  model.traverse(o=>{if(o.isMesh){o.castShadow=false;o.receiveShadow=false}});
  const box=new T.Box3().setFromObject(model),size=new T.Vector3(),center=new T.Vector3();
  box.getSize(size);box.getCenter(center);
  const longest=Math.max(size.x,size.y,size.z);
  if(!Number.isFinite(longest)||longest===0)throw Error('3D model dimensions invalid');
  const normalized=3.1/longest;model.scale.setScalar(normalized);model.position.copy(center).multiplyScalar(-normalized);
  const holder=new T.Group();holder.add(model);pivot.add(holder);
  const turntable=new T.Mesh(new T.TorusGeometry(2.05,.009,5,100),new T.MeshBasicMaterial({color:0x91f6b8,transparent:true,opacity:.44,depthWrite:false}));turntable.rotation.x=Math.PI/2.25;turntable.position.y=-1.55;scene.add(turntable);
  const subRing=new T.Mesh(new T.TorusGeometry(2.7,.005,3,100),new T.MeshBasicMaterial({color:0x9cd7ff,transparent:true,opacity:.2,depthWrite:false}));subRing.rotation.set(.24,0,.28);scene.add(subRing);
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(2,2);
  let anim=0,onScreen=visible,honorPause=paused,yaw=0,targetYaw=0,pitch=0,targetPitch=0,hover=0,dragging=false,lastX=0,lastY=0,last=0,scroll=scrollProgress,smoothed=scroll,wasHidden=false;
  function resize(){const rect=stage.getBoundingClientRect();if(rect.width<5||rect.height<5)return;camera.aspect=rect.width/rect.height;camera.fov=rect.width<400?38:(mobile?35:33);camera.updateProjectionMatrix();renderer.setSize(Math.round(rect.width),Math.round(rect.height),false)}
  const resizeObs=new ResizeObserver(resize);resizeObs.observe(stage);resize();
  function frame(t){
   anim=0;if(!onScreen||document.hidden)return;
   if(t-last<(mobile?36:18)){if(!honorPause)anim=requestAnimationFrame(frame);return}
   const dt=Math.min(.05,((t-last)||16)/1000);last=t;
   const ease=1-Math.exp(-dt*5.5);smoothed+=(scroll-smoothed)*ease;
   yaw+=(targetYaw-yaw)*ease;pitch+=(targetPitch-pitch)*ease;
   const phase=smoothed*Math.PI*3.5;
   pivot.rotation.y=phase+yaw+(honorPause?0:Math.sin(t*.00023)*.07);
   pivot.rotation.x=Math.sin(smoothed*Math.PI*2)*.2+pitch;
   pivot.rotation.z=Math.sin(smoothed*Math.PI*1.6)*.12;
   pivot.position.x=.16*Math.sin(smoothed*Math.PI*2.7);
   pivot.position.y=.1*Math.sin(smoothed*7)+(honorPause?0:Math.sin(t*.001)*.12);
   const k=1+hover*.07;
   holder.scale.setScalar(k*(1+.05*Math.sin(smoothed*Math.PI*2)));
   camera.position.z=(mobile?9.35:8.5)-Math.sin(smoothed*Math.PI)*.9;
   camera.position.x=.4*Math.sin(smoothed*Math.PI*2);
   camera.lookAt(0,0,0);
   turntable.rotation.z=smoothed*Math.PI*2;
   subRing.rotation.y=smoothed*Math.PI*2.8;
   renderer.render(scene,camera);
   if(!honorPause || Math.abs(smoothed-scroll)>.002 || Math.abs(yaw-targetYaw)>.002 || Math.abs(pitch-targetPitch)>.002)anim=requestAnimationFrame(frame);
  }
  const queue=()=>{if(!anim&&onScreen&&!document.hidden){last=0;anim=requestAnimationFrame(frame)}};
  const pointerStart=e=>{if(e.target.closest('button,a'))return;dragging=true;lastX=e.clientX;lastY=e.clientY;stage.setPointerCapture?.(e.pointerId);stage.classList.add('is-grabbing')};
  const pointerMove=e=>{
   const rect=stage.getBoundingClientRect();
   if(dragging){targetYaw=clamp(targetYaw+(e.clientX-lastX)/rect.width*3,-2.4,2.4);targetPitch=clamp(targetPitch+(e.clientY-lastY)/rect.height*1.8,-.6,.6);lastX=e.clientX;lastY=e.clientY;queue()}
   else if(e.pointerType==='mouse'){pointer.x=(e.clientX-rect.left)/rect.width*2-1;pointer.y=-(e.clientY-rect.top)/rect.height*2+1;raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObject(model,true);hover=hits.length?1:0;stage.classList.toggle('is-hovering',!!hover);if(hover)queue()}
  };
  const pointerEnd=()=>{dragging=false;stage.classList.remove('is-grabbing')};
  const keys=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key)){e.preventDefault();if(e.key==='Home'){targetYaw=0;targetPitch=0}else if(e.key==='ArrowLeft')targetYaw-=.18;else if(e.key==='ArrowRight')targetYaw+=.18;else if(e.key==='ArrowUp')targetPitch-=.11;else targetPitch+=.11;queue()}};
  stage.addEventListener('pointerdown',pointerStart);stage.addEventListener('pointermove',pointerMove);stage.addEventListener('pointerup',pointerEnd);stage.addEventListener('pointercancel',pointerEnd);stage.addEventListener('lostpointercapture',pointerEnd);stage.addEventListener('keydown',keys);
  stage.addEventListener('pointerleave',()=>{if(!dragging){hover=0;stage.classList.remove('is-hovering');queue()}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(anim)cancelAnimationFrame(anim);anim=0}else queue()});
  sceneController={
   setProgress(v){scroll=v;queue()},
   setPaused(v){honorPause=v;queue();if(v)renderer.render(scene,camera)},
   setVisible(v){onScreen=!!v;if(!onScreen){if(anim)cancelAnimationFrame(anim);anim=0}else queue()}
  };
  stage.classList.add('model-ready');status.textContent='REAL-TIME GLTF · DRAG / SCROLL';
  sceneController.setVisible(visible);sceneController.setPaused(paused);sceneController.setProgress(scrollProgress);
 })
 .catch(err=>{console.warn('MACHO 3D fallback:',err);stage.classList.add('model-unavailable');status.textContent='3D PREVIEW UNAVAILABLE · TEXT REMAINS ACCESSIBLE';pause.hidden=true})
 .finally(()=>{loading=false});
}
})();