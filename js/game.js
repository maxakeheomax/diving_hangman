(() => {
const ROWS = ["ЙЦУКЕНГШЩЗХ", "ФЫВАПРОЛДЖЭ", "ЯЧСМИТЬБЮЁЪ"];
const DEPTHS = [0, 5, 10, 15, 20, 25, 30, 35, 40];
const DIVER_X = 148;
const SURFACE_Y = 210;
const TRAVEL = 560;
const FOCUS_Y = 230;
const SVG_NS = "http://www.w3.org/2000/svg";
const STATS_KEY = "forty-stats";
const USED_KEY = "forty-used";
const MUTE_KEY = "forty-mute";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const state = {
  word: "",
  hint: "",
  category: "",
  guessed: new Set(),
  wrong: 0,
  over: false,
  ascending: false,
  round: 0,
};

let viewDepth = 0;
let depthGen = 0;
let rafId = 0;
let lastBubble = 0;
let audioCtx = null;
let muted = localStorage.getItem(MUTE_KEY) === "1";
let bound = false;

let world;
let diverSlot;
let diver;
let bubbleLayer;
let sharkSlot;
let mouthOpen;
let mouthClosed;
let snackFin;
let amBubble;
let vignette;
let gauge;
let gaugeFill;
let gaugeBead;
let depthNum;
let depthCaption;
let missLine;
let computer;
let categoryLabel;
let clue;
let blanks;
let keyboard;
let overlay;
let overlayTitle;
let overlayText;
let overlayAnswer;
let overlayClue;
let live;
let menu;
let play;
let loader;
let menuStats;
let dictNote;
let muteBtn;

const bubbles = [];

function start() {
  cacheEls();
  bind();
  buildKeyboard();
  paintMute();
  renderStats();
  loader.hidden = true;
  const hint = document.querySelector("#homeHintBtn");
  if (hint) hint.hidden = FortyInstall.installed();
  if (!FortyInstall.maybeShow(showMenu)) showMenu();
}

function cacheEls() {
  world = must("world");
  diverSlot = must("diverSlot");
  diver = must("diver");
  bubbleLayer = must("bubbleLayer");
  sharkSlot = must("sharkSlot");
  mouthOpen = must("mouthOpen");
  mouthClosed = must("mouthClosed");
  snackFin = must("snackFin");
  amBubble = must("amBubble");
  vignette = must("vignette");
  gauge = must("gauge");
  gaugeFill = must("gaugeFill");
  gaugeBead = must("gaugeBead");
  depthNum = must("depthNum");
  depthCaption = must("depthCaption");
  missLine = must("missLine");
  computer = must("computer");
  categoryLabel = must("categoryLabel");
  clue = must("clue");
  blanks = must("blanks");
  keyboard = must("keyboard");
  overlay = must("overlay");
  overlayTitle = must("overlayTitle");
  overlayText = must("overlayText");
  overlayAnswer = must("overlayAnswer");
  overlayClue = must("overlayClue");
  live = must("live");
  menu = must("menu");
  play = must("play");
  loader = must("loader");
  menuStats = must("menuStats");
  dictNote = must("dictNote");
  muteBtn = must("muteBtn");
}

function must(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(id);
  return el;
}

function bind() {
  if (bound) return;
  bound = true;
  document.querySelector("#startBtn").addEventListener("click", newDive);
  document.querySelector("#homeHintBtn").addEventListener("click", () => FortyInstall.show(showMenu));
  document.querySelector("#againBtn").addEventListener("click", newDive);
  document.querySelector("#shoreBtn").addEventListener("click", showMenu);
  document.querySelector("#menuBtn").addEventListener("click", showMenu);
  muteBtn.addEventListener("click", toggleMute);
  document.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", onKeyDown);
}

function buildKeyboard() {
  keyboard.replaceChildren();
  for (const row of ROWS) {
    const line = document.createElement("div");
    line.className = "keyrow";
    for (const letter of row) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "key";
      button.textContent = letter;
      button.dataset.letter = letter;
      button.addEventListener("click", () => onGuess(letter));
      line.appendChild(button);
    }
    keyboard.appendChild(line);
  }
}

function showMenu() {
  state.round += 1;
  depthGen += 1;
  stopLoop();
  clearBubbles();
  resetActor();
  overlay.hidden = true;
  play.hidden = true;
  document.querySelector("#onboard").hidden = true;
  const hint = document.querySelector("#homeHintBtn");
  if (hint) hint.hidden = FortyInstall.installed();
  menu.hidden = false;
  renderStats();
}

function newDive() {
  state.round += 1;
  const token = state.round;
  depthGen += 1;
  stopLoop();
  clearBubbles();
  resetActor();
  const picked = pickWord();
  state.word = picked.w;
  state.hint = picked.h;
  state.category = picked.c;
  state.guessed = new Set();
  state.wrong = 0;
  state.over = false;
  state.ascending = false;
  overlay.hidden = true;
  menu.hidden = true;
  loader.hidden = true;
  play.hidden = false;
  keyboard.classList.remove("locked");
  resetKeys();
  categoryLabel.textContent = picked.c;
  clue.textContent = picked.h;
  renderBoard();
  applyDepth(0);
  live.textContent = `Новое погружение. ${picked.c}. ${picked.h}`;
  startLoop();
  if (token !== state.round) return;
}

function onKeyDown(event) {
  if (play.hidden) return;
  if (event.key === "Escape") {
    showMenu();
    return;
  }
  if (state.over || overlay.hidden === false) return;
  const raw = event.key.toUpperCase();
  if (raw === "Ё" || /^[А-Я]$/.test(raw)) {
    event.preventDefault();
    onGuess(raw);
  }
}

function onGuess(letter) {
  if (state.over || play.hidden) return;
  const canonical = canon(letter);
  if ([...state.guessed].some((guess) => canon(guess) === canonical)) return;
  state.guessed.add(letter);
  unlockAudio();
  const hit = [...state.word].some((ch) => canon(ch) === canonical);
  const button = keyboard.querySelector(`[data-letter="${CSS.escape(letter)}"]`);
  if (button) {
    button.disabled = true;
    button.classList.add(hit ? "good" : "bad");
  }
  renderBoard();
  if (hit) {
    blip(620, 0.08, "sine", 0.045);
    setTimeout(() => blip(840, 0.1, "sine", 0.04), 70);
    if (isSolved()) {
      live.textContent = `Буква ${letter} есть. Слово собрано.`;
      winSequence(state.round);
      return;
    }
    live.textContent = `Буква ${letter} есть.`;
    return;
  }
  state.wrong += 1;
  blip(190, 0.16, "triangle", 0.04);
  const depth = DEPTHS[state.wrong];
  live.textContent = `Буквы ${letter} нет. Глубина ${depth} метров.`;
  if (state.wrong >= 8) {
    loseSequence(state.round);
    return;
  }
  tweenDepth(depth, motion(650));
}

function isSolved() {
  const known = new Set([...state.guessed].map(canon));
  return [...state.word].every((ch) => known.has(canon(ch)));
}

function renderBoard() {
  const known = new Set([...state.guessed].map(canon));
  blanks.style.setProperty("--n", String(state.word.length));
  blanks.replaceChildren();
  const spoken = [];
  for (const ch of state.word) {
    const tile = document.createElement("span");
    tile.className = "tile";
    if (known.has(canon(ch))) {
      tile.classList.add("on");
      tile.textContent = ch;
      spoken.push(ch);
    } else {
      spoken.push("пропуск");
    }
    blanks.appendChild(tile);
  }
  blanks.setAttribute("aria-label", spoken.join(" "));
}

function resetKeys() {
  for (const button of keyboard.querySelectorAll(".key")) {
    button.disabled = false;
    button.classList.remove("good", "bad");
  }
}

function lockKeyboard() {
  keyboard.classList.add("locked");
  for (const button of keyboard.querySelectorAll(".key")) button.disabled = true;
}

function canon(letter) {
  return letter === "Ё" ? "Е" : letter;
}

function diverWorldY(depth) {
  return SURFACE_Y + (depth / 40) * TRAVEL;
}

function applyDepth(depth) {
  viewDepth = depth;
  const y = diverWorldY(depth);
  const camera = Math.max(0, y - FOCUS_Y);
  world.setAttribute("transform", `translate(0 ${-camera})`);
  diverSlot.setAttribute("transform", `translate(${DIVER_X} ${y})`);
  const dark = Math.max(0, (depth - 28) / 12);
  vignette.setAttribute("opacity", String(Math.min(0.34, dark * 0.34)));
  const shown = Math.round(depth);
  const ratio = depth / 40;
  gaugeFill.style.height = `${ratio * 100}%`;
  gaugeBead.style.top = `${ratio * 100}%`;
  gauge.setAttribute("aria-valuenow", String(shown));
  depthNum.textContent = String(shown);
  const caption = state.ascending ? "всплываем" : depthCaptionText(shown);
  depthCaption.textContent = caption;
  gauge.setAttribute("aria-valuetext", `${shown} метров, ${caption}`);
  missLine.textContent = `ошибки ${state.wrong} / 8`;
  computer.classList.toggle("warn", depth >= 30 && depth < 40);
  computer.classList.toggle("crit", depth >= 39.5);
}

function depthCaptionText(meters) {
  if (meters <= 0) return "поверхность";
  if (meters <= 10) return "мелководье";
  if (meters <= 18) return "открытая вода";
  if (meters <= 30) return "уже глубоко";
  if (meters < 40) return "близко к лимиту";
  return "критическая глубина";
}

function tweenDepth(target, ms) {
  const gen = ++depthGen;
  const from = viewDepth;
  return playAnim(ms, (t) => {
    const eased = 1 - (1 - t) ** 3;
    applyDepth(from + (target - from) * eased);
  }, () => gen === depthGen);
}

function playAnim(ms, tick, alive = () => true) {
  if (!alive()) return Promise.resolve(false);
  if (ms <= 0) {
    tick(1);
    return Promise.resolve(alive());
  }
  return new Promise((resolve) => {
    const started = performance.now();
    function frame(now) {
      if (!alive()) {
        resolve(false);
        return;
      }
      const t = Math.min(1, (now - started) / ms);
      tick(t);
      if (t < 1) requestAnimationFrame(frame);
      else resolve(true);
    }
    requestAnimationFrame(frame);
  });
}

function motion(ms) {
  return reduceMotion ? 0 : ms;
}

async function winSequence(token) {
  state.over = true;
  state.ascending = true;
  lockKeyboard();
  record(true);
  fanfare();
  await tweenDepth(0, motion(1200));
  if (token !== state.round) return;
  state.ascending = false;
  applyDepth(0);
  showResult(true);
}

async function loseSequence(token) {
  state.over = true;
  lockKeyboard();
  record(false);
  await tweenDepth(40, motion(700));
  if (token !== state.round) return;
  await playShark(token);
  if (token !== state.round) return;
  showResult(false);
}

async function playShark(token) {
  const y = diverWorldY(40);
  const biteX = 112;
  const alive = () => token === state.round;
  if (reduceMotion) {
    sharkSlot.setAttribute("transform", `translate(${biteX} ${y})`);
    sharkSlot.setAttribute("opacity", "1");
    mouthClosed.setAttribute("opacity", "0");
    mouthOpen.setAttribute("opacity", "1");
    diver.setAttribute("opacity", "0");
    snackFin.setAttribute("opacity", "1");
    return;
  }
  const swam = await playAnim(1100, (t) => {
    const eased = 1 - (1 - t) ** 3;
    const x = 440 + (biteX - 440) * eased;
    sharkSlot.setAttribute("transform", `translate(${x} ${y})`);
    sharkSlot.setAttribute("opacity", String(Math.min(1, t * 2.4)));
  }, alive);
  if (!swam) return;
  mouthClosed.setAttribute("opacity", "0");
  mouthOpen.setAttribute("opacity", "1");
  amBubble.setAttribute("opacity", "1");
  blip(120, 0.2, "triangle", 0.06);
  if (!(await sleep(240, alive))) return;
  const eaten = await playAnim(420, (t) => {
    const eased = t ** 2;
    diver.setAttribute(
      "transform",
      `translate(${36 * eased} ${8 * eased}) rotate(${18 * eased}) scale(${1 - 0.92 * eased})`
    );
    diver.setAttribute("opacity", String(1 - eased));
  }, alive);
  if (!eaten) return;
  snackFin.setAttribute("opacity", "1");
  mouthOpen.setAttribute("opacity", "0");
  mouthClosed.setAttribute("opacity", "1");
  amBubble.setAttribute("opacity", "0");
  if (!(await sleep(520, alive))) return;
  await playAnim(800, (t) => {
    const x = biteX + 300 * t;
    sharkSlot.setAttribute("transform", `translate(${x} ${y - 16 * t})`);
    sharkSlot.setAttribute("opacity", String(1 - t));
  }, alive);
}

function sleep(ms, alive) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(alive()), ms);
  });
}

