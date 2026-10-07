(() => {
const KEY = "forty-onboard-hide";
const FONT = "ui-rounded, Avenir Next, sans-serif";

function installed() {
  return navigator.standalone === true
    || matchMedia("(display-mode: standalone)").matches
    || matchMedia("(display-mode: fullscreen)").matches;
}

function kind() {
  const ua = navigator.userAgent || "";
  const touchMac = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const ios = /iPhone|iPod|iPad/.test(ua) || touchMac;
  const foreign = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua);
  if (ios && foreign) return "ios-other";
  if (ios) return "ios";
  if (/Android/i.test(ua)) return "android";
  const macSafari = /Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|YaBrowser/.test(ua);
  if (macSafari) return "mac";
  return "other";
}

function offlineNote() {
  const host = location.hostname;
  if (location.protocol === "https:" || host === "localhost" || host === "127.0.0.1") return "";
  return "На айфоне иконка открывается без интернета, если страница была по адресу https. Ссылка http:// с компьютера без сети не откроется.";
}

function svg(body, height = 210) {
  return `<svg viewBox="0 0 320 ${height}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="font-family:${FONT}">${body}</svg>`;
}

function dots(cx, cy) {
  return [-7, 0, 7].map((dx) => `<circle cx="${cx + dx}" cy="${cy}" r="2.7" fill="#17324a"/>`).join("");
}

function vdots(cx, cy) {
  return [-8, 0, 8].map((dy) => `<circle cx="${cx}" cy="${cy + dy}" r="2.7" fill="#17324a"/>`).join("");
}

function shareGlyph(x, y, s = 1) {
  const u = (n) => n * s;
  return `<g fill="none" stroke="#17324a" stroke-width="${Math.max(2, 2.4 * s)}" stroke-linecap="round" stroke-linejoin="round">
    <path d="M${x} ${y + u(7)} h${u(18)} v${u(14)} h${u(-18)} z"/>
    <path d="M${x + u(9)} ${y + u(13)} V${y}"/>
    <path d="M${x + u(4)} ${y + u(5)} L${x + u(9)} ${y} l${u(5)} ${u(5)}"/>
  </g>`;
}

function miniDiver(cx, cy) {
  return `
    <circle cx="${cx}" cy="${cy - 8}" r="7" fill="#243044" stroke="#17324a" stroke-width="2"/>
    <rect x="${cx - 8}" y="${cy - 8}" width="16" height="5" rx="2" fill="#9be7ff" stroke="#17324a" stroke-width="1.5"/>
    <rect x="${cx - 7}" y="${cy}" width="14" height="12" rx="4" fill="#ffd447" stroke="#17324a" stroke-width="2"/>
  `;
}

function appIcon(x, y, hot) {
  return `
    ${hot ? `<rect x="${x - 5}" y="${y - 5}" width="66" height="66" rx="18" fill="none" stroke="#ff6b4a" stroke-width="4" class="hot"/>` : ""}
    <rect x="${x}" y="${y}" width="56" height="56" rx="14" fill="${hot ? "#1496c4" : "#d5e1e8"}" stroke="#17324a" stroke-width="3"/>
    ${hot ? miniDiver(x + 28, y + 30) : ""}
  `;
}

function artHome() {
  let body = `<rect width="320" height="220" fill="#d7f0fb"/>`;
  for (let i = 0; i < 8; i += 1) {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 24 + col * 74;
    const y = 28 + row * 96;
    const hot = i === 2;
    body += appIcon(x, y, hot);
    body += `<text x="${x + 28}" y="${y + 74}" text-anchor="middle" font-size="12" font-weight="800" fill="${hot ? "#ff6b4a" : "#17324a"}">${hot ? "40 метров" : " "}</text>`;
  }
  return svg(body, 220);
}

function artDots() {
  return svg(`
    <rect width="320" height="210" fill="#c5ebf8"/>
    <text x="160" y="34" text-anchor="middle" font-size="16" font-weight="800" fill="#17324a">Строка с адресом сайта</text>
    <rect x="18" y="70" width="284" height="64" rx="32" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <text x="36" y="109" font-size="20" font-weight="800" fill="#17324a">40 метров</text>
    <circle cx="258" cy="102" r="26" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="4" class="hot"/>
    ${dots(258, 102)}
    <text x="160" y="168" text-anchor="middle" font-size="16" font-weight="800" fill="#ff6b4a">нажмите три точки</text>
    <text x="160" y="192" text-anchor="middle" font-size="13" font-weight="700" fill="#3e6274">строка бывает внизу или сверху</text>
  `);
}

function artShareMenu() {
  const rows = [
    ["Поделиться", true],
    ["Закладки", false],
    ["Найти на странице", false],
  ];
  const body = rows.map((row, index) => {
    const y = 46 + index * 50;
    const hot = row[1];
    return `
      <rect x="24" y="${y}" width="272" height="42" rx="12" fill="${hot ? "#ffe8e2" : "#fff"}" stroke="${hot ? "#ff6b4a" : "#17324a"}" stroke-width="3"/>
      ${hot ? shareGlyph(40, y + 8, 1.2) : `<circle cx="52" cy="${y + 21}" r="8" fill="none" stroke="#17324a" stroke-width="2.4"/>`}
      <text x="78" y="${y + 27}" font-size="18" font-weight="800" fill="#17324a">${row[0]}</text>
    `;
  }).join("");
  return svg(`<rect width="320" height="210" fill="#e7f6fb"/><text x="160" y="28" text-anchor="middle" font-size="14" font-weight="800" fill="#3e6274">меню после трёх точек</text>${body}`);
}

function artPlaces() {
  const centers = [48, 66, 84, 102, 120];
  const bar = centers.map((cx, index) => {
    if (index === 2) {
      return `<circle cx="${cx}" cy="154" r="13" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="3" class="hot"/>${shareGlyph(cx - 8, 145, 0.85)}`;
    }
    if (index === 0) return `<path d="M${cx + 4} 148 l-7 6 7 6" fill="none" stroke="#17324a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (index === 1) return `<path d="M${cx - 4} 148 l7 6 -7 6" fill="none" stroke="#17324a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
    if (index === 3) return `<path d="M${cx - 6} 148 h12 v12 h-12 z" fill="none" stroke="#17324a" stroke-width="2"/>`;
    return `<rect x="${cx - 7}" y="147" width="6" height="10" rx="1" fill="none" stroke="#17324a" stroke-width="2"/><rect x="${cx + 1}" y="147" width="6" height="10" rx="1" fill="none" stroke="#17324a" stroke-width="2"/>`;
  }).join("");
  return svg(`
    <rect width="320" height="210" fill="#e7f6fb"/>
    <text x="86" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="#17324a">внизу экрана</text>
    <text x="236" y="26" text-anchor="middle" font-size="14" font-weight="800" fill="#17324a">или сверху</text>
    <rect x="24" y="40" width="124" height="150" rx="16" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <rect x="34" y="136" width="104" height="36" rx="12" fill="#f7fcff" stroke="#17324a" stroke-width="2"/>
    ${bar}
    <rect x="176" y="40" width="120" height="150" rx="16" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <rect x="188" y="54" width="96" height="32" rx="10" fill="#f7fcff" stroke="#17324a" stroke-width="2"/>
    <circle cx="268" cy="70" r="14" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="3" class="hot"/>
    ${shareGlyph(260, 60, 0.85)}
  `);
}

function artSheet() {
  const rows = ["Скопировать", "В избранное", "На экран «Домой»", "Закладка"];
  const body = rows.map((label, index) => {
    const y = 18 + index * 46;
    const hot = index === 2;
    return `
      <rect x="16" y="${y}" width="288" height="40" rx="12" fill="${hot ? "#ffe8e2" : "#fff"}" stroke="${hot ? "#ff6b4a" : "#17324a"}" stroke-width="3"/>
      ${hot
        ? `<rect x="28" y="${y + 9}" width="22" height="22" rx="5" fill="none" stroke="#17324a" stroke-width="2.4"/>
           <path d="M39 ${y + 14} v12 M33 ${y + 20} h12" stroke="#17324a" stroke-width="2.4" stroke-linecap="round"/>`
        : `<circle cx="39" cy="${y + 20}" r="8" fill="none" stroke="#17324a" stroke-width="2.4"/>`}
      <text x="60" y="${y + 26}" font-size="16" font-weight="800" fill="#17324a">${label}</text>
    `;
  }).join("");
  return svg(`<rect width="320" height="210" fill="#e7f6fb"/>${body}`);
}

function artConfirm() {
  return svg(`
    <rect width="320" height="230" fill="#e7f6fb"/>
    <text x="16" y="34" font-size="16" font-weight="700" fill="#8aa0ae">Отменить</text>
    <rect x="186" y="8" width="118" height="38" rx="12" fill="#fff" stroke="#ff6b4a" stroke-width="4" class="hot"/>
    <text x="210" y="33" font-size="18" font-weight="800" fill="#007aff">Добавить</text>
    <rect x="132" y="58" width="56" height="56" rx="14" fill="#1496c4" stroke="#17324a" stroke-width="3"/>
    ${miniDiver(160, 86)}
    <text x="160" y="134" text-anchor="middle" font-size="16" font-weight="800" fill="#17324a">40 метров</text>
    <rect x="16" y="150" width="288" height="64" rx="14" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <text x="28" y="176" font-size="14" font-weight="800" fill="#17324a">Открыть как</text>
    <text x="28" y="196" font-size="14" font-weight="800" fill="#17324a">веб-приложение</text>
    <rect x="228" y="166" width="60" height="32" rx="16" fill="#34c759" stroke="#ff6b4a" stroke-width="3"/>
    <circle cx="270" cy="182" r="11" fill="#fff" stroke="#17324a" stroke-width="2"/>
  `, 230);
}

function artMacShare() {
  return svg(`
    <rect width="320" height="210" fill="#d7f0fb"/>
    <rect x="16" y="28" width="288" height="132" rx="14" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <circle cx="40" cy="52" r="7" fill="#ff5f57" stroke="#17324a" stroke-width="1.6"/>
    <circle cx="62" cy="52" r="7" fill="#febc2e" stroke="#17324a" stroke-width="1.6"/>
    <circle cx="84" cy="52" r="7" fill="#28c840" stroke="#17324a" stroke-width="1.6"/>
    <rect x="36" y="78" width="188" height="36" rx="8" fill="#f4fbff" stroke="#17324a" stroke-width="2"/>
    <text x="48" y="102" font-size="15" font-weight="800" fill="#17324a">40 метров</text>
    <circle cx="264" cy="96" r="24" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="4" class="hot"/>
    ${shareGlyph(255, 84, 1.05)}
    <text x="160" y="188" text-anchor="middle" font-size="15" font-weight="800" fill="#ff6b4a">эта кнопка справа вверху</text>
  `);
}

function menuRows(labels) {
  return labels.map((row, index) => {
    const y = 36 + index * 52;
    const hot = row[1];
    return `
      <rect x="24" y="${y}" width="272" height="44" rx="12" fill="${hot ? "#ffe8e2" : "#fff"}" stroke="${hot ? "#ff6b4a" : "#17324a"}" stroke-width="3"/>
      <text x="40" y="${y + 28}" font-size="18" font-weight="800" fill="#17324a">${row[0]}</text>
    `;
  }).join("");
}

function artMacMenu() {
  return svg(`<rect width="320" height="210" fill="#e7f6fb"/>${menuRows([["Скопировать", false], ["Добавить в Dock", true], ["Закладка", false]])}`);
}

function artMacAdd() {
  return svg(`
    <rect width="320" height="210" fill="#e7f6fb"/>
    <rect x="40" y="24" width="240" height="120" rx="16" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <rect x="132" y="40" width="56" height="56" rx="14" fill="#1496c4" stroke="#17324a" stroke-width="3"/>
    ${miniDiver(160, 68)}
    <text x="160" y="116" text-anchor="middle" font-size="15" font-weight="800" fill="#17324a">40 метров</text>
    <rect x="168" y="156" width="128" height="40" rx="12" fill="#fff" stroke="#ff6b4a" stroke-width="4" class="hot"/>
    <text x="232" y="182" text-anchor="middle" font-size="16" font-weight="800" fill="#007aff">Добавить</text>
  `);
}

function artAndroidMenu() {
  return svg(`
    <rect width="320" height="210" fill="#e7f6fb"/>
    <rect x="16" y="48" width="288" height="56" rx="14" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <text x="36" y="82" font-size="16" font-weight="800" fill="#17324a">40 метров</text>
    <circle cx="262" cy="76" r="24" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="4" class="hot"/>
    ${vdots(262, 76)}
    <text x="160" y="150" text-anchor="middle" font-size="16" font-weight="800" fill="#ff6b4a">три точки справа вверху</text>
  `);
}

function artAndroidRow() {
  return svg(`
    <rect width="320" height="210" fill="#e7f6fb"/>
    <rect x="24" y="28" width="272" height="44" rx="12" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <text x="40" y="56" font-size="18" font-weight="800" fill="#17324a">Новая вкладка</text>
    <rect x="24" y="82" width="272" height="58" rx="12" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="3"/>
    <text x="40" y="106" font-size="16" font-weight="800" fill="#17324a">Добавить на</text>
    <text x="40" y="126" font-size="16" font-weight="800" fill="#17324a">главный экран</text>
    <rect x="24" y="150" width="272" height="44" rx="12" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <text x="40" y="178" font-size="18" font-weight="800" fill="#17324a">Найти на странице</text>
  `);
}

function artAndroidAdd() {
  return svg(`
    <rect width="320" height="210" fill="#e7f6fb"/>
    <rect x="36" y="28" width="248" height="110" rx="16" fill="#fff" stroke="#17324a" stroke-width="3"/>
    ${appIcon(132, 44, false)}
    <text x="160" y="122" text-anchor="middle" font-size="16" font-weight="800" fill="#17324a">40 метров</text>
    <rect x="170" y="156" width="126" height="40" rx="12" fill="#fff" stroke="#ff6b4a" stroke-width="4" class="hot"/>
    <text x="233" y="182" text-anchor="middle" font-size="16" font-weight="800" fill="#007aff">Добавить</text>
  `);
}

function artSafari() {
  return svg(`
    <rect width="320" height="210" fill="#e7f6fb"/>
    <rect x="108" y="24" width="104" height="104" rx="26" fill="#1c7cf2" stroke="#17324a" stroke-width="3"/>
    <circle cx="160" cy="76" r="30" fill="none" stroke="#fff" stroke-width="4"/>
    <path d="M160 54 l8 28 -8 -6 -8 6 z" fill="#ff4b4b" stroke="#17324a" stroke-width="2"/>
    <path d="M160 98 l-8 -28 8 6 8 -6 z" fill="#fff" stroke="#17324a" stroke-width="2"/>
    <text x="160" y="162" text-anchor="middle" font-size="22" font-weight="800" fill="#17324a">Safari</text>
    <text x="160" y="188" text-anchor="middle" font-size="14" font-weight="700" fill="#3e6274">синий компас среди приложений</text>
  `);
}

function miniDots() {
  return `<svg viewBox="0 0 148 72" aria-hidden="true" style="font-family:${FONT}">
    <rect width="148" height="72" rx="10" fill="#e7f6fb"/>
    <rect x="6" y="16" width="136" height="40" rx="20" fill="#fff" stroke="#17324a" stroke-width="3"/>
    <text x="16" y="41" font-size="12" font-weight="800" fill="#17324a">адрес</text>
    <circle cx="118" cy="36" r="15" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="3"/>
    ${dots(118, 36)}
  </svg>`;
}

function miniShare() {
  return `<svg viewBox="0 0 148 72" aria-hidden="true">
    <rect width="148" height="72" rx="10" fill="#e7f6fb"/>
    <circle cx="74" cy="36" r="24" fill="#ffe8e2" stroke="#ff6b4a" stroke-width="3"/>
    ${shareGlyph(65, 22, 1.2)}
  </svg>`;
}

const SHEET_NOTE = "Пролистайте список вниз. Если строки не видно, нажмите стрелку вниз, чтобы открыть весь список. В самом низу есть «Редактировать действия»: там тоже можно включить «На экран „Домой“».";

const STEPS = {
  intro: {
    title: "Поставьте игру на экран",
    text: "Иконка встанет рядом с обычными приложениями. Дальше открывайте её с экрана «Домой» — интернет для этого не нужен.",
    art: artHome,
    next: "pick",
  },
  pick: {
    title: "На что похож ваш Safari?",
    text: "Посмотрите на браузер и нажмите картинку, которая похожа на ваш экран.",
    choices: [
      { art: miniDots, label: "Три точки справа от адреса", goto: "dots" },
      { art: miniShare, label: "Квадрат со стрелкой вверх", goto: "places" },
    ],
    alt: { label: "Я открыл не Safari", goto: "need-safari" },
  },
  dots: {
    title: "Нажмите три точки",
    text: "Они на правом краю строки, где написан адрес. Нажмите точки, не саму надпись «40 метров».",
    art: artDots,
    next: "sharemenu",
  },
  sharemenu: {
    title: "Нажмите «Поделиться»",
    text: "В открывшемся меню выберите строку «Поделиться». Рядом с ней квадрат со стрелкой вверх.",
    art: artShareMenu,
    next: "sheet",
  },
  places: {
    title: "Нажмите «Поделиться»",
    text: "Это квадрат со стрелкой вверх. Чаще всего он внизу посередине. Если кнопки сверху — он справа.",
    art: artPlaces,
    next: "sheet",
  },
  sheet: {
    title: "Нажмите «На экран Домой»",
    text: "В списке найдите строку «На экран «Домой»». На картинке она выделена розовым.",
    art: artSheet,
    note: SHEET_NOTE,
    next: "confirm",
  },
  confirm: {
    title: "Нажмите «Добавить»",
    text: "Сначала проверьте зелёный переключатель «Открыть как веб-приложение»: кружок должен быть справа, как на картинке. Потом нажмите синее «Добавить» справа вверху.",
    art: artConfirm,
    note: "После «Добавить» ищите иконку «40 метров» среди приложений.",
    https: true,
    last: true,
  },
  "need-safari": {
    title: "Сначала откройте Safari",
    text: "Кнопка «На экран Домой» есть только в синем приложении с компасом. Скопируйте адрес, откройте Safari и вставьте его в строку сверху.",
    art: artSafari,
    copy: true,
  },
  "intro-mac": {
    title: "Поставьте игру в Dock",
    text: "Иконка появится внизу экрана, в панели Dock. Оттуда игра открывается без окна Safari.",
    art: artDock,
    next: "mac-share",
  },
  "mac-share": {
    title: "Нажмите «Поделиться»",
    text: "Вверху окна Safari, справа от адреса, квадрат со стрелкой вверх.",
    art: artMacShare,
    next: "mac-menu",
  },
  "mac-menu": {
    title: "Нажмите «Добавить в Dock»",
    text: "В меню найдите эту строку. Если её не видно, пролистайте меню вниз.",
    art: artMacMenu,
    next: "mac-add",
  },
  "mac-add": {
    title: "Нажмите «Добавить»",
    text: "Иконка «40 метров» появится в Dock. Дальше открывайте игру оттуда.",
    art: artMacAdd,
    https: true,
    last: true,
  },
  "need-mac": {
    title: "Откройте эту страницу в Safari",
    text: "Поставить иконку можно из Safari: скопируйте адрес и вставьте его в строку сверху. Инструкция покажется снова.",
    art: artSafari,
    copy: true,
    alt: { label: "Показать шаги для айфона", goto: "intro" },
  },
  "intro-android": {
    title: "Поставьте игру на экран",
    text: "Иконка появится среди приложений. Дальше её можно открывать без интернета.",
    art: artHome,
    next: "and-menu",
  },
  "and-menu": {
    title: "Нажмите три точки",
    text: "Они справа вверху, в одной строке с адресом.",
    art: artAndroidMenu,
    next: "and-row",
  },
  "and-row": {
    title: "Нажмите строку про экран",
    text: "В меню выберите «Добавить на главный экран». Если написано «Установить приложение» — нажимайте его, это то же самое.",
    art: artAndroidRow,
    next: "and-add",
  },
  "and-add": {
    title: "Нажмите «Добавить»",
    text: "На кнопке может быть написано «Установить». Иконка «40 метров» появится на главном экране.",
    art: artAndroidAdd,
    https: true,
    last: true,
  },
};

function artDock() {
  return svg(`
    <rect width="320" height="210" fill="#d7f0fb"/>
    <text x="160" y="40" text-anchor="middle" font-size="16" font-weight="800" fill="#17324a">Dock внизу экрана</text>
    <rect x="132" y="58" width="56" height="56" rx="14" fill="#1496c4" stroke="#ff6b4a" stroke-width="4" class="hot"/>
    ${miniDiver(160, 86)}
    <text x="160" y="132" text-anchor="middle" font-size="13" font-weight="800" fill="#ff6b4a">40 метров</text>
    <rect x="24" y="148" width="272" height="42" rx="16" fill="#fff" stroke="#17324a" stroke-width="3"/>
  `);
}

const START = {
  ios: "intro",
  "ios-other": "need-safari",
  android: "intro-android",
  mac: "intro-mac",
  other: "need-mac",
};

let stack = [];
let done = () => {};

function current() {
  return STEPS[stack[stack.length - 1]];
}

function render() {
  const step = current();
  const kicker = document.querySelector("#onboardKicker");
  const title = document.querySelector("#onboardTitle");
  const art = document.querySelector("#onboardArt");
  const text = document.querySelector("#onboardText");
  const note = document.querySelector("#onboardNote");
  const choices = document.querySelector("#onboardChoices");
  const back = document.querySelector("#onboardBack");
  const next = document.querySelector("#onboardNext");
  const skip = document.querySelector("#onboardSkip");
  const hide = document.querySelector("#onboardHide");
  const copy = document.querySelector("#onboardCopy");
  const url = document.querySelector("#onboardUrl");
  const alt = document.querySelector("#onboardAlt");

  kicker.textContent = kickerText(step);
  title.textContent = step.title;
  text.textContent = step.text;
  const noteText = [step.note, step.https ? offlineNote() : ""].filter(Boolean).join(" ");
  note.hidden = !noteText;
  note.textContent = noteText;
  url.hidden = true;
  copy.hidden = !step.copy;
  copy.textContent = "Скопировать адрес";

  if (step.choices) {
    art.hidden = true;
    choices.hidden = false;
    choices.replaceChildren();
    for (const choice of step.choices) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "choice";
      button.insertAdjacentHTML("beforeend", choice.art());
      const label = document.createElement("span");
      label.textContent = choice.label;
      button.appendChild(label);
      button.addEventListener("click", () => go(choice.goto));
      choices.appendChild(button);
    }
  } else {
    choices.hidden = true;
    choices.replaceChildren();
    art.hidden = false;
    art.innerHTML = step.art();
  }

  back.hidden = stack.length < 2;
  next.hidden = Boolean(step.choices || step.copy);
  next.textContent = step.last ? "Понятно, играть" : "Дальше";
  hide.hidden = !step.last;
  skip.hidden = Boolean(step.last);
  alt.hidden = !step.alt;
  alt.textContent = step.alt ? step.alt.label : "";
}

