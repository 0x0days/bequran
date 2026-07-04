/* Quranic Numerics - Theme Engine
   Handles: preference storage, toggle sync, system-pref listener.
   The no-flash init runs inline in <head> on each page.
   Load this file: <script src="theme.js"></script> before </body>
*/
(function () {
  'use strict';

  var KEY = 'qn_theme';

  function getStored()       { return localStorage.getItem(KEY) || 'system'; }
  function isSystemDark()    { return window.matchMedia('(prefers-color-scheme: dark)').matches; }
  function resolve(pref)     { return pref === 'system' ? (isSystemDark() ? 'dark' : 'light') : pref; }

  function applyResolved(res, animate) {
    var html = document.documentElement;
    if (!animate) {
      html.setAttribute('data-theme', res);
      return;
    }
    /* View Transitions API - radial reveal from stored click coords */
    if (document.startViewTransition) {
      document.startViewTransition(function () {
        html.setAttribute('data-theme', res);
      });
    } else {
      /* Fallback: class-based cross-fade */
      html.classList.add('theme-fx');
      html.setAttribute('data-theme', res);
      setTimeout(function () { html.classList.remove('theme-fx'); }, 420);
    }
  }

  function syncButtons(pref) {
    document.querySelectorAll('.tt-btn[data-theme-val]').forEach(function (btn) {
      btn.classList.toggle('active', btn.dataset.themeVal === pref);
    });
  }

  function setTheme(pref) {
    localStorage.setItem(KEY, pref);
    applyResolved(resolve(pref), true);
    syncButtons(pref);
  }

  /* React to OS-level dark/light changes when user chose "System" */
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function () {
    if (getStored() === 'system') applyResolved(resolve('system'), true);
  });

  document.addEventListener('DOMContentLoaded', function () {
    syncButtons(getStored());

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('.tt-btn[data-theme-val]');
      if (!btn) return;

      /* Store click coords for the radial View Transition origin */
      var r = btn.getBoundingClientRect();
      document.documentElement.style.setProperty('--vt-x', (r.left + r.width  / 2) + 'px');
      document.documentElement.style.setProperty('--vt-y', (r.top  + r.height / 2) + 'px');

      setTheme(btn.dataset.themeVal);
    });
  });
}());

/* ═══════════════════════════════════════════════════════════════
   UNIVERSAL MOTION LAYER - cursor, magnetic, spotlight, scroll bar.
   Applies to every lesson page. Skips index.html (body.page-index),
   which ships its own inline motion, to avoid double-initialisation.
═══════════════════════════════════════════════════════════════ */
(function () {
  if (document.body && document.body.classList.contains('page-index')) return;

  var fine   = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* scroll progress (inert on non-scrolling pages) */
  var sp = document.createElement('div');
  sp.className = 'qn-scrollprog';
  document.body.appendChild(sp);
  window.addEventListener('scroll', function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    sp.style.width = h > 40 ? (window.scrollY / h * 100) + '%' : '0';
  }, { passive: true });

  /* spotlight: feed --mx/--my to hovered interactive surfaces */
  document.addEventListener('pointermove', function (e) {
    var t = e.target.closest('.answer-card,.predict-choice,.cs-btn,.fb-panel');
    if (!t) return;
    var r = t.getBoundingClientRect();
    t.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    t.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  if (!fine || reduce) return;

  /* magnetic - primary action buttons drift toward the cursor */
  function magnet(el, str) {
    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var x = e.clientX - (r.left + r.width / 2);
      var y = e.clientY - (r.top + r.height / 2);
      el.style.transition = 'transform .1s linear';
      el.style.transform = 'translate(' + (x * str).toFixed(1) + 'px,' + (y * str).toFixed(1) + 'px)';
    });
    el.addEventListener('pointerleave', function () {
      el.style.transition = 'transform .4s cubic-bezier(.16,1,.3,1)';
      el.style.transform = '';
    });
  }
  document.querySelectorAll('.fb-btn,.predict-submit,.pr-continue,.calc-btn,.nav-back,[data-magnetic]')
    .forEach(function (el) { magnet(el, 0.22); });

  /* custom magnetic cursor */
  var dot = document.createElement('div');  dot.className = 'qn-cur-dot';
  var ring = document.createElement('div'); ring.className = 'qn-cur-ring';
  document.body.appendChild(dot); document.body.appendChild(ring);
  document.body.classList.add('qn-has-cursor');
  var rx = 0, ry = 0, tx = 0, ty = 0;
  document.addEventListener('pointermove', function (e) {
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = 'translate(' + tx + 'px,' + ty + 'px) translate(-50%,-50%)';
    ring.classList.toggle('hot', !!e.target.closest('a,button,.answer-card,.predict-choice,.cs-btn,[data-magnetic]'));
  }, { passive: true });
  (function loop() {
    rx += (tx - rx) * 0.18; ry += (ty - ry) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  })();
}());

