/**
 * Progressive, procedural 3D shopping bag for the MACHO Shopify hero.
 * No third-party model, embed or collected data. The original, unmodified
 * official Shopify shopping-bag SVG remains the instant/no-WebGL fallback.
 * Rendering is decorative; all real navigation stays in HTML.
 */
(async () => {
  'use strict';
  const stage = document.querySelector('#commerce-3d');
  if (!stage || matchMedia('(prefers-reduced-motion: reduce)').matches ||
      navigator.connection?.saveData) return;

  const support = document.createElement('canvas');
  if (!support.getContext('webgl2') && !support.getContext('webgl')) return;
  let THREE;
  try {
    THREE = await import('https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js');
  } catch (error) {
    // Offline, blocked CDN and unsupported browsers simply keep the SVG.
    return;
  }
  if (!stage.isConnected) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'low-power'});
  } catch (_) {
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.className = 'macho-shopify-3d-canvas';
  renderer.domElement.setAttribute('aria-hidden', 'true');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 30);
  camera.position.set(0, .10, 6.6);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x24360e, 2.4));
  const key = new THREE.DirectionalLight(0xfff3d5, 3.4);
  key.position.set(-3, 5, 6);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc1e0ff, 1.25);
  fill.position.set(4, 1, -3);
  scene.add(fill);

  const bag = new THREE.Group();
  scene.add(bag);
  const silhouette = new THREE.Shape();
  silhouette.moveTo(-.82, -1.23);
  silhouette.lineTo(.82, -1.23);
  silhouette.lineTo(1.04, 1.16);
  silhouette.lineTo(-1.04, 1.16);
  silhouette.closePath();

  // A genuinely volumetric, bevelled shopping bag with shaded side gussets.
  const bodyGeometry = new THREE.ExtrudeGeometry(silhouette, {
    depth: .51, steps: 1, bevelEnabled: true, bevelThickness: .045,
    bevelSize: .055, bevelSegments: 3, curveSegments: 8
  });
  const frontMaterial = new THREE.MeshStandardMaterial({
    color: 0x95bf47, roughness: .77, metalness: .02, side: THREE.DoubleSide
  });
  const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0x5e8e3e, roughness: .83, metalness: .02, side: THREE.DoubleSide
  });
  const body = new THREE.Mesh(bodyGeometry, [frontMaterial, sideMaterial]);
  body.position.z = -.255;
  bag.add(body);

  // Slightly darker folded rim and dimensional handle, not an SVG billboard.
  const rim = new THREE.Mesh(
    new THREE.BoxGeometry(2.06, .083, .54),
    new THREE.MeshStandardMaterial({color: 0x769f37, roughness: .89})
  );
  rim.position.set(0, 1.14, .0);
  bag.add(rim);
  const strapMaterial = new THREE.MeshStandardMaterial({
    color: 0xb4d97c, roughness: .51, metalness: .05
  });
  function makeHandle(z) {
    const arc = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-.69, 1.12, z),
      new THREE.Vector3(-.61, 1.62, z - .06),
      new THREE.Vector3(-.30, 1.97, z - .10),
      new THREE.Vector3(.14, 1.99, z - .10),
      new THREE.Vector3(.55, 1.67, z - .06),
      new THREE.Vector3(.69, 1.12, z)
    ]);
    bag.add(new THREE.Mesh(new THREE.TubeGeometry(arc, 50, .058, 10, false), strapMaterial));
  }
  makeHandle(-.13);
  makeHandle(.18);

  // Reuse the official white S silhouette, extracted without modifying the
  // original SVG asset; the canonical logo remains visible in fallback.
  const decalCanvas = document.createElement('canvas');
  decalCanvas.width = 512;
  decalCanvas.height = 512;
  const ctx = decalCanvas.getContext('2d');
  if (ctx && typeof Path2D !== 'undefined') {
    const shopifyS = new Path2D('M47.152 32.662l-3.099 11.594s-3.456-1.573-7.554-1.315c-6.01.38-6.073 4.17-6.012 5.121.327 5.186 13.969 6.318 14.734 18.463.602 9.555-5.068 16.092-13.239 16.608-9.807.618-15.206-5.166-15.206-5.166l2.078-8.84s5.435 4.101 9.785 3.827c2.841-.18 3.856-2.492 3.754-4.126-.428-6.764-11.536-6.364-12.238-17.478-.59-9.352 5.552-18.83 19.104-19.684 5.221-.336 7.893.996 7.893.996z');
    ctx.fillStyle = 'white';
    ctx.translate(256, 260);
    ctx.scale(8.9, 8.9);
    ctx.translate(-32, -57);
    ctx.fill(shopifyS);
    const decalTexture = new THREE.CanvasTexture(decalCanvas);
    decalTexture.colorSpace = THREE.SRGBColorSpace;
    const decal = new THREE.Mesh(
      new THREE.PlaneGeometry(.94, 1.53),
      new THREE.MeshBasicMaterial({
        map: decalTexture, transparent: true, depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    decal.position.set(-.035, -.08, .315);
    bag.add(decal);
  }

  stage.appendChild(renderer.domElement);
  let visible = true, disposed = false, frameId = 0;
  let targetX = -.15, targetY = -.24, pointerX = 0, pointerY = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const renderOnce = () => renderer.render(scene, camera);
  const resize = () => {
    if (disposed) return;
    const rect = stage.getBoundingClientRect();
    const width = Math.max(1, Math.floor(rect.width));
    const height = Math.max(1, Math.floor(rect.height));
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 540 ? 8.0 : 6.6;
    camera.updateProjectionMatrix();
    renderOnce();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(stage);
  resize();

  function tick(time) {
    frameId = 0;
    if (disposed || !visible || document.hidden || reduce.matches ||
        stage.classList.contains('is-paused')) return;
    const chapter = document.querySelector('.kinetic-panel.is-current')?.dataset.chapter || '0';
    const chapterTilt = [-.24, .23, -.26, .16][Number(chapter)] ?? 0;
    targetY = chapterTilt + pointerX * .23;
    targetX = -.10 - pointerY * .09;
    bag.rotation.y += (targetY - bag.rotation.y) * .052;
    bag.rotation.x += (targetX - bag.rotation.x) * .052;
    bag.rotation.z = Math.sin(time * .00031) * .018;
    bag.position.y = -.17 + Math.sin(time * .0012) * .045;
    renderOnce();
    frameId = requestAnimationFrame(tick);
  }
  const resume = () => {
    if (!frameId && !disposed && visible && !document.hidden &&
        !reduce.matches && !stage.classList.contains('is-paused')) {
      frameId = requestAnimationFrame(tick);
    }
  };
  const onPointer = e => {
    const rect = stage.getBoundingClientRect();
    pointerX = Math.max(-1, Math.min(1, 2 * (e.clientX - rect.left) / Math.max(1, rect.width) - 1));
    pointerY = Math.max(-1, Math.min(1, 2 * (e.clientY - rect.top) / Math.max(1, rect.height) - 1));
  };
  const resetPointer = () => { pointerX = 0; pointerY = 0; };
  stage.addEventListener('pointermove', onPointer, {passive: true});
  stage.addEventListener('pointerleave', resetPointer, {passive: true});
  stage.querySelector('#kinetic-pause')?.addEventListener('click', () => {
    // The existing controller changes its paused state in the same click.
    queueMicrotask(() => {
      if (stage.classList.contains('is-paused')) cancelAnimationFrame(frameId);
      else resume();
    });
  });
  const visibility = new IntersectionObserver(entries => {
    visible = entries[0]?.isIntersecting ?? false;
    if (visible) resume();
    else { cancelAnimationFrame(frameId); frameId = 0; }
  }, {threshold: .01});
  visibility.observe(stage);
  document.addEventListener('visibilitychange', resume);
  reduce.addEventListener('change', resume);

  // Only replace the SVG after WebGL successfully renders a real frame.
  renderOnce();
  stage.classList.add('macho-3d-ready');
  stage.setAttribute('aria-label', 'Interactive three-dimensional Shopify shopping bag. Scroll to explore four chapters.');
  const fallbackLink = stage.querySelector('.official-shopify-bag');
  if (fallbackLink) {
    fallbackLink.tabIndex = -1;
    fallbackLink.setAttribute('aria-hidden', 'true');
  }
  resume();

  window.addEventListener('pagehide', () => {
    disposed = true;
    cancelAnimationFrame(frameId);
    visibility.disconnect();
    observer.disconnect();
    bodyGeometry.dispose();
    renderer.dispose();
  }, {once: true});
})();