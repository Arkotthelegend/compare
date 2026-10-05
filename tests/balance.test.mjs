import assert from "node:assert/strict";
import test from "node:test";
import { createChallenge, classicSeed, isSolvable } from "../js/levels.js";
import { inertia, moment, sizeForWeight, stepRotation, torqueNewton } from "../js/physics.js";
import { dailySeed } from "../js/rng.js";
import { scoreAttempt, verdict } from "../js/score.js";

function placed(list) {
  return list.map((item) => ({ ...item, placed: true }));
}

test("a tipped board levels out once the torques match", () => {
  const state = {
    objects: placed([{ weight: 2, s: -2 }]),
    angle: 0,
    omega: 0,
  };
  for (let step = 0; step < 90; step += 1) stepRotation(state, 0.016);
  const tipped = state.angle;
  assert.ok(tipped < -0.2);

  state.objects.push({ weight: 4, s: 1, placed: true });
  assert.equal(moment(state.objects), 0);
  for (let step = 0; step < 160; step += 1) stepRotation(state, 0.016);
  assert.ok(Math.abs(state.angle) < 0.05, `still tipped at ${state.angle}`);
});

test("heavier blocks are drawn larger", () => {
  assert.ok(sizeForWeight(4) > sizeForWeight(2));
  assert.ok(sizeForWeight(8) > sizeForWeight(4));
  const level = createChallenge(classicSeed(1), 1);
  const light = level.objects.find((object) => object.weight === 2);
  const heavy = level.objects.find((object) => object.weight === 4);
  assert.ok(heavy.size > light.size);
});

test("equal torques cancel and unequal torque leans to the heavy side", () => {
  const balanced = placed([
    { weight: 4, s: -2 },
    { weight: 2, s: 4 },
  ]);
  assert.equal(moment(balanced), 0);
  assert.equal(torqueNewton(balanced, 0), 0);

  const heavyRight = placed([
    { weight: 4, s: -2 },
    { weight: 2, s: 3 },
  ]);
  assert.ok(moment(heavyRight) < 0);
  const state = { objects: heavyRight, angle: 0, omega: 0 };
  stepRotation(state, 0.05);
  assert.ok(state.angle < 0);

  const heavyLeft = placed([{ weight: 2, s: 4 }]);
  const right = { objects: heavyLeft, angle: 0, omega: 0 };
  stepRotation(right, 0.05);
  assert.ok(right.angle > 0);
});

test("several objects and fractional distances add as weight times distance", () => {
  const objects = placed([
    { weight: 2, s: -1.5 },
    { weight: 3, s: -1 },
    { weight: 4, s: 1.5 },
  ]);
  assert.ok(Math.abs(moment(objects) - 0) < 1e-9);
  assert.ok(inertia(objects) > 14);
});

test("off-center pivot still uses distance from the pivot", () => {
  const challenge = createChallenge(classicSeed(18), 18);
  assert.ok(isSolvable(challenge));
  const solved = challenge.solution.map((object) => ({ ...object, placed: true }));
  assert.ok(Math.abs(moment(solved)) < 0.03);
});

test("later levels are stricter and include a lock or a split weight", () => {
  let locks = 0;
  let splits = 0;
  for (let level = 3; level <= 24; level += 1) {
    const challenge = createChallenge(classicSeed(level), level);
    assert.ok(challenge.objects.length >= 3);
    assert.ok(challenge.tolerance <= 0.16);
    assert.equal(isSolvable(challenge), true);
    if (challenge.solution.some((object) => object.locked)) locks += 1;
    if (challenge.solution.some((object) => object.altWeight != null)) splits += 1;
    const alt = challenge.solution.reduce((sum, object) => sum + (object.altWeight ?? object.weight) * object.s, 0);
    assert.ok(Math.abs(alt) <= challenge.tolerance + 0.001);
  }
  assert.ok(locks >= 4);
  assert.ok(splits >= 4);
});

test("every classic level through 40 is solvable and reproducible", () => {
  for (let level = 1; level <= 40; level += 1) {
    const first = createChallenge(classicSeed(level), level);
    const second = createChallenge(classicSeed(level), level);
    assert.equal(first.objects.length, second.objects.length);
    assert.deepEqual(first.objects.map((object) => object.weight), second.objects.map((object) => object.weight));
    if (level <= 2) {
      assert.equal(first.tutorial, true);
    } else {
      assert.equal(isSolvable(first), true);
    }
  }
});

test("the same calendar day rebuilds the same daily challenge", () => {
  const day = new Date("2026-10-05T12:00:00Z");
  const later = new Date("2026-10-05T23:30:00Z");
  const first = createChallenge(dailySeed(day), 14);
  const second = createChallenge(dailySeed(later), 14);
  assert.deepEqual(first.solution, second.solution);
  const nextDay = createChallenge(dailySeed(new Date("2026-10-06T00:00:00Z")), 14);
  assert.notDeepEqual(first.solution, nextDay.solution);
});

test("score favors accuracy and perfect balance is the top band", () => {
  const perfect = scoreAttempt({ difference: 0, tolerance: 0.3, seconds: 8, moves: 2, perfectMode: false });
  const miss = scoreAttempt({ difference: 2, tolerance: 0.3, seconds: 8, moves: 2, perfectMode: false });
  assert.ok(perfect > 900);
  assert.ok(perfect > miss);
  assert.equal(verdict(0.02, 0.3), "perfect");
  assert.equal(verdict(0.2, 0.3), "balanced");
  assert.equal(verdict(1.2, 0.3), "failed");
});
