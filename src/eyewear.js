import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// Semantic dimensions in scene units. The object is conceptual, not a manufacturing model.
const CONFIG = {
  lensWidth: 2.18,
  lensHeight: 1.52,
  bridge: 0.48,
  rim: 0.14,
  depth: 0.17,
  templeLength: 2.7,
};
function roundedShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2,
    y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
export function createEyewear({ brand = "RAYG" } = {}) {
  const aquila = brand === "AQUILA";
  const group = new THREE.Group();
  group.name = `${brand} conceptual eyewear`;
  const frameMaterial = new THREE.MeshPhysicalMaterial({
    color: aquila ? 0x211b1e : 0x111821,
    metalness: 0.52,
    roughness: 0.27,
    clearcoat: 0.65,
  });
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: aquila ? 0x33252c : 0xb3dada,
    metalness: 0.05,
    roughness: 0.09,
    transmission: aquila ? 0.12 : 0.8,
    ior: 1.48,
    thickness: 0.12,
    transparent: true,
    opacity: 0.85,
    side: THREE.DoubleSide,
  });
  const ledMaterial = new THREE.MeshPhysicalMaterial({
    color: aquila ? 0xc38b8f : 0x087f8c,
    emissive: aquila ? 0x301c23 : 0x087f8c,
    emissiveIntensity: aquila ? 0.3 : 2,
    roughness: 0.2,
  });
  const metalMaterial = new THREE.MeshPhysicalMaterial({
    color: aquila ? 0xc78f87 : 0x62788d,
    metalness: 0.9,
    roughness: 0.25,
  });
  const opticalMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x71b8bd,
    metalness: 0.1,
    roughness: 0.15,
    transparent: true,
    opacity: 0.16,
    transmission: 0.4,
  });
  const geometries = new Set(),
    materials = new Set([
      frameMaterial,
      glassMaterial,
      ledMaterial,
      metalMaterial,
      opticalMaterial,
    ]);
  function mesh(geo, material, parent = group) {
    geometries.add(geo);
    const m = new THREE.Mesh(geo, material);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function tube(points, radius, material, parent) {
    const path = new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
    );
    return mesh(
      new THREE.TubeGeometry(path, 48, radius, 12, false),
      material,
      parent,
    );
  }
  // Pass 1/2: Two beveled rims, optical assemblies, bridge and hinged temples.
  for (const side of [-1, 1]) {
    const assembly = new THREE.Group();
    assembly.name =
      side < 0 ? "Left lens assembly" : "Right adaptive lens assembly";
    assembly.position.x = (side * (CONFIG.lensWidth + CONFIG.bridge)) / 2;
    group.add(assembly);
    const outer = roundedShape(
      CONFIG.lensWidth + CONFIG.rim * 2,
      CONFIG.lensHeight + CONFIG.rim * 2,
      0.5,
    );
    const hole = roundedShape(CONFIG.lensWidth, CONFIG.lensHeight, 0.4);
    outer.holes.push(new THREE.Path(hole.getPoints().reverse()));
    mesh(
      new THREE.ExtrudeGeometry(outer, {
        depth: CONFIG.depth,
        bevelEnabled: true,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        bevelSegments: 3,
        steps: 1,
        curveSegments: 24,
      }),
      frameMaterial,
      assembly,
    );
    const lens = mesh(
      new THREE.ExtrudeGeometry(
        roundedShape(CONFIG.lensWidth - 0.02, CONFIG.lensHeight - 0.02, 0.39),
        {
          depth: 0.035,
          bevelEnabled: true,
          bevelSize: 0.02,
          bevelThickness: 0.01,
          bevelSegments: 2,
          curveSegments: 24,
        },
      ),
      glassMaterial,
      assembly,
    );
    lens.position.z = 0.04;
    if (side === 1 && !aquila) {
      for (let i = 0; i < 3; i++) {
        const layer = mesh(
          new THREE.ShapeGeometry(
            roundedShape(
              CONFIG.lensWidth - 0.14 - i * 0.12,
              CONFIG.lensHeight - 0.14 - i * 0.12,
              0.35,
            ),
          ),
          opticalMaterial,
          assembly,
        );
        layer.position.z = 0.12 + i * 0.065;
      }
    }
    const x = side * (CONFIG.lensWidth / 2 + 0.12);
    const hinge = mesh(
      new THREE.BoxGeometry(0.22, 0.23, 0.32),
      metalMaterial,
      assembly,
    );
    hinge.position.set(x, 0.43, -0.02);
    tube(
      [
        [x, 0.43, 0],
        [x + side * 0.12, 0.47, -0.6],
        [x + side * 0.18, 0.43, -1.9],
        [x + side * 0.12, 0.18, -CONFIG.templeLength],
        [x + side * 0.04, -0.1, -CONFIG.templeLength - 0.15],
      ],
      0.085,
      frameMaterial,
      assembly,
    ).name = "Temple";
    const led = mesh(
      new THREE.BoxGeometry(0.045, 0.07, 0.34),
      ledMaterial,
      assembly,
    );
    led.position.set(x + side * 0.12, 0.51, -0.38);
    const frontLed = mesh(
      new THREE.BoxGeometry(0.14, 0.055, 0.025),
      ledMaterial,
      assembly,
    );
    frontLed.position.set(x - side * 0.1, 0.56, 0.215);
    tube(
      [
        [-side * 0.94, -0.13, -0.01],
        [-side * 1.01, -0.32, -0.11],
      ],
      0.055,
      frameMaterial,
      assembly,
    );
  }
  tube(
    [
      [-0.31, 0.3, 0.07],
      [0, 0.42, 0.04],
      [0.31, 0.3, 0.07],
    ],
    0.09,
    frameMaterial,
  ).name = "Nose bridge";
  const brow = tube(
    [
      [-2.55, 0.64, 0.015],
      [-1.3, 0.88, 0.025],
      [0, 0.62, 0.02],
      [1.3, 0.88, 0.025],
      [2.55, 0.64, 0.015],
    ],
    0.06,
    frameMaterial,
  );
  brow.name = "Continuous browline";
  return {
    group,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}

