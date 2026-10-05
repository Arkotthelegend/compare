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

function pickWeight(rng, halves) {
  const pool = halves
    ? [1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6, 7, 8, 9]
    : [1, 2, 3, 4, 5, 6, 7, 8];
  return pool[Math.floor(rng() * pool.length)];
}

function quantizeWeight(value, halves) {
  const quantum = halves ? 0.5 : 1;
  return Math.round(Math.round(value / quantum) * quantum * 10) / 10;
}

function settingsFor(level) {
  if (level <= 4) return { snap: 0.5, tolerance: 0.16, count: 3, halves: false, anchor: false, chance: false, par: 40 };
  if (level <= 8) return { snap: 0.5, tolerance: 0.1, count: 3, halves: true, anchor: false, chance: true, par: 50 };
  if (level <= 16) return { snap: 0.5, tolerance: 0.08, count: 4, halves: true, anchor: true, chance: true, par: 60 };
  if (level <= 30) return { snap: 0.25, tolerance: 0.06, count: 4, halves: true, anchor: true, chance: true, par: 70 };
  return { snap: 0.25, tolerance: 0.04, count: 5, halves: true, anchor: true, chance: true, par: 80 };
}

function emptyChallenge(partial) {
  return {
    length: 44,
    pivotFromLeft: 22,
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
  const length = 44;
  const pivotFromLeft = 22;
  const placed = [];
  const objects = [];
  if (settings.chance) {
    const pairs = [[2, 5], [1, 4], [3, 6], [1.5, 4.5], [2.5, 6.5]];
    const pair = pairs[Math.floor(rng() * pairs.length)];
    const size = sizeForWeight(pair[1]);
    if (!overlaps(0, size, placed)) {
      const chance = { weight: pair[0], altWeight: pair[1], size, s: 0, chance: true };
      placed.push(chance);
      objects.push(chance);
    }
  }
  const count = settings.count;
  const free = count - 1;
  for (let index = 0; index < free; index += 1) {
    const sign = index % 2 === 0 ? -1 : 1;
    const maxReach = reachFor(length, pivotFromLeft, sign);
    let stored = null;
    for (let attempt = 0; attempt < 28; attempt += 1) {
      const weight = pickWeight(rng, settings.halves);
      const size = sizeForWeight(weight);
      const steps = Math.max(1, Math.floor((maxReach - size / 2) / settings.snap));
      const dist = settings.snap * (1 + Math.floor(rng() * steps));
      const s = snapValue(sign * dist, settings.snap);
      if (Math.abs(s) < settings.snap / 2) continue;
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
    const rounded = quantizeWeight(target / s, settings.halves);
    if (rounded < 1 || rounded > 12) continue;
    if (Math.abs(target / s - rounded) > 0.001) continue;
    const size = sizeForWeight(rounded);
    if (overlaps(s, size, placed)) continue;
    options.push({ weight: rounded, size, s });
  }
  if (!options.length) return null;
  objects.push(options[Math.floor(rng() * options.length)]);

  const moment = objects.reduce((sum, object) => sum + object.weight * object.s, 0);
  if (Math.abs(moment) > 0.02) return null;
  const spread = objects.some((object) => object.altWeight != null)
    ? objects.reduce((sum, object) => sum + (object.altWeight ?? object.weight) * object.s, 0)
    : moment;
  if (Math.abs(spread) > settings.tolerance) return null;

  if (settings.anchor) {
    const candidates = objects.filter((object) => !object.chance && Math.abs(object.s) >= 1);
    if (!candidates.length) return null;
    candidates.sort((a, b) => Math.abs(b.weight * b.s) - Math.abs(a.weight * a.s));
    candidates[0].locked = true;
  }

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
      altWeight: object.altWeight ?? null,
      size: object.size,
      locked: Boolean(object.locked),
      s: object.locked ? object.s : null,
      guide: null,
    })),
    solution: objects.map((object) => ({
      weight: object.weight,
      altWeight: object.altWeight ?? null,
      s: object.s,
      size: object.size,
      locked: Boolean(object.locked),
    })),
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
  const base = challenge.solution.reduce((sum, object) => sum + object.weight * object.s, 0);
  const alt = challenge.solution.reduce((sum, object) => sum + (object.altWeight ?? object.weight) * object.s, 0);
  if (Math.abs(base) > 0.02 || Math.abs(alt) > challenge.tolerance + 0.001) return false;
  const ordered = [...challenge.solution].sort((a, b) => a.s - b.s);
  for (let index = 1; index < ordered.length; index += 1) {
    const gap = ordered[index].s - ordered[index - 1].s;
    const need = (ordered[index].size + ordered[index - 1].size) / 2 + 0.1;
    if (gap < need) return false;
  }
  return true;
}

export function describeChallenge(challenge) {
  if (challenge.hint) return challenge.hint;
  const notes = [];
  if (challenge.objects.some((object) => object.locked)) notes.push("The locked block stays put.");
  if (challenge.objects.some((object) => object.altWeight != null)) notes.push("The split block must balance at both weights.");
  return notes.join(" ") || "Drag every weight onto the beam. Distance is measured from the pivot.";
}

export function classicSeed(level) {
  return hashString(`balance-v1-level-${level}`);
}

export function endlessSeed(index, salt) {
  return hashString(`balance-endless-${salt}-${index}`);
}

export function difficultyForIndex(index) {
  return Math.min(42, 4 + index * 2);
}
