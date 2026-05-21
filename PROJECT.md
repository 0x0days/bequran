# Quranic Numerics — Project Reference

This document is the complete specification for an LLM coding agent to build new pages for this project without asking questions. Read it fully before writing any code.

---

## What This Project Is

A series of standalone HTML educational pages in the style of brilliant.org. Each page demonstrates one specific numerical or linguistic pattern found in the Quran. Pages are interactive, step-by-step, dark-themed, and biased toward confirming the Quran is extraordinary. They are not encyclopedic — they are persuasive.

---

## Project Philosophy

- Brilliant.org-style interactive educational illustrations — not articles, not slideshows.
- Each page proves one specific pattern to a student, step by step.
- The student should finish with complete confidence and zero doubt — zero ambiguity.
- The narrative is ALWAYS biased toward confirming the Quran is extraordinary.
- Never introduce anything that could make the student think the book is inconsistent or wrong.
- Lead with the most shocking fact first, then walk the student through verification.
- The student should feel like a scientist confirming something, not being confused by inconsistencies.
- Interactivity is button-driven stage progression (click to advance) with animations.
- By the end of each page the student is genuinely shocked and convinced.

---

## Files in /home/mac/solo/

| File | Pattern |
|---|---|
| `quran-sea-land.html` | Sea vs Land: البحر:البر = 32:12 = 72.73%:27.27% matching Earth's surface ratio of 71%:29% |
| `quran-chromosomes.html` | The Bee Surah Numbers: Surah 16 (An-Nahl), drone chromosomes=16, worker/queen=32=16×2, surah verses=128=16×8 — DUOLINGO-STYLE: MC (which surah?) → MC (drone chromosomes?) → chr-grid reveal with animFrom on 16/32/128 → verdict multiplication cascade |
| `quran-bee-female.html` | The Female Worker Bee: Quran 16:68–69 gives three commands to the bee all in the feminine imperative (ittakhidhī/kulī/faslukī), though Arabic نَحْل is grammatically masculine — biologically correct since only female bees work — DUOLINGO-STYLE: MC (who works?) → MC (masculine/feminine — the twist) + grammar demo → flip cards (decode each feminine -ī suffix) → verdict with imperative reveal + contrast grid |
| `quran-fish.html` | Fish: Verse 18:61 has exactly 50 letters, matching the modal chromosome number of teleost fish (carp, goldfish, zebrafish all have 2n=50) — DUOLINGO-STYLE with B1 Word Scanner + B2 Item Grid (50 tiles, fish-word tiles brighter), 3 exercises (guess the count → word scanner → fish chromosomes MC) |
| `quran-man-woman.html` | Man & Woman — The Equal Count: semantic roles of رَجُل = 23, ٱمْرَأَة = 23, all three counting methods (24:24, 25:25, 23:23) confirm perfect balance — DUOLINGO-STYLE: MC (how many roles for man?) → semantic method reveal (verse cards + dual animFrom calc cards) → MC (all methods produce balance?) → verdict with simultaneous dual counter animation + methods table cascade |
| `quran-man-woman-chromosomes.html` | Man & Woman — The Chromosome Connection: 23 from father + 23 from mother = 46, confirmed 1955 by Tjio & Levan, 1,323 years after Quran — DUOLINGO-STYLE: MC (father chromosomes?) → animated equation with animFrom sequentially → MC (when confirmed?) → verdict with animFrom gap badge (1323) + timeline cascade + connection grid showing Quranic vs Biology alignment |
| `quran-adam-jesus.html` | Adam & Jesus: both appear exactly 25 times, the only two figures the Quran explicitly pairs (3:59), the only two with no human father — DUOLINGO-STYLE: MC (Jesus mentions?) → dual counter animation (both animate to 25 simultaneously, "=" glows green) → MC (Surah 3 content?) → verdict with prophet table cascade + 3 nav-coordinate cards animating in staggered (Adam→Surah 3, Jesus→Surah 4, both→Surah 25) + probability block |
| `quran-hell-paradise.html` | Hell (جهنم) = 77, Paradise (الجنة) = 78 — animated arch gates, digit lock cards, animated bar chart |
| `quran-life-death.html` | Life nouns = 105, Death nouns = 105 — interactive word-removal mechanic, student clicks to subtract disputed words until counts balance |
| `quran-angels-devils.html` | Angels (مَلَك) = 88, Devils (شَيْطَان) = 88 — two separate form-builder interactions, student clicks to build both totals from scratch |
| `quran-lightning-1313.html` | 13:13 Lightning Incident: five independent 13s (date, time, age, surah, verse) converge in 2010 event — playground card-unlock + probability calculator |
| `quran-calendar-cycles.html` | Calendar Cycles: يوم (478 tokens) sorted by Arabic morphology yields 365 (solar), 354 (Hijri), 29 (lunar month) — dual interactive calculator where shared 274 tokens feed both years simultaneously |
| `quran-world-hereafter.html` | World vs Hereafter: الدنيا = 115, الآخرة = 115 exact balance despite roots with 133 vs 250 total forms — animated dual counter on load, hereafter form builder (6 cards), paradox bar chart |
| `quran-sun-temperature.html` | Sun Temperature: 5,778 exclusive verses between first الشمس (2:258, Abraham) and last الشمس (91:1, Surah Al-Shams) = 5,778K NASA solar effective temperature — animated ruler span + counter |
| `quran-silver-melting.html` | Silver Melting Point: الفضة (silver) first appears at 3:14, last at 9:35 — span is 962 verses; 3:14→9:34 is 961 verses; silver melts at 961.78°C — bracketed between two counts — two-path interactive (Path A → 961, Path B → 962) |
| `quran-gold-melting.html` | Gold Melting Point: two independent paths both yield 1064 = gold's melting point (1064.18°C) — Path A: 3:14→10:8 exclusive=1064; Path B: 22:23→35:21 inclusive=1064 — two-path interactive, both converge on same number; bonus: 79 Allah occurrences 3:14→3:97 = gold atomic number |
| `quran-sirius-distance.html` | Earth–Sirius Distance: Surah 53 (An-Najm/The Star) encodes 8.6 ly twice — 861 letters from 53:1 (Star) to 53:32 (Earth) = 8.61 ly; 86 words from 53:32 (Earth) to 53:49 (Sirius) = 8.6 ly — cascade flow visual, dual counting interactive (letters + words), Sirius is only named star in Quran |
| `quran-moon-landing.html` | Moon Landing: 1,389 verses after 54:1 (moon-split verse) = 1389 AH (Apollo 11 landing year, July 20 1969) — DUOLINGO-STYLE: green progress bar, 3D answer cards, shake-on-wrong, bottom feedback panel, 3 interactive exercises (multiple choice → calculate → calendar match) |
| `quran-carbon-creation.html` | Carbon Creation Code: 6 creation materials in Quran (turāb, māʾ, ṭīn, nutfah, ʿalaq, ḍaʿf) = carbon atomic number 6; word ṭīn appears 12 times = carbon-12 mass number — DUOLINGO-STYLE with flip-card vocabulary exercise (new mechanic) + bridge reveal pattern; accessible to non-Arabic speakers |

