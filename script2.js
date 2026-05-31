// ===== SCENE DISPATCHER =====
function triggerScene(idx) {
  switch(idx) {
    case 0: animHero(); break;
    case 1: animRoast(); break;
    case 2: animEmotional(); break;
    case 3: animCake(); break;
    case 4: animForever(); break;
    case 5: animDoor(); break;
    case 6: playFinale(); break;
    case 7: playFinale(); break;
  }
}

// ===== SCENE 0 — HERO =====
function animHero() {
  gsap.set('#hero-pig',{scale:.1});
  const tl=gsap.timeline();
  tl.to('#hero-pig',{scale:1.1,duration:.8,ease:'back.out(2)'})
    .to('#hero-pig',{scale:1,duration:.3})
    .to('.hero-line-1',{opacity:1,duration:.6},'-=.2')
    .to('.hero-line-2',{opacity:1,duration:.6},'-=.3')
    .from('#hero-badge',{scale:0,duration:.5,ease:'back.out(2)'},'-=.2');
}

// ===== SCENE 1 — ROAST =====
let roastDone=false;
function animRoast(){
  if(roastDone)return; roastDone=true;
  const tl=gsap.timeline();
  tl.to('.curtain-left',{scaleX:0,duration:.8,ease:'power2.in'})
    .to('.curtain-right',{scaleX:0,duration:.8,ease:'power2.in'},'<');
  tl.add(()=>{const f=document.createElement('div');f.className='camera-flash';document.body.appendChild(f);setTimeout(()=>f.remove(),400);});
  tl.from('.mic-stand',{y:-200,duration:.6,ease:'bounce.out'},'+=.2');
  tl.fromTo('.neon-sign span',{opacity:0},{opacity:1,duration:.1,repeat:5,yoyo:true},'-=.3').to('.neon-sign span',{opacity:1,duration:.3});
  // Line 1
  tl.add(()=>{
    const l=document.getElementById('roast-l1');
    gsap.fromTo(l,{opacity:0,x:-200,scale:1.4},{opacity:1,x:0,scale:1,duration:.8,ease:'power2.out',onComplete:()=>{
      gsap.to('.mic-head',{rotation:-5,duration:.1,yoyo:true,repeat:3});
      gsap.to(l.querySelector('.reaction-emoji'),{opacity:1,duration:.3});
    }});
  },'+=.5');
  // Line 2
  tl.add(()=>{
    const l=document.getElementById('roast-l2');
    gsap.to(l,{opacity:1,duration:.1});
    const w=l.querySelector('.slam-word');
    gsap.fromTo(w,{scale:1.6,opacity:0},{scale:1,opacity:1,duration:.3,ease:'power4.out',onComplete:()=>{
      w.classList.add('vibrate');l.querySelector('.buzzer').classList.add('active');
      bounceAud();
    }});
  },'+=.8');
  // Line 3
  tl.add(()=>{
    const l=document.getElementById('roast-l3');
    gsap.to(l,{opacity:1,duration:.1});
    const w=l.querySelector('.scatter-word');
    gsap.fromTo(w,{rotation:180,scale:.3,x:100,opacity:0},{rotation:0,scale:1,x:0,opacity:1,duration:.6,ease:'back.out(2)',onComplete:()=>{
      gsap.to(w,{rotation:360,duration:.6});
      const d=l.querySelector('.dizzy');gsap.to(d,{opacity:1,duration:.2});d.classList.add('orbit');
      setTimeout(()=>gsap.to(d,{opacity:0,duration:.5}),2200);
      bounceAud();
    }});
  },'+=.8');
  // Line 4
  tl.add(()=>{setTimeout(()=>{
    const l=document.getElementById('roast-l4');
    gsap.fromTo(l,{opacity:0,y:20},{opacity:1,y:0,duration:.8,onComplete:()=>{
      const b=l.querySelector('.big-emoji-laugh');b.classList.add('pop');setTimeout(()=>b.classList.remove('pop'),1500);
      const r=document.getElementById('audience-row');r.style.opacity=1;r.classList.add('active');
    }});
  },1500);},'+=.3');
  setTimeout(showCards,8000);
}
function bounceAud(){const r=document.getElementById('audience-row');r.style.opacity='1';r.classList.remove('active');void r.offsetWidth;r.classList.add('active');}
function showCards(){
  document.querySelectorAll('.roast-stat-card').forEach((c,i)=>{
    gsap.to(c,{opacity:1,y:0,duration:.5,delay:i*.3,onComplete:()=>{
      if(i===0)document.getElementById('annoyance-bar').style.width='97%';
      if(i===1){gsap.to('.gauge-needle',{attr:{transform:'rotate(160 60 65)'},duration:1.5,ease:'elastic.out(1,0.5)'});gsap.to('.gauge-fill',{strokeDashoffset:0,duration:1.5});}
      if(i===2){document.querySelectorAll('.star').forEach((s,si)=>setTimeout(()=>s.classList.add('lit'),si*300));}
    }});
  });
  setTimeout(showWA,3500);
}
function showWA(){
  const b=document.getElementById('whatsapp-bubble');
  gsap.to(b,{opacity:1,y:0,duration:.5});
  setTimeout(()=>{document.getElementById('wa-typing').style.display='none';
    const t=document.getElementById('wa-text');if(t)t.style.display='block';
    setTimeout(()=>{const s=document.getElementById('flip-smiley');if(s)s.classList.add('flipped');},2000);
  },1500);
  setTimeout(()=>gsap.to('.mic-drop-btn',{opacity:1,y:0,duration:.4}),2500);
}
document.getElementById('mic-drop-btn')?.addEventListener('click',()=>{
  document.getElementById('mic-stand').classList.add('dropped');
  document.body.classList.add('shaking');setTimeout(()=>document.body.classList.remove('shaking'),400);
  playTone(150,'sine',.3);gsap.to('.mic-drop-btn',{opacity:0,duration:.3});
  gsap.to('#mic-drop-text',{opacity:1,duration:.6,delay:.3});
  const r=document.getElementById('audience-row');r.classList.remove('active');r.classList.add('ovation');
  r.querySelectorAll('span').forEach((s,i)=>s.style.animationDelay=i*.1+'s');
  setTimeout(()=>gsap.to('#roast-transition',{opacity:1,duration:.8}),1500);
});

