import './styles.css';
import * as THREE from 'three';

const canvas = document.querySelector('#sunflower-scene');
const hero = document.querySelector('.hero');
const heroCopy = document.querySelector('.hero-copy');
const topbar = document.querySelector('.topbar');
const replayButton = document.querySelector('#rebloom');
const revealItems = document.querySelectorAll('[data-reveal]');
const statNumbers = document.querySelectorAll('.stat-number');

document.querySelectorAll('.split-title').forEach((title) => {
  const text = title.textContent.trim();
  title.textContent = '';
  title.setAttribute('aria-label', text);
  [...text].forEach((letter, index) => {
    const span = document.createElement('span');
    span.className = 'split-letter';
    span.style.setProperty('--letter-index', index);
    span.setAttribute('aria-hidden', 'true');
    span.textContent = letter === ' ' ? '\u00a0' : letter;
    title.appendChild(span);
  });
});

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
  powerPreference: 'high-performance'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0xf7f3e6, 0.024);

const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
camera.position.set(0.25, 2.4, 9.2);

const hemi = new THREE.HemisphereLight(0xfff2cf, 0x63754d, 2.4);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffd276, 4.5);
sun.position.set(-3.5, 7, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 0.5;
sun.shadow.camera.far = 30;
scene.add(sun);

const rim = new THREE.PointLight(0xe9ffaf, 14, 18);
rim.position.set(3.2, 3.2, -2.8);
scene.add(rim);

const root = new THREE.Group();
root.position.y = -2.05;
scene.add(root);

const materials = {
  stem: new THREE.MeshPhysicalMaterial({
    color: 0x547a33,
    roughness: 0.72,
    sheen: 0.45,
    clearcoat: 0.18
  }),
  leaf: new THREE.MeshPhysicalMaterial({
    color: 0x416c35,
    roughness: 0.66,
    sheen: 0.55,
    side: THREE.DoubleSide
  }),
  petalOuter: new THREE.MeshPhysicalMaterial({
    color: 0xffb922,
    roughness: 0.54,
    clearcoat: 0.2,
    sheen: 0.55,
    side: THREE.DoubleSide
  }),
  petalInner: new THREE.MeshPhysicalMaterial({
    color: 0xffcf3d,
    roughness: 0.5,
    clearcoat: 0.16,
    sheen: 0.7,
    side: THREE.DoubleSide
  }),
  seedDark: new THREE.MeshStandardMaterial({ color: 0x3a2417, roughness: 0.86 }),
  seedGold: new THREE.MeshStandardMaterial({ color: 0x9a661d, roughness: 0.82 }),
  disc: new THREE.MeshPhysicalMaterial({
    color: 0x4b2c17,
    roughness: 0.88,
    clearcoat: 0.08
  }),
  soil: new THREE.MeshStandardMaterial({ color: 0x66523e, roughness: 0.95 })
};

const stem = makeStem();
root.add(stem);

const head = new THREE.Group();
head.position.set(0, 4.6, 0);
head.rotation.x = -0.1;
root.add(head);

const petalGroup = new THREE.Group();
const seedGroup = new THREE.Group();
head.add(petalGroup, seedGroup);

const petals = [];
makePetalRing(34, 1.32, 0.62, materials.petalOuter, -0.4, 0.1);
makePetalRing(27, 1.03, 0.5, materials.petalInner, 0.08, Math.PI / 27);
makePetalRing(21, 0.8, 0.38, materials.petalOuter, 0.28, Math.PI / 21);

const disc = new THREE.Mesh(
  new THREE.SphereGeometry(0.95, 96, 48, 0, Math.PI * 2, 0, Math.PI * 0.56),
  materials.disc
);
disc.scale.set(1.05, 1.05, 0.26);
disc.position.z = 0.13;
disc.rotation.x = Math.PI / 2;
disc.castShadow = true;
seedGroup.add(disc);

const seedMesh = buildSeeds();
seedGroup.add(seedMesh);

const leaves = [makeLeaf(-0.74, 2.15, 0.8, -0.55), makeLeaf(0.66, 3.05, 0.62, 0.44)];
leaves.forEach((leaf) => root.add(leaf.group));

const ground = new THREE.Mesh(
  new THREE.CylinderGeometry(3.6, 4.4, 0.42, 96),
  materials.soil
);
ground.position.y = -0.14;
ground.receiveShadow = true;
root.add(ground);

const pollen = buildPollen();
scene.add(pollen);

const state = {
  pointerX: 0,
  pointerY: 0,
  scroll: 0,
  pageScroll: 0
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  },
  { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
);

revealItems.forEach((item) => revealObserver.observe(item));
document.querySelectorAll('.hero-copy [data-reveal]').forEach((item) => {
  item.classList.add('is-visible');
});

function formatNumber(value) {
  return Math.round(value).toLocaleString('en-US');
}

function animateCounter(element) {
  if (element.dataset.counted === 'true') return;
  element.dataset.counted = 'true';

  const duration = 1500;
  const suffix = element.dataset.countSuffix || '';
  const min = Number(element.dataset.countMin);
  const max = Number(element.dataset.countMax);
  const to = Number(element.dataset.countTo);
  const start = performance.now();

  function tick(now) {
    const raw = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - raw, 4);

    if (Number.isFinite(min) && Number.isFinite(max)) {
      const currentMin = min * eased;
      const currentMax = max * eased;
      element.textContent = `${formatNumber(currentMin)}-${formatNumber(currentMax)}${suffix}`;
    } else if (Number.isFinite(to)) {
      element.textContent = `${formatNumber(to * eased)}${suffix}`;
    }

    element.style.setProperty('--counter-glow', String(Math.sin(raw * Math.PI)));

    if (raw < 1) {
      requestAnimationFrame(tick);
    } else if (Number.isFinite(min) && Number.isFinite(max)) {
      element.textContent = `${formatNumber(min)}-${formatNumber(max)}${suffix}`;
      element.style.setProperty('--counter-glow', '0');
    } else if (Number.isFinite(to)) {
      element.textContent = `${formatNumber(to)}${suffix}`;
      element.style.setProperty('--counter-glow', '0');
    }
  }

  requestAnimationFrame(tick);
}