---

## Design System — CSS Variables

Use EXACTLY these in every page. Do not invent new variable names.

```css
:root {
  --bg:        #0b1622;
  --surface:   #111e2e;
  --surface2:  #182840;
  --border:    rgba(255,255,255,0.08);
  --text:      #e2ddd4;
  --muted:     #7a8fa3;
}
```

Each page also defines topic-specific accent variables (`--accent`, `--accent-light`, `--accent-dim`, `--accent-ring`) using the color palette table below.

---

## Fonts

Same Google Fonts import on every page:

```html
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Amiri:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
```

| Font | Usage |
|---|---|
| DM Sans | Body text, UI labels, buttons |
| Playfair Display | Hero titles, big dramatic numbers, section reveals |
| Amiri | All Arabic text — always `direction: rtl`, `text-align: right` |

---

## Color Palette Per Topic

Each page gets its own accent color pair. Define these as CSS variables at the top of the page.

| Topic | --accent | --accent-light | --accent-dim | --accent-ring |
|---|---|---|---|---|
| Sea | #2e86c1 | #5ba3d0 | rgba(46,134,193,0.10) | rgba(46,134,193,0.22) |
| Land | #c8962a | #e0b04a | — | — |
| Bee | #f59e0b | #fcd34d | rgba(245,158,11,0.10) | rgba(245,158,11,0.22) |
| Fish | #0d9488 | #34d399 | rgba(13,148,136,0.10) | rgba(52,211,153,0.22) |
| Man | #6366f1 | #818cf8 | rgba(99,102,241,0.10) | rgba(129,140,248,0.22) |
| Woman | #db2777 | #f472b6 | rgba(219,39,119,0.10) | rgba(244,114,182,0.22) |
| Adam | #f97316 | #fb923c | rgba(249,115,22,0.10) | rgba(251,146,60,0.22) |
| Jesus | #3b82f6 | #93c5fd | rgba(59,130,246,0.10) | rgba(147,197,253,0.22) |
| Match/Balance | #10b981 | #34d399 | rgba(16,185,129,0.10) | rgba(52,211,153,0.22) |
| Hell | #dc2626 | #f87171 | rgba(220,38,38,0.10) | rgba(248,113,113,0.22) |
| Paradise | #10b981 | #34d399 | rgba(16,185,129,0.10) | rgba(52,211,153,0.22) |
| Angels | #ca8a04 | #fbbf24 | rgba(202,138,4,0.10) | rgba(251,191,36,0.22) |
| Devils | #b91c1c | #f87171 | rgba(185,28,28,0.10) | rgba(248,113,113,0.22) |
| Lightning | #0ea5e9 | #38bdf8 | rgba(14,165,233,0.10) | rgba(56,189,248,0.22) |
| Calendar (Solar) | #d97706 | #fbbf24 | rgba(217,119,6,0.10) | rgba(251,191,36,0.22) |
| Calendar (Hijri) | #6366f1 | #818cf8 | rgba(99,102,241,0.10) | rgba(129,140,248,0.22) |
| Calendar (Lunar) | #0d9488 | #34d399 | rgba(13,148,136,0.10) | rgba(52,211,153,0.22) |
| World (الدنيا) | #d97706 | #fbbf24 | rgba(217,119,6,0.10) | rgba(251,191,36,0.22) |
| Hereafter (الآخرة) | #7c3aed | #a78bfa | rgba(124,58,237,0.10) | rgba(167,139,250,0.22) |
| Sun | #ea580c | #fb923c | rgba(234,88,12,0.10) | rgba(251,146,60,0.22) |
| Silver | #64748b | #94a3b8 | rgba(100,116,139,0.10) | rgba(148,163,184,0.22) |
| Gold (metal) | #b45309 | #f59e0b | rgba(180,83,9,0.12) | rgba(245,158,11,0.28) |
| Sirius / Star | #1d4ed8 | #93c5fd | rgba(29,78,216,0.12) | rgba(147,197,253,0.28) |
| Moon | #4338ca | #a5b4fc | rgba(67,56,202,0.12) | rgba(165,180,252,0.28) |
| Carbon / Clay | #78350f | #fbbf24 | rgba(120,53,15,0.12) | rgba(251,191,36,0.28) |

Gold (`#f59e0b` / `#fcd34d`) is the "revelation" color. Use it for the climactic big-moment reveal. It also serves as the secondary accent for dramatic numbers on the Lightning page.

---

## Stage System

Every page uses a stage-based progression. Only one stage is visible at a time.

- All `.stage` divs default to `display: none`.
- The active stage has class `active` which sets `display: block` and triggers a rise animation.
- Progress dots at the top track position. A `done` dot is filled at reduced opacity. A `now` dot is filled solid and scaled up.
- The `go(n)` JS function deactivates the current stage, activates stage `n`, and calls `syncDots(n)`.
- Typical pages have 4–6 stages (index 0 through 4 or 5). Stage 0 is always the intro/shock.

---

## Core CSS — Copy Verbatim

### Layout

```css
* { box-sizing: border-box; margin: 0; padding: 0; }
body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; padding: 44px 20px 80px; }
.container { max-width: 660px; margin: 0 auto; }
```

### Progress Dots

```css
.progress { display: flex; gap: 8px; margin-bottom: 40px; }
.dot { width: 7px; height: 7px; border-radius: 50%; background: transparent; border: 1px solid rgba(255,255,255,0.18); transition: all .4s; }
.dot.done { background: rgba(ACCENT_RGB, 0.45); border-color: var(--accent-light); }
.dot.now  { background: var(--accent-light); border-color: var(--accent); transform: scale(1.55); }
```

Replace `ACCENT_RGB` with the actual RGB values of the page's accent color.

### Stage Animation

```css
.stage { display: none; }
.stage.active { display: block; animation: rise .45s ease; }
@keyframes rise { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
```

### Typography Components

```css
.eyebrow { font-size: 11px; letter-spacing: .14em; text-transform: uppercase; font-weight: 500; margin-bottom: 16px; }
.hero-title { font-family: 'Playfair Display', serif; font-size: clamp(24px, 5vw, 36px); line-height: 1.22; margin-bottom: 16px; }
.body-text { font-size: 16px; line-height: 1.8; color: var(--muted); margin-bottom: 28px; }
.step-lbl { font-size: 11px; letter-spacing: .08em; text-transform: uppercase; color: var(--muted); margin-bottom: 24px; }
```