/* ═══════════════════════════════════════════════════════════════
   MOBILE FEEDBACK PANEL - never cover content.
   The fb-panel is position:fixed at the bottom; on small screens it
   can hide the result the student just revealed. On mobile we relocate
   it into the active stage (so it flows BELOW the content) while shown,
   then restore it. Desktop keeps the fixed panel (content has clearance).
═══════════════════════════════════════════════════════════════ */
(function () {
  var panel = document.getElementById('fbPanel');
  if (!panel) return;
  var home = panel.parentNode;
  var MOBILE = function () { return window.innerWidth <= 900; };

  function relocate() {
    if (!MOBILE()) return;
    var stage = document.querySelector('.stage.active') || document.querySelector('#s2,#s1,#s3,#s4');
    if (stage && panel.parentNode !== stage) stage.appendChild(panel);
    [['position','relative'],['transform','none'],['left','auto'],['right','auto'],
     ['bottom','auto'],['width','100%'],['margin','20px 0 0'],['border-radius','14px']
    ].forEach(function (p) { panel.style.setProperty(p[0], p[1], 'important'); });
    requestAnimationFrame(function () {
      try { panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } catch (e) {}
    });
  }
  function restore() {
    if (panel.parentNode !== home) home.appendChild(panel);
    panel.style.cssText = '';
  }

  new MutationObserver(function () {
    if (panel.classList.contains('show')) relocate();
    else restore();
  }).observe(panel, { attributes: true, attributeFilter: ['class'] });
}());

