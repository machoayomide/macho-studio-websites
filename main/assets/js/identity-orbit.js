/* MACHO / KINETIC IDENTITY
 * Original real-time WebGL sculpture matching the segmented-orb brand direction.
 * Designed from three curved spherical shells: no AI imagery, downloaded model or video.
 */
(()=>{'use strict';
const story=document.getElementById('macho-orbit'),stage=document.getElementById('macho-orbit-stage');
if(!story||!stage)return;
const chapters=[...story.querySelectorAll('[data-orbit-chapter]')];
const step=story.querySelector('#orbit-current-step'),bar=story.querySelector('#orbit-progress-bar');
const pauseBtn=story.querySelector('#macho-orbit-pause'),status=story.querySelector('#macho-orbit-status');
const reduce=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width:760px)').matches,saveData=navigator.connection?.saveData||(navigator.deviceMemory&&navigator.deviceMemory<=2);
let scroll=0,current=-1,sceneControl=null,started=false,visible=false,paused=false,queued=false;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
function sync(){
 const rect=story.getBoundingClientRect();const span=Math.max(1,rect.height-innerHeight);scroll=clamp(-rect.top/span);
 const n=Math.min(2,Math.floor(scroll*3));
 if(n!==current){current=n;chapters.forEach((el,i)=>{const active=i===n;el.classList.toggle('is-active',active);el.setAttribute('aria-hidden',String(!active));el.querySelectorAll('a').forEach(a=>a.tabIndex=active?0:-1)});step.textContent=String(n+1).padStart(2,'0')}
 bar.style.transform='scaleX('+Math.max(.025,scroll).toFixed(3)+')';sceneControl?.setScroll(scroll);
}
addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;sync()})}},{passive:true});
addEventListener('resize',sync,{passive:true});sync();
pauseBtn?.addEventListener('click',()=>{paused=!paused;pauseBtn.setAttribute('aria-pressed',String(paused));pauseBtn.textContent=paused?'RESUME ▶':'PAUSE Ⅱ';sceneControl?.setPaused(paused)});
if(reduce.matches){status.textContent='STATIC MODE';pauseBtn.hidden=true;return}
if(saveData){status.textContent='LOW-DATA · STATIC MARK';pauseBtn.hidden=true;return}
const observer=new IntersectionObserver(entries=>{for(const e of entries){if(e.target===story){visible=e.isIntersecting;sceneControl?.setVisible(visible);if(visible&&!started)build()}}},{rootMargin:'350px 0px 350px 0px',threshold:.01});observer.observe(story);
async function build(){
 if(started)return;started=true;
 status.textContent='PREPARING 3D';
 try{
 const [T,{RoomEnvironment}]=await Promise.all([import('three'),import('three/addons/environments/RoomEnvironment.js')]);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:!mobile,powerPreference:mobile?'low-power':'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,mobile?1.2:1.55));renderer.setClearColor(0x000000,0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.24;
 renderer.domElement.setAttribute('aria-hidden','true');stage.prepend(renderer.domElement);
 const pmrem=new T.PMREMGenerator(renderer);const roomEnvironment=new RoomEnvironment(renderer);const environment=pmrem.fromScene(roomEnvironment,.035);roomEnvironment.dispose();pmrem.dispose();
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(mobile?36:33,1,.1,45);scene.environment=environment.texture;
 camera.position.set(0,0,mobile?8.8:8);camera.lookAt(0,0,0);
 scene.add(new T.AmbientLight(0xeaf0ff,2.05));
 const key=new T.DirectionalLight(0xe4edff,5.1);key.position.set(-3,6,6);scene.add(key);
 const sapphire=new T.PointLight(0x286fff,58,15,1.5);sapphire.position.set(3,-.2,4.5);scene.add(sapphire);
 const rim=new T.DirectionalLight(0x92bcff,3.4);rim.position.set(4,2,-4);scene.add(rim);
 const orbit=new T.Group();scene.add(orbit);
 // Spherical physical surfaces: three bands separated by open negative space.
 const silver=new T.MeshPhysicalMaterial({color:0x46516c,metalness:.87,roughness:.22,clearcoat:.95,clearcoatRoughness:.09,side:T.DoubleSide});
 const silver2=new T.MeshPhysicalMaterial({color:0x1d2c50,metalness:.8,roughness:.2,clearcoat:1,clearcoatRoughness:.07,side:T.DoubleSide});
 const accent=new T.MeshStandardMaterial({color:0x127eff,metalness:.54,roughness:.16,emissive:0x073aa4,emissiveIntensity:1.15,side:T.DoubleSide});
 const glassCore=new T.Mesh(new T.SphereGeometry(1.66,56,40),new T.MeshPhysicalMaterial({color:0x081a3a,metalness:.7,roughness:.33,transparent:true,opacity:.97}));
 orbit.add(glassCore);
 const shells=new T.Group();orbit.add(shells);
 shells.rotation.set(.27,.3,-.47);
 const segments=[[.13,.74,silver],[1.03,.87,silver2],[2.18,.71,silver]];
 const bands=[],seams=[];
 segments.forEach(([theta,span,material],i)=>{
  const mesh=new T.Mesh(new T.SphereGeometry(1.93,96,42,0,Math.PI*2,theta,span),material.clone());
  mesh.material.side=T.DoubleSide;mesh.userData.index=i;shells.add(mesh);bands.push(mesh);
  const ridge=new T.Mesh(new T.SphereGeometry(1.929,96,14,0,Math.PI*2,theta+span-.055,.042),accent);
  mesh.add(ridge);seams.push(ridge);
 });
 // Distinct blue illuminations inside the physical sphere gaps.
 for(const theta of [.935,1.99]){const o=new T.Mesh(new T.SphereGeometry(1.72,96,12,0,Math.PI*2,theta,.085),accent);shells.add(o)}
 const lineMat=new T.MeshBasicMaterial({color:0x8397ff,transparent:true,opacity:.2,depthWrite:false});
 const rings=[2.45,2.98].map((r,i)=>{const ring=new T.Mesh(new T.TorusGeometry(r,.006,3,105),lineMat);ring.rotation.set(i?.32:1.15,i?.4:0,i?.12:.4);scene.add(ring);return ring});
 let active=visible,halt=paused,last=0,raf=0,yaw=0,targetYaw=0,pitch=0,targetPitch=0,currentScroll=scroll,smoothScroll=scroll,dragging=false,downX=0,downY=0;
 function resize(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;camera.aspect=r.width/r.height;camera.updateProjectionMatrix();renderer.setSize(Math.round(r.width),Math.round(r.height),false)}
 new ResizeObserver(resize).observe(stage);resize();
 function paint(now){
  raf=0;if(!active||document.hidden)return;
  if(now-last<(mobile?33:19)){if(!halt)raf=requestAnimationFrame(paint);return}
  const dt=Math.min(.06,(now-last||16)/1000);last=now,eff=1-Math.exp(-dt*4.5);
  smoothScroll+=(currentScroll-smoothScroll)*eff;yaw+=(targetYaw-yaw)*eff;pitch+=(targetPitch-pitch)*eff;
  let split=clamp((smoothScroll-.15)/.55),close=clamp((smoothScroll-.78)/.22);split*=1-close*.83;
  shells.children.forEach(child=>{if(child.userData.index==null)return;const i=child.userData.index;child.position.y=(i===0?.31:i===2?-.33:0)*split;child.position.x=(i===1?.18:i===2?-.16:.0)*split});
  orbit.rotation.y=smoothScroll*Math.PI*3.7+yaw+(halt?0:Math.sin(now*.00023)*.06);
  orbit.rotation.x=pitch+Math.sin(smoothScroll*Math.PI*2)*.12;
  orbit.rotation.z=smoothScroll*-.34;
  orbit.position.y=halt?0:Math.sin(now*.00075)*.12;
  const scale=1+.07*Math.sin(smoothScroll*Math.PI);orbit.scale.setScalar(scale);
  rings[0].rotation.y=smoothScroll*Math.PI*2;rings[1].rotation.x=.3+smoothScroll*Math.PI*1.7;
  renderer.render(scene,camera);
  if(!halt || Math.abs(smoothScroll-currentScroll)>.003 || Math.abs(yaw-targetYaw)>.003)raf=requestAnimationFrame(paint);
 }
 function schedule(){if(raf)cancelAnimationFrame(raf);raf=0;last=0;if(active&&!document.hidden)raf=requestAnimationFrame(paint)}
 stage.addEventListener('pointerdown',e=>{if(e.target.closest('button,a'))return;dragging=true;downX=e.clientX;downY=e.clientY;stage.classList.add('is-grabbing');stage.setPointerCapture?.(e.pointerId)});
 stage.addEventListener('pointermove',e=>{if(!dragging)return;const rect=stage.getBoundingClientRect();targetYaw=clamp(targetYaw+(e.clientX-downX)/rect.width*3,-2.3,2.3);targetPitch=clamp(targetPitch+(e.clientY-downY)/rect.height*1.8,-.4,.4);downX=e.clientX;downY=e.clientY;schedule()});
 const release=()=>{dragging=false;stage.classList.remove('is-grabbing')};stage.addEventListener('pointerup',release);stage.addEventListener('pointercancel',release);stage.addEventListener('lostpointercapture',release);
 stage.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home'){targetYaw=0;targetPitch=0}else if(e.key==='ArrowLeft')targetYaw-=.16;else if(e.key==='ArrowRight')targetYaw+=.16;else if(e.key==='ArrowUp')targetPitch-=.11;else targetPitch+=.11;schedule()});
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(raf);raf=0}else schedule()});
 sceneControl={setScroll(v){currentScroll=v;schedule()},setVisible(v){active=v;if(!v){cancelAnimationFrame(raf);raf=0}else schedule()},setPaused(v){halt=v;schedule()}};
 stage.classList.add('webgl-visible');status.textContent='LIVE 3D · DRAG TO TURN';sceneControl.setScroll(scroll);sceneControl.setVisible(visible);
 }catch(error){console.warn('MACHO 3D sculpture fallback',error);status.textContent='STILL BRAND VIEW';pauseBtn.hidden=true}
}
})();