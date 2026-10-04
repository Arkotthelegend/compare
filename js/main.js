import { ShadowStage } from "./scene.js";
import { differenceCm, formatCm, percentageError, scoreGuess, toMeters } from "./measure.js";
import { MODE_META, buildSession, createRound, practiceDifficulty } from "./rounds.js";
import { mulberry32, dailyKey, dailySeed } from "./rng.js";
import { fillSolution, shareText } from "./solution.js";
import {
  dailyResult,
  labelCategory,
  labelDifficulty,
  loadHistory,
  profileFrom,
  recordRound,
  saveDaily,
} from "./stats.js";

const homeScreen = document.querySelector("#homeScreen");
const playScreen = document.querySelector("#playScreen");
const summaryScreen = document.querySelector("#summaryScreen");
const profileScreen = document.querySelector("#profileScreen");
const roundLabel = document.querySelector("#roundLabel");
const scoreLabel = document.querySelector("#scoreLabel");
const timerLabel = document.querySelector("#timerLabel");
const question = document.querySelector("#question");
const guessForm = document.querySelector("#guessForm");
const guessInput = document.querySelector("#guessInput");
const unitSelect = document.querySelector("#unitSelect");
const formError = document.querySelector("#formError");
const submitBtn = document.querySelector("#submitBtn");
const playDock = document.querySelector("#playDock");
const resultDock = document.querySelector("#resultDock");
const guessLine = document.querySelector("#guessLine");
const actualLine = document.querySelector("#actualLine");
const diffLine = document.querySelector("#diffLine");
const errorLine = document.querySelector("#errorLine");
const roundScore = document.querySelector("#roundScore");
const guessBar = document.querySelector("#guessBar");
const actualBar = document.querySelector("#actualBar");
const guessBarLabel = document.querySelector("#guessBarLabel");
const actualBarLabel = document.querySelector("#actualBarLabel");
const solutionPanel = document.querySelector("#solutionPanel");
const solutionSvg = document.querySelector("#solutionSvg");
const solutionCopy = document.querySelector("#solutionCopy");
const solutionBtn = document.querySelector("#solutionBtn");
const nextBtn = document.querySelector("#nextBtn");
const againBtn = document.querySelector("#againBtn");
const stageStatus = document.querySelector("#stageStatus");
const resetCam = document.querySelector("#resetCam");
const menuBtn = document.querySelector("#menuBtn");
const profileBtn = document.querySelector("#profileBtn");
const summaryScore = document.querySelector("#summaryScore");
const summarySub = document.querySelector("#summarySub");
const summaryBlurb = document.querySelector("#summaryBlurb");
const summaryCard = document.querySelector("#summaryCard");
const recap = document.querySelector("#recap");
const copyBtn = document.querySelector("#copyBtn");
const copyNote = document.querySelector("#copyNote");
const summaryAgain = document.querySelector("#summaryAgain");
const summaryHome = document.querySelector("#summaryHome");
const dailyReplay = document.querySelector("#dailyReplay");
const profileBody = document.querySelector("#profileBody");
const profileContinue = document.querySelector("#profileContinue");
const profileHome = document.querySelector("#profileHome");

const state = {
  mode: null,
  official: true,
  session: [],
  index: 0,
  rng: null,
  spec: null,
  phase: "home",
  submitted: false,
  total: 0,
  results: [],
  roundStarted: 0,
  timerId: 0,
  showProfileNext: false,
  afterProfile: null,
  stage: null,
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function show(screen) {
  homeScreen.hidden = screen !== "home";
  playScreen.hidden = screen !== "play";
  summaryScreen.hidden = screen !== "summary";
  profileScreen.hidden = screen !== "profile";
  state.phase = screen;
  menuBtn.hidden = screen === "home";
  if (screen === "play" && state.stage) state.stage.resize();
}

function freshSeed() {
  return (Math.floor(Math.random() * 0xffffffff) ^ Date.now()) >>> 0;
}

function stopTimer() {
  if (state.timerId) {
    window.clearInterval(state.timerId);
    state.timerId = 0;
  }
}

function formatClock(ms) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  const remain = seconds % 60;
  return `${minutes}:${String(remain).padStart(2, "0")}`;
}

function updateTimer() {
  const meta = MODE_META[state.mode];
  const elapsed = performance.now() - state.roundStarted;
  if (meta && meta.timed) {
    const remain = meta.seconds * 1000 - elapsed;
    timerLabel.textContent = formatClock(remain);
    timerLabel.dataset.urgent = remain <= 10000 ? "true" : "false";
    if (remain <= 0 && state.phase === "play" && !state.submitted) submitGuess(true);
    return;
  }
  timerLabel.textContent = formatClock(elapsed);
  timerLabel.dataset.urgent = "false";
}

