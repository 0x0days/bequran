# Quranic Numerics — Project Design System

## What this project is
An interactive web learning platform. Each page teaches one mathematical/scientific discovery encoded in the Quran. The UX is Duolingo-style lessons (progress bar, MC exercises, feedback panel) with Brilliant.org-style animations (smooth counters, cascade reveals). All pages are single-file HTML. **Currently 34 lessons.**

---

## Project file map

```
index.html          ← dashboard: lesson cards grid, Islamic art hero, stats
_template.html      ← copy this to start any new lesson page
theme.css           ← shared dark/light/system theme tokens + toggle CSS
theme.js            ← theme preference storage + toggle logic
card-canvas.js      ← 34 hero canvas animations adapted for index cards
quran-*.html        ← 34 lesson pages (one per topic)
```

---

## CRITICAL: Content & pedagogy rules

**Target audience:** High school level — intelligent but not specialist. Define any technical term the first time it appears.

**Editorial filter:**
1. Pick **2–3 core facts maximum** per lesson. Most shocking + most verifiable.
2. Facts must be **direct and undeniable** — short inference chains only.
3. **Avoid** scholarly debates, apologetics, long chains of inference, or speculative claims.
4. The **S4 verdict** must leave the student thinking: *"That's impossible to be a coincidence."*

**Framing order:** Lead with the number / measurement → explain in plain language → show why it's remarkable.

**NEVER frame the Quran as something being defended or questioned.** No "skeptic objects" framing. Facts are presented as discoveries.

---

## Shared infrastructure — never recreate inline

| File | Purpose |
|------|---------|
| `theme.css` | Dark/light/system theme variables, toggle widget CSS, View Transition |
| `theme.js` | Theme preference storage, toggle interaction, system-pref listener |

Every lesson page `<head>` (before any `<style>`):
```html
<script>!function(){var t=localStorage.getItem('qn_theme')||'system';document.documentElement.setAttribute('data-theme','system'===t?window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light':t)}();</script>
<link rel="stylesheet" href="theme.css">
```

Every lesson page `<body>` opens with:
```html
<div class="theme-toggle" id="themeToggle" role="group" aria-label="Color theme">
  <button class="tt-btn" data-theme-val="dark"   title="Dark">  <!-- moon SVG   --> </button>
  <button class="tt-btn" data-theme-val="system" title="System"><!-- monitor SVG --> </button>
  <button class="tt-btn" data-theme-val="light"  title="Light"> <!-- sun SVG    --> </button>
</div>
<a href="index.html" class="nav-home-fixed">
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
  All lessons
</a>
```

Every lesson page ends with (before `</body>`):
```html
<script src="theme.js"></script>
```

**`_template.html` already includes all of the above.** Always copy it.

---

## CRITICAL: Never deviate from these design rules

### Colors (CSS variables — identical on every page)
```css
--bg:           #0b1622;
--surface:      #111e2e;
--surface2:     #182840;
--border:       rgba(255,255,255,0.08);
--text:         #e2ddd4;
--muted:        #7a8fa3;
--gold:         #f59e0b;
--gold-light:   #fcd34d;
--ok:           #22c55e;
--ok-bg:        #052e16;
--ok-border:    #166534;
--err-light:    #f87171;
--err-bg:       #2d0707;
--err-border:   #991b1b;
```

### Fonts (always load all three)
```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Amiri:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
```
- **DM Sans** — body text, buttons, labels
- **Playfair Display** — hero titles, big numbers, `.prompt`
- **Amiri** — all Arabic text (`direction:rtl`)

### Body
```css
body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; padding: 44px 20px 160px; }
```
`160px` bottom padding is mandatory — keeps content clear of the fixed feedback panel.

### Accent palette — USED (do not reuse these)
| Page | Accent |
|------|--------|
| Sea & Land | #0ea5e9 |
| Chromosomes | #f59e0b |
| Bee Female | #fbbf24 |
| Fish | #06b6d4 |
| Man & Woman | #818cf8 |
| Man-Woman Chromosomes | #a78bfa |
| Adam & Jesus | #34d399 |
| Hell & Paradise | #f97316 |
| Life & Death | #22c55e |
| Angels & Devils | #c084fc |
| Lightning 13:13 | #38bdf8 |
| Calendar Cycles | #818cf8 |
| World & Hereafter | #a3e635 |
| Sun Temperature | #fb923c |
| Silver Melting | #94a3b8 |
| Gold Melting | #fbbf24 |
| Sirius Distance | #93c5fd |
| Moon Landing | #4338ca |
| Carbon Creation | #86efac |
| Big Bang | #60a5fa |
| Age of Universe | #c084fc |
| Prime Numbers | #34d399 |
| Wormholes | #67e8f9 |
| Pulsars & Black Holes | #a78bfa |
| Pulsar Navigation | #38bdf8 |
| Red Giant | #fb7185 |
| Wind & Atmosphere | #2dd4bf |
| Human Embryo | #fdba74 |
| Internal Mountains | #f472b6 |
| Iron | #94a3b8 |
| Brain Functions | #c084fc |
| Dead Sea | #0ea5e9 |
| Mountains as Pegs | #34d399 |
| Moving Mountains | #a8a29e |

