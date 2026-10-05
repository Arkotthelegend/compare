export function scoreAttempt({ difference, tolerance, seconds, moves, perfectMode }) {
  const diff = Math.abs(difference);
  const accuracy = Math.exp((perfectMode ? -10 : -1.7) * diff);
  let score = Math.round(1000 * accuracy);
  if (!perfectMode && diff <= tolerance) score = Math.max(score, 760);
  if (diff <= Math.max(0.05, tolerance * 0.2)) score = Math.max(score, 960);
  const timeCost = Math.min(30, Math.max(0, seconds - 12) * 0.6);
  const moveCost = Math.min(24, Math.max(0, moves - 4) * 3);
  score = Math.max(0, Math.min(1000, Math.round(score - timeCost - moveCost)));
  if (diff > tolerance * 3) score = Math.min(score, 180);
  return score;
}

export function starsFor({ difference, tolerance, seconds, parSeconds }) {
  const diff = Math.abs(difference);
  return {
    balanced: diff <= tolerance,
    precise: diff <= Math.max(0.05, tolerance * 0.25),
    fast: seconds <= parSeconds && diff <= tolerance,
  };
}

export function verdict(difference, tolerance) {
  const diff = Math.abs(difference);
  if (diff <= Math.max(0.05, tolerance * 0.2)) return "perfect";
  if (diff <= tolerance) return "balanced";
  if (diff <= tolerance * 2.4) return "close";
  return "failed";
}

export function verdictCopy(kind, difference) {
  if (kind === "perfect") return "Perfect.";
  if (kind === "balanced") return "Balanced.";
  if (kind === "close") return "Almost.";
  if (difference > 0) return "Too much torque on the right.";
  return "Too much torque on the left.";
}