function updateChrome() {
  const meta = state.mode ? MODE_META[state.mode] : null;
  if (!meta || !state.spec) {
    roundLabel.textContent = "";
    scoreLabel.textContent = "";
    return;
  }
  const count = meta.rounds === Infinity ? state.index + 1 : `${state.index + 1} / ${meta.rounds}`;
  roundLabel.textContent = `${meta.title} · ${count}`;
  scoreLabel.textContent = `${Math.round(state.total).toLocaleString("en-US")}`;
}

function validateGuess(raw, unit) {
  const text = raw.trim().replace(",", ".");
  if (text === "") return { error: "Enter a height." };
  if (!/^\d+(\.\d+)?$/.test(text)) return { error: "Enter a positive number." };
  const value = Number(text);
  if (!Number.isFinite(value) || value <= 0) return { error: "Enter a height greater than zero." };
  const meters = toMeters(value, unit);
  if (!(meters > 0) || meters > 1000) return { error: "Enter a height this scene could actually be." };
  return { meters };
}

function setBars(guessMeters, actualMeters) {
  const guess = guessMeters > 0 ? guessMeters : 0;
  const max = Math.max(guess, actualMeters, 0.001);
  const guessPct = (guess / max) * 100;
  const actualPct = (actualMeters / max) * 100;
  const apply = () => {
    guessBar.style.height = `${guessPct}%`;
    actualBar.style.height = `${actualPct}%`;
  };
  guessBar.style.height = "0%";
  actualBar.style.height = "0%";
  if (reduceMotion) apply();
  else requestAnimationFrame(apply);
  guessBarLabel.textContent = guessMeters > 0 ? formatCm(guessMeters) : "No guess";
  actualBarLabel.textContent = formatCm(actualMeters);
}

function openRound() {
  const meta = MODE_META[state.mode];
  if (meta.rounds === Infinity) {
    const difficulty = practiceDifficulty(state.rng);
    state.spec = createRound(state.rng, difficulty);
    state.spec.index = state.index;
    state.spec.mode = state.mode;
  } else {
    state.spec = state.session[state.index];
  }
  state.submitted = false;
  state.roundStarted = performance.now();
  formError.textContent = "";
  guessInput.value = "";
  guessInput.disabled = false;
  unitSelect.disabled = false;
  submitBtn.disabled = false;
  playDock.hidden = false;
  resultDock.hidden = true;
  solutionPanel.hidden = true;
  solutionBtn.textContent = "View solution";
  nextBtn.textContent = state.index + 1 >= meta.rounds ? "See results" : "Next round";
  question.textContent = "How tall is this object?";
  show("play");
  stageStatus.hidden = false;
  stageStatus.textContent = "Preparing the scene";
  try {
    state.stage.resize();
    state.stage.load(state.spec);
    stageStatus.hidden = true;
  } catch (error) {
    stageStatus.hidden = false;
    stageStatus.textContent = "This browser could not start the 3D scene.";
  }
  updateChrome();
  updateTimer();
  stopTimer();
  state.timerId = window.setInterval(updateTimer, 200);
}

function ensureStage() {
  if (state.stage) return;
  state.stage = new ShadowStage(document.querySelector("#view"));
  document.addEventListener("visibilitychange", () => {
    if (state.stage) state.stage.setPaused(document.hidden);
  });
}

function startMode(mode, official = true) {
  ensureStage();
  state.mode = mode;
  state.official = official;
  state.index = 0;
  state.total = 0;
  state.results = [];
  state.showProfileNext = false;
  if (mode === "daily") {
    state.rng = mulberry32(dailySeed(new Date()));
    state.session = buildSession(mode, state.rng);
  } else if (mode === "practice") {
    state.rng = mulberry32(freshSeed());
    state.session = [];
  } else {
    state.rng = mulberry32(freshSeed());
    state.session = buildSession(mode, state.rng);
  }
  openRound();
}