const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.45 }
);

statNumbers.forEach((number) => statObserver.observe(number));

function makeStem() {
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(-0.08, 1.3, 0.02),
    new THREE.Vector3(0.1, 2.75, -0.04),
    new THREE.Vector3(0, 4.55, 0)
  ]);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 96, 0.085, 18, false), materials.stem);
  mesh.castShadow = true;
  return mesh;
}

function makeLeaf(x, y, scale, rotationZ) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 0);
  shape.bezierCurveTo(0.45, 0.12, 1.05, 0.42, 1.22, 0.98);
  shape.bezierCurveTo(0.62, 0.86, 0.16, 0.48, 0, 0);
  const geometry = new THREE.ShapeGeometry(shape, 36);
  const leaf = new THREE.Mesh(geometry, materials.leaf);
  leaf.castShadow = true;
  leaf.receiveShadow = true;
  leaf.scale.set(scale, scale * 0.78, scale);
  leaf.rotation.set(-0.45, x < 0 ? -0.36 : 0.36, rotationZ);
  if (x < 0) leaf.scale.x *= -1;

  const vein = new THREE.Mesh(
    new THREE.CylinderGeometry(0.012, 0.018, 1.05, 8),
    new THREE.MeshStandardMaterial({ color: 0x9dbb6b, roughness: 0.75 })
  );
  vein.position.set(x < 0 ? -0.42 : 0.42, 0.32, 0.012);
  vein.rotation.z = x < 0 ? -0.74 : 0.74;

  const group = new THREE.Group();
  group.position.set(x, y, 0);
  group.add(leaf, vein);
  return { group, leaf, vein, baseScale: scale };
}

