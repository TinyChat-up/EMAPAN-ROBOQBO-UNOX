(()=>{
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],isUnox=document.body.dataset.brand==='unox',guide=q('.brasa-guide'),bubble=q('#guide-bubble'),mascot=q('.brasa-button'),setting=q('#guide-setting');
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));let muted=false,didPress=false;try{muted=sessionStorage.getItem('emapan-guide-muted')==='1';didPress=sessionStorage.getItem('emapan-guide-welcome')==='1'}catch{}
let frame=0,lastTime=0,x=4,y=innerHeight-54,vx=0,vy=0,size=24,route=[],obstacles=[],nextRoam=0,scrollStamp=0,trackFrame=0,activeCue=null,finale=false,finalPoint=null,pressUntil=0,side=1,hidden=false;
const path=guide.querySelector('.jelly-body>path'),hero=q(isUnox?'#oven-reveal':'#story-video'),heroButton=q(isUnox?'#replay-unox':'#play-film');
const baseSize=()=>innerWidth<=760?24:34;
function setBubble(open){bubble.hidden=!open;mascot.setAttribute('aria-expanded',String(open))}
function rememberPress(){didPress=true;try{sessionStorage.setItem('emapan-guide-welcome','1')}catch{}}
function visible(el){const r=el.getBoundingClientRect();return r.bottom>76&&r.top<innerHeight-10}
function finishCue(press=true){if(!activeCue)return;activeCue=null;rememberPress();route=[];nextRoam=performance.now()+2800;if(press&&visible(hero)&&hero.paused){hero.dataset.guideActivated='welcome';heroButton.dataset.guidePress='true';heroButton.classList.add('guide-pressed');heroButton.click();delete heroButton.dataset.guidePress;pressUntil=performance.now()+380;setTimeout(()=>heroButton.classList.remove('guide-pressed'),400)}}
function paintPreference(){setting.setAttribute('aria-pressed',String(!muted));setting.setAttribute('aria-label',muted?'Activar la mascota':'Ocultar la mascota');guide.hidden=muted;try{sessionStorage.setItem('emapan-guide-muted',muted?'1':'0')}catch{}if(muted){finishCue();setBubble(false)}else{track();wake()}}
setting.onclick=()=>{muted=!muted;paintPreference()};q('#guide-mute').onclick=()=>{muted=true;paintPreference()};mascot.tabIndex=-1;mascot.setAttribute('aria-hidden','true');setBubble(false);
function collect(){const h=innerHeight;obstacles=qa('video,img,h1,h2,h3,p,button,a,.clocks,.gain-strip,.secondary-metric,.finale-speech,.recipe-title,.model-kicker,.product-fact,.eyebrow,figcaption,.contact-dock,header').filter(el=>!guide.contains(el)&&!el.closest('dialog')&&!el.closest('[aria-hidden="true"]')&&el!==activeCue?.button).map(el=>{const r=el.getBoundingClientRect(),cs=getComputedStyle(el);return{el,l:r.left-5,r:r.right+5,t:r.top-5,b:r.bottom+5,w:r.width,h:r.height,visible:cs.visibility!=='hidden'&&Number(cs.opacity)>.1}}).filter(r=>r.visible&&r.w>0&&r.h>0&&r.b>0&&r.t<h)}
function clear(px,py,sz=baseSize()){return px>=2&&px+sz<=innerWidth-2&&py>=76&&py+sz<=innerHeight-8&&!obstacles.some(r=>px<r.r&&px+sz>r.l&&py<r.b&&py+sz>r.t)}
function segment(a,b){const steps=Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/9);for(let i=1;i<=steps;i++)if(!clear(a.x+(b.x-a.x)*i/steps,a.y+(b.y-a.y)*i/steps))return false;return true}
function plan(goal){
 const sz=baseSize(),step=22,cols=Math.max(2,Math.ceil((innerWidth-sz-6)/step)+1),rows=Math.max(2,Math.ceil((innerHeight-sz-90)/step)+1),dx=(innerWidth-sz-6)/(cols-1),dy=(innerHeight-sz-90)/(rows-1),nodes=[];
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const n={x:3+i*dx,y:78+j*dy,prev:-1,free:false};n.free=clear(n.x,n.y);nodes.push(n)}
 let start=-1,near=Infinity;nodes.forEach((n,i)=>{const d=Math.hypot(n.x-x,n.y-y);if(n.free&&d<near&&segment({x,y},n)){near=d;start=i}});if(start<0)return [];
 const queue=[start],seen=new Set([start]);let best=start,score=-Infinity;
 for(let k=0;k<queue.length;k++){const i=queue[k],n=nodes[i],value=goal?-Math.hypot(n.x-goal.x,n.y-goal.y):(side>0?n.x:innerWidth-n.x)*1.4+Math.min(180,Math.abs(n.y-y))-.18*Math.abs(n.y-(innerHeight*.35+(Math.sin(performance.now()/5000)+1)*innerHeight*.2));if(value>score){score=value;best=i}for(const v of [i-cols,i+cols,i%cols?i-1:-1,i%cols<cols-1?i+1:-1]){if(v<0||v>=nodes.length||seen.has(v)||!nodes[v].free||!segment(n,nodes[v]))continue;nodes[v].prev=i;seen.add(v);queue.push(v)}}
 const result=[];for(let i=best;i!==-1;i=nodes[i].prev)result.unshift({x:nodes[i].x,y:nodes[i].y});if(goal&&segment(result.at(-1),goal)&&clear(goal.x,goal.y))result.push(goal);return result.filter((p,i,a)=>i===0||i===a.length-1||Math.abs((p.x-a[i-1].x)*(a[i+1].y-p.y)-(p.y-a[i-1].y)*(a[i+1].x-p.x))>.1);
}
function track(){
 trackFrame=0;const h=innerHeight;document.body.classList.toggle('viewing-sat',!!q('.sat-intro')&&q('.sat-intro').getBoundingClientRect().bottom>84);document.body.classList.toggle('past-intro',scrollY>h*.55);const cr=q('#contacto').getBoundingClientRect();document.body.classList.toggle('at-contact',cr.top<h*.85);
 const ps=qa('.product-story').some(el=>{const r=el.getBoundingClientRect();return r.top<h*.65&&r.bottom>h*.35});document.body.classList.toggle('in-product',ps);const tr=q('.time-journey')?.getBoundingClientRect();document.body.classList.toggle('in-times',!!tr&&tr.top<h*.7&&tr.bottom>h*.3);
 const sr=q('.finale-mascot-slot')?.getBoundingClientRect();const was=finale;finale=!!sr&&sr.top>=80&&sr.bottom<h-20;finalPoint=finale?{x:sr.left,y:sr.top}:null;guide.classList.toggle('is-finale',finale);collect();route=[];nextRoam=0;
 if(activeCue&&(!visible(hero)||performance.now()-activeCue.since>2500))finishCue(visible(hero));
 // On scroll, fade out only if content moves into the guide's safe lane.
 hidden=!clear(x,y,Math.min(size,baseSize()));if(hidden&&!finale){const candidates=[{x:3,y:clamp(y,80,h-baseSize()-12)},{x:innerWidth-baseSize()-3,y:clamp(y,80,h-baseSize()-12)}];const safe=candidates.find(p=>clear(p.x,p.y));if(safe){x=safe.x;y=safe.y;vx=vy=0;hidden=false}}
 if(was&&!finale)size=baseSize();guide.style.opacity=hidden?'0':'1';wake();
}
function scheduleTrack(){scrollStamp=performance.now();if(!trackFrame)trackFrame=requestAnimationFrame(track)}
function morph(now){const speed=Math.min(1,(Math.abs(vx)+Math.abs(vy))/8),t=now*.002,pts=[];for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=42+(Math.sin(t+i*1.7)*2.6+Math.sin(t*.7-i)*2.1)*(1+speed);pts.push([50+Math.cos(a)*rr,52+Math.sin(a)*rr])}let d='M'+((pts[7][0]+pts[0][0])/2)+','+((pts[7][1]+pts[0][1])/2);pts.forEach((p,i)=>{const n=pts[(i+1)%8];d+=' Q'+p[0]+','+p[1]+' '+((p[0]+n[0])/2)+','+((p[1]+n[1])/2)});path.setAttribute('d',d+'Z');const press=now<pressUntil?.25:0,dance=route.length?0:Math.sin(now*.003)*.035;guide.style.setProperty('--jelly-x',1+Math.min(.42,Math.abs(vx)*.08)+press+dance);guide.style.setProperty('--jelly-y',1+Math.min(.4,Math.abs(vy)*.08)-press-dance);guide.style.setProperty('--jelly-turn',clamp(vx*5+Math.sin(now*.002)*4,-22,22)+'deg')}
function animate(now){
 frame=0;if(muted||document.hidden)return;const dt=clamp((now-lastTime)/16.67,.1,2);lastTime=now;if(q('#demo-dialog')?.open){frame=requestAnimationFrame(animate);return}
 let goal=finalPoint;if(activeCue){const r=heroButton.getBoundingClientRect();goal={x:r.left-baseSize()+8,y:r.top+(r.height-baseSize())/2};if(now-activeCue.since>2500||!visible(hero)){finishCue(visible(hero));goal=finalPoint}}
 if(reduced.matches){route=[];if(finale){x=goal.x;y=goal.y;size=innerWidth<=760?76:112}guide.style.opacity=finale?'1':'0'}else{
 if(now>nextRoam&&!route.length&&now-scrollStamp>180){collect();route=plan(goal);nextRoam=now+(goal?700:6500);side*=-1}
 const point=route[0];if(point){const dist=Math.hypot(point.x-x,point.y-y),speed=activeCue?12:finale?14:1.8;if(dist<2){route.shift();vx=vy=0}else{const move=Math.min(dist,speed*dt),nx=x+(point.x-x)/dist*move,ny=y+(point.y-y)/dist*move;if(clear(nx,ny)){vx=(nx-x)/dt;vy=(ny-y)/dt;x=nx;y=ny;hidden=false}else{route=[];nextRoam=now+800;vx=vy=0}}}else{vx*=.8;vy*=.8}
 if(activeCue&&goal&&Math.hypot(x-goal.x,y-goal.y)<5)finishCue();const arrived=finale&&Math.hypot(x-finalPoint.x,y-finalPoint.y)<5;if(arrived){x=finalPoint.x;y=finalPoint.y;route=[];nextRoam=Infinity}guide.dataset.docked=String(arrived);const targetSize=arrived?(innerWidth<=760?76:112):baseSize();size+=(targetSize-size)*.1*dt;guide.style.opacity=hidden?'0':'1';morph(now)
 }
 guide.dataset.routeLength=String(route.length);guide.dataset.motionPhase=activeCue?'welcome':finale?'finale':route.length?'exploring':'dancing';guide.style.setProperty('--guide-size',size+'px');guide.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;if(!reduced.matches)frame=requestAnimationFrame(animate);
}
function wake(){if(!frame&&!muted&&!document.hidden){lastTime=performance.now();frame=requestAnimationFrame(animate)}}
function welcome(){if(didPress||muted||reduced.matches||activeCue||!hero||!visible(hero)||scrollY>innerHeight*.5)return;hero.pause();activeCue={button:heroButton,since:performance.now()};if(isUnox)heroButton.textContent='Reproducir';collect();route=[];nextRoam=0;wake()}
hero?.addEventListener('play',welcome);heroButton?.addEventListener('click',e=>{if(e.isTrusted){rememberPress();activeCue=null;route=[]}},true);
addEventListener('scroll',scheduleTrack,{passive:true});addEventListener('resize',track);reduced.addEventListener('change',()=>{finishCue(false);track()});document.addEventListener('visibilitychange',()=>{if(document.hidden){if(activeCue){activeCue=null;route=[]}}else{track();wake()}});paintPreference();track();if(hero&&!hero.paused)welcome();
// The visitor prepares the message here and confirms its delivery in WhatsApp.
const dialog=q('#demo-dialog'),interest=q('#interest'),name=q('#contact-name'),idea=q('#contact-idea'),send=q('#send-message');let trigger=null,playing=[];
function compose(){const who=name.value.trim(),recipe=idea.value.trim();const message=(who?'Hola, soy '+who+'. ':'Hola. ')+(isUnox?'Me interesan los hornos UNOX. ':'Me gustaría una prueba gratis y sin compromiso con un chef profesional y la máquina Roboqbo. ')+'Equipo: '+interest.value+'.'+(recipe?' Mi receta o idea: '+recipe:'');send.href='https://wa.me/34615619104?text='+encodeURIComponent(message)}
qa('[data-demo]').forEach(b=>b.onclick=()=>{trigger=b;q('#contact-form').reset();interest.value=b.dataset.demo;compose();setBubble(false);playing=qa('video').filter(v=>!v.paused);playing.forEach(v=>v.pause());dialog.showModal();lenis?.stop()});
q('.close').onclick=()=>dialog.close();dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});dialog.addEventListener('close',()=>{lenis?.start();if(!reduced.matches&&!document.hidden)playing.forEach(v=>{const r=v.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)v.play().catch(()=>{})});q('#contact-form').reset();trigger?.focus({preventScroll:true})});dialog.setAttribute('data-lenis-prevent','');name.addEventListener('input',compose);idea.addEventListener('input',compose);q('#contact-form').onsubmit=e=>{e.preventDefault();send.click()};
})();

