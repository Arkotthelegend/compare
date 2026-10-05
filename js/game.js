import { createAudio } from "./audio.js";
import { createChallenge, classicSeed, difficultyForIndex, endlessSeed } from "./levels.js";
import { isSettled, moment, stepRotation } from "./physics.js";
import { dailyKey, dailySeed, mulberry32 } from "./rng.js";
import { scoreAttempt, starsFor, verdict, verdictCopy } from "./score.js";

const VIEW_W = 1000;
const VIEW_H = 520;
const BEAM_Y = 220;
const PROGRESS_KEY = "balance-progress-v1";

const svg = document.querySelector("#board");
const scaleLayer = document.querySelector("#scale");
const beamLayer = document.querySelector("#beam");
const fulcrumLayer = document.querySelector("#fulcrum");
const ghostLayer = document.querySelector("#ghosts");
const pieceLayer = document.querySelector("#pieces");
const dragReadout = document.querySelector("#dragReadout");
const levelLabel = document.querySelector("#levelLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const timerLabel = document.querySelector("#timerLabel");
const hintLabel = document.querySelector("#hintLabel");
const checkBtn = document.querySelector("#checkBtn");
const retryBtn = document.querySelector("#retryBtn");
const nextBtn = document.querySelector("#nextBtn");
const resultPanel = document.querySelector("#resultPanel");
const resultTitle = document.querySelector("#resultTitle");
const resultCopy = document.querySelector("#resultCopy");
const resultMath = document.querySelector("#resultMath");
const resultMeta = document.querySelector("#resultMeta");
const starsEl = document.querySelector("#stars");
const homeScreen = document.querySelector("#homeScreen");
const playScreen = document.querySelector("#playScreen");
const menuBtn = document.querySelector("#menuBtn");
const soundBtn = document.querySelector("#soundBtn");
const summaryScreen = document.querySelector("#summaryScreen");
const summaryTitle = document.querySelector("#summaryTitle");
const summaryBody = document.querySelector("#summaryBody");

const audio = createAudio();

const state = {
  mode: null,
  level: 1,
  endlessIndex: 0,
  salt: 1,
  challenge: null,
  objects: [],
  angle: 0,
  omega: 0,
  phase: "home",
  moves: 0,
  startedAt: 0,
  levelScore: 0,
  total: 0,
  timeLeft: 0,
  drag: null,
  running: false,
  lastFrame: 0,
  official: true,
};

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function saveProgress(patch) {
  const next = { ...loadProgress(), ...patch };
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(next));
  } catch (error) {
    // Progress stays in memory if storage is blocked.
  }
  return next;
}

function show(screen) {
  homeScreen.hidden = screen !== "home";
  playScreen.hidden = screen !== "play";
  summaryScreen.hidden = screen !== "summary";
  menuBtn.hidden = screen === "home";
}

function layout() {
  const challenge = state.challenge;
  const margin = 64;
  const ppm = Math.min(82, (VIEW_W - margin * 2) / challenge.length);
  return {
    ppm,
    pivotX: margin + challenge.pivotFromLeft * ppm,
    beamY: BEAM_Y,
    left: -challenge.pivotFromLeft,
    right: challenge.length - challenge.pivotFromLeft,
  };
}

function formatMeters(value) {
  const signed = Math.round(value * 10) / 10;
  const body = Math.abs(signed).toFixed(1);
  if (signed < 0) return `−${body} m`;
  if (signed > 0) return `+${body} m`;
  return "0 m";
}

function formatLoad(value) {
  return `${value.toFixed(1)} kg·m`;
}

function readableSize(desiredPx) {
  const width = svg.clientWidth || 360;
  return Math.min(40, Math.max(16, (desiredPx * VIEW_W) / width));
}

function svgPoint(event) {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const matrix = svg.getScreenCTM();
  if (!matrix) return { x: 0, y: 0 };
  const local = point.matrixTransform(matrix.inverse());
  return { x: local.x, y: local.y };
}

function beamLocal(point) {
  const { pivotX, beamY } = layout();
  const dx = point.x - pivotX;
  const dy = point.y - beamY;
  const c = Math.cos(state.angle);
  const s = Math.sin(state.angle);
  return {
    x: dx * c + dy * s,
    y: -dx * s + dy * c,
  };
}

