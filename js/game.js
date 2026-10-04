const MIN_M = 0.001;
const MAX_M = 100;
const SLIDER_STEPS = 10000;
const ROUND_COUNT = 8;
const BEST_KEY = "size-compare-best";

const stageEl = document.querySelector("#stage");
const personEl = document.querySelector("#person");
const objectEl = document.querySelector("#object");
const ghostEl = document.querySelector("#ghost");
const handleEl = document.querySelector("#handle");
const loupeEl = document.querySelector("#loupe");
const loupeArtEl = document.querySelector("#loupeArt");
const personLabelEl = document.querySelector("#personLabel");
const objectLabelEl = document.querySelector("#objectLabel");
const readoutEl = document.querySelector("#readout");
const readoutCaptionEl = document.querySelector("#readoutCaption");
const questionEl = document.querySelector("#question");
const measureHintEl = document.querySelector("#measureHint");
const roundLabelEl = document.querySelector("#roundLabel");
const bestLabelEl = document.querySelector("#bestLabel");
const helpEl = document.querySelector("#help");
const lockBtn = document.querySelector("#lockBtn");
const nextBtn = document.querySelector("#nextBtn");
const revealCardEl = document.querySelector("#revealCard");
const scoreNumEl = document.querySelector("#scoreNum");
const scoreLabelEl = document.querySelector("#scoreLabel");
const compareLineEl = document.querySelector("#compareLine");
const factLineEl = document.querySelector("#factLine");
const startScreenEl = document.querySelector("#startScreen");
const playScreenEl = document.querySelector("#playScreen");
const resultsScreenEl = document.querySelector("#resultsScreen");
const startBestEl = document.querySelector("#startBest");
const totalScoreEl = document.querySelector("#totalScore");
const totalSubEl = document.querySelector("#totalSub");
const totalBlurbEl = document.querySelector("#totalBlurb");
const newBestEl = document.querySelector("#newBest");
const recapEl = document.querySelector("#recap");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  phase: "start",
  rounds: [],
  index: 0,
  reference: PERSON,
  object: null,
  guess: 1,
  displayMeters: 1,
  lockedGuess: null,
  total: 0,
  results: [],
  best: readBest(),
  animToken: 0,
};

let drag = null;

function readBest() {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    if (raw === null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  } catch (error) {
    return null;
  }
}

function writeBest(value) {
  try {
    localStorage.setItem(BEST_KEY, String(value));
  } catch (error) {
    // Ignore storage failures; the in-memory best still updates.
  }
}

function clampMeters(meters) {
  return Math.min(MAX_M, Math.max(MIN_M, meters));
}

function sliderToMeters(t) {
  const amount = Math.min(1, Math.max(0, t));
  return Math.exp(Math.log(MIN_M) + amount * (Math.log(MAX_M) - Math.log(MIN_M)));
}

function metersToSlider(meters) {
  return (Math.log(clampMeters(meters)) - Math.log(MIN_M)) / (Math.log(MAX_M) - Math.log(MIN_M));
}

function scoreFor(guess, actual) {
  const ratio = guess / actual;
  return Math.round(100 * Math.pow(0.5, Math.abs(Math.log2(ratio))));
}

function scoreLabel(score) {
  if (score >= 95) return "Perfect";
  if (score >= 80) return "So close";
  if (score >= 60) return "Pretty good";
  if (score >= 30) return "Not quite";
  return "Way off";
}

function formatSize(meters) {
  let value;
  let unit;
  if (meters < 0.01) {
    value = meters * 1000;
    unit = "mm";
  } else if (meters < 1) {
    value = meters * 100;
    unit = "cm";
  } else {
    value = meters;
    unit = "m";
  }
  const digits = value >= 10 ? 1 : 2;
  const text = value
    .toFixed(digits)
    .replace(/(\.\d*?)0+$/, "$1")
    .replace(/\.$/, "");
  return `${text} ${unit}`;
}

function ratioText(guess, actual) {
  const ratio = guess / actual;
  if (ratio >= 0.98 && ratio <= 1.02) return "Right on the real size";
  const factor = ratio > 1 ? ratio : 1 / ratio;
  const digits = factor >= 10 ? 0 : 1;
  const amount = factor.toFixed(digits);
  return ratio > 1 ? `${amount}× too big` : `${amount}× too small`;
}

function parseViewBox(viewBox) {
  const parts = viewBox.split(/[\s,]+/).map(Number);
  return { w: parts[2], h: parts[3] };
}

