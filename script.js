// ===== WAIT FOR DOM & GSAP =====
document.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);
  initCursor();
  initConfettiCanvas();
  initPreloader();
  initParticles();
  initStarfield();
  initAudio();
  initClickConfetti();
  initKonamiCode();
  initMouseGlow();
});

// ===== CUSTOM CURSOR =====
function initCursor() {
  const cursor = document.getElementById('custom-cursor');
  if (window.innerWidth < 768) return;
  let mx = 0, my = 0, cx = 0, cy = 0;
  let sparkleTimer = 0;
  document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  function updateCursor() {
    cx += (mx - cx) * 0.15;
    cy += (my - cy) * 0.15;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    sparkleTimer++;
    if (sparkleTimer % 4 === 0) {
      const s = document.createElement('span');
      s.className = 'sparkle';
      s.textContent = '✨';
      s.style.left = cx + (Math.random() * 20 - 10) + 'px';
      s.style.top = cy + (Math.random() * 20 - 10) + 'px';
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
    requestAnimationFrame(updateCursor);
  }
  updateCursor();
}

// ===== MOUSE GLOW =====
function initMouseGlow() {
  const glow = document.getElementById('mouse-glow');
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ===== CONFETTI SYSTEM =====
let confettiCtx, confettiCanvas, confettiParticles = [];
function initConfettiCanvas() {
  confettiCanvas = document.getElementById('confetti-canvas');
  confettiCtx = confettiCanvas.getContext('2d');
  resizeConfetti();
  window.addEventListener('resize', resizeConfetti);
  animateConfetti();
}
function resizeConfetti() {
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
}
function spawnConfetti(x, y, count = 30) {
  const colors = ['#FF4D9E','#FFD166','#9B72FF','#F5EEF8','#ff6b6b','#48dbfb'];
  for (let i = 0; i < count; i++) {
    confettiParticles.push({
      x, y,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 1) * 10 - 3,
      size: Math.random() * 8 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      life: 1,
      decay: 0.008 + Math.random() * 0.008
    });
  }
  if (confettiParticles.length > 300) confettiParticles.splice(0, confettiParticles.length - 300);
}
function animateConfetti() {
  confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  for (let i = confettiParticles.length - 1; i >= 0; i--) {
    const p = confettiParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.rotation += p.rotSpeed;
    p.life -= p.decay;
    if (p.life <= 0) { confettiParticles.splice(i, 1); continue; }
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rotation * Math.PI / 180);
    confettiCtx.globalAlpha = p.life;
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
    confettiCtx.restore();
  }
  requestAnimationFrame(animateConfetti);
}

// ===== CLICK CONFETTI =====
function initClickConfetti() {
  document.addEventListener('click', e => {
    if (e.target.closest('button, .mini-flame, .cake-wrapper')) return;
    spawnConfetti(e.clientX, e.clientY, 12);
  });
}

// ===== PRELOADER =====
function initPreloader() {
  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('progress-bar');
  const text = document.getElementById('preloader-text');
  gsap.to(text, { opacity: 1, duration: 1, delay: 0.5 });
  let progress = 0;
  const loadInterval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadInterval);
      setTimeout(() => {
        spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 60);
        gsap.to(preloader, {
          yPercent: -100, duration: 0.8, ease: 'power3.inOut',
          onComplete: () => {
            preloader.style.display = 'none';
            startHeroAnimations();
          }
        });
      }, 400);
    }
    bar.style.width = progress + '%';
  }, 200);
}

