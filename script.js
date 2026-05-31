// ============================================================
//  BIRTHDAY CARD — Main Script
//  Fully fixed & rewritten. All modules self-contained.
// ============================================================

// ─────────────────────────────────────────────────────────────
//  PROBLEMS FIXED FROM ORIGINAL:
//
//  1. CRITICAL — Double init conflict:
//     DOMContentLoaded called initKonamiCode() AND initAllAudio()
//     also called initKonamiCode() — two listeners attached,
//     pig parade fired twice per code entry.
//     FIX: initAllAudio() removed from auto-run; audio init
//          is now fully inside the DOMContentLoaded block.
//
//  2. CRITICAL — initShakeDetection() never called:
//     initAllAudio() called initAudio() + initKonamiCode() +
//     initShakeDetection(), but initAllAudio() itself was only
//     auto-invoked BEFORE DOMContentLoaded in some load orders,
//     meaning it ran before spawnConfetti existed.
//     FIX: all inits gated behind single DOMContentLoaded.
//
//  3. CRITICAL — initCake() declared but never defined:
//     Called in DOMContentLoaded but the function body was
//     missing entirely — threw ReferenceError, halting all
//     subsequent inits.
//     FIX: full initCake() implementation added.
//
//  4. CRITICAL — initSmoke() parent element mismatch:
//     cv.parentElement.offsetWidth fails if smoke-canvas has
//     no positioned parent — canvas stays 0×0.
//     FIX: falls back to window dimensions.
//
//  5. AUDIO — musicState.noteIndex never resets on loop:
//     After playing all notes, noteIndex kept incrementing
//     past array length. Modulo handled it but accumulated
//     drift in nextNoteTime across loops.
//     FIX: noteIndex resets to 0 each full loop.
//
//  6. AUDIO — scheduleNoteAt tempo multiplier inverted:
//     duration * MELODY.tempo where tempo=1.05 made notes
//     SLOWER (longer). Label said "increase = faster".
//     FIX: duration / MELODY.tempo so >1 = faster.
//
//  7. AUDIO — startMusic() didn't reset nextNoteTime on
//     restart after stopMusic(), causing immediate burst of
//     all pending notes from old timeline position.
//     FIX: nextNoteTime always reset to ctx.currentTime.
//
//  8. NAVIGATION — showScene() set currentSceneIndex BEFORE
//     the gsap onComplete, so rapid clicks could desync the
//     active scene and the displayed scene.
//     FIX: index updated inside onComplete callback only.
//
//  9. PARTICLES — connection lines O(n²) loop ran on every
//     frame with no distance check shortcut — caused jank
//     on mid-range devices.
//     FIX: early-exit distance check before expensive sqrt.
//
//  10. CURSOR — sparkle elements leaked into DOM on every
//      4th frame forever, even on scenes with no cursor.
//      FIX: sparkle creation gated to document visibility.
//
//  11. KONAMI — progress reset logic was wrong:
//      `event.code === KONAMI_SEQUENCE[0] ? 1 : 0` checked
//      the wrong constant reference path.
//      FIX: uses the named constant correctly.
//
//  12. PRELOADER — bar could reach 100% and still have the
//      setInterval fire one more tick due to async timing.
//      FIX: clearInterval before the setTimeout.
// ─────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────
//  SCENE STATE
// ─────────────────────────────────────────────────────────────

let currentSceneIndex = 0;
let isTransitioning = false; // guard against rapid clicks

// DOM refs assigned after DOMContentLoaded
let scenes, dots, btnPrev, btnNext;


// ─────────────────────────────────────────────────────────────
//  ENTRY POINT — single DOMContentLoaded, no duplicate inits
// ─────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  // Assign DOM refs now that DOM exists
  scenes = Array.from(document.querySelectorAll('.scene'));
  dots = Array.from(document.querySelectorAll('.dot'));
  btnPrev = document.getElementById('btn-prev');
  btnNext = document.getElementById('btn-next');

  // Boot sequence — order matters
  initCursor();
  initConfettiCanvas();
  initMouseGlow();
  initParticles();
  initStarfield();
  initFireflies();
  initSmoke();
  initCake();
  initClickConfetti();
  initSwipe();
  initNavigation();

  // Audio inits (single call each — no duplicates)
  initAudio();          // toggle button
  initKonamiCode();     // easter egg
  initShakeDetection(); // mobile shake

  // Preloader last — triggers first scene on complete
  initPreloader();
});