function makePetalRing(count, length, width, material, z, offset) {
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0);
  petalShape.bezierCurveTo(width * 0.5, length * 0.28, width * 0.46, length * 0.78, 0, length);
  petalShape.bezierCurveTo(-width * 0.46, length * 0.78, -width * 0.5, length * 0.28, 0, 0);
  const geometry = new THREE.ShapeGeometry(petalShape, 32);
  geometry.translate(0, 0.52, 0);

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2 + offset;
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(Math.cos(angle) * 0.53, Math.sin(angle) * 0.53, z);
    mesh.rotation.z = angle - Math.PI / 2;
    mesh.rotation.x = 1.38;
    mesh.scale.set(0.001, 0.001, 0.001);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = {
      angle,
      baseZ: z,
      delay: i / count * 0.18 + (length < 1 ? 0.18 : 0),
      baseScale: 1 + Math.sin(i * 2.17) * 0.05,
      fold: 1.05 - length * 0.18
    };
    petalGroup.add(mesh);
    petals.push(mesh);
  }
}

function buildSeeds() {
  const count = 520;
  const geometry = new THREE.SphereGeometry(0.036, 12, 8);
  const mesh = new THREE.InstancedMesh(geometry, materials.seedDark, count);
  mesh.castShadow = true;
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i += 1) {
    const r = Math.sqrt(i / count) * 0.88;
    const theta = i * goldenAngle;
    const x = Math.cos(theta) * r;
    const y = Math.sin(theta) * r;
    const z = 0.18 + (1 - r) * 0.08;
    dummy.position.set(x, y, z);
    dummy.rotation.set(theta * 0.2, theta, 0);
    const s = 0.72 + (1 - r) * 0.9;
    dummy.scale.set(s, s * 0.75, s * 0.52);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    color.setHSL(0.09 + Math.sin(i) * 0.018, 0.56, 0.18 + (1 - r) * 0.22);
    mesh.setColorAt(i, color);
  }
  return mesh;
}

function buildPollen() {
  const count = 240;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seeds = [];
  for (let i = 0; i < count; i += 1) {
    const radius = 1.5 + Math.random() * 5.8;
    const angle = Math.random() * Math.PI * 2;
    const height = Math.random() * 5.6 - 0.9;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius - 1.2;
    seeds.push({ angle, radius, height, speed: 0.18 + Math.random() * 0.4 });
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffd36e,
    size: 0.024,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const points = new THREE.Points(geometry, material);
  points.userData.seeds = seeds;
  return points;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
}

function easeInOut(t) {
  t = Math.min(Math.max(t, 0), 1);
  return t * t * (3 - 2 * t);
}

function updateBloom(now) {
  const progress = state.scroll;
  const grow = 0.62 + easeOutCubic(progress / 0.42) * 0.38;
  const totalBloom = easeInOut((progress - 0.24) / 0.76);
  const seedReveal = easeOutCubic((progress - 0.12) / 0.52);
  const glow = easeInOut((progress - 0.55) / 0.45);

  stem.scale.y = Math.max(0.035, grow);
  stem.position.y = (1 - grow) * -0.06;
  head.position.y = 4.6 * grow;
  head.scale.setScalar(0.34 + totalBloom * 0.66);
  head.rotation.y = Math.sin(now * 0.00042) * 0.08 + state.pointerX * 0.22 + totalBloom * 0.12;
  head.rotation.x = -0.14 + state.pointerY * 0.12 - totalBloom * 0.08;
  seedGroup.scale.setScalar(0.42 + seedReveal * 0.58);
  seedGroup.rotation.z = progress * Math.PI * 0.16 + Math.sin(now * 0.0002) * 0.04;
  disc.material.roughness = 0.88 - glow * 0.22;

  petals.forEach((petal) => {
    const open = easeOutCubic((totalBloom - petal.userData.delay) / (1 - petal.userData.delay));
    const breathe = Math.sin(now * 0.0011 + petal.userData.angle * 3) * 0.018;
    const shimmer = 0.48 + glow * 0.16 + Math.sin(now * 0.0014 + petal.userData.angle) * 0.025;
    const scale = Math.max(0.001, open * petal.userData.baseScale);
    petal.scale.set(scale, scale * (0.92 + open * 0.12), scale);
    petal.rotation.x = 1.42 - open * petal.userData.fold + breathe;
    petal.position.z = petal.userData.baseZ - 0.18 + open * (0.18 + (petal.userData.angle % 0.2));
    petal.material.color.setHSL(0.115, 0.83, shimmer);
  });

  leaves.forEach((leaf, index) => {
    const t = easeOutCubic((progress - 0.08 - index * 0.08) / 0.42);
    leaf.group.scale.setScalar(Math.max(0.08, t));
    leaf.group.rotation.z = Math.sin(now * 0.001 + index) * 0.035;
  });

  pollen.material.opacity = 0.08 + totalBloom * 0.34;
  sun.intensity = 3.4 + glow * 2.2;
  rim.intensity = 8 + glow * 12;

}

function updatePollen(now) {
  const positions = pollen.geometry.attributes.position.array;
  pollen.userData.seeds.forEach((seed, i) => {
    const drift = now * 0.0001 * seed.speed;
    positions[i * 3] = Math.cos(seed.angle + drift) * seed.radius + Math.sin(now * 0.0006 + i) * 0.08;
    positions[i * 3 + 1] = seed.height + Math.sin(now * 0.0008 * seed.speed + i) * 0.16;
    positions[i * 3 + 2] = Math.sin(seed.angle + drift) * seed.radius - 1.2;
  });
  pollen.geometry.attributes.position.needsUpdate = true;
}

function resize() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height, false);
}

