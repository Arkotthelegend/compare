import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { buildMarker, buildObject } from "./objects.js";

function disposeHierarchy(root) {
  const children = [...root.children];
  children.forEach((child) => {
    root.remove(child);
    child.traverse((obj) => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        const materials = Array.isArray(obj.material) ? obj.material : [obj.material];
        materials.forEach((item) => item.dispose());
      }
    });
  });
}

export class ShadowStage {
  constructor(canvas) {
    this.canvas = canvas;
    this.alive = true;
    this.paused = false;
    this.ready = false;
    this.defaultPosition = new THREE.Vector3();
    this.defaultTarget = new THREE.Vector3();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.02;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.setClearColor(0x152235, 1);

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x152235);
    this.scene.fog = new THREE.Fog(0x152235, 34, 62);

    this.camera = new THREE.PerspectiveCamera(42, 1, 0.08, 80);
    this.controls = new OrbitControls(this.camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minPolarAngle = 0.12;
    this.controls.maxPolarAngle = Math.PI - 0.08;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 40;
    this.controls.rotateSpeed = 0.85;
    this.controls.zoomSpeed = 0.85;
    this.controls.target.set(0, 0.8, 0);

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(80, 80),
      new THREE.MeshStandardMaterial({ color: 0x56748c, roughness: 0.9, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    this.grid = new THREE.GridHelper(18, 18, 0xc5d7e6, 0x7f9bb3);
    this.grid.position.y = 0.015;
    this.grid.material.transparent = true;
    this.grid.material.opacity = 0.85;
    this.scene.add(this.grid);

    this.scene.add(new THREE.AmbientLight(0xd5e2ee, 0.24));
    this.scene.add(new THREE.HemisphereLight(0xe7eef6, 0x24384c, 0.22));

    this.lamp = new THREE.SpotLight(0xfff6ea, 170, 70, 1.1, 0.35, 1);
    this.lamp.castShadow = true;
    this.lamp.shadow.mapSize.set(2048, 2048);
    this.lamp.shadow.bias = -0.0002;
    this.lamp.shadow.normalBias = 0.03;
    this.lamp.shadow.radius = 10;
    this.lamp.shadow.camera.near = 0.4;
    this.lamp.shadow.camera.far = 36;
    this.scene.add(this.lamp);
    this.scene.add(this.lamp.target);

    this.orb = new THREE.Mesh(
      new THREE.SphereGeometry(0.16, 24, 16),
      new THREE.MeshBasicMaterial({ color: 0x00edff })
    );
    this.glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.38, 24, 16),
      new THREE.MeshBasicMaterial({
        color: 0x00edff,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      })
    );
    this.scene.add(this.orb, this.glow);

    this.objects = new THREE.Group();
    this.guides = new THREE.Group();
    this.scene.add(this.objects, this.guides);

    this._onResize = () => this.resize();
    window.addEventListener("resize", this._onResize);
    this._loop = this._loop.bind(this);
    requestAnimationFrame(this._loop);
  }

  resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const width = parent.clientWidth;
    const height = parent.clientHeight;
    if (width < 2 || height < 2) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 1.6);
    this.renderer.setPixelRatio(ratio);
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  load(spec) {
    disposeHierarchy(this.objects);
    disposeHierarchy(this.guides);
    const object = buildObject(spec.dims);
    this.objects.add(object);
    const marker = buildMarker();
    marker.position.set(spec.marker.x, 0, spec.marker.z);
    this.objects.add(marker);

    this.lamp.position.set(spec.light.x, spec.light.y, spec.light.z);
    this.orb.position.copy(this.lamp.position);
    this.glow.position.copy(this.lamp.position);
    const aim = new THREE.Vector3(spec.shadow.tipX * 0.62, 0.08, spec.shadow.tipZ * 0.62);
    this.lamp.target.position.copy(aim);
    const forward = aim.clone().sub(this.lamp.position).normalize();
    const coverage = [
      new THREE.Vector3(0, spec.height, 0),
      new THREE.Vector3(spec.shadow.tipX, 0, spec.shadow.tipZ),
      new THREE.Vector3(spec.marker.x, 1, spec.marker.z),
      new THREE.Vector3(spec.markerShadow.tipX, 0, spec.markerShadow.tipZ),
      new THREE.Vector3(spec.footprint, 0, spec.footprint),
      new THREE.Vector3(-spec.footprint, 0, -spec.footprint),
    ];
    let angle = 0.25;
    coverage.forEach((point) => {
      angle = Math.max(angle, point.clone().sub(this.lamp.position).normalize().angleTo(forward));
    });
    this.lamp.angle = Math.min(1.25, Math.max(1.0, angle + 0.35));

    this._frame(spec);
    this.ready = true;
  }

  _frame(spec) {
    const center = new THREE.Vector3(
      spec.light.x * 0.28 + spec.shadow.tipX * 0.2,
      Math.max(0.6, spec.height * 0.35),
      spec.light.z * 0.28 + spec.shadow.tipZ * 0.2
    );
    const points = [
      new THREE.Vector3(0, spec.height, 0),
      new THREE.Vector3(spec.light.x, spec.light.y, spec.light.z),
      new THREE.Vector3(spec.shadow.tipX, 0, spec.shadow.tipZ),
      new THREE.Vector3(spec.marker.x, 1, spec.marker.z),
    ];
    let radius = 2;
    points.forEach((point) => {
      radius = Math.max(radius, point.distanceTo(center));
    });
    const halfFov = THREE.MathUtils.degToRad(this.camera.fov * 0.5);
    const distance = (radius / Math.tan(halfFov)) * 1.05;
    const azimuth = Math.atan2(spec.light.z, spec.light.x);
    const side = azimuth + Math.PI * 0.5;
    const lift = spec.difficulty === "expert" ? 0.18 : spec.difficulty === "advanced" ? 0.24 : 0.34;
    this.camera.position.set(
      center.x + Math.cos(side) * distance,
      Math.max(1.2, center.y + distance * lift),
      center.z + Math.sin(side) * distance
    );
    this.controls.target.copy(center);
    this.controls.maxDistance = Math.max(24, distance * 1.8);
    this.controls.minDistance = Math.max(1.4, spec.footprint + 0.8);
    this.controls.update();
    if (this.camera.position.y < 0.22) this.camera.position.y = 0.22;
    this.defaultPosition.copy(this.camera.position);
    this.defaultTarget.copy(this.controls.target);
  }

  resetCamera() {
    this.camera.position.copy(this.defaultPosition);
    this.controls.target.copy(this.defaultTarget);
    this.controls.update();
  }

  showComparison(spec, guessMeters) {
    disposeHierarchy(this.guides);
    const along = Math.atan2(spec.light.z, spec.light.x);
    const ox = Math.cos(along) * (spec.footprint + 0.9);
    const oz = Math.sin(along) * (spec.footprint + 0.9);
    const baseX = 0;
    const baseZ = 0;
    this.guides.add(this._post(ox + baseX, oz + baseZ, spec.height, 0xf4f7fb));
    if (guessMeters > 0 && guessMeters < Math.max(14, spec.height * 4)) {
      this.guides.add(this._post(ox + baseX + 0.18, oz + baseZ + 0.18, guessMeters, 0x00edff));
    }
  }

  showSolution(spec) {
    const makeLine = (points, color) => {
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.9 }));
      return line;
    };
    const light = spec.light;
    this.guides.add(makeLine([
      new THREE.Vector3(light.x, 0.02, light.z),
      new THREE.Vector3(light.x, light.y, light.z),
    ], 0x00edff));
    this.guides.add(makeLine([
      new THREE.Vector3(spec.shadow.source.x, 0.03, spec.shadow.source.z),
      new THREE.Vector3(spec.shadow.source.x, spec.shadow.source.y, spec.shadow.source.z),
    ], 0xffffff));
    this.guides.add(makeLine([
      new THREE.Vector3(spec.shadow.source.x, 0.03, spec.shadow.source.z),
      new THREE.Vector3(spec.shadow.tipX, 0.03, spec.shadow.tipZ),
    ], 0x00edff));
  }

  hideGuides() {
    disposeHierarchy(this.guides);
  }

  _post(x, z, height, color) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, height, 10),
      new THREE.MeshBasicMaterial({ color })
    );
    mesh.position.set(x, height / 2, z);
    return mesh;
  }

  setPaused(paused) {
    this.paused = paused;
    if (!paused && this.alive) requestAnimationFrame(this._loop);
  }

  _loop() {
    if (!this.alive || this.paused) return;
    this.controls.update();
    if (this.camera.position.y < 0.2) this.camera.position.y = 0.2;
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this._loop);
  }

  destroy() {
    this.alive = false;
    window.removeEventListener("resize", this._onResize);
    disposeHierarchy(this.objects);
    disposeHierarchy(this.guides);
    this.controls.dispose();
    this.renderer.dispose();
  }
}