// ===== HERO ANIMATIONS =====
function startHeroAnimations() {
  const tl = gsap.timeline();
  tl.from('#hero-pig', { y: -300, duration: 1.2, ease: 'elastic.out(1,0.4)' })
    .to('.hero-line-1', { opacity: 1, duration: 0.8, y: 0 }, '-=0.3')
    .to('.hero-line-2', { opacity: 1, duration: 0.6, y: 0 }, '-=0.2')
    .from('#hero-badge', { scale: 0, duration: 0.5, ease: 'back.out(2)' }, '-=0.2');

  // Parallax on hero
  if (window.innerWidth >= 768) {
    const hero = document.getElementById('scene-hero');
    const pig = document.getElementById('hero-pig');
    const big22 = document.getElementById('big-22');
    hero.addEventListener('mousemove', e => {
      const rx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ry = (e.clientY / window.innerHeight - 0.5) * 2;
      gsap.to(pig, { x: rx * 5, y: ry * 5, duration: 0.3 });
      gsap.to(big22, { x: rx * -3, y: ry * -3, duration: 0.3 });
    });
  }

  initScrollAnimations();
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  // Scene 3 — Roast
  gsap.from('.roast-card', {
    scrollTrigger: { trigger: '#scene-roast', start: 'top 80%' },
    rotateY: 90, opacity: 0, duration: 1, ease: 'power3.out'
  });
  document.querySelectorAll('.roast-line').forEach((line, i) => {
    gsap.to(line, {
      scrollTrigger: { trigger: line, start: 'top 85%' },
      opacity: 1, x: 0, skewX: 0, duration: 0.7, delay: i * 0.2,
      onComplete: () => {
        line.classList.add('shake');
        if (line.dataset.emoji) {
          const em = document.createElement('span');
          em.className = 'emoji-reaction';
          em.textContent = line.dataset.emoji;
          em.style.right = '-30px';
          em.style.top = '0';
          line.style.position = 'relative';
          line.appendChild(em);
          gsap.to(em, { opacity: 1, y: -30, duration: 0.6, ease: 'power2.out' });
        }
      }
    });
    gsap.set(line, { x: -40, skewX: 5 });
  });
  // Glow pink
  document.querySelectorAll('.glow-pink-target').forEach(el => {
    gsap.to(el, {
      scrollTrigger: { trigger: el, start: 'top 85%' },
      className: '+=glow-pink', duration: 0.5
    });
  });

  // Scene 4 — Emotional
  document.querySelectorAll('.emotional-line').forEach((line, i) => {
    gsap.to(line, {
      scrollTrigger: { trigger: line, start: 'top 85%' },
      opacity: 1, filter: 'blur(0px)', duration: 0.8, delay: i * 0.2
    });
    gsap.set(line, { filter: 'blur(4px)' });
  });
  // Underline draw
  document.querySelectorAll('.underline-anim svg path').forEach(path => {
    gsap.to(path, {
      scrollTrigger: { trigger: path, start: 'top 85%' },
      strokeDashoffset: 0, duration: 1.2, ease: 'power2.out'
    });
  });
  // Divider line
  const divLine = document.querySelector('.section-divider svg line');
  if (divLine) {
    gsap.to(divLine, {
      scrollTrigger: { trigger: '.section-divider', start: 'top 90%' },
      strokeDashoffset: 0, duration: 1.5, ease: 'power2.out'
    });
  }

  // Scene 5 — Wishes
  document.querySelectorAll('.wish-item').forEach((item, i) => {
    gsap.to(item, {
      scrollTrigger: { trigger: item, start: 'top 85%' },
      opacity: 1, y: 0, duration: 0.6, delay: i * 0.15,
      onComplete: () => {
        if (item.classList.contains('wobble-target')) item.classList.add('wobble');
      }
    });
    gsap.set(item, { y: 20 });
  });

  // Scene 6 — Forever
  gsap.to('.forever-line', {
    scrollTrigger: { trigger: '#scene-forever', start: 'top 70%' },
    opacity: 1, duration: 1
  });
  // Kinetic line
  const kineticLine = document.getElementById('kinetic-line');
  const kineticWords = "Never stop being yourself because that's exactly why people love you.".split(' ');
  kineticWords.forEach(w => {
    const span = document.createElement('span');
    span.className = 'kinetic-word';
    span.textContent = w + ' ';
    span.style.fontSize = (0.85 + Math.random() * 0.4) + 'em';
    kineticLine.appendChild(span);
  });
  gsap.to('.kinetic-word', {
    scrollTrigger: { trigger: '#kinetic-line', start: 'top 80%' },
    opacity: 1, duration: 0.3, stagger: 0.08
  });
  // Chat bubble
  const chatBubble = document.getElementById('chat-bubble');
  const chatText = document.getElementById('chat-text');
  const typingInd = document.getElementById('typing-indicator');
  gsap.to(chatBubble, {
    scrollTrigger: { trigger: chatBubble, start: 'top 85%' },
    opacity: 1, x: 0, duration: 0.5,
    onComplete: () => {
      setTimeout(() => {
        typingInd.style.display = 'none';
        chatText.style.display = 'inline';
      }, 1500);
    }
  });
  gsap.set(chatBubble, { x: -50 });

  // Cycling words
  initCycleWords();

  // Scene 7 — Finale trigger
  ScrollTrigger.create({
    trigger: '#scene-finale',
    start: 'top 60%',
    once: true,
    onEnter: () => playFinale()
  });
}

