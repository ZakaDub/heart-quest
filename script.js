/**
 * ═══════════════════════════════════════════════════════════
 *  ГДЕ МЕНЯТЬ ТЕКСТЫ (важно!)
 * ═══════════════════════════════════════════════════════════
 *  config.js  ← МЕНЯЙ ТЕКСТЫ КАРТОЧЕК, ФИНАЛА, ФОТО И МУЗЫКИ ЗДЕСЬ
 *  script.js:
 *    • showToast сообщения → подсказки при ошибке на странице 2
 *
 *  HTML-файлы (script.js их НЕ меняет):
 *    • index.html   → заголовок, подсказка, кнопка «Дальшии»
 *    • puzzle2.html → заголовок, подсказка, кнопка «Дальши»
 *    • puzzle3.html → заголовок, «Умница…», кнопка «Финол»
 *    • final.html   → кнопка, текст на экране завершения (overlay)
 *
 *  Открывай сайт из папки: C:\Users\zakdu\Projects\heart-quest\
 *  После правок: Ctrl+S и жёсткое обновление Ctrl+Shift+R
 * ═══════════════════════════════════════════════════════════
 */

// Версия — увеличь число, если браузер показывает старый script.js
const SCRIPT_VERSION = 8;

// ===== Звуки =====
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/** Короткий звук лопания шарика */
function playPopSound() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(420, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.12);
}

/** Звук праздничной хлопушки */
function playPopperSound() {
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  const bufferSize = Math.floor(ctx.sampleRate * 0.12);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.22, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
  noise.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);

  const pop = ctx.createOscillator();
  const popGain = ctx.createGain();
  pop.type = "sine";
  pop.frequency.setValueAtTime(180, t);
  pop.frequency.exponentialRampToValueAtTime(60, t + 0.08);
  popGain.gain.setValueAtTime(0.18, t);
  popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
  pop.connect(popGain);
  popGain.connect(ctx.destination);
  pop.start(t);
  pop.stop(t + 0.1);
}

let questMusicAudio = null;

/** Фоновая музыка квеста (после пазла с Мяулем и на финале) */
function startQuestMusic(musicSrc) {
  if (!musicSrc) return;

  if (questMusicAudio) {
    if (questMusicAudio.paused) questMusicAudio.play().catch(() => {});
    return;
  }

  questMusicAudio = new Audio(musicSrc);
  questMusicAudio.loop = true;
  questMusicAudio.volume = 0.4;
  questMusicAudio.play().catch(() => {});
}

/** Взрыв конфетти */
function launchConfetti() {
  const canvas = document.createElement("canvas");
  canvas.className = "confetti-canvas";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  const colors = ["#ff4d8d", "#ff2d55", "#ffd166", "#fff5f8", "#c77dff", "#ff9ec8", "#4dff91"];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();

  const pieces = [];
  const originX = canvas.width * 0.5;
  const originY = canvas.height * 0.35;

  for (let n = 0; n < 140; n++) {
    pieces.push({
      x: originX + (Math.random() - 0.5) * 120,
      y: originY + (Math.random() - 0.5) * 60,
      vx: (Math.random() - 0.5) * 16,
      vy: Math.random() * -14 - 5,
      w: 5 + Math.random() * 7,
      h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rot: Math.random() * 360,
      vr: (Math.random() - 0.5) * 14,
      gravity: 0.22 + Math.random() * 0.12,
    });
  }

  let frame = 0;

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let visible = 0;

    pieces.forEach((p) => {
      p.vy += p.gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vx *= 0.99;

      if (p.y < canvas.height + 30) visible++;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rot * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    frame++;
    if (frame < 200 && visible > 0) {
      requestAnimationFrame(tick);
    } else {
      canvas.remove();
    }
  }

  requestAnimationFrame(tick);
}

/** Мягкий клик / разблокировка */
function playClickSound() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(600, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.08);
  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.2);
}

/** Звук «дзынь» при правильной паре */
function playDingSound() {
  const ctx = getAudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.setValueAtTime(880, ctx.currentTime);
  osc.frequency.setValueAtTime(1100, ctx.currentTime + 0.05);
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.4);
}

/** Приятный звук завершения раскраски / финала */
function playSuccessSound() {
  const ctx = getAudioContext();
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    const t = ctx.currentTime + i * 0.12;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    osc.start(t);
    osc.stop(t + 0.35);
  });
}

/** Плавный переход на другую страницу */
function navigateTo(url) {
  document.body.classList.add("page-exit");
  setTimeout(() => {
    window.location.href = url;
  }, 500);
}

