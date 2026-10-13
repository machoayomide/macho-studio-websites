/* Only the hero model is interactive; page content remains unchanged. */
(()=>{
 const stage=document.getElementById('kinetic-media');
 const model=document.getElementById('macho-portrait-scene');
 if(!stage||!model)return;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const fine=window.matchMedia('(pointer: fine)').matches;
 if(reduced||!fine)return;
 let raf=0,px=0,py=0;
 stage.addEventListener('pointermove',e=>{
  const r=stage.getBoundingClientRect();
  px=((e.clientX-r.left)/r.width-.5);
  py=((e.clientY-r.top)/r.height-.5);
  if(!raf)raf=requestAnimationFrame(()=>{model.style.transform=`perspective(1100px) rotateY(${(px*6).toFixed(2)}deg) rotateX(${(-py*4).toFixed(2)}deg) translate3d(${(px*9).toFixed(1)}px,${(py*6).toFixed(1)}px,0)`;raf=0;});
 });
 stage.addEventListener('pointerleave',()=>{if(raf)cancelAnimationFrame(raf);raf=0;model.style.transform='';});
})();