// ===== CYCLE WORDS =====
function initCycleWords() {
  document.querySelectorAll('.cycle-word').forEach(el => {
    const words = JSON.parse(el.dataset.words);
    const colors = JSON.parse(el.dataset.colors);
    let idx = 0;
    setInterval(() => {
      idx = (idx + 1) % words.length;
      gsap.to(el, {
        duration: 0.3, opacity: 0, y: -10,
        onComplete: () => {
          el.textContent = words[idx];
          el.style.color = colors[idx];
          gsap.to(el, { duration: 0.3, opacity: 1, y: 0 });
        }
      });
    }, 2000);
  });
}

// ===== PARTICLE BACKGROUND =====
function initParticles() {
  const canvas = document.getElementById('particles-bg');
  const ctx = canvas.getContext('2d');
  let w, h, particles = [];
  const isMobile = window.innerWidth < 768;
  const count = isMobile ? 30 : 60;
  function resize() { w = canvas.width = canvas.parentElement.offsetWidth; h = canvas.height = canvas.parentElement.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.5, vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 3 + 1,
      color: ['#FF4D9E','#FFD166','#9B72FF'][Math.floor(Math.random() * 3)],
      alpha: Math.random() * 0.5 + 0.2
    });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = w; if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h; if (p.y > h) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
    });
    // Draw lines between close particles
    ctx.globalAlpha = 0.08;
    ctx.strokeStyle = '#9B72FF';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        if (Math.abs(dx) < 120 && Math.abs(dy) < 120) {
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

// ===== STARFIELD =====
function initStarfield() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];
  function resize() { w = canvas.width = canvas.parentElement.offsetWidth; h = canvas.height = canvas.parentElement.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 120; i++) {
    stars.push({
      x: Math.random() * w, y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2
    });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const t = Date.now() * 0.001;
    stars.forEach(s => {
      const alpha = 0.3 + Math.sin(t * s.twinkleSpeed * 60 + s.phase) * 0.4;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = '#F5EEF8';
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  draw();
}

// ===== CAKE INTERACTION =====
(function() {
  const flames = document.querySelectorAll('.mini-flame');
  let blownCount = 0;
  flames.forEach(flame => {
    flame.addEventListener('click', () => {
      if (flame.dataset.lit === 'true') {
        flame.classList.add('blown');
        flame.dataset.lit = 'false';
        // Smoke puff
        const smoke = document.createElement('div');
        smoke.className = 'smoke-puff';
        flame.parentElement.appendChild(smoke);
        setTimeout(() => smoke.remove(), 1000);
        blownCount++;
        if (blownCount >= flames.length) {
          setTimeout(() => {
            const rect = document.getElementById('cake-interactive').getBoundingClientRect();
            spawnConfetti(rect.left + rect.width / 2, rect.top, 50);
          }, 300);
        }
      } else {
        flame.classList.remove('blown');
        flame.dataset.lit = 'true';
        blownCount = Math.max(0, blownCount - 1);
      }
    });
  });
})();

// ===== FIREWORKS =====
function initFireworks(canvas) {
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.parentElement.offsetWidth;
  canvas.height = canvas.parentElement.offsetHeight;
  const w = canvas.width, h = canvas.height;
  const rockets = [], sparks = [];
  const colors = ['#FF4D9E','#FFD166','#9B72FF','#48dbfb','#ff6b6b','#feca57'];

  for (let i = 0; i < 8; i++) {
    setTimeout(() => {
      const x = Math.random() * w * 0.8 + w * 0.1;
      const y = Math.random() * h * 0.4 + h * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      for (let j = 0; j < 40; j++) {
        const angle = (Math.PI * 2 * j) / 40;
        const speed = Math.random() * 4 + 2;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.01 + Math.random() * 0.01,
          color, r: Math.random() * 2 + 1
        });
      }
    }, i * 300);
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx; s.y += s.vy;
      s.vy += 0.04;
      s.vx *= 0.99;
      s.life -= s.decay;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.life;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (sparks.length > 0) requestAnimationFrame(draw);
  }
  draw();
  return { sparks };
}