**Good unused hues:** `#e879f9` (fuchsia), `#4ade80` (green), `#fde68a` (pale gold), `#7dd3fc` (sky).

---

## Page structure — every lesson page has exactly these elements

```
HEAD:
  0a. no-flash theme script          ← inline <script> before any stylesheet
  0b. <link href="theme.css">
  0c. Google Fonts link
  0d. <style> block                  ← page-specific CSS only

BODY:
  1.  #themeToggle                   ← dark/system/light pill (fixed top-right)
  2.  <a class="nav-home-fixed">     ← "All lessons" pill (fixed top-left)
  3.  <div class="dot-field">        ← decorative dot-grid background
  4.  <div class="container">
  5.    <a class="nav-back">         ← "← Previous Lesson" link
  6.    .lesson-bar-wrap + #lbar     ← Duolingo progress bar
  7.    #lmeta                       ← "Exercise N of 3" label
  8.    #s0 .stage.active            ← intro: heroCanvas + verse + claim
  9.    #s1 .stage                   ← MC exercise 1
  10.   #s2 .stage                   ← topic-specific interactive canvas
  11.   #s3 .stage                   ← MC exercise 2
  12.   #s4 .stage                   ← verdict: xpBadge + animated counters
  13. #fbPanel .fb-panel             ← OUTSIDE .container, fixed at bottom
  14. <script src="theme.js">
```

---

## Hero canvas — stage 0 always starts with this

```html
<canvas id="heroCanvas" width="640" height="130"
  style="width:100%;height:130px;border-radius:14px;margin-bottom:28px;display:block;"></canvas>
```

- Topic-relevant looping animation. Dark background (`#040810` or similar).
- Subtle, never distracting. Called via `initHeroCanvas()` at end of `<script>`.
- Pattern: `var W = c.width, H = c.height, t = 0;` → draw → `t += 0.02; requestAnimationFrame(frame);`

---

## Adding a new lesson to index.html — 3 steps

### Step 1: Add to lessons array
```javascript
{ id:'my-topic', n:35, title:'My Topic', ar:'العربية',
  hook:'٧', teaser:'Short teaser sentence about the discovery...',
  cat:'astronomy', catLabel:'Astronomy', accent:'#e879f9',
  url:'quran-my-topic.html' }
```
Categories: `numerics` `astronomy` `biology` `geology` `physics` `chemistry`

### Step 2: Update stats
- Stats bar: change `<div class="stat-n">34</div>` to `35`
- Hero eyebrow: change `34 Discoveries` to `35 Discoveries`
- Progress fill JS: change `/34 *` to `/35 *`
- Filter tab: change `All 34` to `All 35`

### Step 3: Add canvas to card-canvas.js
```javascript
CardCanvases['my-topic'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  function frame() {
    ctx.fillStyle = '#040810';
    ctx.fillRect(0, 0, W, H);
    // ... draw your animation ...
    t += 0.02;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};
```
Rules for card-canvas.js:
- Always use `cv` (passed in), never `document.getElementById`
- Always assign RAF to `rafId` (not bare `requestAnimationFrame(...)`)
- Always return `{ stop }` — used by IntersectionObserver to pause off-screen cards
- Keep animations simple — card canvas is only 118px tall

---

## Index card structure (how cards are rendered)

Each `.lcard` has two zones:
```
┌─────────────────────────────────┐
│  .card-cv-zone  (118px)         │  ← canvas animation at full opacity
│    canvas.card-cv               │
│    .card-cv-fade  (gradient)    │  ← transparent → --surface fade
├─────────────────────────────────┤
│  .card-body  (padded)           │  ← category pill, hook number, title,
│                                 │     teaser, Arabic, footer (XP + arrow)
└─────────────────────────────────┘
```

The `IntersectionObserver` in index.html starts each canvas when the card enters the viewport and stops it when it leaves. Canvas is sized inside the observer:
```javascript
cv.width  = cv.offsetWidth  * dpr;
cv.height = cv.offsetHeight * dpr;
cv._anim  = CardCanvases[id](cv);
```

**CRITICAL: Never guard the IO observer setup with `typeof CardCanvases === 'undefined'` — that check runs before card-canvas.js loads and kills the observer. Guard inside the callback with `if (CardCanvases[id])` only.**

---

## Exercise animation standards

At least one of S1/S2 must have a canvas animation demonstrating the concept.

### Canvas init pattern (for exercise stages)
```javascript
// In go(n):
if (n === 1) setTimeout(initExCanvas, 60);
if (n === 2) setTimeout(initScanCanvas, 60);

function initExCanvas() {
  var cv = document.getElementById('exCanvas');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var startTs = null, DURATION = 1600;
  function tick(ts) {
    if (!startTs) startTs = ts;
    var p = Math.min((ts - startTs) / DURATION, 1);
    drawExFrame(ctx, cv.width, cv.height, p);
    if (p < 1) { requestAnimationFrame(tick); }
    else { document.getElementById('exMc').style.display = 'block'; }
  }
  requestAnimationFrame(tick);
}
```