function showResult(won) {
  const stats = loadStats();
  overlayTitle.textContent = won ? "Безопасное всплытие" : "Критическая глубина";
  overlayText.textContent = won
    ? stats.streak > 1
      ? `Дайвер снова под солнцем. Серия без акулы: ${stats.streak}.`
      : "Дайвер снова под солнцем. Можно снимать ласты."
    : "Сорок метров — дальше любительский свет кончается. Акула не стала ждать.";
  overlayAnswer.textContent = state.word;
  overlayClue.textContent = state.hint;
  overlay.hidden = false;
  document.querySelector("#againBtn").focus();
  live.textContent = won
    ? `Победа. Слово ${state.word}.`
    : `Акула. Слово было ${state.word}.`;
}

function resetActor() {
  diver.removeAttribute("transform");
  diver.setAttribute("opacity", "1");
  sharkSlot.setAttribute("opacity", "0");
  sharkSlot.setAttribute("transform", "translate(440 860)");
  mouthOpen.setAttribute("opacity", "0");
  mouthClosed.setAttribute("opacity", "1");
  snackFin.setAttribute("opacity", "0");
  amBubble.setAttribute("opacity", "0");
}

function startLoop() {
  stopLoop();
  lastBubble = 0;
  const loop = (now) => {
    rafId = requestAnimationFrame(loop);
    tickBubbles();
    if (!state.over && now - lastBubble > 460) {
      lastBubble = now;
      spawnBubble();
    }
  };
  rafId = requestAnimationFrame(loop);
}

