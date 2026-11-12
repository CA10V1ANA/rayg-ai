import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createEyewear } from "./eyewear.js";

export function createHeroEyewearStudio(host, onLost) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-4, 4, 3, -3, 0.1, 60);
  camera.position.set(0, 1.6, 12);
  camera.lookAt(0, 0, 0);
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  const model = createEyewear({ brand: "AQUILA" });
  // Rotate around the whole product, rather than around its front lenses.
  const center = new THREE.Box3()
    .setFromObject(model.group)
    .getCenter(new THREE.Vector3());
  model.group.position.sub(center);
  const turntable = new THREE.Group();
  turntable.add(model.group);
  turntable.rotation.set(0.12, -0.4, -0.04);
  scene.add(turntable);
  const key = new THREE.DirectionalLight(0xffe6d8, 2.6);
  key.position.set(-4, 5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xe7e5ec, 1.1);
  fill.position.set(5, 2, 3);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xe6a8a8, 2.4);
  rim.position.set(1, 4, -5);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x33252c, 0.8));
  let paused = false,
    visible = true,
    disposed = false,
    dirty = true;
  let frame = 0,
    previous = 0,
    lastRender = 0;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const turnSeconds =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--hero-orbit-duration",
      ),
    ) || 20;
  function render() {
    host.dataset.angle = turntable.rotation.y.toFixed(4);
    host.dataset.paused = String(paused || preference.matches);
    renderer.render(scene, camera);
    dirty = false;
  }
  function loop(now) {
    if (disposed) return;
    const delta = Math.min((now - previous) / 1000 || 0, 0.1);
    previous = now;
    if (visible && !document.hidden) {
      if (!paused && !preference.matches) {
        turntable.rotation.y += (delta * Math.PI * 2) / turnSeconds;
        dirty = true;
      }
      if (dirty && now - lastRender >= 32) {
        render();
        lastRender = now;
      }
    }
    frame = requestAnimationFrame(loop);
  }
  function resize() {
    const { clientWidth: width, clientHeight: height } = host;
    if (!width || !height) return;
    const aspect = width / height;
    const span = Math.max(3.8, 6.9 / aspect);
    camera.left = (-span * aspect) / 2;
    camera.right = (span * aspect) / 2;
    camera.top = span / 2;
    camera.bottom = -span / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    render();
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    dirty = true;
  });
  intersection.observe(host);
  const changed = () => {
    dirty = true;
    render();
  };
  preference.addEventListener("change", changed);
  const lost = (event) => {
    event.preventDefault();
    cancelAnimationFrame(frame);
    canvas.hidden = true;
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);
  resize();
  frame = requestAnimationFrame(loop);
  return {
    setPaused(value) {
      paused = value;
      dirty = true;
      render();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      preference.removeEventListener("change", changed);
      canvas.removeEventListener("webglcontextlost", lost);
      model.dispose();
      env.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
