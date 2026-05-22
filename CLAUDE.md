# Quranic Numerics — Project Design System

## What this project is
An interactive web learning platform. Each page teaches one mathematical/scientific discovery encoded in the Quran. The UX is Duolingo-style lessons (progress bar, MC exercises, feedback panel) with Brilliant.org-style animations (smooth counters, cascade reveals). All pages are single-file HTML.

---

## CRITICAL: Content & pedagogy rules (apply before writing any lesson content)

**Target audience:** High school level — intelligent but not specialist. Define any technical term the first time it appears.

**Editorial filter — always apply to raw source material:**
1. Pick **2–3 core facts maximum** per lesson. If the source has 10 facts, identify the 3 most shocking and most verifiable.
2. Choose facts that are **direct and undeniable** — short inference chains only. Preferred form: "X appears/measures N times, and N is [remarkable because Y]."
3. **Avoid** scholarly debates, apologetics, long chains of inference, or speculative claims. Keep it factual and clean.
4. The **S4 verdict** must leave the student thinking: *"That's impossible to be a coincidence."*

**Framing order for every fact:**
> Lead with the number / measurement → explain what it means in plain language → show why it's remarkable

**Never overwhelm:** If a concept needs more than 2 sentences to explain, simplify or cut it. The student should finish each stage feeling clarity, not confusion.

**NEVER frame the Quran as something being defended or questioned.** Do not write MC questions like "A skeptic says X is wrong — respond." Do not use labels like "The skeptic's objection." The lesson presents facts as discoveries, not as a debate. The student is a learner exploring something remarkable, not a debater defending a position.

---

## Shared infrastructure — always present, never recreate

These two files are linked by every page and must never be duplicated inline:

| File | Purpose |
|------|---------|
| `theme.css` | Dark/light/system theme variables, toggle widget CSS, View Transition animation |
| `theme.js` | Theme preference storage, toggle interaction, system-pref listener |

Every page's `<head>` must contain (in this order, before any `<style>`):
```html
<script>!function(){var t=localStorage.getItem('qn_theme')||'system';document.documentElement.setAttribute('data-theme','system'===t?window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light':t)}();</script>
<link rel="stylesheet" href="theme.css">
```

Every page's `<body>` opens with (theme toggle + home button):
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

Every page ends with (before `</body>`):
```html
<script src="theme.js"></script>
```

**`_template.html` already includes all of the above.** Copying it means zero manual theme wiring.

---

## CRITICAL: Never deviate from these design rules

### Colors (CSS variables — identical on every page)
```css
--bg:           #0b1622;   /* page background */
--surface:      #111e2e;   /* card / box background */
--surface2:     #182840;   /* slightly lighter surface */
--border:       rgba(255,255,255,0.08);
--text:         #e2ddd4;   /* body text */
--muted:        #7a8fa3;   /* secondary text */
--gold:         #f59e0b;
--gold-light:   #fcd34d;
--ok:           #22c55e;   /* correct answer green */
--ok-bg:        #052e16;
--ok-border:    #166534;
--err-light:    #f87171;
--err-bg:       #2d0707;
--err-border:   #991b1b;
```
Each page also gets a unique `--accent` / `--accent-light` / `--accent-dim` / `--accent-ring` — choose a hue not yet used (see accent palette below).

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
`160px` bottom padding is mandatory — it keeps content clear of the fixed feedback panel.

### Accent palette already used (pick something different)
| Page | Accent |
|------|--------|
| Sea & Land | #0ea5e9 |
| Chromosomes / Bee | #f59e0b / #fbbf24 |
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

Good unused hues: `#2dd4bf` (teal), `#f472b6` (pink), `#fb7185` (rose), `#fdba74` (peach), `#a8a29e` (warm-gray), `#67e8f9` (light-cyan).

---

## Page structure — every page has exactly these elements