/** Toast-подсказка */
function showToast(message, duration = 2500) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), duration);
}

// ===== Страница 1: Шарики на весь экран =====
function initHeartPage() {
  const field = document.getElementById("balls-field");
  if (!field) return;

  initHeartAmbience();

  const width = window.innerWidth;
  const height = window.innerHeight;
  // Меньше шарики — больше детализация сердца
  const baseRadius = Math.max(9, Math.min(14, Math.min(width, height) / 38));

  const balls = generatePackedBalls(width, height, baseRadius);
  settleBalls(balls, width, height, 15);

  const isInHeart = createHeartMask(width, height);

  balls.forEach((b) => {
    if (isInHeart(b.x, b.y)) {
      b.isHeart = true;
    }
  });

  // Кнопка спрятана за одним случайным шариком
  const secretIndex = Math.floor(Math.random() * balls.length);
  let secretRevealed = false;

  const ballElements = [];
  const popped = new Set();
  let lastPopTime = 0;
  const secretBtn = document.getElementById("heart-secret-btn");

  // Пространственная сетка — быстрый поиск шариков под курсором
  const cellSize = baseRadius * 2.4;
  const spatialGrid = new Map();

  function gridKey(gx, gy) {
    return gx + "," + gy;
  }

  function addBallToGrid(index) {
    const b = balls[index];
    const gx = Math.floor(b.x / cellSize);
    const gy = Math.floor(b.y / cellSize);
    const k = gridKey(gx, gy);
    if (!spatialGrid.has(k)) spatialGrid.set(k, []);
    spatialGrid.get(k).push(index);
  }

  function removeBallFromGrid(index) {
    const b = balls[index];
    const gx = Math.floor(b.x / cellSize);
    const gy = Math.floor(b.y / cellSize);
    const k = gridKey(gx, gy);
    const cell = spatialGrid.get(k);
    if (!cell) return;
    const pos = cell.indexOf(index);
    if (pos !== -1) cell.splice(pos, 1);
    if (cell.length === 0) spatialGrid.delete(k);
  }

  const fragment = document.createDocumentFragment();

  balls.forEach((b, i) => {
    const el = document.createElement("div");
    const diameter = b.r * 2;

    el.className = "ball " + (b.isHeart ? "ball-heart" : "ball-normal");
    if (i === secretIndex) el.classList.add("ball-secret-cover");

    el.style.width = diameter + "px";
    el.style.height = diameter + "px";
    el.style.left = b.x + "px";
    el.style.top = b.y + "px";
    el.style.zIndex = b.isHeart ? 2 : 1;

    fragment.appendChild(el);
    ballElements.push({ el });
    addBallToGrid(i);
  });

  field.appendChild(fragment);

  if (secretBtn) {
    secretBtn.style.left = balls[secretIndex].x + "px";
    secretBtn.style.top = balls[secretIndex].y + "px";
    secretBtn.addEventListener("click", () => {
      if (!secretRevealed) return;
      playClickSound();
      navigateTo("puzzle2.html");
    });
  }

  function findBallsAt(mx, my) {
    const hits = [];
    const gx = Math.floor(mx / cellSize);
    const gy = Math.floor(my / cellSize);

    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const cell = spatialGrid.get(gridKey(gx + dx, gy + dy));
        if (!cell) continue;
        for (let n = 0; n < cell.length; n++) {
          const i = cell[n];
          if (popped.has(i)) continue;
          const b = balls[i];
          const r2 = b.r * b.r;
          const dxp = mx - b.x;
          const dyp = my - b.y;
          if (dxp * dxp + dyp * dyp <= r2) hits.push(i);
        }
      }
    }
    return hits;
  }

  function revealSecretButton() {
    if (secretRevealed || !secretBtn) return;
    secretRevealed = true;
    secretBtn.classList.add("revealed");
    secretBtn.style.left = balls[secretIndex].x + "px";
    secretBtn.style.top = balls[secretIndex].y + "px";
  }

  function popBall(index) {
    if (popped.has(index)) return;
    popped.add(index);
    balls[index].popped = true;
    removeBallFromGrid(index);

    const { el } = ballElements[index];
    el.classList.add("popping");

    const now = Date.now();
    if (now - lastPopTime > 100) {
      playPopSound();
      lastPopTime = now;
    }

    if (index === secretIndex) {
      el.addEventListener("animationend", () => {
        el.remove();
        revealSecretButton();
      }, { once: true });
    } else {
      el.addEventListener("animationend", () => el.remove(), { once: true });
    }
  }

  const MAX_POPS_PER_FRAME = 2;

  function popBallsAt(clientX, clientY) {
    const hits = findBallsAt(clientX, clientY);
    for (let i = 0; i < Math.min(hits.length, MAX_POPS_PER_FRAME); i++) {
      popBall(hits[i]);
    }
  }

  // Лопание по наведению (без физики — шарики стоят на месте)
  let hoverX = 0;
  let hoverY = 0;
  let hoverQueued = false;

  function queuePopAt(clientX, clientY) {
    hoverX = clientX;
    hoverY = clientY;
    if (hoverQueued) return;
    hoverQueued = true;
    requestAnimationFrame(() => {
      popBallsAt(hoverX, hoverY);
      hoverQueued = false;
    });
  }

  field.addEventListener("mousemove", (e) => queuePopAt(e.clientX, e.clientY));
  field.addEventListener("touchstart", (e) => {
    popBallsAt(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  field.addEventListener("touchmove", (e) => {
    popBallsAt(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
}

/** Рисуем маску сердца и возвращаем функцию проверки точки */
function createHeartMask(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const cx = width / 2;
  const cy = height / 2;
  const heartWidth = Math.min(width, height) * 0.42;
  const scale = heartWidth / 32;

  ctx.fillStyle = "#fff";
  ctx.beginPath();

  for (let i = 0; i <= 400; i++) {
    const t = (i / 400) * Math.PI * 2;
    const hx = 16 * Math.pow(Math.sin(t), 3);
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const px = cx + hx * scale;
    const py = cy + hy * scale;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }

  ctx.closePath();
  ctx.fill();

  return (x, y) => {
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 0 || iy < 0 || ix >= width || iy >= height) return false;
    return ctx.getImageData(ix, iy, 1, 1).data[3] > 128;
  };
}

/** Генерация шариков на всю страницу */
function generatePackedBalls(width, height, radius) {
  const balls = [];
  const spacing = radius * 1.88;
  const rowHeight = spacing * (Math.sqrt(3) / 2);

  let row = 0;
  for (let y = radius; y <= height + radius; y += rowHeight, row++) {
    const xShift = row % 2 === 1 ? spacing / 2 : 0;
    for (let x = radius + xShift; x <= width + radius; x += spacing) {
      const jitter = radius * 0.04;
      balls.push({
        x: x + (Math.random() - 0.5) * jitter,
        y: y + (Math.random() - 0.5) * jitter,
        r: radius,
      });
    }
  }
  return balls;
}

/** Уплотнение: шарики отталкиваются друг от друга и от стен */
function settleBalls(balls, width, height, iterations) {
  for (let n = 0; n < iterations; n++) {
    balls.forEach((b) => {
      if (b.popped) return;
      if (b.x - b.r < 0) b.x = b.r;
      if (b.x + b.r > width) b.x = width - b.r;
      if (b.y - b.r < 0) b.y = b.r;
      if (b.y + b.r > height) b.y = height - b.r;
    });

    for (let i = 0; i < balls.length; i++) {
      if (balls[i].popped) continue;
      for (let j = i + 1; j < balls.length; j++) {
        if (balls[j].popped) continue;
        const a = balls[i];
        const b = balls[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const minDist = a.r + b.r;

        if (dist < minDist) {
          const overlap = (minDist - dist) * 0.5;
          const nx = dx / dist;
          const ny = dy / dist;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
        }
      }
    }
  }
}

/** Перемешивание Фишера–Йейтса (каждый раз новый порядок) */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ===== Страница 2: Соединение пар =====
function initPairsPage() {
  const container = document.getElementById("pairs-container");
  const nextBtn = document.getElementById("btn-next");
  const progressEl = document.getElementById("pairs-progress");
  if (!container) return;

  // === ТВОИ ФРАЗЫ — редактируй config.js в корне проекта ===
  const CUSTOM_PAIRS = (window.QUEST_CONFIG && window.QUEST_CONFIG.pairs) || [
    { id: 1, text: "пример" },
    { id: 1, text: "пара" },
  ];

  let matchedCount = 0;
  const totalPairs = CUSTOM_PAIRS.length / 2;
  let selectedCard = null;
  let isProcessing = false;

  // Перетасовка при каждой перезагрузке страницы
  const shuffled = shuffleArray(CUSTOM_PAIRS);

  shuffled.forEach((item, index) => {
    const card = document.createElement("div");
    card.className = "pair-card";
    card.textContent = item.text;
    card.dataset.pairId = item.id;
    card.dataset.index = index;
    container.appendChild(card);

    // Клик для выбора пары
    card.addEventListener("click", () => handleCardClick(card));

    // Drag & drop
    card.draggable = true;
    card.addEventListener("dragstart", (e) => {
      if (card.classList.contains("matched")) return;
      card.classList.add("dragging");
      e.dataTransfer.setData("text/plain", index);
    });
    card.addEventListener("dragend", () => card.classList.remove("dragging"));
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!card.classList.contains("matched")) {
        card.classList.add("drop-target");
      }
    });
    card.addEventListener("dragleave", () => card.classList.remove("drop-target"));
    card.addEventListener("drop", (e) => {
      e.preventDefault();
      card.classList.remove("drop-target");
      const fromIndex = e.dataTransfer.getData("text/plain");
      const fromCard = container.children[fromIndex];
      if (fromCard && fromCard !== card) {
        tryMatch(fromCard, card);
      }
    });
  });

  function updateProgress() {
    if (progressEl) {
      progressEl.textContent = `Собрано пар: ${matchedCount} / ${totalPairs}`;
    }
  }
  updateProgress();

  function handleCardClick(card) {
    if (card.classList.contains("matched") || isProcessing) return;

    if (!selectedCard) {
      selectedCard = card;
      card.classList.add("selected");
      return;
    }

    if (selectedCard === card) {
      selectedCard.classList.remove("selected");
      selectedCard = null;
      return;
    }

    tryMatch(selectedCard, card);
  }

  function tryMatch(cardA, cardB) {
    if (cardA.classList.contains("matched") || cardB.classList.contains("matched")) {
      clearSelection();
      return;
    }

    isProcessing = true;

    if (cardA.dataset.pairId === cardB.dataset.pairId) {
      cardA.classList.add("matched");
      cardB.classList.add("matched");
      cardA.classList.remove("selected", "dragging");
      cardB.classList.remove("selected", "dragging");
      matchedCount++;
      updateProgress();
      playDingSound();
      clearSelection();

      if (matchedCount === totalPairs) {
        setTimeout(() => {
          container.querySelectorAll(".pair-card").forEach((c) => c.classList.add("glow-all"));
          if (nextBtn) nextBtn.classList.add("visible");
          showToast("Ууууумница мояя 💋❤");
        }, 400);
      }
    } else {
      showToast("Почти! Попробуй другую пару 💫");
      cardA.classList.add("selected");
      cardB.classList.add("selected");
      setTimeout(() => {
        cardA.classList.remove("selected");
        cardB.classList.remove("selected");
        clearSelection();
      }, 800);
    }

    isProcessing = false;
  }

  function clearSelection() {
    if (selectedCard) {
      selectedCard.classList.remove("selected");
      selectedCard = null;
    }
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      playClickSound();
      navigateTo("puzzle3.html");
    });
  }
}