export function createEyewearStudio(host, onLost, { immersive = false } = {}) {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  camera.position.set(0, 1.25, 11);
  camera.lookAt(0, 0, -0.3);
  const environment = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(environment, 0.04);
  scene.environment = env.texture;
  environment.dispose();
  pmrem.dispose();
  const asset = createEyewear();
  scene.add(asset.group);
  const key = new THREE.DirectionalLight(0xfff7ed, 3);
  key.position.set(-3, 5, 7);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xb1dcdb, 1);
  fill.position.set(5, 1, 4);
  scene.add(fill);
  const rim = new THREE.SpotLight(0xe7f7f5, 45, 20, Math.PI / 4, 0.6);
  rim.position.set(2, 5, -5);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8eafae, 1.5));
  // Pass 4: Framed studio camera and damped micro-motion. Rendering pauses offscreen.
  const pointer = { x: 0, y: 0 };
  let rotating = false,
    angle = 0,
    visible = true,
    disposed = false,
    raf = 0,
    last = 0;
  let wakeUntil = performance.now() + 3000;
  let lastRender = 0;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.position.z = immersive
      ? Math.max(3.5, 6.4 / camera.aspect) /
        (2 * Math.tan(THREE.MathUtils.degToRad(16)))
      : Math.max(10, 7.2 / camera.aspect);
    if (immersive) camera.lookAt(0, 0, -0.3);
    camera.updateProjectionMatrix();
    render(performance.now());
  }
  function render(now) {
    if (disposed) return;
    const dt = Math.min((now - last) / 1000, 0.05) || 0.016;
    last = now;
    if (rotating && !preference.matches) angle += dt * 0.36;
    const targetY = -0.3 + pointer.x * 0.16 + angle;
    const targetX = 0.18 - pointer.y * 0.1;
    const damping = 1 - Math.exp(-dt * 7);
    asset.group.rotation.y = THREE.MathUtils.lerp(
      asset.group.rotation.y,
      targetY,
      damping,
    );
    asset.group.rotation.x = THREE.MathUtils.lerp(
      asset.group.rotation.x,
      targetX,
      damping,
    );
    asset.group.rotation.z = -0.11;
    asset.group.position.y = preference.matches
      ? 0
      : Math.sin(now * 0.0008) * 0.04;
    renderer.render(scene, camera);
  }
  function loop(now) {
    if (disposed) return;
    if (
      visible &&
      !document.hidden &&
      now - lastRender > 32 &&
      ((rotating && !preference.matches) || now < wakeUntil)
    ) {
      render(now);
      lastRender = now;
    }
    raf = requestAnimationFrame(loop);
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  });
  intersection.observe(host);
  const move = (e) => {
    wakeUntil = performance.now() + 500;
    const rect = host.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    pointer.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };
  const leave = () => {
    wakeUntil = performance.now() + 500;
    pointer.x = 0;
    pointer.y = 0;
  };
  const lost = (e) => {
    e.preventDefault();
    visible = false;
    cancelAnimationFrame(raf);
    canvas.hidden = true;
    onLost();
  };
  host.addEventListener("pointermove", move);
  host.addEventListener("pointerleave", leave);
  canvas.addEventListener("webglcontextlost", lost);
  asset.group.rotation.set(0.18, -0.3, -0.11);
  resize();
  raf = requestAnimationFrame(loop);
  return {
    setRotating(value) {
      rotating = value;
      wakeUntil = performance.now() + 500;
      if (preference.matches) {
        angle = value ? 0.8 : 0;
        render(performance.now());
      }
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      intersection.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("webglcontextlost", lost);
      asset.dispose();
      env.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