/* ═══════════════════════════════════════════════════════════════
   REWARD ENGINE - cinematic verdict peak + variable reward + SFX/haptics.
   Lesson pages only (gated on #fbPanel). DOM-hooked, so it works on
   every page regardless of that page's own JS. Zero per-page edits.
   Tune here → all 53 pages update.
═══════════════════════════════════════════════════════════════ */
(function () {
  var fbPanel = document.getElementById('fbPanel');
  if (!fbPanel) return;                         /* lesson pages only */
  if (window.__qnReward) return; window.__qnReward = 1;

  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var accent = (getComputedStyle(document.body).getPropertyValue('--accent') || '').trim() || '#f59e0b';
  var lastPt = { x: window.innerWidth / 2, y: window.innerHeight * 0.45 };
  document.addEventListener('pointerdown', function (e) { lastPt = { x: e.clientX, y: e.clientY }; }, { passive: true });

  /* ── SOUND (Web Audio, no assets) ── */
  var AC = null, muted = localStorage.getItem('qn_mute') === '1';
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } 
    if (AC && AC.state === 'suspended') { AC.resume(); } return AC; }
  function tone(freq, delay, dur, type, gain) {
    var a = ac(); if (!a || muted) return;
    var o = a.createOscillator(), g = a.createGain();
    o.type = type || 'sine'; o.frequency.value = freq; o.connect(g); g.connect(a.destination);
    var n = a.currentTime + delay;
    g.gain.setValueAtTime(0.0001, n);
    g.gain.exponentialRampToValueAtTime(gain || 0.16, n + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, n + dur);
    o.start(n); o.stop(n + dur + 0.02);
  }
  function sCorrect() { tone(523.25,0,.16,'sine',.15); tone(659.25,.05,.18,'sine',.13); tone(783.99,.10,.30,'sine',.12); }
  function sWrong()   { tone(207.65,0,.18,'sine',.13); tone(155.56,.06,.24,'triangle',.11); }
  function sTick()    { tone(840,0,.035,'square',.04); }
  function sFanfare(tier){
    [523.25,659.25,783.99,1046.5].forEach(function(f,i){ tone(f, i*.09, .42,'triangle',.13); });
    if (tier>=2) tone(1318.5,.34,.5,'sine',.12);
    if (tier>=3){ tone(1567.98,.43,.6,'sine',.11); tone(2093,.52,.6,'sine',.08); }
  }
  function vibe(p){ if (navigator.vibrate && !reduce) { try { navigator.vibrate(p); } catch (e) {} } }

  /* ── PARTICLE BURST ── */
  var fx, fctx, parts = [], raf = null, FW, FH, dpr;
  function ensureFx(){
    if (fx) return;
    fx = document.createElement('canvas'); fx.className = 'qn-fx';
    fx.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:9500;';
    document.body.appendChild(fx); fctx = fx.getContext('2d'); sizeFx();
    window.addEventListener('resize', sizeFx);
  }
  function sizeFx(){ if (!fx) return; dpr = Math.min(window.devicePixelRatio||1,2);
    FW = window.innerWidth; FH = window.innerHeight; fx.width = FW*dpr; fx.height = FH*dpr; fctx.setTransform(dpr,0,0,dpr,0,0); }
  function burst(x,y,n){
    if (reduce) return; ensureFx();
    var cols = [accent, '#fcd34d', '#f59e0b', '#ffffff'];
    for (var i=0;i<n;i++){ var a=Math.random()*6.283, sp=2+Math.random()*7;
      parts.push({x:x,y:y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp-2,life:1,
        sz:1.5+Math.random()*3, c:cols[i%cols.length], rot:Math.random()*6.28}); }
    if (!raf) raf = requestAnimationFrame(stepFx);
  }
  function stepFx(){
    fctx.clearRect(0,0,FW,FH); var alive=0;
    for (var i=0;i<parts.length;i++){ var p=parts[i]; if (p.life<=0) continue; alive++;
      p.vy+=0.16; p.vx*=0.985; p.x+=p.vx; p.y+=p.vy; p.life-=0.018;
      fctx.globalAlpha=Math.max(0,p.life); fctx.fillStyle=p.c;
      fctx.beginPath(); fctx.arc(p.x,p.y,Math.max(0,p.sz*p.life),0,6.283); fctx.fill(); }
    fctx.globalAlpha=1;
    if (alive>0) raf=requestAnimationFrame(stepFx); else { raf=null; parts=[]; fctx.clearRect(0,0,FW,FH); }
  }

  /* ── WARM FLASH (verdict) ── */
  function warmFlash(){
    if (reduce) return;
    var d=document.createElement('div');
    d.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9400;opacity:0;'+
      'background:radial-gradient(ellipse at 50% 42%,'+accent+'33,transparent 60%);'+
      'transition:opacity .4s ease;';
    document.body.appendChild(d);
    requestAnimationFrame(function(){ d.style.opacity='1';
      setTimeout(function(){ d.style.opacity='0'; setTimeout(function(){ d.remove(); }, 500); }, 380); });
  }

  /* ── VARIABLE REWARD (idempotent per lesson) ── */
  function rollReward(){
    var key='qn_b_'+location.pathname.replace(/[^a-z0-9]/gi,'').slice(-32);
    var already=localStorage.getItem(key);
    var r=Math.random(), tier=r<0.68?1:r<0.92?2:3, bonus=0, label='Lesson complete';
    if (tier===2){ label='✦ Critical insight'; bonus=15; }
    if (tier===3){ label='⚡ Rare discovery';  bonus=30; }
    if (bonus && !already){
      try { localStorage.setItem('qn_xp', String((parseInt(localStorage.getItem('qn_xp')||'0',10))+bonus));
        localStorage.setItem(key,'1'); } catch(e){}
    } else if (already){ bonus=0; }
    return { tier:tier, bonus:bonus, label:label };
  }
  function showChip(anchor, text){
    var c=document.createElement('div');
    c.textContent=text;
    c.style.cssText='display:inline-block;margin-top:10px;padding:7px 15px;border-radius:100px;'+
      'font:700 12px/1 "DM Sans",sans-serif;letter-spacing:.04em;color:#1a0c00;'+
      'background:linear-gradient(135deg,#fcd34d,'+accent+');box-shadow:0 6px 22px '+accent+'66;'+
      'opacity:0;transform:translateY(8px) scale(.9);transition:opacity .4s,transform .5s cubic-bezier(.16,1,.3,1);';
    if (anchor && anchor.parentNode) anchor.parentNode.insertBefore(c, anchor.nextSibling);
    requestAnimationFrame(function(){ c.style.opacity='1'; c.style.transform='none'; });
  }

  /* ── REAL DAILY STREAK (bumps once per day on any completion) ── */
  function bumpStreak(){
    try {
      var today = new Date().toDateString();
      var last  = localStorage.getItem('qn_last');
      if (last === today) return;
      var s = parseInt(localStorage.getItem('qn_streak') || '0', 10);
      var y = new Date(); y.setDate(y.getDate() - 1);
      s = (last === y.toDateString()) ? s + 1 : 1;
      localStorage.setItem('qn_streak', String(s));
      localStorage.setItem('qn_last', today);
    } catch (e) {}
  }

  /* ── EVENT HOOKS ── */
  /* selection tick */
  document.addEventListener('pointerdown', function(e){
    if (e.target.closest('.answer-card,.predict-choice,.predict-submit,.fb-btn,.cs-btn,.pd-card,.pd-mag-item,.predict-slider')) sTick();
  }, { passive:true });

  /* wrong answer */
  document.addEventListener('click', function(e){
    var card=e.target.closest('.answer-card'); if (!card) return;
    requestAnimationFrame(function(){ if (card.classList.contains('ac-wrong')){ sWrong(); vibe([0,28,22,28]); } });
  });

  /* correct answer (any fb-ok show) */
  var fbWas=false;
  new MutationObserver(function(){
    var on=fbPanel.classList.contains('show')&&fbPanel.classList.contains('fb-ok');
    if (on && !fbWas){
      sCorrect(); vibe([12]);
      burst(lastPt.x, lastPt.y, 24);              /* from where they tapped */
      /* second burst from the panel itself - guarantees it reads on every
         page even if the tap point was off-screen or scrolled away */
      try { var r=fbPanel.getBoundingClientRect();
        if (r.width) burst(r.left+r.width/2, Math.max(r.top+8, 48), 16); } catch(e){}
    }
    fbWas=on;
  }).observe(fbPanel,{attributes:true,attributeFilter:['class']});

  /* verdict peak */
  var xb=document.getElementById('xpBadge'), peaked=false;
  if (xb){
    new MutationObserver(function(){
      if (xb.classList.contains('show') && !peaked){ peaked=true;
        bumpStreak();
        var rw=rollReward();
        sFanfare(rw.tier);
        vibe(rw.tier>=3?[14,40,14,40,20]:rw.tier>=2?[12,34,16]:[16]);
        warmFlash();
        var r=xb.getBoundingClientRect();
        burst(r.left+r.width/2, r.top+r.height/2, 22+rw.tier*16);
        if (rw.bonus) showChip(xb, rw.label+'  +'+rw.bonus+' XP');
      }
    }).observe(xb,{attributes:true,attributeFilter:['class']});
  }

  /* ── MUTE TOGGLE (tiny, bottom-left) ── */
  var mt=document.createElement('button');
  mt.setAttribute('aria-label','Toggle sound');
  mt.style.cssText='position:fixed;bottom:14px;left:14px;z-index:90;width:34px;height:34px;'+
    'border-radius:50%;border:1px solid var(--border,rgba(255,255,255,.12));cursor:pointer;'+
    'background:var(--surface,#111e2e);color:var(--muted,#7a8fa3);display:flex;align-items:center;'+
    'justify-content:center;backdrop-filter:blur(8px);transition:color .2s,transform .15s;';
  function mIcon(){ mt.innerHTML = muted
    ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>'
    : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>'; }
  mIcon();
  mt.addEventListener('click', function(){ muted=!muted; localStorage.setItem('qn_mute', muted?'1':'0'); mIcon();
    if(!muted) sCorrect(); });
  document.body.appendChild(mt);
}());

