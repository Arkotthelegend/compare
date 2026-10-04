import { mulberry32 } from "./rng.js";
import { createRound } from "./rounds.js";

export function createMatch(seed) {
  const rng = mulberry32(seed >>> 0);
  const scene = createRound(rng, "intermediate");
  scene.mode = "duel";
  return {
    version: 1,
    seed: seed >>> 0,
    scene,
  };
}

export function judge(playerA, playerB) {
  const margin = Math.abs(playerA.score - playerB.score);
  if (playerA.score === playerB.score) return { result: "tie", margin: 0 };
  return {
    result: playerA.score > playerB.score ? "a" : "b",
    margin,
  };
}