function render(now) {
  resize();
  state.pageScroll = Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)));
  const copyTop = Number.parseFloat(getComputedStyle(heroCopy).top) || 0;
  const bloomRange = Math.max(1, hero.offsetHeight - copyTop - heroCopy.offsetHeight);
  state.scroll = Math.min(1, Math.max(0, window.scrollY / bloomRange));
  heroCopy.style.setProperty('--copy-progress', state.scroll.toFixed(3));
  document.documentElement.style.setProperty('--page-progress', state.pageScroll.toFixed(3));
  topbar.classList.toggle('is-scrolled', window.scrollY > 24);
  updateBloom(now);
  updatePollen(now);

  const mobile = window.innerWidth < 720;
  const plantX = mobile ? 0.42 : 4.15;
  const plantY = mobile ? -2.0 : -2.05;
  const plantScale = mobile ? 0.58 : 1;
  root.position.x += (plantX - root.position.x) * 0.045;
  root.position.y += (plantY - root.position.y) * 0.045;
  root.scale.setScalar(root.scale.x + (plantScale - root.scale.x) * 0.045);
  const targetX = mobile ? 0 : -0.35;
  const targetZ = mobile ? 10.6 : 9.1 - state.scroll * 0.35;
  camera.position.x += (targetX + state.pointerX * 0.55 - camera.position.x) * 0.04;
  const targetCameraY = mobile ? 2.1 : 2.45;
  camera.position.y += (targetCameraY + state.pointerY * 0.24 + state.scroll * 0.38 - camera.position.y) * 0.04;
  camera.position.z += (targetZ - camera.position.z) * 0.04;
  camera.lookAt(mobile ? 0.24 : 2.45, (mobile ? 2.35 : 2.35) + state.scroll * 0.45, 0);
  root.rotation.y = state.pointerX * 0.14 + Math.sin(now * 0.00022) * 0.025 + state.scroll * 0.08;
  root.rotation.z = Math.sin(now * 0.00035) * 0.012;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

window.addEventListener('pointermove', (event) => {
  state.pointerX = (event.clientX / window.innerWidth - 0.5) * 2;
  state.pointerY = -(event.clientY / window.innerHeight - 0.5) * 2;
  document.documentElement.style.setProperty('--cursor-x', `${Math.round((event.clientX / window.innerWidth) * 100)}%`);
  document.documentElement.style.setProperty('--cursor-y', `${Math.round((event.clientY / window.innerHeight) * 100)}%`);
});

replayButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

resize();
requestAnimationFrame(render);