// ===== FINALE =====
let finalePlayedOnce = false;
function playFinale() {
  // Camera flash
  const flash = document.createElement('div');
  flash.className = 'camera-flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 500);

  // Fireworks
  initFireworks(document.getElementById('fireworks-canvas'));

  const tl = gsap.timeline();
  tl.to('#finale-pig', { opacity: 1, y: 0, duration: 0.8, ease: 'elastic.out(1,0.5)', delay: 0.3 })
    .from('#finale-pig', { y: -200 }, '<')
    .to('#finale-text', { opacity: 1, duration: 0.8 }, '-=0.3')
    .to('.finale-emojis', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.2')
    .to('#finale-ribbon svg line', { strokeDashoffset: 0, duration: 1.2, ease: 'power2.out' }, '-=0.3')
    .to('.made-with-love', { opacity: 1, duration: 1 }, '-=0.5');

  gsap.set('.finale-emojis', { scale: 0 });

  // Dense confetti
  setTimeout(() => {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        spawnConfetti(Math.random() * window.innerWidth, 0, 30);
      }, i * 400);
    }
  }, 500);

  // Pig rock loop
  gsap.to('#finale-pig', {
    rotation: 5, duration: 1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2
  });

  // Periodic fireworks
  if (!finalePlayedOnce) {
    setInterval(() => {
      if (isElementInViewport(document.getElementById('scene-finale'))) {
        initFireworks(document.getElementById('fireworks-canvas'));
      }
    }, 8000);
    finalePlayedOnce = true;
  }
}

function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

// Replay button
document.getElementById('btn-replay')?.addEventListener('click', () => {
  gsap.set('#finale-pig', { opacity: 0, y: 0, rotation: 0 });
  gsap.set('#finale-text', { opacity: 0 });
  gsap.set('.finale-emojis', { opacity: 0, scale: 0 });
  gsap.set('.made-with-love', { opacity: 0 });
  gsap.set('#finale-ribbon svg line', { strokeDashoffset: 600 });
  playFinale();
});

// ===== AUDIO (Web Audio API) =====
function initAudio() {
  const btn = document.getElementById('audio-toggle');
  let audioCtx, playing = false, interval;
  btn.addEventListener('click', () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (playing) {
      clearInterval(interval);
      playing = false;
      btn.textContent = '🔇';
    } else {
      const notes = [261.63, 329.63, 392.00, 329.63, 261.63, 392.00]; // C4 E4 G4 arpeggio
      let idx = 0;
      function playNote() {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = notes[idx % notes.length];
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        osc.connect(gain).connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
        idx++;
      }
      playNote();
      interval = setInterval(playNote, 600);
      playing = true;
      btn.textContent = '🔊';
    }
  });
}

// ===== KONAMI CODE =====
function initKonamiCode() {
  const code = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];
  let pos = 0;
  document.addEventListener('keydown', e => {
    if (e.code === code[pos]) {
      pos++;
      if (pos === code.length) {
        pos = 0;
        pigParade();
      }
    } else {
      pos = 0;
    }
  });
}

function pigParade() {
  for (let i = 0; i < 20; i++) {
    const pig = document.createElement('div');
    pig.textContent = '🐷';
    pig.style.cssText = `position:fixed;font-size:40px;left:-50px;top:${100 + Math.random()*400}px;z-index:100000;transition:none;`;
    document.body.appendChild(pig);
    gsap.to(pig, {
      x: window.innerWidth + 100, duration: 3 + Math.random() * 2,
      delay: i * 0.15, ease: 'none',
      onComplete: () => pig.remove()
    });
  }
  // Beep sequence
  try {
    const ctx = new AudioContext();
    [523,659,784,659,523].forEach((f, i) => {
      setTimeout(() => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.frequency.value = f; o.type = 'square';
        g.gain.value = 0.05;
        o.connect(g).connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + 0.15);
      }, i * 150);
    });
  } catch(e) {}
}

// ===== MOBILE SHAKE =====
if ('DeviceMotionEvent' in window) {
  let lastShake = 0;
  window.addEventListener('devicemotion', e => {
    const acc = e.accelerationIncludingGravity;
    if (!acc) return;
    const force = Math.abs(acc.x) + Math.abs(acc.y) + Math.abs(acc.z);
    if (force > 35 && Date.now() - lastShake > 1000) {
      lastShake = Date.now();
      spawnConfetti(window.innerWidth / 2, window.innerHeight / 2, 25);
    }
  });
}
