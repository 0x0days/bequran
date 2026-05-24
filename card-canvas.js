/* card-canvas.js — per-lesson hero canvas animations for index cards */
var CardCanvases = {};

CardCanvases['adam-jesus'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var dust = [];
  for (var i = 0; i < 60; i++) {
    dust.push({
      progress: Math.random(),
      side: Math.random() < 0.5 ? -1 : 1,
      spread: (Math.random() - 0.5) * 20,
      speed: 0.002 + Math.random() * 0.003,
      size: Math.random() * 2 + 0.5
    });
  }

  function drawSky() {
    var bg = ctx.createRadialGradient(W/2, H * 0.2, 10, W/2, H/2, W*0.8);
    bg.addColorStop(0, '#0c0818');
    bg.addColorStop(0.5, '#060410');
    bg.addColorStop(1, '#020205');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle stars
    ctx.fillStyle = '#ffffff';
    var stars = [[80, 15], [220, 40], [420, 20], [560, 50], [140, 65], [500, 70], [350, 10]];
    stars.forEach(function(s) {
      ctx.globalAlpha = 0.3 + Math.sin(t * 2 + s[0]) * 0.3;
      ctx.fillRect(s[0], s[1], 1.5, 1.5);
    });
    ctx.globalAlpha = 1;
  }

  function drawSourceBeam() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // Source glow at the top
    var g = ctx.createRadialGradient(W/2, 0, 0, W/2, 0, 80);
    g.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    g.addColorStop(0.3, 'rgba(200, 180, 255, 0.2)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(W/2 - 80, 0, 160, 100);

    // Left sweeping beam to Adam
    ctx.beginPath();
    ctx.moveTo(W/2 - 5, 0);
    ctx.quadraticCurveTo(W/2 - 40, H * 0.4, W * 0.32, H * 0.85);
    ctx.lineTo(W * 0.32 + 30, H * 0.85);
    ctx.quadraticCurveTo(W/2 + 20, H * 0.4, W/2 + 5, 0);
    ctx.closePath();
    var b1 = ctx.createLinearGradient(W/2, 0, W * 0.32, H * 0.85);
    b1.addColorStop(0, 'rgba(255, 200, 150, 0.12)');
    b1.addColorStop(1, 'rgba(255, 100, 50, 0)');
    ctx.fillStyle = b1;
    ctx.fill();

    // Right sweeping beam to Jesus
    ctx.beginPath();
    ctx.moveTo(W/2 - 5, 0);
    ctx.quadraticCurveTo(W/2 + 40, H * 0.4, W * 0.68, H * 0.85);
    ctx.lineTo(W * 0.68 - 30, H * 0.85);
    ctx.quadraticCurveTo(W/2 - 20, H * 0.4, W/2 + 5, 0);
    ctx.closePath();
    var b2 = ctx.createLinearGradient(W/2, 0, W * 0.68, H * 0.85);
    b2.addColorStop(0, 'rgba(150, 200, 255, 0.12)');
    b2.addColorStop(1, 'rgba(50, 100, 255, 0)');
    ctx.fillStyle = b2;
    ctx.fill();

    ctx.restore();
  }

  function drawDust() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    dust.forEach(function(d) {
      d.progress += d.speed;
      if (d.progress > 1) { d.progress = 0; d.spread = (Math.random() - 0.5) * 20; }

      var targetX = d.side === -1 ? W * 0.32 : W * 0.68;
      var targetY = H * 0.85;
      var u = d.progress;
      
      // Bezier math for X and Y along the sweeping beam
      var cpx = d.side === -1 ? W/2 - 40 : W/2 + 40;
      var cpy = H * 0.4;
      var x = (1-u)*(1-u)*W/2 + 2*(1-u)*u*cpx + u*u*targetX + d.spread * (1 - u);
      var y = (1-u)*(1-u)*0 + 2*(1-u)*u*cpy + u*u*targetY;

      var alpha = Math.sin(u * Math.PI) * 0.8;
      var r = d.side === -1 ? 255 : 150;
      var g2 = d.side === -1 ? 180 : 220;
      var b = d.side === -1 ? 100 : 255;

      ctx.beginPath();
      ctx.arc(x, y, d.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g2 + ',' + b + ',' + alpha + ')';
      ctx.fill();
    });
    ctx.restore();
  }

  // Draws a sharp, towering geometric light presence
  function drawPresence(cx, cy, colorInner, colorMid, colorOuter, phaseOffset) {
    ctx.save();
    ctx.translate(cx, cy);

    var breathe = Math.sin(t * 1.2 + phaseOffset) * 0.1 + 1; // 0.9 to 1.1 scale

    // Outer ethereal aura glow
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var outerGlow = ctx.createRadialGradient(0, -40 * breathe, 10, 0, -40 * breathe, 90);
    outerGlow.addColorStop(0, colorOuter + '0.2)');
    outerGlow.addColorStop(1, colorOuter + '0)');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(-90, -130, 180, 180);
    ctx.restore();

    // Sharp Diamond/Rhombus shape (Vertical, like a standing aura)
    var h = 110 * breathe;
    var w = 35 * breathe;

    ctx.beginPath();
    ctx.moveTo(0, -h);         // Top point
    ctx.lineTo(w, -h * 0.3);  // Right shoulder
    ctx.lineTo(w * 0.6, 20);  // Right hip
    ctx.lineTo(0, 40);        // Bottom point
    ctx.lineTo(-w * 0.6, 20); // Left hip
    ctx.lineTo(-w, -h * 0.3); // Left shoulder
    ctx.closePath();

    // Fill with mid-tone
    var grad = ctx.createLinearGradient(0, -h, 0, 40);
    grad.addColorStop(0, colorMid + '0.8)');
    grad.addColorStop(0.5, colorInner + '0.4)');
    grad.addColorStop(1, colorOuter + '0.1)');
    ctx.fillStyle = grad;
    ctx.fill();

    // Crisp sharp edge outline
    ctx.strokeStyle = colorInner + '0.9)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Inner cross-hatch geometry for "edgy detailed" look
    ctx.strokeStyle = colorInner + '0.4)';
    ctx.lineWidth = 1;
    
    // Horizontal sharp lines
    for (var i = 1; i < 4; i++) {
      var ly = -h + (h + 40) * (i / 4);
      var lw = w * (1 - Math.abs((ly + 40) / (h + 40))); // Taper towards top and bottom
      ctx.beginPath();
      ctx.moveTo(-lw, ly);
      ctx.lineTo(lw, ly);
      ctx.stroke();
    }

    // Inner vertical spine
    ctx.beginPath();
    ctx.moveTo(0, -h * 0.8);
    ctx.lineTo(0, 30);
    ctx.strokeStyle = colorInner + '0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Blinding inner core (White hot center)
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var core = ctx.createRadialGradient(0, -50 * breathe, 0, 0, -50 * breathe, 25);
    core.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    core.addColorStop(0.5, colorInner + '0.4)');
    core.addColorStop(1, colorInner + '0)');
    ctx.fillStyle = core;
    ctx.fillRect(-25, -75 * breathe, 50, 50);
    ctx.restore();

    ctx.restore();
  }

  function frame() {
    t += 0.012;
    ctx.clearRect(0, 0, W, H);

    drawSky();
    drawSourceBeam();
    drawDust();

    // Left Light: Adam (Warm Gold/Amber - Created from Earth/Clay)
    drawPresence(W * 0.32, H * 0.85, 'rgba(255, 200, 100,', 'rgba(255, 140, 50,', 'rgba(180, 60, 20,', 0);
    
    // Right Light: Jesus (Cool Cyan/Blue - Created from a Word/Ruh)
    drawPresence(W * 0.68, H * 0.85, 'rgba(150, 220, 255,', 'rgba(80, 160, 255,', 'rgba(30, 60, 180,', 3.14);

    // Vignettes
    var vt = ctx.createLinearGradient(0, 0, 0, 35);
    vt.addColorStop(0, 'rgba(2,2,5,0.9)');
    vt.addColorStop(1, 'rgba(2,2,5,0)');
    ctx.fillStyle = vt; ctx.fillRect(0, 0, W, 35);

    var vb = ctx.createLinearGradient(0, H - 35, 0, H);
    vb.addColorStop(0, 'rgba(2,2,5,0)');
    vb.addColorStop(1, 'rgba(2,2,5,0.9)');
    ctx.fillStyle = vb; ctx.fillRect(0, H - 35, W, 35);

    var vl = ctx.createLinearGradient(0, 0, 35, 0);
    vl.addColorStop(0, 'rgba(2,2,5,0.8)');
    vl.addColorStop(1, 'rgba(2,2,5,0)');
    ctx.fillStyle = vl; ctx.fillRect(0, 0, 35, H);

    var vr = ctx.createLinearGradient(W - 35, 0, W, 0);
    vr.addColorStop(0, 'rgba(2,2,5,0)');
    vr.addColorStop(1, 'rgba(2,2,5,0.8)');
    ctx.fillStyle = vr; ctx.fillRect(W - 35, 0, 35, H);

    requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['age-of-universe'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;

  var seed = 91;
  function rng() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; }
  var stars = [];
  for (var i = 0; i < 50; i++) stars.push({ x: rng() * W, y: rng() * H, r: rng() * 0.9 + 0.2, a: rng() * 0.35 + 0.08 });

  var frame = 0;
  var TOTAL = 240;

  var PAD = 28;
  var BAR_W = W - PAD * 2;
  var UNIV_Y = H * 0.38;
  var EARTH_Y = H * 0.66;
  var BAR_H = 9;
  var EARTH_FRAC = 1 / 3;
  var EARTH_X = PAD + BAR_W * (1 - EARTH_FRAC);

  function draw() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(function(s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
      ctx.fill();
    });

    var t = Math.min(frame / 160, 1);
    var progress = 1 - Math.pow(1 - t, 3);

    var univFill = progress * BAR_W;
    ctx.beginPath();
    ctx.roundRect(PAD, UNIV_Y - BAR_H / 2, BAR_W, BAR_H, 4);
    ctx.fillStyle = 'rgba(196,181,253,0.10)';
    ctx.fill();
    if (univFill > 0) {
      ctx.beginPath();
      ctx.roundRect(PAD, UNIV_Y - BAR_H / 2, univFill, BAR_H, 4);
      var gU = ctx.createLinearGradient(PAD, 0, PAD + BAR_W, 0);
      gU.addColorStop(0, 'rgba(196,181,253,0.55)');
      gU.addColorStop(1, 'rgba(196,181,253,0.95)');
      ctx.fillStyle = gU;
      ctx.fill();
    }

    var earthProgress = Math.max(0, Math.min((progress - 2/3) / (1/3), 1));
    var earthFill = earthProgress * (BAR_W * EARTH_FRAC);
    ctx.beginPath();
    ctx.roundRect(EARTH_X, EARTH_Y - BAR_H / 2, BAR_W * EARTH_FRAC, BAR_H, 4);
    ctx.fillStyle = 'rgba(252,211,77,0.10)';
    ctx.fill();
    if (earthFill > 0) {
      ctx.beginPath();
      ctx.roundRect(EARTH_X, EARTH_Y - BAR_H / 2, earthFill, BAR_H, 4);
      var gE = ctx.createLinearGradient(EARTH_X, 0, EARTH_X + BAR_W * EARTH_FRAC, 0);
      gE.addColorStop(0, 'rgba(252,211,77,0.6)');
      gE.addColorStop(1, 'rgba(252,211,77,1.0)');
      ctx.fillStyle = gE;
      ctx.fill();
    }

    ctx.font = '500 11px DM Sans, sans-serif';
    ctx.fillStyle = 'rgba(196,181,253,0.75)';
    ctx.fillText('UNIVERSE  13.8 billion years', PAD, UNIV_Y - BAR_H / 2 - 7);
    ctx.fillStyle = 'rgba(252,211,77,0.75)';
    ctx.fillText('EARTH  4.6 billion years', EARTH_X, EARTH_Y - BAR_H / 2 - 7);

    if (progress > 0.5) {
      var divAlpha = Math.min((progress - 0.5) / 0.2, 1) * 0.5;
      ctx.beginPath();
      ctx.moveTo(EARTH_X, UNIV_Y + BAR_H / 2 + 2);
      ctx.lineTo(EARTH_X, EARTH_Y - BAR_H / 2 - 2);
      ctx.strokeStyle = 'rgba(255,255,255,' + divAlpha.toFixed(2) + ')';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (earthProgress > 0.9) {
      var lblAlpha = Math.min((earthProgress - 0.9) / 0.1, 1);
      ctx.font = 'bold 18px "Playfair Display", serif';
      ctx.fillStyle = 'rgba(196,181,253,' + (lblAlpha * 0.9).toFixed(2) + ')';
      ctx.fillText('= ⅓', W - PAD - 2, (UNIV_Y + EARTH_Y) / 2 + 6);
    }

    frame++;
    if (frame > TOTAL) frame = 0;
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['angels-devils'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var angelPs = Array.from({length:20}, function(_,i) {
    return {x:Math.random()*W*0.44,y:H*0.5+Math.random()*H*0.5,sp:0.4+Math.random()*0.8,ph:i*0.7};
  });
  var devilPs = Array.from({length:20}, function(_,i) {
    return {x:W*0.56+Math.random()*W*0.44,y:Math.random()*H*0.5,sp:0.4+Math.random()*0.8,ph:i*0.7};
  });
  function frame() {
    ctx.clearRect(0,0,W,H);
    var gl=ctx.createLinearGradient(0,0,W*0.48,0);
    gl.addColorStop(0,'#0d1a2e'); gl.addColorStop(1,'#121f35');
    ctx.fillStyle=gl; ctx.fillRect(0,0,W*0.5,H);
    var gr=ctx.createLinearGradient(W*0.52,0,W,0);
    gr.addColorStop(0,'#180c0c'); gr.addColorStop(1,'#120808');
    ctx.fillStyle=gr; ctx.fillRect(W*0.5,0,W*0.5,H);
    angelPs.forEach(function(p) {
      p.y-=p.sp; p.x+=Math.sin(t*1.5+p.ph)*0.5;
      if(p.y<-5){p.y=H+5;p.x=Math.random()*W*0.43;}
      var a=Math.max(0,Math.min(0.8,(H-p.y)/H*1.5));
      ctx.beginPath(); ctx.arc(p.x,p.y,1.8,0,Math.PI*2);
      ctx.fillStyle='rgba(253,224,71,'+a+')'; ctx.fill();
      ctx.beginPath(); ctx.arc(p.x,p.y,5,0,Math.PI*2);
      ctx.fillStyle='rgba(253,224,71,0.07)'; ctx.fill();
    });
    devilPs.forEach(function(p) {
      p.y+=p.sp; p.x+=Math.sin(t*1.2+p.ph)*0.4;
      if(p.y>H+5){p.y=-5;p.x=W*0.57+Math.random()*W*0.43;}
      var a=Math.max(0,Math.min(0.75,p.y/H*1.5));
      ctx.beginPath(); ctx.arc(p.x,p.y,1.8,0,Math.PI*2);
      ctx.fillStyle='rgba(248,113,113,'+a+')'; ctx.fill();
    });
    var gv=ctx.createLinearGradient(W*0.47,0,W*0.53,0);
    gv.addColorStop(0,'transparent'); gv.addColorStop(0.5,'rgba(255,255,255,0.06)'); gv.addColorStop(1,'transparent');
    ctx.fillStyle=gv; ctx.fillRect(W*0.47,0,W*0.06,H);
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['bee-female'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;

  var R = 20;
  var hexW = R * Math.sqrt(3);
  var hexH = R * 2;
  var cols = Math.ceil(W / hexW) + 2;
  var rows = Math.ceil(H / (hexH * 0.75)) + 2;

  var hexes = [];
  for (var row = -1; row < rows; row++) {
    for (var col = -1; col < cols; col++) {
      var x = col * hexW + (row % 2) * hexW / 2;
      var y = row * hexH * 0.75;
      var rng = Math.random();
      var hexType = 'empty';
      if (rng < 0.14) hexType = 'honey';
      else if (rng < 0.22) hexType = 'brood';
      else if (rng < 0.30) hexType = 'pollen';
      hexes.push({
        x: x, y: y,
        ph: Math.random() * Math.PI * 2,
        type: hexType,
        brightness: 0.3 + Math.random() * 0.4,
        honeyLevel: Math.random() * 0.5 + 0.5
      });
    }
  }

  var particles = [];
  for (var i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.15 - 0.08,
      r: Math.random() * 2.2 + 0.4,
      alpha: Math.random() * 0.45 + 0.15,
      ph: Math.random() * Math.PI * 2
    });
  }

  var bee = { x: -40, y: H * 0.42, wingPhase: 0, wobble: 0 };

  function hexPath(cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 6; i++) {
      var a = Math.PI / 3 * i - Math.PI / 6;
      var px = cx + r * Math.cos(a);
      var py = cy + r * Math.sin(a);
      i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  function drawHex(h) {
    var pulse = Math.sin(t * 1.2 + h.ph) * 0.12;
    var b = h.brightness + pulse;
    var ir = R - 2;

    hexPath(h.x, h.y + 1.5, ir);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fill();

    hexPath(h.x, h.y, ir);

    if (h.type === 'honey') {
      var hg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, ir);
      var ha = b * h.honeyLevel;
      hg.addColorStop(0, 'rgba(250,185,25,' + (ha * 0.95) + ')');
      hg.addColorStop(0.6, 'rgba(190,110,5,' + (ha * 0.75) + ')');
      hg.addColorStop(1, 'rgba(110,55,0,' + (ha * 0.55) + ')');
      ctx.fillStyle = hg;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(h.x - 2, h.y - 3, ir * 0.38, ir * 0.2, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,235,130,' + (b * 0.22) + ')';
      ctx.fill();
      hexPath(h.x, h.y, ir);
      ctx.strokeStyle = 'rgba(250,165,15,' + (b * 0.85) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else if (h.type === 'brood') {
      var bg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, ir);
      bg.addColorStop(0, 'rgba(105,65,25,' + (b * 0.55) + ')');
      bg.addColorStop(1, 'rgba(35,20,8,' + (b * 0.45) + ')');
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(h.x, h.y, ir * 0.32, ir * 0.22, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210,165,85,' + (b * 0.4) + ')';
      ctx.fill();
      hexPath(h.x, h.y, ir);
      ctx.strokeStyle = 'rgba(165,105,35,' + (b * 0.6) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else if (h.type === 'pollen') {
      var pg = ctx.createRadialGradient(h.x, h.y, 0, h.x, h.y, ir);
      pg.addColorStop(0, 'rgba(225,205,55,' + (b * 0.65) + ')');
      pg.addColorStop(1, 'rgba(130,110,18,' + (b * 0.3) + ')');
      ctx.fillStyle = pg;
      ctx.fill();
      hexPath(h.x, h.y, ir);
      ctx.strokeStyle = 'rgba(210,190,45,' + (b * 0.55) + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    } else {
      var eg = ctx.createRadialGradient(h.x, h.y, ir * 0.25, h.x, h.y, ir);
      eg.addColorStop(0, 'rgba(32,18,5,' + (b * 0.65) + ')');
      eg.addColorStop(1, 'rgba(12,6,2,' + (b * 0.85) + ')');
      ctx.fillStyle = eg;
      ctx.fill();
      hexPath(h.x, h.y, ir);
      ctx.strokeStyle = 'rgba(185,115,35,' + (b * 0.4) + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
      hexPath(h.x, h.y, ir * 0.82);
      ctx.strokeStyle = 'rgba(105,65,18,' + (b * 0.18) + ')';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(h.x + ir * Math.cos(-Math.PI / 6), h.y + ir * Math.sin(-Math.PI / 6));
    ctx.lineTo(h.x + ir * Math.cos(Math.PI / 6), h.y + ir * Math.sin(Math.PI / 6));
    ctx.strokeStyle = 'rgba(255,210,90,' + (b * 0.12) + ')';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(h.x + ir * Math.cos(Math.PI / 6), h.y + ir * Math.sin(Math.PI / 6));
    ctx.lineTo(h.x + ir * Math.cos(Math.PI / 2), h.y + ir * Math.sin(Math.PI / 2));
    ctx.strokeStyle = 'rgba(255,210,90,' + (b * 0.06) + ')';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawBee() {
    bee.x += 1.3;
    bee.wobble += 0.055;
    bee.wingPhase += 0.55;
    bee.y = H * 0.43 + Math.sin(bee.wobble) * 13 + Math.sin(t * 1.7) * 5;
    if (bee.x > W + 50) bee.x = -50;

    var bx = bee.x, by = bee.y;
    var wf = Math.sin(bee.wingPhase) * 0.45;

    ctx.save();
    ctx.translate(bx, by);

    ctx.beginPath();
    ctx.ellipse(0, 0, 24, 16, 0, 0, Math.PI * 2);
    var glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 24);
    glow.addColorStop(0, 'rgba(255,210,60,0.1)');
    glow.addColorStop(1, 'rgba(255,210,60,0)');
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(2, 3, 15, 8, -0.15 + wf, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();

    for (var w = 0; w < 2; w++) {
      ctx.save();
      ctx.rotate(wf + w * 0.18);
      ctx.beginPath();
      ctx.ellipse(-1 + w * 5, -8 - w, 14 - w * 2, 7 - w * 0.5, -0.12 + w * 0.08, 0, Math.PI * 2);
      var wg = ctx.createRadialGradient(-1 + w * 5, -8, 1, -1 + w * 5, -8, 14);
      wg.addColorStop(0, 'rgba(225,245,255,0.5)');
      wg.addColorStop(0.4, 'rgba(185,215,245,0.3)');
      wg.addColorStop(1, 'rgba(140,180,225,0.05)');
      ctx.fillStyle = wg;
      ctx.fill();
      ctx.strokeStyle = 'rgba(210,230,250,0.2)';
      ctx.lineWidth = 0.5;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-1 + w * 5, -8 - w);
      ctx.lineTo(-9 + w * 5, -14 - w);
      ctx.moveTo(-1 + w * 5, -8 - w);
      ctx.lineTo(6 + w * 5, -13 - w);
      ctx.moveTo(-1 + w * 5, -8 - w);
      ctx.lineTo(-4 + w * 5, -16 - w);
      ctx.strokeStyle = 'rgba(210,230,250,0.12)';
      ctx.lineWidth = 0.4;
      ctx.stroke();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.ellipse(-6, 0, 10, 6.5, 0, 0, Math.PI * 2);
    var abd = ctx.createLinearGradient(-16, -7, -16, 7);
    abd.addColorStop(0, '#e8a810');
    abd.addColorStop(0.2, '#f0b820');
    abd.addColorStop(0.3, '#1a1000');
    abd.addColorStop(0.45, '#1a1000');
    abd.addColorStop(0.5, '#e8a810');
    abd.addColorStop(0.65, '#f0b820');
    abd.addColorStop(0.7, '#1a1000');
    abd.addColorStop(0.85, '#1a1000');
    abd.addColorStop(1, '#c8900a');
    ctx.fillStyle = abd;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(4, 0, 6.5, 5.5, 0, 0, Math.PI * 2);
    var thor = ctx.createRadialGradient(4, -1, 0, 4, 0, 6.5);
    thor.addColorStop(0, '#da9a0c');
    thor.addColorStop(0.6, '#b07800');
    thor.addColorStop(1, '#7a5200');
    ctx.fillStyle = thor;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(4, 0, 6.5, 5.5, 0, 0, Math.PI * 2);
    var thorShine = ctx.createRadialGradient(3, -2, 0, 4, 0, 6.5);
    thorShine.addColorStop(0, 'rgba(255,230,150,0.2)');
    thorShine.addColorStop(1, 'rgba(255,230,150,0)');
    ctx.fillStyle = thorShine;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(11, 0, 5, 4.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#281800';
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(13.5, -1.8, 2.2, 2.8, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#120800';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(13.5, -1.8, 1.4, 2, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,55,55,0.55)';
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(14, -2.5, 0.5, 0.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(14.5, -2.5);
    ctx.quadraticCurveTo(19, -9, 21, -11.5);
    ctx.strokeStyle = '#281800';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(21, -11.5, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#da9a0c';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(14.5, -1.5);
    ctx.quadraticCurveTo(20, -7, 22.5, -8);
    ctx.strokeStyle = '#281800';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(22.5, -8, 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#da9a0c';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-16, 0);
    ctx.lineTo(-19.5, 0);
    ctx.strokeStyle = 'rgba(40,20,0,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-19.5, 0, 0.6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(40,20,0,0.5)';
    ctx.fill();

    for (var leg = 0; leg < 3; leg++) {
      var lx = -3 + leg * 5;
      var lm = Math.sin(bee.wingPhase + leg * 1.3) * 2;
      ctx.beginPath();
      ctx.moveTo(lx, 5.5);
      ctx.quadraticCurveTo(lx + 3, 11 + lm, lx - 1, 15 + lm);
      ctx.strokeStyle = '#1a0a00';
      ctx.lineWidth = 0.7;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lx - 1, 15 + lm, 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#1a0a00';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(lx, -5.5);
      ctx.quadraticCurveTo(lx + 3, -11 - lm, lx - 1, -15 - lm);
      ctx.strokeStyle = '#1a0a00';
      ctx.lineWidth = 0.7;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(lx - 1, -15 - lm, 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#1a0a00';
      ctx.fill();
    }

    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(function(p) {
      p.x += p.vx + Math.sin(t * 0.9 + p.ph) * 0.12;
      p.y += p.vy;
      p.alpha = 0.18 + Math.sin(t * 0.7 + p.ph) * 0.12;
      if (p.x > W + 10) p.x = -10;
      if (p.x < -10) p.x = W + 10;
      if (p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      var pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
      pg.addColorStop(0, 'rgba(255,225,110,' + p.alpha + ')');
      pg.addColorStop(1, 'rgba(255,225,110,0)');
      ctx.fillStyle = pg;
      ctx.fill();
    });
  }

  function drawLightRays() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var i = 0; i < 4; i++) {
      var rx = 30 + i * 150 + Math.sin(t * 0.25 + i * 1.5) * 25;
      var rg = ctx.createLinearGradient(rx, 0, rx + 100, H);
      rg.addColorStop(0, 'rgba(250,185,55,0.035)');
      rg.addColorStop(0.5, 'rgba(250,185,55,0.012)');
      rg.addColorStop(1, 'rgba(250,185,55,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(rx - 15, 0);
      ctx.lineTo(rx + 50, 0);
      ctx.lineTo(rx + 100, H);
      ctx.lineTo(rx - 40, H);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    var bg = ctx.createLinearGradient(0, 0, W * 0.6, H);
    bg.addColorStop(0, '#0d0600');
    bg.addColorStop(0.4, '#100800');
    bg.addColorStop(1, '#080400');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawLightRays();
    hexes.forEach(drawHex);
    drawParticles();
    drawBee();

    var vt = ctx.createLinearGradient(0, 0, 0, 35);
    vt.addColorStop(0, 'rgba(11,22,34,0.55)');
    vt.addColorStop(1, 'rgba(11,22,34,0)');
    ctx.fillStyle = vt;
    ctx.fillRect(0, 0, W, 35);

    var vb = ctx.createLinearGradient(0, H - 35, 0, H);
    vb.addColorStop(0, 'rgba(11,22,34,0)');
    vb.addColorStop(1, 'rgba(11,22,34,0.55)');
    ctx.fillStyle = vb;
    ctx.fillRect(0, H - 35, W, 35);

    var vl = ctx.createLinearGradient(0, 0, 35, 0);
    vl.addColorStop(0, 'rgba(11,22,34,0.45)');
    vl.addColorStop(1, 'rgba(11,22,34,0)');
    ctx.fillStyle = vl;
    ctx.fillRect(0, 0, 35, H);

    var vr = ctx.createLinearGradient(W - 35, 0, W, 0);
    vr.addColorStop(0, 'rgba(11,22,34,0)');
    vr.addColorStop(1, 'rgba(11,22,34,0.45)');
    ctx.fillStyle = vr;
    ctx.fillRect(W - 35, 0, 35, H);

    t += 0.018;
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['big-bang'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var cx = W / 2, cy = H / 2;

  var seed = 77;
  function rng() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; }

  var TOTAL    = 280;
  var BANG_AT  = 22;
  var NUM_PART = 70;

  var particles = [];
  for (var i = 0; i < NUM_PART; i++) {
    var angle = rng() * Math.PI * 2;
    var speed = rng() * 1.8 + 0.5;
    var size  = rng() * 1.8 + 0.4;
    var kind  = rng();
    particles.push({ angle: angle, speed: speed, size: size, kind: kind });
  }

  var frame = 0;

  function draw() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    if (frame < BANG_AT) {
      var pulse = 0.5 + 0.5 * Math.sin(frame / BANG_AT * Math.PI);
      var r = 6 + pulse * 12;
      var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 2.5);
      grd.addColorStop(0,   'rgba(255,255,255,' + (0.5 + pulse * 0.5) + ')');
      grd.addColorStop(0.3, 'rgba(249,168,212,' + (0.4 + pulse * 0.4) + ')');
      grd.addColorStop(1,   'transparent');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      var age = frame - BANG_AT;
      var maxAge = TOTAL - BANG_AT;
      var progress = age / maxAge;

      if (age < 18) {
        var flash = (1 - age / 18) * 0.85;
        var fGrd = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.55);
        fGrd.addColorStop(0,   'rgba(255,255,255,' + flash + ')');
        fGrd.addColorStop(0.15,'rgba(249,168,212,' + (flash * 0.6) + ')');
        fGrd.addColorStop(0.5, 'rgba(196,181,253,' + (flash * 0.2) + ')');
        fGrd.addColorStop(1,   'transparent');
        ctx.fillStyle = fGrd;
        ctx.fillRect(0, 0, W, H);
      }

      var spreadP = 1 - Math.pow(1 - Math.min(progress * 1.3, 1), 2.5);

      particles.forEach(function(p) {
        var maxDist = p.speed * 320;
        var dist    = spreadP * maxDist;
        var px = cx + Math.cos(p.angle) * dist;
        var py = cy + Math.sin(p.angle) * dist;

        var alpha = progress < 0.7
          ? 0.85
          : (1 - (progress - 0.7) / 0.3) * 0.85;
        alpha = Math.max(0, alpha);

        var color;
        if (p.kind > 0.65) {
          color = 'rgba(249,168,212,' + alpha.toFixed(2) + ')';
        } else if (p.kind > 0.35) {
          color = 'rgba(196,181,253,' + (alpha * 0.85).toFixed(2) + ')';
        } else {
          color = 'rgba(255,255,255,' + (alpha * 0.55).toFixed(2) + ')';
        }

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      });

      if (progress < 0.4) {
        var glow = (1 - progress / 0.4) * 0.55;
        var g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
        g.addColorStop(0, 'rgba(255,255,255,' + glow + ')');
        g.addColorStop(1, 'transparent');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, 18, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    frame++;
    if (frame >= TOTAL) frame = 0;
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['brain-functions'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var t = 0;

  function makeRng(seed) {
    var s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    var cx = W / 2, cy = H * 0.50;
    var rx = 200, ry = 44;

    ctx.beginPath();
    ctx.moveTo(cx - rx*0.12, cy + ry*0.82);
    ctx.bezierCurveTo(cx - rx*0.55, cy + ry*0.5, cx - rx*0.85, cy + ry*0.1, cx - rx*0.80, cy - ry*0.55);
    ctx.bezierCurveTo(cx - rx*0.70, cy - ry*1.0, cx - rx*0.28, cy - ry*1.15, cx, cy - ry*1.1);
    ctx.bezierCurveTo(cx + rx*0.28, cy - ry*1.15, cx + rx*0.72, cy - ry*1.0, cx + rx*0.82, cy - ry*0.55);
    ctx.bezierCurveTo(cx + rx*0.88, cy + ry*0.05, cx + rx*0.65, cy + ry*0.55, cx + rx*0.55, cy + ry*0.85);
    ctx.bezierCurveTo(cx + rx*0.30, cy + ry*1.0, cx - rx*0.10, cy + ry*1.0, cx - rx*0.12, cy + ry*0.82);
    ctx.closePath();

    ctx.fillStyle = 'rgba(22,38,59,0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    var pulse = 0.4 + 0.3 * Math.sin(t * 1.4);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - rx*0.12, cy + ry*0.82);
    ctx.bezierCurveTo(cx - rx*0.55, cy + ry*0.5, cx - rx*0.85, cy + ry*0.1, cx - rx*0.80, cy - ry*0.55);
    ctx.bezierCurveTo(cx - rx*0.70, cy - ry*1.0, cx - rx*0.28, cy - ry*1.15, cx, cy - ry*1.1);
    ctx.lineTo(cx, cy + ry*1.0);
    ctx.bezierCurveTo(cx - rx*0.10, cy + ry*1.0, cx - rx*0.12, cy + ry*0.82, cx - rx*0.12, cy + ry*0.82);
    ctx.closePath();
    ctx.clip();

    var fg = ctx.createRadialGradient(cx - rx*0.40, cy, 0, cx - rx*0.40, cy, rx*0.75);
    fg.addColorStop(0, 'rgba(244,114,182,' + (0.45 * pulse) + ')');
    fg.addColorStop(0.6, 'rgba(244,114,182,' + (0.15 * pulse) + ')');
    fg.addColorStop(1, 'rgba(244,114,182,0)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    var rng = makeRng(42);
    for (var i = 0; i < 18; i++) {
      var nx = (cx - rx*0.85) + rng() * rx * 0.85;
      var ny = cy - ry*0.9 + rng() * ry * 1.8;
      var nr = 1.5 + rng() * 1.5;
      var na = 0.2 + 0.5 * Math.sin(t * (0.8 + rng() * 0.8) + i * 1.1);
      ctx.beginPath();
      ctx.arc(nx, ny, nr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(249,168,212,' + Math.max(0, na) + ')';
      ctx.fill();
    }

    var rng2 = makeRng(77);
    for (var j = 0; j < 10; j++) {
      var fnx = (cx - rx*0.80) + rng2() * rx * 0.50;
      var fny = cy - ry*0.85 + rng2() * ry * 1.7;
      var fnr = 1.5 + rng2() * 2;
      var fna = (0.45 + 0.45 * Math.sin(t * 1.2 + j * 0.7)) * pulse;
      ctx.beginPath();
      ctx.arc(fnx, fny, fnr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(244,114,182,' + Math.max(0, fna) + ')';
      ctx.fill();
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    [0.1, 0.3, 0.55, 0.75].forEach(function(fx) {
      ctx.beginPath();
      ctx.moveTo(cx - rx*0.78 + rx*fx, cy - ry*0.7);
      ctx.bezierCurveTo(
        cx - rx*0.78 + rx*fx + 8, cy,
        cx - rx*0.78 + rx*fx - 5, cy + ry*0.5,
        cx - rx*0.78 + rx*fx + 3, cy + ry*0.75
      );
      ctx.stroke();
    });

    t += 0.018;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['calendar-cycles'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var stars = Array.from({length:35},function(_,i){return{x:(i*137.5)%W,y:(i*89.3)%(H*0.9),ph:i*0.4};});
  function frame(){
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#040810'); g.addColorStop(1,'#081020');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    stars.forEach(function(s){
      var a=0.25+Math.sin(t*1.5+s.ph)*0.25;
      ctx.beginPath(); ctx.arc(s.x,s.y,0.8,0,Math.PI*2);
      ctx.fillStyle='rgba(200,215,255,'+a+')'; ctx.fill();
    });
    var cx=W*0.5,cy=H*0.5,orbitR=H*0.33;
    ctx.beginPath(); ctx.arc(cx,cy,orbitR,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1; ctx.stroke();
    var sg=ctx.createRadialGradient(cx,cy,2,cx,cy,13);
    sg.addColorStop(0,'#fef9c3'); sg.addColorStop(1,'#f59e0b');
    ctx.beginPath(); ctx.arc(cx,cy,13,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill();
    var mx=cx+Math.cos(t*0.55)*orbitR, my=cy+Math.sin(t*0.55)*orbitR;
    ctx.beginPath(); ctx.arc(mx,my,8,0,Math.PI*2);
    ctx.fillStyle='#c8cdd8'; ctx.fill();
    var shadow=(Math.cos(t*0.55+Math.PI)+1)/2;
    ctx.beginPath(); ctx.arc(mx,my,8,0,Math.PI*2);
    ctx.fillStyle='rgba(8,16,32,'+shadow+')'; ctx.fill();
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['carbon-creation'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var orbits = [{r:H*0.27,speed:1,tilt:0,electrons:2},{r:H*0.42,speed:0.65,tilt:1.1,electrons:4}];
  function frame(){
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#050a10'); g.addColorStop(1,'#0a1520');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    var cx=W*0.5,cy=H*0.5;
    var ng=ctx.createRadialGradient(cx,cy,2,cx,cy,15);
    ng.addColorStop(0,'rgba(52,211,153,0.95)'); ng.addColorStop(1,'rgba(13,148,136,0.25)');
    ctx.beginPath(); ctx.arc(cx,cy,15,0,Math.PI*2); ctx.fillStyle=ng; ctx.fill();
    ctx.fillStyle='rgba(210,255,240,0.95)'; ctx.font='bold 12px DM Sans,sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('6',cx,cy);
    orbits.forEach(function(o){
      ctx.save(); ctx.translate(cx,cy); ctx.rotate(o.tilt);
      ctx.beginPath(); ctx.ellipse(0,0,o.r,o.r*0.33,0,0,Math.PI*2);
      ctx.strokeStyle='rgba(52,211,153,0.14)'; ctx.lineWidth=1; ctx.stroke();
      for(var e=0;e<o.electrons;e++){
        var angle=t*o.speed+e/o.electrons*Math.PI*2;
        var ex=Math.cos(angle)*o.r, ey=Math.sin(angle)*o.r*0.33;
        ctx.beginPath(); ctx.arc(ex,ey,3.5,0,Math.PI*2);
        ctx.fillStyle='rgba(52,211,153,0.9)'; ctx.fill();
        ctx.beginPath(); ctx.arc(ex,ey,7,0,Math.PI*2);
        ctx.fillStyle='rgba(52,211,153,0.08)'; ctx.fill();
      }
      ctx.restore();
    });
    t+=0.025; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['chromosomes'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;

  var chromos = [];
  // Left side: Female Diploid (16 pairs = 32 total). We draw 7 distinct pairs to represent density.
  for (var i = 0; i < 7; i++) {
    chromos.push({
      x: W * 0.08 + Math.random() * (W * 0.38),
      y: H * 0.1 + Math.random() * (H * 0.8),
      size: 10 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.15,
      ph: Math.random() * Math.PI * 2,
      paired: true,
      color: 'rgba(245,180,40,' // Warm gold for female
    });
  }
  // Right side: Male Haploid (16 singles). We draw 7 distinct singles.
  for (var i = 0; i < 7; i++) {
    chromos.push({
      x: W * 0.55 + Math.random() * (W * 0.38),
      y: H * 0.1 + Math.random() * (H * 0.8),
      size: 10 + Math.random() * 10,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.18,
      ph: Math.random() * Math.PI * 2,
      paired: false,
      color: 'rgba(200,220,245,' // Cool pale blue/silver for male
    });
  }

  var spindles = [];
  for (var i = 0; i < 12; i++) {
    spindles.push({
      y: (H / 12) * i + Math.random() * 20,
      ph: Math.random() * Math.PI * 2,
      alpha: 0.05 + Math.random() * 0.08
    });
  }

  var particles = [];
  for (var i = 0; i < 40; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.3 + 0.1,
      ph: Math.random() * Math.PI * 2
    });
  }

  function drawChromo(c) {
    var pulse = 0.85 + Math.sin(t * 1.5 + c.ph) * 0.15;
    var col = c.color + pulse + ')';
    
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.rotate(c.rot);

    // Chromosome Glow
    ctx.shadowColor = col;
    ctx.shadowBlur = 14;

    ctx.strokeStyle = col;
    ctx.lineWidth = 3.2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    var s = c.size;

    // Draw X shape (Left arm to Right arm, crossing)
    ctx.beginPath();
    ctx.moveTo(-s, -s * 0.75);
    ctx.quadraticCurveTo(-s*0.2, -s*0.15, 0, 0);
    ctx.quadraticCurveTo(s*0.2, s*0.15, s, s * 0.75);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(s, -s * 0.75);
    ctx.quadraticCurveTo(s*0.2, -s*0.15, 0, 0);
    ctx.quadraticCurveTo(-s*0.2, s*0.15, -s, s * 0.75);
    ctx.stroke();

    // Centromere (Center Dot)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.globalAlpha = 0.9 * pulse;
    ctx.beginPath();
    ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // If paired (Female Diploid), draw sister chromatid next to it
    if (c.paired) {
      ctx.globalAlpha = 0.6 * pulse;
      ctx.shadowColor = col;
      ctx.shadowBlur = 8;
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.8;

      var offX = 9;
      var offY = 9;

      ctx.beginPath();
      ctx.moveTo(-s + offX, -s * 0.75 + offY);
      ctx.quadraticCurveTo(-s*0.2 + offX, -s*0.15 + offY, offX, offY);
      ctx.quadraticCurveTo(s*0.2 + offX, s*0.15 + offY, s + offX, s * 0.75 + offY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(s + offX, -s * 0.75 + offY);
      ctx.quadraticCurveTo(s*0.2 + offX, -s*0.15 + offY, offX, offY);
      ctx.quadraticCurveTo(-s*0.2 + offX, s*0.15 + offY, -s + offX, s * 0.75 + offY);
      ctx.stroke();

      // Kinetochore connections (tiny lines linking the pair at the center)
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(offX, offY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-2, 2); ctx.lineTo(offX - 2, offY + 2);
      ctx.stroke();
      
      ctx.globalAlpha = 1;
    }

    ctx.restore();
  }

  function drawSpindles() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    spindles.forEach(function(sp) {
      var sway = Math.sin(t * 0.8 + sp.ph) * 15;
      var a = sp.alpha + Math.sin(t + sp.ph) * 0.03;
      ctx.strokeStyle = 'rgba(255, 200, 100, ' + a + ')';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(0, sp.y + sway);
      ctx.quadraticCurveTo(W * 0.5, sp.y + sway * 0.5, W, sp.y - sway);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawParticles() {
    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > W + 5) p.x = -5;
      if (p.x < -5) p.x = W + 5;
      if (p.y > H + 5) p.y = -5;
      if (p.y < -5) p.y = H + 5;
      
      var pa = p.alpha + Math.sin(t * 0.5 + p.ph) * 0.1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(180, 160, 120, ' + pa + ')';
      ctx.fill();
    });
  }

  function drawLabels() {
    ctx.save();
    ctx.font = '600 10px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1px';

    // Female Label
    ctx.fillStyle = 'rgba(245, 190, 60, 0.6)';
    ctx.fillText('FEMALE · WORKER', W * 0.25, H - 18);
    ctx.font = '700 12px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(245, 190, 60, 0.85)';
    ctx.fillText('16 PAIRS (32)', W * 0.25, H - 5);

    // Male Label
    ctx.font = '600 10px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(180, 200, 230, 0.6)';
    ctx.fillText('MALE · DRONE', W * 0.75, H - 18);
    ctx.font = '700 12px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(180, 200, 230, 0.85)';
    ctx.fillText('16 SINGLES (16)', W * 0.75, H - 5);

    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Deep cellular background
    var bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.7);
    bg.addColorStop(0, '#0c0a05');
    bg.addColorStop(0.6, '#080604');
    bg.addColorStop(1, '#040302');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle cell membrane
    ctx.beginPath();
    ctx.ellipse(W/2, H/2, W*0.46, H*0.44, 0, 0, Math.PI*2);
    ctx.strokeStyle = 'rgba(255, 200, 100, 0.04)';
    ctx.lineWidth = 2;
    ctx.stroke();

    drawSpindles();
    drawParticles();

    // Update and draw chromosomes
    chromos.forEach(function(c) {
      c.rot += c.rotSpeed;
      c.x += c.vx;
      c.y += c.vy;

      // Soft boundary collision
      if (c.paired && (c.x < W*0.03 || c.x > W*0.47)) c.vx *= -1;
      if (!c.paired && (c.x < W*0.53 || c.x > W*0.97)) c.vx *= -1;
      if (c.y < H*0.05 || c.y > H*0.78) c.vy *= -1;

      drawChromo(c);
    });

    // Central dividing line (Metaphase plate representation)
    ctx.save();
    ctx.setLineDash([4, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W/2, H*0.05);
    ctx.lineTo(W/2, H*0.8);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    drawLabels();

    // Vignette (Matching the honeycomb canvas exactly)
    var vt = ctx.createLinearGradient(0, 0, 0, 35);
    vt.addColorStop(0, 'rgba(11,22,34,0.55)');
    vt.addColorStop(1, 'rgba(11,22,34,0)');
    ctx.fillStyle = vt;
    ctx.fillRect(0, 0, W, 35);

    var vb = ctx.createLinearGradient(0, H - 35, 0, H);
    vb.addColorStop(0, 'rgba(11,22,34,0)');
    vb.addColorStop(1, 'rgba(11,22,34,0.55)');
    ctx.fillStyle = vb;
    ctx.fillRect(0, H - 35, W, 35);

    var vl = ctx.createLinearGradient(0, 0, 35, 0);
    vl.addColorStop(0, 'rgba(11,22,34,0.45)');
    vl.addColorStop(1, 'rgba(11,22,34,0)');
    ctx.fillStyle = vl;
    ctx.fillRect(0, 0, 35, H);

    var vr = ctx.createLinearGradient(W - 35, 0, W, 0);
    vr.addColorStop(0, 'rgba(11,22,34,0)');
    vr.addColorStop(1, 'rgba(11,22,34,0.45)');
    ctx.fillStyle = vr;
    ctx.fillRect(W - 35, 0, 35, H);

    t += 0.015;
    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['dead-sea'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var t = 0;

  function makeRng(seed) {
    var s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  var slY = H * 0.35;
  var dsY = H * 0.72;
  var bL  = W * 0.28, bR = W * 0.72;

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    var sky = ctx.createLinearGradient(0, 0, 0, slY);
    sky.addColorStop(0, '#040810');
    sky.addColorStop(1, '#070f1a');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, slY);

    var rng = makeRng(44);
    for (var i = 0; i < 22; i++) {
      var sx = rng() * W, sy = rng() * slY * 0.9;
      var sa = 0.12 + 0.18 * Math.sin(t * 0.5 + i * 0.8);
      ctx.beginPath();
      ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + sa + ')';
      ctx.fill();
    }

    var eg = ctx.createLinearGradient(0, slY, 0, H);
    eg.addColorStop(0, '#1e2e14');
    eg.addColorStop(1, '#111e0a');
    ctx.fillStyle = eg;
    ctx.beginPath();
    ctx.moveTo(0, slY);
    ctx.lineTo(bL - 40, slY);
    ctx.bezierCurveTo(bL - 14, slY, bL, dsY - 6, bL + 16, dsY);
    ctx.lineTo(bR - 16, dsY);
    ctx.bezierCurveTo(bR, dsY - 6, bR + 14, slY, bR + 40, slY);
    ctx.lineTo(W, slY);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();

    var wg = ctx.createLinearGradient(0, dsY, 0, H);
    wg.addColorStop(0, 'rgba(12,50,90,0.88)');
    wg.addColorStop(1, 'rgba(4,22,50,0.92)');
    ctx.fillStyle = wg;
    ctx.fillRect(bL + 16, dsY, bR - bL - 32, H - dsY);

    var shimBase = dsY + 3;
    ctx.strokeStyle = 'rgba(100,160,215,0.12)';
    ctx.lineWidth = 1;
    var rng2 = makeRng(55);
    for (var j = 0; j < 4; j++) {
      var waveX = bL + 22 + rng2() * (bR - bL - 50);
      var waveW = 18 + rng2() * 30;
      var waveY = shimBase + 2 + rng2() * 6 + 1.5 * Math.sin(t * 1.2 + j * 1.5);
      ctx.beginPath();
      ctx.moveTo(waveX, waveY);
      ctx.lineTo(waveX + waveW, waveY);
      ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(99,155,210,0.40)';
    ctx.lineWidth = 1;
    ctx.setLineDash([8, 6]);
    ctx.beginPath(); ctx.moveTo(0, slY); ctx.lineTo(W, slY); ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = 'rgba(147,197,253,0.42)';
    ctx.font = '500 9px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Sea Level  0 m', 10, slY - 4);

    ctx.strokeStyle = 'rgba(253,186,116,0.45)';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 4]);
    ctx.beginPath();
    ctx.moveTo(bR + 52, slY);
    ctx.lineTo(bR + 52, dsY);
    ctx.stroke();
    ctx.setLineDash([]);

    [slY, dsY].forEach(function(ay) {
      var dir = ay === slY ? 1 : -1;
      ctx.fillStyle = 'rgba(253,186,116,0.50)';
      ctx.beginPath();
      ctx.moveTo(bR + 52, ay + dir * 5);
      ctx.lineTo(bR + 46, ay + dir * 10);
      ctx.lineTo(bR + 58, ay + dir * 10);
      ctx.closePath();
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(254,215,170,0.75)';
    ctx.font = 'bold 10px DM Sans, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('−430 m', bR + 60, (slY + dsY) / 2);

    ctx.fillStyle = 'rgba(253,186,116,0.50)';
    ctx.font = '18px Amiri, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('أَدْنَى الْأَرْضِ', W / 2, dsY + (H - dsY) * 0.5);

    t += 0.016;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['fish'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var fish = Array.from({length:5}, function(_, i) {
    return {x: Math.random()*W, y: H*0.3+Math.random()*H*0.45, sp: 0.5+Math.random()*0.7, sz: 5+Math.random()*7, ph: i*1.3};
  });
  function frame() {
    ctx.clearRect(0,0,W,H);
    var g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#071428'); g.addColorStop(1,'#0a1e3a');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    [0.38,0.52,0.67].forEach(function(yf,i) {
      ctx.beginPath(); ctx.moveTo(0,H);
      for (var x=0;x<=W;x+=3) {
        var wy = H*yf+Math.sin(x*0.017+t*0.7+i)*9+Math.sin(x*0.031+t*1.1+i*2)*5;
        x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
      }
      ctx.lineTo(W,H); ctx.closePath();
      ctx.fillStyle=['rgba(13,71,120,0.45)','rgba(8,50,90,0.55)','rgba(5,30,60,0.75)'][i];
      ctx.fill();
    });
    fish.forEach(function(f) {
      f.x+=f.sp; f.y+=Math.sin(t*1.8+f.ph)*0.4;
      if(f.x>W+20){f.x=-20;f.y=H*0.3+Math.random()*H*0.4;}
      ctx.save(); ctx.translate(f.x,f.y);
      ctx.beginPath(); ctx.ellipse(0,0,f.sz,f.sz*0.45,0,0,Math.PI*2);
      ctx.fillStyle='rgba(52,211,153,0.6)'; ctx.fill();
      ctx.beginPath(); ctx.moveTo(-f.sz,0); ctx.lineTo(-f.sz*1.7,-f.sz*0.5); ctx.lineTo(-f.sz*1.7,f.sz*0.5); ctx.closePath();
      ctx.fillStyle='rgba(52,211,153,0.4)'; ctx.fill();
      ctx.restore();
    });
    t+=0.018; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['gold-melting'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  // Draws an elegant, multi-layered fire tongue pointing "up" in local space
  function drawFlameTongue(dist, height, width, speed, offset) {
    var baseY = dist;
    var tipY = dist + height;
    
    // Sway the tip elegantly
    var tipSway = Math.sin(t * speed + offset) * (width * 0.3);
    var breathe = Math.sin(t * speed * 0.7 + offset) * (height * 0.08);

    // Layer 1: Deep Crimson Outer
    ctx.beginPath();
    ctx.moveTo(-width / 2, baseY);
    ctx.quadraticCurveTo(-width * 0.6, tipY * 0.6 + breathe, tipSway, tipY + breathe);
    ctx.quadraticCurveTo(width * 0.6, tipY * 0.6 + breathe, width / 2, baseY);
    ctx.closePath();
    var g1 = ctx.createLinearGradient(0, baseY, 0, tipY + breathe);
    g1.addColorStop(0, 'rgba(140, 10, 0, 0.9)');
    g1.addColorStop(0.4, 'rgba(200, 30, 0, 0.7)');
    g1.addColorStop(1, 'rgba(200, 50, 0, 0)');
    ctx.fillStyle = g1;
    ctx.fill();

    // Layer 2: Bright Orange Middle
    var mW = width * 0.6;
    var mH = height * 0.75;
    var mTipY = dist + mH;
    var mSway = Math.sin(t * speed + offset) * (mW * 0.2);
    var mBreathe = Math.sin(t * speed * 0.7 + offset) * (mH * 0.06);

    ctx.beginPath();
    ctx.moveTo(-mW / 2, baseY);
    ctx.quadraticCurveTo(-mW * 0.5, mTipY * 0.6 + mBreathe, mSway, mTipY + mBreathe);
    ctx.quadraticCurveTo(mW * 0.5, mTipY * 0.6 + mBreathe, mW / 2, baseY);
    ctx.closePath();
    var g2 = ctx.createLinearGradient(0, baseY, 0, mTipY + mBreathe);
    g2.addColorStop(0, 'rgba(255, 140, 0, 0.95)');
    g2.addColorStop(0.5, 'rgba(255, 200, 50, 0.7)');
    g2.addColorStop(1, 'rgba(255, 220, 100, 0)');
    ctx.fillStyle = g2;
    ctx.fill();

    // Layer 3: White-Hot Core
    var iW = width * 0.25;
    var iH = height * 0.45;
    var iTipY = dist + iH;
    var iSway = Math.sin(t * speed + offset) * (iW * 0.1);

    ctx.beginPath();
    ctx.moveTo(-iW / 2, baseY);
    ctx.quadraticCurveTo(0, iTipY * 0.5, iSway, iTipY);
    ctx.quadraticCurveTo(0, iTipY * 0.5, iW / 2, baseY);
    ctx.closePath();
    var g3 = ctx.createLinearGradient(0, baseY, 0, iTipY);
    g3.addColorStop(0, 'rgba(255, 255, 230, 0.9)');
    g3.addColorStop(1, 'rgba(255, 240, 150, 0)');
    ctx.fillStyle = g3;
    ctx.fill();
  }

  // Draws a perfect 8-pointed star (two overlapping squares)
  function drawStar(cx, cy, radius, rotation, lineW, color, shadowCol, shadowBlur) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (shadowBlur > 0) {
      ctx.shadowColor = shadowCol;
      ctx.shadowBlur = shadowBlur;
    }

    // Square 1
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var a = (Math.PI / 4) + (Math.PI / 2) * i;
      var x = Math.cos(a) * radius;
      var y = Math.sin(a) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Square 2
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var a = (Math.PI / 2) * i;
      var x = Math.cos(a) * radius;
      var y = Math.sin(a) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  function frame() {
    t += 0.012; // Slow, majestic time

    ctx.clearRect(0, 0, W, H);

    // Deep Lapis Lazuli background
    var bg = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, W*0.7);
    bg.addColorStop(0, '#0c1020');
    bg.addColorStop(0.5, '#060a14');
    bg.addColorStop(1, '#020408');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ambient fire glow behind everything
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 140);
    glow.addColorStop(0, 'rgba(255, 120, 20, 0.2)');
    glow.addColorStop(0.5, 'rgba(180, 40, 0, 0.1)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // LAYER 1: THE FIRE FLAMES
    // We position 8 main flames and 8 smaller ones shooting outwards from the center
    ctx.save();
    ctx.translate(W/2, H/2);
    
    for (var i = 0; i < 8; i++) {
      ctx.save();
      // Rotate to the 8 points of the star (0, 45, 90, 135... degrees)
      var angle = (Math.PI / 4) * i;
      ctx.rotate(angle);
      
      // Draw Main Flame (starts at radius 30, shoots out to ~120)
      drawFlameTongue(30, 90, 35, 1.8, i * 1.2);
      
      // Draw Smaller Accent Flame (offset by 22.5 degrees)
      ctx.save();
      ctx.rotate(Math.PI / 8); 
      drawFlameTongue(40, 60, 22, 2.2, i * 1.5 + 5);
      ctx.restore();

      ctx.restore();
    }
    ctx.restore();

    // LAYER 2: BACKGROUND GEOMETRY (Faint, large, counter-rotating for depth)
    drawStar(W/2, H/2, 100, -t * 0.3, 1, 'rgba(180, 140, 50, 0.15)', 'rgba(0,0,0,0)', 0);

    // LAYER 3: MAIN GOLD GEOMETRY (Crisp, glowing)
    var goldGrad = ctx.createLinearGradient(W/2 - 70, H/2 - 70, W/2 + 70, H/2 + 70);
    goldGrad.addColorStop(0, '#B8860B'); 
    goldGrad.addColorStop(0.3, '#FFD700'); 
    goldGrad.addColorStop(0.5, '#FFFACD'); 
    goldGrad.addColorStop(0.7, '#FFD700'); 
    goldGrad.addColorStop(1, '#B8860B'); 
    
    drawStar(W/2, H/2, 70, t * 0.2, 3.5, goldGrad, 'rgba(255, 200, 50, 0.8)', 20);

    // LAYER 4: INNER GEOMETRY
    drawStar(W/2, H/2, 35, -t * 0.4, 2, 'rgba(255, 230, 150, 0.6)', 'rgba(255, 200, 50, 0.5)', 10);

    // LAYER 5: CENTER ORNAMENT
    ctx.beginPath();
    ctx.arc(W/2, H/2, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 230, 150, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(255, 200, 50, 0.6)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(W/2, H/2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFACD';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Vignettes
    var vt = ctx.createLinearGradient(0, 0, 0, 40);
    vt.addColorStop(0, 'rgba(2,4,8,0.8)');
    vt.addColorStop(1, 'rgba(2,4,8,0)');
    ctx.fillStyle = vt; ctx.fillRect(0, 0, W, 40);

    var vb = ctx.createLinearGradient(0, H - 40, 0, H);
    vb.addColorStop(0, 'rgba(2,4,8,0)');
    vb.addColorStop(1, 'rgba(2,4,8,0.8)');
    ctx.fillStyle = vb; ctx.fillRect(0, H - 40, W, 40);

    var vl = ctx.createLinearGradient(0, 0, 40, 0);
    vl.addColorStop(0, 'rgba(2,4,8,0.7)');
    vl.addColorStop(1, 'rgba(2,4,8,0)');
    ctx.fillStyle = vl; ctx.fillRect(0, 0, 40, H);

    var vr = ctx.createLinearGradient(W - 40, 0, W, 0);
    vr.addColorStop(0, 'rgba(2,4,8,0)');
    vr.addColorStop(1, 'rgba(2,4,8,0.7)');
    ctx.fillStyle = vr; ctx.fillRect(W - 40, 0, 40, H);

    requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['hell-paradise'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  
  // Hellfire Embers (Left Side)
  var embers = [];
  for (var i = 0; i < 60; i++) {
    embers.push({
      x: Math.random() * (W / 2 - 30) + 10,
      y: H - Math.random() * H,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -Math.random() * 1.2 - 0.4,
      r: Math.random() * 3 + 0.5,
      life: Math.random(),
      decay: 0.001 + Math.random() * 0.003
    });
  }

  // Paradise Lights (Right Side)
  var lights = [];
  for (var i = 0; i < 45; i++) {
    lights.push({
      x: (W / 2 + 30) + Math.random() * (W / 2 - 40),
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.2,
      vy: Math.random() * 0.3 + 0.1,
      r: Math.random() * 2.5 + 0.5,
      ph: Math.random() * Math.PI * 2
    });
  }

  function drawHellFire() {
    // Jagged terrain base
    ctx.beginPath();
    ctx.moveTo(0, H);
    for (var x = 0; x <= W / 2; x += 4) {
      var jaggedness = Math.sin(x * 0.15 + t * 4) * 12 + Math.sin(x * 0.05 + t * 2) * 20;
      ctx.lineTo(x, H * 0.6 + jaggedness);
    }
    ctx.lineTo(W / 2, H);
    ctx.closePath();

    var fireGrad = ctx.createLinearGradient(0, H * 0.5, 0, H);
    fireGrad.addColorStop(0, 'rgba(255, 100, 0, 0.9)');
    fireGrad.addColorStop(0.4, 'rgba(200, 30, 0, 0.8)');
    fireGrad.addColorStop(1, 'rgba(40, 5, 0, 1)');
    ctx.fillStyle = fireGrad;
    ctx.fill();

    // Deep glow at the bottom
    var deepGlow = ctx.createRadialGradient(W * 0.25, H, 10, W * 0.25, H, H * 0.8);
    deepGlow.addColorStop(0, 'rgba(255, 60, 0, 0.3)');
    deepGlow.addColorStop(1, 'rgba(255, 60, 0, 0)');
    ctx.fillStyle = deepGlow;
    ctx.fillRect(0, 0, W / 2, H);

    // Embers
    embers.forEach(function(e) {
      e.x += e.vx + Math.sin(t * 2 + e.y * 0.1) * 0.4;
      e.y += e.vy;
      e.life -= e.decay;

      if (e.life <= 0 || e.y < -10) {
        e.x = Math.random() * (W / 2 - 30) + 10;
        e.y = H * 0.6 + Math.random() * 40;
        e.life = 1;
        e.vy = -Math.random() * 1.2 - 0.4;
      }

      var a = e.life;
      var r = e.r * e.life;
      ctx.beginPath();
      ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
      var eg = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
      eg.addColorStop(0, 'rgba(255, 255, 150, ' + a + ')');
      eg.addColorStop(0.4, 'rgba(255, 120, 0, ' + (a * 0.8) + ')');
      eg.addColorStop(1, 'rgba(150, 20, 0, 0)');
      ctx.fillStyle = eg;
      ctx.fill();
    });
  }

  function drawParadise() {
    // Flowing rivers and terrain base
    ctx.beginPath();
    ctx.moveTo(W / 2, H);
    for (var x = W / 2; x <= W; x += 4) {
      var flow = Math.sin(x * 0.03 + t * 0.8) * 15 + Math.sin(x * 0.08 + t * 1.2) * 8;
      ctx.lineTo(x, H * 0.65 + flow);
    }
    ctx.lineTo(W, H);
    ctx.closePath();

    var greenGrad = ctx.createLinearGradient(W / 2, H * 0.5, W, H);
    greenGrad.addColorStop(0, 'rgba(15, 80, 40, 0.9)');
    greenGrad.addColorStop(0.5, 'rgba(10, 60, 30, 0.8)');
    greenGrad.addColorStop(1, 'rgba(5, 30, 15, 1)');
    ctx.fillStyle = greenGrad;
    ctx.fill();

    // River streams cutting through
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    for (var r = 0; r < 3; r++) {
      ctx.beginPath();
      var ry = H * 0.75 + r * 15;
      ctx.moveTo(W / 2, ry);
      for (var x = W / 2; x <= W; x += 5) {
        ctx.lineTo(x, ry + Math.sin(x * 0.05 + t * 1.5 + r * 2) * 6);
      }
      ctx.strokeStyle = 'rgba(180, 230, 255, ' + (0.12 - r * 0.03) + ')';
      ctx.lineWidth = 4 - r;
      ctx.stroke();
    }
    ctx.restore();

    // Ethereal top glow
    var topGlow = ctx.createRadialGradient(W * 0.75, 0, 10, W * 0.75, 0, H * 0.8);
    topGlow.addColorStop(0, 'rgba(200, 255, 220, 0.15)');
    topGlow.addColorStop(1, 'rgba(200, 255, 220, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(W / 2, 0, W / 2, H);

    // Floating lights/petals
    lights.forEach(function(l) {
      l.x += l.vx + Math.sin(t * 0.5 + l.ph) * 0.15;
      l.y += l.vy;

      if (l.y > H + 10) {
        l.y = -10;
        l.x = (W / 2 + 30) + Math.random() * (W / 2 - 40);
      }

      var pulse = 0.6 + Math.sin(t * 1.2 + l.ph) * 0.4;
      ctx.beginPath();
      ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
      var lg = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r * 2.5);
      lg.addColorStop(0, 'rgba(255, 250, 200, ' + (pulse * 0.8) + ')');
      lg.addColorStop(0.5, 'rgba(100, 255, 150, ' + (pulse * 0.4) + ')');
      lg.addColorStop(1, 'rgba(100, 255, 150, 0)');
      ctx.fillStyle = lg;
      ctx.fill();
    });
  }

  function drawMizan() {
    var cx = W / 2;
    var cy = H / 2;
    
    // Center divider glow
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var divGlow = ctx.createLinearGradient(cx - 15, 0, cx + 15, 0);
    divGlow.addColorStop(0, 'rgba(255, 50, 0, 0)');
    divGlow.addColorStop(0.4, 'rgba(255, 255, 255, 0.1)');
    divGlow.addColorStop(0.6, 'rgba(255, 255, 255, 0.1)');
    divGlow.addColorStop(1, 'rgba(0, 255, 100, 0)');
    ctx.fillStyle = divGlow;
    ctx.fillRect(cx - 15, 0, 30, H);
    ctx.restore();

    ctx.save();
    ctx.translate(cx, cy);

    // The Pillar
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(-1.5, -40, 3, 80);

    // The Beam
    ctx.rotate(Math.sin(t * 0.8) * 0.04); // Slight subtle sway
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.fillRect(-35, -2.5, 70, 5);

    // Left Plate (Hell - dipping slightly)
    ctx.save();
    ctx.translate(-35, 0);
    ctx.rotate(0.1 + Math.sin(t * 0.8) * 0.04);
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-12, 12);
    ctx.lineTo(12, 12);
    ctx.lineTo(15, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 80, 20, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 120, 50, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Fire on the plate
    ctx.beginPath();
    ctx.arc(0, 6, 4 + Math.sin(t * 3) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 150, 0, 0.6)';
    ctx.fill();
    ctx.restore();

    // Right Plate (Paradise - rising slightly)
    ctx.save();
    ctx.translate(35, 0);
    ctx.rotate(-0.1 - Math.sin(t * 0.8) * 0.04);
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(-12, 12);
    ctx.lineTo(12, 12);
    ctx.lineTo(15, 0);
    ctx.closePath();
    ctx.fillStyle = 'rgba(50, 200, 100, 0.4)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(100, 255, 150, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Light on the plate
    ctx.beginPath();
    ctx.arc(0, 6, 4 + Math.sin(t * 2 + 1) * 1.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200, 255, 220, 0.6)';
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  function drawLabels() {
    ctx.save();
    ctx.font = '700 11px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.letterSpacing = '1.5px';

    // Hell Label
    ctx.fillStyle = 'rgba(255, 100, 50, 0.7)';
    ctx.fillText('JAHANNAM', W * 0.25, H - 15);
    ctx.font = '500 9px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(255, 100, 50, 0.5)';
    ctx.fillText('THE FIRE', W * 0.25, H - 4);

    // Heaven Label
    ctx.font = '700 11px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(150, 255, 180, 0.7)';
    ctx.fillText('JANNAH', W * 0.75, H - 15);
    ctx.font = '500 9px "DM Sans", sans-serif';
    ctx.fillStyle = 'rgba(150, 255, 180, 0.5)';
    ctx.fillText('THE GARDENS', W * 0.75, H - 4);

    ctx.restore();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);

    // Base background split
    var bgLeft = ctx.createLinearGradient(0, 0, W / 2, 0);
    bgLeft.addColorStop(0, '#150200');
    bgLeft.addColorStop(1, '#0a0100');
    ctx.fillStyle = bgLeft;
    ctx.fillRect(0, 0, W / 2, H);

    var bgRight = ctx.createLinearGradient(W / 2, 0, W, 0);
    bgRight.addColorStop(0, '#000a04');
    bgRight.addColorStop(1, '#001508');
    ctx.fillStyle = bgRight;
    ctx.fillRect(W / 2, 0, W / 2, H);

    // Draw layers
    drawHellFire();
    drawParadise();
    drawMizan();
    drawLabels();

    // Matching Vignettes
    var vt = ctx.createLinearGradient(0, 0, 0, 35);
    vt.addColorStop(0, 'rgba(11,22,34,0.55)');
    vt.addColorStop(1, 'rgba(11,22,34,0)');
    ctx.fillStyle = vt;
    ctx.fillRect(0, 0, W, 35);

    var vb = ctx.createLinearGradient(0, H - 35, 0, H);
    vb.addColorStop(0, 'rgba(11,22,34,0)');
    vb.addColorStop(1, 'rgba(11,22,34,0.55)');
    ctx.fillStyle = vb;
    ctx.fillRect(0, H - 35, W, 35);

    var vl = ctx.createLinearGradient(0, 0, 35, 0);
    vl.addColorStop(0, 'rgba(11,22,34,0.45)');
    vl.addColorStop(1, 'rgba(11,22,34,0)');
    ctx.fillStyle = vl;
    ctx.fillRect(0, 0, 35, H);

    var vr = ctx.createLinearGradient(W - 35, 0, W, 0);
    vr.addColorStop(0, 'rgba(11,22,34,0)');
    vr.addColorStop(1, 'rgba(11,22,34,0.45)');
    ctx.fillStyle = vr;
    ctx.fillRect(W - 35, 0, 35, H);

    t += 0.02;
    requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['human-embryo'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t)  { return t * t * t; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var ALAQA_HOLD   = 210;
  var FADE_OUT     = 80;
  var GAP          = 18;
  var MUDGHA_IN    = 55;
  var SOMITE_BUILD = 160;
  var MUDGHA_HOLD  = 110;
  var FADE_OUT2    = 80;
  var TOTAL = ALAQA_HOLD + FADE_OUT + GAP + MUDGHA_IN + SOMITE_BUILD + MUDGHA_HOLD + FADE_OUT2;

  var NUM_SOMITES = 7;
  var CX = W * 0.42, CY = H * 0.5;
  var WALL_X = W * 0.8;
  var frame = 0;

  function drawWall(alpha) {
    var grad = ctx.createLinearGradient(WALL_X - 24, 0, W, 0);
    grad.addColorStop(0,   'rgba(253,186,116,0)');
    grad.addColorStop(0.2, 'rgba(130,68,20,' + (alpha * 0.16) + ')');
    grad.addColorStop(1,   'rgba(90,40,10,' + (alpha * 0.28) + ')');
    ctx.fillStyle = grad;
    ctx.fillRect(WALL_X - 24, 0, W - WALL_X + 24, H);
    for (var y = 7; y < H; y += 11) {
      ctx.beginPath();
      ctx.moveTo(WALL_X, y + Math.sin(y * 0.22) * 2);
      ctx.bezierCurveTo(WALL_X + 18, y, WALL_X + 28, y + 2, W - 2, y + Math.sin(y * 0.35 + frame * 0.01) * 2);
      ctx.strokeStyle = 'rgba(253,186,116,' + (alpha * 0.045) + ')';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }
  }

  function leechSpine(undulate) {
    var N = 80, bodyLen = 112;
    var pts = [];
    var x0 = CX - bodyLen * 0.38;
    for (var i = 0; i <= N; i++) {
      var t = i / N;
      var x = x0 + t * bodyLen;
      var arc  = Math.sin(t * Math.PI) * 5.5;
      var wave = undulate * (1 - t * 0.72) * Math.sin(frame * 0.046 - t * 5.8);
      var y    = CY - arc + wave;
      var env  = Math.pow(t, 0.52) * Math.pow(1 - t, 0.38) * 2.35;
      pts.push({ x: x, y: y, thick: 21 * env, t: t });
    }
    return pts;
  }

  function drawAlaqa(pts, alpha) {
    ctx.save();
    var mid = pts[Math.floor(pts.length * 0.32)];
    var glow = ctx.createRadialGradient(mid.x, mid.y, 0, mid.x, mid.y, 62);
    glow.addColorStop(0, 'rgba(253,186,116,' + (alpha * 0.13) + ')');
    glow.addColorStop(1, 'rgba(253,186,116,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(mid.x, mid.y, 62, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y - pts[0].thick);
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i], pp = pts[i - 1];
      var mx = (pp.x + p.x) / 2, my = (pp.y - pp.thick + p.y - p.thick) / 2;
      ctx.quadraticCurveTo(pp.x, pp.y - pp.thick, mx, my);
    }
    var last = pts[pts.length - 1];
    ctx.lineTo(last.x, last.y);
    for (var i = pts.length - 1; i >= 1; i--) {
      var p = pts[i], pp = pts[i - 1];
      var mx = (pp.x + p.x) / 2, my = (pp.y + pp.thick + p.y + p.thick) / 2;
      ctx.quadraticCurveTo(p.x, p.y + p.thick, mx, my);
    }
    ctx.closePath();

    var gx = ctx.createLinearGradient(pts[0].x, 0, last.x, 0);
    gx.addColorStop(0,    'rgba(80,38,8,' + (alpha * 0.08) + ')');
    gx.addColorStop(0.14, 'rgba(210,118,45,' + (alpha * 0.30) + ')');
    gx.addColorStop(0.40, 'rgba(254,215,170,' + (alpha * 0.56) + ')');
    gx.addColorStop(0.72, 'rgba(253,186,116,' + (alpha * 0.44) + ')');
    gx.addColorStop(1,    'rgba(170,90,30,' + (alpha * 0.28) + ')');
    ctx.fillStyle = gx;
    ctx.fill();

    ctx.beginPath();
    for (var i = 4; i < pts.length - 4; i++) {
      var p = pts[i];
      i === 4 ? ctx.moveTo(p.x, p.y - p.thick * 0.72) : ctx.lineTo(p.x, p.y - p.thick * 0.72);
    }
    ctx.strokeStyle = 'rgba(255,242,220,' + (alpha * 0.18) + ')';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    for (var s = 1; s <= 8; s++) {
      var idx = Math.floor(pts.length * (0.06 + s * 0.105));
      if (idx >= pts.length) continue;
      var p = pts[idx];
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.thick * 0.78);
      ctx.lineTo(p.x, p.y + p.thick * 0.78);
      ctx.strokeStyle = 'rgba(180,100,35,' + (alpha * 0.11) + ')';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    ctx.restore();

    var attachY = CY + Math.sin(frame * 0.027) * 3;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.bezierCurveTo(last.x + 14, last.y, WALL_X - 12, attachY, WALL_X, attachY);
    ctx.strokeStyle = 'rgba(253,186,116,' + (alpha * 0.42) + ')';
    ctx.lineWidth = 1.3;
    ctx.stroke();

    var pr = 3.6 + Math.sin(frame * 0.16) * 1.1;
    ctx.beginPath();
    ctx.arc(WALL_X, attachY, pr, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(254,215,170,' + (alpha * 0.65) + ')';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(WALL_X, attachY, pr + 5 + Math.sin(frame * 0.16) * 3, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(253,186,116,' + (alpha * 0.18) + ')';
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }

  function drawMudgha(somiteP, alpha) {
    var bodyLen = 98, bodyThick = 20;
    var x0 = CX - bodyLen * 0.5;
    var N  = 100;

    function env(t) { return Math.sin(t * Math.PI); }

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x0, CY);
    for (var i = 0; i <= N; i++) {
      var t  = i / N;
      var x  = x0 + t * bodyLen;
      var baseY = CY - bodyThick * env(t);
      var dip = 0;
      for (var s = 0; s < NUM_SOMITES; s++) {
        var sc = (s + 0.5) / NUM_SOMITES;
        var dist = Math.abs(t - sc);
        var sP = clamp((somiteP * NUM_SOMITES - s) / 1.1, 0, 1);
        if (dist < 0.08) dip += easeOut(sP) * bodyThick * 0.46 * Math.pow(1 - dist / 0.08, 1.8);
      }
      ctx.lineTo(x, baseY + dip);
    }
    for (var i = N; i >= 0; i--) {
      var t = i / N;
      ctx.lineTo(x0 + t * bodyLen, CY + bodyThick * env(t));
    }
    ctx.closePath();

    var gx = ctx.createLinearGradient(x0, 0, x0 + bodyLen, 0);
    gx.addColorStop(0,    'rgba(80,38,8,' + (alpha * 0.06) + ')');
    gx.addColorStop(0.12, 'rgba(210,118,45,' + (alpha * 0.30) + ')');
    gx.addColorStop(0.50, 'rgba(254,215,170,' + (alpha * 0.55) + ')');
    gx.addColorStop(0.88, 'rgba(210,118,45,' + (alpha * 0.30) + ')');
    gx.addColorStop(1,    'rgba(80,38,8,' + (alpha * 0.06) + ')');
    ctx.fillStyle = gx;
    ctx.fill();

    ctx.beginPath();
    for (var i = 5; i <= N - 5; i++) {
      var t = i / N;
      var x = x0 + t * bodyLen;
      var y = CY + bodyThick * env(t) * 0.62;
      i === 5 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(255,238,210,' + (alpha * 0.14) + ')';
    ctx.lineWidth = 1.1;
    ctx.stroke();

    for (var s = 0; s < NUM_SOMITES; s++) {
      var sP  = clamp((somiteP * NUM_SOMITES - s) / 1.1, 0, 1);
      if (sP <= 0.02) continue;
      var sc  = (s + 0.5) / NUM_SOMITES;
      var x   = x0 + sc * bodyLen;
      var e   = env(sc);
      var bite = easeOut(sP) * bodyThick * 0.46;
      var topY = CY - bodyThick * e + bite;
      var botY = CY + bodyThick * e * 0.88;

      ctx.beginPath();
      ctx.moveTo(x, topY + 1.5);
      ctx.lineTo(x, lerp(topY, botY, 0.55));
      ctx.strokeStyle = 'rgba(150,75,22,' + (alpha * sP * 0.24) + ')';
      ctx.lineWidth = 0.9;
      ctx.stroke();

      [-5.5, 5.5].forEach(function(dx) {
        ctx.beginPath();
        ctx.arc(x + dx, topY - 1.5, 2.8 * e * sP, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(254,215,170,' + (alpha * sP * 0.20) + ')';
        ctx.fill();
      });
    }

    var glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, 58);
    glow.addColorStop(0, 'rgba(253,186,116,' + (alpha * 0.10) + ')');
    glow.addColorStop(1, 'rgba(253,186,116,0)');
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(CX, CY, 58, 0, Math.PI * 2); ctx.fill();

    ctx.restore();
  }

  function drawLabel(arabic, latin, alpha) {
    if (alpha <= 0.02) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '400 12px Amiri, serif';
    ctx.fillStyle = 'rgba(254,215,170,0.62)';
    ctx.fillText(arabic, W * 0.42, H - 15);
    ctx.font = '500 8.5px DM Sans, sans-serif';
    ctx.fillStyle = 'rgba(253,186,116,0.42)';
    ctx.fillText(latin, W * 0.42, H - 4);
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    var atm = ctx.createRadialGradient(CX, CY, 0, CX, CY, 190);
    atm.addColorStop(0, 'rgba(32,15,4,0.52)');
    atm.addColorStop(1, 'rgba(4,8,16,0)');
    ctx.fillStyle = atm; ctx.fillRect(0, 0, W, H);

    var f = frame % TOTAL;
    var T1 = ALAQA_HOLD;
    var T2 = T1 + FADE_OUT;
    var T3 = T2 + GAP;
    var T4 = T3 + MUDGHA_IN;
    var T5 = T4 + SOMITE_BUILD + MUDGHA_HOLD;
    var T6 = T5 + FADE_OUT2;

    if (f < T2) {
      var aIn  = f < 50 ? easeOut(f / 50) : 1;
      var aOut = f >= T1 ? (1 - easeIn((f - T1) / FADE_OUT)) : 1;
      var al   = aIn * aOut;
      var und  = lerp(0, 9, clamp(f / 70, 0, 1));
      drawWall(al);
      drawAlaqa(leechSpine(und), al);
      drawLabel('عَلَقَةً', 'ALAQA · LEECH', al);
    } else if (f >= T3 && f < T6) {
      var elapsed = f - T3;
      var aIn  = elapsed < MUDGHA_IN ? easeOut(elapsed / MUDGHA_IN) : 1;
      var aOut = f >= T5 ? (1 - easeIn((f - T5) / FADE_OUT2)) : 1;
      var al   = aIn * aOut;
      var sP   = elapsed < MUDGHA_IN ? 0 : clamp((elapsed - MUDGHA_IN) / SOMITE_BUILD, 0, 1);
      drawMudgha(sP, al);
      drawLabel('مُضْغَةً', 'MUDGHA · CHEWED', al);
    }

    frame++;
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['internal-mountains'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;

  var pulses = [0, 0.28, 0.56, 0.82].map(function(offset) {
    return { frac: offset };
  });

  var peaks = [
    [0.08, 10], [0.18, 8], [0.28, 13], [0.40, 9],
    [0.50, 11], [0.62, 8], [0.72, 12], [0.84, 9], [0.92, 7]
  ];

  function drawHero() {
    ctx.fillStyle = '#040810'; ctx.fillRect(0, 0, W, H);

    var layers = [
      ['rgba(72,88,48,0.80)',  0.00, 0.12],
      ['rgba(130,55,22,0.65)', 0.12, 0.46],
      ['rgba(150,40,12,0.55)', 0.46, 0.82],
      ['rgba(58,10,5,0.65)',   0.82, 1.00]
    ];
    layers.forEach(function(l) {
      ctx.fillStyle = l[0];
      ctx.fillRect(0, Math.round(l[1] * H), W, Math.round((l[2] - l[1]) * H));
    });

    ctx.beginPath();
    ctx.fillStyle = 'rgba(55,70,35,0.90)';
    ctx.fillRect(0, 0, W, Math.round(0.12 * H));
    ctx.beginPath();
    ctx.moveTo(0, Math.round(0.12 * H));
    ctx.quadraticCurveTo(W / 2, Math.round(0.08 * H) + 4, W, Math.round(0.12 * H));
    ctx.lineTo(W, 0); ctx.lineTo(0, 0); ctx.closePath();
    ctx.fillStyle = 'rgba(60,78,40,0.75)';
    ctx.fill();

    ctx.font = '600 9px DM Sans, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.textAlign = 'left';
    ctx.fillText('SURFACE', 8, 10);

    var mY = Math.round(0.68 * H);
    ctx.shadowColor = 'rgba(45,212,191,0.7)'; ctx.shadowBlur = 10;
    ctx.fillStyle = '#2dd4bf';
    peaks.forEach(function(pk) {
      var px = Math.round(pk[0] * W), ph = pk[1];
      ctx.beginPath();
      ctx.moveTo(px, mY);
      ctx.lineTo(px - ph * 0.55, mY - ph);
      ctx.lineTo(px + ph * 0.55, mY - ph);
      ctx.closePath();
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    ctx.font = '600 9px DM Sans, sans-serif';
    ctx.fillStyle = 'rgba(45,212,191,0.60)';
    ctx.textAlign = 'left';
    ctx.fillText('410 mi', 8, mY - 2);

    pulses.forEach(function(pulse) {
      if (pulse.frac < 0 || pulse.frac > 1) return;
      var py = Math.round(pulse.frac * H);
      var grd = ctx.createLinearGradient(0, py - 2, 0, py + 2);
      grd.addColorStop(0, 'transparent');
      grd.addColorStop(0.5, 'rgba(255,255,255,0.55)');
      grd.addColorStop(1, 'transparent');
      ctx.fillStyle = grd;
      ctx.fillRect(0, py - 2, W, 4);
    });

    ctx.strokeStyle = 'rgba(45,212,191,0.20)'; ctx.lineWidth = 1;
    ctx.setLineDash([5, 8]);
    ctx.beginPath(); ctx.moveTo(0, mY); ctx.lineTo(W, mY); ctx.stroke();
    ctx.setLineDash([]);
  }

  function animate() {
    pulses.forEach(function(pulse) {
      pulse.frac += 0.004;
      if (pulse.frac > 1.1) pulse.frac = -0.05;
    });
    drawHero();
    rafId = requestAnimationFrame(animate);
  }

  rafId = requestAnimationFrame(animate);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['iron'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var t = 0;

  function makeRng(seed) {
    var s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  var particles = [];
  (function() {
    var rng = makeRng(31);
    for (var i = 0; i < 22; i++) {
      particles.push({
        x: rng() * W,
        y: rng() * H,
        vx: -0.35 - rng() * 0.5,
        vy:  0.20 + rng() * 0.35,
        r:   0.9 + rng() * 1.6,
        phase: rng() * Math.PI * 2
      });
    }
  })();

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    var rng = makeRng(88);
    for (var i = 0; i < 28; i++) {
      var sx = rng() * W, sy = rng() * H;
      var sa = 0.10 + 0.18 * Math.sin(t * 0.4 + i * 0.7);
      ctx.beginPath();
      ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + sa + ')';
      ctx.fill();
    }

    var sx2 = W * 0.84, sy2 = H * 0.22;
    var starPulse = 0.7 + 0.25 * Math.sin(t * 1.5);
    var sg = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, 38);
    sg.addColorStop(0, 'rgba(253,200,100,' + (0.55 * starPulse) + ')');
    sg.addColorStop(0.4, 'rgba(251,113,133,' + (0.20 * starPulse) + ')');
    sg.addColorStop(1, 'rgba(251,113,133,0)');
    ctx.fillStyle = sg;
    ctx.fillRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(sx2, sy2, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,230,140,' + (0.85 * starPulse) + ')';
    ctx.fill();

    var cx = W * 0.5, cy = H * 0.50;
    var glowPulse = 0.65 + 0.22 * Math.sin(t * 1.1);

    var gg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 65);
    gg.addColorStop(0, 'rgba(251,113,133,' + (0.18 * glowPulse) + ')');
    gg.addColorStop(1, 'rgba(251,113,133,0)');
    ctx.fillStyle = gg;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(253,164,175,' + (0.80 + 0.15 * Math.sin(t * 0.9)) + ')';
    ctx.font = 'bold 54px Playfair Display, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Fe', cx, cy - 6);

    ctx.fillStyle = 'rgba(253,164,175,0.48)';
    ctx.font = '500 12px DM Sans, sans-serif';
    ctx.fillText('26', cx + 30, cy + 22);

    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0)  p.x = W;
      if (p.y > H)  p.y = 0;
      var pa = 0.25 + 0.45 * Math.sin(t * 0.9 + p.phase);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(251,113,133,' + Math.max(0, pa) + ')';
      ctx.fill();
    });

    ctx.fillStyle = 'rgba(122,143,163,0.30)';
    ctx.font = '10px DM Sans, sans-serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('Surah Al-Ḥadīd · Chapter 57', W - 14, H - 9);

    t += 0.017;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['life-death'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, offset = 0;
  var BEAT = [0,0,0,0,0,0,0,1,3,8,-15,28,-6,2,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
  var BL = BEAT.length;
  function frame() {
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#050c14'); g.addColorStop(1,'#0a1825');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle='rgba(255,255,255,0.035)'; ctx.lineWidth=1;
    for(var x=0;x<W;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
    for(var y=0;y<H;y+=25){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    ctx.beginPath();
    for(var i=0;i<W;i++) {
      var bi=Math.floor((i+offset)/3)%BL;
      var py=H*0.52-BEAT[bi]*H*0.009;
      i===0?ctx.moveTo(i,py):ctx.lineTo(i,py);
    }
    ctx.strokeStyle='rgba(74,222,128,0.9)'; ctx.lineWidth=2;
    ctx.shadowColor='rgba(74,222,128,0.6)'; ctx.shadowBlur=10;
    ctx.stroke(); ctx.shadowBlur=0;
    ctx.beginPath(); ctx.moveTo(0,H*0.72); ctx.lineTo(W,H*0.72);
    ctx.strokeStyle='rgba(167,139,250,0.18)'; ctx.lineWidth=1.5; ctx.stroke();
    offset+=2; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['lightning-1313'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var boltTimer = 0, boltInterval = 130, bolt = null, boltAlpha = 0;
  function makeBolt() {
    var pts = [], x = W*0.3+Math.random()*W*0.4, y = 0;
    while(y < H+10) { pts.push({x:x,y:y}); x+=Math.random()*28-14; y+=8+Math.random()*14; }
    return pts;
  }
  function frame() {
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#060b16'); g.addColorStop(0.6,'#0c1520'); g.addColorStop(1,'#111d2c');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    [[0.18,0.22,32,20],[0.42,0.18,40,25],[0.68,0.24,35,22],[0.85,0.2,28,18]].forEach(function(cl) {
      ctx.beginPath(); ctx.arc(W*cl[0],H*cl[1]+Math.sin(t*0.3+cl[0]*5)*3,cl[2],0,Math.PI*2);
      ctx.fillStyle='rgba(28,38,52,0.7)'; ctx.fill();
      ctx.beginPath(); ctx.arc(W*cl[0]+cl[2]*0.6,H*cl[1]+Math.sin(t*0.4+cl[0]*3)*2,cl[3],0,Math.PI*2);
      ctx.fillStyle='rgba(32,42,58,0.5)'; ctx.fill();
    });
    if(boltTimer===0){bolt=makeBolt();boltAlpha=1;}
    if(bolt&&boltAlpha>0){
      ctx.save();
      ctx.beginPath(); ctx.moveTo(bolt[0].x,bolt[0].y);
      bolt.forEach(function(p){ctx.lineTo(p.x,p.y);});
      ctx.strokeStyle='rgba(220,235,255,'+boltAlpha+')'; ctx.lineWidth=2.5;
      ctx.shadowColor='rgba(140,170,255,'+boltAlpha+')'; ctx.shadowBlur=22;
      ctx.stroke();
      ctx.strokeStyle='rgba(140,170,255,'+(boltAlpha*0.25)+')'; ctx.lineWidth=10; ctx.stroke();
      ctx.shadowBlur=0; ctx.restore();
      boltAlpha=Math.max(0,boltAlpha-0.045);
    }
    boltTimer=(boltTimer+1)%boltInterval;
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['man-woman-chromosomes'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  function drawX(cx,cy,r,col,ang){
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang);
    ctx.strokeStyle=col; ctx.lineWidth=r*0.4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-r*0.5,-r*0.5); ctx.lineTo(r*0.5,r*0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r*0.5,-r*0.5); ctx.lineTo(-r*0.5,r*0.5); ctx.stroke();
    ctx.restore();
  }
  function drawY(cx,cy,r,col,ang){
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(ang);
    ctx.strokeStyle=col; ctx.lineWidth=r*0.4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-r*0.5,-r*0.5); ctx.lineTo(0,0); ctx.lineTo(r*0.5,-r*0.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,r*0.55); ctx.stroke();
    ctx.restore();
  }
  function frame(){
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#06091a'); g.addColorStop(1,'#0c1228');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    var bob=Math.sin(t*1.2)*5;
    drawX(W*0.31-10,H*0.48+bob,16,'rgba(96,165,250,0.8)',Math.sin(t*0.5)*0.1);
    drawY(W*0.31+12,H*0.48-bob,14,'rgba(96,165,250,0.55)',Math.sin(t*0.5+1)*0.12);
    ctx.fillStyle='rgba(147,197,253,0.7)'; ctx.font='bold 11px DM Sans,sans-serif'; ctx.textAlign='center';
    ctx.fillText('XY',W*0.31,H*0.82);
    drawX(W*0.69-10,H*0.48+bob,16,'rgba(244,114,182,0.8)',Math.sin(t*0.5)*0.1);
    drawX(W*0.69+12,H*0.48-bob,16,'rgba(244,114,182,0.55)',Math.sin(t*0.5+1)*0.12);
    ctx.fillStyle='rgba(249,168,212,0.7)'; ctx.fillText('XX',W*0.69,H*0.82);
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['man-woman'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  function frame(){
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#080e1a'); g.addColorStop(1,'#0d1628');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    var cx1=W*0.33, cx2=W*0.67, cy=H*0.48;
    var pulse=1+Math.sin(t*1.5)*0.04;
    var mg=ctx.createRadialGradient(cx1,cy,4,cx1,cy,40*pulse);
    mg.addColorStop(0,'rgba(96,165,250,0.55)'); mg.addColorStop(1,'rgba(59,130,246,0)');
    ctx.beginPath(); ctx.arc(cx1,cy,40*pulse,0,Math.PI*2); ctx.fillStyle=mg; ctx.fill();
    ctx.beginPath(); ctx.arc(cx1,cy,24*pulse,0,Math.PI*2);
    ctx.strokeStyle='rgba(96,165,250,0.75)'; ctx.lineWidth=2; ctx.stroke();
    var wg=ctx.createRadialGradient(cx2,cy,4,cx2,cy,40*pulse);
    wg.addColorStop(0,'rgba(244,114,182,0.55)'); wg.addColorStop(1,'rgba(236,72,153,0)');
    ctx.beginPath(); ctx.arc(cx2,cy,40*pulse,0,Math.PI*2); ctx.fillStyle=wg; ctx.fill();
    ctx.beginPath(); ctx.arc(cx2,cy,24*pulse,0,Math.PI*2);
    ctx.strokeStyle='rgba(244,114,182,0.75)'; ctx.lineWidth=2; ctx.stroke();
    var ca=0.12+Math.sin(t*2)*0.08;
    ctx.beginPath(); ctx.moveTo(cx1+24,cy); ctx.lineTo(cx2-24,cy);
    ctx.strokeStyle='rgba(200,210,255,'+ca+')'; ctx.lineWidth=1; ctx.stroke();
    ctx.font='500 13px DM Sans,sans-serif'; ctx.textAlign='center';
    ctx.fillStyle='rgba(147,197,253,0.75)'; ctx.fillText('رَجُل',cx1,cy+48);
    ctx.fillStyle='rgba(249,168,212,0.75)'; ctx.fillText('امْرَأَة',cx2,cy+48);
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['moon-landing'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var stars = Array.from({length:38},function(_,i){return{x:(i*137.5)%W,y:(i*89.3)%(H*0.65),ph:i*0.4};});
  function frame(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#040810'; ctx.fillRect(0,0,W,H);
    stars.forEach(function(s){
      var a=0.2+Math.sin(t*1.2+s.ph)*0.2;
      ctx.beginPath(); ctx.arc(s.x,s.y,0.7,0,Math.PI*2);
      ctx.fillStyle='rgba(200,215,255,'+a+')'; ctx.fill();
    });
    var moonY=H*0.65;
    ctx.beginPath(); ctx.moveTo(0,moonY);
    for(var x=0;x<=W;x+=3){var y=moonY+Math.sin(x*0.04)*4+Math.sin(x*0.09)*2;ctx.lineTo(x,y);}
    ctx.lineTo(W,H); ctx.lineTo(0,H); ctx.closePath();
    ctx.fillStyle='#1c2230'; ctx.fill();
    [[W*0.22,moonY+5,8],[W*0.58,moonY+7,12],[W*0.8,moonY+3,6]].forEach(function(cr){
      ctx.beginPath(); ctx.arc(cr[0],cr[1],cr[2],Math.PI,Math.PI*2);
      ctx.strokeStyle='rgba(100,115,135,0.28)'; ctx.lineWidth=1.5; ctx.stroke();
    });
    var ap=(t*0.28)%(Math.PI);
    var rx=W*0.15+(W*0.7)*(ap/Math.PI);
    var ry=moonY-Math.sin(ap)*H*0.58;
    ctx.beginPath();
    for(var i=0;i<18;i++){
      var ap2=ap-i*0.055; if(ap2<0)break;
      var tx=W*0.15+(W*0.7)*(ap2/Math.PI);
      var ty=moonY-Math.sin(ap2)*H*0.58;
      i===0?ctx.moveTo(tx,ty):ctx.lineTo(tx,ty);
    }
    ctx.strokeStyle='rgba(100,165,255,0.28)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(rx,ry,4,0,Math.PI*2);
    ctx.fillStyle='rgba(150,200,255,0.92)'; ctx.fill();
    ctx.beginPath(); ctx.arc(rx,ry,8,0,Math.PI*2);
    ctx.fillStyle='rgba(150,200,255,0.1)'; ctx.fill();
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['mountains'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var t = 0;

  function makeRng(seed) {
    var s = seed;
    return function() {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      return (s >>> 0) / 0xffffffff;
    };
  }

  var peaks = [
    { cx: 0.18, hw: 0.10, peak: 0.18 },
    { cx: 0.38, hw: 0.14, peak: 0.08 },
    { cx: 0.58, hw: 0.11, peak: 0.14 },
    { cx: 0.78, hw: 0.09, peak: 0.22 },
    { cx: 0.92, hw: 0.07, peak: 0.28 }
  ];

  var surfY = H * 0.52;

  function frame() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    var rng = makeRng(19);
    for (var i = 0; i < 20; i++) {
      var sx = rng() * W, sy = rng() * surfY * 0.85;
      var sa = 0.10 + 0.18 * Math.sin(t * 0.45 + i * 0.9);
      ctx.beginPath();
      ctx.arc(sx, sy, 0.7, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + sa + ')';
      ctx.fill();
    }

    var eg = ctx.createLinearGradient(0, surfY, 0, H);
    eg.addColorStop(0, '#18260e');
    eg.addColorStop(1, '#080f06');
    ctx.fillStyle = eg;
    ctx.fillRect(0, surfY, W, H - surfY);

    var mainCx = W * 0.38;
    var glowPulse = 0.5 + 0.25 * Math.sin(t * 1.1);
    var rg = ctx.createRadialGradient(mainCx, surfY + 30, 0, mainCx, surfY + 30, 90);
    rg.addColorStop(0, 'rgba(103,232,249,' + (0.16 * glowPulse) + ')');
    rg.addColorStop(1, 'rgba(103,232,249,0)');
    ctx.fillStyle = rg;
    ctx.fillRect(0, surfY, W, H - surfY);

    ctx.strokeStyle = 'rgba(103,232,249,' + (0.30 * glowPulse) + ')';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#67e8f9';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(mainCx, surfY);
    ctx.lineTo(mainCx, H - 4);
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(165,243,252,' + (0.55 * glowPulse) + ')';
    ctx.beginPath();
    ctx.moveTo(mainCx - 5, H - 8);
    ctx.lineTo(mainCx, H - 2);
    ctx.lineTo(mainCx + 5, H - 8);
    ctx.closePath();
    ctx.fill();

    peaks.forEach(function(p, idx) {
      var cx = W * p.cx;
      var hw = W * p.hw;
      var peakY2 = H * p.peak;
      var snowY2 = peakY2 + (surfY - peakY2) * 0.35;
      var snowHW = (surfY - snowY2) * hw / (surfY - peakY2);

      ctx.fillStyle = idx === 1 ? '#28402c' : '#1e2e18';
      ctx.beginPath();
      ctx.moveTo(cx - hw, surfY);
      ctx.lineTo(cx, peakY2);
      ctx.lineTo(cx + hw, surfY);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = idx === 1 ? 'rgba(210,235,255,0.60)' : 'rgba(200,225,255,0.35)';
      ctx.beginPath();
      ctx.moveTo(cx - snowHW, snowY2);
      ctx.lineTo(cx, peakY2);
      ctx.lineTo(cx + snowHW, snowY2);
      ctx.closePath();
      ctx.fill();
    });

    ctx.strokeStyle = 'rgba(200,220,160,0.22)';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, surfY); ctx.lineTo(W, surfY); ctx.stroke();

    ctx.fillStyle = 'rgba(103,232,249,0.38)';
    ctx.font = '15px Amiri, serif';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText('أَوْتَادًا', W - 14, H - 8);

    t += 0.016;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['moving-mountains'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = 640, H = 130;
  cv.width = W; cv.height = H;

  function makeRng(seed) {
    var s = seed;
    return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
  }

  var peaks = [
    {cx:0.08, ht:0.46, hw:0.07},
    {cx:0.22, ht:0.60, hw:0.10},
    {cx:0.40, ht:0.72, hw:0.13},
    {cx:0.57, ht:0.54, hw:0.09},
    {cx:0.70, ht:0.63, hw:0.11},
    {cx:0.85, ht:0.44, hw:0.08},
    {cx:0.97, ht:0.36, hw:0.06}
  ];
  var surfY = H * 0.63;

  var rng = makeRng(33);
  var clouds = [];
  for (var i = 0; i < 22; i++) {
    clouds.push({
      x: rng() * W,
      y: H * 0.08 + rng() * H * 0.28,
      sz: 1.6 + rng() * 2.8,
      spd: 0.18 + rng() * 0.30,
      ph: rng() * Math.PI * 2,
      a: 0.12 + rng() * 0.16
    });
  }

  var mDrift = 0;
  var t = 0;

  function drawPeak(ox, pk) {
    var bx = pk.cx * W + ox;
    var ty = surfY - pk.ht * (surfY - 14);
    var lw = pk.hw * W;
    ctx.beginPath();
    ctx.moveTo(bx - lw, surfY);
    ctx.lineTo(bx, ty);
    ctx.lineTo(bx + lw, surfY);
    ctx.closePath();
    var mg = ctx.createLinearGradient(bx, ty, bx, surfY);
    mg.addColorStop(0, 'rgba(168,162,158,0.20)');
    mg.addColorStop(1, 'rgba(90,85,80,0.07)');
    ctx.fillStyle = mg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(168,162,158,0.24)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    var snowH = (surfY - ty) * 0.18;
    ctx.beginPath();
    ctx.moveTo(bx - lw * 0.20, ty + snowH);
    ctx.lineTo(bx, ty);
    ctx.lineTo(bx + lw * 0.20, ty + snowH);
    ctx.closePath();
    ctx.fillStyle = 'rgba(214,208,202,0.32)';
    ctx.fill();
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#020608');
    bg.addColorStop(1, '#060c10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    ctx.setLineDash([2, 6]);
    for (var pi = 0; pi < 4; pi++) {
      var px = (mDrift * 1.8 + pi * (W / 4)) % W;
      ctx.beginPath();
      ctx.moveTo(px, surfY * 0.25);
      ctx.lineTo(px - 10, H);
      ctx.strokeStyle = 'rgba(168,162,158,0.06)';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.moveTo(0, surfY);
    ctx.lineTo(W, surfY);
    ctx.strokeStyle = 'rgba(168,162,158,0.13)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    mDrift = (mDrift + 0.16) % W;
    ctx.save();
    ctx.rect(0, 0, W, H);
    ctx.clip();
    for (var m = -1; m <= 1; m++) {
      var ox = m * W + mDrift;
      for (var pi2 = 0; pi2 < peaks.length; pi2++) {
        drawPeak(ox, peaks[pi2]);
      }
    }
    ctx.restore();

    [0.22, 0.52, 0.78].forEach(function(frac) {
      var ax = (frac * W + mDrift * 0.5) % W;
      var ay = surfY * 0.78;
      var alpha = 0.06 + Math.sin(t * 0.4 + frac * 8) * 0.04;
      ctx.beginPath();
      ctx.moveTo(ax - 7, ay);
      ctx.lineTo(ax + 7, ay);
      ctx.lineTo(ax + 3, ay - 3);
      ctx.moveTo(ax + 7, ay);
      ctx.lineTo(ax + 3, ay + 3);
      ctx.strokeStyle = 'rgba(168,162,158,' + alpha + ')';
      ctx.lineWidth = 0.9;
      ctx.stroke();
    });

    for (var ci = 0; ci < clouds.length; ci++) {
      var c = clouds[ci];
      c.x = (c.x + c.spd) % (W + 10);
      var ca = c.a + Math.sin(t * 0.5 + c.ph) * 0.06;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(214,208,202,' + ca + ')';
      ctx.fill();
    }

    ctx.font = 'bold 14px Amiri, serif';
    ctx.fillStyle = 'rgba(214,208,202,0.28)';
    ctx.textAlign = 'right';
    ctx.fillText('وَهِيَ تَمُرُّ مَرَّ السَّحَابِ', W - 14, H - 11);

    t++;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['prime-numbers'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;

  function isPrime(n) {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;
    for (var i = 3; i * i <= n; i += 2) {
      if (n % i === 0) return false;
    }
    return true;
  }

  var COLS = 9;
  var colW = W / COLS;
  var rowH = 20;

  var streams = [];
  for (var i = 0; i < COLS; i++) {
    streams.push({
      y: -(Math.random() * H),
      speed: 0.35 + Math.random() * 0.25,
      numOffset: Math.floor(Math.random() * 80)
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    for (var ci = 0; ci < COLS; ci++) {
      var s = streams[ci];
      s.y += s.speed;
      if (s.y > H + rowH * 15) {
        s.y = -rowH * 15;
        s.numOffset = Math.floor(Math.random() * 80);
      }

      var x = ci * colW + colW * 0.5;
      var startRow = Math.floor(-s.y / rowH);

      for (var ri = 0; ri < Math.ceil(H / rowH) + 2; ri++) {
        var row = startRow + ri;
        var y = s.y + row * rowH;
        if (y < -rowH || y > H + rowH) continue;

        var n = ((s.numOffset + row) % 197) + 2;
        var prime = isPrime(n);

        var edgeFade = Math.min(1, Math.min(y / 24, (H - y) / 24));
        if (edgeFade <= 0) continue;

        ctx.shadowBlur = 0;
        if (prime) {
          ctx.shadowColor = '#f472b6';
          ctx.shadowBlur = 7;
          ctx.fillStyle = 'rgba(249,168,212,' + (edgeFade * 0.82) + ')';
          ctx.font = "600 13px 'DM Sans', monospace";
        } else {
          ctx.fillStyle = 'rgba(24,40,64,' + (edgeFade * 0.9) + ')';
          ctx.font = "400 11px 'DM Sans', monospace";
        }
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(n), x, y);
      }
    }
    ctx.shadowBlur = 0;
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['pulsar-navigation'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var cx = W * 0.5, cy = H * 0.5;

  var stars = [];
  for (var i = 0; i < 80; i++) {
    stars.push({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.1,
      a: 0.2 + Math.random() * 0.4
    });
  }

  var rings = [];
  var ringTimer = 0;
  var angle = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(function(s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(226,221,212,' + s.a + ')';
      ctx.fill();
    });

    ringTimer++;
    if (ringTimer >= 28) {
      ringTimer = 0;
      rings.push({ r: 0, alpha: 0.5 });
    }
    for (var i = rings.length - 1; i >= 0; i--) {
      rings[i].r += 1.8;
      rings[i].alpha -= 0.013;
      if (rings[i].alpha <= 0) { rings.splice(i, 1); continue; }
      ctx.beginPath();
      ctx.arc(cx, cy, rings[i].r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(253,164,175,' + rings[i].alpha + ')';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    var beamLen = Math.max(W, H) * 0.95;
    [0, Math.PI].forEach(function(offset) {
      var bAngle = angle + offset;
      var dx = Math.cos(bAngle);
      var dy = Math.sin(bAngle);

      var grad = ctx.createLinearGradient(cx, cy, cx + dx * beamLen, cy + dy * beamLen);
      grad.addColorStop(0, 'rgba(251,113,133,0.55)');
      grad.addColorStop(0.25, 'rgba(251,113,133,0.18)');
      grad.addColorStop(1, 'rgba(251,113,133,0)');

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(bAngle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(beamLen, -beamLen * 0.09);
      ctx.lineTo(beamLen,  beamLen * 0.09);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });

    var coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
    coreGlow.addColorStop(0, 'rgba(255,255,255,0.95)');
    coreGlow.addColorStop(0.3, 'rgba(253,164,175,0.7)');
    coreGlow.addColorStop(1, 'rgba(251,113,133,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, 18, 0, Math.PI * 2);
    ctx.fillStyle = coreGlow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    angle += 0.035;
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['pulsars-blackholes'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var cx = W / 2, cy = H / 2;

  var stars = [];
  var seed = 17;
  function rng() { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff; }
  for (var i = 0; i < 60; i++) {
    stars.push({ x: rng() * W, y: rng() * H, r: rng() * 1.1 + 0.2, a: rng() * 0.4 + 0.1 });
  }

  var rings = [];
  var lastKnockFrame = -999;

  var frame = 0;
  var PERIOD = 55;

  function draw() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(function(s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
      ctx.fill();
    });

    var angle = (frame / PERIOD) * Math.PI * 2;

    var phase = ((angle % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    if (phase < 0.18 && frame - lastKnockFrame > PERIOD * 0.85) {
      rings.push({ born: frame });
      lastKnockFrame = frame;
    }

    var BEAM_LEN = W * 0.52;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    for (var dir = 0; dir < 2; dir++) {
      var beam = ctx.createLinearGradient(0, 0, BEAM_LEN, 0);
      beam.addColorStop(0,   'rgba(250,204,21,0.55)');
      beam.addColorStop(0.25,'rgba(250,204,21,0.20)');
      beam.addColorStop(0.6, 'rgba(250,204,21,0.05)');
      beam.addColorStop(1,   'transparent');
      ctx.fillStyle = beam;
      ctx.beginPath();
      ctx.moveTo(0, -4);
      ctx.lineTo(BEAM_LEN, -10);
      ctx.lineTo(BEAM_LEN,  10);
      ctx.lineTo(0,  4);
      ctx.closePath();
      ctx.fill();
      ctx.rotate(Math.PI);
    }
    ctx.restore();

    for (var r = rings.length - 1; r >= 0; r--) {
      var age = frame - rings[r].born;
      var maxAge = 90;
      if (age > maxAge) { rings.splice(r, 1); continue; }
      var tp = age / maxAge;
      var radius = tp * 260;
      var alpha = (1 - tp) * 0.55;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(250,204,21,' + alpha.toFixed(2) + ')';
      ctx.lineWidth = 2.5 - tp * 1.5;
      ctx.stroke();
    }

    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 14);
    grd.addColorStop(0,   'rgba(255,255,255,1)');
    grd.addColorStop(0.35,'rgba(250,204,21,0.9)');
    grd.addColorStop(0.7, 'rgba(250,204,21,0.3)');
    grd.addColorStop(1,   'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(cx, cy, 14, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fill();

    frame++;
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['red-giant'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;

  function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  function easeIn(t)  { return t * t * t; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  var HOLD_NORMAL = 120;
  var EXPAND      = 220;
  var HOLD_GIANT  = 100;
  var FADE_RESET  = 60;
  var TOTAL = HOLD_NORMAL + EXPAND + HOLD_GIANT + FADE_RESET;

  var SUN_X = W * 0.78, SUN_Y = H * 0.5;
  var EARTH_DIST = W * 0.34;
  var MOON_DIST  = 18;

  var R_NORMAL = 18, R_GIANT = 170;

  var frame = 0;

  function noise(x, y, t) {
    return Math.sin(x * 4.1 + t) * Math.cos(y * 3.7 - t * 0.7) * 0.5
         + Math.sin(x * 8.3 - t * 1.3 + y * 5.1) * 0.25
         + Math.cos(x * 2.2 + y * 6.5 + t * 0.5) * 0.25;
  }

  function drawSun(sunR, colorProgress, globalAlpha) {
    var t2 = frame * 0.018;

    var layers = [
      { r: sunR * 3.2,  a: 0.04 },
      { r: sunR * 2.2,  a: 0.08 },
      { r: sunR * 1.55, a: 0.14 },
    ];
    layers.forEach(function(l) {
      var grd = ctx.createRadialGradient(SUN_X, SUN_Y, sunR * 0.6, SUN_X, SUN_Y, l.r);
      var rr = Math.round(lerp(255, 240, colorProgress));
      var rg = Math.round(lerp(200, 80,  colorProgress));
      var rb = Math.round(lerp(80,  30,  colorProgress));
      grd.addColorStop(0, 'rgba(' + rr + ',' + rg + ',' + rb + ',' + (l.a * globalAlpha) + ')');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.beginPath(); ctx.arc(SUN_X, SUN_Y, l.r, 0, Math.PI * 2); ctx.fill();
    });

    var step = Math.max(2, sunR * 0.08);
    for (var dx = -sunR; dx <= sunR; dx += step) {
      for (var dy = -sunR; dy <= sunR; dy += step) {
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > sunR) continue;
        var edgeFade = 1 - Math.pow(dist / sunR, 3);
        var n = noise(dx / sunR, dy / sunR, t2);
        var bright = 0.62 + n * 0.22;
        var r2 = Math.round(lerp(255, 230, colorProgress) * bright);
        var g2 = Math.round(lerp(180, 60,  colorProgress) * bright);
        var b2 = Math.round(lerp(60,  20,  colorProgress) * bright);
        ctx.fillStyle = 'rgba(' + r2 + ',' + g2 + ',' + b2 + ',' + (edgeFade * globalAlpha * 0.9) + ')';
        ctx.fillRect(SUN_X + dx, SUN_Y + dy, step, step);
      }
    }

    var diskGrd = ctx.createRadialGradient(SUN_X, SUN_Y, sunR * 0.78, SUN_X, SUN_Y, sunR);
    var cr = Math.round(lerp(255, 220, colorProgress));
    var cg = Math.round(lerp(160, 55,  colorProgress));
    var cb = Math.round(lerp(30,  15,  colorProgress));
    diskGrd.addColorStop(0, 'rgba(' + cr + ',' + cg + ',' + cb + ',0)');
    diskGrd.addColorStop(1, 'rgba(' + cr + ',' + cg + ',' + cb + ',' + (globalAlpha * 0.6) + ')');
    ctx.fillStyle = diskGrd;
    ctx.beginPath(); ctx.arc(SUN_X, SUN_Y, sunR, 0, Math.PI * 2); ctx.fill();

    var numStreamers = Math.round(lerp(4, 8, colorProgress));
    for (var s = 0; s < numStreamers; s++) {
      var angle = (s / numStreamers) * Math.PI * 2 + t2 * 0.4;
      var len   = sunR * lerp(0.5, 0.85, colorProgress) * (0.8 + noise(s, 0, t2 * 0.6) * 0.4);
      var tip   = { x: SUN_X + Math.cos(angle) * (sunR + len), y: SUN_Y + Math.sin(angle) * (sunR + len) };
      var base1 = { x: SUN_X + Math.cos(angle - 0.15) * sunR, y: SUN_Y + Math.sin(angle - 0.15) * sunR };
      var base2 = { x: SUN_X + Math.cos(angle + 0.15) * sunR, y: SUN_Y + Math.sin(angle + 0.15) * sunR };
      ctx.beginPath();
      ctx.moveTo(base1.x, base1.y);
      ctx.quadraticCurveTo(SUN_X + Math.cos(angle) * (sunR + len * 0.5), SUN_Y + Math.sin(angle) * (sunR + len * 0.5), tip.x, tip.y);
      ctx.quadraticCurveTo(SUN_X + Math.cos(angle) * (sunR + len * 0.5), SUN_Y + Math.sin(angle) * (sunR + len * 0.5), base2.x, base2.y);
      ctx.fillStyle = 'rgba(' + cr + ',' + Math.round(cg * 0.7) + ',0,' + (globalAlpha * lerp(0.18, 0.10, colorProgress)) + ')';
      ctx.fill();
    }
  }

  function drawEarth(earthX, earthY, alpha) {
    if (alpha <= 0) return;
    var eg = ctx.createRadialGradient(earthX, earthY, 0, earthX, earthY, 9);
    eg.addColorStop(0, 'rgba(100,180,255,' + (alpha * 0.4) + ')');
    eg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = eg; ctx.beginPath(); ctx.arc(earthX, earthY, 9, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(earthX, earthY, 3.5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(100,180,255,' + alpha + ')'; ctx.fill();
    ctx.beginPath(); ctx.arc(earthX, earthY, 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(200,235,255,' + (alpha * 0.8) + ')'; ctx.fill();
  }

  function drawMoon(mx, my, alpha) {
    if (alpha <= 0) return;
    ctx.beginPath(); ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(220,220,210,' + (alpha * 0.85) + ')'; ctx.fill();
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = '#040810'; ctx.fillRect(0, 0, W, H);

    if (frame === 0) {
      draw._stars = [];
      for (var i = 0; i < 55; i++) {
        draw._stars.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 0.9 + 0.2, a: Math.random() * 0.35 + 0.1 });
      }
    }
    (draw._stars || []).forEach(function(s) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,215,200,' + s.a + ')'; ctx.fill();
    });

    var f = frame % TOTAL;
    var T1 = HOLD_NORMAL;
    var T2 = T1 + EXPAND;
    var T3 = T2 + HOLD_GIANT;

    var expandP  = 0;
    var earthAl  = 1;
    var globalAl = 1;

    if (f < T1) {
      expandP = 0; earthAl = 1;
    } else if (f < T2) {
      expandP = easeIn((f - T1) / EXPAND);
      var engulf = clamp((expandP - 0.65) / 0.25, 0, 1);
      earthAl = 1 - engulf;
    } else if (f < T3) {
      expandP = 1; earthAl = 0;
    } else {
      var fadeP = (f - T3) / FADE_RESET;
      expandP = 1 - easeOut(fadeP) * 0.98;
      earthAl = 0;
      globalAl = 1 - easeOut(fadeP * 1.1);
    }

    var sunR = lerp(R_NORMAL, R_GIANT, expandP);
    var colorP = expandP;

    var orbitAngle = frame * 0.006;
    var earthX = SUN_X - EARTH_DIST + Math.cos(orbitAngle) * 6;
    var earthY = SUN_Y + Math.sin(orbitAngle) * 6;
    var moonAngle = frame * 0.04;
    var moonX = earthX + Math.cos(moonAngle) * MOON_DIST;
    var moonY = earthY + Math.sin(moonAngle) * MOON_DIST;

    var starFade = 1 - expandP * 0.7;
    ctx.globalAlpha = starFade;
    (draw._stars || []).forEach(function(s) {
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(220,215,200,' + s.a + ')'; ctx.fill();
    });
    ctx.globalAlpha = 1;

    if (earthAl > 0.1) {
      ctx.beginPath();
      ctx.arc(SUN_X, SUN_Y, EARTH_DIST, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(100,150,200,' + (earthAl * 0.06) + ')';
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    drawMoon(moonX, moonY, earthAl * globalAl);
    drawEarth(earthX, earthY, earthAl * globalAl);
    drawSun(sunR, colorP, globalAl);

    frame++;
    rafId = requestAnimationFrame(draw);
  }
  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['sea-land'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var seaW = W*0.71;
  function frame(){
    ctx.clearRect(0,0,W,H);
    var gs=ctx.createLinearGradient(0,0,seaW,0);
    gs.addColorStop(0,'#071828'); gs.addColorStop(1,'#0a2035');
    ctx.fillStyle=gs; ctx.fillRect(0,0,seaW,H);
    var gl=ctx.createLinearGradient(seaW,0,W,0);
    gl.addColorStop(0,'#1a1005'); gl.addColorStop(1,'#130d03');
    ctx.fillStyle=gl; ctx.fillRect(seaW,0,W-seaW,H);
    for(var w=0;w<3;w++){
      ctx.beginPath();
      for(var x=0;x<seaW;x+=3){
        var wy=H*(0.32+w*0.18)+Math.sin(x*0.022+t*0.9+w)*11+Math.sin(x*0.041+t*1.4+w)*5;
        x===0?ctx.moveTo(x,wy):ctx.lineTo(x,wy);
      }
      ctx.strokeStyle='rgba(56,130,200,'+(0.18+w*0.08)+')'; ctx.lineWidth=1.8; ctx.stroke();
    }
    ctx.font='bold 13px DM Sans,sans-serif'; ctx.textAlign='center';
    ctx.fillStyle='rgba(96,165,250,0.65)'; ctx.fillText('71%',seaW*0.45,H*0.6);
    ctx.fillStyle='rgba(180,135,70,0.65)'; ctx.fillText('29%',seaW+(W-seaW)*0.5,H*0.6);
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['silver-melting'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  // Draws an elegant, multi-layered COOL fire tongue (Blue/Cyan/White)
  function drawFlameTongue(dist, height, width, speed, offset) {
    var baseY = dist;
    var tipY = dist + height;
    
    // Sway the tip elegantly
    var tipSway = Math.sin(t * speed + offset) * (width * 0.3);
    var breathe = Math.sin(t * speed * 0.7 + offset) * (height * 0.08);

    // Layer 1: Deep Indigo Outer
    ctx.beginPath();
    ctx.moveTo(-width / 2, baseY);
    ctx.quadraticCurveTo(-width * 0.6, tipY * 0.6 + breathe, tipSway, tipY + breathe);
    ctx.quadraticCurveTo(width * 0.6, tipY * 0.6 + breathe, width / 2, baseY);
    ctx.closePath();
    var g1 = ctx.createLinearGradient(0, baseY, 0, tipY + breathe);
    g1.addColorStop(0, 'rgba(20, 20, 100, 0.9)');
    g1.addColorStop(0.4, 'rgba(50, 40, 150, 0.7)');
    g1.addColorStop(1, 'rgba(80, 60, 200, 0)');
    ctx.fillStyle = g1;
    ctx.fill();

    // Layer 2: Bright Cyan Middle
    var mW = width * 0.6;
    var mH = height * 0.75;
    var mTipY = dist + mH;
    var mSway = Math.sin(t * speed + offset) * (mW * 0.2);
    var mBreathe = Math.sin(t * speed * 0.7 + offset) * (mH * 0.06);

    ctx.beginPath();
    ctx.moveTo(-mW / 2, baseY);
    ctx.quadraticCurveTo(-mW * 0.5, mTipY * 0.6 + mBreathe, mSway, mTipY + mBreathe);
    ctx.quadraticCurveTo(mW * 0.5, mTipY * 0.6 + mBreathe, mW / 2, baseY);
    ctx.closePath();
    var g2 = ctx.createLinearGradient(0, baseY, 0, mTipY + mBreathe);
    g2.addColorStop(0, 'rgba(50, 160, 255, 0.95)');
    g2.addColorStop(0.5, 'rgba(120, 210, 255, 0.7)');
    g2.addColorStop(1, 'rgba(150, 220, 255, 0)');
    ctx.fillStyle = g2;
    ctx.fill();

    // Layer 3: Blinding White/Silver Core
    var iW = width * 0.25;
    var iH = height * 0.45;
    var iTipY = dist + iH;
    var iSway = Math.sin(t * speed + offset) * (iW * 0.1);

    ctx.beginPath();
    ctx.moveTo(-iW / 2, baseY);
    ctx.quadraticCurveTo(0, iTipY * 0.5, iSway, iTipY);
    ctx.quadraticCurveTo(0, iTipY * 0.5, iW / 2, baseY);
    ctx.closePath();
    var g3 = ctx.createLinearGradient(0, baseY, 0, iTipY);
    g3.addColorStop(0, 'rgba(230, 240, 255, 0.9)');
    g3.addColorStop(1, 'rgba(200, 220, 255, 0)');
    ctx.fillStyle = g3;
    ctx.fill();
  }

  // Draws a perfect 8-pointed star (two overlapping squares)
  function drawStar(cx, cy, radius, rotation, lineW, color, shadowCol, shadowBlur) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineW;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (shadowBlur > 0) {
      ctx.shadowColor = shadowCol;
      ctx.shadowBlur = shadowBlur;
    }

    // Square 1
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var a = (Math.PI / 4) + (Math.PI / 2) * i;
      var x = Math.cos(a) * radius;
      var y = Math.sin(a) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    // Square 2
    ctx.beginPath();
    for (var i = 0; i < 4; i++) {
      var a = (Math.PI / 2) * i;
      var x = Math.cos(a) * radius;
      var y = Math.sin(a) * radius;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    ctx.restore();
  }

  function frame() {
    t += 0.010; // Slightly slower than gold for a colder, calmer feel

    ctx.clearRect(0, 0, W, H);

    // Pure pitch-black background to maximize the silver/chrome contrast
    var bg = ctx.createRadialGradient(W/2, H/2, 10, W/2, H/2, W*0.7);
    bg.addColorStop(0, '#08080c');
    bg.addColorStop(0.5, '#040406');
    bg.addColorStop(1, '#000000');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Cool ambient cyan glow behind everything
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var glow = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, 140);
    glow.addColorStop(0, 'rgba(60, 120, 200, 0.2)');
    glow.addColorStop(0.5, 'rgba(30, 60, 150, 0.1)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // LAYER 1: THE SILVER/FROST FIRE FLAMES
    ctx.save();
    ctx.translate(W/2, H/2);
    
    for (var i = 0; i < 8; i++) {
      ctx.save();
      var angle = (Math.PI / 4) * i;
      ctx.rotate(angle);
      
      // Main Flame
      drawFlameTongue(30, 90, 35, 1.5, i * 1.2);
      
      // Smaller Accent Flame
      ctx.save();
      ctx.rotate(Math.PI / 8); 
      drawFlameTongue(40, 60, 22, 1.8, i * 1.5 + 5);
      ctx.restore();

      ctx.restore();
    }
    ctx.restore();

    // LAYER 2: BACKGROUND GEOMETRY
    drawStar(W/2, H/2, 100, -t * 0.25, 1, 'rgba(120, 140, 160, 0.12)', 'rgba(0,0,0,0)', 0);

    // LAYER 3: MAIN SILVER GEOMETRY (Sharp Chrome Gradient)
    var silverGrad = ctx.createLinearGradient(W/2 - 70, H/2 - 70, W/2 + 70, H/2 + 70);
    silverGrad.addColorStop(0, '#3a3a40');   // Dark shadow edge
    silverGrad.addColorStop(0.2, '#808088'); // Medium grey
    silverGrad.addColorStop(0.38, '#c0c0c8');// Bright silver
    silverGrad.addColorStop(0.42, '#ffffff');// Razor sharp highlight
    silverGrad.addColorStop(0.46, '#c0c0c8');// Bright silver
    silverGrad.addColorStop(0.8, '#606068'); // Medium grey
    silverGrad.addColorStop(1, '#2a2a30');   // Dark shadow edge
    
    drawStar(W/2, H/2, 70, t * 0.15, 3.5, silverGrad, 'rgba(150, 200, 255, 0.8)', 20);

    // LAYER 4: INNER GEOMETRY (Icy Blue tint)
    drawStar(W/2, H/2, 35, -t * 0.35, 2, 'rgba(180, 210, 240, 0.6)', 'rgba(100, 180, 255, 0.5)', 10);

    // LAYER 5: CENTER ORNAMENT
    ctx.beginPath();
    ctx.arc(W/2, H/2, 12, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(200, 220, 240, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = 'rgba(100, 180, 255, 0.6)';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.beginPath();
    ctx.arc(W/2, H/2, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#e0f0ff'; // Pale ice-blue center dot
    ctx.shadowColor = '#80c0ff';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Vignettes (Matching pure black background)
    var vt = ctx.createLinearGradient(0, 0, 0, 40);
    vt.addColorStop(0, 'rgba(0,0,0,0.8)');
    vt.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vt; ctx.fillRect(0, 0, W, 40);

    var vb = ctx.createLinearGradient(0, H - 40, 0, H);
    vb.addColorStop(0, 'rgba(0,0,0,0)');
    vb.addColorStop(1, 'rgba(0,0,0,0.8)');
    ctx.fillStyle = vb; ctx.fillRect(0, H - 40, W, 40);

    var vl = ctx.createLinearGradient(0, 0, 40, 0);
    vl.addColorStop(0, 'rgba(0,0,0,0.7)');
    vl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = vl; ctx.fillRect(0, 0, 40, H);

    var vr = ctx.createLinearGradient(W - 40, 0, W, 0);
    vr.addColorStop(0, 'rgba(0,0,0,0)');
    vr.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = vr; ctx.fillRect(W - 40, 0, 40, H);

    requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['sirius-distance'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var stars = Array.from({length:50},function(_,i){
    return{x:(i*137.5%W+W)%W,y:(i*89.3%H+H)%H,sz:0.5+Math.random()*1.1,ph:i*0.42};
  });
  function frame(){
    ctx.clearRect(0,0,W,H);
    ctx.fillStyle='#040810'; ctx.fillRect(0,0,W,H);
    stars.forEach(function(s){
      var a=0.25+Math.sin(t*1.5+s.ph)*0.22;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.sz,0,Math.PI*2);
      ctx.fillStyle='rgba(200,215,255,'+a+')'; ctx.fill();
    });
    var sx=W*0.6, sy=H*0.36, pulse=1+Math.sin(t*2)*0.12;
    [32,20,11,5].forEach(function(r,i){
      var alphas=[0.035,0.07,0.18,0.9];
      ctx.beginPath(); ctx.arc(sx,sy,r*pulse,0,Math.PI*2);
      ctx.fillStyle='rgba(185,205,255,'+alphas[i]+')'; ctx.fill();
    });
    [[-1,0],[1,0],[0,-1],[0,1]].forEach(function(d){
      var lg=ctx.createLinearGradient(sx,sy,sx+d[0]*42*pulse,sy+d[1]*42*pulse);
      lg.addColorStop(0,'rgba(185,205,255,0.5)'); lg.addColorStop(1,'rgba(185,205,255,0)');
      ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+d[0]*42*pulse,sy+d[1]*42*pulse);
      ctx.strokeStyle=lg; ctx.lineWidth=1.5; ctx.stroke();
    });
    ctx.fillStyle='rgba(185,205,255,0.45)'; ctx.font='11px DM Sans,sans-serif';
    ctx.textAlign='center'; ctx.fillText('Sirius α CMa',sx,sy+52);
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['sun-temperature'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  function frame(){
    ctx.clearRect(0,0,W,H);
    var g=ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,'#090502'); g.addColorStop(1,'#120800');
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    var cx=W*0.5, cy=H*0.5, pulse=1+Math.sin(t*1.2)*0.038;
    [72,56,40,28].forEach(function(r,i){
      var alphas=[0.04,0.07,0.13,0.25];
      ctx.beginPath(); ctx.arc(cx,cy,r*pulse,0,Math.PI*2);
      ctx.fillStyle='rgba(251,146,60,'+alphas[i]+')'; ctx.fill();
    });
    for(var i=0;i<12;i++){
      var angle=i/12*Math.PI*2+t*0.12;
      var r2=54+Math.sin(t*2+i)*9;
      ctx.beginPath(); ctx.moveTo(cx+Math.cos(angle)*27,cy+Math.sin(angle)*27);
      ctx.lineTo(cx+Math.cos(angle)*r2*pulse,cy+Math.sin(angle)*r2*pulse);
      ctx.strokeStyle='rgba(251,191,36,0.16)'; ctx.lineWidth=2.2; ctx.stroke();
    }
    var sg=ctx.createRadialGradient(cx,cy,4,cx,cy,27*pulse);
    sg.addColorStop(0,'#fefce8'); sg.addColorStop(0.35,'#fbbf24'); sg.addColorStop(1,'rgba(245,158,11,0)');
    ctx.beginPath(); ctx.arc(cx,cy,27*pulse,0,Math.PI*2); ctx.fillStyle=sg; ctx.fill();
    t+=0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['wind-atmosphere'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;

  var particles = [];
  for (var i = 0; i < 42; i++) {
    particles.push({
      x: Math.random() * W,
      y: H * 0.42 + Math.random() * H * 0.50,
      vx: 0.5 + Math.random() * 0.9,
      vy: (Math.random() - 0.5) * 0.25,
      sz: 0.6 + Math.random() * 1.1,
      a:  0.25 + Math.random() * 0.45
    });
  }

  var stars = [];
  for (var j = 0; j < 32; j++) {
    stars.push({
      x: (j * 137.5) % W,
      y: (j * 63.2)  % (H * 0.36),
      ph: j * 0.38
    });
  }

  var wisps = [
    { x: W * 0.12, y: H * 0.63, vx: 0.22, r: 11 },
    { x: W * 0.52, y: H * 0.72, vx: 0.18, r: 14 },
    { x: W * 0.78, y: H * 0.58, vx: 0.28, r: 9  }
  ];

  function frame() {
    ctx.clearRect(0, 0, W, H);

    ctx.fillStyle = '#02040a';
    ctx.fillRect(0, 0, W, H);

    var atmoGrad = ctx.createLinearGradient(0, H * 0.32, 0, H);
    atmoGrad.addColorStop(0, 'rgba(13,30,50,0)');
    atmoGrad.addColorStop(0.35, 'rgba(8,22,38,0.7)');
    atmoGrad.addColorStop(1, 'rgba(6,18,30,0.95)');
    ctx.fillStyle = atmoGrad;
    ctx.fillRect(0, H * 0.28, W, H * 0.72);

    stars.forEach(function(s) {
      var a = 0.2 + Math.sin(t * 0.7 + s.ph) * 0.18;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,215,255,' + a + ')';
      ctx.fill();
    });

    var bY = H * 0.36;
    ctx.save();
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(0, bY); ctx.lineTo(W, bY);
    ctx.strokeStyle = 'rgba(45,212,191,0.2)';
    ctx.lineWidth = 0.9;
    ctx.stroke();
    ctx.restore();

    for (var i = 0; i < 6; i++) {
      var ly  = H * 0.46 + i * H * 0.075;
      var spd = 0.7 + i * 0.12;
      var lx  = ((t * spd + i * 130) % (W + 60)) - 30;
      var len = 18 + i * 6;
      var la  = 0.06 + Math.sin(t * 0.4 + i) * 0.03;
      ctx.beginPath();
      ctx.moveTo(lx, ly);
      ctx.lineTo(lx - len, ly);
      ctx.strokeStyle = 'rgba(45,212,191,' + la + ')';
      ctx.lineWidth = 0.7;
      ctx.stroke();
    }

    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x > W + 4) p.x = -4;
      if (p.y < H * 0.40) p.y += 0.5;
      if (p.y > H * 0.94) p.y = H * 0.41 + Math.random() * H * 0.10;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(45,212,191,' + p.a + ')';
      ctx.fill();
    });

    wisps.forEach(function(cl) {
      cl.x += cl.vx;
      if (cl.x > W + cl.r * 4) cl.x = -cl.r * 4;
      ctx.beginPath();
      ctx.arc(cl.x, cl.y, cl.r, 0, Math.PI * 2);
      ctx.arc(cl.x + cl.r * 0.9, cl.y - cl.r * 0.3, cl.r * 0.7, 0, Math.PI * 2);
      ctx.arc(cl.x - cl.r * 0.7, cl.y - cl.r * 0.2, cl.r * 0.55, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(90,120,155,0.1)';
      ctx.fill();
    });

    ctx.beginPath();
    ctx.arc(W * 0.5, H + W * 0.85, W * 0.98, Math.PI * 1.07, Math.PI * 1.93);
    ctx.strokeStyle = 'rgba(45,212,191,0.16)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    var vig = ctx.createRadialGradient(W*0.5, H*0.5, H*0.1, W*0.5, H*0.5, W*0.7);
    vig.addColorStop(0, 'rgba(2,4,10,0)');
    vig.addColorStop(1, 'rgba(2,4,10,0.55)');
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, W, H);

    t++;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};





CardCanvases['world-hereafter'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;

  /* ── Responsive sizing ── */
  var gR = Math.min(H * 0.38, W * 0.075, 50);
  var gX = W * 0.19;
  var gY = H * 0.5;
  var hX = W * 0.72;
  var hY = H * 0.48;

  /* ── Star field (denser & brighter on the hereafter side) ── */
  var stars = [];
  for (var i = 0; i < 110; i++) {
    var sx = Math.random() * W;
    stars.push({
      x: sx, y: Math.random() * H,
      r: Math.random() * 1.1 + 0.2,
      sp: Math.random() * 1.6 + 0.4,
      off: Math.random() * 6.283,
      boost: sx > W * 0.5 ? 0.22 : 0
    });
  }

  /* ── Simplified continent outlines [lon, lat] degrees ── */
  var lands = [
    [[-17,15],[-12,25],[-5,35],[10,37],[22,33],[33,28],[42,18],[50,5],[42,-5],[36,-18],[32,-28],[28,-34],[18,-34],[12,-22],[8,-5],[0,5],[-8,6],[-17,15]],
    [[-10,36],[0,43],[-4,48],[6,53],[12,56],[22,58],[32,60],[40,55],[30,45],[26,38],[18,38],[8,38],[2,43],[-10,36]],
    [[32,60],[48,55],[58,48],[68,42],[78,32],[88,22],[96,14],[102,10],[108,16],[118,26],[130,36],[140,44],[142,50],[132,56],[115,55],[95,52],[75,50],[55,55],[42,60],[32,60]],
    [[-128,54],[-122,46],[-118,36],[-110,30],[-102,26],[-96,28],[-88,30],[-82,36],[-76,42],[-70,46],[-62,50],[-66,58],[-78,60],[-90,56],[-102,58],[-115,58],[-128,54]],
    [[-80,10],[-74,4],[-66,0],[-56,-6],[-48,-14],[-45,-22],[-49,-30],[-56,-38],[-64,-50],[-72,-54],[-76,-46],[-78,-28],[-80,-8],[-80,10]]
  ];

  /* ── 4 Rivers of Paradise ── */
  var riverCols = [[90,170,255],[235,235,248],[255,195,45],[205,110,240]];
  var rParts = [];
  for (var i = 0; i < 65; i++) {
    rParts.push({
      a: Math.random() * 6.283,
      d: 5 + Math.random() * 75,
      sp: 0.003 + Math.random() * 0.007,
      sz: 0.4 + Math.random() * 1.6,
      al: 0.25 + Math.random() * 0.7,
      ct: Math.floor(Math.random() * 4)
    });
  }

  /* ── Sphere projection ── */
  function proj(lon, lat, rot) {
    var lr = (lon + rot) * 0.017453;
    var la = lat * 0.017453;
    var cl = Math.cos(la);
    return {
      x: gX + cl * Math.cos(lr) * gR,
      y: gY - Math.sin(la) * gR,
      v: cl * Math.sin(lr) > 0
    };
  }

  function drawStars() {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var a = Math.max(0, Math.min(1, 0.22 + Math.sin(t * s.sp + s.off) * 0.32 + s.boost));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fillStyle = 'rgba(255,255,255,' + a + ')';
      ctx.fill();
    }
  }

  function drawHereafter() {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    var g1 = ctx.createRadialGradient(hX, hY, 0, hX, hY, W * 0.34);
    g1.addColorStop(0, 'rgba(255,210,70,0.1)');
    g1.addColorStop(0.25, 'rgba(255,170,40,0.05)');
    g1.addColorStop(0.6, 'rgba(160,80,180,0.02)');
    g1.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g1;
    ctx.fillRect(0, 0, W, H);

    var g2 = ctx.createRadialGradient(hX, hY, 0, hX, hY, 42);
    g2.addColorStop(0, 'rgba(255,255,240,0.95)');
    g2.addColorStop(0.12, 'rgba(255,228,160,0.7)');
    g2.addColorStop(0.35, 'rgba(255,185,80,0.22)');
    g2.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(hX, hY, 42, 0, 6.283); ctx.fill();

    var pulse = 0.9 + Math.sin(t * 1.2) * 0.1;
    var g3 = ctx.createRadialGradient(hX, hY, 0, hX, hY, 7 * pulse);
    g3.addColorStop(0, 'rgba(255,255,255,1)');
    g3.addColorStop(0.5, 'rgba(255,240,200,0.55)');
    g3.addColorStop(1, 'rgba(255,200,100,0)');
    ctx.fillStyle = g3;
    ctx.beginPath(); ctx.arc(hX, hY, 7 * pulse, 0, 6.283); ctx.fill();

    ctx.restore();

    for (var r = 0; r < 4; r++) {
      var ba = (6.283 / 4) * r + t * 0.1;
      var c = riverCols[r];
      ctx.beginPath();
      var first = true;
      for (var i = 0; i < 55; i++) {
        var ang = ba + i * 0.06;
        var dist = 5 + i * 1.15;
        var wb = Math.sin(t * 1.6 + i * 0.1 + r * 1.4) * 2;
        var x = hX + Math.cos(ang) * (dist + wb);
        var y = hY + Math.sin(ang) * (dist + wb) * 0.48;
        if (x > 0 && x < W && y > 0 && y < H) {
          if (first) { ctx.moveTo(x, y); first = false; }
          else ctx.lineTo(x, y);
        }
      }
      var al = 0.2 + Math.sin(t * 0.7 + r * 1.1) * 0.07;
      ctx.strokeStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + al + ')';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    for (var i = 0; i < rParts.length; i++) {
      var p = rParts[i];
      p.a += p.sp;
      p.d += Math.sin(t * 0.7 + p.a * 2) * 0.06;
      if (p.d > 85) p.d = 5 + Math.random() * 6;
      if (p.d < 3) p.d = 5;
      var wb = Math.sin(t * 1.1 + p.a * 3) * 1.2;
      var x = hX + Math.cos(p.a) * (p.d + wb);
      var y = hY + Math.sin(p.a) * (p.d + wb) * 0.48;
      if (x > 0 && x < W && y > 0 && y < H) {
        var c = riverCols[p.ct];
        var a = p.al * (0.35 + 0.65 * Math.sin(t * 1.3 + p.a));
        ctx.beginPath(); ctx.arc(x, y, p.sz, 0, 6.283);
        ctx.fillStyle = 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')';
        ctx.fill();
      }
    }

    for (var g = 0; g < 8; g++) {
      var ga = (6.283 / 8) * g - 0.25 + t * 0.012;
      var gd = 35 + Math.sin(t * 0.35 + g * 0.7) * 2.5;
      var gx = hX + Math.cos(ga) * gd;
      var gh = 10 + Math.sin(t * 0.6 + g * 0.9) * 3;
      if (gx > 4 && gx < W - 4) {
        var pillar = ctx.createLinearGradient(gx, hY - gh, gx, hY + gh);
        var pa = 0.09 + Math.sin(t * 1.3 + g * 0.8) * 0.035;
        pillar.addColorStop(0, 'rgba(255,220,150,0)');
        pillar.addColorStop(0.25, 'rgba(255,220,150,' + pa + ')');
        pillar.addColorStop(0.5, 'rgba(255,240,200,' + (pa * 1.6) + ')');
        pillar.addColorStop(0.75, 'rgba(255,220,150,' + pa + ')');
        pillar.addColorStop(1, 'rgba(255,220,150,0)');
        ctx.fillStyle = pillar;
        ctx.fillRect(gx - 0.8, hY - gh, 1.6, gh * 2);
      }
    }
  }

  function drawBarrier() {
    var bx = W * 0.39;

    var veil = ctx.createLinearGradient(bx - 14, 0, bx + 14, 0);
    veil.addColorStop(0, 'rgba(0,0,0,0)');
    veil.addColorStop(0.5, 'rgba(55,35,85,0.07)');
    veil.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = veil;
    ctx.fillRect(bx - 14, 0, 28, H);

    var progress = (t * 0.06) % 1;
    var startX = gX + gR * 1.6;
    var endX = hX - 45;
    var soulX = startX + progress * (endX - startX);
    var soulY = gY + Math.sin(t * 1.2 + progress * 5) * H * 0.18;
    var soulA = Math.sin(progress * 3.14) * 0.35;

    var sg = ctx.createRadialGradient(soulX, soulY, 0, soulX, soulY, 8);
    sg.addColorStop(0, 'rgba(255,255,255,' + soulA + ')');
    sg.addColorStop(0.4, 'rgba(180,160,255,' + (soulA * 0.3) + ')');
    sg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = sg;
    ctx.beginPath(); ctx.arc(soulX, soulY, 8, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.arc(soulX, soulY, 0.8, 0, 6.283);
    ctx.fillStyle = 'rgba(255,255,255,' + (soulA * 1.5) + ')';
    ctx.fill();
  }

  function drawDunya() {
    var rot = t * 10;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    var ag = ctx.createRadialGradient(gX, gY, gR * 0.65, gX, gY, gR * 1.55);
    ag.addColorStop(0, 'rgba(0,100,255,0.1)');
    ag.addColorStop(0.5, 'rgba(0,55,160,0.03)');
    ag.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ag;
    ctx.beginPath(); ctx.arc(gX, gY, gR * 1.55, 0, 6.283); ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.beginPath(); ctx.arc(gX, gY, gR, 0, 6.283); ctx.clip();

    var oc = ctx.createRadialGradient(gX - gR * 0.25, gY - gR * 0.25, 0, gX, gY, gR);
    oc.addColorStop(0, '#0c2e50');
    oc.addColorStop(1, '#020a14');
    ctx.fillStyle = oc;
    ctx.fillRect(gX - gR, gY - gR, gR * 2, gR * 2);

    ctx.fillStyle = 'rgba(0,255,120,0.6)';
    ctx.shadowColor = 'rgba(0,255,120,0.35)';
    ctx.shadowBlur = 5;
    for (var li = 0; li < lands.length; li++) {
      var land = lands[li];
      ctx.beginPath();
      var started = false;
      for (var pi = 0; pi < land.length; pi++) {
        var p = proj(land[pi][0], land[pi][1], rot);
        if (p.v) {
          if (!started) { ctx.moveTo(p.x, p.y); started = true; }
          else ctx.lineTo(p.x, p.y);
        }
      }
      if (started) { ctx.closePath(); ctx.fill(); }
    }
    ctx.shadowBlur = 0;

    ctx.strokeStyle = 'rgba(0,150,255,0.09)';
    ctx.lineWidth = 0.6;
    for (var lat = -60; lat <= 60; lat += 30) {
      ctx.beginPath();
      var f = true;
      for (var lon = -180; lon <= 180; lon += 3) {
        var p = proj(lon, lat, rot);
        if (p.v) { if (f) { ctx.moveTo(p.x, p.y); f = false; } else ctx.lineTo(p.x, p.y); }
        else f = true;
      }
      ctx.stroke();
    }

    for (var lon = 0; lon < 360; lon += 30) {
      ctx.beginPath();
      var f = true;
      for (var lat = -90; lat <= 90; lat += 3) {
        var p = proj(lon, lat, rot);
        if (p.v) { if (f) { ctx.moveTo(p.x, p.y); f = false; } else ctx.lineTo(p.x, p.y); }
        else f = true;
      }
      ctx.stroke();
    }

    ctx.restore();

    var flk = 0.82 + Math.sin(t * 2.2) * 0.18;
    ctx.beginPath(); ctx.arc(gX, gY, gR, 0, 6.283);
    ctx.strokeStyle = 'rgba(80,180,255,' + (0.45 * flk) + ')';
    ctx.lineWidth = 1.1; ctx.stroke();

    ctx.beginPath(); ctx.arc(gX, gY, gR + 2, 0, 6.283);
    ctx.strokeStyle = 'rgba(80,180,255,' + (0.08 * flk) + ')';
    ctx.lineWidth = 0.7; ctx.stroke();
  }

  function drawLabels() {
    var fs = Math.max(7.5, Math.min(9.5, W * 0.014));
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(t * 0.4) * 0.05;
    ctx.font = 'italic ' + fs + 'px "DM Sans",sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';

    ctx.fillStyle = 'rgba(100,200,255,0.85)';
    ctx.fillText('al-duny\u0101', gX, gY + gR + 7);

    ctx.fillStyle = 'rgba(255,218,140,0.85)';
    ctx.fillText('al-\u0101khirah', hX, hY + 48);
    ctx.restore();
  }

  function frame() {
    t += 0.016;

    ctx.fillStyle = '#020205';
    ctx.fillRect(0, 0, W, H);

    drawStars();
    drawHereafter();
    drawBarrier();
    drawDunya();
    drawLabels();

    var vt = ctx.createLinearGradient(0, 0, 0, 16);
    vt.addColorStop(0, 'rgba(2,2,5,0.92)'); vt.addColorStop(1, 'rgba(2,2,5,0)');
    ctx.fillStyle = vt; ctx.fillRect(0, 0, W, 16);
    var vb = ctx.createLinearGradient(0, H - 16, 0, H);
    vb.addColorStop(0, 'rgba(2,2,5,0)'); vb.addColorStop(1, 'rgba(2,2,5,0.92)');
    ctx.fillStyle = vb; ctx.fillRect(0, H - 16, W, 16);
    var vl = ctx.createLinearGradient(0, 0, 16, 0);
    vl.addColorStop(0, 'rgba(2,2,5,0.85)'); vl.addColorStop(1, 'rgba(2,2,5,0)');
    ctx.fillStyle = vl; ctx.fillRect(0, 0, 16, H);

    rafId = requestAnimationFrame(frame);
  }

  frame();

  return {
    stop: function() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    }
  };
};



CardCanvases['wormholes'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height;
  var cx = W / 2, cy = H / 2;

  var stars = [];
  var rng = (function() { var s = 42; return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; })();
  for (var i = 0; i < 55; i++) {
    stars.push({ x: rng() * W, y: rng() * H, r: rng() * 1.0 + 0.2, a: rng() * 0.4 + 0.1 });
  }

  var NUM_ARMS = 10;
  var NUM_PER_ARM = 5;
  var armAngles = [];
  for (var a = 0; a < NUM_ARMS; a++) armAngles.push((a / NUM_ARMS) * Math.PI * 2);

  var frame = 0;
  var NUM_RINGS = 18;
  var SPEED = 0.55;

  function draw() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    stars.forEach(function(s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,' + s.a + ')';
      ctx.fill();
    });

    for (var i = 0; i < NUM_RINGS; i++) {
      var rawPhase = ((frame * SPEED / NUM_RINGS + i / NUM_RINGS) % 1);
      var t = rawPhase * rawPhase;

      var rx = t * W * 0.52;
      var ry = t * H * 0.50;
      if (rx < 1.5) continue;

      var alpha = rawPhase < 0.8
        ? rawPhase * 0.75
        : (1 - rawPhase) / 0.2 * 0.6;

      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(103,232,249,' + alpha.toFixed(2) + ')';
      ctx.lineWidth = 0.6 + t * 1.8;
      ctx.stroke();
    }

    armAngles.forEach(function(angle) {
      for (var p = 0; p < NUM_PER_ARM; p++) {
        var phase = ((frame * 0.018 + p / NUM_PER_ARM) % 1);
        var t2 = phase * phase;
        var maxDist = Math.min(W, H) * 0.48;
        var dist = t2 * maxDist;
        var px = cx + Math.cos(angle) * dist;
        var py = cy + Math.sin(angle) * dist;
        var a2 = (1 - phase) * 0.55;
        var r2 = 0.8 + phase * 1.2;
        ctx.beginPath();
        ctx.arc(px, py, r2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(103,232,249,' + a2.toFixed(2) + ')';
        ctx.fill();
      }
    });

    var grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 48);
    grd.addColorStop(0,   'rgba(167,243,252,0.75)');
    grd.addColorStop(0.25,'rgba(103,232,249,0.30)');
    grd.addColorStop(0.7, 'rgba(103,232,249,0.08)');
    grd.addColorStop(1,   'transparent');
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 48, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    frame++;
    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

//new ants

CardCanvases['ants'] = function(cv) {
  var rafId = null;

  if (!cv) {
    return {
      stop:function(){}
    };
  }

  var ctx = cv.getContext('2d');
  var W = cv.width;
  var H = cv.height;
  var t = 0;

  function camel(x,y,s){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(s,s);

    ctx.fillStyle='rgba(94,234,212,0.95)';

    // body
    ctx.beginPath();
    ctx.moveTo(-26,0);
    ctx.quadraticCurveTo(-10,-18,6,-6);
    ctx.quadraticCurveTo(20,-24,34,-2);
    ctx.lineTo(36,10);
    ctx.lineTo(-24,10);
    ctx.closePath();
    ctx.fill();

    // neck
    ctx.fillRect(28,-18,8,24);

    // head
    ctx.beginPath();
    ctx.arc(36,-20,8,0,Math.PI*2);
    ctx.fill();

    // legs
    ctx.strokeStyle='rgba(94,234,212,0.55)';
    ctx.lineWidth=2;

    for(var i=0;i<4;i++){
      var lx=-18+(i*16);

      ctx.beginPath();
      ctx.moveTo(lx,10);
      ctx.lineTo(lx,28);
      ctx.stroke();
    }

    ctx.restore();
  }

  function frame(){
    ctx.fillStyle='#040810';
    ctx.fillRect(0,0,W,H);

    // desert ground
    ctx.fillStyle='rgba(255,255,255,0.06)';
    ctx.fillRect(0,H*0.74,W,6);

    // moving camels
    for(var i=0;i<3;i++){
      camel(
        ((i*120)+(t*18))%(W+120)-60,
        H*0.56+Math.sin(t+i)*4,
        0.9
      );
    }

    // water glow
    ctx.fillStyle='rgba(94,234,212,0.12)';
    ctx.beginPath();
    ctx.arc(W*0.78,H*0.72,24+Math.sin(t*2)*3,0,Math.PI*2);
    ctx.fill();

    t += 0.02;

    rafId = requestAnimationFrame(frame);
  }

  rafId = requestAnimationFrame(frame);

  return {
    stop:function(){
      if(rafId){
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    }
  };
};

CardCanvases['camel-drinking'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;

  var rng = (function() { var s = 77; return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; })();
  var particles = [];
  for (var i = 0; i < 18; i++) {
    particles.push({ x: rng() * W, y: rng() * H, sz: 0.6 + rng() * 1.2, spd: 0.05 + rng() * 0.12, a: 0.06 + rng() * 0.08 });
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0,    '#07091e');
    bg.addColorStop(0.35, '#2a1240');
    bg.addColorStop(0.65, '#7a2808');
    bg.addColorStop(0.85, '#c8480a');
    bg.addColorStop(1,    '#3a1208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    var duneY = H * 0.74;

    // Particles
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      p.x = (p.x + p.spd) % (W + 4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,240,200,' + Math.min(0.9, (p.a + Math.sin(t * 0.3 + p.x * 0.01) * 0.03) * 5.5) + ')';
      ctx.fill();
    }

    // Dunes
    ctx.beginPath();
    ctx.moveTo(0, H);
    ctx.lineTo(0, duneY + 2);
    ctx.bezierCurveTo(W * 0.15, duneY - 4, W * 0.35, duneY + 4, W * 0.55, duneY);
    ctx.bezierCurveTo(W * 0.75, duneY - 5, W * 0.90, duneY + 3, W, duneY - 1);
    ctx.lineTo(W, H);
    ctx.closePath();
    var dg = ctx.createLinearGradient(0, duneY - 6, 0, H);
    dg.addColorStop(0, 'rgba(210,145,80,0.68)');
    dg.addColorStop(1, 'rgba(80,50,25,0.22)');
    ctx.fillStyle = dg;
    ctx.fill();

    // Camel silhouette
    var cx = W * 0.3, bob = Math.sin(t * 0.04) * 1;
    ctx.strokeStyle = 'rgba(240,190,120,0.88)';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(190,128,72,0.90)';
    ctx.beginPath();
    ctx.ellipse(cx, duneY - 14 + bob, 20, 9, 0, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx - 1, duneY - 24 + bob, 8, 7, 0, Math.PI, 0);
    ctx.fill(); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 14, duneY - 20 + bob);
    ctx.quadraticCurveTo(cx + 20, duneY - 34 + bob, cx + 24, duneY - 38 + bob);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(cx + 25, duneY - 39 + bob, 4.5, 2.8, 0.2, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();

    // Water ripple
    var ripX = cx + 25, ripY = duneY - 32 + bob;
    for (var r = 0; r < 2; r++) {
      var rr = 4 + r * 6 + Math.sin(t * 0.12 + r) * 2;
      ctx.beginPath();
      ctx.arc(ripX, ripY, rr, -0.5, 0.5);
      ctx.strokeStyle = 'rgba(80,210,255,' + (0.65 - r * 0.12) + ')';
      ctx.lineWidth = 0.6;
      ctx.stroke();
    }

    t += 0.02;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['spider-web'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;

  var cx = W * 0.48, cy = H * 0.52;
  var maxRx = W * 0.36, maxRy = H * 0.40;
  var NR = 12, NRing = 5;

  var angles = [];
  for (var i = 0; i < NR; i++) angles.push(i / NR * Math.PI * 2 - Math.PI / 2);

  var rng = (function() { var s = 42; return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; }; })();
  var dews = [];
  for (var r = 2; r <= NRing; r++) {
    for (var a = 0; a < NR; a++) {
      if (rng() > 0.6) {
        dews.push({ r: r, a: a, ph: rng() * 6.283, sz: 0.5 + rng() * 0.9 });
      }
    }
  }

  function pt(a, rF) {
    return [cx + Math.cos(a) * maxRx * rF, cy + Math.sin(a) * maxRy * rF];
  }

  function frame() {
    ctx.clearRect(0, 0, W, H);
    var bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(maxRx, maxRy) * 1.4);
    bg.addColorStop(0, '#060e14');
    bg.addColorStop(1, '#040810');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    for (var i = 0; i < NR; i++) {
      var a = angles[i];
      var end = pt(a, 1);
      var shimT = ((t * 0.01 + i * 0.28) % 1.5);
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(end[0], end[1]);
      if (shimT < 1) {
        var sg = ctx.createLinearGradient(cx, cy, end[0], end[1]);
        sg.addColorStop(0, 'rgba(150,212,190,0.35)');
        sg.addColorStop(Math.max(0.01, shimT - 0.1), 'rgba(150,212,190,0.28)');
        sg.addColorStop(shimT, 'rgba(210,248,232,0.92)');
        sg.addColorStop(Math.min(0.99, shimT + 0.1), 'rgba(150,212,190,0.28)');
        sg.addColorStop(1, 'rgba(150,212,190,0.18)');
        ctx.strokeStyle = sg;
      } else {
        ctx.strokeStyle = 'rgba(150,212,190,0.35)';
      }
      ctx.lineWidth = 0.4;
      ctx.stroke();
    }

    for (var ring = 1; ring <= NRing; ring++) {
      var rF = ring / NRing;
      var wob = Math.sin(t * 0.012 + ring * 0.8) * 0.9 * rF;
      ctx.beginPath();
      for (var i = 0; i <= NR; i++) {
        var a = angles[i % NR];
        var p = pt(a, rF);
        p[0] += Math.cos(a + 1.5708) * wob;
        p[1] += Math.sin(a + 1.5708) * wob;
        if (i === 0) ctx.moveTo(p[0], p[1]);
        else ctx.lineTo(p[0], p[1]);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(150,212,190,' + (0.18 + rF * 0.28) + ')';
      ctx.lineWidth = 0.35;
      ctx.stroke();
    }

    for (var di = 0; di < dews.length; di++) {
      var d = dews[di];
      var rF = d.r / NRing;
      var wob = Math.sin(t * 0.012 + d.r * 0.8) * 0.9 * rF;
      var a = angles[d.a % NR];
      var p = pt(a, rF);
      p[0] += Math.cos(a + 1.5708) * wob;
      p[1] += Math.sin(a + 1.5708) * wob;
      var da = 0.12 + Math.sin(t * 0.035 + d.ph) * 0.09;
      ctx.beginPath();
      ctx.arc(p[0], p[1], d.sz * 3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(150,212,190,' + (da * 0.5) + ')';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(p[0], p[1], d.sz, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(210,248,232,' + Math.min(0.92, da * 5) + ')';
      ctx.fill();
    }

    ctx.fillStyle = 'rgba(94,168,143,0.92)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, 2, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    t += 0.02;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};
CardCanvases['mosquito'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  function drawMosquitoVector(ctx, x, y, scale, wingAngle, isEngorged, pulseVal) {
    ctx.save(); ctx.translate(x, y);
    ctx.beginPath(); ctx.moveTo(scale*1.0,-scale*0.1); ctx.lineTo(scale*2.3,scale*0.4);
    ctx.strokeStyle='rgba(56,189,248,0.85)'; ctx.lineWidth=1.5; ctx.stroke();
    ctx.strokeStyle='rgba(56,189,248,0.45)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-scale*0.2,0); ctx.lineTo(-scale*0.6,-scale*1.2); ctx.lineTo(-scale*1.5,-scale*0.4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(scale*0.2,0); ctx.lineTo(scale*0.5,scale*1.3); ctx.lineTo(scale*1.4,scale*1.9); ctx.stroke();
    ctx.beginPath();
    var abdH = isEngorged ? (scale*0.6+Math.sin(pulseVal)*0.05*scale) : scale*0.35;
    ctx.ellipse(-scale*0.8,scale*0.2,scale*1.3,abdH,Math.PI/10,0,Math.PI*2);
    ctx.fillStyle=isEngorged?'#b8122a':'rgba(18,50,90,0.95)'; ctx.fill(); ctx.strokeStyle=isEngorged?'rgba(239,68,68,0.85)':'rgba(56,189,248,0.6)'; ctx.stroke();
    ctx.beginPath(); ctx.arc(scale*0.2,-scale*0.05,scale*0.45,0,Math.PI*2); ctx.fillStyle='rgba(12,42,78,0.95)'; ctx.strokeStyle='rgba(56,189,248,0.75)'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(scale*0.7,-scale*0.05,scale*0.25,0,Math.PI*2); ctx.fillStyle='rgba(8,28,55,0.95)'; ctx.strokeStyle='rgba(56,189,248,0.7)'; ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(0,-scale*0.2); ctx.rotate(-Math.PI/4+wingAngle);
    ctx.beginPath(); ctx.ellipse(0,-scale*0.8,scale*0.25,scale*0.9,0,0,Math.PI*2);
    ctx.fillStyle='rgba(186,230,253,0.55)'; ctx.fill(); ctx.strokeStyle='rgba(56,189,248,0.92)'; ctx.stroke();
    ctx.restore(); ctx.restore();
  }
  function drawMidgeVector(ctx, x, y, scale, wingOsc, isDocked) {
    ctx.save(); ctx.translate(x,y);
    if(isDocked) ctx.rotate(-Math.PI/6);
    ctx.beginPath(); ctx.ellipse(0,0,scale,scale*0.5,0,0,Math.PI*2);
    ctx.fillStyle='#38bdf8'; ctx.fill(); ctx.strokeStyle='#0284c7'; ctx.stroke();
    ctx.beginPath(); ctx.arc(scale*0.8,-scale*0.1,scale*0.3,0,Math.PI*2); ctx.fillStyle='#0284c7'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(scale*0.9,0); ctx.lineTo(scale*1.4,scale*0.5);
    ctx.strokeStyle='#38bdf8'; ctx.lineWidth=1; ctx.stroke();
    ctx.beginPath();
    var wY=-scale*0.4-Math.sin(wingOsc)*scale*0.5;
    ctx.ellipse(-scale*0.2,wY,scale*0.2,scale*0.6,Math.PI/4,0,Math.PI*2);
    ctx.fillStyle='rgba(255,255,255,0.4)'; ctx.fill(); ctx.restore();
  }
  function frame() {
    var bg=ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#010610'); bg.addColorStop(1,'#05101e');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    var mX=(t*0.9)%(W+80)-40, mY=H*0.43+Math.sin(t*0.05)*12, wOsc=Math.sin(t*0.7)*0.3;
    var glow=ctx.createRadialGradient(mX,mY,0,mX,mY,30);
    glow.addColorStop(0,'rgba(56,189,248,0.14)'); glow.addColorStop(1,'rgba(56,189,248,0)');
    ctx.fillStyle=glow; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.shadowColor='#38bdf8'; ctx.shadowBlur=14;
    drawMosquitoVector(ctx,mX,mY,15,wOsc,true,t*0.05);
    ctx.restore();
    drawMidgeVector(ctx,mX-8,mY-16,4,t*1.2,true);
    ctx.font='bold 15px Amiri,serif'; ctx.fillStyle='rgba(56,189,248,0.72)';
    ctx.textAlign='right'; ctx.fillText('بَعُوضَةً فَمَا فَوْقَهَا',W-18,H-12);
    t++; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['crow-funerals'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  function drawCrowSilhouette(ctx,x,y,size,angle,isFlapping,tickVal){
    ctx.save(); ctx.translate(x,y); ctx.rotate(angle);
    ctx.fillStyle='#324458'; ctx.strokeStyle='rgba(148,163,184,0.78)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.moveTo(-size*0.5,size*0.2); ctx.lineTo(-size*1.6,size*0.5); ctx.lineTo(-size*1.4,size*0.8); ctx.lineTo(-size*0.3,size*0.4); ctx.closePath(); ctx.fill(); ctx.stroke();
    if(isFlapping){
      var flap=Math.sin(tickVal*0.4)*size*1.2;
      ctx.beginPath(); ctx.moveTo(0,-size*0.2); ctx.quadraticCurveTo(size*0.2,-size*1.5-flap,-size*0.5,-size*1.2-flap); ctx.quadraticCurveTo(-size*0.4,-size*0.2,0,0); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else {
      ctx.beginPath(); ctx.ellipse(-size*0.3,size*0.1,size*0.7,size*0.3,Math.PI/12,0,Math.PI*2); ctx.fill(); ctx.stroke();
    }
    ctx.beginPath(); ctx.ellipse(0,0,size,size*0.5,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    var hx=size*0.8,hy=-size*0.3;
    ctx.beginPath(); ctx.arc(hx,hy,size*0.35,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx+size*0.2,hy-size*0.1); ctx.lineTo(hx+size*0.9,hy+size*0.1); ctx.lineTo(hx+size*0.1,hy+size*0.3); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
  function frame() {
    var sky=ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#060818'); sky.addColorStop(0.42,'#12203a');
    sky.addColorStop(0.75,'#3d1808'); sky.addColorStop(1,'#1a0c06');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    var hY=H*0.82, sun=ctx.createRadialGradient(W*0.48,hY,0,W*0.48,hY,W*0.55);
    sun.addColorStop(0,'rgba(255,110,20,0.38)'); sun.addColorStop(1,'rgba(200,65,10,0)');
    ctx.fillStyle=sun; ctx.fillRect(0,0,W,H);
    var crowX=(t*1.2)%(W+60)-30, crowY=H*0.38+Math.sin(t*0.05)*10;
    drawCrowSilhouette(ctx,crowX,crowY,14,-0.05,true,t);
    ctx.font='bold 15px Amiri,serif'; ctx.fillStyle='rgba(255,210,140,0.82)';
    ctx.textAlign='right'; ctx.fillText('لِيُرِيَهُ كَيْفَ يُوَارِي سَوْءَةَ أَخِيهِ',W-18,H-12);
    t++; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['pharaoh-mummy'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var rng = (function(){ var s=91; return function(){ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; })();
  var stars = [];
  for (var i = 0; i < 18; i++) stars.push({ x: rng()*W, y: rng()*H*0.6, r: 0.4+rng()*0.8, ph: rng()*6.28 });

  function frame() {
    ctx.clearRect(0,0,W,H);
    // Night desert sky
    var sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#03030c'); sky.addColorStop(0.6,'#070816');
    sky.addColorStop(0.88,'#180e04'); sky.addColorStop(1,'#221006');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    // Stars
    stars.forEach(function(s) {
      var a=0.3+Math.sin(t*0.02+s.ph)*0.2;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(253,230,138,'+a+')'; ctx.fill();
    });
    // Moon
    ctx.beginPath(); ctx.arc(W*0.82,H*0.15,4,0,Math.PI*2);
    ctx.fillStyle='rgba(255,248,200,0.8)'; ctx.fill();
    // Pyramid
    ctx.beginPath(); ctx.moveTo(W*0.05,H-18); ctx.lineTo(W*0.22,H-52); ctx.lineTo(W*0.39,H-18);
    ctx.fillStyle='rgba(110,70,22,0.55)'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(W*0.42,H-18); ctx.lineTo(W*0.52,H-35); ctx.lineTo(W*0.62,H-18);
    ctx.fillStyle='rgba(90,55,18,0.40)'; ctx.fill();
    // Ground
    var gnd=ctx.createLinearGradient(0,H-18,0,H);
    gnd.addColorStop(0,'rgba(140,90,35,0.50)'); gnd.addColorStop(1,'rgba(70,45,15,0.20)');
    ctx.fillStyle=gnd; ctx.fillRect(0,H-18,W,18);
    // Mummy floating right
    var pX=W*0.78, pY=H*0.44+Math.sin(t*0.025)*2.5;
    var aura=ctx.createRadialGradient(pX,pY,0,pX,pY,22);
    aura.addColorStop(0,'rgba(253,230,138,0.18)'); aura.addColorStop(1,'rgba(253,230,138,0)');
    ctx.fillStyle=aura; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.translate(pX,pY);
    ctx.fillStyle='rgba(210,175,100,0.88)'; ctx.strokeStyle='rgba(253,230,138,0.65)'; ctx.lineWidth=0.7;
    ctx.beginPath(); ctx.roundRect(-7,-18,14,36,3); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(0,-20,6,5,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle='rgba(160,120,50,0.4)'; ctx.lineWidth=0.6;
    [-10,-2,6,14].forEach(function(b){ ctx.beginPath(); ctx.moveTo(-7,b); ctx.lineTo(7,b); ctx.stroke(); });
    var gf=0.7+Math.sin(t*0.05)*0.15;
    ctx.fillStyle='rgba(253,230,138,'+gf+')';
    ctx.beginPath(); ctx.ellipse(0,-20,4,3.5,0,0,Math.PI*2); ctx.fill();
    ctx.restore();
    ctx.font='bold 12px Amiri,serif'; ctx.fillStyle='rgba(253,230,138,0.72)';
    ctx.textAlign='right'; ctx.fillText('نُنَجِّيكَ بِبَدَنِكَ',W-10,H-10);
    t+=0.02; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['reading'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var rng = (function(s){ return function(){ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; })(113);
  /* Brain nodes */
  var bCx = W*0.40, bCy = H*0.50, bRx = W*0.22, bRy = H*0.36;
  var nodes = [];
  for (var i = 0; i < 20; i++) {
    var a=rng()*Math.PI*2, r=0.3+rng()*0.7;
    nodes.push({ x:bCx+Math.cos(a)*bRx*r, y:bCy+Math.sin(a)*bRy*r, r:0.9+rng()*1.4, ph:rng()*6.28 });
  }
  var vwfaN = [];
  for (var j = 0; j < 6; j++) vwfaN.push({ x:bCx-bRx*0.52+(rng()-0.5)*18, y:bCy+bRy*0.10+(rng()-0.5)*12, r:1.5+rng()*1.0, ph:rng()*6.28 });
  var edges = [];
  for (var k = 0; k < 14; k++) {
    var ai=Math.floor(rng()*nodes.length), bi=Math.floor(rng()*nodes.length);
    if(ai!==bi) edges.push({a:ai,b:bi,ph:rng()*6.28});
  }
  function frame() {
    ctx.fillStyle='#06020e'; ctx.fillRect(0,0,W,H);
    /* Brain glow */
    var bg=ctx.createRadialGradient(bCx,bCy,0,bCx,bCy,bRx*1.1);
    bg.addColorStop(0,'rgba(240,171,252,0.07)'); bg.addColorStop(1,'rgba(240,171,252,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    /* Brain outline */
    ctx.strokeStyle='rgba(240,171,252,0.45)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.ellipse(bCx,bCy,bRx,bRy,0,0,Math.PI*2); ctx.stroke();
    /* Edges */
    edges.forEach(function(e){
      var na=nodes[e.a], nb=nodes[e.b];
      var a=0.05+Math.sin(t*2+e.ph)*0.08;
      ctx.strokeStyle='rgba(240,171,252,'+a+')'; ctx.lineWidth=0.5;
      ctx.beginPath(); ctx.moveTo(na.x,na.y); ctx.lineTo(nb.x,nb.y); ctx.stroke();
    });
    /* Nodes */
    nodes.forEach(function(n){
      var a=0.20+Math.sin(t*1.8+n.ph)*0.14;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle='rgba(240,171,252,'+a+')'; ctx.fill();
    });
    /* VWFA nodes glowing */
    var vg=0.65+Math.sin(t*3.5)*0.2;
    ctx.save(); ctx.shadowColor='rgba(240,171,252,0.8)'; ctx.shadowBlur=8;
    vwfaN.forEach(function(n){
      var a=vg+Math.sin(t*4+n.ph)*0.18;
      ctx.beginPath(); ctx.arc(n.x,n.y,n.r,0,Math.PI*2);
      ctx.fillStyle='rgba(240,171,252,'+a+')'; ctx.fill();
    });
    ctx.restore();
    /* اقرأ label */
    ctx.font='bold 14px Amiri,serif'; ctx.fillStyle='rgba(240,171,252,0.65)';
    ctx.textAlign='center'; ctx.fillText('اقْرَأْ', W*0.78, H*0.46);
    ctx.font='600 8px DM Sans,sans-serif'; ctx.fillStyle='rgba(240,171,252,0.35)';
    ctx.fillText('VWFA · prewired', bCx-bRx*0.52, bCy+bRy*0.50);
    t+=0.02; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['pharaoh-mourning'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var rng = (function(s){ return function(){ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; })(53);
  var stars = [];
  for (var i = 0; i < 28; i++) stars.push({ x:rng()*W, y:rng()*H*0.62, r:0.4+rng()*0.9, ph:rng()*6.28, shaking:i<8 });
  var tears = [];
  for (var j = 0; j < 10; j++) tears.push({ x:10+rng()*(W-20), y:rng()*H*0.55, vy:0.35+rng()*0.5, len:4+rng()*7, a:0.22+rng()*0.35, ph:rng()*6.28 });
  function frame() {
    var sky = ctx.createLinearGradient(0,0,0,H);
    sky.addColorStop(0,'#020610'); sky.addColorStop(0.6,'#030918'); sky.addColorStop(1,'#080710');
    ctx.fillStyle=sky; ctx.fillRect(0,0,W,H);
    /* Stars */
    stars.forEach(function(s){
      var ox=s.shaking?Math.sin(t*6+s.ph)*1.2:0, oy=s.shaking?Math.cos(t*4.5+s.ph)*0.8:0;
      var a=0.30+Math.sin(t*1.2+s.ph)*0.22;
      ctx.save(); if(s.shaking){ctx.shadowColor='rgba(165,243,252,0.6)';ctx.shadowBlur=4;}
      ctx.beginPath(); ctx.arc(s.x+ox,s.y+oy,s.r,0,Math.PI*2);
      ctx.fillStyle=s.shaking?'rgba(165,243,252,'+(a+0.18)+')':'rgba(200,220,255,'+a+')';
      ctx.fill(); ctx.restore();
    });
    /* Tears */
    tears.forEach(function(d){
      d.y+=d.vy; if(d.y>H*0.70){d.y=rng()*H*0.22; d.x=10+rng()*(W-20);}
      var da=d.a*(0.7+0.3*Math.sin(t*2+d.ph));
      var tg=ctx.createLinearGradient(d.x,d.y-d.len,d.x,d.y+3);
      tg.addColorStop(0,'rgba(165,243,252,0)'); tg.addColorStop(0.7,'rgba(165,243,252,'+da+')'); tg.addColorStop(1,'rgba(210,245,255,'+(da*0.8)+')');
      ctx.strokeStyle=tg; ctx.lineWidth=1; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(d.x,d.y-d.len); ctx.lineTo(d.x,d.y+3); ctx.stroke();
      ctx.beginPath(); ctx.arc(d.x,d.y+3,1.2,0,Math.PI*2);
      ctx.fillStyle='rgba(165,243,252,'+da+')'; ctx.fill();
    });
    /* Ground + pyramid */
    ctx.fillStyle='rgba(45,25,14,0.85)'; ctx.fillRect(0,H-20,W,20);
    ctx.beginPath(); ctx.moveTo(W*0.38,H-20); ctx.lineTo(W*0.55,H-52); ctx.lineTo(W*0.72,H-20); ctx.closePath();
    ctx.fillStyle='rgba(50,28,16,0.88)'; ctx.fill();
    ctx.strokeStyle='rgba(165,243,252,0.18)'; ctx.lineWidth=0.5; ctx.stroke();
    /* Label */
    ctx.font='bold 9px Amiri,serif'; ctx.fillStyle='rgba(165,243,252,0.55)';
    ctx.textAlign='center'; ctx.fillText('السَّمَاءُ وَالْأَرْضُ', W/2, H-6);
    t+=0.02; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['paper-money'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var rng = (function(s){ return function(){ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; })(91);
  var particles = [];
  for (var i = 0; i < 12; i++) particles.push({ x:rng()*W, y:rng()*H, vx:(rng()-0.5)*0.25, vy:-0.12-rng()*0.15, a:0.15+rng()*0.3, r:0.7+rng()*1.2 });
  function frame() {
    ctx.fillStyle='#040e14'; ctx.fillRect(0,0,W,H);
    /* Note body */
    var nx=W*0.2, ny=4, nw=W*0.6, nh=H-8;
    var pg=0.5+Math.sin(t*0.05)*0.18;
    ctx.save(); ctx.shadowColor='rgba(125,211,252,0.4)'; ctx.shadowBlur=14+pg*6;
    var parch=ctx.createLinearGradient(nx,ny,nx+nw,ny+nh);
    parch.addColorStop(0,'rgba(180,130,70,0.10)'); parch.addColorStop(0.5,'rgba(200,155,80,0.16)'); parch.addColorStop(1,'rgba(170,120,60,0.10)');
    ctx.fillStyle=parch; ctx.beginPath(); ctx.roundRect(nx,ny,nw,nh,4); ctx.fill();
    ctx.strokeStyle='rgba(125,211,252,'+(0.30+pg*0.14)+')'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(nx,ny,nw,nh,4); ctx.stroke();
    ctx.restore();
    /* Coin circles */
    for(var ci=0;ci<5;ci++){
      var cx2=nx+12+ci*(nw-18)/4.2, coinY=ny+12;
      var cp=0.40+Math.sin(t*0.06+ci*1.1)*0.12;
      ctx.strokeStyle='rgba(125,211,252,'+cp+')'; ctx.lineWidth=0.8;
      ctx.beginPath(); ctx.arc(cx2,coinY,5,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle='rgba(125,211,252,'+(cp*0.5)+')';
      ctx.fillRect(cx2-1.5,coinY-1.5,3,3);
    }
    /* Script lines */
    ['rgba(125,211,252,0.28)','rgba(125,211,252,0.18)','rgba(125,211,252,0.22)'].forEach(function(c,si){
      var sx=nx+14+si*(nw-20)/2.2; ctx.strokeStyle=c; ctx.lineWidth=0.7;
      [0.42,0.54,0.65,0.75,0.84].forEach(function(fy2){
        var fw=3+rng()*8;
        ctx.beginPath(); ctx.moveTo(sx-fw/2,ny+nh*fy2); ctx.lineTo(sx+fw/2,ny+nh*fy2); ctx.stroke();
      });
    });
    /* Label */
    ctx.font='700 8px DM Sans,sans-serif'; ctx.fillStyle='rgba(125,211,252,0.52)';
    ctx.textAlign='center'; ctx.fillText('بِوَرِقِكُمْ', W/2, H-6);
    /* Particles */
    particles.forEach(function(p){
      p.x+=p.vx; p.y+=p.vy; if(p.y<-3){p.y=H+3;p.x=rng()*W;}
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(125,211,252,'+p.a+')'; ctx.fill();
    });
    t+=0.02; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['haman'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var rng = (function(s){ return function(){ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; })(77);
  /* Hieroglyph marks in columns */
  var marks = [];
  for (var i = 0; i < 40; i++) marks.push({ x: 12 + rng()*(W*0.56), y: 8 + rng()*(H-16), w: 3+rng()*8, h: 2+rng()*6, t: Math.floor(rng()*4), ph: rng()*6.28 });
  /* Haman name glyphs — glowing green band */
  var nameGlyphs = [
    { x:W*0.68, y:H*0.30, w:10, h:7 }, { x:W*0.73, y:H*0.26, w:7,  h:10 },
    { x:W*0.78, y:H*0.31, w:9,  h:6 }, { x:W*0.83, y:H*0.28, w:6,  h:9  },
    { x:W*0.88, y:H*0.30, w:11, h:7 }, { x:W*0.93, y:H*0.27, w:7,  h:8  }
  ];
  function frame() {
    var bg = ctx.createLinearGradient(0,0,0,H);
    bg.addColorStop(0,'#060d08'); bg.addColorStop(1,'#040a06');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    /* Stone lines */
    ctx.strokeStyle='rgba(74,222,128,0.04)'; ctx.lineWidth=0.5;
    for(var y=12;y<H;y+=16){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
    /* Dim hieroglyphs */
    marks.forEach(function(m){
      var a=0.12+Math.sin(t*0.01+m.ph)*0.05;
      ctx.globalAlpha=a; ctx.fillStyle='#86efac';
      switch(m.t){
        case 0: ctx.fillRect(m.x-m.w/2,m.y-m.h/2,m.w,m.h); break;
        case 1: ctx.beginPath();ctx.ellipse(m.x,m.y,m.w/2,m.h/2,0,0,Math.PI*2);ctx.fill();break;
        case 2: ctx.beginPath();ctx.moveTo(m.x,m.y-m.h/2);ctx.lineTo(m.x+m.w/2,m.y+m.h/2);ctx.lineTo(m.x-m.w/2,m.y+m.h/2);ctx.closePath();ctx.fill();break;
        case 3: ctx.beginPath();ctx.moveTo(m.x-m.w/2,m.y);ctx.lineTo(m.x,m.y-m.h/2);ctx.lineTo(m.x+m.w/2,m.y);ctx.lineTo(m.x,m.y+m.h/2);ctx.closePath();ctx.fill();break;
      }
      ctx.globalAlpha=1;
    });
    /* Glow box for name */
    var glow=0.5+Math.sin(t*0.05)*0.2;
    ctx.save();
    ctx.shadowColor='rgba(74,222,128,0.7)'; ctx.shadowBlur=14+glow*6;
    var bx=W*0.64,by=H*0.16,bw=W*0.34,bh=H*0.52;
    ctx.strokeStyle='rgba(74,222,128,'+(0.4+glow*0.2)+')'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,3); ctx.stroke();
    ctx.fillStyle='rgba(74,222,128,'+(0.05+glow*0.04)+')';
    ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,3); ctx.fill();
    ctx.restore();
    /* Name glyphs */
    ctx.save();
    ctx.shadowColor='rgba(74,222,128,0.9)'; ctx.shadowBlur=6;
    nameGlyphs.forEach(function(g){
      var a=0.7+Math.sin(t*0.06+g.x)*0.18;
      ctx.globalAlpha=a; ctx.fillStyle='#4ade80';
      ctx.fillRect(g.x-g.w/2,g.y-g.h/2,g.w,g.h);
    });
    ctx.globalAlpha=1; ctx.restore();
    /* Label */
    ctx.font='700 8px DM Sans,sans-serif'; ctx.fillStyle='rgba(74,222,128,0.55)';
    ctx.textAlign='center'; ctx.fillText('هَامَانُ · HAMAN FOUND', W*0.81, H-7);
    t+=0.02; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['pharaoh-crucifixion'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var rng = (function(s){ return function(){ s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; }; })(42);
  var stars = [];
  for (var i = 0; i < 22; i++) stars.push({ x: rng()*W, y: rng()*H*0.65, r: rng()*1.4+0.4, p: rng()*Math.PI*2 });
  function frame() {
    // Egyptian desert night sky
    var sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, '#06020f');
    sky.addColorStop(0.6, '#120820');
    sky.addColorStop(1, '#2a1208');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, H);
    // stars
    stars.forEach(function(s) {
      var a = 0.5 + 0.4 * Math.sin(t * 1.1 + s.p);
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(232,121,249,' + a + ')'; ctx.fill();
    });
    // crescent moon
    var mx = W * 0.82, my = H * 0.18;
    ctx.save();
    ctx.beginPath(); ctx.arc(mx, my, 9, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(232,121,249,0.85)'; ctx.fill();
    ctx.beginPath(); ctx.arc(mx + 5, my - 2, 7.5, 0, Math.PI*2);
    ctx.fillStyle = '#06020f'; ctx.fill();
    ctx.restore();
    // ground / sand
    var gnd = ctx.createLinearGradient(0, H*0.72, 0, H);
    gnd.addColorStop(0, 'rgba(80,40,10,0.9)');
    gnd.addColorStop(1, 'rgba(40,18,4,1)');
    ctx.fillStyle = gnd;
    ctx.beginPath(); ctx.rect(0, H*0.72, W, H*0.28); ctx.fill();
    // upright stake
    var sx = W * 0.48, stakeTop = H * 0.22, stakeBot = H * 0.72;
    ctx.save();
    ctx.shadowColor = 'rgba(232,121,249,0.7)'; ctx.shadowBlur = 10;
    ctx.strokeStyle = 'rgba(232,121,249,0.90)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(sx, stakeTop); ctx.lineTo(sx, stakeBot); ctx.stroke();
    ctx.restore();
    // impaled figure (bent forward — matches Egyptian hieroglyph)
    var fig = 0.5 + 0.035 * Math.sin(t * 0.9);
    ctx.save();
    ctx.globalAlpha = fig;
    ctx.strokeStyle = 'rgba(232,121,249,0.88)'; ctx.lineWidth = 2;
    ctx.shadowColor = 'rgba(232,121,249,0.5)'; ctx.shadowBlur = 8;
    // torso bent forward over stake
    var ty = stakeTop + (stakeBot - stakeTop) * 0.35;
    ctx.beginPath(); ctx.moveTo(sx, ty); ctx.lineTo(sx - 18, ty + 14); ctx.stroke(); // torso forward
    // legs hang down from stake
    ctx.beginPath(); ctx.moveTo(sx, ty + 8); ctx.lineTo(sx - 8, ty + 28); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, ty + 8); ctx.lineTo(sx + 4, ty + 28); ctx.stroke();
    // arms dangle
    ctx.beginPath(); ctx.moveTo(sx - 10, ty + 4); ctx.lineTo(sx - 24, ty + 18); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx - 10, ty + 4); ctx.lineTo(sx - 6, ty + 18); ctx.stroke();
    // head
    ctx.beginPath(); ctx.arc(sx - 20, ty + 12, 4, 0, Math.PI*2);
    ctx.fillStyle = 'rgba(232,121,249,0.82)'; ctx.fill();
    ctx.restore();
    // hieroglyph label
    ctx.font = 'bold 9px DM Sans,sans-serif';
    ctx.fillStyle = 'rgba(232,121,249,0.60)';
    ctx.textAlign = 'center';
    ctx.fillText('ذِي الْأَوْتَادِ', W * 0.5, H - 8);
    t += 0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['atmosphere'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var A = '#bae6fd';

  // deterministic particles
  function mkRng(seed) {
    var s = seed;
    return function() { s=(s*1664525+1013904223)&0xffffffff; return (s>>>0)/0xffffffff; };
  }
  var r = mkRng(5521);
  var pts = [];
  for (var i = 0; i < 70; i++) {
    var py = r() * H, px = r() * (W * 0.62);
    var dens = (py / H) * 0.85 + 0.15;
    if (r() < dens) {
      var frac = py / H;
      var col = frac > 0.62 ? '#22c55e' : frac > 0.35 ? '#f59e0b' : '#f87171';
      pts.push({ x: px, y: py, ph: r() * Math.PI * 2, r: 1.2 + r() * 1.6, col: col });
    }
  }

  function frame() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    // altitude gradient
    var grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0,   'rgba(248,113,113,0.10)');
    grad.addColorStop(0.35,'rgba(249,115,22,0.06)');
    grad.addColorStop(1,   'rgba(34,197,94,0.04)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W * 0.65, H);

    // drifting O2 particles
    pts.forEach(function(p) {
      var drift = (t * 0.28 + p.ph) % (H + 4);
      var dy = p.y - drift;
      if (dy < -4) return;
      var frac = dy / H;
      ctx.beginPath(); ctx.arc(p.x, dy, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.col;
      ctx.globalAlpha = Math.max(0, 0.2 + frac * 0.65);
      ctx.fill();
    });

    // mountain silhouette
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.moveTo(0, H); ctx.lineTo(0, H * 0.72);
    ctx.lineTo(W*0.06, H*0.58); ctx.lineTo(W*0.13, H*0.64);
    ctx.lineTo(W*0.22, H*0.34); ctx.lineTo(W*0.30, H*0.47);
    ctx.lineTo(W*0.38, H*0.10); // peak
    ctx.lineTo(W*0.46, H*0.40); ctx.lineTo(W*0.55, H*0.28);
    ctx.lineTo(W*0.62, H*0.58); ctx.lineTo(W*0.65, H);
    ctx.closePath();
    ctx.fillStyle = 'rgba(18,38,62,0.92)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(186,230,253,0.28)';
    ctx.lineWidth = 1.2; ctx.stroke();

    // death zone label
    ctx.globalAlpha = 0.58;
    ctx.font = 'bold 7px DM Sans,sans-serif';
    ctx.fillStyle = '#f87171'; ctx.textAlign = 'left';
    ctx.fillText('DEATH ZONE', 4, 10);

    // pressure bar (right side)
    var bx = W*0.68, by = 10, bh = H - 20, bw = W*0.04;
    var barGrad = ctx.createLinearGradient(0, by, 0, by + bh);
    barGrad.addColorStop(0, '#f87171'); barGrad.addColorStop(0.4, '#f59e0b'); barGrad.addColorStop(1, '#22c55e');
    ctx.globalAlpha = 0.75;
    ctx.fillStyle = barGrad;
    ctx.beginPath(); ctx.roundRect(bx, by, bw, bh, 3); ctx.fill();

    // Arabic verse
    ctx.globalAlpha = 0.75;
    ctx.font = 'bold 10px Amiri,serif';
    ctx.fillStyle = A; ctx.textAlign = 'right';
    ctx.fillText('يَصَّعَّدُ فِي السَّمَاءِ', W - 4, H * 0.45);
    ctx.globalAlpha = 0.32;
    ctx.font = '7px DM Sans,sans-serif';
    ctx.fillStyle = '#7a8fa3';
    ctx.fillText('6:125', W - 4, H * 0.58);

    ctx.globalAlpha = 1;
    t += 0.02;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['skin-memory'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var A = '#d946ef';
  var BX = W*0.22, BY = H*0.50, BR = H*0.14;
  var AXON_END = W*0.72;

  function frame() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    // Dendrites
    ctx.strokeStyle = 'rgba(217,70,239,0.42)';
    ctx.lineWidth = 1.2;
    ctx.lineCap = 'round';
    var d = [[BX-BR,BY-BR*0.6, BX-BR*2.2,BY-BR*1.6],
             [BX-BR*0.7,BY-BR, BX-BR*1.2,BY-BR*2.5],
             [BX-BR,BY+BR*0.6, BX-BR*2.2,BY+BR*1.6],
             [BX-BR*0.7,BY+BR, BX-BR*1.2,BY+BR*2.5]];
    d.forEach(function(s){
      ctx.beginPath(); ctx.moveTo(s[0],s[1]); ctx.lineTo(s[2],s[3]); ctx.stroke();
    });

    // Cell body
    ctx.save();
    ctx.shadowColor=A; ctx.shadowBlur=10;
    ctx.beginPath(); ctx.arc(BX,BY,BR,0,Math.PI*2);
    ctx.fillStyle='rgba(217,70,239,0.10)'; ctx.fill();
    ctx.strokeStyle=A; ctx.lineWidth=1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(BX,BY,BR*0.4,0,Math.PI*2);
    ctx.fillStyle='rgba(217,70,239,0.25)'; ctx.fill();
    ctx.restore();

    // Axon
    ctx.strokeStyle='rgba(217,70,239,0.48)'; ctx.lineWidth=1.4;
    ctx.beginPath(); ctx.moveTo(BX+BR,BY); ctx.lineTo(AXON_END,BY); ctx.stroke();

    // Myelin
    ctx.strokeStyle='rgba(217,70,239,0.14)'; ctx.lineWidth=4; ctx.lineCap='square';
    for (var mx=BX+BR+H*0.08; mx<AXON_END-H*0.08; mx+=H*0.25){
      ctx.beginPath(); ctx.moveTo(mx,BY); ctx.lineTo(mx+H*0.14,BY); ctx.stroke();
    }
    ctx.lineCap='round';

    // Skin cell (target)
    var sx=W*0.82, sy=BY;
    var glow=(Math.sin(t*0.12)+1)/2;
    ctx.save();
    ctx.shadowColor=A; ctx.shadowBlur=8*glow;
    ctx.strokeStyle='rgba(217,70,239,'+(0.4+glow*0.4)+')'; ctx.lineWidth=1.4;
    ctx.beginPath();
    ctx.moveTo(sx-H*0.18,sy-H*0.10);
    ctx.bezierCurveTo(sx-H*0.08,sy-H*0.18,sx+H*0.12,sy-H*0.16,sx+H*0.18,sy-H*0.06);
    ctx.bezierCurveTo(sx+H*0.22,sy+H*0.06,sx+H*0.14,sy+H*0.15,sx+H*0.04,sy+H*0.16);
    ctx.bezierCurveTo(sx-H*0.06,sy+H*0.18,sx-H*0.18,sy+H*0.10,sx-H*0.20,sy+H*0.02);
    ctx.bezierCurveTo(sx-H*0.22,sy-H*0.04,sx-H*0.22,sy-H*0.06,sx-H*0.18,sy-H*0.10);
    ctx.stroke();
    // memory nodes
    [[sx-H*0.04,sy-H*0.04],[sx+H*0.06,sy-H*0.03],[sx,sy+H*0.05]].forEach(function(n,i){
      var ng=(Math.sin(t*0.14+i*1.5)+1)/2;
      ctx.beginPath(); ctx.arc(n[0],n[1],H*0.025,0,Math.PI*2);
      ctx.fillStyle='rgba(217,70,239,'+(0.25+ng*0.65)+')'; ctx.globalAlpha=1; ctx.fill();
    });
    ctx.restore();

    // Signal pulse
    var p=(t*0.38)%1;
    var px=(BX+BR)+p*(AXON_END-BX-BR);
    ctx.save();
    ctx.shadowColor=A; ctx.shadowBlur=16;
    ctx.beginPath(); ctx.arc(px,BY,H*0.038,0,Math.PI*2);
    ctx.fillStyle='#fff'; ctx.fill();
    ctx.restore();
    for (var i=1;i<=3;i++){
      var tp=p-i*0.02; if(tp<0) continue;
      var tx2=(BX+BR)+tp*(AXON_END-BX-BR);
      ctx.beginPath(); ctx.arc(tx2,BY,H*0.025-i*H*0.004,0,Math.PI*2);
      ctx.fillStyle='rgba(217,70,239,'+(0.5-i*0.13)+')'; ctx.fill();
    }

    ctx.globalAlpha = 1;
    t += 0.02;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['inner-ear'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var ACCENT = '#fde68a';

  function frame() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    var cx = W * 0.42, cy = H * 0.60;

    // strike pulse rings
    var p1 = (t * 0.28) % 1, p2 = (t * 0.28 + 0.5) % 1;
    [p1, p2].forEach(function(p) {
      ctx.beginPath();
      ctx.arc(cx, cy - H * 0.08, p * H * 0.72, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(253,230,138,' + ((1 - p) * 0.5) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // cochlea spiral
    ctx.save();
    ctx.shadowColor = 'rgba(253,230,138,0.5)';
    ctx.shadowBlur = 6;
    ctx.strokeStyle = ACCENT;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    var r0 = 3, r1 = H * 0.22, turns = 2.5;
    for (var i = 0; i <= 200; i++) {
      var ang = (i / 200) * turns * Math.PI * 2 - Math.PI * 0.5;
      var r = r0 + (r1 - r0) * (i / 200);
      var x = cx + r * Math.cos(ang);
      var y = cy + r * Math.sin(ang);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();

    // 3 semicircular canals (simplified arcs above cochlea)
    var canY = cy - H * 0.30;
    ctx.lineWidth = 1.4;
    // lateral
    ctx.beginPath();
    ctx.ellipse(cx, canY, H * 0.22, H * 0.07, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(253,230,138,0.65)';
    ctx.stroke();
    // anterior
    ctx.save();
    ctx.translate(cx + H * 0.10, canY + H * 0.02);
    ctx.rotate(0.36);
    ctx.beginPath();
    ctx.ellipse(0, 0, H * 0.09, H * 0.20, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(253,230,138,0.50)';
    ctx.stroke();
    ctx.restore();
    // posterior
    ctx.save();
    ctx.translate(cx - H * 0.10, canY + H * 0.02);
    ctx.rotate(-0.30);
    ctx.beginPath();
    ctx.ellipse(0, 0, H * 0.09, H * 0.18, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(253,230,138,0.42)';
    ctx.stroke();
    ctx.restore();

    // balance level at bottom
    var bx = cx, by = H * 0.92, bw = H * 0.45;
    var tilt = Math.sin(t * 0.22) * 0.18;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(tilt);
    ctx.strokeStyle = 'rgba(253,230,138,0.38)';
    ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-bw/2, 0); ctx.lineTo(bw/2, 0); ctx.stroke();
    ctx.beginPath();
    ctx.arc(tilt * bw * 0.5, 0, 4, 0, Math.PI * 2);
    ctx.fillStyle = ACCENT;
    ctx.globalAlpha = 0.75;
    ctx.fill();
    ctx.restore();

    ctx.globalAlpha = 1;
    t += 0.02;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['brainstem'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var CYCLE = 320;
  // EEG buffer
  var waveBuf = [];
  for (var i = 0; i < 60; i++) waveBuf.push(0);

  function frame() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);

    var phase = t % CYCLE;
    var isSleep = phase < 160;
    var bsColor = isSleep ? '#22d3ee' : '#f87171';
    var bsGlow  = isSleep ? 'rgba(34,211,238,0.55)' : 'rgba(248,113,113,0.55)';

    // brain outline — simple side view
    var bx = W * 0.30, by = H * 0.44;
    var br = H * 0.28;
    // cerebrum dome
    ctx.beginPath();
    ctx.moveTo(bx - br * 0.55, by + br * 0.55);
    ctx.bezierCurveTo(bx - br * 0.75, by - br * 0.3, bx - br * 0.4, by - br * 1.05, bx + br * 0.05, by - br * 1.0);
    ctx.bezierCurveTo(bx + br * 0.55, by - br * 0.95, bx + br * 0.85, by - br * 0.4, bx + br * 0.75, by + br * 0.2);
    ctx.strokeStyle = 'rgba(100,130,160,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // cerebellum
    ctx.beginPath();
    ctx.moveTo(bx + br * 0.55, by + br * 0.18);
    ctx.bezierCurveTo(bx + br * 0.85, by + br * 0.55, bx + br * 0.6, by + br * 0.85, bx + br * 0.28, by + br * 0.72);
    ctx.strokeStyle = 'rgba(100,130,160,0.38)';
    ctx.lineWidth = 1.2;
    ctx.stroke();
    // brainstem stalk — glowing, color-coded
    var bsTop = { x: bx + br * 0.18, y: by + br * 0.60 };
    var bsBot = { x: bx + br * 0.08, y: by + br * 1.05 };
    ctx.save();
    ctx.shadowColor = bsGlow;
    ctx.shadowBlur = 10 + 4 * Math.sin(t * 0.12);
    ctx.beginPath();
    ctx.moveTo(bsTop.x - 7, bsTop.y);
    ctx.bezierCurveTo(bsTop.x - 6, bsTop.y + 10, bsBot.x - 5, bsBot.y - 10, bsBot.x - 4, bsBot.y);
    ctx.lineTo(bsBot.x + 4, bsBot.y);
    ctx.bezierCurveTo(bsBot.x + 5, bsBot.y - 10, bsTop.x + 6, bsTop.y + 10, bsTop.x + 7, bsTop.y);
    ctx.closePath();
    ctx.fillStyle = bsColor;
    ctx.globalAlpha = 0.82 + 0.12 * Math.sin(t * 0.14);
    ctx.fill();
    ctx.restore();

    // state label above brain
    ctx.globalAlpha = 1;
    ctx.font = 'bold 10px DM Sans,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = bsColor;
    ctx.fillText(isSleep ? 'SLEEP' : 'DEATH', bx + br * 0.1, by - br * 1.15);

    // EEG wave — right panel
    var waveVal;
    if (isSleep) {
      waveVal = Math.sin(t * 0.28) * 9 + Math.sin(t * 0.14) * 4 + Math.sin(t * 0.55) * 2;
    } else {
      waveVal = (Math.random() < 0.015) ? (Math.random() > 0.5 ? 14 : -14) : 0;
    }
    waveBuf.push(waveVal);
    if (waveBuf.length > 60) waveBuf.shift();

    var wx = W * 0.60, wy = H * 0.5, ww = W * 0.36, wh = H * 0.32;
    ctx.strokeStyle = bsColor;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    for (var i = 0; i < waveBuf.length; i++) {
      var px = wx + (i / (waveBuf.length - 1)) * ww;
      var py = wy + waveBuf[i] * (wh / 30);
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.stroke();
    // baseline
    ctx.globalAlpha = 0.18;
    ctx.strokeStyle = '#4a6080';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(wx, wy); ctx.lineTo(wx + ww, wy); ctx.stroke();

    // label under wave
    ctx.globalAlpha = 0.55;
    ctx.font = '8px DM Sans,sans-serif';
    ctx.fillStyle = '#7a8fa3';
    ctx.textAlign = 'center';
    ctx.fillText('EEG', wx + ww / 2, wy + wh / 2 + 10);

    ctx.globalAlpha = 1;
    t += 0.02; rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};

CardCanvases['ring-composition'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var COLS = [{r:232,g:121,b:249},{r:167,g:139,b:250},{r:96,g:165,b:250},{r:74,g:222,b:128},{r:252,g:211,b:77},{r:74,g:222,b:128},{r:96,g:165,b:250},{r:167,g:139,b:250},{r:232,g:121,b:249}];
  function rgba(c,a){return 'rgba('+c.r+','+c.g+','+c.b+','+a+')';}
  function frame() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);
    var margin=W*0.06, baseY=H*0.75, topY=H*0.18;
    var nodes=[];
    for(var i=0;i<9;i++){
      var x=margin+i*(W-2*margin)/8;
      var y=baseY-(baseY-topY)*Math.sin(Math.PI*i/8);
      nodes.push({x:x,y:y,c:COLS[i]});
    }
    // Mirror arcs
    for(var i=0;i<4;i++){
      var n1=nodes[i],n2=nodes[8-i];
      var depth=(n2.x-n1.x)*0.30,my=Math.max(n1.y,n2.y)+depth;
      var pulse=0.28+Math.sin(t*0.04+i*0.9)*0.10;
      ctx.beginPath();ctx.moveTo(n1.x,n1.y);
      ctx.bezierCurveTo(n1.x,my,n2.x,my,n2.x,n2.y);
      ctx.strokeStyle=rgba(n1.c,pulse);ctx.lineWidth=1.1;ctx.stroke();
    }
    // Nodes
    for(var i=0;i<9;i++){
      var nd=nodes[i],r=i===4?5:3.5;
      var pulse=0.35+Math.sin(t*0.05+i*0.7)*0.15;
      ctx.beginPath();ctx.arc(nd.x,nd.y,r*2.4,0,Math.PI*2);
      ctx.fillStyle=rgba(nd.c,pulse*0.12);ctx.fill();
      ctx.beginPath();ctx.arc(nd.x,nd.y,r,0,Math.PI*2);
      ctx.fillStyle=rgba(nd.c,0.85);ctx.fill();
    }
    t+=0.8; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return {stop:function(){if(rafId){cancelAnimationFrame(rafId);rafId=null;}}};
};

CardCanvases['celestial-orbits'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var SX=W*0.42,SY=H*0.52,ERX=W*0.26,ERY=H*0.26;
  function rgba(r,g,b,a){return 'rgba('+r+','+g+','+b+','+a+')';}
  function frame() {
    ctx.fillStyle='#040810'; ctx.fillRect(0,0,W,H);
    /* Earth orbit path */
    ctx.beginPath(); ctx.ellipse(SX,SY,ERX,ERY,0,0,Math.PI*2);
    ctx.strokeStyle='rgba(125,211,252,0.10)'; ctx.lineWidth=0.8; ctx.stroke();
    /* Sun */
    var sg=ctx.createRadialGradient(SX,SY,0,SX,SY,H*0.22);
    sg.addColorStop(0,'rgba(255,220,100,0.85)'); sg.addColorStop(0.4,'rgba(255,140,40,0.20)'); sg.addColorStop(1,'rgba(255,140,40,0)');
    ctx.fillStyle=sg; ctx.fillRect(0,0,W,H);
    ctx.beginPath(); ctx.arc(SX,SY,6,0,Math.PI*2); ctx.fillStyle='#ffe066'; ctx.fill();
    /* Earth */
    var ea=t*0.012;
    var EX=SX+Math.cos(ea)*ERX, EY=SY+Math.sin(ea)*ERY;
    /* Moon orbit */
    ctx.beginPath(); ctx.arc(EX,EY,H*0.14,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=0.5; ctx.stroke();
    /* Moon */
    var ma=t*0.048;
    ctx.beginPath(); ctx.arc(EX+Math.cos(ma)*H*0.14,EY+Math.sin(ma)*H*0.14,2.5,0,Math.PI*2);
    ctx.fillStyle='rgba(200,215,225,0.75)'; ctx.fill();
    /* Earth dot */
    var eg=ctx.createRadialGradient(EX,EY,0,EX,EY,5);
    eg.addColorStop(0,'#5aabf5'); eg.addColorStop(1,'#1a4a90');
    ctx.beginPath(); ctx.arc(EX,EY,5,0,Math.PI*2); ctx.fillStyle=eg; ctx.fill();
    /* label */
    ctx.fillStyle='rgba(125,211,252,0.30)'; ctx.font='8px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='alphabetic';
    ctx.fillText('21:33',W*0.82,H-6);
    t+=0.8; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['venus'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var stars = [];
  (function(){ var s=42; for(var i=0;i<38;i++){ s=(s*1664525+1013904223)&0xffffffff; var x=(s>>>0)/0xffffffff*W; s=(s*1664525+1013904223)&0xffffffff; var y=(s>>>0)/0xffffffff*H; s=(s*1664525+1013904223)&0xffffffff; var p=(s>>>0)/0xffffffff; stars.push({x:x,y:y,ph:p*6.28,r:0.4+p*0.6}); } })();
  var VX=W*0.60, VY=H*0.50, VR=Math.min(H*0.22,14);
  function frame() {
    ctx.fillStyle='#040810'; ctx.fillRect(0,0,W,H);
    stars.forEach(function(s){
      var a=0.06+0.12*Math.sin(t*0.03+s.ph);
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,'+a+')'; ctx.fill();
    });
    var vg=ctx.createRadialGradient(VX,VY,0,VX,VY,VR*2.5);
    vg.addColorStop(0,'rgba(255,250,200,0.65)'); vg.addColorStop(0.4,'rgba(254,240,138,0.20)'); vg.addColorStop(1,'rgba(254,240,138,0)');
    ctx.fillStyle=vg; ctx.fillRect(0,0,W,H);
    var sp=ctx.createRadialGradient(VX-VR*0.3,VY-VR*0.28,0,VX,VY,VR);
    sp.addColorStop(0,'#fffff0'); sp.addColorStop(0.5,'#fef3c7'); sp.addColorStop(1,'#b8960a');
    ctx.beginPath(); ctx.arc(VX,VY,VR,0,Math.PI*2); ctx.fillStyle=sp; ctx.fill();
    ctx.fillStyle='rgba(254,240,138,0.40)'; ctx.font='7px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('6:76',VX,VY+VR+4);
    t+=0.8; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};

CardCanvases['expanding-universe'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  var CX=W*0.50, CY=H*0.50;
  var gals=[];
  (function(){var s=88;for(var i=0;i<22;i++){s=(s*1664525+1013904223)&0xffffffff;var a=(s>>>0)/0xffffffff*Math.PI*2;s=(s*1664525+1013904223)&0xffffffff;var d=10+(s>>>0)/0xffffffff*H*0.42;s=(s*1664525+1013904223)&0xffffffff;var sp=0.0005+(s>>>0)/0xffffffff*0.0007;gals.push({a:a,d:d,sp:sp,r:1.2+((s>>>0)/0xffffffff)*1.8});}})();
  function frame() {
    ctx.fillStyle='#040810'; ctx.fillRect(0,0,W,H);
    var bg=ctx.createRadialGradient(CX,CY,0,CX,CY,H*0.45);
    bg.addColorStop(0,'rgba(99,102,241,0.30)'); bg.addColorStop(1,'rgba(99,102,241,0)');
    ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);
    gals.forEach(function(g){
      g.d+=g.sp*(g.d*0.014+0.3);
      if(g.d>H*0.52)g.d=8+Math.random()*8;
      var x=CX+Math.cos(g.a)*g.d, y=CY+Math.sin(g.a)*g.d*(H/W*1.5);
      if(x<0||x>W||y<0||y>H)return;
      ctx.beginPath(); ctx.arc(x,y,g.r,0,Math.PI*2);
      ctx.fillStyle='rgba(165,180,252,0.70)'; ctx.fill();
    });
    ctx.beginPath(); ctx.arc(CX,CY,3.5,0,Math.PI*2);
    ctx.fillStyle='rgba(165,180,252,0.90)'; ctx.fill();
    ctx.fillStyle='rgba(165,180,252,0.28)'; ctx.font='7px sans-serif';
    ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillText('51:47',CX,CY+8);
    t+=0.8; rafId=requestAnimationFrame(frame);
  }
  rafId=requestAnimationFrame(frame);
  return { stop: function() { if(rafId){cancelAnimationFrame(rafId);rafId=null;} } };
};