/* ═══════════════════════════════════════════════════════════════
   VERDICT → CONSTELLATION TIE-IN - peak-end moment.
   When the verdict (xpBadge) appears, inject a consistent "your map
   grew" panel into S4 that ties this lesson to the index Constellation.
   DOM-hooked, lesson-pages only, zero per-page edits.
═══════════════════════════════════════════════════════════════ */
(function () {
  var s4 = document.getElementById('s4'), xb = document.getElementById('xpBadge');
  if (!s4 || !xb) return;
  var TOTAL = 53, injected = false, modal = null;

  function accent(){ return (getComputedStyle(document.body).getPropertyValue('--accent')||'').trim() || '#f59e0b'; }
  function hexA(h,a){ h=(h||'#f59e0b').replace('#',''); if(h.length===3) h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    var n=parseInt(h,16); return 'rgba('+((n>>16)&255)+','+((n>>8)&255)+','+(n&255)+','+a+')'; }
  function gather(){
    var info = (window.Prediction && Prediction.shareInfo) ? Prediction.shareInfo() : null;
    var done; try { done = new Set(JSON.parse(localStorage.getItem('qn_done')||'[]')); } catch(e){ done=new Set(); }
    var topic = (document.title||'').split('·')[0].replace(/[—–-]\s*$/,'').trim();
    var ar='', arEl=document.querySelector('.iv-ar,.verse-ar,.hero-verse,.intro-verse .iv-ar,[class*="-ar"]');
    if(arEl){ ar=(arEl.textContent||'').replace(/\s+/g,' ').trim(); if(ar.length>72) ar=''; }
    return { topic:topic||'A Discovery', answer:info?info.answer:'', claim:info?info.question:'',
      arabic:ar, n:Math.max(1,Math.min(TOTAL,done.size)), accent:accent() };
  }
  function fitFont(x,t,wt,fam,maxPx,maxW){ var px=maxPx; while(px>30){ x.font=wt+' '+px+'px '+fam; if(x.measureText(t).width<=maxW) break; px-=4; } return px; }
  function wrap(x,text,cx,y,maxW,lh,maxLines){
    var words=(text||'').split(' '),line='',lines=[];
    for(var i=0;i<words.length;i++){ var t=line?line+' '+words[i]:words[i];
      if(x.measureText(t).width>maxW && line){ lines.push(line); line=words[i]; } else line=t; }
    if(line) lines.push(line); lines=lines.slice(0,maxLines||99);
    for(var j=0;j<lines.length;j++) x.fillText(lines[j],cx,y+j*lh);
    return y+lines.length*lh;
  }
  function rrect(x,a,b,w,h,r){ x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath(); }
  function renderCard(d){
    var W=1080,H=1350,c=document.createElement('canvas'); c.width=W;c.height=H; var x=c.getContext('2d'), acc=d.accent;
    var g=x.createLinearGradient(0,0,0,H); g.addColorStop(0,'#0c1828'); g.addColorStop(1,'#05080f'); x.fillStyle=g; x.fillRect(0,0,W,H);
    var rg=x.createRadialGradient(W/2,H*0.33,0,W/2,H*0.33,W*0.78); rg.addColorStop(0,hexA(acc,0.20)); rg.addColorStop(1,'rgba(0,0,0,0)'); x.fillStyle=rg; x.fillRect(0,0,W,H);
    var s=99; function rnd(){ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }
    for(var i=0;i<70;i++){ x.globalAlpha=0.18+rnd()*0.5; x.fillStyle='#cfe0ff'; x.beginPath(); x.arc(rnd()*W,rnd()*H,rnd()*2+0.5,0,6.283); x.fill(); }
    x.globalAlpha=1; x.strokeStyle=hexA(acc,0.45); x.lineWidth=2; rrect(x,44,44,W-88,H-88,30); x.stroke();
    x.textAlign='center'; x.direction='ltr';
    x.fillStyle=acc; x.font='700 30px "DM Sans",sans-serif'; x.fillText('✦  QURANIC NUMERICS', W/2, 132);
    x.fillStyle='#9fb0c2'; x.font='600 32px "DM Sans",sans-serif'; wrap(x,(d.topic||'').toUpperCase(),W/2,254,W-220,42,2);
    var ans=d.answer||''; var px=fitFont(x,ans,'700','"Playfair Display",serif',170,W-200);
    x.fillStyle=acc; x.font='700 '+px+'px "Playfair Display",serif'; x.shadowColor=hexA(acc,0.6); x.shadowBlur=44; x.fillText(ans,W/2,560); x.shadowBlur=0;
    x.fillStyle='#cdd6e0'; x.font='400 33px "DM Sans",sans-serif'; var yend=wrap(x,d.claim,W/2,690,W-200,48,4);
    if(d.arabic){ var apx=fitFont(x,d.arabic,'700','"Amiri",serif',62,W-240); x.fillStyle=hexA(acc,0.95);
      x.font='700 '+apx+'px "Amiri",serif'; x.direction='rtl'; x.fillText(d.arabic,W/2,Math.max(yend+96,1000)); x.direction='ltr'; }
    x.strokeStyle=hexA(acc,0.3); x.lineWidth=1; x.beginPath(); x.moveTo(W/2-120,H-156); x.lineTo(W/2+120,H-156); x.stroke();
    x.fillStyle='#7a8fa3'; x.font='500 26px "DM Sans",sans-serif'; x.fillText('Discovery '+d.n+' of '+TOTAL+'  ·  learn it yourself - BeQuran', W/2, H-104);
    return c;
  }
  function closeModal(){ if(modal) modal.classList.remove('show'); }
  function onKey(e){ if(e.key==='Escape') closeModal(); }
  function openShare(){
    var d=gather();
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function(){
      var canvas=renderCard(d);
      if(!modal){ modal=document.createElement('div'); modal.className='qn-share-modal'; modal.setAttribute('role','dialog'); modal.setAttribute('aria-label','Share this discovery'); document.body.appendChild(modal); }
      modal.style.setProperty('--accent', d.accent);
      modal.innerHTML='<div class="qsm-back"></div><div class="qsm-panel">'+
        '<img class="qsm-img" alt="Your discovery card" src="'+canvas.toDataURL('image/png')+'">'+
        '<div class="qsm-actions">'+
          '<button class="qsm-btn qsm-primary" data-act="share">Share</button>'+
          '<button class="qsm-btn" data-act="save">Save image</button>'+
          '<button class="qsm-btn qsm-ghost" data-act="close">Close</button>'+
        '</div></div>';
      function save(blob){ function dl(b){ var u=URL.createObjectURL(b),a=document.createElement('a'); a.href=u; a.download='bequran-discovery.png'; a.click(); setTimeout(function(){URL.revokeObjectURL(u);},1500); } blob?dl(blob):canvas.toBlob(dl); }
      modal.querySelector('.qsm-actions').onclick=function(e){
        var act=e.target.getAttribute('data-act'); if(!act) return;
        if(act==='close'){ closeModal(); return; }
        if(act==='save'){ save(); return; }
        canvas.toBlob(function(blob){
          var file=new File([blob],'bequran-discovery.png',{type:'image/png'});
          if(navigator.canShare && navigator.canShare({files:[file]})){ navigator.share({files:[file],title:'A Quranic discovery',text:d.topic+' - '+d.answer}).catch(function(){}); }
          else save(blob);
        });
      };
      modal.querySelector('.qsm-back').onclick=closeModal;
      if(!(navigator.canShare)){ var sb=modal.querySelector('[data-act="share"]'); if(sb) sb.style.display='none'; }
      document.addEventListener('keydown',onKey);
      requestAnimationFrame(function(){ modal.classList.add('show'); });
    });
  }
  /* ── Warm arc: sustained golden warmth on the page during the verdict ── */
  function startWarmArc() {
    if (window.matchMedia('(prefers-reduced-motion:reduce)').matches) return;
    if (document.getElementById('qn-warm-arc')) return;
    var acc = accent();
    var w = document.createElement('div');
    w.id = 'qn-warm-arc';
    w.style.cssText = [
      'position:fixed;inset:0;pointer-events:none;z-index:9200;',
      'background:radial-gradient(ellipse at 50% 58%,',
        hexA(acc, 0.24) + ' 0%,',
        hexA(acc, 0.10) + ' 38%,',
        hexA('#f59e0b', 0.06) + ' 58%,',
        'transparent 76%);',
      'opacity:0;transition:opacity 1.6s cubic-bezier(.16,1,.3,1);',
    ].join('');
    document.body.appendChild(w);
    requestAnimationFrame(function () {
      w.style.opacity = '1';
      /* settle to a gentle persistent warmth after the peak */
      setTimeout(function () {
        w.style.transition = 'opacity 3.5s ease';
        w.style.opacity = '0.38';
      }, 2200);
    });
  }

  /* ── Typewriter: "That's impossible to be a coincidence." ── */
  function startTypewriter() {
    if (document.getElementById('qn-verdict-line')) return;
    var LINE = "That's impossible to be a coincidence.";
    var el = document.createElement('p');
    el.id = 'qn-verdict-line';
    el.className = 'qn-verdict-line';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-label', LINE);
    /* insert: before the constellation tie-in if it exists, else before curiositySeed */
    var tie = document.querySelector('.qn-verdict-tie');
    var seed = document.getElementById('curiositySeed');
    var anchor = tie || seed;
    if (anchor && anchor.parentNode === s4) s4.insertBefore(el, anchor);
    else s4.appendChild(el);
    var i = 0;
    function type() {
      if (i < LINE.length) {
        el.textContent += LINE[i++];
        /* humanise: punctuation pauses, normal chars quick */
        var ch = LINE[i - 1];
        var delay = ch === '.' ? 340 : ch === '\'' || ch === ' ' ? 55 : 36 + Math.random() * 18;
        setTimeout(type, delay);
      } else {
        el.classList.add('done');
      }
    }
    /* delay so counters finish first (they run ~1.4s) */
    var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
    if (reduce) { el.textContent = LINE; el.classList.add('done'); }
    else setTimeout(type, 1500);
  }

  function inject() {
    if (injected) return; injected = true;
    var d=gather(), n=d.n, complete=n>=TOTAL;
    var dots=''; for(var i=0;i<TOTAL;i++) dots+='<i'+(i<n?' class="lit'+(i===n-1?' new':'')+'"':'')+'></i>';
    var box=document.createElement('div'); box.className='qn-verdict-tie';
    box.innerHTML =
      '<div class="qvt-eyebrow">✦ Charted</div>'+
      (complete
        ? '<div class="qvt-title">The map is complete.</div><div class="qvt-sub">All 53 discoveries illuminated - the whole constellation is yours.</div>'
        : '<div class="qvt-title">Discovery <b>'+n+'</b> of '+TOTAL+' illuminated</div><div class="qvt-sub">Your constellation just grew brighter.</div>')+
      '<div class="qvt-dots" aria-hidden="true">'+dots+'</div>'+
      '<div class="qvt-actions">'+
        '<button type="button" class="qvt-share">✦ Share this discovery</button>'+
        '<a class="qvt-link" href="index.html#constellation">See your constellation →</a>'+
      '</div>';
    var seed=document.getElementById('curiositySeed');
    if(seed && seed.parentNode===s4) s4.insertBefore(box,seed); else s4.appendChild(box);
    box.querySelector('.qvt-share').onclick=openShare;
    requestAnimationFrame(function(){ box.classList.add('show'); });

    /* peak enhancements - staggered after the box appears */
    setTimeout(startWarmArc,  200);
    setTimeout(startTypewriter, 600);
  }
  new MutationObserver(function () { if (xb.classList.contains('show')) inject(); })
    .observe(xb, { attributes: true, attributeFilter: ['class'] });
}());

