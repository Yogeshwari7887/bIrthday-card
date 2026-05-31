// ===== CORE STATE =====
let currentSceneIndex = 0;
const scenes = document.querySelectorAll('.scene');
const dots = document.querySelectorAll('.dot');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');

document.addEventListener('DOMContentLoaded', () => {
  initCursor(); initConfettiCanvas(); initPreloader();
  initParticles(); initStarfield(); initFireflies();
  initAudio(); initClickConfetti(); initKonamiCode();
  initMouseGlow(); initSwipe(); initCake(); initSmoke();
  updateNavigation();
});

// ===== CURSOR =====
function initCursor() {
  const c = document.getElementById('custom-cursor');
  if (innerWidth < 768) return;
  let mx=0,my=0,cx=0,cy=0,t=0;
  document.addEventListener('mousemove', e => { mx=e.clientX; my=e.clientY; });
  (function loop() {
    cx+=(mx-cx)*.15; cy+=(my-cy)*.15;
    c.style.left=cx+'px'; c.style.top=cy+'px';
    if(++t%4===0){ const s=document.createElement('span'); s.className='sparkle'; s.textContent='✨'; s.style.left=cx+(Math.random()*20-10)+'px'; s.style.top=cy+(Math.random()*20-10)+'px'; document.body.appendChild(s); setTimeout(()=>s.remove(),800); }
    requestAnimationFrame(loop);
  })();
}
function initMouseGlow() {
  const g=document.getElementById('mouse-glow');
  document.addEventListener('mousemove',e=>{g.style.left=e.clientX+'px';g.style.top=e.clientY+'px';});
}

// ===== CONFETTI =====
let cCtx,cCvs,cParts=[];
function initConfettiCanvas(){cCvs=document.getElementById('confetti-canvas');cCtx=cCvs.getContext('2d');rConf();addEventListener('resize',rConf);aConf();}
function rConf(){cCvs.width=innerWidth;cCvs.height=innerHeight;}
function spawnConfetti(x,y,n=30){
  const cols=['#FF4D9E','#FFD166','#9B72FF','#F5EEF8','#ff6b6b','#48dbfb'];
  for(let i=0;i<n;i++) cParts.push({x,y,vx:(Math.random()-.5)*12,vy:(Math.random()-1)*10-3,sz:Math.random()*8+4,col:cols[~~(Math.random()*cols.length)],rot:Math.random()*360,rs:(Math.random()-.5)*10,life:1,dec:.008+Math.random()*.008});
  if(cParts.length>300) cParts.splice(0,cParts.length-300);
}
function aConf(){
  cCtx.clearRect(0,0,cCvs.width,cCvs.height);
  for(let i=cParts.length-1;i>=0;i--){const p=cParts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=.15;p.rot+=p.rs;p.life-=p.dec;if(p.life<=0){cParts.splice(i,1);continue;}cCtx.save();cCtx.translate(p.x,p.y);cCtx.rotate(p.rot*Math.PI/180);cCtx.globalAlpha=p.life;cCtx.fillStyle=p.col;cCtx.fillRect(-p.sz/2,-p.sz/2,p.sz,p.sz*.6);cCtx.restore();}
  requestAnimationFrame(aConf);
}
function initClickConfetti(){document.addEventListener('click',e=>{if(e.target.closest('button,.c-candle,.c-flame,.roast-stat-card,.whatsapp-bubble'))return;spawnConfetti(e.clientX,e.clientY,10);});}

// ===== PRELOADER =====
function initPreloader(){
  const pr=document.getElementById('preloader'),bar=document.getElementById('progress-bar'),txt=document.getElementById('preloader-text');
  gsap.to(txt,{opacity:1,duration:1,delay:.5});
  let p=0;const iv=setInterval(()=>{p+=Math.random()*15+5;if(p>=100){p=100;clearInterval(iv);setTimeout(()=>{spawnConfetti(innerWidth/2,innerHeight/2,50);gsap.to(pr,{yPercent:-100,duration:.8,ease:'power3.inOut',onComplete:()=>{pr.style.display='none';triggerScene(0);}});},500);}bar.style.width=p+'%';},180);
}