function snapMeters(meters) {
  const step = state.challenge.snap;
  const { left, right } = layout();
  const snapped = Math.round(meters / step) * step;
  return Math.min(right, Math.max(left, Math.round(snapped * 1000) / 1000));
}

function clampToBoard(object, meters) {
  const { left, right } = layout();
  const half = object.size / 2;
  const limitLeft = left + half;
  const limitRight = right - half;
  return Math.min(limitRight, Math.max(limitLeft, snapMeters(meters)));
}

function separate(objects) {
  const placed = objects.filter((object) => object.placed).sort((a, b) => a.s - b.s);
  for (let pass = 0; pass < 8; pass += 1) {
    for (let index = 1; index < placed.length; index += 1) {
      const prev = placed[index - 1];
      const current = placed[index];
      const need = (prev.size + current.size) / 2 + 0.12;
      const gap = current.s - prev.s;
      if (gap < need) {
        const push = (need - gap) / 2;
        prev.s = clampToBoard(prev, prev.s - push);
        current.s = clampToBoard(current, current.s + push);
      }
    }
  }
}

function shapeNode(object, pixels) {
  const width = object.shape === "long" || object.shape === "slab" ? pixels * 1.8 : object.shape === "rect" ? pixels * 1.35 : pixels;
  const height = object.shape === "slab" ? pixels * 0.72 : pixels;
  const node = document.createElementNS("http://www.w3.org/2000/svg", "g");
  let body;
  if (object.shape === "circle" || object.shape === "pebble") {
    body = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    body.setAttribute("r", String(Math.max(width, height) / 2));
  } else if (object.shape === "triangle") {
    body = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    body.setAttribute("points", `${-width / 2},${height / 2} ${width / 2},${height / 2} 0,${-height / 2}`);
  } else {
    body = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    body.setAttribute("x", String(-width / 2));
    body.setAttribute("y", String(-height / 2));
    body.setAttribute("width", String(width));
    body.setAttribute("height", String(height));
    body.setAttribute("rx", object.shape === "cube" || object.shape === "pebble" ? "4" : "8");
  }
  body.setAttribute("class", "mass");
  const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
  label.setAttribute("class", "mass-label");
  label.setAttribute("y", String(-height / 2 - 10));
  label.setAttribute("font-size", String(readableSize(15)));
  label.textContent = `${object.weight} kg`;
  node.append(body, label);
  node.dataset.width = String(width);
  node.dataset.height = String(height);
  return node;
}

function drawStatic() {
  const { ppm, pivotX, beamY, left, right } = layout();
  const challenge = state.challenge;
  scaleLayer.replaceChildren();
  fulcrumLayer.replaceChildren();
  ghostLayer.replaceChildren();

  for (let meter = Math.ceil(left); meter <= Math.floor(right); meter += 1) {
    const x = meter * ppm;
    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("x1", String(x));
    tick.setAttribute("x2", String(x));
    tick.setAttribute("y1", "28");
    tick.setAttribute("y2", meter === 0 ? "46" : "38");
    tick.setAttribute("class", meter === 0 ? "tick zero" : "tick");
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", String(x));
    label.setAttribute("y", "92");
    label.setAttribute("class", "tick-label");
    label.setAttribute("font-size", String(readableSize(14)));
    label.textContent = meter === 0 ? "0" : `${meter > 0 ? "+" : "−"}${Math.abs(meter)}`;
    scaleLayer.append(tick, label);
  }

  const stand = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  stand.setAttribute("points", `${pivotX - 16},${beamY + 54} ${pivotX + 16},${beamY + 54} ${pivotX},${beamY + 18}`);
  stand.setAttribute("class", "fulcrum");
  const name = document.createElementNS("http://www.w3.org/2000/svg", "text");
  name.setAttribute("x", String(pivotX));
  name.setAttribute("y", String(beamY + 72));
  name.setAttribute("class", "pivot-label");
  name.setAttribute("font-size", String(readableSize(12)));
  name.textContent = "PIVOT";
  fulcrumLayer.append(stand, name);

  if (challenge.tutorial) {
    challenge.objects.forEach((object) => {
      if (object.guide === null || object.guide === undefined) return;
      const mark = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      mark.setAttribute("cx", String(object.guide * ppm));
      mark.setAttribute("cy", "-8");
      mark.setAttribute("r", "16");
      mark.setAttribute("class", "guide");
      ghostLayer.append(mark);
    });
  }

  const board = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  const lengthPx = challenge.length * ppm;
  board.setAttribute("x", String(-challenge.pivotFromLeft * ppm));
  board.setAttribute("y", "-8");
  board.setAttribute("width", String(lengthPx));
  board.setAttribute("height", "16");
  board.setAttribute("rx", "8");
  board.setAttribute("class", "beam");
  beamLayer.replaceChildren(board);
  syncBoardTransform();
}

