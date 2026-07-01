/* gpu.js — GPU Fragment Shader Scene Engine
   API:
     GPU.mount(canvas, scene, opts)  → { stop, resize }
     GPU.Scenes = {}                 (scene registry)
     GPU.archetype(name, params)     → glsl render body string

   scene arg: string key into GPU.Scenes  OR  { glsl:'...' }
   opts: { reduce?:bool, seed?:number, mouse?:bool, fallback2d?:fn }

   Every render body defines:  vec3 render(vec2 uv, vec2 res)
     uv ∈ [0,1], y-up (uv.y=0 = bottom), returns linear color pre-tonemap.
*/
(function(G) {
'use strict';

/* ─────────────────────────────────────────────────
   VERTEX SHADER — fullscreen quad
───────────────────────────────────────────────── */
var VERT = [
  'attribute vec2 a_pos;',
  'void main(){gl_Position=vec4(a_pos,0.,1.);}',
].join('\n');

/* ─────────────────────────────────────────────────
   FRAGMENT PRELUDE — uniforms + GLSL utility library
   (prepended to every scene; render body follows)
───────────────────────────────────────────────── */
var FRAG_HEAD = [
  'precision highp float;',
  'uniform vec2  u_res;',
  'uniform float u_time;',
  'uniform vec3  u_accent;',
  'uniform vec3  u_accent2;',
  'uniform float u_dark;',
  'uniform vec2  u_mouse;',
  'uniform float u_seed;',
  '',
  '/* ── hash / noise ── */',
  'float hash(vec2 p){',
  '  p=fract(p*vec2(127.1,311.7));',
  '  p+=dot(p,p+vec2(73.11,19.31));',
  '  return fract(p.x*p.y);',
  '}',
  'vec2 hash2(vec2 p){',
  '  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);',
  '}',
  'float vnoise(vec2 p){',
  '  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);',
  '  float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));',
  '  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);',
  '}',
  'float fbm(vec2 p){',
  '  float v=0.,a=.5;',
  '  mat2 m=mat2(1.6,1.2,-1.2,1.6);',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);',
  '  return v;',
  '}',
  'float fbm6(vec2 p){',
  '  float v=0.,a=.5;',
  '  mat2 m=mat2(1.6,1.2,-1.2,1.6);',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);p=m*p;a*=.5;',
  '  v+=a*vnoise(p);',
  '  return v;',
  '}',
  'float ridgeFbm(vec2 p){',
  '  float v=0.,a=.5;',
  '  mat2 m=mat2(1.7,1.3,-1.3,1.7);',
  '  float n;',
  '  n=abs(2.*vnoise(p)-1.);v+=a*(1.-n);p=m*p;a*=.48;',
  '  n=abs(2.*vnoise(p)-1.);v+=a*(1.-n);p=m*p;a*=.48;',
  '  n=abs(2.*vnoise(p)-1.);v+=a*(1.-n);p=m*p;a*=.48;',
  '  n=abs(2.*vnoise(p)-1.);v+=a*(1.-n);p=m*p;a*=.48;',
  '  n=abs(2.*vnoise(p)-1.);v+=a*(1.-n);',
  '  return v;',
  '}',
  'mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}',
  'float sdCircle(vec2 p,float r){return length(p)-r;}',
  'float sdBox(vec2 p,vec2 b){vec2 d=abs(p)-b;return length(max(d,0.))+min(max(d.x,d.y),0.);}',
  'vec3 palette(float t,vec3 a,vec3 b,vec3 c,vec3 d){return a+b*cos(6.28318*(c*t+d));}',
  'vec3 aces(vec3 x){',
  '  x*=.6;',
  '  return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);',
  '}',
  'float luma(vec3 c){return dot(c,vec3(.299,.587,.114));}',
].join('\n');

var FRAG_TAIL = [
  'void main(){',
  '  vec2 uv=gl_FragCoord.xy/u_res;',
  '  vec3 col=render(uv,u_res);',
  '  col=aces(col);',
  '  col=pow(clamp(col,0.,1.),vec3(0.4545));',
  '  gl_FragColor=vec4(col,1.);',
  '}',
].join('\n');

/* ─────────────────────────────────────────────────
   UTILS
───────────────────────────────────────────────── */
function hexToRgb(hex) {
  hex = (hex || '#f59e0b').replace(/\s/g,'').replace('#','');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  var n = parseInt(hex, 16);
  return [(n>>16&255)/255, (n>>8&255)/255, (n&255)/255];
}
function lighten(rgb, amt) {
  return [Math.min(1,rgb[0]+amt), Math.min(1,rgb[1]+amt), Math.min(1,rgb[2]+amt)];
}
function getAccentHex() {
  return (getComputedStyle(document.body).getPropertyValue('--accent')||'').trim() || '#f59e0b';
}
function getDark() {
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 1.0 : 0.0;
}

/* ─────────────────────────────────────────────────
   ENGINE CORE
───────────────────────────────────────────────── */
function buildProgram(gl, vert, frag) {
  function compile(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      var log = gl.getShaderInfoLog(s);
      console.error('[gpu.js] Shader compile error:\n', log);
      /* annotate error with line */
      var lines = src.split('\n');
      var m = log.match(/ERROR:\s*\d+:(\d+)/);
      if (m) { var ln = parseInt(m[1])-1; console.error('  → line', m[1]+':', lines[ln]||''); }
      return null;
    }
    return s;
  }
  var vs = compile(gl.VERTEX_SHADER, vert);
  var fs = compile(gl.FRAGMENT_SHADER, frag);
  if (!vs || !fs) return null;
  var p = gl.createProgram();
  gl.attachShader(p, vs); gl.attachShader(p, fs);
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    console.error('[gpu.js] Link error:', gl.getProgramInfoLog(p));
    return null;
  }
  return p;
}

function mount(canvas, scene, opts) {
  opts = opts || {};
  var reduce = (opts.reduce != null) ? opts.reduce
    : window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  /* resolve scene to GLSL render body */
  var renderBody;
  if (typeof scene === 'string') {
    renderBody = G.GPU.Scenes[scene];
    if (!renderBody) {
      console.warn('[gpu.js] Scene not found:', scene);
      return { stop: function(){}, resize: function(){} };
    }
  } else if (scene && scene.glsl) {
    renderBody = scene.glsl;
  } else {
    console.warn('[gpu.js] Invalid scene arg');
    return { stop: function(){}, resize: function(){} };
  }

  /* acquire WebGL context */
  var gl;
  try {
    /* preserveDrawingBuffer:true needed so readPixels works correctly after compositing.
       Safe for 640×130px hero canvases; only matters for fullscreen canvases. */
    gl = canvas.getContext('webgl', {antialias:true,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true})
      || canvas.getContext('experimental-webgl', {antialias:true,alpha:true,preserveDrawingBuffer:true});
  } catch(e) { gl = null; }
  if (!gl) {
    console.warn('[gpu.js] WebGL unavailable on', canvas.id || canvas);
    if (opts.fallback2d) opts.fallback2d(canvas);
    return { stop: function(){}, resize: function(){} };
  }

  var fragSrc = FRAG_HEAD + '\n' + renderBody + '\n' + FRAG_TAIL;
  var prog = buildProgram(gl, VERT, fragSrc);
  if (!prog) return { stop: function(){}, resize: function(){} };

  /* fullscreen quad */
  var vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

  /* uniform locations */
  var locs = {
    pos:     gl.getAttribLocation(prog, 'a_pos'),
    res:     gl.getUniformLocation(prog, 'u_res'),
    time:    gl.getUniformLocation(prog, 'u_time'),
    accent:  gl.getUniformLocation(prog, 'u_accent'),
    accent2: gl.getUniformLocation(prog, 'u_accent2'),
    dark:    gl.getUniformLocation(prog, 'u_dark'),
    mouse:   gl.getUniformLocation(prog, 'u_mouse'),
    seed:    gl.getUniformLocation(prog, 'u_seed'),
  };

  var seed = opts.seed != null ? opts.seed : (Math.random() * 100 | 0) / 100;
  var mouse = [0.5, 0.5];
  if (opts.mouse) {
    document.addEventListener('mousemove', function(e) {
      var r = canvas.getBoundingClientRect();
      mouse[0] = (e.clientX - r.left) / r.width;
      mouse[1] = 1 - (e.clientY - r.top) / r.height;
    });
  }

  function sizeCanvas() {
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.round((canvas.clientWidth || canvas.offsetWidth || 640) * dpr);
    var h = Math.round((canvas.clientHeight || canvas.offsetHeight || 130) * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
    }
    gl.viewport(0, 0, w, h);
  }

  var t0 = null;
  function draw(ts) {
    if (!t0) t0 = ts;
    sizeCanvas();
    var acc = hexToRgb(getAccentHex());
    var acc2 = lighten(acc, 0.22);
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.enableVertexAttribArray(locs.pos);
    gl.vertexAttribPointer(locs.pos, 2, gl.FLOAT, false, 0, 0);
    gl.uniform2f(locs.res, canvas.width, canvas.height);
    gl.uniform1f(locs.time, (ts - t0) / 1000);
    gl.uniform3f(locs.accent, acc[0], acc[1], acc[2]);
    gl.uniform3f(locs.accent2, acc2[0], acc2[1], acc2[2]);
    gl.uniform1f(locs.dark, getDark());
    gl.uniform2f(locs.mouse, mouse[0], mouse[1]);
    gl.uniform1f(locs.seed, seed);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  /* initial frame (even under reduced-motion) */
  sizeCanvas();
  draw(performance.now()); t0 = performance.now();

  var rafId = null, visible = true;
  function loop(ts) {
    if (visible) draw(ts);
    rafId = requestAnimationFrame(loop);
  }
  if (!reduce) rafId = requestAnimationFrame(loop);

  /* pause off-screen */
  var io = ('IntersectionObserver' in window)
    ? new IntersectionObserver(function(e) { visible = e[0].isIntersecting; }, {threshold:0.01})
    : null;
  if (io) io.observe(canvas);

  /* resize debounce */
  var resizeTimer = null;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() { sizeCanvas(); draw(performance.now()); }, 80);
  }
  window.addEventListener('resize', onResize);

  return {
    stop: function() {
      if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      if (io) io.disconnect();
      window.removeEventListener('resize', onResize);
    },
    resize: function() { sizeCanvas(); draw(performance.now()); }
  };
}