// ===== Страница 3: Пазл с картинкой «Мяуль» =====
function initSlidePuzzlePage() {
  const boardEl = document.getElementById("slide-board");
  const messageEl = document.getElementById("slide-message");
  const nextBtn = document.getElementById("btn-next");
  if (!boardEl) return;

  const cfg = window.QUEST_CONFIG || {};
  const QUEST_MUSIC_SRC = cfg.finishMusicSrc || "";

  const COLS = 3;
  const ROWS = 4;
  const IMG = "assets/meowl-puzzle.png";
  const EDGE = { r: ROWS - 1, c: COLS - 1 };
  const EXT = { r: ROWS - 1, c: COLS };

  const state = {};
  let emptyPos = { r: EXT.r, c: EXT.c };
  let isComplete = false;

  function key(r, c) {
    return r + "," + c;
  }

  function isExternal(r, c) {
    return r === EXT.r && c === EXT.c;
  }

  function getNeighbors(r, c) {
    const list = [];
    const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) list.push({ r: nr, c: nc });
    }
    if (r === EDGE.r && c === EDGE.c) list.push({ r: EXT.r, c: EXT.c });
    if (isExternal(r, c)) list.push({ r: EDGE.r, c: EDGE.c });
    return list;
  }

  function initSolved() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        state[key(r, c)] = r * COLS + c;
      }
    }
    state[key(EXT.r, EXT.c)] = -1;
    emptyPos = { r: EXT.r, c: EXT.c };
  }

  function isPuzzleSolved() {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (state[key(r, c)] !== r * COLS + c) return false;
      }
    }
    return state[key(EXT.r, EXT.c)] === -1;
  }

  function shuffle() {
    initSolved();
    const moves = COLS * ROWS * 40;
    for (let i = 0; i < moves; i++) {
      const neighbors = getNeighbors(emptyPos.r, emptyPos.c);
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      moveTile(pick.r, pick.c, true);
    }

    // Случайные ходы иногда возвращают пазл в «победу» — добиваемся перемешанного состояния
    let guard = 0;
    while (isPuzzleSolved() && guard < 50) {
      const neighbors = getNeighbors(emptyPos.r, emptyPos.c);
      const pick = neighbors[Math.floor(Math.random() * neighbors.length)];
      moveTile(pick.r, pick.c, true);
      guard++;
    }

    isComplete = false;
    if (messageEl) messageEl.classList.remove("show");
    if (nextBtn) nextBtn.classList.remove("visible");
    boardEl.classList.remove("complete-glow");
    render();
  }

  function moveTile(r, c, silent) {
    const neighbors = getNeighbors(emptyPos.r, emptyPos.c);
    if (!neighbors.some((n) => n.r === r && n.c === c)) return false;

    const fromKey = key(r, c);
    const toKey = key(emptyPos.r, emptyPos.c);
    state[toKey] = state[fromKey];
    state[fromKey] = -1;
    emptyPos = { r, c };

    if (!silent) {
      playPopSound();
      render();
      checkWin();
    }
    return true;
  }

  function tileBg(pieceId) {
    const col = pieceId % COLS;
    const row = Math.floor(pieceId / COLS);
    const x = COLS > 1 ? (col / (COLS - 1)) * 100 : 0;
    const y = ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0;
    return { x, y };
  }

  function render() {
    boardEl.innerHTML = "";

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const pieceId = state[key(r, c)];

        if (pieceId === -1) {
          const empty = document.createElement("div");
          empty.className = "slide-empty internal";
          empty.style.gridColumn = String(c + 1);
          empty.style.gridRow = String(r + 1);
          boardEl.appendChild(empty);
          continue;
        }

        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "slide-tile";
        btn.style.gridColumn = String(c + 1);
        btn.style.gridRow = String(r + 1);
        btn.style.backgroundImage = `url("${IMG}")`;
        btn.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
        const pos = tileBg(pieceId);
        btn.style.backgroundPosition = `${pos.x}% ${pos.y}%`;
        btn.disabled = isComplete;
        btn.addEventListener("click", () => moveTile(r, c));
        boardEl.appendChild(btn);
      }
    }

    const extPiece = state[key(EXT.r, EXT.c)];
    if (extPiece === -1) {
      const extEmpty = document.createElement("div");
      extEmpty.className = "slide-empty external";
      boardEl.appendChild(extEmpty);
    } else {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slide-tile external-tile";
      btn.style.backgroundImage = `url("${IMG}")`;
      btn.style.backgroundSize = `${COLS * 100}% ${ROWS * 100}%`;
      const pos = tileBg(extPiece);
      btn.style.backgroundPosition = `${pos.x}% ${pos.y}%`;
      btn.disabled = isComplete;
      btn.addEventListener("click", () => moveTile(EXT.r, EXT.c));
      boardEl.appendChild(btn);
    }
  }

  function checkWin() {
    if (isComplete) return;
    if (!isPuzzleSolved()) return;

    isComplete = true;
    playSuccessSound();
    startQuestMusic(QUEST_MUSIC_SRC);
    boardEl.classList.add("complete-glow");
    if (messageEl) messageEl.classList.add("show");
    setTimeout(() => {
      if (nextBtn) nextBtn.classList.add("visible");
    }, 800);
    render();
  }

  shuffle();

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      playClickSound();
      navigateTo("final.html");
    });
  }
}

