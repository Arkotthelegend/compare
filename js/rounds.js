import { analyzePoints, recoveredHeight, shadowOfPoint, sphereShadow } from "./measure.js";
import { SHAPE_POOL, buildDims, categoryFor, criticalPoints, footprintOf, styleFor } from "./shapes.js";

const LIGHT = {
  beginner: { phi: [34, 48], distance: [3.4, 5.8] },
  intermediate: { phi: [26, 40], distance: [3.6, 6.6] },
  advanced: { phi: [20, 33], distance: [4.0, 7.4] },
  expert: { phi: [17, 28], distance: [4.4, 8.0] },
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function deg(radians) {
  return (radians * Math.PI) / 180;
}

function shadowFor(dims, light) {
  if (dims.shape === "sphere") return sphereShadow(dims.radius, light);
  return analyzePoints(criticalPoints(dims), light);
}

function markerShadow(marker, light) {
  const awayX = -light.x;
  const awayZ = -light.z;
  const alen = Math.hypot(awayX, awayZ) || 1;
  const rim = 0.045;
  return shadowOfPoint(
    {
      x: marker.x + (awayX / alen) * rim,
      y: marker.height,
      z: marker.z + (awayZ / alen) * rim,
    },
    light
  );
}

function placeLight(rng, difficulty, height) {
  const band = LIGHT[difficulty];
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const phi = deg(lerp(band.phi[0], band.phi[1], rng()));
    const distance = lerp(band.distance[0], band.distance[1], rng());
    const y = distance * Math.tan(phi);
    if (y < height + 0.45) continue;
    const azimuth = rng() * Math.PI * 2;
    return {
      x: Math.cos(azimuth) * distance,
      y,
      z: Math.sin(azimuth) * distance,
    };
  }
  return null;
}

function placeMarker(rng, light, footprint) {
  const azimuth = Math.atan2(light.z, light.x);
  for (let attempt = 0; attempt < 14; attempt += 1) {
    const turn = lerp(2.1, 4.1, rng());
    const distance = lerp(Math.max(2.6, footprint + 1.55), 4.8, rng());
    const angle = azimuth + turn;
    const marker = {
      x: Math.cos(angle) * distance,
      z: Math.sin(angle) * distance,
      height: 1,
    };
    if (Math.hypot(marker.x, marker.z) < footprint + 1.45) continue;
    const shadow = markerShadow(marker, light);
    if (!shadow || shadow.S < 0.2 || shadow.S > 6.5) continue;
    if (Math.hypot(shadow.tipX, shadow.tipZ) > 9.5) continue;
    if (Math.hypot(shadow.tipX, shadow.tipZ) < footprint + 0.55) continue;
    const recovered = recoveredHeight(shadow, light);
    if (recovered === null || Math.abs(recovered - 1) > 0.025) continue;
    return { marker, shadow };
  }
  return null;
}

function acceptable(dims, light, shadow, markerPack) {
  if (!shadow || !markerPack) return false;
  if (light.y < dims.height + 0.35) return false;
  const lightR = Math.hypot(light.x, light.z);
  const foot = footprintOf(dims);
  if (lightR < foot + 1.3 || lightR > 9.6) return false;
  const tipR = Math.hypot(shadow.tipX, shadow.tipZ);
  if (tipR < 0.3 || tipR > 9.3) return false;
  if (shadow.S < 0.4 || shadow.S > 8.8) return false;
  if (shadow.t < 1) return false;
  if (dims.shape !== "sphere" && shadow.source.y < dims.height - 0.021) return false;
  const recovered = recoveredHeight(shadow, light);
  if (recovered === null || Math.abs(recovered - shadow.source.y) > 0.03) return false;
  if (foot > 2.4) return false;
  return true;
}

export function tryRound(rng, difficulty, shape) {
  const dims = buildDims(shape, rng, difficulty);
  if (!dims) return null;
  const light = placeLight(rng, difficulty, dims.height);
  if (!light) return null;
  const shadow = shadowFor(dims, light);
  const markerPack = placeMarker(rng, light, footprintOf(dims));
  if (!acceptable(dims, light, shadow, markerPack)) return null;
  return {
    shape,
    style: styleFor(shape),
    category: categoryFor(shape, difficulty),
    difficulty,
    height: dims.height,
    dims,
    position: { x: 0, y: 0, z: 0 },
    light: { x: light.x, y: light.y, z: light.z },
    marker: markerPack.marker,
    markerShadow: markerPack.shadow,
    shadow: {
      tipX: shadow.tipX,
      tipZ: shadow.tipZ,
      source: shadow.source,
      D: shadow.D,
      S: shadow.S,
      t: shadow.t,
    },
    footprint: footprintOf(dims),
  };
}

export function createRound(rng, difficulty) {
  const pool = SHAPE_POOL[difficulty];
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const shape = pool[Math.floor(rng() * pool.length)];
    const round = tryRound(rng, difficulty, shape);
    if (round) return round;
  }
  const fallback = tryRound(rng, "beginner", "cube");
  if (fallback) {
    fallback.difficulty = difficulty;
    fallback.category = categoryFor("cube", difficulty);
    return fallback;
  }
  return tryRound(mulberryFallback(), "beginner", "cube");
}

function mulberryFallback() {
  let a = 0x1a2b3c4d;
  return function rand() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function difficultiesFor(mode) {
  if (mode === "training") {
    return ["beginner", "beginner", "intermediate", "intermediate", "advanced", "advanced", "expert", "expert"];
  }
  if (mode === "challenge" || mode === "daily") {
    return ["beginner", "intermediate", "intermediate", "advanced", "expert"];
  }
  return null;
}

export function practiceDifficulty(rng) {
  const roll = rng();
  if (roll < 0.42) return "beginner";
  if (roll < 0.72) return "intermediate";
  if (roll < 0.9) return "advanced";
  return "expert";
}

export function buildSession(mode, rng) {
  const plan = difficultiesFor(mode);
  if (!plan) return [];
  return plan.map((difficulty, index) => {
    const round = createRound(rng, difficulty);
    round.index = index;
    round.mode = mode;
    return round;
  });
}

export const MODE_META = {
  practice: { title: "Practice", rounds: Infinity, timed: false, maxScore: null },
  challenge: { title: "5-Round Challenge", rounds: 5, timed: true, seconds: 90, maxScore: 5000 },
  daily: { title: "Daily Challenge", rounds: 5, timed: true, seconds: 90, maxScore: 5000 },
  training: { title: "Training", rounds: 8, timed: true, seconds: 90, maxScore: 8000 },
};