function syncBoardTransform() {
  const { pivotX, beamY } = layout();
  const transform = `translate(${pivotX} ${beamY}) rotate(${(state.angle * 180) / Math.PI})`;
  beamLayer.setAttribute("transform", transform);
  scaleLayer.setAttribute("transform", transform);
  ghostLayer.setAttribute("transform", transform);
}

function pieceTransform(object, node) {
  const { ppm, pivotX, beamY } = layout();
  const height = Number(node.dataset.height);
  if (state.drag && state.drag.id === object.id) {
    return `translate(${state.drag.x} ${state.drag.y})`;
  }
  if (object.placed) {
    const c = Math.cos(state.angle);
    const s = Math.sin(state.angle);
    const along = object.s * ppm;
    const lift = height / 2 + 8;
    const x = pivotX + along * c + lift * s;
    const y = beamY + along * s - lift * c;
    return `translate(${x} ${y}) rotate(${(state.angle * 180) / Math.PI})`;
  }
  const tray = state.objects.filter((item) => !item.placed);
  const index = tray.findIndex((item) => item.id === object.id);
  const gap = Math.min(150, (VIEW_W - 120) / Math.max(tray.length, 1));
  const x = VIEW_W / 2 + (index - (tray.length - 1) / 2) * gap;
  return `translate(${x} ${VIEW_H - 28 - height / 2})`;
}

function drawPieces() {
  const { ppm } = layout();
  pieceLayer.replaceChildren();
  state.objects.forEach((object) => {
    const pixels = Math.max(46, object.size * ppm);
    const node = shapeNode(object, pixels);
    node.dataset.id = object.id;
    node.setAttribute("class", state.drag && state.drag.id === object.id ? "piece selected" : "piece");
    node.setAttribute("transform", pieceTransform(object, node));
    pieceLayer.append(node);
  });
}

function updateTransforms() {
  syncBoardTransform();
  [...pieceLayer.children].forEach((node) => {
    const object = state.objects.find((item) => item.id === node.dataset.id);
    if (!object) return;
    node.setAttribute("transform", pieceTransform(object, node));
    node.setAttribute("class", state.drag && state.drag.id === object.id ? "piece selected" : "piece");
  });
  const calm = Math.abs(moment(state.objects)) <= state.challenge.tolerance && Math.abs(state.angle) < 0.06;
  beamLayer.classList.toggle("calm", calm && state.objects.some((object) => object.placed));
  syncPlaceGuide();
}

function syncPlaceGuide() {
  const existing = beamLayer.querySelector("#placeGuide");
  if (!state.drag || state.phase !== "play") {
    existing?.remove();
    return;
  }
  const object = state.objects.find((item) => item.id === state.drag.id);
  if (!object) return;
  const local = beamLocal({ x: state.drag.x, y: state.drag.y });
  const { ppm } = layout();
  const meters = clampToBoard(object, local.x / ppm);
  const x = meters * ppm;
  const guide = existing || document.createElementNS("http://www.w3.org/2000/svg", "line");
  guide.id = "placeGuide";
  guide.setAttribute("x1", String(x));
  guide.setAttribute("x2", String(x));
  guide.setAttribute("y1", "-10");
  guide.setAttribute("y2", "-52");
  guide.setAttribute("class", "place-guide");
  if (!existing) beamLayer.append(guide);
}

