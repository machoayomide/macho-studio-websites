/* MACHO / STUDIO — lightweight, genuinely three-dimensional commerce installation.
 * Loads Three.js only when the hero approaches the viewport. No GLB or image textures.
 * The HTML/CSS storefront stays available if WebGL, the CDN or the network fails.
 */
(()=>{'use strict';
const stage=document.querySelector('.page-home .commerce-universe');
if(!stage)return;
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
const connection=navigator.connection||navigator.mozConnection||navigator.webkitConnection;
const saveData=!!connection?.saveData;
const constrained=(navigator.deviceMemory&&navigator.deviceMemory<=2);
const mobile=matchMedia('(max-width: 760px)').matches;
const legend=stage.querySelector('.model-legend');
stage.setAttribute('aria-label','Interactive 3D commerce storefront. Drag or use arrow keys to rotate. Explore layers to separate storefront, checkout and inventory.');
stage.setAttribute('tabindex','0');
stage.dataset.expanded='false';
const panel=document.createElement('div');panel.className='webgl-controls';panel.setAttribute('aria-label','3D scene controls');
const explore=document.createElement('button');explore.type='button';explore.className='webgl-btn';explore.textContent='EXPLORE STORE LAYERS ↗';explore.setAttribute('aria-pressed','false');
const pause=document.createElement('button');pause.type='button';pause.className='webgl-btn webgl-pause';pause.textContent='PAUSE MOTION';pause.setAttribute('aria-pressed','false');
const status=document.createElement('span');status.className='webgl-status';status.setAttribute('aria-live','polite');status.textContent='3D storefront concept';
panel.append(explore,pause);stage.append(panel,status);
let expanded=false,paused=false,model=null,started=false,visible=false,failed=false;
const updateExpanded=()=>{explore.setAttribute('aria-pressed',String(expanded));explore.textContent=expanded?'CLOSE STORE LAYERS ↖':'EXPLORE STORE LAYERS ↗';stage.dataset.expanded=String(expanded);model?.setExpanded(expanded);status.textContent=expanded?'Storefront, checkout and stock layers separated':'3D storefront concept'};
explore.addEventListener('click',()=>{expanded=!expanded;updateExpanded()});
pause.addEventListener('click',()=>{paused=!paused;pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'RESUME MOTION':'PAUSE MOTION';model?.setPaused(paused)});
const staticStatus=(message)=>{status.textContent=message;stage.classList.add('webgl-fallback');pause.hidden=true};
if(reduced.matches){staticStatus('Still storefront illustration · reduced motion enabled');return}
if(saveData||constrained){const load=document.createElement('button');load.type='button';load.className='webgl-btn webgl-load';load.textContent='LOAD INTERACTIVE 3D ↗';panel.prepend(load);staticStatus('Lightweight preview · 3D available on request');load.addEventListener('click',()=>{load.remove();stage.classList.remove('webgl-fallback');begin()});return}
const observe=new IntersectionObserver(entries=>{for(const entry of entries){if(entry.target!==stage)continue;visible=entry.isIntersecting;model?.setVisible(visible);if(visible&&!started&&!failed)begin()}},{rootMargin:'250px 0px 200px 0px',threshold:0.01});
observe.observe(stage);
function begin(){
 if(started||failed)return;started=true;
 status.textContent='Preparing 3D storefront…';
 import('https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.module.js')
 .then(THREE=>{try{model=build(THREE);model.setExpanded(expanded);model.setPaused(paused);model.setVisible(visible);stage.classList.add('webgl-ready');stage.classList.remove('webgl-fallback');status.textContent='WebGL 3D • drag or use arrow keys';if(legend)legend.textContent='REAL-TIME 3D CONCEPT · DRAG TO EXPLORE';}catch(e){failed=true;staticStatus('Storefront illustration · WebGL unavailable')}})
 .catch(()=>{failed=true;staticStatus('Storefront illustration · offline 3D fallback')});
}
function build(T){
 const scene=new T.Scene();
 const camera=new T.PerspectiveCamera(mobile?43:39,1,.1,80);
 camera.position.set(mobile?7.1:7.1,5.25,mobile?11.8:12.1);camera.lookAt(0,.12,0);
 const renderer=new T.WebGLRenderer({alpha:true,antialias:!mobile,powerPreference:'low-power',depth:true});
 renderer.setClearColor(0x000000,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.25;
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,mobile?1.25:1.5));
 renderer.shadowMap.enabled=false;
 renderer.domElement.className='webgl-canvas';renderer.domElement.setAttribute('aria-hidden','true');
 stage.prepend(renderer.domElement);
 const mat=(c,roughness=.62,metalness=.03)=>new T.MeshStandardMaterial({color:c,roughness,metalness});
 const cream=mat(0xf5f0dc),ivory=mat(0xe5e7d9),dark=mat(0x183e31),forest=mat(0x1d6c4e),mint=mat(0x82e2b1,.39,.13),bronze=mat(0xd9a66e,.42,.35),black=mat(0x0d271e),glass=new T.MeshPhysicalMaterial({color:0xc8f7e1,transparent:true,opacity:.22,roughness:.16,metalness:.08,depthWrite:false});
 const geometry={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(.5,.5,1,16),sphere:new T.SphereGeometry(1,12,8),plane:new T.PlaneGeometry(1,1)};
 const store=new T.Group();scene.add(store);
 const root=new T.Group();store.add(root);
 const front=new T.Group(),middle=new T.Group(),back=new T.Group(),products=[];
 root.add(front,middle,back);
 function cube(parent,w,h,d,x,y,z,m){const o=new T.Mesh(geometry.box,m);o.position.set(x,y,z);o.scale.set(w,h,d);parent.add(o);return o}
 function tube(parent,r,h,x,y,z,m){const o=new T.Mesh(geometry.cylinder,m);o.position.set(x,y,z);o.scale.set(r*2,h,r*2);parent.add(o);return o}
 function ball(parent,r,x,y,z,m){const o=new T.Mesh(geometry.sphere,m);o.position.set(x,y,z);o.scale.setScalar(r);parent.add(o);return o}
 function stripe(parent,x,y,z,length,color){const g=new T.BoxGeometry(length,.04,.07);const m=new T.Mesh(g,new T.MeshBasicMaterial({color}));m.position.set(x,y,z);parent.add(m);return m}
 function typePanel(parent,label,width,height,x,y,z,fg='#123a29',bg='#eff9ea'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;
  const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,512,160);
  ctx.fillStyle=fg;ctx.font='900 57px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,256,84,470);
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;tex.anisotropy=1;
  const plane=new T.Mesh(geometry.plane,new T.MeshBasicMaterial({map:tex,side:T.DoubleSide,transparent:false}));
  plane.position.set(x,y,z);plane.scale.set(width,height,1);parent.add(plane);return plane;
 }
 const ringGroup=new T.Group();root.add(ringGroup);
 // Premium modular shop structure, deliberately open at the front.
 cube(root,5.7,.17,3.75,0,-1.74,0,forest);
 cube(root,5.55,.08,3.6,0,-1.61,0,cream);
 cube(root,5.82,.18,3.95,0,1.89,0,dark);
 cube(root,5.56,.06,3.68,0,2.01,0,mint);
 for(const x of [-2.72,2.72]){cube(root,.17,3.55,.15,x,.13,1.69,mint);cube(root,.16,3.53,.16,x,.12,-1.69,forest)}
 cube(root,5.48,3.45,.11,0,.09,-1.8,cream);
 cube(root,.13,3.45,3.56,-2.68,.09,0,ivory);
 cube(root,.13,3.45,3.56,2.68,.09,0,ivory);
 cube(root,5.75,.28,.95,0,1.66,2.1,dark);
 for(let i=0;i<9;i++)cube(root,.57,.055,.96,-2.56+i*.64,1.47,2.15,i%2?cream:mint);
 typePanel(root,'THE EDIT. / CONCEPT',4.4,.48,0,2.22,1.05,'#f4ffe9','#173b2a');
 // Layer 1: light front display, glass and counter
 cube(front,3.2,.22,.86,-.6,-1.04,1.04,forest);
 cube(front,3.1,.08,.88,-.6,-.89,1.04,cream);
 cube(front,1.19,1.5,.08,1.76,-.55,1.73,glass);
 cube(front,.06,1.5,.07,1.12,-.55,1.78,mint);
 cube(front,1.24,.07,.07,1.76,.20,1.78,mint);
 const dress=cube(front,.62,.81,.4,-1.81,-.39,1.09,bronze);dress.rotation.y=.22;
 typePanel(front,'STOREFRONT',1.5,.3,-1.45,.61,1.55,'#0d3425','#a4ebbf');
 // Layer 2: checkout terminal, cart and shelving, floating UI cards
 cube(middle,2.2,.14,1.25,.58,-.82,.17,bronze);
 cube(middle,.2,1.45,.2,.12,-.12,.05,forest);
 const terminal=cube(middle,1.14,.83,.07,.12,.73,.22,black);terminal.rotation.x=-.13;
 typePanel(middle,'CHECKOUT',.98,.33,.12,.78,.28,'#b8f4cb','#194634');
 cube(middle,.8,.10,.8,1.22,-.57,.26,mint);
 for(let i=0;i<3;i++){const o=cube(middle,.4,.28,.32,-.85+i*.46,-.41,-.28,i%2?dark:ivory);o.rotation.y=.12}
 typePanel(middle,'PAYMENT + APPS',1.5,.31,1.04,1.26,.3,'#efffec','#14533a');
 // Layer 3: inventory wall, stock boxes and moving connectors.
 cube(back,4.66,.10,.64,0,-.60,-1.36,forest);
 cube(back,4.66,.10,.64,0,.64,-1.36,forest);
 for(let i=0;i<6;i++){
  const x=-1.93+i*.77;cube(back,.48,.54,.40,x,-.24,-1.35,i%2?bronze:ivory);
  cube(back,.45,.44,.34,x,1.01,-1.36,i%2?forest:bronze);
 }
 for(let i=0;i<5;i++){cube(back,.055,2.3,.06,-2.22+i*1.11,.15,-1.03,mint)}
 typePanel(back,'STOCK + ORDERS',2.22,.34,0,1.56,-1.65,'#d6ffe3','#164931');
 // Distinct generic floating products, absolutely no real brand/client packaging.
 const bottle=new T.Group();front.add(bottle);
 tube(bottle,.32,1.08,-.81,-.20,.92,forest);tube(bottle,.17,.22,-.81,.44,.92,mint);
 typePanel(bottle,'EDIT.',.52,.26,-.81,-.18,1.28,'#f7f9ec','#24684b');products.push([bottle,0,.035]);
 const candle=new T.Group();front.add(candle);
 tube(candle,.24,.43,.45,-.41,1.12,bronze);tube(candle,.24,.08,.45,-.14,1.12,cream);products.push([candle,1.6,.022]);
 const parcel=new T.Group();middle.add(parcel);
 cube(parcel,.55,.53,.54,1.1,-.18,-.64,bronze);stripe(parcel,1.1,-.07,-.36,.27,0xf9e8be);products.push([parcel,2.8,.035]);
 // A tiny cart, made from cylinders + a basket.
 const cart=new T.Group();front.add(cart);cube(cart,.63,.29,.44,1.5,-1.12,.95,mint);
 for(const x of [1.27,1.72]){const wheel=new T.Mesh(new T.TorusGeometry(.105,.04,5,12),black);wheel.position.set(x,-1.32,1.21);front.add(wheel)}
 // Fine guide rings reinforce depth without expensive animated particles.
 const ringMaterial=new T.MeshBasicMaterial({color:0x5ed5a5,transparent:true,opacity:.14,depthWrite:false});
 for(const rad of [3.55,4.14]){const r=new T.Mesh(new T.TorusGeometry(rad,.006,3,85),ringMaterial);r.rotation.x=1.17;r.position.y=.13;scene.add(r)}
 scene.add(new T.AmbientLight(0xedfff0,1.8));
 const key=new T.DirectionalLight(0xf2ffde,3.15);key.position.set(-3,7,8);scene.add(key);
 const rim=new T.PointLight(0x80ffc2,40,17,2);rim.position.set(4,2.7,-4);scene.add(rim);
 const warm=new T.PointLight(0xffd79a,24,12,2);warm.position.set(-3,0,5);scene.add(warm);
 let active=false,show=false,halt=false,disposed=false,raf=0,last=0,prev=0,startTime=performance.now();
 let yaw=0,pitch=0,yawTarget=0,pitchTarget=0,explode=0,explodeTarget=0,mouseDown=false,downX=0,downY=0;
 const maxFps=mobile?25:38;const minFrame=1000/maxFps;
 function limit(n,low,high){return Math.min(high,Math.max(low,n))}
 function size(){if(disposed)return;const b=stage.getBoundingClientRect();if(b.width<1||b.height<1)return;camera.aspect=b.width/b.height;camera.fov=b.width<420?47:(mobile?43:39);camera.updateProjectionMatrix();renderer.setSize(Math.round(b.width),Math.round(b.height),false)}
 const resizeObserver=new ResizeObserver(size);resizeObserver.observe(stage);size();
 function draw(now){
  if(disposed)return;
  raf=0;if(!show||document.hidden)return;
  if(now-last<minFrame){raf=requestAnimationFrame(draw);return}
  let dt=Math.min(.06,(now-prev||16)/1000);prev=now;last=now;
  const ease=1-Math.exp(-dt*5);
  yaw+=(yawTarget-yaw)*ease;pitch+=(pitchTarget-pitch)*ease;
  const b=stage.getBoundingClientRect();const scrollProgress=limit((-b.top/b.height-.05)*1.35,0,.96);
  explodeTarget=expanded?1:scrollProgress;
  explode+=(explodeTarget-explode)*(1-Math.exp(-dt*3.6));
  front.position.set(-1.55*explode,.10*explode,1.6*explode);
  middle.position.set(.25*explode,.18*explode,.35*explode);
  back.position.set(1.65*explode,-.10*explode,-1.45*explode);
  const time=(now-startTime)/1000;
  root.rotation.y=-.09+yaw+(halt?0:Math.sin(time*.32)*.035);
  root.rotation.x=pitch;
  store.position.y=halt?0:Math.sin(time*.73)*.055;
  products.forEach(([group,phase,amp])=>{group.position.y=halt?0:Math.sin(time*1.2+phase)*amp});
  renderer.render(scene,camera);
  if(show&&!halt)raf=requestAnimationFrame(draw);
 }
 function schedule(){if(disposed)return;if(raf)cancelAnimationFrame(raf);raf=0;prev=0;if(show&&!document.hidden)raf=requestAnimationFrame(draw)}
 function dragStart(e){if(e.target.closest('button,a'))return;mouseDown=true;downX=e.clientX;downY=e.clientY;stage.setPointerCapture?.(e.pointerId);stage.classList.add('is-grabbing')}
 function dragMove(e){if(!mouseDown)return;const rect=stage.getBoundingClientRect();yawTarget=limit(yawTarget+(e.clientX-downX)/Math.max(280,rect.width)*1.4,-.65,.65);pitchTarget=limit(pitchTarget+(e.clientY-downY)/Math.max(250,rect.height)*.8,-.22,.22);downX=e.clientX;downY=e.clientY;if(halt){yaw=yawTarget;pitch=pitchTarget;root.rotation.y=-.09+yaw;root.rotation.x=pitch;renderer.render(scene,camera)}}
 function dragEnd(){mouseDown=false;stage.classList.remove('is-grabbing')}
 function keyboard(e){const delta={ArrowLeft:[-.13,0],ArrowRight:[.13,0],ArrowUp:[0,-.10],ArrowDown:[0,.10]};if(delta[e.key]){e.preventDefault();yawTarget=limit(yawTarget+delta[e.key][0],-.65,.65);pitchTarget=limit(pitchTarget+delta[e.key][1],-.22,.22);schedule()}else if(e.key==='Home'){e.preventDefault();yawTarget=0;pitchTarget=0;schedule()}}
 stage.addEventListener('pointerdown',dragStart);stage.addEventListener('pointermove',dragMove);stage.addEventListener('pointerup',dragEnd);stage.addEventListener('pointercancel',dragEnd);stage.addEventListener('lostpointercapture',dragEnd);stage.addEventListener('keydown',keyboard);
 function scrollHandler(){if(show&&!halt&&!raf)raf=requestAnimationFrame(draw)}
 window.addEventListener('scroll',scrollHandler,{passive:true});
 document.addEventListener('visibilitychange',schedule);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();disposed=true;show=false;if(raf)cancelAnimationFrame(raf);stage.classList.remove('webgl-ready');staticStatus('Still storefront illustration · graphics context lost')});
 return{
  setVisible(v){show=!!v;schedule()},
  setPaused(v){halt=!!v;schedule();if(halt&&show)renderer.render(scene,camera)},
  setExpanded(v){expanded=!!v;schedule()}
 };
}
})();