import * as THREE from "three";

// Proportions traced from the original concept: soft trapezoid lenses,
// substantial acetate, a saddle bridge and broad curved temples.
const SIZE = {
  lensOffset: 1.4,
  frameDepth: 0.19,
  lensScale: 0.855,
  templeLength: 3.48,
};

function contour(side = 1, scale = 1) {
  const shape = new THREE.Shape();
  const x = (n) => n * side * scale,
    y = (n) => n * scale;
  shape.moveTo(x(-1.08), y(0.6));
  shape.bezierCurveTo(x(-0.84), y(0.95), x(0.42), y(1.03), x(1.21), y(0.83));
  shape.bezierCurveTo(x(1.32), y(0.77), x(1.31), y(0.62), x(1.28), y(0.48));
  shape.lineTo(x(1.05), y(-0.58));
  shape.bezierCurveTo(x(1), y(-0.91), x(0.75), y(-1.02), x(0.3), y(-1.01));
  shape.lineTo(x(-0.48), y(-0.93));
  shape.bezierCurveTo(
    x(-0.86),
    y(-0.89),
    x(-1.02),
    y(-0.76),
    x(-1.08),
    y(-0.41),
  );
  shape.bezierCurveTo(x(-1.16), y(-0.08), x(-1.2), y(0.33), x(-1.08), y(0.6));
  return shape;
}

function templeGeometry(curve) {
  const segments = 64,
    sides = 12,
    positions = [],
    indices = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const p = curve.getPoint(t);
    const height = 0.38 * (1 - t) + 0.22 * t;
    for (let j = 0; j < sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      const rounded = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.45);
      positions.push(
        p.x + rounded(Math.cos(a)) * 0.075,
        p.y + (rounded(Math.sin(a)) * height) / 2,
        p.z,
      );
      if (i < segments) {
        const a0 = i * sides + j,
          b = i * sides + ((j + 1) % sides);
        indices.push(a0, b + sides, b, a0, a0 + sides, b + sides);
      }
    }
  }
  for (let j = 1; j < sides - 1; j++) {
    indices.push(0, j, j + 1);
    const end = segments * sides;
    indices.push(end, end + j + 1, end + j);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

export function createAquilaEyewear() {
  const group = new THREE.Group();
  group.name = "AQUILA reference-inspired acetate eyewear";
  const geometries = new Set(),
    materials = new Set();
  const material = (settings) => {
    const mat = new THREE.MeshPhysicalMaterial(settings);
    materials.add(mat);
    return mat;
  };
  const acetate = material({
    color: 0x100c0e,
    metalness: 0.08,
    roughness: 0.22,
    clearcoat: 1,
    clearcoatRoughness: 0.16,
    envMapIntensity: 0.3,
  });
  const lens = material({
    color: 0x151116,
    metalness: 0.02,
    roughness: 0.12,
    clearcoat: 1,
    clearcoatRoughness: 0.035,
    envMapIntensity: 0.8,
  });
  const rose = material({
    color: 0xc48e80,
    metalness: 0.85,
    roughness: 0.26,
    clearcoat: 0.3,
  });
  const rubber = material({ color: 0x161014, roughness: 0.48, clearcoat: 0.2 });
  const mesh = (geometry, mat, parent = group) => {
    geometries.add(geometry);
    const object = new THREE.Mesh(geometry, mat);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  };
  const solid = (shape, depth, bevel = 0.035) =>
    new THREE.ExtrudeGeometry(shape, {
      depth,
      bevelEnabled: true,
      bevelSize: bevel,
      bevelThickness: bevel,
      bevelSegments: 4,
      curveSegments: 32,
      steps: 1,
    });
  const tube = (points, radius, mat, parent, closed = false) => {
    const curve = new THREE.CatmullRomCurve3(points, closed);
    return mesh(
      new THREE.TubeGeometry(curve, closed ? 128 : 64, radius, 8, closed),
      mat,
      parent,
    );
  };
  for (const side of [-1, 1]) {
    const assembly = new THREE.Group();
    assembly.name = side < 0 ? "Left sculpted rim" : "Right sculpted rim";
    assembly.position.x = side * SIZE.lensOffset;
    assembly.rotation.y = side * 0.065;
    group.add(assembly);
    const rim = contour(side);
    rim.holes.push(
      new THREE.Path(contour(side, SIZE.lensScale).getPoints(48).reverse()),
    );
    mesh(solid(rim, SIZE.frameDepth, 0.045), acetate, assembly);
    const glass = mesh(
      solid(contour(side, SIZE.lensScale - 0.006), 0.035, 0.018),
      lens,
      assembly,
    );
    glass.name = "Charcoal sunglass lens";
    glass.position.z = 0.15;
    const trim = contour(side, 0.89)
      .getPoints(56)
      .slice(0, -1)
      .map((p) => new THREE.Vector3(p.x, p.y, 0.218));
    tube(trim, 0.012, rose, assembly, true).name = "Fine rose lens surround";
    const hinge = mesh(new THREE.BoxGeometry(0.28, 0.12, 0.07), rose, assembly);
    hinge.position.set(side * 1.2, 0.52, 0.24);
    const pin = mesh(new THREE.SphereGeometry(0.024, 12, 8), rose, assembly);
    pin.position.set(side * 1.24, 0.52, 0.29);
    const temple = new THREE.Group();
    temple.name = "Temple";
    group.add(temple);
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(side * 2.57, 0.58, -0.02),
      new THREE.Vector3(side * 2.77, 0.59, -0.45),
      new THREE.Vector3(side * 2.87, 0.65, -1.75),
      new THREE.Vector3(side * 2.84, 0.66, -2.7),
      new THREE.Vector3(side * 2.7, 0.3, -3.32),
      new THREE.Vector3(side * 2.62, -0.02, -SIZE.templeLength),
    ]);
    mesh(templeGeometry(curve), acetate, temple).name = "Broad acetate temple";
    const spine = Array.from({ length: 36 }, (_, i) => {
      const t = i / 40,
        p = curve.getPoint(t);
      p.x += side * 0.07;
      p.y += (0.38 * (1 - t) + 0.22 * t) / 2;
      return p;
    });
    tube(spine, 0.018, rose, temple).name = "Rose temple spine";
    const pad = mesh(new THREE.SphereGeometry(0.12, 16, 10), rubber);
    pad.scale.set(0.55, 1.2, 0.65);
    pad.position.set(side * 0.43, -0.12, -0.04);
  }
  const bridge = new THREE.Shape();
  bridge.moveTo(-0.55, 0.71);
  bridge.quadraticCurveTo(0, 0.39, 0.55, 0.71);
  bridge.lineTo(0.5, 0.08);
  bridge.quadraticCurveTo(0, 0.31, -0.5, 0.08);
  bridge.closePath();
  mesh(solid(bridge, SIZE.frameDepth, 0.045), acetate).name =
    "Sculpted saddle bridge";
  return {
    group,
    dispose() {
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
    },
  };
}