// ===== Финал =====
function initFinalPage() {
  // === РЕДАКТИРУЕМОЕ ПОЗДРАВЛЕНИЕ ===
  const cfg = window.QUEST_CONFIG || {};
  const CONGRATULATION_MESSAGE = cfg.finalMessage || "С днем рожденияяя!!! ❤️";
  const CONGRATULATION_SUBTITLE = cfg.finalSubtitle || "";

  // === МЕДИА: укажите путь к фото или видео (или оставьте пустым) ===
  const MEDIA_TYPE = "image";
  const MEDIA_SRC = cfg.mediaPhoto || "";

  const FINISH_MUSIC_SRC = cfg.finishMusicSrc || "";

  const messageEl = document.getElementById("final-message");
  const subtitleEl = document.getElementById("final-subtitle");
  const mediaSlot = document.getElementById("media-slot");
  const musicBtn = document.getElementById("btn-music");
  const finishBtn = document.getElementById("btn-finish");
  const overlay = document.getElementById("finish-overlay");

  if (messageEl) messageEl.textContent = CONGRATULATION_MESSAGE;
  if (subtitleEl) subtitleEl.textContent = CONGRATULATION_SUBTITLE;

  // Медиа-слот
  if (mediaSlot && MEDIA_TYPE !== "none" && MEDIA_SRC) {
    if (MEDIA_TYPE === "image") {
      const img = document.createElement("img");
      img.src = MEDIA_SRC;
      img.alt = "Наше фото";
      mediaSlot.innerHTML = "";
      mediaSlot.appendChild(img);
    } else if (MEDIA_TYPE === "video") {
      const video = document.createElement("video");
      video.src = MEDIA_SRC;
      video.controls = true;
      video.playsInline = true;
      mediaSlot.innerHTML = "";
      mediaSlot.appendChild(video);
    }
  }

  // Кнопка музыки — только если указан отдельный файл (до завершения)
  const MUSIC_SRC = "";
  let audio = null;
  if (musicBtn && MUSIC_SRC) {
    audio = new Audio(MUSIC_SRC);
    audio.loop = true;
    audio.volume = 0.3;

    musicBtn.addEventListener("click", () => {
      if (audio.paused) {
        audio.play();
        musicBtn.textContent = "🔇 Выключить музыку";
        musicBtn.classList.add("playing");
      } else {
        audio.pause();
        musicBtn.textContent = "🎵 Включить музыку";
        musicBtn.classList.remove("playing");
      }
    });
  } else if (musicBtn) {
    musicBtn.style.display = "none";
  }

  // Частицы-сердечки
  initParticles();

  startQuestMusic(FINISH_MUSIC_SRC);

  if (finishBtn && overlay) {
    finishBtn.addEventListener("click", () => {
      if (finishBtn.disabled) return;
      finishBtn.disabled = true;

      playPopperSound();
      launchConfetti();
      overlay.classList.add("show");
    });
  }
}