// ===== NAVIGATION =====
function showScene(idx){
  if(idx<0||idx>=scenes.length) return;
  const cur=scenes[currentSceneIndex],nxt=scenes[idx];
  gsap.to(cur,{opacity:0,duration:.35,onComplete:()=>{cur.classList.remove('active');nxt.classList.add('active');gsap.fromTo(nxt,{opacity:0},{opacity:1,duration:.4,onComplete:()=>triggerScene(idx)});}});
  currentSceneIndex=idx; updateNavigation();
}
function updateNavigation(){
  dots.forEach((d,i)=>d.classList.toggle('active',i===currentSceneIndex));
  btnPrev.classList.toggle('hidden',currentSceneIndex===0);
  btnNext.textContent=currentSceneIndex===scenes.length-1?'Replay':'Next';
}
btnPrev.addEventListener('click',()=>showScene(currentSceneIndex-1));
btnNext.addEventListener('click',()=>{if(currentSceneIndex===scenes.length-1)showScene(0);else showScene(currentSceneIndex+1);});
dots.forEach((d,i)=>d.addEventListener('click',()=>showScene(i)));
function initSwipe(){
  let sx=0;
  document.addEventListener('touchstart',e=>sx=e.changedTouches[0].screenX);
  document.addEventListener('touchend',e=>{const d=e.changedTouches[0].screenX-sx;if(Math.abs(d)>60){d<0?showScene(currentSceneIndex+1):showScene(currentSceneIndex-1);}});
}

// ===== PARTICLES =====
function initParticles(){
  const cv=document.getElementById('particles-bg'),ctx=cv.getContext('2d');let w,h,ps=[];const n=innerWidth<768?20:50;
  function rs(){w=cv.width=cv.parentElement.offsetWidth;h=cv.height=cv.parentElement.offsetHeight;}rs();addEventListener('resize',rs);
  for(let i=0;i<n;i++)ps.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.5,vy:(Math.random()-.5)*.5,r:Math.random()*3+1,col:['#FF4D9E','#FFD166','#9B72FF'][~~(Math.random()*3)],a:Math.random()*.5+.2});
  (function draw(){ctx.clearRect(0,0,w,h);ps.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0)p.x=w;if(p.x>w)p.x=0;if(p.y<0)p.y=h;if(p.y>h)p.y=0;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=p.col;ctx.globalAlpha=p.a;ctx.fill();});ctx.globalAlpha=.06;ctx.strokeStyle='#9B72FF';ctx.lineWidth=.5;for(let i=0;i<ps.length;i++)for(let j=i+1;j<ps.length;j++){const dx=ps[i].x-ps[j].x,dy=ps[i].y-ps[j].y;if(Math.abs(dx)<100&&Math.abs(dy)<100){ctx.beginPath();ctx.moveTo(ps[i].x,ps[i].y);ctx.lineTo(ps[j].x,ps[j].y);ctx.stroke();}}ctx.globalAlpha=1;requestAnimationFrame(draw);})();
}
function initStarfield(){
  const cv=document.getElementById('starfield'),ctx=cv.getContext('2d');let w,h,ss=[];
  function rs(){w=cv.width=cv.parentElement.offsetWidth;h=cv.height=cv.parentElement.offsetHeight;}rs();addEventListener('resize',rs);
  for(let i=0;i<80;i++)ss.push({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+.3,ts:Math.random()*.015+.005,ph:Math.random()*Math.PI*2});
  (function draw(){ctx.clearRect(0,0,w,h);const t=Date.now()*.001;ss.forEach(s=>{const a=.3+Math.sin(t*s.ts*60+s.ph)*.4;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='#F5EEF8';ctx.globalAlpha=Math.max(0,a);ctx.fill();});ctx.globalAlpha=1;requestAnimationFrame(draw);})();
}
function initFireflies(){
  const cv=document.getElementById('fireflies-canvas');if(!cv)return;const ctx=cv.getContext('2d');let w,h,ff=[];
  function rs(){w=cv.width=cv.parentElement.offsetWidth;h=cv.height=cv.parentElement.offsetHeight;}rs();addEventListener('resize',rs);
  for(let i=0;i<25;i++)ff.push({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,r:Math.random()*2+1,ph:Math.random()*Math.PI*2});
  (function draw(){ctx.clearRect(0,0,w,h);const t=Date.now()*.001;ff.forEach(f=>{f.x+=f.vx;f.y+=f.vy;if(f.x<0)f.x=w;if(f.x>w)f.x=0;if(f.y<0)f.y=h;if(f.y>h)f.y=0;const a=.2+Math.sin(t*2+f.ph)*.3;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fillStyle='#FFD166';ctx.globalAlpha=Math.max(0,a);ctx.shadowBlur=8;ctx.shadowColor='#FFD166';ctx.fill();ctx.shadowBlur=0;});ctx.globalAlpha=1;requestAnimationFrame(draw);})();
}
function initSmoke(){
  const cv=document.getElementById('smoke-canvas');if(!cv)return;const ctx=cv.getContext('2d');let w,h,smk=[];
  function rs(){w=cv.width=cv.parentElement.offsetWidth;h=cv.height=cv.parentElement.offsetHeight;}rs();addEventListener('resize',rs);
  for(let i=0;i<15;i++)smk.push({x:Math.random()*w,y:h+Math.random()*40,r:Math.random()*30+10,vx:(Math.random()-.5)*.3,vy:-(Math.random()*.3+.1),a:Math.random()*.04+.01});
  (function draw(){ctx.clearRect(0,0,w,h);smk.forEach(s=>{s.x+=s.vx;s.y+=s.vy;if(s.y<-50){s.y=h+20;s.x=Math.random()*w;}ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fillStyle='rgba(200,200,200,'+s.a+')';ctx.fill();});requestAnimationFrame(draw);})();
}

