// ===== SCENE 4 — FOREVER MESSAGE =====
let foreverDone = false;
function animForever() {
  if (foreverDone) return;
  foreverDone = true;

  // Init ember canvas
  initEmbers();

  // Entry label + rule
  gsap.to('#forever-label', { opacity: 1, duration: 1, delay: 0.3 });
  setTimeout(() => { document.getElementById('forever-rule').style.width = '200px'; }, 800);

  // Adjective spotlight
  setTimeout(startAdjectiveSpotlight, 2000);

  // Kinetic paragraph
  setTimeout(buildKineticParagraph, 4000);

  // Phone mockup chat
  setTimeout(playPhoneChat, 8000);

  // Vintage letter
  setTimeout(animVintageLetter, 14000);

  // Constellation
  setTimeout(animConstellation, 19000);

  // Bridge text
  setTimeout(() => gsap.to('#scene-bridge', { opacity: 1, duration: 1 }), 23000);
}

// Ember particles
function initEmbers() {
  const cv = document.getElementById('ember-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let w, h, embers = [];
  function rs() { w = cv.width = cv.parentElement.offsetWidth; h = cv.height = cv.parentElement.offsetHeight; }
  rs(); addEventListener('resize', rs);
  for (let i = 0; i < 35; i++) {
    embers.push({ x: Math.random() * w, y: h + Math.random() * 50, vx: (Math.random() - 0.5) * 0.3, vy: -(Math.random() * 0.5 + 0.15), r: Math.random() * 2 + 0.5, a: Math.random() * 0.6 + 0.2, col: Math.random() > 0.5 ? '#d4a04a' : '#ff8844' });
  }
  (function draw() {
    ctx.clearRect(0, 0, w, h);
    embers.forEach(e => {
      e.x += e.vx; e.y += e.vy;
      if (e.y < -20) { e.y = h + 10; e.x = Math.random() * w; }
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
      ctx.fillStyle = e.col; ctx.globalAlpha = e.a; ctx.shadowBlur = 6; ctx.shadowColor = e.col;
      ctx.fill(); ctx.shadowBlur = 0;
    });
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  })();
}

// Adjective spotlight cycling
let adjIdx = 0, adjIV;
function startAdjectiveSpotlight() {
  const words = document.querySelectorAll('.adj-word');
  const note = document.getElementById('adj-note');

  function spotlightWord(idx) {
    words.forEach((w, i) => {
      if (i === idx) {
        w.classList.add('lit');
        w.style.setProperty('--adj-color', w.dataset.color);
        w.style.color = w.dataset.color;
        w.style.textShadow = '0 0 20px ' + w.dataset.color;
        // Show emoji above
        let em = w.querySelector('.adj-emoji');
        if (!em) { em = document.createElement('span'); em.className = 'adj-emoji'; em.textContent = w.dataset.emoji; w.appendChild(em); }
        gsap.fromTo(em, { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.3 });
        setTimeout(() => gsap.to(em, { opacity: 0, duration: 0.3 }), 1500);
        // Note
        note.textContent = w.dataset.note;
        gsap.to(note, { opacity: 1, duration: 0.3 });
      } else {
        w.classList.remove('lit');
        w.style.color = 'rgba(245,238,248,0.35)';
        w.style.textShadow = 'none';
      }
    });
  }

  spotlightWord(0);
  adjIV = setInterval(() => {
    adjIdx = (adjIdx + 1) % words.length;
    gsap.to(note, { opacity: 0, duration: 0.2 });
    spotlightWord(adjIdx);
  }, 2500);

  // Click to manually trigger
  words.forEach((w, i) => {
    w.addEventListener('click', () => {
      clearInterval(adjIV);
      adjIdx = i;
      gsap.to(note, { opacity: 0, duration: 0.15 });
      spotlightWord(i);
      adjIV = setInterval(() => { adjIdx = (adjIdx + 1) % words.length; gsap.to(note, { opacity: 0, duration: 0.2 }); spotlightWord(adjIdx); }, 2500);
    });
  });
}

// Kinetic typography
function buildKineticParagraph() {
  const container = document.getElementById('kinetic-para');
  const rawWords = [
    { t: 'Never', cls: 'bold-word' }, { t: 'stop', cls: 'stop-word' }, { t: 'being', cls: '' },
    { t: 'yourself', cls: 'yourself-word' }, { t: '|pause|' },
    { t: 'because', cls: '' }, { t: "that's", cls: '' }, { t: 'exactly', cls: 'bold-word' },
    { t: 'why', cls: '' }, { t: 'people', cls: '' }, { t: 'love', cls: 'love-word' },
    { t: '|newline|' }, { t: 'you', cls: 'you-word' }
  ];

  let delay = 0;
  rawWords.forEach(w => {
    if (w.t === '|pause|') { delay += 500; return; }
    if (w.t === '|newline|') { return; }
    const span = document.createElement('span');
    span.className = 'k-word ' + (w.cls || '');
    span.textContent = w.t + ' ';
    container.appendChild(span);
    setTimeout(() => gsap.to(span, { opacity: 1, duration: 0.4 }), delay);
    delay += 150;
  });
}

// WhatsApp phone chat sequence
function playPhoneChat() {
  const chat = document.getElementById('phone-chat');
  const phone = document.getElementById('phone-mockup');
  if (!chat || !phone) return;

  gsap.fromTo(phone, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 });

  const msgs = [
    { type: 'sent', text: 'Btw...', delay: 1000 },
    { type: 'typing', delay: 1500 },
    { type: 'sent', text: 'Bs ab jaada bhav mat badha Lena khud k 😌😂', delay: 500, receipt: true },
    { type: 'typing', delay: 2000 },
    { type: 'received', text: '😂😂😂', delay: 500 },
    { type: 'sent', text: 'I knew it 🙂🙃', delay: 1000 }
  ];

  let totalDelay = 800;
  msgs.forEach(m => {
    totalDelay += m.delay;
    setTimeout(() => {
      if (m.type === 'typing') {
        const t = document.createElement('div');
        t.className = 'chat-typing';
        t.innerHTML = '<span></span><span></span><span></span>';
        chat.appendChild(t);
        gsap.to(t, { opacity: 1, y: 0, duration: 0.3 });
        setTimeout(() => t.remove(), m.delay - 200);
        return;
      }
      const div = document.createElement('div');
      div.className = 'chat-msg ' + m.type;
      div.textContent = m.text;
      if (m.receipt) {
        const r = document.createElement('div');
        r.className = 'read-receipt';
        r.textContent = '✓✓';
        div.appendChild(r);
        setTimeout(() => r.style.color = '#53bdeb', 800);
      }
      chat.appendChild(div);
      gsap.to(div, { opacity: 1, y: 0, duration: 0.4 });
    }, totalDelay);
  });
}