// ===== SCENE 2 — EMOTIONAL =====
function animEmotional(){
  document.querySelectorAll('.emotional-line').forEach((l,i)=>gsap.fromTo(l,{opacity:0,filter:'blur(5px)'},{opacity:1,filter:'blur(0px)',duration:.8,delay:i*.25}));
  document.querySelectorAll('.underline-anim svg path').forEach(p=>gsap.to(p,{strokeDashoffset:0,duration:1.2,ease:'power2.out',delay:.6}));
}

// ===== SCENE 3 — CAKE =====
let cakeOn=false,blown=0;const TC=10;
function initCake(){
  const ring=document.getElementById('candle-ring');if(!ring)return;
  for(let i=0;i<TC;i++){const c=document.createElement('div');c.className='c-candle';c.innerHTML='<div class="c-wick"></div><div class="c-flame" data-lit="true"></div>';c.addEventListener('click',()=>blowC(c));ring.appendChild(c);}
}
function animCake(){
  if(cakeOn)return;
  const pr=document.getElementById('breath-prompt');gsap.fromTo(pr,{opacity:0,y:20},{opacity:1,y:0,duration:.6});
  setTimeout(()=>{gsap.to('#wish-received',{opacity:1,duration:.5});playTone(523,'triangle',.3);setTimeout(()=>playTone(659,'triangle',.3),150);setTimeout(()=>playTone(784,'triangle',.3),300);},3000);
  setTimeout(()=>{gsap.to(pr,{opacity:0,duration:.4,onComplete:()=>{pr.style.display='none';const l=document.getElementById('cake-wishes-layout');l.style.display='flex';gsap.fromTo(l,{opacity:0,scale:.9},{opacity:1,scale:1,duration:.6});gsap.from('.cake-3d',{scale:.7,opacity:0,duration:.8,ease:'elastic.out(1,.5)',delay:.2});cakeOn=true;}});},4500);
}
function blowC(c){
  const f=c.querySelector('.c-flame');if(!f||f.dataset.lit!=='true')return;
  f.classList.add('out');f.dataset.lit='false';
  const s=document.createElement('div');s.className='smoke';c.appendChild(s);setTimeout(()=>s.remove(),800);
  playTone(261.63*(1+blown*.15),'sine',.2);blown++;
  document.getElementById('candle-counter').textContent=(TC-blown)+' candles remaining...';
  const cards=document.querySelectorAll('.wish-card'),ci=Math.min(Math.floor((blown-1)*6/TC),5),card=cards[ci];
  if(card&&card.style.opacity!=='1'){gsap.to(card,{opacity:1,y:0,duration:.5,onComplete:()=>{
    if(ci===1){const fl=card.querySelector('.success-fill');if(fl)fl.style.width='100%';}
    if(ci===3){const fl=card.querySelector('.sense-fill');if(fl)fl.style.width='10%';}
    if(ci===5){cards.forEach(x=>{if(x!==card)x.style.filter='brightness(0.4)';});card.style.boxShadow='0 0 30px rgba(255,209,102,.4)';setTimeout(()=>cards.forEach(x=>x.style.filter=''),3000);}
    spawnConfetti(card.getBoundingClientRect().left+card.offsetWidth/2,card.getBoundingClientRect().top,8);
  }});}
  if(blown>=TC){
    gsap.to('.cake-3d',{rotation:3,duration:.1,yoyo:true,repeat:5});
    const r=document.querySelector('.cake-3d').getBoundingClientRect();spawnConfetti(r.left+r.width/2,r.top,60);
    playTone(523,'triangle',.3);setTimeout(()=>playTone(659,'triangle',.3),120);setTimeout(()=>playTone(784,'triangle',.5),240);
    document.getElementById('candle-counter').textContent='';document.getElementById('blow-all-btn').style.display='none';
    const bn=document.getElementById('all-blown-banner');bn.style.display='block';
    setTimeout(()=>{const n=document.getElementById('sticky-note');n.style.display='block';gsap.fromTo(n,{opacity:0,scale:.8},{opacity:1,scale:1,duration:.5,ease:'back.out(2)'});
      const sm=document.getElementById('flip-smiley-2');if(sm){n.addEventListener('mouseenter',()=>sm.classList.add('flipped'));n.addEventListener('mouseleave',()=>sm.classList.remove('flipped'));n.addEventListener('touchstart',()=>sm.classList.toggle('flipped'));}
    },1500);
    gsap.to(btnNext,{scale:1.15,duration:.3,yoyo:true,repeat:3});
  }
}
document.getElementById('blow-all-btn')?.addEventListener('click',()=>{document.querySelectorAll('.c-flame[data-lit="true"]').forEach((f,i)=>setTimeout(()=>blowC(f.parentElement),i*80));});