### Deterministic RNG for star fields
```javascript
function makeRng(seed) {
  var s = seed;
  return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}
```

---

## JS engine — copy verbatim, never reinvent

```javascript
let stage = 0;

function ease(t) { return 1 - Math.pow(1 - t, 3); }

function animFrom(el, from, to, ms, cb) {
  let t0 = null;
  const run = function(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / ms, 1);
    el.textContent = Math.round(from + ease(p) * (to - from)).toLocaleString();
    if (p < 1) requestAnimationFrame(run);
    else if (cb) cb();
  };
  requestAnimationFrame(run);
}

function go(n) {
  document.getElementById('s' + stage).classList.remove('active');
  stage = n;
  document.getElementById('s' + stage).classList.add('active');
  document.getElementById('lbar').style.width = barMap[n];
  document.getElementById('lmeta').textContent = metaMap[n];
  window.scrollTo(0, 0);
  if (n === 4) {
    saveProgress('LESSON_ID');
    setTimeout(function() {
      document.getElementById('xpBadge').classList.add('show');
      setTimeout(function() { /* animFrom calls here */ }, 400);
    }, 300);
  }
}

function saveProgress(id) {
  var d = new Set(JSON.parse(localStorage.getItem('qn_done') || '[]'));
  if (!d.has(id)) {
    d.add(id);
    localStorage.setItem('qn_done', JSON.stringify([...d]));
    localStorage.setItem('qn_xp', String(parseInt(localStorage.getItem('qn_xp') || '0') + 30));
  }
}

function hideFb() { document.getElementById('fbPanel').className = 'fb-panel'; }

function showOk(sub, onContinue) {
  document.getElementById('fbIcon').textContent = '✓';
  document.getElementById('fbTitle').textContent = 'Correct!';
  document.getElementById('fbSub').textContent = sub;
  const p = document.getElementById('fbPanel');
  p.className = 'fb-panel fb-ok show';
  document.getElementById('fbBtn').onclick = function() { hideFb(); onContinue(); };
}

const barMap  = { 0:'0%', 1:'0%', 2:'33%', 3:'66%', 4:'100%' };
const metaMap = { 0:'Lesson · TITLE', 1:'Exercise 1 of 3', 2:'Exercise 2 of 3', 3:'Exercise 3 of 3', 4:'Lesson Complete' };
```

### MC answer handler
```javascript
function pickEx1(el, correct) {
  if (document.querySelector('#s1 .ac-correct')) return;
  if (correct) {
    el.classList.add('ac-correct');
    document.querySelectorAll('#s1 .answer-card').forEach(function(c) {
      if (!c.classList.contains('ac-correct')) c.classList.add('ac-disabled');
    });
    showOk('Explanation here.', function() { go(2); });
  } else {
    el.classList.add('ac-wrong');
    setTimeout(function() { el.classList.remove('ac-wrong'); }, 500);
  }
}
// pickEx3: same but #s3 and go(4)
```

---

## Answer card HTML
```html
<div onclick="pickEx1(this, false)" class="answer-card">
  <div class="ac-letter">A</div>
  <div class="ac-body">
    <div class="ac-big">Option text</div>
    <!-- OR Arabic: -->
    <div class="ac-ar">Arabic text</div>
    <div class="ac-ref">2:255 · Surah Name</div>
    <div class="ac-tr">Translation</div>
  </div>
</div>
```
Set `onclick="pickEx1(this, true)"` on the ONE correct answer. Always 3 options (A/B/C).

---

## XP Badge + fb-panel (verbatim — never improvise)

```html
<!-- XP Badge inside #s4 -->
<div class="xp-badge" id="xpBadge">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  <span class="xp-text">Lesson complete · +30 XP</span>
</div>

<!-- fb-panel OUTSIDE .container -->
<div class="fb-panel" id="fbPanel">
  <div class="fb-left">
    <div class="fb-icon" id="fbIcon">✓</div>
    <div>
      <div class="fb-title" id="fbTitle">Correct!</div>
      <div class="fb-sub" id="fbSub"></div>
    </div>
  </div>
  <button class="fb-btn" id="fbBtn">Continue</button>
</div>
```

The fb-panel CSS **must be defined inline** in each page's `<style>` block — it is NOT in theme.css. Copy it from any existing lesson page.

---

## How to build a new lesson page

1. `cp _template.html quran-my-topic.html`
2. Fill every `[PLACEHOLDER]` / `<!-- FILL -->` section
3. Do NOT rename CSS classes, JS function signatures, or HTML IDs
4. Add to `index.html` lessons array (Step 1 above)
5. Update stats count (Step 2 above)
6. Add canvas to `card-canvas.js` (Step 3 above)
7. Update `nav-back` link on this page + `Next →` link on previous page

### Checklist before shipping a new page
- [ ] `saveProgress('my-topic')` ID matches the `id` in lessons array
- [ ] `initHeroCanvas()` called at bottom of script
- [ ] fb-panel CSS block present in `<style>`
- [ ] `<script src="theme.js"></script>` before `</body>`
- [ ] Accent color not already used (check palette table above)
- [ ] `CardCanvases['my-topic']` added to `card-canvas.js`
