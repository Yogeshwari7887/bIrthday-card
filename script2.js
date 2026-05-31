// ===== SCENE TRIGGER DISPATCHER =====
function triggerScene(idx) {
  switch(idx) {
    case 0: animHero(); break;
    case 1: animRoast(); break;
    case 2: animEmotional(); break;
    case 3: animCake(); break;
    case 4: animForever(); break;
    case 5: playFinale(); break;
  }
}

// ===== SCENE 0 — HERO =====
function animHero() {
  const tl = gsap.timeline();
  gsap.set('#hero-pig', { scale: 0.1 });
  tl.to('#hero-pig', { scale: 1.1, duration: 0.8, ease: 'back.out(2)' })
    .to('#hero-pig', { scale: 1, duration: 0.3 })
    .to('.hero-line-1', { opacity: 1, duration: 0.6 }, '-=0.2')
    .to('.hero-line-2', { opacity: 1, duration: 0.6 }, '-=0.3')
    .from('#hero-badge', { scale: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.2');
}

// ===== SCENE 1 — THE ROAST =====
let roastPlayed = false;
function animRoast() {
  if (roastPlayed) return;
  roastPlayed = true;

  const tl = gsap.timeline();

  // Curtains part
  tl.to('.curtain-left', { scaleX: 0, duration: 0.8, ease: 'power2.in' })
    .to('.curtain-right', { scaleX: 0, duration: 0.8, ease: 'power2.in' }, '<');

  // Flash
  tl.add(() => {
    const f = document.createElement('div');
    f.className = 'camera-flash';
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 400);
  });

  // Mic drops in
  tl.from('.mic-stand', { y: -200, duration: 0.6, ease: 'bounce.out' }, '+=0.2');

  // Neon sign flicker stabilize
  tl.fromTo('.neon-sign span', { opacity: 0 }, { opacity: 1, duration: 0.1, repeat: 5, yoyo: true }, '-=0.3')
    .to('.neon-sign span', { opacity: 1, duration: 0.3 });

  // LINE 1 — Teleprompter slide from left, starts large shrinks
  tl.add(() => {
    const l1 = document.getElementById('roast-l1');
    gsap.fromTo(l1, { opacity: 0, x: -200, scale: 1.4 },
      { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: 'power2.out',
        onComplete: () => {
          // Shake mic
          gsap.to('.mic-head', { rotation: -5, duration: 0.1, yoyo: true, repeat: 3 });
          // Show 🤔 reaction
          const emoji = l1.querySelector('.reaction-emoji');
          gsap.to(emoji, { opacity: 1, duration: 0.3 });
          gsap.to(emoji, { rotation: -15, duration: 0.4, yoyo: true, repeat: 2, delay: 0.3 });
        }
      });
  }, '+=0.5');

  // LINE 2 — Words slam in, "annoying" vibrates
  tl.add(() => {
    const l2 = document.getElementById('roast-l2');
    gsap.to(l2, { opacity: 1, duration: 0.1 });
    const word = l2.querySelector('.slam-word');
    gsap.fromTo(word, { scale: 1.6, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'power4.out',
        onComplete: () => {
          word.classList.add('vibrate');
          // Buzzer
          const buz = l2.querySelector('.buzzer');
          buz.classList.add('active');
          gsap.to('.mic-head', { rotation: 5, duration: 0.1, yoyo: true, repeat: 2 });
          bounceAudience();
        }
      });
  }, '+=0.8');

  // LINE 3 — Letters scatter in, word spins after landing
  tl.add(() => {
    const l3 = document.getElementById('roast-l3');
    gsap.to(l3, { opacity: 1, duration: 0.1 });
    const word = l3.querySelector('.scatter-word');
    gsap.fromTo(word, { rotation: 180, scale: 0.3, x: 100, opacity: 0 },
      { rotation: 0, scale: 1, x: 0, opacity: 1, duration: 0.6, ease: 'back.out(2)',
        onComplete: () => {
          // Spin word 360
          gsap.to(word, { rotation: 360, duration: 0.6, ease: 'power2.inOut' });
          // Dizzy emoji orbits
          const dizzy = l3.querySelector('.dizzy');
          gsap.to(dizzy, { opacity: 1, duration: 0.2 });
          dizzy.classList.add('orbit');
          setTimeout(() => { gsap.to(dizzy, { opacity: 0, duration: 0.5 }); }, 2200);
          bounceAudience();
        }
      });
  }, '+=0.8');

  // LINE 4 — Dramatic pause, gold, big 😂 pop
  tl.add(() => {
    setTimeout(() => {
      const l4 = document.getElementById('roast-l4');
      gsap.fromTo(l4, { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out',
          onComplete: () => {
            const bigL = l4.querySelector('.big-emoji-laugh');
            bigL.classList.add('pop');
            setTimeout(() => { bigL.style.fontSize = ''; bigL.classList.remove('pop'); }, 1500);
            // Audience explodes
            const row = document.getElementById('audience-row');
            row.style.opacity = 1;
            row.classList.add('active');
          }
        });
    }, 1500); // dramatic pause
  }, '+=0.3');

  // Roast cards slide up after lines
  setTimeout(() => {
    showRoastCards();
  }, 8000);
}

function bounceAudience() {
  const row = document.getElementById('audience-row');
  row.style.opacity = '1';
  row.classList.remove('active');
  void row.offsetWidth; // reflow
  row.classList.add('active');
}

function showRoastCards() {
  const cards = document.querySelectorAll('.roast-stat-card');
  cards.forEach((card, i) => {
    gsap.to(card, { opacity: 1, y: 0, duration: 0.5, delay: i * 0.3, onComplete: () => {
      if (i === 0) {
        // Annoyance bar fills
        document.getElementById('annoyance-bar').style.width = '97%';
      }
      if (i === 1) {
        // Gauge needle sweeps
        const needle = document.querySelector('.gauge-needle');
        gsap.to(needle, { attr: { transform: 'rotate(160 60 65)' }, duration: 1.5, ease: 'elastic.out(1,0.5)' });
        gsap.to('.gauge-fill', { strokeDashoffset: 0, duration: 1.5 });
      }
      if (i === 2) {
        // Stars light up one by one
        const stars = document.querySelectorAll('.star');
        stars.forEach((s, si) => {
          setTimeout(() => {
            s.classList.add('lit');
            if (si < 5) spawnConfetti(s.getBoundingClientRect().left + 10, s.getBoundingClientRect().top, 3);
          }, si * 300);
        });
      }
    }});
  });

  // Show WhatsApp bubble after cards
  setTimeout(showWhatsApp, 3500);
}

function showWhatsApp() {
  const bubble = document.getElementById('whatsapp-bubble');
  gsap.to(bubble, { opacity: 1, y: 0, duration: 0.5 });

  // Typing for 1.5s then show text
  setTimeout(() => {
    document.getElementById('wa-typing').style.display = 'none';
    document.getElementById('wa-text').style.display = 'block';
    // Flip smiley after 2s
    setTimeout(() => {
      document.getElementById('flip-smiley').classList.add('flipped');
    }, 2000);
  }, 1500);

  // Show mic drop button
  setTimeout(() => {
    gsap.to('.mic-drop-btn', { opacity: 1, y: 0, duration: 0.4 });
  }, 2500);
}

// Mic drop click
document.getElementById('mic-drop-btn')?.addEventListener('click', () => {
  document.getElementById('mic-stand').classList.add('dropped');
  document.body.classList.add('shaking');
  setTimeout(() => document.body.classList.remove('shaking'), 400);
  playTone(150, 'sine', 0.3);

  gsap.to('.mic-drop-btn', { opacity: 0, duration: 0.3 });
  gsap.to('#mic-drop-text', { opacity: 1, duration: 0.6, delay: 0.3 });

  // Audience ovation
  const row = document.getElementById('audience-row');
  row.classList.remove('active');
  row.classList.add('ovation');
  row.querySelectorAll('span').forEach((s, i) => { s.style.animationDelay = i * 0.1 + 's'; });

  // Show transition text
  setTimeout(() => {
    gsap.to('#roast-transition', { opacity: 1, duration: 0.8 });
  }, 1500);
});

// ===== SCENE 2 — EMOTIONAL =====
function animEmotional() {
  document.querySelectorAll('.emotional-line').forEach((line, i) => {
    gsap.fromTo(line, { opacity: 0, filter: 'blur(5px)' },
      { opacity: 1, filter: 'blur(0px)', duration: 0.8, delay: i * 0.25 });
  });
  document.querySelectorAll('.underline-anim svg path').forEach(path => {
    gsap.to(path, { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out', delay: 0.6 });
  });
}

// ===== SCENE 3 — CAKE & WISHES =====
let cakeStarted = false;
let blownCount = 0;
const TOTAL_CANDLES = 10;

function initCake() {
  // Generate candles dynamically
  const ring = document.getElementById('candle-ring');
  if (!ring) return;
  for (let i = 0; i < TOTAL_CANDLES; i++) {
    const candle = document.createElement('div');
    candle.className = 'c-candle';
    candle.innerHTML = '<div class="c-wick"></div><div class="c-flame" data-lit="true"></div>';
    candle.addEventListener('click', () => blowCandle(candle));
    ring.appendChild(candle);
  }
}

function animCake() {
  if (cakeStarted) return;
  // Show breath prompt first
  const prompt = document.getElementById('breath-prompt');
  gsap.fromTo(prompt, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });

  // Fake listening animation
  setTimeout(() => {
    gsap.to('#wish-received', { opacity: 1, duration: 0.5 });
    playTone(523, 'triangle', 0.3);
    setTimeout(() => playTone(659, 'triangle', 0.3), 150);
    setTimeout(() => playTone(784, 'triangle', 0.3), 300);
  }, 3000);

  // After wish received, show cake
  setTimeout(() => {
    gsap.to(prompt, { opacity: 0, duration: 0.4, onComplete: () => {
      prompt.style.display = 'none';
      const layout = document.getElementById('cake-wishes-layout');
      layout.style.display = 'flex';
      gsap.fromTo(layout, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.5)' });
      gsap.from('.cake-3d', { scale: 0.7, opacity: 0, duration: 0.8, ease: 'elastic.out(1, 0.5)', delay: 0.2 });
      cakeStarted = true;
    }});
  }, 4500);
}

function blowCandle(candle) {
  const flame = candle.querySelector('.c-flame');
  if (!flame || flame.dataset.lit !== 'true') return;

  flame.classList.add('out');
  flame.dataset.lit = 'false';

  // Smoke puff
  const smoke = document.createElement('div');
  smoke.className = 'smoke';
  candle.appendChild(smoke);
  setTimeout(() => smoke.remove(), 800);

  playTone(261.63 * (1 + blownCount * 0.15), 'sine', 0.2);
  blownCount++;

  // Update counter
  const remaining = TOTAL_CANDLES - blownCount;
  document.getElementById('candle-counter').textContent = remaining + ' candles remaining...';

  // Reveal a wish card
  revealWishCard(blownCount - 1);

  // All blown?
  if (blownCount >= TOTAL_CANDLES) {
    allCandlesBlown();
  }
}

// Blow all button
document.getElementById('blow-all-btn')?.addEventListener('click', () => {
  const flames = document.querySelectorAll('.c-flame[data-lit="true"]');
  flames.forEach((flame, i) => {
    setTimeout(() => {
      const candle = flame.parentElement;
      blowCandle(candle);
    }, i * 80);
  });
});

function revealWishCard(idx) {
  const cards = document.querySelectorAll('.wish-card');
  // Map candle index to card index (10 candles, 6 cards)
  const cardIdx = Math.min(Math.floor(idx * 6 / TOTAL_CANDLES), 5);
  const card = cards[cardIdx];
  if (!card || card.style.opacity === '1') return;

  gsap.to(card, { opacity: 1, y: 0, duration: 0.5, onComplete: () => {
    // Animate special elements per card
    if (cardIdx === 1) {
      // Success bar fills
      const fill = card.querySelector('.success-fill');
      if (fill) fill.style.width = '100%';
    }
    if (cardIdx === 3) {
      // Common sense bar fills to only 10%
      const fill = card.querySelector('.sense-fill');
      if (fill) fill.style.width = '10%';
    }
    if (cardIdx === 5) {
      // The Real One — dim siblings, glow this card
      cards.forEach(c => { if (c !== card) c.style.filter = 'brightness(0.4)'; });
      card.style.boxShadow = '0 0 30px rgba(255,209,102,0.4)';
      setTimeout(() => {
        cards.forEach(c => c.style.filter = '');
      }, 3000);
    }
    spawnConfetti(card.getBoundingClientRect().left + card.offsetWidth / 2,
                  card.getBoundingClientRect().top, 8);
  }});
}

function allCandlesBlown() {
  const cake = document.querySelector('.cake-3d');
  gsap.to(cake, { rotation: 3, duration: 0.1, yoyo: true, repeat: 5 });

  const rect = cake.getBoundingClientRect();
  spawnConfetti(rect.left + rect.width / 2, rect.top, 60);

  playTone(523, 'triangle', 0.3);
  setTimeout(() => playTone(659, 'triangle', 0.3), 120);
  setTimeout(() => playTone(784, 'triangle', 0.5), 240);

  document.getElementById('candle-counter').textContent = '';
  document.getElementById('blow-all-btn').style.display = 'none';
  const banner = document.getElementById('all-blown-banner');
  banner.style.display = 'block';

  // Show sticky note
  setTimeout(() => {
    const note = document.getElementById('sticky-note');
    note.style.display = 'block';
    gsap.fromTo(note, { opacity: 0, scale: 0.8, rotation: -8 },
      { opacity: 1, scale: 1, rotation: -3, duration: 0.5, ease: 'back.out(2)' });

    // Flip smiley on hover
    const smiley2 = document.getElementById('flip-smiley-2');
    if (smiley2) {
      note.addEventListener('mouseenter', () => smiley2.classList.add('flipped'));
      note.addEventListener('mouseleave', () => smiley2.classList.remove('flipped'));
      note.addEventListener('touchstart', () => smiley2.classList.toggle('flipped'));
    }
  }, 1500);

  // Pulse next button
  gsap.to(btnNext, { scale: 1.15, duration: 0.3, yoyo: true, repeat: 3 });
}

// ===== SCENE 4 — FOREVER =====
let cycleIV;
function animForever() {
  gsap.fromTo('.forever-line', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 });

  // Kinetic line
  const kl = document.getElementById('kinetic-line');
  kl.innerHTML = '';
  "Never stop being yourself because that's exactly why people love you.".split(' ').forEach(w => {
    const s = document.createElement('span');
    s.className = 'kinetic-word';
    s.textContent = w + ' ';
    s.style.fontSize = (0.9 + Math.random() * 0.35) + 'em';
    kl.appendChild(s);
  });
  gsap.to('.kinetic-word', { opacity: 1, duration: 0.3, stagger: 0.08, delay: 0.4 });

  // Chat bubble
  const cb = document.getElementById('chat-bubble');
  const ct = document.getElementById('chat-text');
  const ti = document.getElementById('typing-indicator');
  cb.style.opacity = 0; ct.style.display = 'none'; ti.style.display = 'inline-flex';
  gsap.to(cb, { opacity: 1, duration: 0.5, delay: 1.5, onComplete: () => {
    setTimeout(() => { ti.style.display = 'none'; ct.style.display = 'inline'; spawnConfetti(innerWidth / 2, innerHeight * 0.8, 12); }, 1600);
  }});

  // Cycle words
  if (cycleIV) clearInterval(cycleIV);
  document.querySelectorAll('.cycle-word').forEach(el => {
    const words = JSON.parse(el.dataset.words);
    const colors = JSON.parse(el.dataset.colors);
    let i = 0;
    cycleIV = setInterval(() => {
      i = (i + 1) % words.length;
      gsap.to(el, { duration: 0.3, opacity: 0, y: -10, onComplete: () => {
        el.textContent = words[i]; el.style.color = colors[i];
        gsap.to(el, { duration: 0.3, opacity: 1, y: 0 });
      }});
    }, 2200);
  });
}

// ===== SCENE 5 — FINALE =====
let finaleIV;
function playFinale() {
  if (finaleIV) clearInterval(finaleIV);

  const f = document.createElement('div');
  f.className = 'camera-flash';
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 400);

  initFireworks(document.getElementById('fireworks-canvas'));

  const tl = gsap.timeline();
  gsap.set('.finale-emojis', { scale: 0 });
  tl.set('#finale-pig', { scale: 0.1, opacity: 0 })
    .to('#finale-pig', { opacity: 1, scale: 1.2, duration: 0.8, ease: 'elastic.out(1,0.5)' })
    .to('#finale-pig', { scale: 1, duration: 0.2 })
    .to('#finale-text', { opacity: 1, duration: 0.8 }, '-=0.2')
    .to('.finale-emojis', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.3')
    .to('#finale-ribbon svg line', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' }, '-=0.4')
    .to('.made-with-love', { opacity: 1, duration: 0.8 }, '-=0.2');

  for (let i = 0; i < 6; i++) {
    setTimeout(() => spawnConfetti(Math.random() * innerWidth, 0, 30), i * 350);
  }

  gsap.to('#finale-pig', { rotation: 6, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });
  finaleIV = setInterval(() => { if (currentSceneIndex === 5) initFireworks(document.getElementById('fireworks-canvas')); }, 6000);
}

document.getElementById('btn-replay')?.addEventListener('click', () => {
  gsap.set('#finale-pig', { opacity: 0, rotation: 0 });
  gsap.set('#finale-text', { opacity: 0 });
  gsap.set('.finale-emojis', { opacity: 0, scale: 0 });
  gsap.set('.made-with-love', { opacity: 0 });
  gsap.set('#finale-ribbon svg line', { strokeDashoffset: 600 });
  playFinale();
});

// ===== FIREWORKS =====
function initFireworks(cv) {
  const ctx = cv.getContext('2d');
  cv.width = cv.parentElement.offsetWidth;
  cv.height = cv.parentElement.offsetHeight;
  const w = cv.width, h = cv.height, sparks = [];
  const cols = ['#FF4D9E', '#FFD166', '#9B72FF', '#48dbfb', '#ff6b6b', '#feca57'];
  for (let i = 0; i < 7; i++) {
    setTimeout(() => {
      const x = Math.random() * w * 0.8 + w * 0.1, y = Math.random() * h * 0.4 + h * 0.1;
      const c = cols[~~(Math.random() * cols.length)];
      playTone(600 + Math.random() * 400, 'triangle', 0.15);
      for (let j = 0; j < 30; j++) {
        const a = (Math.PI * 2 * j) / 30, sp = Math.random() * 5 + 2;
        sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, dec: 0.012 + Math.random() * 0.012, col: c, r: Math.random() * 2 + 1 });
      }
    }, i * 250);
  }
  (function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.x += s.vx; s.y += s.vy; s.vy += 0.05; s.vx *= 0.985; s.life -= s.dec;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.col; ctx.globalAlpha = s.life; ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (sparks.length > 0) requestAnimationFrame(draw);
  })();
}