/* ─────────────────────────────────────────────────
   ARCHETYPES
───────────────────────────────────────────────── */
var ARCHETYPES = {};

/* ── TERRAIN ────────────────────────────────────
   Layered ridged-fbm mountains + atmosphere + sun/moon + stars + snow.
   params:
     ridges  : int  4          number of mountain layers
     snow    : 0..1 0.82       ridgeline height fraction that gets snow
     warmth  : 0..1 0.18       warm horizon tint intensity
     speed   : float 0.025     parallax drift speed
     sunX    : 0..1 0.74       sun/moon x position
     sunY    : 0..1 0.84       sun/moon y position (in sky, above terrain)
     fogLift : 0..1 0.0        add bottom-of-scene fog lift (useful for deep valleys)
─────────────────────────────────────────────── */
ARCHETYPES['terrain'] = function(p) {
  p = p || {};
  function f(v, def) { return parseFloat(v != null ? v : def).toFixed(5); }
  var SNOW   = f(p.snow,    0.80);
  var WARMTH = f(p.warmth,  0.20);
  var SPD    = f(p.speed,   0.022);
  var SUNX   = f(p.sunX,    0.74);
  var SUNY   = f(p.sunY,    0.86);
  var FOGL   = f(p.fogLift, 0.0);

  return [
'vec3 render(vec2 uv, vec2 res) {',
'  float asp = res.x / res.y;',
'  float t   = u_time * ' + SPD + ';',
'  vec2  skyC = vec2(uv.x * asp, uv.y);',
'',
'  /* ── Palettes ── */',
'  // DARK: near-black zenith → deep indigo horizon',
'  vec3 skyZD = vec3(0.018, 0.025, 0.088);',
'  vec3 skyHD = vec3(0.078, 0.118, 0.265);',
'  // LIGHT: pale cerulean zenith → golden dawn horizon',
'  vec3 skyZL = vec3(0.420, 0.660, 0.920);',
'  vec3 skyHL = vec3(0.960, 0.780, 0.440);',
'  float skyP = pow(clamp(uv.y, 0.0, 1.0), 0.50);',
'  vec3 skyD  = mix(skyHD, skyZD, skyP);',
'  vec3 skyL  = mix(skyHL, skyZL, skyP);',
'  vec3 col   = mix(skyL, skyD, u_dark);',
'',
'  /* Accent sky wash */',
'  col += u_accent * 0.08 * (1.0 - skyP);',
'',
'  /* ── Stars (dark only) ── */',
'  float stA = u_dark;',
'  vec2 stG  = floor(uv * vec2(asp * 100.0, 100.0));',
'  float stH = hash(stG + vec2(0.37, 1.19));',
'  float stB = hash(stG + vec2(4.71, 2.33));',
'  vec2 stOff = (hash2(stG + 0.5) - 0.5) * 0.5;',
'  vec2 stLP  = fract(uv * vec2(asp * 100.0, 100.0)) - 0.5 + stOff;',
'  float twink = 0.55 + 0.45 * sin(u_time * 2.3 + stB * 9.87);',
'  float stMask = step(0.80, stH) * step(0.30, uv.y);',
'  float stDot  = (1.0 - smoothstep(0.0, 0.055, length(stLP))) * twink * stMask * stA;',
'  float stPow  = stH * 0.8 + 0.2;',
'  col += vec3(0.85 + stB * 0.15, 0.90 + stB * 0.08, 1.0) * stDot * stPow;',
'',
'  /* ── Sun disc + glow ── */',
'  vec2  sPos = vec2(' + SUNX + ' * asp, ' + SUNY + ');',
'  float sD   = length(skyC - sPos);',
'  vec3  scL  = mix(vec3(1.0, 0.88, 0.50), u_accent2, 0.28);',
'  vec3  scDk = mix(vec3(0.90, 0.95, 1.00), u_accent2, 0.18);',
'  vec3  sCol = mix(scL, scDk, u_dark);',
'  float sR   = mix(0.052, 0.034, u_dark) * asp;',
'  float sDisc = 1.0 - smoothstep(sR * 0.88, sR * 1.08, sD);',
'  float sGlow = exp(-sD * mix(3.2, 6.5, u_dark)) * mix(0.55, 0.28, u_dark);',
'  col += sCol * (sDisc * 1.4 + sGlow);',
'',
'  /* ── Warm horizon (light mode) ── */',
'  float hBand = exp(-pow(uv.y - 0.10, 2.0) * 28.0);',
'  col += vec3(1.0, 0.52, 0.14) * ' + WARMTH + ' * hBand * (1.0 - u_dark * 0.80);',
'',
'  /* ── Drifting cloud/mist band ── */',
'  float mN = fbm(vec2(uv.x * asp * 2.0 - t * 2.5, 11.3));',
'  float mM = smoothstep(0.40, 0.56, mN);',
'  float mY0 = mix(0.52, 0.55, u_dark);',
'  mM *= smoothstep(0.0, 0.05, uv.y - mY0) * (1.0 - smoothstep(0.0, 0.14, uv.y - mY0 - 0.10));',
'  vec3  mCol = mix(vec3(0.90,0.84,0.72)*0.9, vec3(0.30,0.36,0.52)*0.8, u_dark);',
'  col = mix(col, col + mCol * 0.18, mM * 0.7);',
'',
'  /* ── Mountain layers — far to near, strong atmospheric depth ── */',
'  //                  sc    dr    by    am    seed',
'  // Layer0 = farthest, nearly invisible through haze',
'  // Layer3 = nearest, bold dark rock with accent',
'',
'  // Deep rock colors for near layers',
'  vec3 rockNearD = vec3(0.062, 0.074, 0.098);   // near-black dark slate (night)',
'  vec3 rockNearL = vec3(0.200, 0.175, 0.145);   // warm dark brown (day)',
'  vec3 rockNear  = mix(rockNearL, rockNearD, u_dark);',
'',
'  // Distant haze colors match sky-horizon',
'  vec3 rockFarD  = mix(skyHD, skyZD, 0.35) * 1.15;',
'  vec3 rockFarL  = mix(skyHL, skyZL, 0.30) * 0.90;',
'  vec3 rockFar   = mix(rockFarL, rockFarD, u_dark);',
'',
'  vec3 snowColD  = vec3(0.72, 0.80, 0.94);',
'  vec3 snowColL  = vec3(0.92, 0.94, 0.98);',
'  vec3 snowC     = mix(snowColL, snowColD, u_dark);',
'  float snowT    = ' + SNOW + ';',
'',
'  /* Layer 0 — farthest, most hazy */',
'  { float sx=uv.x*asp*1.95+t*0.22; float h=0.64+0.22*ridgeFbm(vec2(sx,0.0));',
'    float fog=1.0;',
'    vec3 rc = mix(rockNear, rockFar, 0.92);',
'    rc = mix(rc, col, 0.78);',
'    float inM = smoothstep(h+0.006,h-0.008,uv.y);',
'    col = mix(col, rc, inM); }',
'',
'  /* Layer 1 — far, still quite hazy */',
'  { float sx=uv.x*asp*2.80+t*0.40; float h=0.52+0.25*ridgeFbm(vec2(sx,13.3));',
'    vec3 rc = mix(rockNear, rockFar, 0.64);',
'    rc = mix(rc, col, 0.48);',
'    float inM = smoothstep(h+0.006,h-0.009,uv.y);',
'    col = mix(col, rc, inM); }',
'',
'  /* Layer 2 — mid-ground, clearer */',
'  { float sx=uv.x*asp*3.90+t*0.65; float h=0.40+0.28*ridgeFbm(vec2(sx,26.7));',
'    h += 0.020*vnoise(vec2(sx*2.8+1.1, 31.4));',
'    vec3 rc = mix(rockNear, rockFar, 0.30);',
'    rc = mix(rc, col, 0.20);',
'    rc += u_accent * 0.10;',
'    // Snow on peaks',
'    float isSnow2 = step(snowT+0.05, h) * smoothstep(h-0.07,h-0.002,uv.y);',
'    rc = mix(rc, snowC, isSnow2 * 0.80);',
'    // Rim light',
'    float rim2 = exp(-abs(uv.y-h)*88.0) * 0.5;',
'    rc += sCol * rim2 * 0.35 + u_accent * rim2 * 0.25;',
'    float inM = smoothstep(h+0.006,h-0.010,uv.y);',
'    col = mix(col, rc, inM); }',
'',
'  /* Layer 3 — nearest, full drama */',
'  { float sx=uv.x*asp*5.30+t*0.95; float h=0.27+0.31*ridgeFbm(vec2(sx,40.1));',
'    h += 0.030*vnoise(vec2(sx*3.1+2.3, 45.9));',
'    vec3 rc = rockNear;',
'    // Strong accent integration on near rock face',
'    rc = mix(rc, rc + u_accent * 0.18, 0.80);',
'    // Snow caps',
'    float isSnow3 = step(snowT, h) * smoothstep(h-0.08,h-0.002,uv.y);',
'    rc = mix(rc, snowC, isSnow3 * 0.92);',
'    // Dramatic rim glow from sun',
'    float rim3 = exp(-abs(uv.y-h)*80.0) * 0.8;',
'    rc += sCol * rim3 * 0.55 + u_accent * rim3 * 0.40;',
'    // Subtle self-shadow on lower face',
'    float shadow = smoothstep(h-0.25, h-0.02, uv.y);',
'    rc *= mix(0.62, 1.0, shadow);',
'    float inM = smoothstep(h+0.006,h-0.012,uv.y);',
'    col = mix(col, rc, inM); }',
'',
'  /* ── Ground plane ── */',
'  float gN = vnoise(vec2(uv.x*asp*8.5 + t*0.55, 53.1));',
'  float gh = 0.065 + 0.030*gN;',
'  float inG = smoothstep(gh+0.010, gh-0.010, uv.y);',
'  vec3 gcol = mix(vec3(0.11,0.10,0.09), vec3(0.05,0.06,0.08), u_dark);',
'  gcol += u_accent * 0.06;',
'  col = mix(col, gcol, inG);',
'',
'  /* ── Final depth haze (bottom-up atmospheric scattering) ── */',
'  float hz = mix(0.06, 0.12, u_dark);',
'  col = mix(col, mix(skyL, skyD, u_dark) * 0.6 + vec3(0.20), hz * pow(1.0-uv.y, 1.4));',
'',
'  /* ── Valley fog lift ── */',
'  float fogL = ' + FOGL + ';',
'  col = mix(col, col*0.65 + skyD*0.35, fogL*(1.0-smoothstep(0.0,0.25,uv.y)));',
'',
'  return col;',
'}',
  ].join('\n');
};

