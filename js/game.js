const MIN_M = 0.001;
const MAX_M = 100;
const SLIDER_STEPS = 10000;
const ROUND_COUNT = 8;
const BEST_KEY = "size-compare-best";

const stageEl = document.querySelector("#stage");
const personEl = document.querySelector("#person");
const objectEl = document.querySelector("#object");
const ghostEl = document.querySelector("#ghost");
const hitEl = document.querySelector("#hit");
const loupeEl = document.querySelector("#loupe");
const loupeArtEl = document.querySelector("#loupeArt");
const sliderEl = document.querySelector("#slider");
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
    const value = Number(localStorage.getItem(BEST_KEY));
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

function questionFor(spec) {
  const how = spec.measure === "length" ? "long" : "tall";
  return `How ${how} is ${spec.noun}?`;
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
  const sliderValue = String(Math.round(metersToSlider(state.guess) * SLIDER_STEPS));
  if (sliderEl.value !== sliderValue) sliderEl.value = sliderValue;
  sliderEl.setAttribute("aria-valuetext", formatSize(state.guess));
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
  const personBox = dimsFor(PERSON, PERSON.meters);
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
  x += personW + gapM * ppm;
  place(objectEl, x + (slotW - objectW) / 2, objectW, objectH);
  if (showGhost) {
    ghostEl.hidden = false;
    place(ghostEl, x + (slotW - ghostW) / 2, ghostW, ghostH);
  } else {
    ghostEl.hidden = true;
  }

  const hitW = Math.max(objectW, 64);
  const hitH = Math.max(objectH, 64);
  const objectLeft = x + (slotW - objectW) / 2;
  const objectCenter = objectLeft + objectW / 2;
  const objectTop = stageEl.clientHeight - ground - objectH;
  hitEl.hidden = state.phase !== "play";
  hitEl.classList.toggle("is-padded", hitW > objectW + 4 || hitH > objectH + 4);
  place(hitEl, objectCenter - hitW / 2, hitW, hitH);
  hitEl.style.bottom = `${ground + objectH / 2 - hitH / 2}px`;

  const primary = state.object.axis === "height" ? objectH : objectW;
  if (primary < 40) {
    loupeEl.hidden = false;
    const loupeSize = 104;
    let left = objectCenter - loupeSize / 2;
    let top = objectTop - loupeSize - 28;
    if (top < 8) top = Math.min(objectTop + objectH + 28, stageEl.clientHeight - loupeSize - 28);
    left = Math.min(Math.max(8, left), stageEl.clientWidth - loupeSize - 8);
    loupeEl.style.left = `${left}px`;
    loupeEl.style.top = `${top}px`;
  } else {
    loupeEl.hidden = true;
  }

  stageEl.setAttribute(
    "aria-label",
    `${state.object.title} scaled next to a 1.8 meter person. Current scale ${formatSize(state.guess)}.`
  );
}

function place(el, left, width, height) {
  el.style.left = `${left}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
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
  state.object = state.rounds[state.index];
  state.lockedGuess = null;
  setPhase("play");
  questionEl.textContent = questionFor(state.object);
  measureHintEl.textContent = state.object.hint;
  roundLabelEl.textContent = `Round ${state.index + 1} / ${ROUND_COUNT}`;
  readoutCaptionEl.textContent = "your scale";
  helpEl.hidden = false;
  revealCardEl.hidden = true;
  lockBtn.hidden = false;
  nextBtn.hidden = true;
  sliderEl.disabled = false;
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
  sliderEl.disabled = true;
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
  hitEl.hidden = true;
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
  state.rounds = shuffle(OBJECTS).slice(0, ROUND_COUNT);
  state.index = 0;
  state.total = 0;
  state.results = [];
  beginRound();
}

function bindDrag(el) {
  el.addEventListener("pointerdown", (event) => {
    if (state.phase !== "play") return;
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    el.setPointerCapture(event.pointerId);
    drag = { pointerId: event.pointerId, y: event.clientY, guess: state.guess };
  });
  el.addEventListener("pointermove", (event) => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const dy = drag.y - event.clientY;
    setGuess(drag.guess * 2 ** (dy / 150));
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

sliderEl.addEventListener("input", () => {
  if (state.phase !== "play") return;
  setGuess(sliderToMeters(Number(sliderEl.value) / SLIDER_STEPS));
});

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

bindDrag(hitEl);
bindDrag(loupeEl);
bindDrag(objectEl);

personEl.innerHTML = svgMarkup(PERSON);
personEl.style.color = PERSON.color;

new ResizeObserver(() => layout()).observe(stageEl);

renderBest();
setPhase("start");