function stopLoop() {
  cancelAnimationFrame(rafId);
  rafId = 0;
}

function spawnBubble() {
  const bubble = document.createElementNS(SVG_NS, "circle");
  bubble.setAttribute("fill", "rgba(255,255,255,.88)");
  bubble.setAttribute("stroke", "#17324a");
  bubble.setAttribute("stroke-width", "1.2");
  bubbleLayer.appendChild(bubble);
  bubbles.push({
    el: bubble,
    x: 6 + Math.random() * 14,
    y: -30,
    r: 2.2 + Math.random() * 3.2,
    speed: 0.7 + Math.random() * 0.55,
    life: 1,
  });
}

function tickBubbles() {
  for (let i = bubbles.length - 1; i >= 0; i -= 1) {
    const bubble = bubbles[i];
    bubble.y -= bubble.speed * 1.6;
    bubble.x += Math.sin(bubble.y / 14) * 0.18;
    bubble.life -= 0.008;
    if (bubble.life <= 0) {
      bubble.el.remove();
      bubbles.splice(i, 1);
      continue;
    }
    bubble.el.setAttribute("cx", bubble.x.toFixed(1));
    bubble.el.setAttribute("cy", bubble.y.toFixed(1));
    bubble.el.setAttribute("r", bubble.r.toFixed(1));
    bubble.el.setAttribute("opacity", String(Math.max(0, bubble.life)));
  }
}