/* ─────────────────────────────────────────────────
   FORGE ARCHETYPE
   Blackbody-glowing molten material: dark crucible,
   incandescent pool that cycles through the blackbody
   color ramp (black→dark-red→orange→yellow→white),
   surface shimmer, rising sparks, smoke haze.
   params:
     temp   : 0..1   0.75  normalised temperature (higher = whiter)
     sparks : float  0.9   spark density / intensity
     smoke  : float  0.4   smoke haze above pool
     glow   : float  0.6   overall glow strength
     poolH  : float  0.38  pool surface Y position (0=bottom, 1=top)
───────────────────────────────────────────────── */
ARCHETYPES['forge'] = function(p) {
  p = p || {};
  function f(v, def) { return parseFloat(v != null ? v : def).toFixed(5); }
  var TEMP  = f(p.temp,   0.75);
  var SPARKS= f(p.sparks, 0.9);
  var SMOKE = f(p.smoke,  0.4);
  var GLOW  = f(p.glow,   0.6);
  var POOLH = f(p.poolH,  0.38);

  return [
'vec3 bbody(float t){',
'  /* blackbody ramp: 0=black, 0.2=deep red, 0.45=orange, 0.65=amber, 0.85=yellow, 1=near-white */',
'  vec3 c;',
'  if(t<0.2)  c=mix(vec3(0.0,0.0,0.0),   vec3(0.55,0.02,0.0),  t/0.20);',
'  else if(t<0.45) c=mix(vec3(0.55,0.02,0.0), vec3(0.98,0.28,0.0), (t-0.20)/0.25);',
'  else if(t<0.65) c=mix(vec3(0.98,0.28,0.0), vec3(1.0, 0.72,0.1), (t-0.45)/0.20);',
'  else if(t<0.85) c=mix(vec3(1.0, 0.72,0.1), vec3(1.0, 0.95,0.6), (t-0.65)/0.20);',
'  else            c=mix(vec3(1.0, 0.95,0.6), vec3(1.0, 1.0, 1.0), (t-0.85)/0.15);',
'  return c;',
'}',
'vec3 render(vec2 uv, vec2 res) {',
'  float asp = res.x / res.y;',
'  float tt  = u_time;',
'  float base_temp = ' + TEMP + ';',
'  float pool_y    = ' + POOLH + ';',
'',
'  /* ── Background: dark chamber ── */',
'  vec3 wallD = mix(vec3(0.05,0.03,0.02), vec3(0.10,0.06,0.03), uv.y);',
'  vec3 wallL = mix(vec3(0.18,0.14,0.08), vec3(0.32,0.24,0.10), uv.y);',
'  vec3 col   = mix(wallL, wallD, u_dark);',
'',
'  /* ── Crucible / vessel walls ── */',
'  float wallW = 0.10;',
'  float inCruc = smoothstep(wallW, wallW+0.03, uv.x) * smoothstep(1.0-wallW, 1.0-wallW-0.03, uv.x);',
'  float crucBright = 0.08 + 0.06*u_dark;',
'  vec3 crucCol = vec3(crucBright*1.2, crucBright*0.8, crucBright*0.5);',
'  col = mix(crucCol, col, inCruc);',
'',
'  /* ── Molten pool surface ── */',
'  float sN = fbm(vec2(uv.x * asp * 3.8 + tt*0.6, 4.2));',
'  float surf = pool_y + 0.018*sN - 0.008*sin(tt*1.4 + uv.x*asp*4.0);',
'',
'  /* Below surface: hot molten interior */',
'  float depth = clamp((surf - uv.y) / (pool_y + 0.5), 0.0, 1.0);',
'  float localTemp = base_temp + 0.12*fbm(vec2(uv.x*asp*5.0 - tt*0.4, tt*0.3));',
'  localTemp = clamp(localTemp - depth*0.25, 0.0, 1.0);',
'  vec3 moltCol = bbody(localTemp);',
'  /* accent tint on hottest spots */',
'  moltCol = mix(moltCol, moltCol + u_accent*0.3, smoothstep(0.5, 0.85, localTemp));',
'  float inPool = smoothstep(surf+0.005, surf-0.008, uv.y);',
'  col = mix(col, moltCol, inPool);',
'',
'  /* ── Surface shimmer / specular */',
'  float shimmer = vnoise(vec2(uv.x*asp*9.0 + tt*2.5, surf*18.0));',
'  float atSurf = exp(-abs(uv.y - surf)*90.0);',
'  col += bbody(min(1.0, base_temp+0.15)) * shimmer * atSurf * 0.55;',
'',
'  /* ── Glow halo above pool ── */',
'  float glowH = ' + GLOW + ';',
'  float aboveSurf = max(0.0, uv.y - surf);',
'  float glowFall = exp(-aboveSurf * 8.0) * glowH;',
'  vec3 glowCol = bbody(max(0.0, base_temp - 0.1));',
'  col += glowCol * glowFall * (0.4 + 0.2*u_dark);',
'',
'  /* ── Rising sparks ── */',
'  float spk = ' + SPARKS + ';',
'  for(int si=0; si<8; si++) {',
'    float sf = float(si) * 0.137;',
'    float sx = fract(sf + tt*0.08 + float(si)*0.193);',
'    float speed = 0.12 + sf*0.22;',
'    float sy = fract(surf - tt*speed + sf*0.7);',
'    float age = fract(- tt*speed + sf*0.7);',
'    if(sy > surf) {',
'      vec2 sp = vec2(sx*asp, sy);',
'      float sd = length(sp - vec2(uv.x*asp, uv.y));',
'      float sparkT = max(0.0, base_temp - age*0.5);',
'      float bright = exp(-sd * 220.0) * (1.0-age) * spk;',
'      col += bbody(sparkT) * bright;',
'    }',
'  }',
'',
'  /* ── Smoke / heat haze above pool ── */',
'  float smokeAmt = ' + SMOKE + ';',
'  float smokN = fbm(vec2(uv.x*asp*1.6 - tt*0.35, uv.y*2.0 + tt*0.2));',
'  float smokMask = smoothstep(surf, surf+0.18, uv.y) * (1.0-smoothstep(surf+0.12,surf+0.55,uv.y));',
'  smokMask *= smoothstep(0.42, 0.58, smokN) * smokeAmt;',
'  vec3 smokCol = mix(vec3(0.32,0.22,0.12), vec3(0.08,0.07,0.06), u_dark);',
'  col = mix(col, col*0.7 + smokCol, smokMask * 0.45);',
'',
'  /* ── Light mode: brighter walls, less dramatic ── */',
'  if(u_dark < 0.5) col = mix(col, col * 1.2 + vec3(0.04,0.03,0.01), 0.3);',
'',
'  return col;',
'}',
  ].join('\n');
};