function updateHud() {
  const names = {
    classic: `Level ${state.level}`,
    endless: `Endless ${state.endlessIndex + 1}`,
    time: "Time attack",
    perfect: `Perfect ${state.level}`,
    daily: "Daily",
  };
  levelLabel.textContent = names[state.mode] || "";
  scoreLabel.textContent = String(state.mode === "classic" || state.mode === "perfect" ? state.levelScore : state.total);
  if (state.mode === "time") {
    const seconds = Math.max(0, Math.ceil(state.timeLeft));
    timerLabel.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
  } else {
    timerLabel.textContent = "";
  }
  hintLabel.textContent = state.challenge.hint || "Drag every weight onto the beam. Distance is measured from the pivot.";
}

function render() {
  drawStatic();
  drawPieces();
  updateHud();
}

function startLoop() {
  if (state.running) return;
  state.running = true;
  state.lastFrame = performance.now();
  requestAnimationFrame(frame);
}

function frame(now) {
  if (!state.running) return;
  const dt = Math.min(0.033, (now - state.lastFrame) / 1000);
  state.lastFrame = now;
  if (state.phase === "play" || state.phase === "checking") stepRotation(state, dt);
  updateTransforms();
  if (state.mode === "time" && (state.phase === "play" || state.phase === "checking")) {
    state.timeLeft -= dt;
    updateHud();
    if (state.timeLeft <= 0) {
      state.timeLeft = 0;
      finishTime();
      return;
    }
  }
  const moving = Math.abs(state.omega) > 0.01 || Math.abs(state.angle) > 0.004;
  if (state.phase === "checking" && isSettled(state) && performance.now() - state.checkStarted > 350) {
    state.running = false;
    finishCheck();
    return;
  }
  const ticking = state.mode === "time" && state.phase === "play";
  if (state.phase === "checking" || moving || ticking || state.drag) requestAnimationFrame(frame);
  else state.running = false;
}

function beginChallenge(challenge) {
  state.challenge = challenge;
  state.objects = challenge.objects.map((object) => ({ ...object, placed: false, s: null }));
  state.angle = 0;
  state.omega = 0;
  state.phase = "play";
  state.moves = 0;
  state.startedAt = performance.now();
  state.levelScore = 0;
  resultPanel.hidden = true;
  checkBtn.disabled = false;
  nextBtn.hidden = true;
  dragReadout.textContent = "";
  show("play");
  render();
  startLoop();
}

function startMode(mode) {
  state.official = true;
  state.mode = mode;
  state.total = 0;
  if (mode === "classic" || mode === "perfect") {
    const saved = loadProgress();
    state.level = mode === "classic" ? saved.classicLevel || 1 : saved.perfectLevel || 1;
    const level = createChallenge(classicSeed(state.level), state.level);
    if (mode === "perfect") level.tolerance = 0.08;
    beginChallenge(level);
    return;
  }
  if (mode === "endless") {
    state.endlessIndex = 0;
    state.salt = Math.floor(Math.random() * 1e9);
    const levelNumber = difficultyForIndex(0);
    beginChallenge(createChallenge(endlessSeed(0, state.salt), levelNumber));
    return;
  }
  if (mode === "time") {
    state.endlessIndex = 0;
    state.salt = Math.floor(Math.random() * 1e9);
    state.timeLeft = 90;
    beginChallenge(createChallenge(endlessSeed(0, state.salt), difficultyForIndex(0)));
    return;
  }
  if (mode === "daily") {
    const key = dailyKey(new Date());
    const saved = loadProgress().daily;
    if (saved && saved.date === key) {
      showSummary("Daily challenge", `Today is already saved.\nScore ${saved.score}\nTorque difference ${saved.difference.toFixed(2)} kg·m`);
      return;
    }
    const level = createChallenge(dailySeed(new Date()), 14);
    level.hint = `Daily challenge ${key}. Everyone has this same seesaw today.`;
    beginChallenge(level);
  }
}