```
HEAD:
  0a. no-flash theme script          ← inline <script> before any stylesheet
  0b. <link href="theme.css">        ← shared theme file
  0c. Google Fonts link
  0d. <style> block                  ← page-specific CSS only

BODY:
  1. #themeToggle                    ← dark/system/light pill (fixed top-right)
  2. <a class="nav-home-fixed">      ← "All lessons" pill (fixed top-left)
  3. <div class="dot-field">         ← decorative dot-grid
  4. <div class="container">
  5.   <a class="nav-back">          ← "← Previous Page" link
  6.   .lesson-bar-wrap + #lbar      ← Duolingo progress bar
  7.   #lmeta                        ← "Exercise N of 3" label
  8.   #s0 .stage.active             ← intro: heroCanvas + verse + claim
  9.   #s1 .stage                    ← MC exercise 1
 10.   #s2 .stage                    ← topic-specific interactive
 11.   #s3 .stage                    ← MC exercise 2
 12.   #s4 .stage                    ← verdict: xpBadge + counters + table
 13. #fbPanel .fb-panel              ← OUTSIDE .container, fixed at bottom
 14. <script src="theme.js">         ← shared theme engine
```

---

## Hero canvas — stage 0 always starts with this

```html
<canvas id="heroCanvas" width="640" height="130"
  style="width:100%;height:130px;border-radius:14px;margin-bottom:28px;display:block;"></canvas>
```

- Topic-relevant looping animation (match the lesson subject visually)
- Dark background (`#040810` or similar near-black)
- Subtle, never distracting — supports the title, doesn't compete
- Called via `initHeroCanvas()` at the end of the script block
- See existing pages for reference patterns: moon orbit arc, star field, sea waves, crystal lattice, etc.

---

## Exercise animation standards — REQUIRED for new pages

**Do NOT use text-only MC questions for complex physics/science concepts.** At least one exercise stage (S1 or S2) must include a canvas animation or interactive mechanic that visually demonstrates the key concept before asking the MC question.

### Rule
- S1 can be: animated canvas + MC (canvas auto-starts on `go(1)`, MC appears after animation ends)
- S2 is always: button-triggered interactive canvas → reveal → Continue button
- S3 can be: pure MC (topic should be clear after S1+S2 established the concept)
- MC questions must reference what was just demonstrated, not standalone trivia