/* ─────────────────────────────────────────────────
   SCENE REGISTRY — terrain scenes
───────────────────────────────────────────────── */
var GPU = {
  Scenes: {},
  mount: mount,
  archetype: function(name, params) {
    var fn = ARCHETYPES[name];
    if (!fn) {
      console.warn('[gpu.js] Archetype not found:', name);
      return 'vec3 render(vec2 uv,vec2 res){return vec3(0.06,0.08,0.12);}';
    }
    return fn(params || {});
  }
};

/* ── MOUNTAINS AS PEGS ────────────────────────────────────────────
   Claim: mountain roots extend 3-5× deeper than visible height.
   Visual: cross-section split by ground line. Peak above, glowing
   peg-root below ground, tapering to a point. The "iceberg" shape.
──────────────────────────────────────────────────────────────────── */
GPU.Scenes['mountains'] = [
'vec3 render(vec2 uv, vec2 res){',
'  float asp=res.x/res.y, t=u_time*0.018;',
'  float GROUND=0.52;',
'  /* Sky / earth background */',
'  vec3 skyD=mix(vec3(0.04,0.08,0.18),vec3(0.02,0.04,0.10),uv.y);',
'  vec3 skyL=mix(vec3(0.55,0.72,0.92),vec3(0.80,0.88,0.98),uv.y);',
'  vec3 earthD=mix(vec3(0.18,0.12,0.07),vec3(0.08,0.06,0.04),uv.y);',
'  vec3 earthL=mix(vec3(0.56,0.44,0.32),vec3(0.36,0.26,0.18),uv.y);',
'  vec3 col=uv.y>GROUND?mix(skyL,skyD,u_dark):mix(earthL,earthD,u_dark);',
'  /* Ground line */',
'  float glDist=abs(uv.y-GROUND);',
'  col=mix(col,mix(vec3(0.72,0.58,0.38),vec3(0.55,0.42,0.26),u_dark),smoothstep(0.008,0.0,glDist));',
'  /* Rock layers underground — parallel bands */',
'  if(uv.y<GROUND){',
'    float layers=floor((GROUND-uv.y)*12.0);',
'    float layerN=fract((GROUND-uv.y)*12.0);',
'    float shade=0.5+0.5*sin(layers*2.39996+uv.x*asp*0.8+t*0.3);',
'    col=mix(col,col*(0.75+shade*0.25),0.5);',
'  }',
'  /* Mountain peak above ground */',
'  float cx=0.5*asp;',
'  float pkH=0.28; float pkW=0.28;',
'  float peakY=GROUND+pkH+0.02*sin(t*0.9);',
'  vec2 pk=vec2(uv.x*asp-cx,uv.y-GROUND);',
'  float slopeL=(pk.x+pkW/2.0)/(pkW/2.0);',
'  float slopeR=(pkW/2.0-pk.x)/(pkW/2.0);',
'  float mtnMask=min(slopeL,slopeR);',
'  float mtnH=pk.y/pkH;',
'  float inMtn=smoothstep(-0.015,0.0,min(mtnMask-mtnH,0.0))*step(0.0,uv.y-GROUND);',
'  vec3 rockC=mix(vec3(0.45,0.40,0.35),vec3(0.30,0.27,0.24),u_dark);',
'  /* Snow cap */',
'  float snowLine=0.72;',
'  vec3 snowC=mix(vec3(0.96,0.97,0.99),vec3(0.82,0.88,0.95),u_dark);',
'  col=mix(col,mix(rockC,snowC,smoothstep(snowLine-0.06,snowLine+0.02,mtnH)),inMtn);',
'  /* PEG ROOT below ground — tapers to point, glows with accent */',
'  float rootDepth=pkH*3.8; float rootTopW=pkW*0.38;',
'  vec2 rp=vec2(uv.x*asp-cx,GROUND-uv.y);',
'  float rootTaper=clamp(1.0-rp.y/rootDepth,0.0,1.0);',
'  float rootW=rootTopW*rootTaper*rootTaper;',
'  float inRoot=smoothstep(rootW+0.01,rootW-0.005,abs(rp.x))*step(0.0,rp.y)*step(rp.y,rootDepth);',
'  float rootGlow=exp(-abs(rp.x)/(rootW+0.02))*step(0.0,rp.y)*step(rp.y,rootDepth);',
'  vec3 rootC=mix(vec3(0.32,0.26,0.20),u_accent*0.9+vec3(0.05),u_dark);',
'  col=mix(col,rootC,inRoot*0.85);',
'  col+=u_accent*(rootGlow*0.45*(0.6+0.4*sin(t*1.8+rp.y*8.0)));',
'  /* depth labels: faint depth ticks on root */',
'  for(int d=1;d<=3;d++){',
'    float dy=rootDepth*float(d)/4.0;',
'    float tickD=abs(rp.y-dy);',
'    col+=u_accent*0.35*exp(-tickD*90.0)*step(abs(rp.x),rootW+0.015)*inRoot;',
'  }',
'  return col;',
'}',
].join('\n');

