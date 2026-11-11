import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { createEyewear } from "./eyewear.js";
import { casePose, caseViewProgress } from "./case-kinematics.js";

const SIZE = { width: 7, depth: 4.6, wall: 0.16, height: 1.25, lid: 0.24 };
const FINISH = {
  essencial: {
    shell: 0xe9ece9,
    lining: 0xd8dcd6,
    metalness: 0,
    roughness: 0.65,
    ink: "#13292c",
  },
  pro: {
    shell: 0x182024,
    lining: 0x252d31,
    metalness: 0.18,
    roughness: 0.36,
    ink: "#f0f5f3",
  },
  ultra: {
    shell: 0x525c61,
    lining: 0x161e23,
    metalness: 0.78,
    roughness: 0.28,
    ink: "#f0f5f3",
  },
};

function rounded(w, d, r = 0.2) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -d / 2);
  s.lineTo(w / 2 - r, -d / 2);
  s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r);
  s.lineTo(w / 2, d / 2 - r);
  s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2);
  s.lineTo(-w / 2 + r, d / 2);
  s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r);
  s.lineTo(-w / 2, -d / 2 + r);
  s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2);
  return s;
}

/** Each variant has its own lid construction and reversible choreography. */
function createKit(variant, brand = "RAYG") {
  const aquila = brand === "AQUILA";
  const config = {
    ...(FINISH[variant] ?? FINISH.pro),
    ...(aquila
      ? {
          shell:
            variant === "essencial"
              ? 0xe9ded6
              : variant === "pro"
                ? 0x292225
                : 0x9d7178,
          lining: 0x3b3035,
          ink: variant === "essencial" ? "#292225" : "#f1ebe5",
        }
      : {}),
  };
  const group = new THREE.Group();
  group.name = `${brand} ${variant} presentation kit`;
  const geometries = new Set(),
    materials = new Set(),
    textures = new Set();
  function material(options) {
    const m = new THREE.MeshPhysicalMaterial({
      envMapIntensity: 0.5,
      ...options,
    });
    materials.add(m);
    return m;
  }
  const shell = material({
    color: config.shell,
    metalness: config.metalness,
    roughness: config.roughness,
    clearcoat: variant === "ultra" ? 0.4 : 0.12,
  });
  const lining = material({ color: config.lining, roughness: 0.98 });
  const teal = material({
    color: aquila ? 0xe6a8a8 : 0x087f8c,
    metalness: 0.18,
    roughness: 0.4,
  });
  const black = material({ color: 0x161d20, roughness: 0.65 });
  const cloth = material({
    color: variant === "essencial" ? 0xc1cecc : 0x8b999b,
    roughness: 1,
  });
  const metal = material({ color: 0xa6b4b5, metalness: 0.88, roughness: 0.27 });
  function mesh(geometry, mat, parent = group) {
    geometries.add(geometry);
    const m = new THREE.Mesh(geometry, mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function box(w, h, d, x, y, z, mat, parent = group) {
    const m = mesh(new THREE.BoxGeometry(w, h, d), mat, parent);
    m.position.set(x, y, z);
    return m;
  }
  function roundedSolid(w, d, h, mat, parent = group) {
    const g = new THREE.ExtrudeGeometry(rounded(w, d), {
      depth: h,
      bevelEnabled: true,
      bevelSize: 0.045,
      bevelThickness: 0.035,
      bevelSegments: 3,
      curveSegments: 12,
    });
    g.rotateX(-Math.PI / 2);
    return mesh(g, mat, parent);
  }
  function logo(ink, width = 2.25, parent = group) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 180;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = ink;
    if (aquila) {
      ctx.font = "88px Georgia, serif";
      ctx.fillText("QUILA", 148, 122);
    } else {
      ctx.font = 'italic 700 104px "Space Grotesk", Arial';
      ctx.fillText("RAYG", 12, 125);
      ctx.fillStyle = "#087f8c";
      ctx.beginPath();
      ctx.moveTo(397, 38);
      ctx.lineTo(571, 38);
      ctx.lineTo(549, 138);
      ctx.lineTo(375, 138);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.font = "italic 700 82px Inter, Arial";
      ctx.fillText("AI", 408, 117);
    }
    const texture = new THREE.CanvasTexture(canvas);
    if (aquila) {
      const symbol = new Image();
      symbol.onload = () => {
        ctx.drawImage(symbol, 12, 24, 130, 130);
        texture.needsUpdate = true;
      };
      symbol.src = "/assets/aquila/brandmark.svg";
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    textures.add(texture);
    const mat = material({
      map: texture,
      transparent: true,
      roughness: 0.6,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const mark = mesh(
      new THREE.PlaneGeometry(width, (width * 180) / 640),
      mat,
      parent,
    );
    mark.castShadow = false;
    return mark;
  }
  const h = SIZE.height,
    half = SIZE.depth / 2;
  box(SIZE.width, 0.18, SIZE.depth, 0, -h / 2, 0, shell);
  box(0.16, h, SIZE.depth, -SIZE.width / 2, h * 0.0, 0, shell);
  box(0.16, h, SIZE.depth, SIZE.width / 2, 0, 0, shell);
  box(SIZE.width, 0.0 + h, 0.16, 0, 0, -half, shell);
  box(
    SIZE.width,
    variant === "ultra" ? 0.48 : h,
    0.16,
    0,
    variant === "ultra" ? 0.38 : 0,
    half,
    shell,
  );
  box(SIZE.width - 0.28, 0.16, SIZE.depth - 0.28, 0, 0.15, 0, lining);
  // Raised inserts and small dividers give the contents a fitted presentation.
  for (const x of [-3.2, 3.2]) box(0.06, 0.08, 4.15, x, 0.28, 0, teal);
  box(6.4, 0.08, 0.06, 0, 0.28, -2.05, teal);
  box(6.4, 0.08, 0.06, 0, 0.28, 2.05, teal);
  box(6.35, 0.12, 0.12, 0, 0.28, 0.36, lining);
  const glasses = createEyewear();
  glasses.group.name = "Folded eyewear in tray";
  glasses.group.scale.setScalar(0.83);
  glasses.group.rotation.x = -Math.PI / 2;
  glasses.group.position.set(0, 0.36, -0.83);
  glasses.group.traverse((obj) => {
    if (obj.name === "Temple") obj.visible = false;
  });
  group.add(glasses.group);
  // The front model uses a folded pose, with the temple pieces tucked under its rims.
  box(4.1, 0.06, 0.09, 0, 0.32, -0.8, black);
  box(4.0, 0.06, 0.09, 0, 0.3, -1.0, black);
  const accessories = new THREE.Group();
  accessories.name = "Case and microfiber";
  accessories.position.y = -0.43;
  group.add(accessories);
  const pocket = roundedSolid(3.55, 1.24, 0.34, black, accessories);
  pocket.position.set(-0.9, 0.58, 1.19);
  if (variant === "essencial") {
    const seam = mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(
          [
            new THREE.Vector3(-2.5, 0.82, 0.65),
            new THREE.Vector3(-2.65, 0.82, 1.1),
            new THREE.Vector3(-2.5, 0.82, 1.7),
            new THREE.Vector3(0.7, 0.82, 1.7),
            new THREE.Vector3(0.88, 0.82, 1.1),
            new THREE.Vector3(0.7, 0.82, 0.65),
          ],
          false,
        ),
        40,
        0.018,
        8,
        false,
      ),
      teal,
      accessories,
    );
    seam.name = "Zipper seam";
    box(0.13, 0.04, 0.2, -2.6, 0.87, 1.45, teal, accessories);
  } else {
    const flap = new THREE.Shape();
    flap.moveTo(-1.7, -0.54);
    flap.lineTo(1.7, -0.54);
    flap.lineTo(0.18, 0.5);
    flap.quadraticCurveTo(0, 0.62, -0.18, 0.5);
    flap.closePath();
    const flapGeo = new THREE.ExtrudeGeometry(flap, {
      depth: 0.025,
      bevelEnabled: false,
    });
    flapGeo.rotateX(-Math.PI / 2);
    const f = mesh(flapGeo, black, accessories);
    f.position.set(-0.9, 0.95, 1.2);
    box(0.38, 0.04, 0.08, -0.9, 1.0, 1.72, metal, accessories);
    if (variant === "pro")
      box(3.05, 0.018, 0.025, -0.9, 0.98, 0.72, teal, accessories);
  }
  const caseLogo = logo("#dfeae7", 0.95, accessories);
  caseLogo.rotation.x = -Math.PI / 2;
  caseLogo.position.set(-0.9, 0.99, 1.08);
  const fabric = roundedSolid(1.2, 1.26, 0.045, cloth, accessories);
  fabric.position.set(2.13, 0.6, 1.18);
  const clothLogo = logo("#173339", 0.72, accessories);
  clothLogo.rotation.x = -Math.PI / 2;
  clothLogo.position.set(2.13, 0.71, 1.15);
  const drawer = new THREE.Group();
  drawer.name = "Ultra sliding accessory drawer";
  group.add(drawer);
  if (variant === "ultra") {
    box(6.6, 0.12, 2.35, 0, -0.47, 1.08, lining, drawer);
    box(6.85, 0.62, 0.16, 0, -0.25, 2.26, shell, drawer);
    box(0.8, 0.09, 0.12, 0, -0.18, 2.38, metal, drawer);
    accessories.position.y = -0.9;
    drawer.add(accessories);
  }
  const hinge = new THREE.Group();
  hinge.name = "Lid hinge";
  hinge.position.set(0, h / 2, -half);
  group.add(hinge);
  const lidShell = roundedSolid(7.13, 4.73, SIZE.lid, shell, hinge);
  lidShell.position.set(0, 0.05, half);
  box(6.7, 0.07, 4.3, 0, 0.015, half, lining, hinge);
  const innerLogo = logo(config.ink, 2.5, hinge);
  innerLogo.rotation.x = Math.PI / 2;
  innerLogo.position.set(0, -0.028, half + 0.16);
  const outerLogo = logo(config.ink, 2.5, hinge);
  outerLogo.rotation.x = -Math.PI / 2;
  outerLogo.position.set(0, 0.34, half);
  if (variant === "essencial") {
    // A shallow removable cap surrounds the paperboard box, without hinges.
    for (const x of [-3.51, 3.51])
      box(0.12, 0.32, 4.65, x, -0.09, half, shell, hinge);
    for (const z of [0.015, 4.59])
      box(7.05, 0.32, 0.12, 0, -0.09, z, shell, hinge);
  }
  // Only the hinged constructions have visible hinge hardware.
  for (const x of variant === "essencial" ? [] : [-2.3, 2.3]) {
    const m = mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.7, 16), metal);
    m.rotation.z = Math.PI / 2;
    m.position.set(x, 0.65, -half);
  }
  box(6.95, 0.035, 0.035, 0, 0.64, 2.25, teal);
  return {
    group,
    pose(amount) {
      const pose = casePose(variant, amount);
      hinge.rotation.x =
        THREE.MathUtils.degToRad(pose.lidAngle) *
        (variant === "essencial" ? 1 : -1);
      hinge.position.y = h / 2 + pose.lidLift;
      hinge.position.z = -half - pose.lidSlide;
      drawer.position.z = pose.drawerOffset;
      return pose;
    },
    dispose() {
      glasses.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
    },
  };
}