function objectFromEvent(event) {
  const node = event.target.closest?.("[data-id]");
  if (!node) return null;
  return state.objects.find((object) => object.id === node.dataset.id) || null;
}

function onPointerDown(event) {
  if (state.phase !== "play") return;
  const object = objectFromEvent(event);
  if (!object) return;
  event.preventDefault();
  const point = svgPoint(event);
  state.drag = { id: object.id, pointerId: event.pointerId, x: point.x, y: point.y };
  if (object.placed) {
    object.placed = false;
    object.s = null;
    state.moves += 1;
  }
  audio.pickup();
  startLoop();
}

function onPointerMove(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const point = svgPoint(event);
  state.drag.x = point.x;
  state.drag.y = point.y;
  const local = beamLocal(point);
  const { ppm } = layout();
  const object = state.objects.find((item) => item.id === state.drag.id);
  const meters = clampToBoard(object, local.x / ppm);
  dragReadout.textContent = formatMeters(meters);
  dragReadout.setAttribute("x", String(point.x));
  dragReadout.setAttribute("y", String(point.y - 36));
  dragReadout.setAttribute("font-size", String(readableSize(16)));
  updateTransforms();
}

function onPointerUp(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  const object = state.objects.find((item) => item.id === state.drag.id);
  const point = svgPoint(event);
  const local = beamLocal(point);
  const { ppm, left, right } = layout();
  const nearBeam = local.y > -70 && local.y < 46 && local.x / ppm > left - 0.4 && local.x / ppm < right + 0.4;
  if (nearBeam) {
    object.placed = true;
    object.s = clampToBoard(object, local.x / ppm);
    separate(state.objects);
    audio.place();
  }
  state.drag = null;
  dragReadout.textContent = "";
  state.moves += 1;
  drawPieces();
  startLoop();
}

function checkBalance() {
  if (state.phase !== "play") return;
  if (state.objects.some((object) => !object.placed)) {
    hintLabel.textContent = "Place every object on the seesaw.";
    return;
  }
  state.phase = "checking";
  state.checkStarted = performance.now();
  checkBtn.disabled = true;
  startLoop();
}

function finishCheck() {
  const difference = moment(state.objects);
  const tolerance = state.challenge.tolerance;
  const seconds = (performance.now() - state.startedAt) / 1000;
  const kind = verdict(difference, tolerance);
  const passed = kind === "perfect" || kind === "balanced" || (kind === "close" && state.mode !== "perfect");
  const perfectPassed = state.mode !== "perfect" || kind === "perfect" || kind === "balanced";
  const success = state.mode === "perfect" ? perfectPassed && Math.abs(difference) <= tolerance : passed;
  const score = scoreAttempt({
    difference,
    tolerance,
    seconds,
    moves: state.moves,
    perfectMode: state.mode === "perfect",
  });
  const stars = starsFor({ difference, tolerance, seconds, parSeconds: state.challenge.par });
  state.levelScore = success ? score : Math.min(score, 240);
  state.phase = "result";
  checkBtn.disabled = false;
  showResult(kind, difference, stars, seconds);
  if (success) {
    audio.success();
    state.total += state.levelScore;
    rememberProgress(stars);
    nextBtn.hidden = false;
  } else {
    audio.fail();
    nextBtn.hidden = true;
  }
  updateHud();
}

function rememberProgress(stars) {
  const saved = loadProgress();
  if (state.mode === "classic") {
    const table = saved.stars || {};
    const previous = table[state.level] || {};
    table[state.level] = {
      balanced: previous.balanced || stars.balanced,
      precise: previous.precise || stars.precise,
      fast: previous.fast || stars.fast,
    };
    saveProgress({ classicLevel: Math.max(saved.classicLevel || 1, state.level + 1), stars: table });
  }
  if (state.mode === "perfect") {
    saveProgress({ perfectLevel: Math.max(saved.perfectLevel || 1, state.level + 1) });
  }
  if (state.mode === "daily" && state.official) {
    saveProgress({
      daily: { date: dailyKey(new Date()), score: state.levelScore, difference: moment(state.objects) },
    });
  }
}