function clearBubbles() {
  for (const bubble of bubbles) bubble.el.remove();
  bubbles.length = 0;
  bubbleLayer?.replaceChildren();
}

function pickWord() {
  const used = readUsed();
  const known = new Set(WORDS.map((item) => item.w));
  for (const word of used) {
    if (!known.has(word)) used.delete(word);
  }
  let pool = WORDS.filter((item) => !used.has(item.w));
  if (pool.length === 0) {
    used.clear();
    pool = WORDS;
  }
  const medium = pool.filter((item) => item.w.length >= 5 && item.w.length <= 10);
  const bag = medium.length && Math.random() < 0.82 ? medium : pool;
  const picked = bag[Math.floor(Math.random() * bag.length)];
  used.add(picked.w);
  writeUsed(used);
  return picked;
}

function readUsed() {
  try {
    const data = JSON.parse(sessionStorage.getItem(USED_KEY) || "[]");
    return new Set(Array.isArray(data) ? data : []);
  } catch {
    return new Set();
  }
}

function writeUsed(used) {
  try {
    sessionStorage.setItem(USED_KEY, JSON.stringify([...used]));
  } catch {
    /* приватный режим */
  }
}

function loadStats() {
  try {
    const saved = JSON.parse(localStorage.getItem(STATS_KEY) || "{}");
    return {
      wins: Number(saved.wins) || 0,
      losses: Number(saved.losses) || 0,
      streak: Number(saved.streak) || 0,
      best: Number(saved.best) || 0,
    };
  } catch {
    return { wins: 0, losses: 0, streak: 0, best: 0 };
  }
}