export function createCaseStudio(host, variant, onLost, brand = "RAYG") {
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  host.appendChild(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-6, 6, 4, -4, 0.1, 60);
  camera.position.set(7.8, 7.8, 11.7);
  camera.lookAt(0, 1, 0);
  const cameraRadius = Math.hypot(7.8, 11.7);
  const initialYaw = Math.atan2(7.8, 11.7);
  function orientCamera(amount) {
    const progress = caseViewProgress(amount),
      yaw = initialYaw * (1 - progress);
    camera.position.set(
      cameraRadius * Math.sin(yaw),
      7.8 - progress * 1.3,
      cameraRadius * Math.cos(yaw),
    );
    camera.lookAt(0, 1, 0);
    camera.updateMatrixWorld();
  }
  const room = new RoomEnvironment(),
    pmrem = new THREE.PMREMGenerator(renderer),
    env = pmrem.fromScene(room, 0.04);
  scene.environment = env.texture;
  room.dispose();
  pmrem.dispose();
  const key = new THREE.DirectionalLight(0xfffaf1, 2.0);
  key.position.set(-4, 10, 7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9 });
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xc8e7e7, 0.75);
  fill.position.set(6, 3, 2);
  scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 1.2);
  rim.position.set(-3, 5, -7);
  scene.add(rim);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8d9e9d, 0.8));
  const groundGeo = new THREE.PlaneGeometry(80, 80);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.14 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.76;
  ground.receiveShadow = true;
  scene.add(ground);
  let kit = createKit(variant, brand);
  scene.add(kit.group);
  // Fit all lid/drawer poses once, so opening never clips or changes framing.
  function framing() {
    const bounds = new THREE.Box3();
    const point = new THREE.Vector3();
    for (let sample = 0; sample <= 20; sample++) {
      const amount = sample / 20;
      orientCamera(amount);
      kit.pose(amount);
      kit.group.updateWorldMatrix(true, true);
      kit.group.traverse((obj) => {
        if (!obj.isMesh) return;
        for (let parent = obj; parent; parent = parent.parent)
          if (!parent.visible) return;
        if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
        const box = obj.geometry.boundingBox;
        for (const x of [box.min.x, box.max.x])
          for (const y of [box.min.y, box.max.y])
            for (const z of [box.min.z, box.max.z])
              bounds.expandByPoint(
                point
                  .set(x, y, z)
                  .applyMatrix4(obj.matrixWorld)
                  .applyMatrix4(camera.matrixWorldInverse),
              );
      });
    }
    orientCamera(0);
    return bounds;
  }
  let frameBounds = framing();
  kit.pose(0);
  let target = 0,
    current = 0,
    frame = 0,
    disposed = false,
    visible = true,
    last = 0,
    wakeUntil = performance.now() + 500,
    lastRender = 0;
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  function render(now) {
    const dt = Math.min((now - last) / 1000, 0.05) || 0.016;
    last = now;
    current = preference.matches
      ? target
      : THREE.MathUtils.lerp(current, target, 1 - Math.exp(-dt * 9));
    if (Math.abs(current - target) < 0.001) current = target;
    const pose = kit.pose(current);
    orientCamera(current);
    host.dataset.opening = current.toFixed(3);
    host.dataset.mechanism = pose.mechanism;
    host.dataset.lidAngle = pose.lidAngle.toFixed(1);
    host.dataset.lidLift = pose.lidLift.toFixed(3);
    host.dataset.lidSlide = pose.lidSlide.toFixed(3);
    host.dataset.drawerOffset = pose.drawerOffset.toFixed(3);
    host.dataset.cameraYaw = THREE.MathUtils.radToDeg(
      Math.atan2(camera.position.x, camera.position.z),
    ).toFixed(1);
    renderer.render(scene, camera);
  }
  function loop(now) {
    if (disposed) return;
    if (
      visible &&
      !document.hidden &&
      now - lastRender > 32 &&
      (Math.abs(current - target) > 0.0001 || now < wakeUntil)
    ) {
      render(now);
      lastRender = now;
    }
    frame = requestAnimationFrame(loop);
  }
  function resize() {
    const w = host.clientWidth,
      h = host.clientHeight;
    if (!w || !h) return;
    const aspect = w / h;
    const height = Math.max(
      frameBounds.max.y - frameBounds.min.y + 0.9,
      (Math.max(Math.abs(frameBounds.max.x), Math.abs(frameBounds.min.x)) * 2 +
        0.9) /
        aspect,
    );
    const center = frameBounds.getCenter(new THREE.Vector3());
    camera.left = -(height * aspect) / 2;
    camera.right = (height * aspect) / 2;
    camera.top = center.y + height / 2;
    camera.bottom = center.y - height / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    render(performance.now());
  }
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) wakeUntil = performance.now() + 300;
  });
  intersection.observe(host);
  const lost = (e) => {
    e.preventDefault();
    cancelAnimationFrame(frame);
    canvas.hidden = true;
    onLost();
  };
  canvas.addEventListener("webglcontextlost", lost);
  host.dataset.variant = variant;
  resize();
  frame = requestAnimationFrame(loop);
  return {
    setOpening(value) {
      target = THREE.MathUtils.clamp(value, 0, 1);
      wakeUntil = performance.now() + 400;
      if (preference.matches) render(performance.now());
    },
    setVariant(value, opening = 0) {
      if (!FINISH[value] || host.dataset.variant === value) return;
      scene.remove(kit.group);
      kit.dispose();
      kit = createKit(value, brand);
      scene.add(kit.group);
      current = target = THREE.MathUtils.clamp(opening, 0, 1);
      frameBounds = framing();
      kit.pose(current);
      host.dataset.variant = value;
      wakeUntil = performance.now() + 400;
      resize();
    },
    dispose() {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      canvas.removeEventListener("webglcontextlost", lost);
      kit.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      key.shadow.dispose();
      env.dispose();
      renderer.dispose();
      canvas.remove();
    },
  };
}