function submitGuess(fromTimer) {
  if (state.phase !== "play" || state.submitted || !state.spec) return;
  const parsed = validateGuess(guessInput.value, unitSelect.value);
  if (!fromTimer && parsed.error) {
    formError.textContent = parsed.error;
    return;
  }
  const guessMeters = parsed.error ? null : parsed.meters;
  if (fromTimer && parsed.error) formError.textContent = "Time is up.";
  else formError.textContent = "";

  state.submitted = true;
  stopTimer();
  guessInput.disabled = true;
  unitSelect.disabled = true;
  submitBtn.disabled = true;

  const actual = state.spec.height;
  const score = guessMeters ? scoreGuess(guessMeters, actual) : 0;
  state.total += score;
  const entry = {
    at: Date.now(),
    mode: state.mode,
    difficulty: state.spec.difficulty,
    category: state.spec.category,
    shape: state.spec.shape,
    actualM: actual,
    guessM: guessMeters || 0,
    score,
  };
  state.results.push(entry);
  const history = recordRound(entry);
  if (history.length > 0 && history.length % 10 === 0) state.showProfileNext = true;

  guessLine.textContent = guessMeters ? `Your guess: ${formatCm(guessMeters)}` : "Your guess: no measurement entered";
  actualLine.textContent = `Actual: ${formatCm(actual)}`;
  if (guessMeters) {
    const diff = differenceCm(guessMeters, actual);
    const direction = guessMeters > actual ? "tall" : guessMeters < actual ? "short" : "exact";
    const diffText = direction === "exact" ? "0 cm" : `${formatCm(diff / 100).replace(" cm", "")} cm ${direction}`;
    diffLine.textContent = `Difference: ${diffText}`;
    const pct = percentageError(guessMeters, actual);
    errorLine.textContent = `Error: ${pct.toFixed(1)}%`;
  } else {
    diffLine.textContent = "Difference: —";
    errorLine.textContent = "Error: —";
  }
  roundScore.textContent = `${score} / 1000`;
  setBars(guessMeters || 0, actual);
  state.stage.showComparison(state.spec, guessMeters || 0);
  playDock.hidden = true;
  resultDock.hidden = false;
  updateChrome();
  refreshProfileLink();
}

function showSolution() {
  if (!state.submitted || !state.spec) return;
  const open = solutionPanel.hidden;
  solutionPanel.hidden = !open;
  solutionBtn.textContent = open ? "Hide solution" : "View solution";
  if (open) {
    fillSolution(state.spec, solutionSvg, solutionCopy);
    const guessMeters = state.results[state.results.length - 1]?.guessM || 0;
    state.stage.showComparison(state.spec, guessMeters);
    state.stage.showSolution(state.spec);
  } else {
    const guessMeters = state.results[state.results.length - 1]?.guessM || 0;
    state.stage.showComparison(state.spec, guessMeters);
  }
}

function finishSession() {
  const meta = MODE_META[state.mode];
  stopTimer();
  if (state.mode === "daily" && state.official) {
    const key = dailyKey(new Date());
    if (!dailyResult(key)) {
      saveDaily(key, {
        date: key,
        total: state.total,
        max: meta.maxScore,
        results: state.results,
      });
    }
  }
  const max = meta.maxScore || state.total;
  summaryScore.textContent = Math.round(state.total).toLocaleString("en-US");
  summarySub.textContent = meta.maxScore ? `out of ${meta.maxScore.toLocaleString("en-US")}` : "practice total";
  const average = state.results.length ? state.total / state.results.length : 0;
  if (average >= 850) summaryBlurb.textContent = "A precise eye for light and scale.";
  else if (average >= 650) summaryBlurb.textContent = "You can read a shadow. The last centimeters are the hard part.";
  else if (average >= 400) summaryBlurb.textContent = "The scene is giving you information. The post and the grid are there to be used.";
  else summaryBlurb.textContent = "Orbit lower, then compare the object with the 1 m post.";
  summaryCard.textContent = meta.maxScore ? shareText(state.total, meta.maxScore) : "";
  copyBtn.hidden = !meta.maxScore;
  copyNote.textContent = "";
  recap.innerHTML = "";
  state.results.forEach((result, index) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = `Round ${index + 1} · ${labelDifficulty(result.difficulty)}`;
    const points = document.createElement("span");
    points.textContent = `${result.score}`;
    item.append(name, points);
    recap.append(item);
  });
  dailyReplay.hidden = true;
  show("summary");
  roundLabel.textContent = meta.title;
  scoreLabel.textContent = "";
  timerLabel.textContent = "";
}

function goNext() {
  if (!state.submitted) return;
  const meta = MODE_META[state.mode];
  if (state.showProfileNext) {
    state.showProfileNext = false;
    state.afterProfile = state.index + 1 >= meta.rounds ? "summary" : "round";
    openProfile();
    return;
  }
  if (state.index + 1 >= meta.rounds) {
    finishSession();
    return;
  }
  state.index += 1;
  openRound();
}