// Vintage letter animation
function animVintageLetter() {
  const letter = document.getElementById('vintage-letter');
  if (!letter) return;
  gsap.fromTo(letter, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6 });

  // Animate checkmarks and list items one by one
  const items = letter.querySelectorAll('li');
  const checks = letter.querySelectorAll('.check-svg path');
  items.forEach((item, i) => {
    setTimeout(() => {
      gsap.to(item, { opacity: 1, duration: 0.4 });
      gsap.to(checks[i], { strokeDashoffset: 0, duration: 0.5, delay: 0.15 });
    }, i * 400);
  });
}

// Constellation canvas
function animConstellation() {
  const cv = document.getElementById('constellation-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const w = cv.width, h = cv.height;
  const starL = { x: w * 0.25, y: h * 0.5 }; // "You"
  const starR = { x: w * 0.75, y: h * 0.5 }; // "Me"
  const heartPos = { x: (starL.x + starR.x) / 2, y: (starL.y + starR.y) / 2 };
  let lineProgress = 0;

  // Animate line drawing
  gsap.to({ v: 0 }, { v: 1, duration: 2, ease: 'power2.inOut', onUpdate: function () { lineProgress = this.targets()[0].v; } });

  (function draw() {
    ctx.clearRect(0, 0, w, h);
    const t = Date.now() * 0.001;

    // Stars glow
    [{ s: starL, c: '#FF4D9E', label: 'You' }, { s: starR, c: '#FFD166', label: 'Me' }].forEach(({ s, c, label }) => {
      const pulse = 3 + Math.sin(t * 2) * 1.5;
      ctx.beginPath(); ctx.arc(s.x, s.y, pulse, 0, Math.PI * 2);
      ctx.fillStyle = c; ctx.shadowBlur = 15; ctx.shadowColor = c; ctx.fill(); ctx.shadowBlur = 0;
      ctx.font = '14px Caveat'; ctx.fillStyle = '#b8956a'; ctx.textAlign = 'center';
      ctx.fillText(label, s.x, s.y + 22);
    });

    // Line
    if (lineProgress > 0) {
      const endX = starL.x + (starR.x - starL.x) * lineProgress;
      const endY = starL.y + (starR.y - starL.y) * lineProgress;
      // Slight curve
      ctx.beginPath(); ctx.moveTo(starL.x, starL.y);
      const cpY = starL.y - 20;
      const cpX = (starL.x + endX) / 2;
      ctx.quadraticCurveTo(cpX, cpY, endX, endY);
      ctx.strokeStyle = '#FFD166'; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.6; ctx.stroke(); ctx.globalAlpha = 1;
    }

    // Heart at midpoint
    if (lineProgress >= 0.5) {
      const beat = 1 + Math.sin(t * 3) * 0.15;
      ctx.font = (14 * beat) + 'px serif'; ctx.textAlign = 'center';
      ctx.fillText('❤️', heartPos.x, heartPos.y + 5);
    }

    requestAnimationFrame(draw);
  })();

  // Fade in text
  gsap.to('.constellation-text', { opacity: 1, duration: 2, delay: 1.5 });
}

// ===== SCENE 5 — THE DOOR =====
function animDoor() {
  gsap.fromTo('.door-text', { opacity: 0 }, { opacity: 1, duration: 0.6 });
  gsap.fromTo('.doors-container', { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.3 });
  gsap.fromTo('.door-open-btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, delay: 0.8 });
}

document.getElementById('door-open-btn')?.addEventListener('click', openDoors);

function openDoors() {
  const doors = document.getElementById('doors-container');
  const light = document.getElementById('door-light');
  doors.classList.add('open');
  gsap.to(light, { opacity: 1, duration: 0.6, delay: 0.4 });

  setTimeout(() => {
    // White flash
    const f = document.createElement('div'); f.className = 'camera-flash'; document.body.appendChild(f);
    setTimeout(() => f.remove(), 400);
    // Go to finale
    showScene(currentSceneIndex + 1);
  }, 1400);
}

// ===== SCENE 6/7 — GRAND FINALE =====
let finaleIV, idleTimer;
function playFinale() {
  if (finaleIV) clearInterval(finaleIV);

  // Flash
  const f = document.createElement('div'); f.className = 'camera-flash'; document.body.appendChild(f);
  setTimeout(() => f.remove(), 400);

  // Fireworks
  initFireworks(document.getElementById('fireworks-canvas'));

  // Pig drop
  const tl = gsap.timeline();
  gsap.set('.finale-emojis', { scale: 0 });
  tl.set('#finale-pig', { scale: 0.1, opacity: 0 })
    .to('#finale-pig', { opacity: 1, scale: 1.2, duration: 0.8, ease: 'elastic.out(1,0.5)' })
    .to('#finale-pig', { scale: 1, duration: 0.2 })
    .to('#finale-text', { opacity: 1, duration: 0.8 }, '-=0.2')
    .to('.finale-emojis', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, '-=0.3');

  // Confetti shower
  for (let i = 0; i < 6; i++) setTimeout(() => spawnConfetti(Math.random() * innerWidth, 0, 30), i * 350);

  // Pig rock
  gsap.to('#finale-pig', { rotation: 6, duration: 1.2, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2 });

  // Callback cards
  setTimeout(() => {
    document.querySelectorAll('.cb-card').forEach((c, i) => {
      gsap.to(c, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.15 });
    });
    // Live clock
    const cl = document.getElementById('cb-clock');
    if (cl) { setInterval(() => { const d = new Date(); cl.textContent = d.toLocaleTimeString(); }, 1000); cl.textContent = new Date().toLocaleTimeString(); }
  }, 2500);

  // Unfold letter
  setTimeout(() => {
    const lt = document.getElementById('finale-letter');
    if (lt) { lt.classList.add('unfolded'); gsap.to(lt.querySelector('svg line'), { strokeDashoffset: 0, duration: 1, delay: 0.5 }); }
  }, 5000);

  // Birthday counter
  setTimeout(() => {
    const ct = document.getElementById('bday-counter');
    gsap.to(ct, { opacity: 1, duration: 0.5 });
    gsap.to('#cnt-years', { textContent: 22, duration: 1.5, snap: { textContent: 1 }, ease: 'power2.out' });
    gsap.to('#cnt-months', { textContent: 264, duration: 2, snap: { textContent: 1 }, ease: 'power2.out' });
    gsap.to('#cnt-days', { textContent: 8030, duration: 2.5, snap: { textContent: 1 }, ease: 'power2.out', onComplete: () => gsap.to('.counter-after', { opacity: 1, duration: 0.8 }) });
  }, 7500);

  // Polaroids
  setTimeout(() => {
    document.querySelectorAll('.polaroid').forEach((p, i) => {
      // Set back text
      const backP = p.querySelector('.pol-back p');
      if (backP) backP.textContent = p.dataset.back;
      gsap.fromTo(p, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.4, delay: i * 0.2 });
      p.addEventListener('click', () => p.classList.toggle('flipped'));
    });
  }, 10000);

  // Auto fireworks every 5s
  finaleIV = setInterval(() => { if (currentSceneIndex >= 6) initFireworks(document.getElementById('fireworks-canvas')); }, 5000);

  // Idle easter egg after 60s
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    const egg = document.getElementById('idle-egg');
    if (egg) egg.classList.add('visible');
  }, 60000);
}

// Replay menu
document.getElementById('replay-menu')?.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const target = parseInt(btn.dataset.target);
    // Reset scene states for replay
    if (target === 1) roastDone = false;
    if (target === 3) { cakeOn = false; blown = 0; }
    if (target === 4) foreverDone = false;
    showScene(target);
  });
});

// ===== FIREWORKS ENGINE =====
function initFireworks(cv) {
  if (!cv) return;
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
