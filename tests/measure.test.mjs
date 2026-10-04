import assert from "node:assert/strict";
import test from "node:test";
import { differenceCm, explain, percentageError, recoveredHeight, scoreGuess, toMeters } from "../js/measure.js";
import { dailySeed, mulberry32 } from "../js/rng.js";
import { buildSession, createRound, tryRound } from "../js/rounds.js";
import { SHAPE_POOL } from "../js/shapes.js";
import { createMatch, judge } from "../js/duel.js";
import { shareText } from "../js/solution.js";

test("score is 1000 for an exact height and symmetric for proportional misses", () => {
  assert.equal(scoreGuess(1.25, 1.25), 1000);
  const low = scoreGuess(1.2, 1.25);
  const high = scoreGuess(1.25 * (1.25 / 1.2), 1.25);
  assert.equal(low, high);
  assert.equal(low, 849);
  assert.equal(scoreGuess(0, 1), 0);
  assert.equal(scoreGuess(-1, 1), 0);
  assert.ok(scoreGuess(100, 1) >= 0 && scoreGuess(100, 1) <= 1000);
});

test("units and displayed error agree with the score inputs", () => {
  assert.equal(toMeters(125, "cm"), 1.25);
  assert.equal(toMeters(1.25, "m"), 1.25);
  assert.ok(Math.abs(differenceCm(1.2, 1.25) - 5) < 1e-9);
  assert.ok(Math.abs(percentageError(1.2, 1.25) - 4) < 1e-9);
  assert.equal(scoreGuess(toMeters(120, "cm"), toMeters(125, "cm")), 849);
});

test("generated scenes recover height from shadow geometry", () => {
  const rng = mulberry32(20261004);
  for (let i = 0; i < 40; i += 1) {
    const difficulty = ["beginner", "intermediate", "advanced", "expert"][i % 4];
    const round = createRound(rng, difficulty);
    assert.ok(round.height > 0.3 && round.height < 12);
    assert.ok(round.light.y > round.height);
    const info = explain(round);
    assert.ok(Math.abs(info.markerRecovered - 1) < 0.03);
    assert.ok(Math.abs(recoveredHeight(round.shadow, round.light) - round.shadow.source.y) < 0.03);
    if (round.shape !== "sphere") {
      assert.ok(info.topCastsTip, `${round.shape} tip should be cast by the top`);
      assert.ok(Math.abs(info.recovered - round.height) < 0.03);
    } else {
      assert.ok(round.shadow.source.y <= round.height + 0.02);
    }
    assert.equal(round.position.y, 0);
  }
});

test("every shape can produce a fair scene", () => {
  for (const [difficulty, shapes] of Object.entries(SHAPE_POOL)) {
    for (const shape of shapes) {
      const rng = mulberry32(hashShape(difficulty, shape));
      let found = null;
      for (let i = 0; i < 120 && !found; i += 1) found = tryRound(rng, difficulty, shape);
      assert.ok(found, `${difficulty} ${shape} should be solvable`);
    }
  }
});

function hashShape(difficulty, shape) {
  let h = 2166136261;
  const text = `${difficulty}:${shape}`;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

test("daily sessions are deterministic and five rounds long", () => {
  const first = buildSession("daily", mulberry32(dailySeed(new Date("2026-10-04T15:00:00Z"))));
  const second = buildSession("daily", mulberry32(dailySeed(new Date("2026-10-04T23:00:00Z"))));
  assert.equal(first.length, 5);
  assert.deepEqual(first.map((round) => round.height), second.map((round) => round.height));
  assert.deepEqual(first.map((round) => round.light), second.map((round) => round.light));
  const other = buildSession("daily", mulberry32(dailySeed(new Date("2026-10-05T00:00:00Z"))));
  assert.notDeepEqual(first.map((round) => round.height), other.map((round) => round.height));
});

test("duel matches share a seed and judge accuracy", () => {
  const a = createMatch(99);
  const b = createMatch(99);
  assert.equal(a.scene.height, b.scene.height);
  assert.deepEqual(a.scene.light, b.scene.light);
  assert.deepEqual(judge({ score: 800 }, { score: 640 }), { result: "a", margin: 160 });
  assert.equal(judge({ score: 500 }, { score: 500 }).result, "tie");
});

test("share card uses the session total", () => {
  assert.equal(shareText(4215, 5000), "SHADOW\nYOUR SCORE\n4,215 / 5,000\nCan you beat my visual intuition?");
});