function openProfile() {
  const profile = profileFrom(loadHistory());
  profileBody.innerHTML = "";
  const rows = profile.empty
    ? [["Rounds", "0"], ["Average score", "—"], ["Best score", "—"], ["Recent accuracy", "—"], ["Tendency", "—"], ["Best category", "—"], ["Hardest category", "—"]]
    : [
        ["Rounds", String(profile.count)],
        ["Average score", String(Math.round(profile.average))],
        ["Best score", String(profile.best)],
        ["Recent accuracy", String(Math.round(profile.recent))],
        ["Tendency", profile.tendency],
        ["Best category", profile.bestCategory],
        ["Hardest category", profile.hardestCategory],
      ];
  rows.forEach(([label, value]) => {
    const row = document.createElement("div");
    row.className = "stat";
    const name = document.createElement("span");
    name.textContent = label;
    const number = document.createElement("strong");
    number.textContent = value;
    row.append(name, number);
    profileBody.append(row);
  });
  if (!profile.empty) {
    profile.byCategory.forEach((item) => {
      const row = document.createElement("div");
      row.className = "meter";
      const caption = document.createElement("span");
      caption.textContent = `${labelCategory(item.name)} · ${Math.round(item.average)}`;
      const track = document.createElement("div");
      const fill = document.createElement("div");
      fill.style.width = `${Math.max(4, Math.min(100, item.average / 10))}%`;
      track.append(fill);
      row.append(caption, track);
      profileBody.append(row);
    });
    profile.byDifficulty.forEach((item) => {
      const row = document.createElement("p");
      row.className = "fine";
      row.textContent = `${labelDifficulty(item.name)} average ${Math.round(item.average)} over ${item.count} round${item.count === 1 ? "" : "s"}`;
      profileBody.append(row);
    });
  }
  profileContinue.hidden = !state.afterProfile;
  show("profile");
}

function refreshProfileLink() {
  profileBtn.hidden = loadHistory().length === 0;
}

function showSavedDaily() {
  const saved = dailyResult(dailyKey(new Date()));
  if (!saved) return false;
  state.mode = "daily";
  state.results = saved.results || [];
  state.total = saved.total || 0;
  summaryScore.textContent = Math.round(state.total).toLocaleString("en-US");
  summarySub.textContent = "out of 5,000";
  summaryBlurb.textContent = "Today's official result is already saved on this device.";
  summaryCard.textContent = shareText(state.total, 5000);
  copyBtn.hidden = false;
  copyNote.textContent = "";
  recap.innerHTML = "";
  state.results.forEach((result, index) => {
    const item = document.createElement("li");
    const name = document.createElement("span");
    name.textContent = `Round ${index + 1} · ${labelDifficulty(result.difficulty)}`;
    const points = document.createElement("span");
    points.textContent = `${result.score}`;
    item.append(name, points);
    recap.append(item);
  });
  dailyReplay.hidden = false;
  show("summary");
  roundLabel.textContent = "Daily Challenge";
  scoreLabel.textContent = "";
  timerLabel.textContent = "";
  return true;
}

async function copySummary() {
  const text = summaryCard.textContent;
  try {
    await navigator.clipboard.writeText(text);
    copyNote.textContent = "Copied.";
  } catch (error) {
    copyNote.textContent = "Select the card and copy it.";
    const range = document.createRange();
    range.selectNodeContents(summaryCard);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => {
    const mode = button.dataset.mode;
    if (mode === "daily" && showSavedDaily()) return;
    startMode(mode, true);
  });
});

guessForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitGuess(false);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && state.phase === "play" && !state.submitted) {
    if (event.target !== guessInput && event.target !== submitBtn) return;
    event.preventDefault();
    submitGuess(false);
  } else if (event.key === "r" && state.phase === "play" && event.target !== guessInput) {
    state.stage?.resetCamera();
  }
});

solutionBtn.addEventListener("click", showSolution);
nextBtn.addEventListener("click", goNext);
againBtn.addEventListener("click", () => startMode(state.mode, state.official));
resetCam.addEventListener("click", () => state.stage?.resetCamera());
menuBtn.addEventListener("click", () => {
  stopTimer();
  state.stage?.hideGuides();
  state.afterProfile = null;
  show("home");
  roundLabel.textContent = "";
  scoreLabel.textContent = "";
  timerLabel.textContent = "";
  refreshProfileLink();
});
profileBtn.addEventListener("click", () => {
  state.afterProfile = null;
  openProfile();
});
profileHome.addEventListener("click", () => {
  state.afterProfile = null;
  show("home");
  refreshProfileLink();
});
profileContinue.addEventListener("click", () => {
  const next = state.afterProfile;
  state.afterProfile = null;
  if (next === "summary") finishSession();
  else if (next === "round") {
    state.index += 1;
    openRound();
  } else show("home");
});
summaryHome.addEventListener("click", () => {
  show("home");
  roundLabel.textContent = "";
  scoreLabel.textContent = "";
  refreshProfileLink();
});
summaryAgain.addEventListener("click", () => {
  if (state.mode === "daily") {
    const saved = dailyResult(dailyKey(new Date()));
    startMode("daily", !saved);
    return;
  }
  startMode(state.mode, true);
});
dailyReplay.addEventListener("click", () => startMode("daily", false));
copyBtn.addEventListener("click", copySummary);

refreshProfileLink();
show("home");