### Buttons

```css
.btn { display: inline-flex; align-items: center; gap: 9px; padding: 12px 26px; border-radius: 6px; border: none; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 500; cursor: pointer; transition: all .2s; text-decoration: none; }
.btn:active { transform: scale(0.97); }
.btn.hidden { opacity: 0; pointer-events: none; }
```

Solid accent button: `background: var(--accent); color: #fff;`
Ghost button: `background: transparent; border: 1px solid var(--border); color: var(--muted);`

### Verse Card

```css
.verse-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 24px; margin-bottom: 20px; }
.verse-ar { font-family: 'Amiri', serif; direction: rtl; text-align: right; font-size: clamp(18px, 3vw, 24px); line-height: 2.2; color: var(--text); margin-bottom: 16px; }
.verse-tr { font-size: 14px; line-height: 1.75; color: var(--muted); border-top: 1px solid var(--border); padding-top: 14px; font-style: italic; }
```

### Insight / Confirmation Box

```css
.insight-box { background: var(--surface); border-radius: 10px; border-left: 3px solid var(--accent-light); padding: 16px 20px; font-size: 14px; color: var(--muted); line-height: 1.8; margin-bottom: 24px; }
.insight-box strong { color: var(--text); }
```

### Big Number Reveal

```css
.big-num { font-family: 'Playfair Display', serif; font-size: clamp(80px, 16vw, 120px); font-weight: 700; line-height: 1; text-shadow: 0 0 80px rgba(ACCENT_RGB, 0.3); }
```

### Table

```css
.ftable { width: 100%; border-collapse: collapse; font-size: 14px; }
.ftable th { text-align: left; color: var(--muted); font-weight: 400; padding: 8px 14px; font-size: 11px; letter-spacing:.05em; text-transform: uppercase; border-bottom: 1px solid var(--border); }
.ftable td { padding: 12px 14px; border-bottom: 1px solid rgba(255,255,255,0.04); }
.ftable tr.hl td { font-weight: 500; }
```

### Nav Back Link

```css
.nav-back { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted); text-decoration: none; letter-spacing:.06em; text-transform: uppercase; margin-bottom: 36px; transition: color .2s; }
.nav-back:hover { color: var(--text); }
```

### Decorative Dot Field

```css
.dot-field { position: fixed; top: 0; right: 0; width: 260px; height: 260px; opacity: .02; background-image: radial-gradient(circle, #fff 1px, transparent 1px); background-size: 20px 20px; pointer-events: none; }
```

---

## JavaScript Patterns

### Ease Function

```js
function ease(t) { return 1 - Math.pow(1 - t, 3); }
```

### Animated Number Counter

```js
function animNum(el, target, ms, onDone) {
  let start = null;
  (function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / ms, 1);
    el.textContent = Math.round(ease(p) * target);
    if (p < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  })(performance.now());
}
```

### Progress Dot Sync

```js
function syncDots(active) {
  document.querySelectorAll('#prog .dot').forEach((d, i) => {
    d.className = 'dot';
    if (i < active) d.classList.add('done');
    if (i === active) d.classList.add('now');
  });
}
```

### Stage Transition

```js
let stage = 0;
function go(n) {
  document.getElementById('s' + stage).classList.remove('active');
  stage = n;
  document.getElementById('s' + stage).classList.add('active');
  syncDots(n);
}
```

After `go(n)`, trigger any per-stage animations (number counters, bar fills, etc.) immediately inline — no setTimeout needed unless you're waiting for the CSS transition.

---

## Playground Interactivity Patterns

These are proven interactive mechanics. Use them when the pattern calls for exploration rather than passive reading. Each mechanic makes the student do the verification themselves, which dramatically increases conviction.

### 1. Click-to-Reveal Evidence Cards

Best for: patterns where multiple independent facts must accumulate before the conclusion lands.

Each card shows a "?" mystery state. Student clicks to reveal the fact inside. A progress bar fills as cards are unlocked. The Continue button is hidden and only appears after all cards are revealed — forcing full engagement.

```css
.ev-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; cursor: pointer; transition: border-color .35s, background .35s; min-height: 120px; }
.ev-card.revealed { border-color: var(--accent-ring); background: linear-gradient(135deg, var(--surface) 0%, var(--accent-dim) 100%); }
.ev-card.revealed::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; border-radius: 12px 12px 0 0; background: linear-gradient(90deg, transparent, var(--accent-light), transparent); }
.ev-value { display: none; }
```

```js
function reveal(id) {
  const card = document.getElementById('c-' + id);
  if (revealed.has(id)) return;
  revealed.add(id);
  const mystery = card.querySelector('.ev-mystery');
  const value   = card.querySelector('.ev-value');
  mystery.style.transition = 'opacity .25s';
  mystery.style.opacity    = '0';
  setTimeout(function() {
    mystery.style.display = 'none';
    value.style.display   = 'block';
    value.style.opacity   = '0';
    value.style.transition = 'opacity .38s';
    requestAnimationFrame(function() {
      requestAnimationFrame(function() { value.style.opacity = '1'; });
    });
  }, 250);
  card.classList.add('revealed');
  const count = revealed.size;
  document.getElementById('rfill').style.width = (count / TOTAL * 100) + '%';
  if (count === TOTAL) {
    document.getElementById('btn-next').classList.remove('hidden');
  }
}
```

### 2. Lightning Flash Effect

Best for: the moment all evidence is assembled and the convergence becomes undeniable. Creates a physical shock that mirrors the subject matter.

```html
<div class="flash-overlay" id="flashOverlay"></div>
```

```css
.flash-overlay { position: fixed; inset: 0; background: #fff; opacity: 0; pointer-events: none; z-index: 9999; transition: opacity .1s; }
```

```js
function flash() {
  const ov = document.getElementById('flashOverlay');
  ov.style.transition = 'opacity .08s';
  ov.style.opacity = '0.65';
  setTimeout(function() {
    ov.style.transition = 'opacity .3s';
    ov.style.opacity = '0';
  }, 80);
}
```

### 3. Staggered Badge Animation on Load

Best for: Stage 0, when showing N independent facts that should each land with their own weight before the student reads the body text.

```css
.fbadge { opacity: 0; transform: translateY(18px); transition: opacity .5s, transform .5s; }
.fbadge.show { opacity: 1; transform: translateY(0); }
```

```js
document.addEventListener('DOMContentLoaded', function() {
  [0,1,2,3,4].forEach(function(i) {
    setTimeout(function() {
      document.getElementById('b' + i).classList.add('show');
    }, 300 + i * 180);
  });
});
```

