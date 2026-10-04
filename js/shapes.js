const HEIGHT_RANGE = {
  beginner: [0.9, 2.2],
  intermediate: [0.55, 3.6],
  advanced: [0.5, 6],
  expert: [0.45, 8],
};

const WIDTH_RANGE = {
  beginner: [0.72, 1.2],
  intermediate: [0.42, 1.75],
  advanced: [0.28, 2.05],
  expert: [0.16, 2.35],
};

export const SHAPE_POOL = {
  beginner: ["cube", "cylinder", "sphere", "cone"],
  intermediate: ["prism", "pyramid", "cylinder", "cone", "tree"],
  advanced: ["tree", "house", "tower", "prism", "pyramid"],
  expert: ["tree", "house", "arch", "tower", "sphere"],
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function snap(meters) {
  return Math.round(meters * 100) / 100;
}

function between(rng, a, b) {
  return lerp(a, b, rng());
}

export function categoryFor(shape, difficulty) {
  if (difficulty === "expert") return "perspective";
  if (shape === "tree") return "natural";
  if (shape === "house" || shape === "tower" || shape === "arch") return "architecture";
  return "geometric";
}

export function styleFor(shape) {
  if (shape === "tree" || shape === "house" || shape === "tower" || shape === "arch") return "realistic";
  return "geometric";
}

export function footprintOf(dims) {
  switch (dims.shape) {
    case "cube":
    case "prism":
      return 0.5 * Math.hypot(dims.width, dims.depth);
    case "cylinder":
    case "cone":
      return dims.radius;
    case "sphere":
      return dims.height / 2;
    case "pyramid":
    case "house":
      return (dims.width / 2) * Math.SQRT2;
    case "tree":
      return Math.max(dims.canopyRadius, dims.trunkRadius);
    case "tower":
      return (dims.levels[0].w / 2) * Math.SQRT2;
    case "arch":
      return 0.5 * Math.hypot(dims.gap + dims.pillarW * 2, dims.depth);
    default:
      return 1;
  }
}

function rim(radius, y, count, add) {
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    add(Math.cos(a) * radius, y, Math.sin(a) * radius);
  }
}

export function criticalPoints(dims) {
  const pts = [];
  const add = (x, y, z) => pts.push({ x, y, z });
  if (dims.shape === "cube" || dims.shape === "prism") {
    const hx = dims.width / 2;
    const hz = dims.depth / 2;
    for (const x of [-hx, hx]) {
      for (const z of [-hz, hz]) {
        add(x, dims.height, z);
        add(x, 0, z);
      }
    }
  } else if (dims.shape === "cylinder") {
    rim(dims.radius, dims.height, 24, add);
    rim(dims.radius, 0, 12, add);
  } else if (dims.shape === "cone") {
    add(0, dims.height, 0);
    rim(dims.radius, 0, 16, add);
  } else if (dims.shape === "pyramid") {
    add(0, dims.height, 0);
    const h = dims.width / 2;
    for (const x of [-h, h]) {
      for (const z of [-h, h]) add(x, 0, z);
    }
  } else if (dims.shape === "tree") {
    add(0, dims.height, 0);
    rim(dims.canopyRadius, dims.height - dims.canopyHeight, 20, add);
    rim(dims.trunkRadius, 0, 8, add);
  } else if (dims.shape === "house") {
    add(0, dims.height, 0);
    const h = dims.width / 2;
    for (const x of [-h, h]) {
      for (const z of [-h, h]) {
        add(x, dims.wallH, z);
        add(x, 0, z);
      }
    }
  } else if (dims.shape === "tower") {
    let y = 0;
    dims.levels.forEach((level) => {
      y += level.h;
      const hx = level.w / 2;
      for (const x of [-hx, hx]) {
        for (const z of [-hx, hx]) add(x, y, z);
      }
    });
  } else if (dims.shape === "arch") {
    const hx = (dims.gap + dims.pillarW * 2) / 2;
    const hz = dims.depth / 2;
    for (const x of [-hx, hx]) {
      for (const z of [-hz, hz]) {
        add(x, dims.height, z);
        add(x, 0, z);
      }
    }
  }
  return pts;
}

