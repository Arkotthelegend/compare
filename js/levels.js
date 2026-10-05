import { sizeForWeight } from "./physics.js";
import { hashString, mulberry32, roundTo } from "./rng.js";

const SHAPES = ["square", "rect", "circle", "triangle", "long", "cube", "pebble", "slab"];

function snapValue(value, step) {
  return roundTo(value, step);
}

function overlaps(s, size, placed) {
  return placed.some((item) => Math.abs(item.s - s) < (item.size + size) / 2 + 0.12);
}

function reachFor(length, pivotFromLeft, sign) {
  return sign < 0 ? pivotFromLeft - 0.45 : length - pivotFromLeft - 0.45;
}

function pickWeight(rng, hard) {
  const pool = hard ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] : [1, 2, 3, 4, 5, 6, 8];
  return pool[Math.floor(rng() * pool.length)];
}

function settingsFor(level) {
  if (level <= 5) return { snap: 1, tolerance: 0.45, count: 2, hard: false, shiftPivot: false, par: 25 };
  if (level <= 15) return { snap: 0.5, tolerance: 0.3, count: level < 10 ? 3 : 3, hard: false, shiftPivot: false, par: 40 };
  if (level <= 30) return { snap: 0.5, tolerance: 0.18, count: 4, hard: true, shiftPivot: true, par: 55 };
  return { snap: 0.5, tolerance: 0.1, count: 5, hard: true, shiftPivot: true, par: 70 };
}

function emptyChallenge(partial) {
  return {
    length: 10,
    pivotFromLeft: 5,
    snap: 1,
    tolerance: 0.45,
    par: 30,
    tutorial: false,
    objects: [],
    ...partial,
  };
}

export function scriptedLevel(level) {
  if (level === 1) {
    return emptyChallenge({
      id: "level-1",
      snap: 1,
      tolerance: 0.45,
      par: 40,
      tutorial: true,
      hint: "A light weight far from the pivot can match a heavy weight close to it.",
      objects: [
        { id: "a", shape: "square", weight: 2, size: sizeForWeight(2), s: null, guide: 4 },
        { id: "b", shape: "cube", weight: 4, size: sizeForWeight(4), s: null, guide: -2 },
      ],
    });
  }
  if (level === 2) {
    return emptyChallenge({
      id: "level-2",
      snap: 1,
      tolerance: 0.45,
      par: 35,
      tutorial: true,
      hint: "Equal weights balance at equal distances.",
      objects: [
        { id: "a", shape: "circle", weight: 3, size: sizeForWeight(3), s: null, guide: -2 },
        { id: "b", shape: "circle", weight: 3, size: sizeForWeight(3), s: null, guide: 2 },
      ],
    });
  }
  return null;
}

function tryBuild(rng, level) {
  const settings = settingsFor(level);
  const length = 10;
  let pivotFromLeft = 5;
  if (settings.shiftPivot) {
    const options = [];
    for (let pivot = 3; pivot <= 7; pivot += 0.5) options.push(pivot);
    pivotFromLeft = options[Math.floor(rng() * options.length)];
  }
  const placed = [];
  const objects = [];
  const count = settings.count;
  const free = count - 1;
  for (let index = 0; index < free; index += 1) {
    const sign = index % 2 === 0 ? -1 : 1;
    const maxReach = reachFor(length, pivotFromLeft, sign);
    let stored = null;
    for (let attempt = 0; attempt < 24; attempt += 1) {
      const weight = pickWeight(rng, settings.hard);
      const size = sizeForWeight(weight);
      const steps = Math.max(1, Math.floor((maxReach - size / 2) / settings.snap));
      const dist = settings.snap * (1 + Math.floor(rng() * steps));
      const s = snapValue(sign * dist, settings.snap);
      if (Math.abs(s) + size / 2 > maxReach + 0.45) continue;
      if (overlaps(s, size, placed)) continue;
      stored = { weight, size, s };
      break;
    }
    if (!stored) return null;
    placed.push(stored);
    objects.push(stored);
  }

  const used = objects.reduce((sum, object) => sum + object.weight * object.s, 0);
  const target = -used;
  if (Math.abs(target) < 0.001) return null;
  const sign = target > 0 ? 1 : -1;
  const maxReach = reachFor(length, pivotFromLeft, sign);
  const options = [];
  for (let dist = settings.snap; dist <= maxReach - 0.2; dist += settings.snap) {
    const s = snapValue(sign * dist, settings.snap);
    const weight = target / s;
    const rounded = Math.round(weight);
    if (rounded < 1 || rounded > (settings.hard ? 12 : 8)) continue;
    if (Math.abs(weight - rounded) > 0.001) continue;
    const size = sizeForWeight(rounded);
    if (overlaps(s, size, placed)) continue;
    options.push({ weight: rounded, size, s });
  }
  if (!options.length) return null;
  objects.push(options[Math.floor(rng() * options.length)]);

  const moment = objects.reduce((sum, object) => sum + object.weight * object.s, 0);
  if (Math.abs(moment) > 0.02) return null;

  return emptyChallenge({
    id: `level-${level}`,
    length,
    pivotFromLeft,
    snap: settings.snap,
    tolerance: settings.tolerance,
    par: settings.par,
    objects: objects.map((object, index) => ({
      id: `o${index + 1}`,
      shape: SHAPES[Math.floor(rng() * SHAPES.length)],
      weight: object.weight,
      size: object.size,
      s: null,
      guide: null,
    })),
    solution: objects.map((object) => ({ weight: object.weight, s: object.s, size: object.size })),
  });
}

export function createChallenge(seed, level) {
  const scripted = scriptedLevel(level);
  if (scripted) {
    scripted.seed = seed >>> 0;
    scripted.level = level;
    return scripted;
  }
  const rng = mulberry32(seed >>> 0);
  for (let attempt = 0; attempt < 80; attempt += 1) {
    const challenge = tryBuild(rng, level);
    if (challenge && isSolvable(challenge)) {
      challenge.seed = seed >>> 0;
      challenge.level = level;
      return challenge;
    }
  }
  const fallback = scriptedLevel(2);
  fallback.seed = seed >>> 0;
  fallback.level = level;
  fallback.id = `level-${level}`;
  return fallback;
}

export function isSolvable(challenge) {
  if (!challenge.solution) return Boolean(scriptedLevel(challenge.level));
  const moment = challenge.solution.reduce((sum, object) => sum + object.weight * object.s, 0);
  if (Math.abs(moment) > 0.02) return false;
  const ordered = [...challenge.solution].sort((a, b) => a.s - b.s);
  for (let index = 1; index < ordered.length; index += 1) {
    const gap = ordered[index].s - ordered[index - 1].s;
    const need = (ordered[index].size + ordered[index - 1].size) / 2 + 0.1;
    if (gap < need) return false;
  }
  return true;
}

export function classicSeed(level) {
  return hashString(`balance-v1-level-${level}`);
}

export function endlessSeed(index, salt) {
  return hashString(`balance-endless-${salt}-${index}`);
}

export function difficultyForIndex(index) {
  if (index < 5) return index + 1;
  if (index < 12) return 6 + (index - 5);
  return Math.min(40, 16 + (index - 12));
}