/* ── MOVING MOUNTAINS ────────────────────────────────────────────
   Claim: mountains look frozen but drift like clouds on plates.
   Visual: side-view tectonic plates gliding, glowing fault line,
   mountains on top moving imperceptibly with the crust.
──────────────────────────────────────────────────────────────────── */
GPU.Scenes['moving-mountains'] = [
'vec3 render(vec2 uv, vec2 res){',
'  float asp=res.x/res.y, t=u_time*0.008;',
'  /* Two plates: left drifts left, right drifts right */',
'  float split=0.50+0.04*sin(t*0.6);',
'  float drift=t*0.06;',
'  /* Deep earth background */',
'  vec3 mantleD=mix(vec3(0.28,0.10,0.04),vec3(0.12,0.05,0.02),uv.y);',
'  vec3 mantleL=mix(vec3(0.70,0.50,0.34),vec3(0.50,0.35,0.22),uv.y);',
'  vec3 col=mix(mantleL,mantleD,u_dark);',
'  /* Crust layer */',
'  float crustTop=0.50, crustBot=0.35;',
'  float inCrust=smoothstep(crustTop+0.01,crustTop-0.01,uv.y)*smoothstep(crustBot-0.01,crustBot+0.01,uv.y);',
'  /* Left plate offset */',
'  float oxL=uv.x<split?-drift:drift;',
'  vec2 uvL=vec2(uv.x+oxL,uv.y);',
'  float crustN=fbm(vec2(uvL.x*asp*3.0,8.0));',
'  float crustH=crustTop+0.03*crustN;',
'  vec3 crustC=mix(vec3(0.38,0.32,0.26),vec3(0.22,0.18,0.14),u_dark);',
'  col=mix(col,crustC,smoothstep(crustH+0.008,crustH-0.008,uv.y)*step(crustBot,uv.y));',
'  /* Mountains on plates */',
'  for(int i=0;i<5;i++){',
'    float fi=float(i);',
'    float side=fi<2.5?-1.0:1.0;',
'    float ox=side>0.0?-drift:drift;',
'    float mx=(0.12+fi*0.17+ox*0.5)*asp;',
'    float mh=0.14+0.07*hash(vec2(fi,3.1));',
'    float mw=0.10+0.04*hash(vec2(fi,7.2));',
'    vec2 mp=vec2(uv.x*asp-mx,uv.y-crustTop);',
'    float sl=min((mp.x+mw)/mw,(-mp.x+mw)/mw);',
'    float inM=smoothstep(-0.01,0.0,min(sl-mp.y/mh,0.0))*step(0.0,mp.y);',
'    float snow=smoothstep(0.55,0.75,mp.y/mh);',
'    col=mix(col,mix(crustC*1.2,vec3(0.92,0.94,0.98),snow),inM);',
'  }',
'  /* FAULT LINE — glowing accent seam at plate boundary */',
'  float faultX=split*asp;',
'  float faultDist=abs(uv.x*asp-faultX);',
'  float faultGlow=exp(-faultDist*28.0)*(0.6+0.4*sin(u_time*3.2+uv.y*12.0));',
'  col+=u_accent*faultGlow*(0.7+0.3*u_dark);',
'  /* Motion arrows — faint drift indicators */',
'  float arrowY=0.20;',
'  for(int a=0;a<2;a++){',
'    float ax=(a==0?0.25:0.75)*asp;',
'    float adir=a==0?-1.0:1.0;',
'    float arDist=length(vec2(uv.x*asp-ax,uv.y-arrowY));',
'    float pulse=0.5+0.5*sin(u_time*2.0+float(a)*3.14+uv.x*8.0);',
'    col+=u_accent*0.25*exp(-arDist*30.0)*pulse;',
'  }',
'  return col;',
'}',
].join('\n');

/* ── INTERNAL MOUNTAINS ──────────────────────────────────────────
   Claim: 400 miles underground there are inverted mountain ranges.
   Visual: Earth cross-section, surface at top, depth layers, then
   inverted stalactite-peaks pointing DOWN — glowing pink accent.
──────────────────────────────────────────────────────────────────── */
GPU.Scenes['internal-mountains'] = [
'vec3 render(vec2 uv, vec2 res){',
'  float asp=res.x/res.y, t=u_time*0.015;',
'  /* Depth layers — lighter near surface, hotter/darker deeper */',
'  float depth=1.0-uv.y;',
'  vec3 crustD=vec3(0.18,0.14,0.10);',
'  vec3 mantleD=vec3(0.32,0.10,0.04);',
'  vec3 coreD=vec3(0.60,0.20,0.04);',
'  vec3 crustL=vec3(0.55,0.48,0.40);',
'  vec3 mantleL=vec3(0.72,0.40,0.20);',
'  vec3 coreL=vec3(0.92,0.65,0.30);',
'  vec3 layerD=depth<0.25?mix(crustD,mantleD,depth/0.25):depth<0.65?mix(mantleD,coreD,(depth-0.25)/0.40):coreD;',
'  vec3 layerL=depth<0.25?mix(crustL,mantleL,depth/0.25):depth<0.65?mix(mantleL,coreL,(depth-0.25)/0.40):coreL;',
'  vec3 col=mix(layerL,layerD,u_dark);',
'  /* Subtle rock texture */',
'  float rockN=fbm(vec2(uv.x*asp*4.0+t*0.2, depth*6.0+t*0.1));',
'  col=mix(col,col*(0.82+rockN*0.18),0.45);',
'  /* Surface crust at top */',
'  float surfH=0.06;',
'  float inSurf=smoothstep(1.0-surfH+0.01,1.0-surfH-0.01,uv.y);',
'  col=mix(col,mix(vec3(0.25,0.20,0.16),vec3(0.15,0.12,0.10),u_dark),inSurf*0.7);',
'  /* Layer boundary lines */',
'  float b1=abs(uv.y-(1.0-0.25));',
'  float b2=abs(uv.y-(1.0-0.65));',
'  col=mix(col,col*0.6+u_accent*0.15,smoothstep(0.008,0.0,b1)*0.5);',
'  col=mix(col,col*0.6+u_accent*0.25,smoothstep(0.008,0.0,b2)*0.5);',
'  /* INVERTED MOUNTAINS — roots of surface mountains pointing DOWN */',
'  float zoneTop=0.32, zoneBot=0.05;',
'  for(int i=0;i<6;i++){',
'    float fi=float(i);',
'    float mx=(0.08+fi*0.155+0.02*sin(t*0.4+fi*1.3))*asp;',
'    float mh=0.16+0.09*hash(vec2(fi,2.7));',
'    float mw=0.11+0.04*hash(vec2(fi,5.1));',
'    /* inverted: tip points DOWN from zoneTop */',
'    vec2 mp=vec2(uv.x*asp-mx, zoneTop-uv.y);',
'    float sl=min((mp.x+mw)/mw,(-mp.x+mw)/mw);',
'    float inM=smoothstep(-0.01,0.0,min(sl-mp.y/mh,0.0))*step(0.0,mp.y)*step(uv.y,zoneTop);',
'    /* glow — brightest at tip */',
'    float tipDist=length(vec2(mp.x,mp.y-mh));',
'    float tipGlow=exp(-tipDist*16.0)*inM;',
'    vec3 mtnC=mix(u_accent*0.7+vec3(0.08,0.02,0.04), u_accent*0.55, u_dark);',
'    col=mix(col,mtnC,inM*0.75);',
'    col+=u_accent*(tipGlow*0.6+inM*0.12)*(0.7+0.3*sin(u_time*1.5+fi*1.1));',
'  }',
'  /* Depth annotation — faint horizontal lines at key depths */',
'  float depthLine=abs(uv.y-0.32);',
'  col+=u_accent*0.18*exp(-depthLine*80.0)*(0.4+0.6*u_dark);',
'  return col;',
'}',
].join('\n');

/* dead-sea uses terrain archetype */
GPU.Scenes['dead-sea']           = GPU.archetype('terrain', { snow:0.00, warmth:0.42, speed:0.008, sunX:0.65, sunY:0.80, fogLift:0.18 });
/* mountains-pegs alias */
GPU.Scenes['mountains-pegs']     = GPU.Scenes['mountains'];

/* Forge family */
GPU.Scenes['gold-melting']    = GPU.archetype('forge', { temp:0.72, sparks:0.85, smoke:0.32, glow:0.65, poolH:0.42 });
GPU.Scenes['silver-melting']  = GPU.archetype('forge', { temp:0.62, sparks:0.70, smoke:0.28, glow:0.55, poolH:0.44 });
GPU.Scenes['sun-temperature'] = GPU.archetype('forge', { temp:0.95, sparks:1.00, smoke:0.18, glow:0.85, poolH:0.30 });
GPU.Scenes['iron']            = GPU.archetype('forge', { temp:0.80, sparks:0.95, smoke:0.42, glow:0.72, poolH:0.40 });
GPU.Scenes['carbon-creation'] = GPU.archetype('forge', { temp:0.98, sparks:1.00, smoke:0.10, glow:0.90, poolH:0.25 });