/* ═══════════════════════════════════════════════════════════════
   TWIN-COUNT PROOF - for the symmetric-word-count lessons, lead S1
   with a "count them yourself" demonstration: both words tally live
   and lock equal. Data-driven from the prediction config (scale-balance),
   so zero per-page edits. The platform's signature claim, made visceral.
═══════════════════════════════════════════════════════════════ */
(function () {
  var s1 = document.getElementById('s1');
  if (!s1) return;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  setTimeout(function () {
    if (!(window.Prediction && Prediction.twinData)) return;
    var d = Prediction.twinData();
    if (!d || s1.querySelector('.qn-twin')) return;
    var box = document.createElement('div');
    box.className = 'qn-twin';
    box.innerHTML =
      '<div class="qn-twin-head">Don’t take our word - count them yourself</div>' +
      '<div class="qn-twin-cols">' +
        '<div class="qn-twin-col"><div class="qn-twin-ar">'+esc(d.la)+'</div><div class="qn-twin-nm">'+esc(d.ll)+'</div>' +
          '<div class="qn-twin-n" id="qtL" aria-live="polite">0</div><div class="qn-twin-bar"><i id="qtLb"></i></div></div>' +
        '<div class="qn-twin-eq" id="qtEq">⚖</div>' +
        '<div class="qn-twin-col"><div class="qn-twin-ar">'+esc(d.ra)+'</div><div class="qn-twin-nm">'+esc(d.rl)+'</div>' +
          '<div class="qn-twin-n" id="qtR" aria-live="polite">0</div><div class="qn-twin-bar"><i id="qtRb"></i></div></div>' +
      '</div>' +
      '<button type="button" class="qn-twin-btn" id="qtGo">Tally every occurrence in the Quran →</button>' +
      '<div class="qn-twin-res" id="qtRes"></div>';
    s1.insertBefore(box, s1.firstChild);
    var mx = Math.max(d.lc, d.rc) || 1, done = false;
    function countTo(el, bar, to, ms, cb){
      var t0=null;
      function run(ts){ if(!t0)t0=ts; var p=Math.min((ts-t0)/ms,1), e=1-Math.pow(1-p,3), v=Math.round(e*to);
        el.textContent=v; if(bar) bar.style.width=(to/mx*100*e).toFixed(1)+'%';
        if(p<1) requestAnimationFrame(run); else if(cb) cb(); }
      requestAnimationFrame(run);
    }
    document.getElementById('qtGo').onclick = function(){
      if(done) return; done=true; this.disabled=true; this.textContent='Counting…';
      var L=document.getElementById('qtL'), R=document.getElementById('qtR'), Lb=document.getElementById('qtLb'), Rb=document.getElementById('qtRb');
      var btn=this;
      function finish(){
        var eq=document.getElementById('qtEq'), res=document.getElementById('qtRes'), equal=(d.lc===d.rc);
        if(eq){ eq.textContent = equal ? '=' : '⚖'; if(equal) eq.classList.add('locked'); }
        box.classList.add(equal?'is-equal':'is-near');
        res.innerHTML = equal
          ? 'Both exactly <b>'+d.lc+'</b>'+(d.unit?(' '+esc(d.unit)):'')+' - across all 6,236 verses, not one more, not one less.'
          : '<b>'+d.lc+'</b> and <b>'+d.rc+'</b> - counted across the whole Quran.';
        res.classList.add('show'); btn.style.display='none';
      }
      if(reduce){ L.textContent=d.lc; R.textContent=d.rc; if(Lb)Lb.style.width=(d.lc/mx*100)+'%'; if(Rb)Rb.style.width=(d.rc/mx*100)+'%'; finish(); return; }
      var dur=1500, n=2;
      var fin=function(){ if(--n===0) finish(); };
      countTo(L, Lb, d.lc, dur, fin);
      countTo(R, Rb, d.rc, dur, fin);
    };
  }, 60);
}());