function kickerText(step) {
  if (step.choices) return "выберите картинку";
  if (step.copy && !step.next) return "сначала браузер";
  const count = stack.filter((id) => STEPS[id] && !STEPS[id].choices).length;
  return `шаг ${count}`;
}

function go(id) {
  stack.push(id);
  render();
}

function show(onDone) {
  done = onDone || (() => {});
  stack = [START[kind()]];
  document.querySelector("#menu").hidden = true;
  document.querySelector("#play").hidden = true;
  document.querySelector("#overlay").hidden = true;
  document.querySelector("#loader").hidden = true;
  document.querySelector("#onboard").hidden = false;
  render();
}

function maybeShow(onDone) {
  if (installed()) return false;
  try {
    if (localStorage.getItem(KEY) === "1") return false;
  } catch {
    /* приватный режим всё равно показывает инструкцию */
  }
  show(onDone);
  return true;
}

function finish(remember) {
  if (remember) {
    try { localStorage.setItem(KEY, "1"); } catch { /* останется напоминание */ }
  }
  document.querySelector("#onboard").hidden = true;
  done();
}

async function copyUrl() {
  const note = document.querySelector("#onboardNote");
  const url = document.querySelector("#onboardUrl");
  const button = document.querySelector("#onboardCopy");
  let ok = false;
  try {
    await navigator.clipboard.writeText(location.href);
    ok = true;
  } catch {
    ok = false;
  }
  if (ok) {
    button.textContent = "Адрес скопирован";
    note.hidden = false;
    note.textContent = "Теперь откройте Safari, коснитесь строки сверху и вставьте адрес.";
    return;
  }
  url.hidden = false;
  url.value = location.href;
  url.focus();
  url.select();
  note.hidden = false;
  note.textContent = "Выделите адрес ниже и скопируйте его. Потом вставьте в Safari.";
}

document.querySelector("#onboardBack").addEventListener("click", () => {
  if (stack.length > 1) stack.pop();
  render();
});
document.querySelector("#onboardNext").addEventListener("click", () => {
  const step = current();
  if (step.last) finish(false);
  else go(step.next);
});
document.querySelector("#onboardSkip").addEventListener("click", () => finish(false));
document.querySelector("#onboardHide").addEventListener("click", () => finish(true));
document.querySelector("#onboardCopy").addEventListener("click", copyUrl);
document.querySelector("#onboardAlt").addEventListener("click", () => {
  const step = current();
  if (step.alt) go(step.alt.goto);
});

globalThis.FortyInstall = { maybeShow, show, installed };
})();