### 4. Live Probability Calculator (Toggle Rows)

Best for: patterns with multiple independent factors — student toggles each on to watch combined odds collapse in real time. A log-scale visual bar shrinks toward zero.

```css
.prob-row { display: flex; align-items: center; gap: 14px; padding: 13px 0; border-bottom: 1px solid rgba(255,255,255,0.04); cursor: pointer; user-select: none; }
.prob-toggle { width: 38px; height: 22px; border-radius: 11px; background: var(--surface2); border: 1px solid var(--border); position: relative; transition: all .3s; }
.prob-toggle::after { content: ''; position: absolute; top: 3px; left: 3px; width: 14px; height: 14px; border-radius: 50%; background: var(--muted); transition: all .3s; }
.prob-row.on .prob-toggle { background: var(--accent); border-color: var(--accent); }
.prob-row.on .prob-toggle::after { left: 19px; background: #fff; }
.prob-bar-wrap { height: 4px; background: var(--surface2); border-radius: 2px; overflow: hidden; margin-top: 14px; }
.prob-bar { height: 100%; background: linear-gradient(90deg, var(--accent), #f59e0b); width: 100%; border-radius: 2px; transition: width .8s ease; }
```

```js
const probOn = [false, false, false, false, false];
const probD  = [365, 1440, 80, 114, 6236];  /* denominators per factor */

function toggleProb(i) {
  probOn[i] = !probOn[i];
  document.getElementById('p' + i).classList.toggle('on', probOn[i]);
  updateProb();
}

function updateProb() {
  let denom = 1, active = 0;
  probOn.forEach(function(on, i) { if (on) { denom *= probD[i]; active++; } });
  const el = document.getElementById('probVal');
  if (active === 0) { el.textContent = '1 in 1'; }
  else if (denom >= 1e12) { el.textContent = '1 in ' + (denom / 1e12).toFixed(1) + ' trillion'; }
  else if (denom >= 1e9)  { el.textContent = '1 in ' + (denom / 1e9).toFixed(1) + ' billion'; }
  else if (denom >= 1e6)  { el.textContent = '1 in ' + (denom / 1e6).toFixed(1) + ' million'; }
  else                    { el.textContent = '1 in ' + denom.toLocaleString(); }
  const logMax = probD.reduce(function(a, d) { return a * d; }, 1);
  const pct    = active === 0 ? 100 : Math.max(1, 100 - (Math.log10(denom) / Math.log10(logMax) * 98));
  document.getElementById('probBar').style.width = pct + '%';
}
```

### 5. Interactive Removal / Subtraction

Best for: patterns where a disputed count must be corrected. Student clicks to remove words they agree shouldn't count, watching the total animate down until it matches.

Used in: `quran-life-death.html`. Student clicks words like "snake" or "shyness" to remove them from 113 → 105.

```js
function removeWord(btn, count) {
  if (btn.classList.contains('removed')) return;
  btn.classList.add('removed');
  total -= count;
  animNum(counterEl, total, 600, function() {
    if (total === TARGET) counterEl.style.color = '#f59e0b';
  });
}
```

### 6. Form Builders (Click to Add Groups)

Best for: word-count patterns where the total is built from distinct grammatical forms. Student clicks each form card to add its count to a running total, which animates up.

Used in: `quran-angels-devils.html`. Six angel form cards (72+1+9+2+2+2=88), two devil form cards (70+18=88).

```js
function addForm(btn, n, targetEl, targetCount) {
  if (btn.classList.contains('added')) return;
  btn.classList.add('added');
  current += n;
  animNum(targetEl, current, 500, function() {
    if (current === targetCount) targetEl.style.color = '#f59e0b';
  });
}
```

### 7. Animated Arch Gates

Best for: patterns involving named entrances or levels (e.g., gates of Hell vs Paradise). Arches appear one by one with a stagger.

Used in: `quran-hell-paradise.html`. 7 red arches for Hell, 8 green arches for Paradise appear sequentially.

```css
.arch { width: 40px; height: 60px; border-radius: 20px 20px 0 0; opacity: 0; transform: scaleY(0); transform-origin: bottom; transition: opacity .3s, transform .4s; }
.arch.show { opacity: 1; transform: scaleY(1); }
```

```js
function showArches(selector, delay) {
  document.querySelectorAll(selector).forEach(function(a, i) {
    setTimeout(function() { a.classList.add('show'); }, i * 120 + delay);
  });
}
```

### 8. Animated Bar Chart

Best for: head-to-head comparisons where one bar is taller than the other. Bars animate up from zero simultaneously, making the difference visually undeniable.

Used in: `quran-hell-paradise.html`. Two bars fill to heights proportional to 77 and 78.

```css
.bar { width: 60px; border-radius: 4px 4px 0 0; height: 0; transition: height 1s ease; }
```

```js
function animBars() {
  setTimeout(function() {
    document.getElementById('bar-hell').style.height = '154px';
    document.getElementById('bar-paradise').style.height = '156px';
  }, 200);
}
```

---

## When to Use Which Pattern

| Situation | Pattern to use |
|---|---|
| Multiple independent facts must all be true for the conclusion to land | Click-to-Reveal Evidence Cards + Flash Effect |
| Student needs to feel the improbability mathematically | Live Probability Calculator (toggle rows) |
| A total count must be adjusted by removing disputed items | Interactive Removal / Subtraction |
| Total is built from distinct grammatical/structural sub-groups | Form Builder |
| Comparing two named quantities (gates, levels, opposites) | Animated Arch Gates |
| Two numbers are close but one is definitively larger | Animated Bar Chart |
| Stage 0 has N independent shocking facts | Staggered Badge Animation |

---

## Page HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>[Topic] · Quranic Numerics</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Amiri:wght@400;700&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
  <style>
    /* all CSS here, inline — no external stylesheets */
  </style>