function record(won) {
  const stats = loadStats();
  if (won) {
    stats.wins += 1;
    stats.streak += 1;
    stats.best = Math.max(stats.best, stats.streak);
  } else {
    stats.losses += 1;
    stats.streak = 0;
  }
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch {
    /* приватный режим */
  }
  return stats;
}

function renderStats() {
  const stats = loadStats();
  const total = stats.wins + stats.losses;
  menuStats.textContent = total
    ? `Всплытий ${stats.wins} · акул ${stats.losses} · серия ${stats.streak}`
    : "Первое погружение ещё впереди";
  dictNote.textContent = `В словаре ${WORDS.length} слов про море и погружения`;
}

function toggleMute() {
  muted = !muted;
  try {
    localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
  } catch {
    /* приватный режим */
  }
  paintMute();
  if (!muted) unlockAudio();
}

function paintMute() {
  muteBtn.textContent = muted ? "Тихо" : "Звук";
  muteBtn.setAttribute("aria-pressed", muted ? "true" : "false");
  muteBtn.setAttribute("aria-label", muted ? "Включить звук" : "Выключить звук");
}

function unlockAudio() {
  if (muted) return;
  if (!audioCtx) audioCtx = new AudioContext();
  if (audioCtx.state === "suspended") audioCtx.resume();
}

function blip(freq, dur, type, gain) {
  if (muted || !audioCtx) return;
  const t = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const amp = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(amp);
  amp.connect(audioCtx.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

function fanfare() {
  [523, 659, 784, 1046].forEach((freq, index) => {
    setTimeout(() => blip(freq, 0.14, "sine", 0.05), index * 90);
  });
}

globalThis.startForty = start;
})();