/* Brasa demonstrates scrolling; real input always takes over immediately. */
(() => {
  const guide = document.querySelector('.brasa-guide');
  const setting = document.querySelector('#guide-setting');
  // The service entrance already has an explicit next step; keep it still and clear.
  if (!guide || !setting || document.querySelector('.sat-intro')) return;
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const key = 'emapan-scroll-understood-v1';
  let understood = false;
  try { understood = sessionStorage.getItem(key) === '1'; } catch {}
  if (understood || location.hash || scrollY > 24) return;

  let hint = null, frame = 0, timer = 0, began = 0;
  let origin = scrollY, requested = scrollY, finished = false, demonstrating = false;
  let userIntent = false, fromTouch = null;
  const clamp = n => Math.max(0, Math.min(1, n));
  const ease = n => (1 - Math.cos(Math.PI * clamp(n))) / 2;
  function remember() {
    try { sessionStorage.setItem(key, '1'); } catch {}
  }
  function end(learned = false) {
    if (learned) remember();
    finished = true;
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    document.body.classList.remove('scroll-onboarding');
    if (hint) { hint.remove(); hint = null; }
    demonstrating = false;
    ['--tutor-x', '--tutor-y', '--tutor-stretch'].forEach(p => guide.style.removeProperty(p));
    removeEventListener('wheel', wheel);
    removeEventListener('touchstart', touchStart);
    removeEventListener('touchmove', touchMove);
    removeEventListener('pointerdown', pointer);
    removeEventListener('keydown', keyboard);
    if (learned) removeEventListener('scroll', scrolled);
    removeEventListener('resize', resized);
    document.removeEventListener('visibilitychange', visibility);
    motion.removeEventListener('change', preference);
    setting.removeEventListener('click', preference);
  }
  function scrollToY(y) {
    requested = y;
    if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: 'instant' });
  }
  function advance() {
    end(true);
    if (document.body.dataset.brand === 'unox') document.querySelector('#skip-unox')?.click();
    else {
      const next = document.querySelector('#qbo-proceso') || document.querySelector('#equipos');
      if (!next) return;
      const top = scrollY + next.getBoundingClientRect().top - 84;
      if (typeof lenis !== 'undefined' && lenis) lenis.scrollTo(top, { duration: .9 });
      else window.scrollTo({ top, behavior: motion.matches ? 'instant' : 'smooth' });
    }
  }
  function tick(now) {
    if (finished || !hint) return;
    if (document.hidden || document.querySelector('dialog[open]') || guide.hidden) { end(); return; }
    const elapsed = now - began;
    const cycle = Math.floor(elapsed / 2600);
    if (cycle >= 2) { end(); return; }
    const t = (elapsed % 2600) / 2600;
    const pull = ease((t - .22) / .43);
    const release = ease((t - .78) / .18);
    const rise = pull * (1 - release);
    const box = hint.getBoundingClientRect();
    const px = box.left + box.width / 2 - 29;
    const py = box.top + 120 - rise * 92;
    guide.style.setProperty('--tutor-x', px + 'px');
    guide.style.setProperty('--tutor-y', py + 'px');
    guide.style.setProperty('--tutor-stretch', String(1 + Math.sin(pull * Math.PI) * .16));
    hint.style.setProperty('--pull', rise);
    hint.style.setProperty('--press', String(t > .13 && t < .78 ? 1 : 0));
    hint.dataset.phase = t < .22 ? 'touch' : t < .78 ? 'swipe' : 'reset';
    // A bounded preview, never a reset or an automatic jump to another section.
    scrollToY(Math.round(origin + cycle * 56 + pull * 56));
    frame = requestAnimationFrame(tick);
  }
  function start() {
    if (finished || scrollY > 24 || document.hidden || guide.hidden || setting.getAttribute('aria-pressed') !== 'true' || document.querySelector('dialog[open]')) { end(); return; }
    hint = document.createElement('button');
    hint.className = 'scroll-tutor';
    hint.type = 'button';
    hint.setAttribute('aria-label', 'Continuar hacia abajo');
    hint.innerHTML = `<span class="tutor-track" aria-hidden="true"><i></i><i></i><i></i></span>
      <span class="tutor-halo" aria-hidden="true"></span>
      <svg class="tutor-hand" viewBox="0 0 48 56" fill="none" aria-hidden="true"><path d="M18 29V8a4 4 0 0 1 8 0v15l3-1a4 4 0 0 1 5 3l2-1a4 4 0 0 1 5 4v10c0 9-6 14-14 14-5 0-9-2-12-6L6 34a4 4 0 0 1 6-5l6 6" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" fill="#111b18"/></svg>
      <svg class="tutor-mouse" viewBox="0 0 28 44" fill="none" aria-hidden="true"><rect x="2" y="2" width="24" height="40" rx="12" stroke="currentColor" stroke-width="1.5"/><path class="tutor-wheel" d="M14 10v7" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
      <svg class="tutor-next" viewBox="0 0 32 30" fill="none" aria-hidden="true"><path d="m6 8 10 10L26 8M9 19l7 7 7-7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    hint.addEventListener('click', advance);
    document.body.append(hint);
    origin = requested = scrollY;
    if (motion.matches || innerHeight < 500) {
      hint.classList.add('is-still');
      timer = setTimeout(() => end(), 8000);
      return;
    }
    demonstrating = true;
    document.body.classList.add('scroll-onboarding');
    began = performance.now();
    frame = requestAnimationFrame(tick);
  }
  function scrolled() {
    if (finished) {
      if (Math.abs(scrollY - requested) > 24) { remember(); removeEventListener('scroll', scrolled); }
      return;
    }
    if (demonstrating && !userIntent) return;
    if (scrollY > 24 || Math.abs(scrollY - origin) > 24) end(true);
  }
  function wheel(e) { if (e.ctrlKey || Math.abs(e.deltaY) < 2) return; userIntent = true; end(true); }
  function touchStart(e) { fromTouch = e.touches[0]?.clientY; }
  function touchMove(e) { if (fromTouch !== null && Math.abs((e.touches[0]?.clientY ?? fromTouch) - fromTouch) > 8) { userIntent = true; end(true); } }
  function pointer(e) {
    if (hint?.contains(e.target)) return;
    if (e.pointerType === 'touch' && !e.target.closest('a,button,input,textarea,select,summary')) return;
    end();
  }
  function keyboard(e) {
    if (e.target.closest('input,textarea,select,[contenteditable="true"]')) return;
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home'].includes(e.key)) { userIntent = true; end(true); }
    else if (e.key === 'Escape') end();
  }
  function resized() { end(); }
  function visibility() { if (document.hidden) end(); }
  function preference() { end(); }
  addEventListener('wheel', wheel, { passive: true });
  addEventListener('touchstart', touchStart, { passive: true });
  addEventListener('touchmove', touchMove, { passive: true });
  addEventListener('pointerdown', pointer, { passive: true });
  addEventListener('keydown', keyboard);
  addEventListener('scroll', scrolled, { passive: true });
  addEventListener('resize', resized, { passive: true });
  document.addEventListener('visibilitychange', visibility);
  motion.addEventListener('change', preference);
  setting.addEventListener('click', preference);
  timer = setTimeout(start, 4200);
})();
