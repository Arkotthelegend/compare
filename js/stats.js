const KEY = "shadow-stats-v1";
const DAILY_KEY = "shadow-daily-v1";

function store() {
  try {
    if (typeof localStorage === "undefined") return null;
    return localStorage;
  } catch (error) {
    return null;
  }
}

function read(key, fallback) {
  const storage = store();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

function write(key, value) {
  const storage = store();
  if (!storage) return;
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // The in-memory game still works if storage is blocked.
  }
}

export function loadHistory() {
  const data = read(KEY, { rounds: [] });
  if (!data || !Array.isArray(data.rounds)) return [];
  return data.rounds;
}

export function recordRound(entry) {
  const rounds = loadHistory();
  rounds.push(entry);
  const trimmed = rounds.slice(-200);
  write(KEY, { rounds: trimmed });
  return trimmed;
}

export function profileFrom(rounds) {
  if (!rounds.length) {
    return {
      empty: true,
      count: 0,
      average: 0,
      best: 0,
      recent: 0,
      tendency: "Not enough rounds",
      bestCategory: "Play a few more rounds",
      hardestCategory: "Play a few more rounds",
      byCategory: [],
      byDifficulty: [],
    };
  }
  const scores = rounds.map((round) => round.score);
  const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  const best = Math.max(...scores);
  const recentSlice = scores.slice(-10);
  const recent = recentSlice.reduce((sum, score) => sum + score, 0) / recentSlice.length;
  const signed = rounds
    .filter((round) => round.guessM > 0 && round.actualM > 0)
    .map((round) => Math.log(round.guessM / round.actualM));
  const mean = signed.length ? signed.reduce((sum, value) => sum + value, 0) / signed.length : 0;
  let tendency = "Balanced";
  if (mean > 0.04) tendency = "Overestimation";
  else if (mean < -0.04) tendency = "Underestimation";

  const grouped = (key) => {
    const map = new Map();
    rounds.forEach((round) => {
      const name = round[key];
      const bucket = map.get(name) || { name, total: 0, count: 0 };
      bucket.total += round.score;
      bucket.count += 1;
      map.set(name, bucket);
    });
    return [...map.values()].map((bucket) => ({
      name: bucket.name,
      count: bucket.count,
      average: bucket.total / bucket.count,
    }));
  };

  const categories = grouped("category").filter((item) => item.count >= 2);
  const ranked = [...categories].sort((a, b) => b.average - a.average);
  return {
    empty: false,
    count: rounds.length,
    average,
    best,
    recent,
    tendency,
    bestCategory: ranked[0] ? labelCategory(ranked[0].name) : "Play a few more rounds",
    hardestCategory: ranked.length ? labelCategory(ranked[ranked.length - 1].name) : "Play a few more rounds",
    byCategory: grouped("category"),
    byDifficulty: grouped("difficulty"),
  };
}

export function labelCategory(name) {
  if (name === "geometric") return "Geometric objects";
  if (name === "natural") return "Natural forms";
  if (name === "architecture") return "Architecture";
  if (name === "perspective") return "Perspective";
  return name;
}

export function labelDifficulty(name) {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function loadDaily() {
  return read(DAILY_KEY, {});
}

export function saveDaily(key, result) {
  const all = loadDaily();
  all[key] = result;
  write(DAILY_KEY, all);
}

export function dailyResult(key) {
  return loadDaily()[key] || null;
}
