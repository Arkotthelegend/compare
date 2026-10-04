import * as THREE from "three";

function material(color, roughness = 0.62) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    metalness: 0.04,
  });
}

function paint(group) {
  group.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return group;
}

export function buildObject(dims) {
  const group = new THREE.Group();
  group.name = dims.shape;

  if (dims.shape === "cube" || dims.shape === "prism") {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(dims.width, dims.height, dims.depth),
      material(0xe7eef5)
    );
    mesh.position.y = dims.height / 2;
    group.add(mesh);
  } else if (dims.shape === "cylinder") {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(dims.radius, dims.radius, dims.height, 40),
      material(0xe6eef6)
    );
    mesh.position.y = dims.height / 2;
    group.add(mesh);
  } else if (dims.shape === "sphere") {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(dims.radius, 36, 28),
      material(0xe9eef4, 0.48)
    );
    mesh.position.y = dims.radius;
    group.add(mesh);
  } else if (dims.shape === "cone") {
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(dims.radius, dims.height, 40),
      material(0xe5edf5)
    );
    mesh.position.y = dims.height / 2;
    group.add(mesh);
  } else if (dims.shape === "pyramid") {
    const radius = (dims.width / 2) * Math.SQRT2;
    const mesh = new THREE.Mesh(
      new THREE.ConeGeometry(radius, dims.height, 4),
      material(0xe4ecf4)
    );
    mesh.rotation.y = Math.PI / 4;
    mesh.position.y = dims.height / 2;
    group.add(mesh);
  } else if (dims.shape === "tree") {
    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(dims.trunkRadius, dims.trunkRadius, dims.trunkHeight, 16),
      material(0xd5cec4, 0.78)
    );
    trunk.position.y = dims.trunkHeight / 2;
    const canopy = new THREE.Mesh(
      new THREE.ConeGeometry(dims.canopyRadius, dims.canopyHeight, 28),
      material(0xc9d4cc, 0.7)
    );
    canopy.position.y = dims.height - dims.canopyHeight / 2;
    group.add(trunk, canopy);
  } else if (dims.shape === "house") {
    const walls = new THREE.Mesh(
      new THREE.BoxGeometry(dims.width, dims.wallH, dims.width),
      material(0xe4ebf3)
    );
    walls.position.y = dims.wallH / 2;
    const radius = (dims.width / 2) * Math.SQRT2;
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(radius, dims.roofH, 4),
      material(0xc9d4df, 0.7)
    );
    roof.rotation.y = Math.PI / 4;
    roof.position.y = dims.wallH + dims.roofH / 2;
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(dims.width * 0.22, dims.wallH * 0.42, 0.04),
      material(0xb7c3d0, 0.55)
    );
    door.position.set(0, dims.wallH * 0.21, dims.width / 2 + 0.01);
    door.castShadow = false;
    group.add(walls, roof, door);
  } else if (dims.shape === "tower") {
    let y = 0;
    dims.levels.forEach((level, index) => {
      const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(level.w, level.h, level.w),
        material(index % 2 === 0 ? 0xe7eef5 : 0xd5dee8)
      );
      mesh.position.y = y + level.h / 2;
      y += level.h;
      group.add(mesh);
    });
  } else if (dims.shape === "arch") {
    const totalW = dims.gap + dims.pillarW * 2;
    const stone = material(0xe6edf4);
    const left = new THREE.Mesh(new THREE.BoxGeometry(dims.pillarW, dims.pillarH, dims.depth), stone);
    const right = new THREE.Mesh(new THREE.BoxGeometry(dims.pillarW, dims.pillarH, dims.depth), stone.clone());
    left.position.set(-totalW / 2 + dims.pillarW / 2, dims.pillarH / 2, 0);
    right.position.set(totalW / 2 - dims.pillarW / 2, dims.pillarH / 2, 0);
    const lintel = new THREE.Mesh(
      new THREE.BoxGeometry(totalW, dims.lintelH, dims.depth),
      material(0xd7e1eb)
    );
    lintel.position.y = dims.pillarH + dims.lintelH / 2;
    group.add(left, right, lintel);
  }

  return paint(group);
}

export function buildMarker() {
  const group = new THREE.Group();
  group.name = "marker";
  const post = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 1, 16),
    material(0xd5e7ee, 0.4)
  );
  post.position.y = 0.5;
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.09, 0.15, 28),
    new THREE.MeshBasicMaterial({ color: 0x00edff, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.012;
  ring.castShadow = false;
  group.add(post, ring);
  post.castShadow = true;
  post.receiveShadow = true;
  return group;
}