export function buildDims(shape, rng, difficulty) {
  const [minH, maxH] = HEIGHT_RANGE[difficulty];
  const height = snap(between(rng, minH, maxH));
  const [minR, maxR] = WIDTH_RANGE[difficulty];
  const ratio = () => between(rng, minR, maxR);

  if (shape === "cube") {
    return { shape, height, width: height, depth: height };
  }
  if (shape === "prism") {
    const width = snap(Math.min(3.4, Math.max(0.18, height * ratio())));
    const depth = snap(Math.min(3.4, Math.max(0.18, height * ratio())));
    return { shape, height, width, depth };
  }
  if (shape === "cylinder") {
    const radius = snap(Math.min(1.6, Math.max(0.12, height * ratio() * 0.5)));
    return { shape, height, radius };
  }
  if (shape === "sphere") {
    return { shape, height, radius: height / 2 };
  }
  if (shape === "cone") {
    const radius = snap(Math.min(1.8, Math.max(0.16, height * ratio() * 0.48)));
    return { shape, height, radius };
  }
  if (shape === "pyramid") {
    const width = snap(Math.min(3.2, Math.max(0.28, height * ratio())));
    return { shape, height, width };
  }
  if (shape === "tree") {
    const canopyHeight = snap(height * between(rng, 0.5, 0.7));
    const canopyRadius = snap(Math.max(0.12, height * between(rng, 0.1, 0.26)));
    const trunkRadius = snap(Math.max(0.05, Math.min(canopyRadius * 0.45, canopyRadius * between(rng, 0.16, 0.3))));
    const trunkHeight = snap(Math.min(height * 0.78, height - canopyHeight + canopyHeight * 0.3));
    if (canopyHeight < 0.25 || height - canopyHeight < 0.12) return null;
    return {
      shape,
      height,
      canopyHeight,
      canopyRadius,
      trunkRadius,
      trunkHeight,
    };
  }
  if (shape === "house") {
    const wallH = snap(height * between(rng, 0.46, 0.68));
    const roofH = snap(height - wallH);
    const width = snap(Math.min(wallH * 1.05, Math.max(0.4, height * between(rng, 0.26, 0.48))));
    if (roofH < 0.28 || wallH < 0.28) return null;
    return { shape, height, wallH, roofH, width };
  }
  if (shape === "tower") {
    const count = difficulty === "expert" ? 4 : 3;
    const weights = [];
    let weightSum = 0;
    for (let i = 0; i < count; i += 1) {
      const weight = between(rng, 0.75, 1.15);
      weights.push(weight);
      weightSum += weight;
    }
    const levels = [];
    let used = 0;
    let width = snap(Math.max(0.28, height * between(rng, 0.16, 0.32)));
    for (let i = 0; i < count; i += 1) {
      const h = i === count - 1 ? snap(height - used) : snap((height * weights[i]) / weightSum);
      if (h < 0.16) return null;
      levels.push({ w: width, h });
      used = snap(used + h);
      width = snap(Math.max(0.16, width * between(rng, 0.64, 0.8)));
    }
    const sum = levels.reduce((total, level) => total + level.h, 0);
    if (Math.abs(sum - height) > 0.02) return null;
    return { shape, height, levels };
  }
  if (shape === "arch") {
    const lintelH = snap(Math.max(0.14, height * between(rng, 0.1, 0.18)));
    const pillarH = snap(height - lintelH);
    const gap = snap(between(rng, 0.42, difficulty === "expert" ? 1.8 : 1.15));
    const pillarW = snap(between(rng, 0.16, 0.36));
    const depth = snap(between(rng, 0.28, 0.62));
    if (pillarH < 0.3) return null;
    return { shape, height, lintelH, pillarH, gap, pillarW, depth };
  }
  return null;
}