</head>
<body>
<div class="dot-field"></div>
<div class="container">

  <a href="[previous-page].html" class="nav-back">← [Previous Pattern Name]</a>

  <div class="progress" id="prog">
    <div class="dot now"></div>
    <!-- one dot per stage -->
  </div>

  <!-- Stage 0: THE SHOCK — open with the most surprising scientific or numerical fact -->
  <div class="stage active" id="s0">
    <p class="eyebrow" style="color: var(--accent-light)">Quranic Numerics · [Topic]</p>
    <h1 class="hero-title">[Shocking opening statement]</h1>
    <p class="body-text">[One paragraph establishing the surprising external fact (science, biology, etc.)]</p>
    <button class="btn" onclick="go(1)" style="background:var(--accent);color:#fff">Show me the Quran match →</button>
  </div>

  <!-- Stage 1: The Quran match -->
  <div class="stage" id="s1">
    <p class="step-lbl">Step 1 of [N]</p>
    <h2 class="hero-title">[The specific Quranic fact]</h2>
    <p class="body-text">[What the Quran says / contains, tied directly to the external fact]</p>
    <div class="verse-card">
      <div class="verse-ar">[Arabic text]</div>
      <div class="verse-tr">[Translation]</div>
    </div>
    <button class="btn" onclick="go(2)" style="background:var(--accent);color:#fff">Verify it →</button>
  </div>

  <!-- Stage 2: Verify it yourself (interactive counting / animation) -->
  <div class="stage" id="s2">
    <p class="step-lbl">Step 2 of [N]</p>
    <h2 class="hero-title">Count it yourself</h2>
    <p class="body-text">[Instruction to verify interactively]</p>
    <!-- interactive element: counter, highlighted letters, table, etc. -->
    <button class="btn" onclick="go(3)" style="background:var(--accent);color:#fff">What are the odds? →</button>
  </div>

  <!-- Stage 3: Uniqueness / no other X does this -->
  <div class="stage" id="s3">
    <p class="step-lbl">Step 3 of [N]</p>
    <h2 class="hero-title">No other [X] does this</h2>
    <p class="body-text">[Comparison showing the Quran is uniquely precise]</p>
    <button class="btn" onclick="go(4)" style="background:var(--accent);color:#fff">The impossibility →</button>
  </div>

  <!-- Stage 4: The impossibility (timeline + probability) -->
  <div class="stage" id="s4">
    <p class="step-lbl">Step 4 of [N]</p>
    <h2 class="hero-title">[The probability / impossibility framing]</h2>
    <p class="body-text">[Why this could not have been known in 7th century Arabia]</p>
    <div class="insight-box"><strong>[Key conclusion sentence]</strong> [Supporting detail]</div>
    <a href="[prev-page].html" class="btn" style="background:transparent;border:1px solid var(--border);color:var(--muted)">← Back to [Prev]</a>
  </div>