/* ── COSMOS archetype ───────────────────────────────
   Deep starfield + drifting nebula colour + central glowing body.
   params: bodySize(0.05), bodyX(0.5), bodyY(0.52), nebulaScale(1.2), drift(0.012)
─────────────────────────────────────────────────── */
ARCHETYPES['cosmos'] = function(p) {
  p=p||{};
  function f(v,d){return parseFloat(v!=null?v:d).toFixed(5);}
  return [
'vec3 render(vec2 uv, vec2 res){',
'  float asp=res.x/res.y, t=u_time*'+f(p.drift,'0.012')+';',
'  /* deep space background */',
'  vec3 sky=mix(vec3(0.02,0.025,0.06),vec3(0.0,0.0,0.0),pow(uv.y,0.4));',
'  if(u_dark<0.5) sky=mix(vec3(0.55,0.62,0.80),vec3(0.20,0.25,0.45),uv.y);',
'  vec3 col=sky;',
'  /* starfield */',
'  vec2 sg=floor(uv*vec2(asp*88.0,88.0));',
'  float sh=hash(sg+0.31), sv=hash(sg+vec2(5.1,3.7));',
'  vec2 slp=fract(uv*vec2(asp*88.0,88.0))-0.5+(hash2(sg)-0.5)*0.5;',
'  float twink=0.55+0.45*sin(u_time*2.1+sv*9.4);',
'  float star=(1.0-smoothstep(0.0,0.055,length(slp)))*step(0.80,sh)*twink*u_dark;',
'  col+=vec3(0.80+sv*0.18,0.88+sv*0.10,1.0)*star*(sh*0.7+0.3);',
'  /* nebula — two fbm colour clouds */',
'  float ns='+f(p.nebulaScale,'1.2')+';',
'  vec2 np=vec2(uv.x*asp*ns-t*0.8, uv.y*ns+t*0.3);',
'  float nA=fbm(np+vec2(0.0,0.0)), nB=fbm(np+vec2(3.7,2.1));',
'  vec3 nCol=mix(u_accent*0.55, u_accent2*0.40, nB);',
'  col+=nCol*smoothstep(0.38,0.65,nA)*0.35*u_dark;',
'  if(u_dark<0.5) col+=nCol*smoothstep(0.38,0.65,nA)*0.12;',
'  /* central body (star/planet/singularity) */',
'  float bx='+f(p.bodyX,'0.50')+', by='+f(p.bodyY,'0.52')+';',
'  float br='+f(p.bodySize,'0.05')+';',
'  vec2 bpos=vec2(bx*asp,by), bp=vec2(uv.x*asp,uv.y)-bpos;',
'  float bd=length(bp);',
'  float pulse=0.92+0.08*sin(u_time*1.8);',
'  vec3 bCore=mix(vec3(1.0,0.98,0.90),u_accent2,0.3);',
'  float disc=1.0-smoothstep(br*0.85*pulse,br*1.05*pulse,bd);',
'  float glow=exp(-bd*mix(4.5,9.0,u_dark))*0.7;',
'  col+=bCore*(disc*1.6+glow)+u_accent*exp(-bd*18.0)*0.4;',
'  /* lens-flare streak */',
'  float streak=exp(-abs(bp.y)*120.0)*exp(-bd*3.0)*0.18*u_dark;',
'  col+=bCore*streak;',
'  /* horizon glow (light mode) */',
'  col+=u_accent*0.08*(1.0-u_dark)*(1.0-uv.y);',
'  return col;',
'}',
  ].join('\n');
};

/* ── FLUID archetype ────────────────────────────────
   Animated sea/water: sky above, waves, depth colour.
   params: waveH(0.45), waveSpeed(0.6), deepness(0.7), sky(true)
─────────────────────────────────────────────────── */
ARCHETYPES['fluid'] = function(p) {
  p=p||{};
  function f(v,d){return parseFloat(v!=null?v:d).toFixed(5);}
  return [
'vec3 render(vec2 uv, vec2 res){',
'  float asp=res.x/res.y, t=u_time*'+f(p.waveSpeed,'0.55')+';',
'  /* sky */',
'  vec3 skyD=mix(vec3(0.06,0.10,0.22),vec3(0.02,0.04,0.12),uv.y);',
'  vec3 skyL=mix(vec3(0.90,0.82,0.62),vec3(0.44,0.68,0.92),uv.y);',
'  vec3 sky=mix(skyL,skyD,u_dark);',
'  sky+=u_accent*0.09*(1.0-uv.y);',
'  vec3 col=sky;',
'  /* horizon sun */',
'  float sD=length(vec2((uv.x-0.68)*asp, uv.y-0.78));',
'  vec3 sunC=mix(vec3(1.0,0.88,0.50),u_accent2,0.28);',
'  col+=sunC*(exp(-sD*mix(3.5,7.0,u_dark))*mix(0.5,0.22,u_dark)+(1.0-smoothstep(0.035,0.048,sD)));',
'  /* wave surface */',
'  float wh='+f(p.waveH,'0.44')+';',
'  float wN=fbm(vec2(uv.x*asp*2.8-t*1.8, 7.3))*0.5+fbm(vec2(uv.x*asp*5.2-t*2.4,12.7))*0.25;',
'  float surf=wh+0.055*wN-0.012*sin(t*2.1+uv.x*asp*6.0);',
'  float inWater=smoothstep(surf+0.005,surf-0.008,uv.y);',
'  /* water body */',
'  float dp='+f(p.deepness,'0.68')+';',
'  float depth=clamp((surf-uv.y)/0.5,0.0,1.0);',
'  vec3 shallowD=mix(u_accent*0.9,vec3(0.04,0.12,0.24),0.3);',
'  vec3 deepD=mix(vec3(0.01,0.04,0.12),u_accent*0.2,0.2);',
'  vec3 shallowL=mix(u_accent,vec3(0.20,0.52,0.78),0.3);',
'  vec3 deepL=mix(vec3(0.08,0.22,0.42),u_accent*0.4,0.2);',
'  vec3 waterD=mix(shallowD,deepD,depth*dp);',
'  vec3 waterL=mix(shallowL,deepL,depth*dp);',
'  vec3 water=mix(waterL,waterD,u_dark);',
'  /* surface shimmer */',
'  float shim=vnoise(vec2(uv.x*asp*14.0-t*3.5,surf*22.0))*exp(-abs(uv.y-surf)*80.0);',
'  water+=vec3(0.9,0.97,1.0)*shim*0.5;',
'  col=mix(col,water,inWater);',
'  /* foam at wave edge */',
'  float foam=exp(-abs(uv.y-surf)*70.0)*0.6;',
'  col=mix(col,vec3(0.88,0.93,1.0),foam*inWater*0.7);',
'  return col;',
'}',
  ].join('\n');
};