// ===== AUDIO =====
let audioCtx;
function getAC(){if(!audioCtx)audioCtx=new(AudioContext||webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx;}
function playTone(f,type='sine',dur=.5){try{const c=getAC(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(.06,c.currentTime);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+dur);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+dur);}catch(e){}}
function initAudio(){
  const btn=document.getElementById('audio-toggle');let on=false,iv;
  btn.addEventListener('click',()=>{getAC();if(on){clearInterval(iv);on=false;btn.textContent='🔇';}else{const notes=[261.63,261.63,293.66,261.63,349.23,329.63,261.63,261.63,293.66,261.63,392,349.23];let i=0;function p(){playTone(notes[i%notes.length],'sine',.4);i++;}p();iv=setInterval(p,450);on=true;btn.textContent='🔊';}});
}
function initKonamiCode(){
  const code=['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','KeyB','KeyA'];let pos=0;
  document.addEventListener('keydown',e=>{if(e.code===code[pos]){pos++;if(pos===code.length){pos=0;for(let i=0;i<20;i++){const p=document.createElement('div');p.textContent='🐷';p.style.cssText='position:fixed;font-size:45px;left:-60px;top:'+(100+Math.random()*(innerHeight-200))+'px;z-index:100000;pointer-events:none;';document.body.appendChild(p);gsap.to(p,{x:innerWidth+100,duration:3+Math.random()*2,delay:i*.15,ease:'none',onComplete:()=>p.remove()});}playTone(440,'sawtooth',.8);}}else pos=0;});
}
if('DeviceMotionEvent'in window){let ls=0;addEventListener('devicemotion',e=>{const a=e.accelerationIncludingGravity;if(!a)return;if(Math.abs(a.x)+Math.abs(a.y)+Math.abs(a.z)>36&&Date.now()-ls>1200){ls=Date.now();spawnConfetti(innerWidth/2,innerHeight/2,35);}});}