/* ═══════════════════════════════════════════════════════════════
   SCENE CINEMATICS - staggered content reveal + verse light-sweep
   each time a lesson stage becomes active. Generic: targets standard
   content classes, skips the prediction stage, lesson-pages only.
═══════════════════════════════════════════════════════════════ */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var stages = document.querySelectorAll('.stage');
  if (!stages.length || reduce) return;

  var SEL   = '.hero-title,.prompt,.verse-block,.hero-verse,.verse-box,.intro-verse,'
            + '.claim-box,.insight-box,.word-root,.gold-box,.balance-eq,.match-eq';
  var SWEEP = '.verse-block,.hero-verse,.verse-box,.intro-verse';

  function reveal(st) {
    var i = 0;
    st.querySelectorAll(SEL).forEach(function (el) {
      if (i >= 6 || el.closest('.stage') !== st) return;
      el.classList.remove('qn-reveal'); void el.offsetWidth;   /* restart */
      el.style.animationDelay = (i * 0.09).toFixed(2) + 's';
      el.classList.add('qn-reveal');
      i++;
    });
    st.querySelectorAll(SWEEP).forEach(function (v) {
      if (v.closest('.stage') !== st) return;
      v.classList.remove('qn-sweep'); void v.offsetWidth; v.classList.add('qn-sweep');
    });
  }

  stages.forEach(function (st) {
    if (st.id === 'sp') return;                 /* prediction stage: leave to prediction.js */
    new MutationObserver(function () {
      if (st.classList.contains('active')) reveal(st);
    }).observe(st, { attributes: true, attributeFilter: ['class'] });
  });

  var act = document.querySelector('.stage.active');
  if (act && act.id !== 'sp') reveal(act);
}());