### Canvas init pattern (for exercise stages)
```javascript
// In go(n):
if (n === 1) setTimeout(initExCanvas, 60);
if (n === 2) setTimeout(initScanCanvas, 60);

// Each init function draws an initial static frame and starts the RAF loop:
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

### Proven exercise animation patterns (reuse or invent new ones):

| Concept | Pattern | Example page |
|---------|---------|-------------|
| Time dilation | Two side-by-side clock canvases at different speeds; counters race | wormholes S1 |
| Space shortcut | Bezier line folds into arc; distance counter drops to 0 | wormholes S2 |
| Length contraction | Rectangle (camel) approaches narrow gap, bounces, compresses & passes | wormholes S3 |
| Layer revelation | Seismic wave sweeps down a cross-section; target feature glows as wave hits it | internal-mountains S2 |
| Before/After comparison | Split-panel canvas: left = old assumption, right = Quranic claim; panels fade in sequentially | internal-mountains S1 |
| Pulsar knock rings | Expanding concentric circles from a point source on a canvas | pulsars-blackholes S2 |
| Ratio bar chart | Colored proportion bars embedded in answer-card to show scale | age-of-universe S1 |

### Canvas RNG pattern (deterministic star fields):
```javascript
function makeRng(seed) {
  var s = seed;
  return function() { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}
// Called INSIDE the draw function so every frame draws same stars at same positions.
// E.g.: var rng = makeRng(77); for (var i=0; i<35; i++) { ... rng() ... }
```

### Exercise CSS tokens to reuse:
```css
/* Counter display */
.ex-num { font-family:'Playfair Display',serif; font-size:32px; font-weight:700; color:var(--accent-light); line-height:1; }
.ex-unit { font-size:11px; color:var(--muted); letter-spacing:.06em; text-transform:uppercase; margin-top:3px; }
/* Result reveal panel */
.ex-result { background:var(--surface); border:1px solid var(--accent-ring); border-radius:12px; padding:18px 20px; margin:16px 0; display:none; animation:rise .35s ease; }
.ex-result.show { display:block; }
/* Side-by-side panels */
.ex-arena { display:flex; gap:16px; margin:20px 0; }
.ex-panel { flex:1; background:var(--surface); border:1px solid var(--border); border-radius:14px; padding:16px; text-align:center; }
```

---

## JS patterns — copy verbatim, never reinvent

### Core engine (never modify)
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
    saveProgress('[LESSON_ID]');   /* ← REQUIRED: marks lesson done in localStorage */
    setTimeout(function() {
      document.getElementById('xpBadge').classList.add('show');
      setTimeout(function() {
        /* fire animFrom calls for verdict counters here */
      }, 400);
    }, 300);
  }
}

/* saveProgress — copy verbatim, replace '[LESSON_ID]' above */
function saveProgress(id) {
  var d = new Set(JSON.parse(localStorage.getItem('qn_done') || '[]'));
  if (!d.has(id)) {
    d.add(id);
    localStorage.setItem('qn_done', JSON.stringify([...d]));
    localStorage.setItem('qn_xp', String(parseInt(localStorage.getItem('qn_xp') || '0') + 30));
  }
}

function hideFb() {
  document.getElementById('fbPanel').className = 'fb-panel';
}

function showOk(sub, onContinue) {
  document.getElementById('fbIcon').textContent = '✓';
  document.getElementById('fbTitle').textContent = 'Correct!';
  document.getElementById('fbSub').textContent = sub;
  const p = document.getElementById('fbPanel');
  p.className = 'fb-panel fb-ok show';
  document.getElementById('fbBtn').onclick = function() { hideFb(); onContinue(); };
}
```

### barMap / metaMap (fill in lesson title)
```javascript
const barMap  = { 0: '0%', 1: '0%', 2: '33%', 3: '66%', 4: '100%' };
const metaMap = {
  0: 'Lesson · [LESSON TITLE]',
  1: 'Exercise 1 of 3',
  2: 'Exercise 2 of 3',
  3: 'Exercise 3 of 3',
  4: 'Lesson Complete'
};
```

### MC answer handler (use for S1 and S3)
```javascript
function pickEx1(el, correct) {
  if (document.querySelector('#s1 .ac-correct')) return;
  if (correct) {
    el.classList.add('ac-correct');
    document.querySelectorAll('#s1 .answer-card').forEach(function(c) {
      if (!c.classList.contains('ac-correct')) c.classList.add('ac-disabled');
    });
    showOk('[CORRECT ANSWER EXPLANATION]', function() { go(2); });
  } else {
    el.classList.add('ac-wrong');
    setTimeout(function() { el.classList.remove('ac-wrong'); }, 500);
  }
}
// Same pattern for pickEx3 — replace #s1 with #s3, go(2) with go(4)
```

---

## Answer card HTML structure
```html
<div onclick="pickEx1(this, false)" class="answer-card">
  <div class="ac-letter">A</div>
  <div class="ac-body">
    <div class="ac-big">Option text</div>          <!-- for numbers/short text -->
    <!-- OR for Arabic verses: -->
    <div class="ac-ar">Arabic text</div>
    <div class="ac-ref">2:255 · Surah Name</div>
    <div class="ac-tr">Translation in italics</div>
    <!-- optional: -->
    <div class="ac-sub">Subtitle / context</div>
  </div>
</div>
```
Set `onclick="pickEx1(this, true)"` on the ONE correct answer. Always 3 options (A/B/C).

---

## XP Badge (S4 — verbatim)
```html
<div class="xp-badge" id="xpBadge">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  <span class="xp-text">Lesson complete · +30 XP</span>
</div>
```

## fb-panel HTML (verbatim, outside .container)
```html
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

---

## How to build a new page

1. **Copy `_template.html`** to `quran-[topic-slug].html`
2. Fill in every section marked `<!-- FILL: ... -->` or `[PLACEHOLDER]`
3. Do NOT modify any CSS class names, variable names, or JS function signatures
4. Add the new page to `index.html` lessons array
5. Update nav-back / next-page links on adjacent pages

### What you MUST provide when requesting a new page
- Lesson title (English + Arabic)
- The hook number(s) that appear large on the index card
- The key Quranic verse(s) with reference, Arabic text, and translation
- The numerical discovery: what numbers match, and why
- S1 MC question + 3 options (mark which is correct)
- S2 interactive mechanic description (calculation, counter, builder, etc.)
- S3 MC question + 3 options (mark which is correct)
- S4 verdict: the final message + what the animated counter(s) count to
- Canvas animation theme (what should visually appear in the hero)
- Accent color (pick from unused hues above)
- Previous page and next page links