function dimsFor(spec, meters) {
  const box = parseViewBox(spec.viewBox);
  if (spec.axis === "height") {
    return { w: meters * (box.w / box.h), h: meters };
  }
  return { w: meters, h: meters * (box.h / box.w) };
}

function svgMarkup(spec) {
  return `<svg viewBox="${spec.viewBox}" fill="currentColor" preserveAspectRatio="none" aria-hidden="true">${spec.shape}</svg>`;
}

function shuffle(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function randomStart(actual) {
  let meters = sliderToMeters(Math.random());
  for (let i = 0; i < 30; i += 1) {
    meters = sliderToMeters(Math.random());
    const ratio = meters / actual;
    if (ratio < 0.8 || ratio > 1.25) return meters;
  }
  return meters;
}

function questionFor(target, reference) {
  const how = target.measure === "length" ? "long" : "tall";
  if (reference.id === "person") return `How ${how} is ${target.noun}?`;
  return `How ${how} is ${target.noun} next to ${reference.noun}?`;
}

function buildRounds() {
  const pool = shuffle(OBJECTS);
  const rounds = [];
  for (let i = 0; i < 4; i += 1) {
    rounds.push({ reference: PERSON, target: pool[i] });
  }
  for (let i = 4; i + 1 < pool.length && rounds.length < ROUND_COUNT; i += 2) {
    rounds.push({ reference: pool[i], target: pool[i + 1] });
  }
  return shuffle(rounds);
}

function setPhase(phase) {
  state.phase = phase;
  document.body.dataset.phase = phase;
  startScreenEl.hidden = phase !== "start";
  playScreenEl.hidden = phase === "start" || phase === "results";
  resultsScreenEl.hidden = phase !== "results";
}

function renderBest() {
  bestLabelEl.textContent = state.best === null ? "Best —" : `Best ${state.best}`;
  startBestEl.textContent = state.best === null ? "" : `Best score ${state.best} / 800`;
}

function setGuess(meters) {
  if (state.phase !== "play") return;
  state.guess = clampMeters(meters);
  state.displayMeters = state.guess;
  const step = String(Math.round(metersToSlider(state.guess) * SLIDER_STEPS));
  handleEl.setAttribute("aria-valuemin", "0");
  handleEl.setAttribute("aria-valuemax", String(SLIDER_STEPS));
  handleEl.setAttribute("aria-valuenow", step);
  handleEl.setAttribute("aria-valuetext", formatSize(state.guess));
  readoutEl.textContent = formatSize(state.guess);
  layout();
}

function nudge(deltaT) {
  setGuess(sliderToMeters(metersToSlider(state.guess) + deltaT));
}

function layout() {
  if (playScreenEl.hidden) return;
  const availW = stageEl.clientWidth - 48;
  const ground = Number.parseFloat(getComputedStyle(stageEl).getPropertyValue("--ground")) || 56;
  const availH = stageEl.clientHeight - ground - 24;
  if (availW < 20 || availH < 20 || !state.object) return;

  const showGhost = state.phase === "reveal";
  const reference = state.reference || PERSON;
  const personBox = dimsFor(reference, reference.meters);
  const objectBox = dimsFor(state.object, state.displayMeters);
  const ghostBox = showGhost ? dimsFor(state.object, state.lockedGuess) : null;
  const objectSpanW = Math.max(objectBox.w, ghostBox ? ghostBox.w : 0);
  const objectSpanH = Math.max(objectBox.h, ghostBox ? ghostBox.h : 0);
  const gapM = 0.22 * Math.max(personBox.h, objectSpanH);
  const totalW = personBox.w + gapM + objectSpanW;
  const totalH = Math.max(personBox.h, objectSpanH);
  const ppm = Math.min(availW / totalW, availH / totalH);

  const personW = personBox.w * ppm;
  const personH = personBox.h * ppm;
  const objectW = objectBox.w * ppm;
  const objectH = objectBox.h * ppm;
  const ghostW = ghostBox ? ghostBox.w * ppm : 0;
  const ghostH = ghostBox ? ghostBox.h * ppm : 0;
  const slotW = Math.max(objectW, ghostW);
  const usedW = personW + gapM * ppm + slotW;
  let x = 24 + (availW - usedW) / 2;

  place(personEl, x, personW, personH);
  const personLeft = x;
  x += personW + gapM * ppm;
  const objectLeft = x + (slotW - objectW) / 2;
  place(objectEl, objectLeft, objectW, objectH);
  if (showGhost) {
    ghostEl.hidden = false;
    place(ghostEl, x + (slotW - ghostW) / 2, ghostW, ghostH);
  } else {
    ghostEl.hidden = true;
  }

  const objectTop = stageEl.clientHeight - ground - objectH;
  const objectCenter = objectLeft + objectW / 2;

  const handleSize = 40;
  const primary = state.object.axis === "height" ? objectH : objectW;
  let handleLeft = objectLeft + objectW - handleSize * 0.35;
  let handleTop = objectTop - handleSize * 0.65;

  if (primary < 40) {
    loupeEl.hidden = false;
    const loupeSize = 104;
    let left = objectCenter - loupeSize * 0.42;
    let top = objectTop - loupeSize - 52;
    if (top < 12) top = 12;
    left = Math.min(Math.max(8, left), stageEl.clientWidth - loupeSize - 8);
    loupeEl.style.left = `${left}px`;
    loupeEl.style.top = `${top}px`;
    handleLeft = left + loupeSize - handleSize * 0.4;
    handleTop = top - handleSize * 0.4;
  } else {
    loupeEl.hidden = true;
  }

  handleLeft = Math.min(Math.max(8, handleLeft), stageEl.clientWidth - handleSize - 8);
  handleTop = Math.min(Math.max(8, handleTop), stageEl.clientHeight - handleSize - 8);
  handleEl.hidden = state.phase !== "play";
  handleEl.style.left = `${handleLeft}px`;
  handleEl.style.top = `${handleTop}px`;

  placeLabel(personLabelEl, personLeft + personW / 2, stageEl.clientHeight - ground + 8);
  placeLabel(objectLabelEl, objectCenter, stageEl.clientHeight - ground + 8);

  stageEl.setAttribute(
    "aria-label",
    `${state.object.title} scaled next to ${reference.title}, shown at ${formatSize(reference.meters)}. Current scale ${formatSize(state.guess)}.`
  );
}

function place(el, left, width, height) {
  el.style.left = `${left}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
}

function placeLabel(el, center, top) {
  el.style.left = `${center}px`;
  el.style.top = `${top}px`;
}

function renderObjectArt() {
  const markup = svgMarkup(state.object);
  objectEl.innerHTML = markup;
  ghostEl.innerHTML = markup;
  loupeArtEl.innerHTML = markup;
  objectEl.style.color = state.object.color;
  loupeEl.style.color = state.object.color;
  const box = parseViewBox(state.object.viewBox);
  const primary = 72;
  if (state.object.axis === "height") {
    loupeArtEl.style.height = `${primary}px`;
    loupeArtEl.style.width = `${primary * (box.w / box.h)}px`;
  } else {
    loupeArtEl.style.width = `${primary}px`;
    loupeArtEl.style.height = `${primary * (box.h / box.w)}px`;
  }
}

function beginRound() {
  state.animToken += 1;
  const round = state.rounds[state.index];
  state.reference = round.reference;
  state.object = round.target;
  state.lockedGuess = null;
  setPhase("play");
  questionEl.textContent = questionFor(state.object, state.reference);
  measureHintEl.textContent = state.reference.id === "person"
    ? state.object.hint
    : `${state.object.hint}. ${state.reference.title} is shown at its real size.`;
  roundLabelEl.textContent = `Round ${state.index + 1} / ${ROUND_COUNT}`;
  readoutCaptionEl.textContent = "your scale";
  personLabelEl.textContent = `${state.reference.title} (${formatSize(state.reference.meters)})`;
  objectLabelEl.textContent = state.object.title;
  personEl.innerHTML = svgMarkup(state.reference);
  personEl.style.color = "#4da3ff";
  helpEl.hidden = false;
  revealCardEl.hidden = true;
  lockBtn.hidden = false;
  nextBtn.hidden = true;
  renderObjectArt();
  setGuess(randomStart(state.object.meters));
}

function lockIn() {
  if (state.phase !== "play") return;
  drag = null;
  state.lockedGuess = state.guess;
  const actual = state.object.meters;
  const score = scoreFor(state.lockedGuess, actual);
  state.total += score;
  state.results.push({
    title: state.object.title,
    score,
    label: scoreLabel(score),
  });
  setPhase("reveal");
  helpEl.hidden = true;
  lockBtn.hidden = true;
  nextBtn.hidden = false;
  nextBtn.textContent = state.index + 1 >= ROUND_COUNT ? "See results" : "Next round";
  readoutCaptionEl.textContent = "your guess";
  const label = scoreLabel(score);
  scoreNumEl.textContent = String(score);
  scoreNumEl.dataset.band = label;
  scoreLabelEl.textContent = label;
  scoreLabelEl.dataset.band = label;
  compareLineEl.textContent = `You guessed ${formatSize(state.lockedGuess)}. The real ${state.object.measure} is ${formatSize(actual)}. ${ratioText(state.lockedGuess, actual)}.`;
  factLineEl.textContent = state.object.note;
  revealCardEl.hidden = false;
  handleEl.hidden = true;
  animateToActual();
}

function animateToActual() {
  const token = state.animToken;
  const from = state.lockedGuess;
  const to = state.object.meters;
  const started = performance.now();
  const duration = reduceMotion ? 0 : 900;

  function frame(now) {
    if (token !== state.animToken) return;
    const t = duration === 0 ? 1 : Math.min(1, (now - started) / duration);
    const eased = 1 - (1 - t) ** 3;
    const log = Math.log(from) + (Math.log(to) - Math.log(from)) * eased;
    state.displayMeters = Math.exp(log);
    layout();
    if (t < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function showResults() {
  setPhase("results");
  roundLabelEl.textContent = "Game over";
  const previous = state.best;
  const isNew = previous === null || state.total > previous;
  if (isNew) {
    state.best = state.total;
    writeBest(state.total);
  }
  renderBest();
  totalScoreEl.textContent = String(state.total);
  totalSubEl.textContent = "out of 800";
  newBestEl.hidden = !isNew;
  const average = state.total / ROUND_COUNT;
  if (average >= 90) totalBlurbEl.textContent = "A sharp eye for scale.";
  else if (average >= 70) totalBlurbEl.textContent = "You have a good feel for size.";
  else if (average >= 50) totalBlurbEl.textContent = "A fair run of guesses.";
  else totalBlurbEl.textContent = "Scale is trickier than it looks.";

  recapEl.innerHTML = "";
  state.results.forEach((result) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = result.title;
    const points = document.createElement("span");
    points.textContent = `${result.score} · ${result.label}`;
    points.dataset.band = result.label;
    item.append(name, points);
    recapEl.append(item);
  });
}

function nextRound() {
  if (state.phase !== "reveal") return;
  if (state.index + 1 >= ROUND_COUNT) {
    showResults();
    return;
  }
  state.index += 1;
  beginRound();
}

function startGame() {
  state.rounds = buildRounds();
  state.index = 0;
  state.total = 0;
  state.results = [];
  beginRound();
}

function bindHandle(el) {
  el.addEventListener("pointerdown", (event) => {
    if (state.phase !== "play") return;
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    el.setPointerCapture(event.pointerId);
    drag = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      guess: state.guess,
    };
  });
  el.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const diag = ((event.clientX - drag.x) + (drag.y - event.clientY)) / 2;
    const sign = Math.sign(diag);
    const mag = Math.abs(diag);
    const knee = 48;
    const scaled = mag < knee ? mag / 58 : knee / 58 + (mag - knee) / 22;
    setGuess(drag.guess * Math.exp(sign * scaled));
  });
  const end = (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    drag = null;
  };
  el.addEventListener("pointerup", end);
  el.addEventListener("pointercancel", end);
}

document.querySelector("#playBtn").addEventListener("click", startGame);
document.querySelector("#againBtn").addEventListener("click", startGame);
lockBtn.addEventListener("click", lockIn);
nextBtn.addEventListener("click", nextRound);

document.addEventListener("keydown", (event) => {
  if (state.phase === "play") {
    if (event.key === "Enter") {
      event.preventDefault();
      lockIn();
      return;
    }
    const step = event.shiftKey ? 0.02 : 0.005;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") {
      event.preventDefault();
      nudge(step);
    } else if (event.key === "ArrowDown" || event.key === "ArrowLeft") {
      event.preventDefault();
      nudge(-step);
    }
  } else if (state.phase === "reveal" && event.key === "Enter") {
    event.preventDefault();
    nextRound();
  }
});

bindHandle(handleEl);

new ResizeObserver(() => layout()).observe(stageEl);

renderBest();
setPhase("start");