/* ═══════════════════════════════════════════════════════════════
   ARABIC VERSE STROKE-DRAW - when S0 becomes active, the main
   Arabic verse element reveals right-to-left with a glowing pen
   cursor, like calligraphy being written before your eyes.
   Covers .verse-ar (19 lessons), .iv-ar (14), .hero-verse (6).
   DOM-hooked, lesson-pages only, zero per-page edits.
═══════════════════════════════════════════════════════════════ */
(function () {
  var s0 = document.getElementById('s0');
  if (!s0) return;
  var reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var fired = false;

  /* Read page accent for the pen glow */
  function accentCol() {
    return (getComputedStyle(document.body).getPropertyValue('--accent-light') ||
            getComputedStyle(document.body).getPropertyValue('--accent') || '').trim() || '#fcd34d';
  }

  /* Animate glowing pen cursor across an element right→left */
  function runPen(el, duration) {
    var acc = accentCol();
    /* need a relative-positioned parent for absolute cursor */
    var par = el.parentElement;
    var prevPos = getComputedStyle(par).position;
    if (prevPos === 'static') par.style.position = 'relative';

    var cur = document.createElement('span');
    cur.className = 'qn-pen-cursor';
    cur.style.setProperty('--pc', acc);
    /* match cursor height to the element */
    cur.style.height = el.offsetHeight + 'px';
    cur.style.top    = el.offsetTop + 'px';
    par.appendChild(cur);

    /* ease-out progress: starts fast, slows at the end */
    var t0 = null;
    function step(ts) {
      if (!t0) t0 = ts;
      var raw = Math.min((ts - t0) / duration, 1);
      /* cubic ease-out */
      var p = 1 - Math.pow(1 - raw, 3);
      /* move from right(100%) → left(0%) */
      cur.style.right = (100 - p * 100).toFixed(2) + '%';
      cur.style.opacity = raw < 0.95 ? '1' : (1 - (raw - 0.95) / 0.05).toFixed(3);
      if (raw < 1) {
        requestAnimationFrame(step);
      } else {
        cur.remove();
        if (prevPos === 'static') par.style.position = '';
      }
    }
    requestAnimationFrame(step);
  }

  var SELS = [
    '.verse-ar', '.iv-ar', '.hero-verse', '.vb-ar', '.vc-ar',
    '.cnode-ar', '.wc-arabic', '.vs-ar', '.bal-ar',
    '.pc-arabic', '.words-intro', '.word-hero', '.surah-name-ar',
    '.gate-label'
  ];

  function findVerse() {
    for (var i = 0; i < SELS.length; i++) {
      var m = s0.querySelector(SELS[i]);
      if (m && m.textContent.trim().length > 3) return m;
    }
    return null;
  }

  function animate(found) {
    if (fired) return; fired = true;

    var len = found.textContent.trim().length;
    /* short = single word: 900ms min; long verse: up to 3.6s */
    var duration = Math.min(Math.max(len < 8 ? 900 : 1800, len * 28), 3600);

    if (reduce) { found.classList.add('qn-arabic-visible'); return; }

    found.classList.add('qn-arabic-write');
    found.addEventListener('animationend', function () {
      found.classList.remove('qn-arabic-write');
      found.classList.add('qn-arabic-visible');
    }, { once: true });

    runPen(found, duration);
  }

  /* Watch for the verse to actually enter the viewport - not just S0 becoming active.
     On mobile the verse can be far below the fold; we only play the animation
     when the user has scrolled to it (≥35% visible).
     This also handles: S0 already active but user hasn't scrolled yet. */
  function watchVerse(found) {
    if (!('IntersectionObserver' in window)) {
      /* Fallback for very old browsers: fire immediately */
      animate(found); return;
    }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].intersectionRatio >= 0.35) {
        io.disconnect();
        /* Small delay lets the browser finish the scroll + layout paint
           so the element dimensions are accurate for the pen cursor */
        setTimeout(function () { animate(found); }, 80);
      }
    }, {
      threshold: [0, 0.35, 0.5, 1],
      /* rootMargin: slightly negative top - don't fire while element is
         still partially hidden under a sticky header */
      rootMargin: '-48px 0px 0px 0px'
    });
    io.observe(found);
  }

  /* S0 must be active (prediction submitted) AND verse in viewport */
  function onS0Active() {
    var found = findVerse();
    if (!found) return;
    /* If already visible right now (desktop, short page) - watch immediately */
    watchVerse(found);
  }

  /* Hook: S0 activated by prediction.js */
  new MutationObserver(function () {
    if (s0.classList.contains('active') && !s0.classList.contains('pred-landing')) {
      onS0Active();
    }
  }).observe(s0, { attributes: true, attributeFilter: ['class'] });

  /* Fallback: S0 already active on load (revisit) */
  if (s0.classList.contains('active') && !s0.classList.contains('pred-landing')) {
    onS0Active();
  }
}());