/** Мерцающие точки на фоне 1-го слайда */
function initHeartAmbience() {
  const ambient = document.querySelector(".heart-ambient");
  if (!ambient || ambient.childElementCount > 0) return;

  for (let i = 0; i < 14; i++) {
    const s = document.createElement("span");
    s.className = "heart-sparkle";
    s.style.left = Math.random() * 100 + "%";
    s.style.top = Math.random() * 100 + "%";
    s.style.animationDelay = Math.random() * 6 + "s";
    s.style.animationDuration = 2.5 + Math.random() * 3.5 + "s";
    ambient.appendChild(s);
  }
}

/** Плавающие сердечки на финале (CSS-анимация, стабильно работает везде) */
function initParticles() {
  const layer = document.getElementById("hearts-layer");
  if (!layer) return;

  const count = 28;
  const symbols = ["♥", "♡", "❤"];

  for (let i = 0; i < count; i++) {
    const el = document.createElement("span");
    el.className = "heart-particle";
    el.textContent = symbols[i % symbols.length];
    el.style.left = Math.random() * 100 + "%";
    el.style.fontSize = 10 + Math.random() * 16 + "px";
    el.style.setProperty("--heart-op", (0.2 + Math.random() * 0.4).toFixed(2));
    el.style.setProperty("--heart-drift", (Math.random() - 0.5) * 100 + "px");
    el.style.setProperty("--heart-spin", (Math.random() - 0.5) * 40 + "deg");
    el.style.animationDuration = 14 + Math.random() * 16 + "s";
    el.style.animationDelay = Math.random() * 12 + "s";
    layer.appendChild(el);
  }
}

// ===== Инициализация по data-page =====
document.addEventListener("DOMContentLoaded", () => {
  try {
    const page = document.body.dataset.page;
    switch (page) {
      case "heart":
        initHeartPage();
        break;
      case "pairs":
        initPairsPage();
        break;
      case "slide":
        initSlidePuzzlePage();
        break;
      case "final":
        initFinalPage();
        break;
    }
  } catch (err) {
    console.error("Ошибка квеста:", err);
    showToast("Ошибка в коде: " + err.message);
  }
});