function showResult(kind, difference, stars, seconds) {
  const titles = { perfect: "Perfect", balanced: "Balanced", close: "Almost", failed: "Not yet" };
  resultTitle.textContent = titles[kind];
  resultCopy.textContent = verdictCopy(kind, difference);
  resultMath.replaceChildren();
  const groups = { left: [], right: [] };
  state.objects.forEach((object) => {
    const row = document.createElement("p");
    const load = object.weight * object.s;
    row.textContent = `${object.weight} kg × ${formatMeters(object.s)} = ${formatLoad(Math.abs(load))}`;
    if (object.s < 0) groups.left.push(row);
    else groups.right.push(row);
  });
  const leftTitle = document.createElement("p");
  leftTitle.className = "math-label";
  leftTitle.textContent = "Left";
  const rightTitle = document.createElement("p");
  rightTitle.className = "math-label";
  rightTitle.textContent = "Right";
  resultMath.append(leftTitle, ...groups.left, rightTitle, ...groups.right);
  const differenceLine = document.createElement("p");
  differenceLine.textContent = `Difference ${formatLoad(Math.abs(difference))}`;
  resultMath.append(differenceLine);
  resultMeta.textContent = `Score ${state.levelScore} · ${seconds.toFixed(0)} s · ${state.moves} moves`;
  starsEl.textContent = `${stars.balanced ? "★" : "☆"} Balanced  ${stars.precise ? "★" : "☆"} Precise  ${stars.fast ? "★" : "☆"} Fast`;
  resultPanel.hidden = false;
  if (state.challenge.tutorial && (kind === "perfect" || kind === "balanced")) {
    resultCopy.textContent = `${verdictCopy(kind, difference)} Weight times distance is the whole rule.`;
  }
}

function nextChallenge() {
  if (state.mode === "classic" || state.mode === "perfect") {
    state.level += 1;
    const level = createChallenge(classicSeed(state.level), state.level);
    if (state.mode === "perfect") level.tolerance = 0.08;
    beginChallenge(level);
    return;
  }
  if (state.mode === "endless" || state.mode === "time") {
    state.endlessIndex += 1;
    const levelNumber = difficultyForIndex(state.endlessIndex);
    beginChallenge(createChallenge(endlessSeed(state.endlessIndex, state.salt), levelNumber));
    return;
  }
  if (state.mode === "daily") {
    showSummary("Daily challenge", `Score ${state.total}\nSaved for ${dailyKey(new Date())}.`);
  }
}

function finishTime() {
  state.phase = "result";
  state.running = false;
  audio.complete();
  showSummary("Time attack", `Score ${state.total}\nChallenges cleared ${state.endlessIndex}`);
}

function showSummary(title, body) {
  summaryTitle.textContent = title;
  summaryBody.textContent = body;
  show("summary");
  levelLabel.textContent = "";
  scoreLabel.textContent = "";
  timerLabel.textContent = "";
}

function retry() {
  if (!state.challenge) return;
  beginChallenge(state.challenge);
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => startMode(button.dataset.mode));
});

svg.addEventListener("pointerdown", onPointerDown);
window.addEventListener("pointermove", onPointerMove);
window.addEventListener("pointerup", onPointerUp);
window.addEventListener("pointercancel", onPointerUp);
checkBtn.addEventListener("click", checkBalance);
retryBtn.addEventListener("click", retry);
nextBtn.addEventListener("click", nextChallenge);
menuBtn.addEventListener("click", () => {
  state.running = false;
  state.phase = "home";
  show("home");
});
soundBtn.addEventListener("click", () => {
  const on = audio.toggle();
  soundBtn.textContent = on ? "Sound on" : "Sound off";
});
document.querySelector("#summaryHome").addEventListener("click", () => show("home"));
document.querySelector("#dailyReplay").addEventListener("click", () => {
  state.official = false;
  const level = createChallenge(dailySeed(new Date()), 14);
  level.hint = "Practice replay. Today's official score stays saved.";
  beginChallenge(level);
});

show("home");
soundBtn.textContent = audio.isOn() ? "Sound on" : "Sound off";
window.addEventListener("resize", () => {
  if (state.phase === "play" || state.phase === "checking" || state.phase === "result") render();
});