/* ── CELL archetype ─────────────────────────────────
   Organic biology: soft membrane blobs, accent-tinted, dividing.
   params: complexity(0.7), speed(0.018), membrane(0.5)
─────────────────────────────────────────────────── */
ARCHETYPES['cell'] = function(p) {
  p=p||{};
  function f(v,d){return parseFloat(v!=null?v:d).toFixed(5);}
  return [
'vec3 render(vec2 uv, vec2 res){',
'  /* work in a square-ish UV space so blobs look circular */',
'  float asp=res.x/res.y, t=u_time*'+f(p.speed,'0.018')+';',
'  /* normalise to [0,1]x[0,1] regardless of aspect for circular blobs */',
'  vec2 puv=uv;',
'  float cx='+f(p.complexity,'0.7')+';',
'  /* background */',
'  vec3 bgD=mix(vec3(0.02,0.04,0.06),vec3(0.04,0.08,0.10),uv.y);',
'  vec3 bgL=mix(vec3(0.88,0.92,0.96),vec3(0.70,0.80,0.88),uv.y);',
'  vec3 col=mix(bgL,bgD,u_dark);',
'  /* 3 drifting organic blobs — positions in [0,1]x[0,1] */',
'  float m='+f(p.membrane,'0.50')+';',
'  vec2 c0=vec2(0.50+0.20*sin(t*1.1),0.50+0.18*cos(t*0.9));',
'  vec2 c1=vec2(0.50+0.28*cos(t*0.7+1.5),0.50+0.20*sin(t*1.3+0.8));',
'  vec2 c2=vec2(0.50+0.16*sin(t*1.4+3.0),0.50+0.25*cos(t*0.8+2.1));',
'  /* scale distances so blobs fill ~40% of canvas height */',
'  float sc=0.36;',
'  float b0=length((puv-c0)/vec2(sc*asp/res.y*res.x,sc));',
'  float b1=length((puv-c1)/vec2(sc*0.80*asp/res.y*res.x,sc*0.80));',
'  float b2=length((puv-c2)/vec2(sc*0.65*asp/res.y*res.x,sc*0.65));',
'  /* for narrow canvas use simpler circular metric: equalise axes */',
'  float sqrAsp=sqrt(asp);',
'  b0=length(vec2((puv.x-c0.x)*sqrAsp, puv.y-c0.y))/0.38;',
'  b1=length(vec2((puv.x-c1.x)*sqrAsp, puv.y-c1.y))/0.30;',
'  b2=length(vec2((puv.x-c2.x)*sqrAsp, puv.y-c2.y))/0.24;',
'  /* metaball field */',
'  float field=1.0/b0+1.0/b1+1.0/b2;',
'  float thresh=mix(3.2,3.8,m);',
'  float inside=smoothstep(thresh-0.3,thresh+0.1,field);',
'  /* organic noise on membrane */',
'  float noise=fbm(puv*5.0*vec2(asp,1.0)+t*0.5)*0.4;',
'  float ring=smoothstep(thresh+noise*0.4,thresh-0.15+noise*0.4,field)*',
'             smoothstep(thresh-0.5,thresh-0.1+noise*0.3,field);',
'  /* cell interior: faint tinted fill */',
'  vec3 fillD=u_accent*0.22+vec3(0.04,0.06,0.08);',
'  vec3 fillL=u_accent*0.14+vec3(0.72,0.82,0.88);',
'  col=mix(col,mix(fillL,fillD,u_dark),inside*0.70);',
'  /* membrane: bright accent ring */',
'  col+=u_accent*(ring*0.95*(0.75+0.25*u_dark));',
'  /* nucleus: small bright centre of biggest blob */',
'  float nuc=1.0-smoothstep(0.04,0.09,length(vec2((puv.x-c0.x)*sqrAsp,puv.y-c0.y)));',
'  col+=mix(vec3(0.6,0.8,0.6),u_accent2,0.4)*nuc*0.9;',
'  /* floating organelle motes */',
'  for(int i=0;i<6;i++){',
'    float fi=float(i)*0.618;',
'    vec2 mp=vec2(fract(fi*0.7+c0.x+t*0.02),fract(fi*0.5+c0.y+t*0.015));',
'    float md=length(vec2((puv.x-mp.x)*sqrAsp,puv.y-mp.y));',
'    col+=u_accent*(1.0-smoothstep(0.0,0.022,md))*inside*0.65;',
'  }',
'  return col;',
'}',
  ].join('\n');
};

/* ── FIELD archetype ────────────────────────────────
   Abstract glowing particle/number grid.
   params: gridScale(8.0), pulseSpeed(0.9), density(0.68)
─────────────────────────────────────────────────── */
ARCHETYPES['field'] = function(p) {
  p=p||{};
  function f(v,d){return parseFloat(v!=null?v:d).toFixed(5);}
  return [
'vec3 render(vec2 uv, vec2 res){',
'  float asp=res.x/res.y, t=u_time;',
'  float gs='+f(p.gridScale,'8.0')+', ps='+f(p.pulseSpeed,'0.9')+';',
'  float dn='+f(p.density,'0.68')+';',
'  /* dark field */',
'  vec3 bg=mix(vec3(0.86,0.88,0.94)*0.9,vec3(0.02,0.03,0.07),u_dark);',
'  bg=mix(bg,bg+u_accent*0.06,0.4);',
'  vec3 col=bg;',
'  /* dot grid */',
'  vec2 guv=uv*vec2(asp*gs,gs);',
'  vec2 gcell=floor(guv), gf=fract(guv)-0.5;',
'  float gh=hash(gcell);',
'  float gv=hash(gcell+vec2(4.1,2.9));',
'  float active=step(dn,gh);',
'  /* pulse wave sweeping across */',
'  float wave=sin(gcell.x/gs*6.283-t*ps+gcell.y*0.4)*0.5+0.5;',
'  float brightness=active*(0.3+0.7*wave*(0.6+0.4*sin(t*1.4+gv*6.28)));',
'  float dot=1.0-smoothstep(0.0,0.28,length(gf));',
'  col+=u_accent*dot*brightness*(0.6+0.4*u_dark);',
'  /* connecting lines between lit neighbours */',
'  float lineH=active*step(dn,hash(gcell+vec2(1,0)));',
'  float lineV=active*step(dn,hash(gcell+vec2(0,1)));',
'  col+=u_accent*(exp(-abs(gf.y)*18.0)*lineH+exp(-abs(gf.x)*18.0)*lineV)*0.18*wave;',
'  /* accent halo */',
'  float halo=fbm(uv*3.0-t*0.06)*0.5;',
'  col+=u_accent*halo*0.07;',
'  return col;',
'}',
  ].join('\n');
};

/* ── HISTORY archetype ──────────────────────────────
   Sandy desert + warm ancient tones + dust particles.
   params: sandColor(warm), dustDensity(0.6), sunX(0.72)
─────────────────────────────────────────────────── */
ARCHETYPES['history'] = function(p) {
  p=p||{};
  function f(v,d){return parseFloat(v!=null?v:d).toFixed(5);}
  return [
'vec3 render(vec2 uv, vec2 res){',
'  float asp=res.x/res.y, t=u_time*0.018;',
'  float dd='+f(p.dustDensity,'0.6')+';',
'  /* sky: warm ancient bronze → deep night */',
'  vec3 skyD=mix(vec3(0.06,0.04,0.03),vec3(0.16,0.10,0.05),pow(1.0-uv.y,1.5));',
'  vec3 skyL=mix(vec3(0.96,0.82,0.50),vec3(0.64,0.78,0.94),pow(uv.y,0.55));',
'  vec3 col=mix(skyL,skyD,u_dark);',
'  /* slight accent in sky — kept subtle so sky stays warm-toned */',
'  col+=u_accent*0.05*(1.0-uv.y*0.8);',
'  /* sun / moon */',
'  float sx='+f(p.sunX,'0.72')+';',
'  float sd=length(vec2((uv.x-sx)*asp,uv.y-0.82));',
'  vec3 sunC=mix(vec3(1.0,0.90,0.55),u_accent2,0.25);',
'  col+=sunC*(exp(-sd*mix(3.8,7.5,u_dark))*mix(0.55,0.25,u_dark)+(1.0-smoothstep(0.038,0.052,sd))*1.2);',
'  /* desert horizon ridge */',
'  float hN=fbm(vec2(uv.x*asp*2.2+t*0.5,8.4));',
'  float horizon=0.32+0.08*hN;',
'  float inSand=smoothstep(horizon+0.006,horizon-0.008,uv.y);',
'  vec3 sandD=mix(vec3(0.22,0.14,0.06),vec3(0.12,0.08,0.04),(uv.y-horizon));',
'  vec3 sandL=mix(vec3(0.88,0.68,0.36),vec3(0.66,0.46,0.20),(uv.y-horizon));',
'  /* sand stays warm-toned regardless of accent */',
'  /* darken lower foreground so it reads as solid earth, not blown-out white */',
'  float foreground=clamp((horizon-uv.y)/horizon,0.0,1.0);',
'  vec3 sandDark=mix(mix(sandL,sandD,u_dark),mix(sandL,sandD,u_dark)*0.35,foreground*foreground);',
'  col=mix(col,sandDark,inSand);',
'  /* sand dune shading */',
'  float dune=vnoise(vec2(uv.x*asp*6.0+t*0.3,horizon*8.0));',
'  col=mix(col,col*mix(1.1,0.8,dune),inSand*0.28);',
'  /* warm dust motes in sky only (sandy colour, not accent) */',
'  vec3 dustC=mix(vec3(0.90,0.72,0.38),vec3(0.60,0.44,0.18),u_dark);',
'  for(int i=0;i<5;i++){',
'    float fi=float(i)*0.618;',
'    float dx=fract(fi*4.3+t*0.22+float(i)*0.17);',
'    float dy=horizon+0.08+fract(fi*1.3+t*0.06)*0.55; /* sky region only */',
'    float dd2=length(vec2((uv.x-dx)*asp,uv.y-dy));',
'    col+=dustC*(1.0-smoothstep(0.0,0.025,dd2))*dd*0.55*(0.5+0.5*sin(t*3.0+fi*5.2));',
'  }',
'  /* warm dust haze near horizon */',
'  col=mix(col,mix(sandL,sandD,u_dark)*0.7+dustC*0.15,exp(-(uv.y-horizon)*22.0)*inSand*0.35);',
'  return col;',
'}',
  ].join('\n');
};