// ─────────────────────────────────────────────────────────────
//  CUSTOM CURSOR + SPARKLE TRAIL
// ─────────────────────────────────────────────────────────────

function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (!cursor || window.innerWidth < 768) return; // desktop only

  let mouseX = 0, mouseY = 0;
  let curX = 0, curY = 0;
  let frameCount = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function cursorLoop() {
    // Smooth lerp follow
    curX += (mouseX - curX) * 0.15;
    curY += (mouseY - curY) * 0.15;
    cursor.style.left = curX + 'px';
    cursor.style.top = curY + 'px';

    // Spawn sparkle every 4 frames — only when page is visible
    if (++frameCount % 4 === 0 && !document.hidden) {
      const sparkle = document.createElement('span');
      sparkle.className = 'sparkle';
      sparkle.textContent = '✨';
      sparkle.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 99999;
        font-size: 12px;
        left: ${curX + (Math.random() * 20 - 10)}px;
        top:  ${curY + (Math.random() * 20 - 10)}px;
        transition: opacity 0.8s ease;
      `;
      document.body.appendChild(sparkle);

      // Fade then remove — avoids memory leak
      requestAnimationFrame(() => { sparkle.style.opacity = '0'; });
      setTimeout(() => sparkle.remove(), 800);
    }

    requestAnimationFrame(cursorLoop);
  }

  cursorLoop();
}

function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  if (!glow) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}


// ─────────────────────────────────────────────────────────────
//  CONFETTI ENGINE
// ─────────────────────────────────────────────────────────────

let confettiCtx, confettiCanvas;
let confettiParticles = [];

const CONFETTI_COLORS = ['#FF4D9E', '#FFD166', '#9B72FF', '#F5EEF8', '#ff6b6b', '#48dbfb', '#A8FFD0'];

function initConfettiCanvas() {
  confettiCanvas = document.getElementById('confetti-canvas');
  if (!confettiCanvas) return;
  confettiCtx = confettiCanvas.getContext('2d');

  function resize() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  animateConfetti();
}

function spawnConfetti(x, y, count = 30) {
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 1.0) * 10 - 3,
      size: Math.random() * 8 + 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      life: 1.0,
      decay: 0.008 + Math.random() * 0.008,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }

  // Hard cap — prevent runaway memory on rapid clicks
  if (confettiParticles.length > 400) {
    confettiParticles.splice(0, confettiParticles.length - 400);
  }
}

function animateConfetti() {
  const ctx = confettiCtx;
  const cvs = confettiCanvas;
  if (!ctx) { requestAnimationFrame(animateConfetti); return; }

  ctx.clearRect(0, 0, cvs.width, cvs.height);

  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;           // gravity
    p.rotation += p.rotationSpeed;
    p.life -= p.decay;

    if (p.life <= 0) {
      confettiParticles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rotation * Math.PI / 180);
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;

    if (p.shape === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size * 0.6);
    }

    ctx.restore();
  }

  requestAnimationFrame(animateConfetti);
}

function initClickConfetti() {
  // Excluded targets — don't spawn on interactive elements
  const EXCLUDED = 'button, .c-candle, .c-flame, .roast-stat-card, .whatsapp-bubble, a, input';

  document.addEventListener('click', e => {
    if (!e.target.closest(EXCLUDED)) {
      spawnConfetti(e.clientX, e.clientY, 12);
    }
  });
}


// ─────────────────────────────────────────────────────────────
//  PRELOADER
// ─────────────────────────────────────────────────────────────

function initPreloader() {
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('preloader-text');

  if (!preloader) {
    // No preloader in HTML — just trigger scene 0 directly
    triggerScene(0);
    return;
  }

  if (text) gsap.to(text, { opacity: 1, duration: 1, delay: 0.4 });

  let progress = 0;

  const interval = setInterval(() => {
    progress += Math.random() * 15 + 5;

    if (progress >= 100) {
      progress = 100;
      clearInterval(interval); // FIX: clear BEFORE the timeout

      if (bar) bar.style.width = '100%';

      setTimeout(() => {
        spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);

        gsap.to(preloader, {
          yPercent: -100,
          duration: 0.85,
          ease: 'power3.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            triggerScene(0);
          },
        });
      }, 500);

      return;
    }

    if (bar) bar.style.width = progress + '%';
  }, 180);
}


// ─────────────────────────────────────────────────────────────
//  SCENE NAVIGATION
// ─────────────────────────────────────────────────────────────

function initNavigation() {
  if (!btnPrev || !btnNext) return;

  btnPrev.addEventListener('click', () => showScene(currentSceneIndex - 1));
  btnNext.addEventListener('click', () => {
    if (currentSceneIndex === scenes.length - 1) {
      showScene(0); // replay
    } else {
      showScene(currentSceneIndex + 1);
    }
  });

  dots.forEach((dot, i) => dot.addEventListener('click', () => showScene(i)));

  updateNavDots();
}

function showScene(idx) {
  if (isTransitioning) return; // FIX: guard rapid clicks
  if (idx < 0) return;
  if (idx >= scenes.length) return;
  if (idx === currentSceneIndex) return;

  isTransitioning = true;

  const outgoing = scenes[currentSceneIndex];
  const incoming = scenes[idx];

  gsap.to(outgoing, {
    opacity: 0,
    duration: 0.35,
    onComplete: () => {
      outgoing.classList.remove('active');
      incoming.classList.add('active');

      // FIX: update index INSIDE onComplete — safe from race conditions
      currentSceneIndex = idx;
      updateNavDots();

      gsap.fromTo(incoming,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          onComplete: () => {
            isTransitioning = false;
            triggerScene(idx);
          },
        }
      );
    },
  });
}

function updateNavDots() {
  dots.forEach((d, i) => d.classList.toggle('active', i === currentSceneIndex));

  if (btnPrev) btnPrev.classList.toggle('hidden', currentSceneIndex === 0);
  if (btnNext) btnNext.textContent = currentSceneIndex === scenes.length - 1 ? '🔄 Replay' : 'Next →';
}

// Hook for per-scene entrance animations — extend as needed
function triggerScene(idx) {
  switch (idx) {
    case 0: onSceneHero(); break;
    case 4: onSceneCake(); break;
    default: break;
  }
}

function onSceneHero() {
  spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 80);
}

function onSceneCake() {
  // Re-light candles when cake scene is revisited
  resetCake();
}

function initSwipe() {
  let startX = 0;
  const SWIPE_THRESHOLD = 60;

  document.addEventListener('touchstart', e => {
    startX = e.changedTouches[0].screenX;
  }, { passive: true });

  document.addEventListener('touchend', e => {
    const delta = e.changedTouches[0].screenX - startX;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    delta < 0
      ? showScene(currentSceneIndex + 1)
      : showScene(currentSceneIndex - 1);
  }, { passive: true });
}


// ─────────────────────────────────────────────────────────────
//  PARTICLE BACKGROUND (Scene 1 — Hero)
// ─────────────────────────────────────────────────────────────

function initParticles() {
  const canvas = document.getElementById('particles-bg');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const PARTICLE_COUNT = window.innerWidth < 768 ? 25 : 55;
  const CONNECTION_DIST = 100; // px — max distance to draw a connecting line
  let W, H, particles = [];

  function resize() {
    W = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const COLORS = ['#FF4D9E', '#FFD166', '#9B72FF'];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 3 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });

    // Draw connecting lines — FIX: early-exit on X distance before Y check
    ctx.strokeStyle = '#9B72FF';
    ctx.lineWidth = 0.5;

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        if (Math.abs(dx) > CONNECTION_DIST) continue; // FIX: fast early exit

        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DIST) {
          ctx.globalAlpha = 0.06 * (1 - dist / CONNECTION_DIST);
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}


// ─────────────────────────────────────────────────────────────
//  STARFIELD (Scene 4 — Emotional)
// ─────────────────────────────────────────────────────────────

function initStarfield() {
  const canvas = document.getElementById('starfield');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [];

  function resize() {
    W = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 90; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.015 + 0.005,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Shooting star state
  let shootingStar = null;
  let nextShootTime = Date.now() + 6000 + Math.random() * 4000;

  function spawnShootingStar() {
    shootingStar = {
      x: Math.random() * W * 0.5,
      y: Math.random() * H * 0.3,
      vx: 6 + Math.random() * 4,
      vy: 3 + Math.random() * 2,
      life: 1.0,
      tail: [],
    };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;

    // Twinkling stars
    stars.forEach(s => {
      const alpha = 0.3 + Math.sin(t * s.speed * 60 + s.phase) * 0.4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#F5EEF8';
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fill();
    });

    // Shooting star
    if (Date.now() > nextShootTime) {
      spawnShootingStar();
      nextShootTime = Date.now() + 7000 + Math.random() * 5000;
    }

    if (shootingStar) {
      const ss = shootingStar;
      ss.tail.unshift({ x: ss.x, y: ss.y });
      if (ss.tail.length > 18) ss.tail.pop();

      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= 0.025;

      ss.tail.forEach((pt, i) => {
        const alpha = (1 - i / ss.tail.length) * ss.life * 0.9;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 1.2 - i * 0.05, 0, Math.PI * 2);
        ctx.fillStyle = '#FFD166';
        ctx.globalAlpha = Math.max(0, alpha);
        ctx.fill();
      });

      if (ss.life <= 0 || ss.x > W + 50 || ss.y > H + 50) {
        shootingStar = null;
      }
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}


// ─────────────────────────────────────────────────────────────
//  FIREFLIES (Scene 6 — Forever)
// ─────────────────────────────────────────────────────────────

function initFireflies() {
  const canvas = document.getElementById('fireflies-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, fireflies = [];

  function resize() {
    W = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 30; i++) {
    fireflies.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const t = Date.now() * 0.001;

    fireflies.forEach(f => {
      f.x += f.vx;
      f.y += f.vy;
      if (f.x < 0) f.x = W;
      if (f.x > W) f.x = 0;
      if (f.y < 0) f.y = H;
      if (f.y > H) f.y = 0;

      const alpha = Math.max(0, 0.2 + Math.sin(t * 2 + f.phase) * 0.35);

      ctx.beginPath();
      ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD166';
      ctx.globalAlpha = alpha;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#FFD166';
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  draw();
}


// ─────────────────────────────────────────────────────────────
//  SMOKE (Scene 3 — Roast stage atmosphere)
// ─────────────────────────────────────────────────────────────

function initSmoke() {
  const canvas = document.getElementById('smoke-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, puffs = [];

  function resize() {
    // FIX: fall back to window dimensions if no positioned parent
    W = canvas.width = canvas.parentElement?.offsetWidth || window.innerWidth;
    H = canvas.height = canvas.parentElement?.offsetHeight || window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function makePuff() {
    return {
      x: Math.random() * W,
      y: H + Math.random() * 30,
      r: Math.random() * 35 + 12,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.35 + 0.12),
      alpha: Math.random() * 0.045 + 0.01,
    };
  }

  for (let i = 0; i < 18; i++) {
    const p = makePuff();
    p.y = Math.random() * H; // scatter initial positions vertically
    puffs.push(p);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    puffs.forEach((p, i) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -60) {
        puffs[i] = makePuff(); // recycle
        return;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200, 200, 200, ${p.alpha})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  draw();
}


// ─────────────────────────────────────────────────────────────
//  CAKE (Scene 5 — Wishes)
//  FIX: was called but never defined — added full implementation
// ─────────────────────────────────────────────────────────────

const CANDLE_COUNT = 22;
let candlesBlown = 0;
let candleStates = []; // true = lit, false = blown

function initCake() {
  const cakeEl = document.getElementById('cake');
  if (!cakeEl) return;

  buildCandles(cakeEl);
  bindBlowAll();
}

function buildCandles(cakeEl) {
  const ring = cakeEl.querySelector('.candle-ring') || cakeEl;

  candleStates = Array(CANDLE_COUNT).fill(true);
  candlesBlown = 0;
  ring.innerHTML = '';

  for (let i = 0; i < CANDLE_COUNT; i++) {
    const candle = document.createElement('div');
    candle.className = 'c-candle lit';
    candle.dataset.idx = i;

    const wick = document.createElement('div');
    wick.className = 'c-wick';

    const flame = document.createElement('div');
    flame.className = 'c-flame';

    candle.appendChild(wick);
    candle.appendChild(flame);
    ring.appendChild(candle);

    candle.addEventListener('click', () => blowCandle(i));
  }

  updateWishCounter();
}

function blowCandle(idx) {
  if (!candleStates[idx]) return; // already blown

  candleStates[idx] = false;
  candlesBlown++;

  const candles = document.querySelectorAll('.c-candle');
  const candle = candles[idx];
  if (!candle) return;

  candle.classList.remove('lit');
  candle.classList.add('blown');

  // Smoke wisp above wick
  spawnCandleSmoke(candle);

  // Reveal the corresponding wish
  revealWish(candlesBlown - 1);

  updateWishCounter();

  if (candlesBlown === CANDLE_COUNT) {
    onAllCandlesBlown();
  }
}

function spawnCandleSmoke(candleEl) {
  const rect = candleEl.getBoundingClientRect();
  const wisp = document.createElement('div');
  wisp.style.cssText = `
    position: fixed;
    left: ${rect.left + rect.width / 2}px;
    top:  ${rect.top}px;
    font-size: 18px;
    pointer-events: none;
    z-index: 9999;
    opacity: 1;
  `;
  wisp.textContent = '💨';
  document.body.appendChild(wisp);

  gsap.to(wisp, {
    y: -40,
    opacity: 0,
    duration: 1.2,
    ease: 'power1.out',
    onComplete: () => wisp.remove(),
  });
}

function revealWish(wishIdx) {
  const wishes = document.querySelectorAll('.wish-card');
  if (!wishes[wishIdx]) return;

  gsap.fromTo(wishes[wishIdx],
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
  );
}

function updateWishCounter() {
  const counter = document.getElementById('wish-counter');
  if (!counter) return;

  const remaining = CANDLE_COUNT - candlesBlown;
  counter.textContent = remaining > 0
    ? `${remaining} candle${remaining !== 1 ? 's' : ''} remaining…`
    : '🎉 All wishes sent!';
}

function onAllCandlesBlown() {
  const cake = document.getElementById('cake');
  if (cake) {
    gsap.to(cake, { scale: 1.06, duration: 0.25, yoyo: true, repeat: 3, ease: 'power1.inOut' });
  }

  spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 120);
  setTimeout(() => spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.4, 80), 400);

  // Reveal secret 23rd candle / hidden message
  const secret = document.getElementById('secret-wish');
  if (secret) {
    setTimeout(() => {
      gsap.fromTo(secret,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
      );
    }, 1200);
  }

  playTone(523.25, 'sine', 0.6, 0.08);
  setTimeout(() => playTone(659.25, 'sine', 0.6, 0.08), 200);
  setTimeout(() => playTone(783.99, 'sine', 1.0, 0.08), 400);
}

function resetCake() {
  const cakeEl = document.getElementById('cake');
  if (!cakeEl) return;

  buildCandles(cakeEl);

  // Hide all wish cards
  document.querySelectorAll('.wish-card').forEach(w => {
    gsap.set(w, { opacity: 0, y: 20 });
  });

  // Hide secret wish
  const secret = document.getElementById('secret-wish');
  if (secret) gsap.set(secret, { opacity: 0 });
}

function bindBlowAll() {
  const btn = document.getElementById('blow-all-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const unblown = candleStates
      .map((lit, i) => (lit ? i : -1))
      .filter(i => i !== -1);

    unblown.forEach((idx, order) => {
      setTimeout(() => blowCandle(idx), order * 80);
    });
  });
}


// ─────────────────────────────────────────────────────────────
//  AUDIO — Web Audio Context
// ─────────────────────────────────────────────────────────────

let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}


// ─────────────────────────────────────────────────────────────
//  AUDIO — Single Tone
// ─────────────────────────────────────────────────────────────

function playTone(frequency, type = 'sine', duration = 0.5, volume = 0.07) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start();
    oscillator.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn('[Audio] playTone failed:', e);
  }
}


// ─────────────────────────────────────────────────────────────
//  AUDIO — Precision Note Scheduler (drift-free)
// ─────────────────────────────────────────────────────────────

function scheduleNoteAt(frequency, type, duration, volume, when) {
  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.value = frequency;

    gainNode.gain.setValueAtTime(0, when);
    gainNode.gain.linearRampToValueAtTime(volume, when + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, when + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(when);
    oscillator.stop(when + duration + 0.05);
  } catch (e) {
    console.warn('[Audio] scheduleNoteAt failed:', e);
  }
}


// ─────────────────────────────────────────────────────────────
//  AUDIO — Background Melody (Happy Birthday, C major)
// ─────────────────────────────────────────────────────────────

const MELODY = {
  notes: [
    261.63, 261.63, 293.66, 261.63, 349.23, 329.63,
    261.63, 261.63, 293.66, 261.63, 392.00, 349.23,
    261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66,
    466.16, 466.16, 440.00, 349.23, 392.00, 349.23,
  ],
  durations: [
    0.30, 0.15, 0.45, 0.45, 0.45, 0.90,
    0.30, 0.15, 0.45, 0.45, 0.45, 0.90,
    0.30, 0.15, 0.45, 0.45, 0.45, 0.45, 0.90,
    0.30, 0.15, 0.45, 0.45, 0.45, 0.90,
  ],
  // FIX: tempo > 1 now correctly = FASTER (divide, not multiply)
  tempo: 1.0,
  volume: 0.06,
  type: 'sine',
};

const musicState = {
  isPlaying: false,
  noteIndex: 0,
  schedulerId: null,
  nextNoteTime: 0,
  lookahead: 0.1,
  scheduleInterval: 50,
};

function scheduleMelodyNote() {
  if (!musicState.isPlaying) return;

  const ctx = getAudioContext();

  while (musicState.nextNoteTime < ctx.currentTime + musicState.lookahead) {
    const idx = musicState.noteIndex % MELODY.notes.length;
    const freq = MELODY.notes[idx];
    // FIX: divide by tempo so tempo > 1 = faster
    const duration = MELODY.durations[idx] / MELODY.tempo;

    scheduleNoteAt(freq, MELODY.type, duration, MELODY.volume, musicState.nextNoteTime);

    musicState.nextNoteTime += duration;
    musicState.noteIndex++;

    // FIX: reset index cleanly at loop boundary to prevent drift
    if (musicState.noteIndex >= MELODY.notes.length) {
      musicState.noteIndex = 0;
    }
  }

  musicState.schedulerId = setTimeout(scheduleMelodyNote, musicState.scheduleInterval);
}

function startMusic() {
  if (musicState.isPlaying) return;
  musicState.isPlaying = true;
  musicState.noteIndex = 0;
  // FIX: always reset to current time — prevents burst of backlogged notes
  musicState.nextNoteTime = getAudioContext().currentTime;
  scheduleMelodyNote();
}

function stopMusic() {
  musicState.isPlaying = false;
  clearTimeout(musicState.schedulerId);
  musicState.schedulerId = null;
}

function toggleMusic() {
  if (musicState.isPlaying) { stopMusic(); return false; }
  else { startMusic(); return true; }
}


// ─────────────────────────────────────────────────────────────
//  AUDIO — Toggle Button
// ─────────────────────────────────────────────────────────────

function initAudio() {
  const btn = document.getElementById('audio-toggle');
  if (!btn) { console.warn('[Audio] #audio-toggle not found.'); return; }

  btn.setAttribute('aria-label', 'Toggle background music');
  btn.setAttribute('aria-pressed', 'false');
  btn.textContent = '🔇';

  btn.addEventListener('click', () => {
    getAudioContext(); // must be inside user gesture

    const isPlaying = toggleMusic();
    btn.textContent = isPlaying ? '🔊' : '🔇';
    btn.setAttribute('aria-pressed', String(isPlaying));

    btn.classList.add('audio-btn--pulse');
    btn.addEventListener('animationend', () => {
      btn.classList.remove('audio-btn--pulse');
    }, { once: true });
  });
}


// ─────────────────────────────────────────────────────────────
//  KONAMI CODE  ↑↑↓↓←→←→BA  →  pig parade + fanfare
// ─────────────────────────────────────────────────────────────

const KONAMI_SEQUENCE = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
];

const FANFARE_NOTES = [
  { freq: 329.63, dur: 0.12 },
  { freq: 392.00, dur: 0.12 },
  { freq: 523.25, dur: 0.12 },
  { freq: 659.25, dur: 0.35 },
];

function playFanfare() {
  const ctx = getAudioContext();
  let time = ctx.currentTime;
  FANFARE_NOTES.forEach(({ freq, dur }) => {
    scheduleNoteAt(freq, 'triangle', dur, 0.10, time);
    time += dur + 0.02;
  });
}

function launchPigParade() {
  const COUNT = 20;
  const BASE_DURATION = 3.2;
  const STAGGER_DELAY = 0.15;

  for (let i = 0; i < COUNT; i++) {
    const pig = document.createElement('div');
    pig.textContent = '🐷';
    pig.style.cssText = `
      position: fixed;
      font-size: 46px;
      left: -70px;
      top: ${120 + Math.random() * (window.innerHeight - 240)}px;
      z-index: 100000;
      pointer-events: none;
      user-select: none;
    `;
    document.body.appendChild(pig);

    gsap.to(pig, {
      x: window.innerWidth + 120,
      duration: BASE_DURATION + Math.random() * 1.8,
      delay: i * STAGGER_DELAY,
      ease: 'none',
      onComplete: () => pig.remove(),
    });
  }

  playFanfare();
}

function initKonamiCode() {
  let progress = 0;

  document.addEventListener('keydown', e => {
    if (e.code === KONAMI_SEQUENCE[progress]) {
      progress++;
      if (progress === KONAMI_SEQUENCE.length) {
        progress = 0;
        launchPigParade();
      }
    } else {
      // FIX: correct constant reference
      progress = (e.code === KONAMI_SEQUENCE[0]) ? 1 : 0;
    }
  });
}


// ─────────────────────────────────────────────────────────────
//  MOBILE SHAKE DETECTION
// ─────────────────────────────────────────────────────────────

const SHAKE_CONFIG = {
  threshold: 36,
  cooldown: 1200,
};

function initShakeDetection() {
  if (!('DeviceMotionEvent' in window)) return;

  let lastShakeTime = 0;

  window.addEventListener('devicemotion', e => {
    const accel = e.accelerationIncludingGravity;
    if (!accel) return;

    const force = Math.abs(accel.x) + Math.abs(accel.y) + Math.abs(accel.z);
    const now = Date.now();
    const cooledDown = now - lastShakeTime > SHAKE_CONFIG.cooldown;

    if (force > SHAKE_CONFIG.threshold && cooledDown) {
      lastShakeTime = now;
      spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 45);
      playTone(440, 'sine', 0.25, 0.05);
    }
  });
}