</div>
<script>
let stage = 0;
function ease(t) { return 1 - Math.pow(1 - t, 3); }
function animNum(el, target, ms, onDone) {
  let start = null;
  (function step(ts) {
    if (!start) start = ts;
    const p = Math.min((ts - start) / ms, 1);
    el.textContent = Math.round(ease(p) * target);
    if (p < 1) requestAnimationFrame(step);
    else if (onDone) onDone();
  })(performance.now());
}
function syncDots(active) {
  document.querySelectorAll('#prog .dot').forEach((d, i) => {
    d.className = 'dot';
    if (i < active) d.classList.add('done');
    if (i === active) d.classList.add('now');
  });
}
function go(n) {
  document.getElementById('s' + stage).classList.remove('active');
  stage = n;
  document.getElementById('s' + stage).classList.add('active');
  syncDots(n);
}
</script>
</body>
</html>
```

---

## Narrative Rules — MUST Follow

1. **Lead with the most shocking fact.** The biology, the science, the number that blows your mind. Do not build to it — open with it.
2. **Never show inconsistency first.** If raw counts are unequal, do not show them until after balance is already established. Reframe everything as "Arabic has layers," never as "this doesn't match."
3. **Confirmation bias is intentional.** Every page validates the Quran. The framing is always "here is the evidence — verify it yourself."
4. **The student is a scientist.** Interactive verification, not passive reading. They click to reveal, count along, confirm.
5. **The Quran pairs these — not researchers.** Always emphasize when the Quran itself makes the connection (e.g., Adam & Jesus in 3:59).
6. **No doubt, no ambiguity.** Every stage should increase confidence. End of page = student is shocked and certain.
7. **Probability always appears last.** After the student is already convinced by direct evidence.

---

## Linking Between Pages

- Every page has a `nav-back` link to the previous page at the top.
- The final stage has a ghost `btn` linking back to the previous page.
- The final stage of the second-to-last page in the chain also has a forward solid `btn` to the new page.
- Current chain order:
  1. `quran-sea-land.html`
  2. `quran-chromosomes.html`
  2b. `quran-bee-female.html`
  3. `quran-fish.html`
  4a. `quran-man-woman.html`
  4b. `quran-man-woman-chromosomes.html`
  5. `quran-adam-jesus.html`
  6. `quran-hell-paradise.html`
  7. `quran-life-death.html`
  8. `quran-angels-devils.html`
  9. `quran-lightning-1313.html`
  10. `quran-calendar-cycles.html`
  11. `quran-world-hereafter.html`
  12. `quran-sun-temperature.html`
  13. `quran-silver-melting.html`
  14. `quran-gold-melting.html`
  15. `quran-sirius-distance.html`
  16. `quran-moon-landing.html`
  17. `quran-carbon-creation.html` ← current last page
- When adding a new page: update `quran-carbon-creation.html`'s final stage to add a forward link to the new page, and set the new page's `nav-back` to point to `quran-carbon-creation.html`.

---

## Duolingo Teaching System

This is the project's standard interactive teaching shell. Use it for every page going forward. It replaces the older dot-progress system.

### When to Use Duolingo Mode

All new pages use Duolingo mode. Legacy pages (1–11) use dot-progress; do not retrofit them. Pages 16+ (moon-landing, carbon-creation, and all future) use Duolingo mode.

---

### Required CSS Variables (add to `:root` on every Duolingo page)

```css
--ok:           #22c55e;
--ok-bg:        #052e16;
--ok-border:    #166534;
--err-light:    #f87171;
--err-bg:       #2d0707;
--err-border:   #991b1b;
```

These sit alongside the page's accent color variables. Never change these values — they are the global Duolingo palette.

---

### The Shell (required on every Duolingo page)

#### Progress Bar

```html
<div class="lesson-bar-wrap"><div class="lesson-bar-fill" id="lbar"></div></div>
<div class="lesson-meta" id="lmeta">Lesson · [Title]</div>
```

```css
.lesson-bar-wrap { background: var(--surface2); border-radius: 100px; height: 10px; margin-bottom: 6px; overflow: hidden; }
.lesson-bar-fill { height: 100%; background: var(--ok); border-radius: 100px; transition: width .65s cubic-bezier(.4,0,.2,1); width: 0%; }
.lesson-meta { font-size: 11px; color: var(--muted); letter-spacing: .07em; text-transform: uppercase; margin-bottom: 36px; }
```

Bar map and meta map drive by JS. Map keys are stage numbers. Bar percentages divide by number of exercises (3 exercises → 33% / 66% / 100%).

```js
const barMap  = { 0:'0%', 1:'0%', 2:'33%', 3:'66%', 4:'100%' };
const metaMap = { 0:'Lesson · [Title]', 1:'Exercise 1 of 3', 2:'Exercise 2 of 3', 3:'Exercise 3 of 3', 4:'Lesson Complete' };
```

#### Fixed Feedback Panel

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

```css
.fb-panel { position: fixed; bottom: 0; left: 0; right: 0; z-index: 300; padding: 18px 20px 32px; transform: translateY(110%); transition: transform .35s cubic-bezier(.4,0,.2,1); display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
.fb-panel.show { transform: translateY(0); }
.fb-panel.fb-ok { background: var(--ok-bg); border-top: 3px solid var(--ok); }
.fb-left { display: flex; align-items: center; gap: 14px; }
.fb-icon { width: 36px; height: 36px; border-radius: 50%; background: var(--ok); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; color: var(--ok-bg); }
.fb-title { font-weight: 700; font-size: 15px; color: var(--ok); margin-bottom: 2px; }
.fb-sub { font-size: 13px; color: var(--muted); line-height: 1.5; }
.fb-btn { padding: 14px 30px; border-radius: 12px; border: none; font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 700; cursor: pointer; }
.fb-panel.fb-ok .fb-btn { background: var(--ok); color: var(--ok-bg); }
```

`body` must have `padding-bottom: 160px` so content is never hidden behind the fixed panel.

#### Core JS Functions

```js
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

function go(n) {
  document.getElementById('s' + stage).classList.remove('active');
  stage = n;
  document.getElementById('s' + stage).classList.add('active');
  document.getElementById('lbar').style.width = barMap[n];
  document.getElementById('lmeta').textContent = metaMap[n];
  window.scrollTo(0, 0);
  if (n === [FINAL_STAGE]) {
    setTimeout(function() {
      document.getElementById('xpBadge').classList.add('show');
      // animate verdict counters here
    }, 300);
  }
}
```

#### Answer Cards (used by Multiple Choice exercise)

```css
.answer-card { border: 2px solid rgba(255,255,255,0.1); border-bottom: 4px solid rgba(0,0,0,0.28); border-radius: 14px; padding: 16px 20px; cursor: pointer; user-select: none; transition: border-color .15s, background .15s; }
.answer-card:hover { border-color: rgba(255,255,255,0.22); }
.answer-card.ac-correct { border-color: var(--ok); border-bottom-color: var(--ok-border); background: rgba(34,197,94,0.08); pointer-events: none; }
.answer-card.ac-wrong { animation: shake .4s ease; border-color: var(--err-light) !important; }
.answer-card.ac-disabled { opacity: 0.45; pointer-events: none; }
@keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
```

#### XP Badge (used on final/verdict stage)

```html
<div class="xp-badge" id="xpBadge">
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  <span class="xp-text">Lesson complete · +30 XP</span>
</div>
```

```css
.xp-badge { display: inline-flex; align-items: center; gap: 8px; background: var(--ok-bg); border: 1px solid var(--ok-border); border-radius: 100px; padding: 6px 16px 6px 10px; margin-bottom: 24px; opacity: 0; transform: translateY(-6px) scale(0.95); transition: opacity .4s, transform .4s; }
.xp-badge.show { opacity: 1; transform: none; }
.xp-text { font-size: 13px; font-weight: 600; color: var(--ok); letter-spacing: .04em; }
```

---

### Exercise Types

| Exercise Type | When to Use | Key Mechanic |
|---|---|---|
| **Multiple Choice** | Testing which verse / which count / which year | Answer cards grid; one correct, rest lock on correct answer; shake on wrong |
| **Calculation Reveal** | Student triggers a count or computation themselves | Button → animFrom counter → showOk |
| **Flip Cards** | Vocabulary learning (Arabic terms the page depends on) | CSS 3D rotateY; Set tracks revealed; counter turns green at all flipped |
| **Bridge Reveal** | Showing Quran ↔ Science parallel (two matching rows) | Sequential row appearance; use for convergence moments |
| **Two-Path Interactive** | Two independent methods arriving at same number | Separate counters for Path A and Path B; convergence panel appears when both done |
| **Cascade Flow** | Showing a chain of anchor points (verse → verse → verse) | Vertical nodes with animated pill connectors; numbers count up inside pills |

---

### Exercise Type 1: Multiple Choice

```js
function pickAnswer(el, correct) {
  if (document.querySelector('#sN .ac-correct')) return;
  if (correct) {
    el.classList.add('ac-correct');
    document.querySelectorAll('#sN .answer-card').forEach(function(c) {
      if (!c.classList.contains('ac-correct')) c.classList.add('ac-disabled');
    });
    showOk('Feedback text explaining why this answer is correct.', function() { go(NEXT_STAGE); });
  } else {
    el.classList.add('ac-wrong');
    setTimeout(function() { el.classList.remove('ac-wrong'); }, 500);
  }
}
```

HTML:
```html
<div class="answers-grid">
  <div class="answer-card" onclick="pickAnswer(this, false)">Wrong option</div>
  <div class="answer-card" onclick="pickAnswer(this, true)">Correct option</div>
  <div class="answer-card" onclick="pickAnswer(this, false)">Wrong option</div>
</div>
```

Answers grid CSS: `display: grid; grid-template-columns: 1fr 1fr; gap: 12px;`

---

### Exercise Type 2: Calculation Reveal

```js
let calcDone = false;
function runCalc() {
  if (calcDone) return;
  calcDone = true;
  document.getElementById('calcBtn').classList.add('used');
  const el = document.getElementById('calcResult');
  el.textContent = '0';
  animFrom(el, 0, TARGET_NUMBER, 2200, function() {
    el.classList.add('lit');
    showOk('Explanation of what this number means.', function() { go(NEXT_STAGE); });
  });
}
```

```css
.calc-result { font-family: 'Playfair Display', serif; font-size: clamp(52px, 10vw, 80px); font-weight: 700; color: var(--muted); text-align: center; transition: color .5s; }
.calc-result.lit { color: var(--accent-light); }
.calc-btn { width: 100%; padding: 16px; border-radius: 14px; border: none; background: var(--accent); color: #fff; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 700; cursor: pointer; transition: opacity .2s; }
.calc-btn.used { opacity: 0.5; pointer-events: none; }
```

---

### Exercise Type 3: Flip Cards

CSS:
```css
.flip-card { cursor: pointer; perspective: 700px; }
.flip-inner { position: relative; height: 160px; transform-style: preserve-3d; transition: transform .55s cubic-bezier(.4,0,.2,1); }
.flip-card.done .flip-inner { transform: rotateY(180deg); }
.flip-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 14px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 14px 10px; }
.flip-front { background: var(--surface); border: 2px solid rgba(255,255,255,0.1); border-bottom: 4px solid rgba(0,0,0,0.28); }
.flip-back { background: rgba(120,53,15,0.12); border: 2px solid var(--accent-light); border-bottom: 4px solid rgba(120,53,15,0.5); transform: rotateY(180deg); }
.fc-hint { animation: hintPulse 2.2s ease-in-out infinite; }
@keyframes hintPulse { 0%,100%{opacity:.3} 50%{opacity:.85} }
```

HTML pattern (one card):
```html
<div class="flip-card" id="fc0" onclick="flipCard(this,'fc0')">
  <div class="flip-inner">
    <div class="flip-face flip-front">
      <div class="arabic-term" style="font-family:'Amiri',serif;font-size:28px;direction:rtl">عَلَق</div>
      <div class="fc-hint" style="font-size:11px;color:var(--muted);margin-top:8px">tap to reveal</div>
    </div>
    <div class="flip-face flip-back">
      <div style="font-size:13px;color:var(--accent-light);font-weight:600;margin-bottom:4px">ʿalaq</div>
      <div style="font-size:15px;font-weight:600">Clinging Clot</div>
      <div style="font-size:12px;color:var(--muted);margin-top:6px">verse reference</div>
    </div>
  </div>
</div>
```

JS:
```js
let flipped = new Set();
function flipCard(el, id) {
  if (el.classList.contains('done')) return;
  el.classList.add('done');
  flipped.add(id);
  document.getElementById('rcN').textContent = flipped.size;
  if (flipped.size === TOTAL_CARDS) {
    document.getElementById('revealCounter').classList.add('all-done');
    setTimeout(function() {
      showOk('Summary confirming what the student just learned.', function() { go(NEXT_STAGE); });
    }, 400);
  }
}
```

Counter display: `<span id="rcN">0</span> / N materials revealed` — turns green via `.all-done { color: var(--ok); }`.

Grid: `display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;` (for 6 cards in 2 rows).

---

### Exercise Type 4: Bridge Reveal

Shows two matching rows sequentially — Quran fact on left, science fact on right, connected by `=` or `→`.

CSS:
```css
.bridge-row { display: grid; grid-template-columns: 1fr 36px 1fr; gap: 10px; align-items: center; margin-bottom: 12px; opacity: 0; transform: translateY(8px); transition: opacity .55s, transform .55s; }
.bridge-row.show { opacity: 1; transform: none; }
.bridge-cell { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; text-align: center; }
.bridge-eq { text-align: center; font-size: 18px; color: var(--muted); font-weight: 700; }
```

JS:
```js
function revealBridge() {
  document.getElementById('bridgeBtn').classList.add('used');
  setTimeout(function() { document.getElementById('br0').classList.add('show'); }, 200);
  setTimeout(function() { document.getElementById('br1').classList.add('show'); }, 950);
  setTimeout(function() {
    showOk('Conclusion sentence that names both facts and their match.', function() { go(NEXT_STAGE); });
  }, 1900);
}
```

Add more rows by extending the timeout sequence by +750ms per row.

---

### Accessibility for Non-Arabic Speakers

When a page depends on Arabic vocabulary (as in Carbon Creation), follow this pattern:

1. **Always show Arabic** — the Quran is Arabic; removing it falsifies authenticity.
2. **Always show romanization** — directly below or beside the Arabic term, in a smaller muted style.
3. **Always show English meaning** — as the primary label the student reads.
4. **Exercises test English comprehension only** — multiple choice options are English words or numbers, never Arabic script.
5. **Arabic note box** — include a small `insight-box` in Stage 1 explaining that romanization follows standard transliteration (q = ق, ṭ = ط, ā = long A, etc.).

Arabic display pattern in flip cards and vocab grids:
```html
<div style="font-family:'Amiri',serif;font-size:28px;direction:rtl;color:var(--text)">تُرَاب</div>
<div style="font-size:13px;color:var(--accent-light);font-weight:600;margin-top:4px">turāb</div>
<div style="font-size:15px;font-weight:600;margin-top:2px">Dust / Dry Earth</div>
```

---

### Duolingo Page Checklist

When reviewing a new Duolingo page, confirm all of the following in addition to the Visual Identity Checklist:

- [ ] `--ok`, `--ok-bg`, `--ok-border`, `--err-light`, `--err-bg`, `--err-border` in `:root`
- [ ] `body` has `padding-bottom: 160px`
- [ ] Progress bar (`lesson-bar-wrap` + `lesson-bar-fill`) present at top
- [ ] `lesson-meta` label present, updates on each `go()` call
- [ ] `barMap` and `metaMap` objects defined in JS with correct percentages
- [ ] Feedback panel (`fb-panel`) present at bottom of HTML, outside stage container
- [ ] `showOk()` and `hideFb()` functions defined
- [ ] `go()` function updates bar + meta + stage + scrolls to top
- [ ] XP badge present in final stage, triggered in `go()` at final stage number
- [ ] Each exercise uses exactly one of the six exercise types from the table above
- [ ] Answer cards shake on wrong (`.ac-wrong` + `setTimeout` remove)
- [ ] Correct answer locks all other cards (`.ac-disabled`) before calling `showOk()`
- [ ] `showOk()` feedback text explains WHY the answer is correct — not just "Correct!"
- [ ] No dot-progress system — dots are fully replaced by the lesson bar

---

## Brilliant.org Animation Patterns

These are visualization mechanics used **inside** Duolingo exercises or on intro/verdict stages. They make the student feel like a scientist observing data in motion. Always combine with the Duolingo shell — never use them as a standalone page system.

### When to Use Brilliant.org vs Duolingo

| Duolingo | Brilliant.org |
|---|---|
| Governs the shell: progress bar, feedback panel, exercise structure | Governs the visual inside an exercise: how data animates |
| Defines the loop: guess → verify → continue | Defines the moment: count up, light up, cascade in |
| Applies to every new page | Selected per page based on what will make the pattern feel most alive |

---

### Pattern B1: Word Scanner

Used in: `quran-fish.html` Stage 2

The student watches a verse scan word-by-word, each word glowing as its letters are counted, then settling into a "counted" teal state. A running counter and thin progress bar track the total in real time. Best for pages where the claim is about a letter or word count within a verse.

CSS:
```css
.scan-panel { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 26px 20px 22px; margin-bottom: 20px; }
.scan-num { font-family: 'Playfair Display', serif; font-size: 72px; font-weight: 700; color: var(--muted); line-height: 1; transition: color .3s; }
.scan-num.filling { color: var(--accent-light); }
.scan-track { height: 6px; background: var(--surface2); border-radius: 3px; overflow: hidden; margin-top: 14px; }
.scan-fill { height: 100%; width: 0; border-radius: 3px; background: linear-gradient(90deg, var(--accent), var(--accent-light)); transition: width .18s; }
.scan-verse { font-family: 'Amiri', serif; direction: rtl; text-align: right; font-size: clamp(17px, 3vw, 22px); line-height: 2.4; }
.fw { transition: color .2s, text-shadow .2s; color: rgba(226,221,212,0.45); }
.fw.active  { color: #fff; text-shadow: 0 0 22px rgba(ACCENT_RGB, 0.85); }
.fw.counted { color: var(--accent-light); text-shadow: 0 0 10px rgba(ACCENT_RGB, 0.22); }
```

HTML: Each word is a `<span class="fw" data-n="N">` where `N` is the letter count for that word. Mark semantically important words with an extra class (e.g. `fish-kw`) for a brighter glow on completion.

JS engine:
```js
let running = 0, wi = 0;
function nextWord() {
  if (wi >= words.length) { showOk('N letters confirmed.', function() { go(NEXT); }); return; }
  const word = words[wi], n = parseInt(word.dataset.n), from = running, dur = 260 + n * 55;
  let t0 = null;
  word.classList.add('active');
  (function tick(ts) {
    if (!t0) t0 = ts;
    const p = Math.min((ts - t0) / dur, 1);
    const cur = from + Math.round(p * n);
    numEl.textContent = cur;
    fillEl.style.width = (cur / TOTAL * 100) + '%';
    if (p < 1) { requestAnimationFrame(tick); return; }
    running = from + n;
    word.classList.remove('active');
    word.classList.add('counted');
    wi++;
    setTimeout(nextWord, 150);
  })(performance.now());
}
setTimeout(nextWord, 350);
```

---

### Pattern B2: Item Grid Fill

Used in: `quran-fish.html` Stage 4 (verdict)

N items appear one-by-one in a grid, each popping in with a scale animation. Tiles representing a special subset (e.g. the "fish word" tiles) light up in a brighter color. After the last tile, a big Playfair number fades in. Best for pages where the claim is a specific count — the grid makes the count physically visible and undeniable.

CSS:
```css
.item-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px; margin-bottom: 24px; }
.item-tile { aspect-ratio: 1; border-radius: 6px; background: var(--surface2); border: 1px solid rgba(255,255,255,0.04); opacity: 0; transform: scale(0.7); transition: opacity .2s, transform .2s, background .2s, border-color .2s, box-shadow .2s; }
.item-tile.lit { opacity: 1; transform: scale(1); background: rgba(ACCENT_RGB, 0.30); border-color: rgba(ACCENT_LIGHT_RGB, 0.35); }
.item-tile.special-tile.lit { background: rgba(ACCENT_LIGHT_RGB, 0.55); border-color: var(--accent-light); box-shadow: 0 0 10px rgba(ACCENT_LIGHT_RGB, 0.35); }
```

JS:
```js
function buildGrid(containerId, total, specialStart, specialEnd) {
  const grid = document.getElementById(containerId);
  for (let i = 0; i < total; i++) {
    const tile = document.createElement('div');
    tile.className = 'item-tile';
    if (i >= specialStart && i <= specialEnd) tile.classList.add('special-tile');
    grid.appendChild(tile);
  }
}
function fillGrid(containerId, staggerMs, onComplete) {
  const tiles = document.querySelectorAll('#' + containerId + ' .item-tile');
  tiles.forEach(function(tile, i) {
    setTimeout(function() {
      tile.classList.add('lit');
      if (i === tiles.length - 1 && onComplete) setTimeout(onComplete, 300);
    }, i * staggerMs);
  });
}
```

Call: `buildGrid('letterGrid', 50, 22, 27)` then `fillGrid('letterGrid', 38, showBigNumber)`.

Grid columns: use `repeat(10, 1fr)` for counts of 50, `repeat(8, 1fr)` for 32, etc. Always keep rows roughly square.

---

### Pattern B3: Animated Counter (animFrom)

Used in: every page. Shared utility for all number animations.

```js
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
```

Use for: verdict stage number reveals, counter animations, match-wrap displays.

---

### Pattern B4: Cascade Flow

Used in: `quran-sirius-distance.html` Stage 0

Vertical chain of anchor nodes (verse → verse → verse) connected by animated pill-shaped connectors that count up their values. Best for pages where the pattern spans multiple positions across the Quran and the spatial relationship between anchors matters.

Nodes fade in with `opacity + translateY` transitions, staggered at 200/500/800ms. Pills appear at 1100ms. Counter numbers animate inside pills using `animFrom`.

---

### Choosing the Right Pattern

| Pattern | Use when... |
|---|---|
| B1 Word Scanner | The claim is a letter/word count within a specific verse |
| B2 Item Grid | The final number needs to feel physically countable (≤ 100 items) |
| B3 Animated Counter | Any big number reveal, counter build-up, match display |
| B4 Cascade Flow | The pattern spans multiple verse positions with meaningful distances |
| Duolingo Flip Cards | Vocabulary teaching — student must learn N terms before proceeding |
| Duolingo Bridge Reveal | Two parallel facts (Quran vs Science) convergence moment |

---

## What to NEVER Do

- Never show a count that looks wrong or inconsistent without immediately reframing it.
- Never use the word "inconsistency" or imply the Quran has errors.
- Never open a page with the raw unbalanced number (e.g., do not open with "29 vs 26").
- Never add features not needed for the current pattern.
- Never use comments in code.
- Never add error handling for things that cannot fail.
- Never create a "both sides" presentation — the Quran always wins.
- Never link to external resources or add disclaimers.
- Never use emoji in code or content.

---

## Visual Identity Checklist

When reviewing a new page, confirm:

- [ ] Dark background `#0b1622`, never white or light gray
- [ ] All CSS variables from the design system are present
- [ ] Correct Google Fonts import, all three families
- [ ] Arabic text uses Amiri font, `direction: rtl`, `text-align: right`, `line-height: 2.0+`
- [ ] Big Playfair Display numbers for key statistics — they must feel monumental
- [ ] Dot-field background element present (fixed, `opacity: .02`)
- [ ] Container max-width 660px, centered, body padding 44px 20px 80px
- [ ] Progress system matches page era: dot-progress for pages 1–15 (legacy), Duolingo lesson bar for pages 16+ (see Duolingo Teaching System section)
- [ ] Stage 0 is the shock — not a gentle introduction
- [ ] Final stage ends with conviction, not a question
- [ ] Nav-back link present at top
- [ ] Ghost back-link present at end of last stage
- [ ] No inline comments in the HTML/JS/CSS