/* ── SCENE REGISTRY ── cosmos ── */
GPU.Scenes['big-bang']           = GPU.archetype('cosmos', { bodySize:0.08, bodyX:0.50, bodyY:0.50, nebulaScale:0.9, drift:0.020 });
GPU.Scenes['age-of-universe']    = GPU.archetype('cosmos', { bodySize:0.05, bodyX:0.65, bodyY:0.55, nebulaScale:1.1, drift:0.010 });
GPU.Scenes['expanding-universe'] = GPU.archetype('cosmos', { bodySize:0.04, bodyX:0.30, bodyY:0.52, nebulaScale:0.8, drift:0.014 });
GPU.Scenes['celestial-orbits']   = GPU.archetype('cosmos', { bodySize:0.06, bodyX:0.55, bodyY:0.50, nebulaScale:1.3, drift:0.008 });
GPU.Scenes['wormholes']          = GPU.archetype('cosmos', { bodySize:0.09, bodyX:0.50, bodyY:0.50, nebulaScale:1.0, drift:0.016 });
GPU.Scenes['sirius-distance']    = GPU.archetype('cosmos', { bodySize:0.07, bodyX:0.62, bodyY:0.54, nebulaScale:1.2, drift:0.012 });
GPU.Scenes['moon-landing']       = GPU.archetype('cosmos', { bodySize:0.11, bodyX:0.58, bodyY:0.52, nebulaScale:0.7, drift:0.006 });
GPU.Scenes['pulsar-navigation']  = GPU.archetype('cosmos', { bodySize:0.04, bodyX:0.44, bodyY:0.50, nebulaScale:1.4, drift:0.022 });
GPU.Scenes['pulsars-blackholes'] = GPU.archetype('cosmos', { bodySize:0.10, bodyX:0.50, bodyY:0.50, nebulaScale:0.9, drift:0.018 });
GPU.Scenes['red-giant']          = GPU.archetype('cosmos', { bodySize:0.18, bodyX:0.50, bodyY:0.50, nebulaScale:0.6, drift:0.008 });
GPU.Scenes['venus']              = GPU.archetype('cosmos', { bodySize:0.08, bodyX:0.60, bodyY:0.55, nebulaScale:1.0, drift:0.010 });

/* ── fluid ── */
GPU.Scenes['sea-land']       = GPU.archetype('fluid', { waveH:0.42, waveSpeed:0.55, deepness:0.72 });
GPU.Scenes['wind-atmosphere']= GPU.archetype('fluid', { waveH:0.48, waveSpeed:0.80, deepness:0.50 });
GPU.Scenes['atmosphere']     = GPU.archetype('fluid', { waveH:0.52, waveSpeed:0.40, deepness:0.35 });

/* ── cell ── */
GPU.Scenes['chromosomes']         = GPU.archetype('cell', { complexity:0.75, speed:0.014 });
GPU.Scenes['bee-female']          = GPU.archetype('cell', { complexity:0.60, speed:0.020, membrane:0.55 });
GPU.Scenes['fish']                = GPU.archetype('cell', { complexity:0.65, speed:0.016 });
GPU.Scenes['human-embryo']        = GPU.archetype('cell', { complexity:0.80, speed:0.012, membrane:0.48 });
GPU.Scenes['brainstem']           = GPU.archetype('cell', { complexity:0.72, speed:0.018 });
GPU.Scenes['inner-ear']           = GPU.archetype('cell', { complexity:0.68, speed:0.015 });
GPU.Scenes['skin-memory']         = GPU.archetype('cell', { complexity:0.58, speed:0.022 });
GPU.Scenes['brain-functions']     = GPU.archetype('cell', { complexity:0.82, speed:0.016 });
GPU.Scenes['mosquito']            = GPU.archetype('cell', { complexity:0.55, speed:0.024 });
GPU.Scenes['ants']                = GPU.archetype('cell', { complexity:0.62, speed:0.020 });
GPU.Scenes['man-woman-chromosomes']= GPU.archetype('cell', { complexity:0.78, speed:0.013 });
GPU.Scenes['man-woman']           = GPU.archetype('cell', { complexity:0.70, speed:0.016 });

/* ── field ── */
GPU.Scenes['prime-numbers']  = GPU.archetype('field', { gridScale:9.0, pulseSpeed:1.1, density:0.72 });
GPU.Scenes['ring-composition']= GPU.archetype('field', { gridScale:7.0, pulseSpeed:0.7, density:0.65 });
GPU.Scenes['calendar-cycles']= GPU.archetype('field', { gridScale:8.0, pulseSpeed:1.4, density:0.60 });
GPU.Scenes['life-death']     = GPU.archetype('field', { gridScale:8.5, pulseSpeed:0.9, density:0.68 });
GPU.Scenes['angels-devils']  = GPU.archetype('field', { gridScale:7.5, pulseSpeed:1.0, density:0.65 });
GPU.Scenes['world-hereafter']= GPU.archetype('field', { gridScale:6.5, pulseSpeed:0.8, density:0.70 });
GPU.Scenes['adam-jesus']     = GPU.archetype('field', { gridScale:9.0, pulseSpeed:0.6, density:0.62 });
GPU.Scenes['lightning-1313'] = GPU.archetype('field', { gridScale:10.0, pulseSpeed:2.2, density:0.75 });
GPU.Scenes['hell-paradise']  = GPU.archetype('field', { gridScale:8.0, pulseSpeed:1.0, density:0.66 });

/* ── history ── */
GPU.Scenes['pharaoh-mummy']      = GPU.archetype('history', { dustDensity:0.65, sunX:0.70 });
GPU.Scenes['pharaoh-crucifixion']= GPU.archetype('history', { dustDensity:0.55, sunX:0.75 });
GPU.Scenes['pharaoh-mourning']   = GPU.archetype('history', { dustDensity:0.60, sunX:0.68 });
GPU.Scenes['haman']              = GPU.archetype('history', { dustDensity:0.70, sunX:0.72 });
GPU.Scenes['paper-money']        = GPU.archetype('history', { dustDensity:0.45, sunX:0.65 });
GPU.Scenes['crow-funerals']      = GPU.archetype('history', { dustDensity:0.50, sunX:0.60 });
GPU.Scenes['reading']            = GPU.archetype('history', { dustDensity:0.40, sunX:0.78 });
GPU.Scenes['spider-web']         = GPU.archetype('history', { dustDensity:0.35, sunX:0.66 });
GPU.Scenes['camel-drink']        = GPU.archetype('history', { dustDensity:0.75, sunX:0.74 });

/* Forge family */
GPU.Scenes['gold-melting']    = GPU.archetype('forge', { temp:0.72, sparks:0.85, smoke:0.32, glow:0.65, poolH:0.42 });
GPU.Scenes['silver-melting']  = GPU.archetype('forge', { temp:0.62, sparks:0.70, smoke:0.28, glow:0.55, poolH:0.44 });
GPU.Scenes['sun-temperature'] = GPU.archetype('forge', { temp:0.95, sparks:1.00, smoke:0.18, glow:0.85, poolH:0.30 });
GPU.Scenes['iron']            = GPU.archetype('forge', { temp:0.80, sparks:0.95, smoke:0.42, glow:0.72, poolH:0.40 });
GPU.Scenes['carbon-creation'] = GPU.archetype('forge', { temp:0.98, sparks:1.00, smoke:0.10, glow:0.90, poolH:0.25 });

G.GPU = GPU;
}(window));
