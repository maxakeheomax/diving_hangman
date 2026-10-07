(() => {
const CACHE = "forty-meters-v2";

const ASSETS = [
  "./",
  "./index.html",
  "./css/app.css",
  "./js/boot.js",
  "./js/game.js",
  "./js/words.js",
  "./js/onboard.js",
  "./assets/scene.svg",
  "./assets/icon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./manifest.json",
  "./sw.js",
];

const LABELS = {
  "./": "страница",
  "./index.html": "страница",
  "./css/app.css": "краски",
  "./js/boot.js": "старт",
  "./js/game.js": "правила",
  "./js/words.js": "словарь",
  "./js/onboard.js": "инструкция",
  "./assets/scene.svg": "море и дайвер",
  "./assets/icon.svg": "значок",
  "./assets/icon-192.png": "значок",
  "./assets/icon-512.png": "значок",
  "./manifest.json": "паспорт приложения",
  "./sw.js": "офлайн-режим",
};

const loader = document.querySelector("#loader");
const loaderText = document.querySelector("#loaderText");
const loaderDetail = document.querySelector("#loaderDetail");
const loaderFill = document.querySelector("#loaderFill");
const loaderBar = document.querySelector("#loaderBar");
const loaderError = document.querySelector("#loaderError");
const retryBtn = document.querySelector("#retryBtn");

retryBtn.addEventListener("click", () => location.reload());

function setProgress(ratio, label) {
  const percent = Math.round(ratio * 100);
  loaderFill.style.width = `${percent}%`;
  loaderBar.setAttribute("aria-valuenow", String(percent));
  loaderDetail.textContent = label;
  if (ratio < 1) loaderText.textContent = "Скачиваем снаряжение…";
}

function showError(message) {
  loader.hidden = false;
  document.querySelector("#menu").hidden = true;
  document.querySelector("#play").hidden = true;
  loaderText.textContent = "Первый выход — только с сетью";
  loaderError.hidden = false;
  loaderError.textContent = message;
  retryBtn.hidden = false;
}

async function warmCache() {
  let cache = null;
  if ("caches" in window) {
    try {
      cache = await caches.open(CACHE);
    } catch {
      cache = null;
    }
  }

  const missing = [];
  if (cache) {
    for (const url of ASSETS) {
      if (!(await cache.match(url))) missing.push(url);
    }
  } else {
    missing.push(...ASSETS);
  }

  if (missing.length === 0) {
    setProgress(1, "Снаряжение уже на борту");
    return;
  }

  let done = ASSETS.length - missing.length;
  setProgress(done / ASSETS.length, "Собираем комплект");

  await Promise.all(
    missing.map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(LABELS[url] || url);
      if (cache) {
        const headers = new Headers(response.headers);
        const blob = await response.blob();
        await cache.put(url, new Response(blob, { status: response.status, headers }));
      }
      done += 1;
      setProgress(done / ASSETS.length, LABELS[url] || url);
    })
  );
}

function localFile() {
  return location.protocol === "file:";
}

function mountScene() {
  const svg = document.querySelector("#stageMount svg");
  if (!svg) throw new Error("море и дайвер");
  svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
}

async function registerSW() {
  if (!("serviceWorker" in navigator)) return;
  try {
    await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;
  } catch {
    // Без воркера игра всё равно идёт, пока открыта сеть.
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function boot() {
  const started = performance.now();
  try {
    if (localFile()) {
      setProgress(1, "Снаряжение уже на борту");
    } else {
      await warmCache();
      await registerSW();
    }
    mountScene();
    const elapsed = performance.now() - started;
    if (elapsed < 700) await wait(700 - elapsed);
    startForty();
  } catch (error) {
    const detail = error instanceof Error ? error.message : "";
    showError(
      localFile()
        ? "Не удалось открыть игру. Запускайте index.html из папки игры, вместе с соседними файлами."
        : detail
          ? `Не скачалось: ${detail}. После первой загрузки по сети можно играть и без интернета.`
          : "Нужна сеть на первую загрузку. После этого можно играть офлайн."
    );
  }
}

boot();
})();
