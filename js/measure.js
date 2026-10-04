export function toMeters(value, unit) {
  if (unit === "cm") return value / 100;
  if (unit === "m") return value;
  return Number.NaN;
}

export function scoreGuess(guessMeters, actualMeters) {
  if (!(guessMeters > 0) || !(actualMeters > 0) || !Number.isFinite(guessMeters)) return 0;
  const error = Math.abs(Math.log(guessMeters / actualMeters));
  const score = Math.round(1000 * Math.exp(-4 * error));
  if (score < 0) return 0;
  if (score > 1000) return 1000;
  return score;
}

export function differenceCm(guessMeters, actualMeters) {
  return Math.abs(guessMeters - actualMeters) * 100;
}

export function percentageError(guessMeters, actualMeters) {
  if (!(actualMeters > 0) || !Number.isFinite(guessMeters)) return null;
  return (Math.abs(guessMeters - actualMeters) / actualMeters) * 100;
}

export function projectToGround(point, light) {
  const dy = point.y - light.y;
  if (Math.abs(dy) < 1e-8) return null;
  const t = (0 - light.y) / dy;
  if (t <= 0) return null;
  return {
    x: light.x + t * (point.x - light.x),
    z: light.z + t * (point.z - light.z),
    t,
  };
}

function hypot2(x, z) {
  return Math.hypot(x, z);
}

export function shadowOfPoint(point, light) {
  const hit = projectToGround(point, light);
  if (!hit) return null;
  const D = hypot2(light.x - point.x, light.z - point.z);
  const S = hypot2(hit.x - point.x, hit.z - point.z);
  const awayX = -light.x;
  const awayZ = -light.z;
  const alen = hypot2(awayX, awayZ) || 1;
  return {
    tipX: hit.x,
    tipZ: hit.z,
    source: { x: point.x, y: point.y, z: point.z },
    D,
    S,
    along: (hit.x * awayX + hit.z * awayZ) / alen,
    t: hit.t,
  };
}

export function analyzePoints(points, light) {
  let best = null;
  for (let i = 0; i < points.length; i += 1) {
    const shadow = shadowOfPoint(points[i], light);
    if (!shadow) continue;
    if (!best || shadow.along > best.along) best = shadow;
  }
  return best;
}

function normalize(v) {
  const len = Math.hypot(v.x, v.y, v.z);
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}

function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

export function sphereShadow(radius, light) {
  const center = { x: 0, y: radius, z: 0 };
  const toLight = {
    x: light.x - center.x,
    y: light.y - center.y,
    z: light.z - center.z,
  };
  const dist = Math.hypot(toLight.x, toLight.y, toLight.z);
  if (dist <= radius + 0.04) return null;
  const axis = normalize(toLight);
  const along = (radius * radius) / dist;
  const circleR = Math.sqrt(Math.max(0, radius * radius - along * along));
  const cc = {
    x: center.x + axis.x * along,
    y: center.y + axis.y * along,
    z: center.z + axis.z * along,
  };
  const helper = Math.abs(axis.y) < 0.9 ? { x: 0, y: 1, z: 0 } : { x: 1, y: 0, z: 0 };
  const bx = normalize(cross(axis, helper));
  const by = normalize(cross(axis, bx));
  let best = null;
  const samples = 72;
  for (let i = 0; i < samples; i += 1) {
    const a = (i / samples) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    const point = {
      x: cc.x + (bx.x * c + by.x * s) * circleR,
      y: cc.y + (bx.y * c + by.y * s) * circleR,
      z: cc.z + (bx.z * c + by.z * s) * circleR,
    };
    const shadow = shadowOfPoint(point, light);
    if (!shadow || shadow.t < 1) continue;
    if (!best || shadow.along > best.along) best = shadow;
  }
  return best;
}

export function recoveredHeight(shadow, light) {
  if (!shadow || !(shadow.S > 0)) return null;
  return (shadow.S * light.y) / (shadow.D + shadow.S);
}

export function explain(spec) {
  const light = spec.light;
  const shadow = spec.shadow;
  const recovered = recoveredHeight(shadow, light);
  const markerRecovered = recoveredHeight(spec.markerShadow, light);
  const lightFromMarker = spec.markerShadow
    ? (1 * (spec.markerShadow.D + spec.markerShadow.S)) / spec.markerShadow.S
    : null;
  return {
    kind: spec.shape === "sphere" ? "tangent" : "similar-triangles",
    height: spec.height,
    lightHeight: light.y,
    distance: shadow.D,
    shadowLength: shadow.S,
    sourceHeight: shadow.source.y,
    recovered,
    lightFromMarker,
    markerDistance: spec.markerShadow ? spec.markerShadow.D : null,
    markerShadow: spec.markerShadow ? spec.markerShadow.S : null,
    markerRecovered,
    topCastsTip: Math.abs(shadow.source.y - spec.height) < 0.03,
  };
}

export function formatCm(meters) {
  if (!Number.isFinite(meters)) return "—";
  const cm = meters * 100;
  const rounded = Math.round(cm * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return `${text} cm`;
}

export function formatMeters(meters, digits = 2) {
  if (!Number.isFinite(meters)) return "—";
  return `${meters.toFixed(digits)} m`;
}
