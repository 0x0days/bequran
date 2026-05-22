# ChatGPT Guide — Building New Lesson Pages

## The core strategy
Don't describe the project abstractly. Give ChatGPT a **complete real page** and say
"generate the same structure with my topic." It pattern-matches far better than it
follows written rules. Everything below is built on this principle.

---

## What to prepare before opening ChatGPT

1. Your topic details (fill in the template at the bottom of this file)
2. The file `quran-moving-mountains.html` open and ready to copy
3. `card-canvas.js` open (you will paste at the bottom)
4. `index.html` open (you will make 5 small edits)

---

## THE MEGA PROMPT — paste this as ONE message

Replace every `[BRACKET]` section. Do not change anything else.

---

```
You are going to generate a complete lesson page for the Quranic Numerics project.
I will give you: rules, a complete reference page, and my topic details.
Generate exactly what I ask for, nothing more.

══════════════════════════════════════════════════════════
PART 1 — ABSOLUTE RULES (violating any of these = wrong output)
══════════════════════════════════════════════════════════

DESIGN RULES:
- All CSS variables: --bg:#0b1622; --surface:#111e2e; --surface2:#182840; --border:rgba(255,255,255,0.08); --text:#e2ddd4; --muted:#7a8fa3; --gold:#f59e0b; --gold-light:#fcd34d; --ok:#22c55e; --ok-bg:#052e16; --err-light:#f87171; --err-bg:#2d0707
- Body: background:var(--bg); color:var(--text); font-family:'DM Sans',sans-serif; min-height:100vh; padding:44px 20px 160px
- Fonts: Playfair Display (titles, big numbers), DM Sans (body), Amiri (Arabic text with direction:rtl)
- Every page has ONE unique --accent color. Mine is: [YOUR ACCENT COLOR]
- Do NOT use Inter, Roboto, Arial, or any font not listed above
- Do NOT use purple gradients on white backgrounds
- Do NOT add any CSS class names not present in the reference page

CONTENT / PEDAGOGY RULES:
- Present facts as discoveries. The student is a curious learner, not a debater.
- NEVER write anything like: "skeptics say", "critics argue", "some claim", "how would you respond"
- NEVER write a question that frames the Quran as being defended or attacked
- NEVER write more than 2 sentences to explain any single concept
- S4 verdict must end with a feeling of "this is impossible to be coincidence" — not academic analysis
- Keep S0 intro direct: state the verse, state the discovery, nothing more
- MC questions test understanding of what was just demonstrated — not trivia

GOOD pedagogy example:
  S0 claim: "The verse uses the word مُوسِعُونَ — We are expanding it. Scientists confirmed this in 1929."
  S4 verdict: "Edwin Hubble confirmed the universe is expanding in 1929. The Quran stated it 1,319 years earlier with a single precise word."

BAD pedagogy example (NEVER do this):
  "Some scholars debate whether this verse truly describes the Big Bang. How would you respond to someone who says this is coincidence?"

STRUCTURE RULES:
- 5 stages exactly: S0 intro, S1 canvas+MC, S2 interactive canvas, S3 MC, S4 verdict
- S1: canvas animation runs automatically when stage opens, MC appears after animation ends
- S2: user clicks a button to trigger the animation, result panel reveals after
- S3: pure MC, no canvas needed
- S4: xpBadge + animated counters (use animFrom) + verdict table + gold-box quote
- fb-panel HTML is OUTSIDE .container, fixed at page bottom
- The following fb-panel CSS must appear verbatim inside <style>:

.fb-panel{position:fixed;bottom:0;left:0;right:0;z-index:300;padding:18px 20px 32px;transform:translateY(110%);transition:transform .35s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.fb-panel.show{transform:translateY(0)}
.fb-panel.fb-ok{background:var(--ok-bg);border-top:3px solid var(--ok)}
.fb-panel.fb-err{background:var(--err-bg);border-top:3px solid var(--err-light)}
.fb-left{display:flex;align-items:center;gap:12px}
.fb-icon{font-size:24px;line-height:1}
.fb-title{font-size:17px;font-weight:700}
.fb-panel.fb-ok .fb-title{color:var(--ok)}
.fb-panel.fb-err .fb-title{color:var(--err-light)}
.fb-sub{font-size:13px;color:rgba(255,255,255,0.6);margin-top:3px;line-height:1.55;max-width:340px}
.fb-btn{flex-shrink:0;padding:14px 30px;border-radius:12px;border:none;font-family:'DM Sans',sans-serif;font-size:15px;font-weight:700;cursor:pointer;transition:transform .1s}
.fb-btn:active{transform:scale(0.96)}
.fb-panel.fb-ok .fb-btn{background:var(--ok);color:var(--ok-bg)}
.fb-panel.fb-err .fb-btn{background:var(--err-light);color:var(--err-bg)}

JS ENGINE RULES (copy these functions verbatim, do not rewrite them):
- ease(t) = 1 - Math.pow(1-t, 3)
- animFrom(el, from, to, ms, cb) — animated number counter using ease
- go(n) — switches stages, updates progress bar, calls saveProgress on n===4
- saveProgress(id) — localStorage dedup, adds 30 XP
- hideFb() / showOk(sub, onContinue) — feedback panel control
- pickEx1(el, correct) uses #s1 selector, calls go(2) on correct
- pickEx3(el, correct) uses #s3 selector, calls go(4) on correct
- initHeroCanvas() called once at bottom of script
- In go(n): if(n===1) setTimeout(initS1Canvas, 60); if(n===2) no auto-start (button triggers it)

CANVAS RULES:
- All canvases use dark background (#040810 or similar near-black)
- heroCanvas: width="640" height="130" style="width:100%;height:130px;border-radius:14px;margin-bottom:28px;display:block;"
- s1Canvas: width="640" height="210" style="width:100%;height:210px;border-radius:12px;margin-bottom:20px;display:block;"
- s2Canvas: width="640" height="220" style="width:100%;height:220px;border-radius:12px;margin-bottom:20px;display:block;"
- Canvas code uses: var W=c.width, H=c.height, t=0 — then requestAnimationFrame loop with t+=0.02
- Colors use rgba() with the page accent color and near-white/gold for highlights
- Animations are subtle and slow — they support the content, they do not distract

══════════════════════════════════════════════════════════
PART 2 — REFERENCE PAGE (copy this structure exactly)
══════════════════════════════════════════════════════════

[PASTE THE ENTIRE CONTENT OF quran-moving-mountains.html HERE]

══════════════════════════════════════════════════════════
PART 3 — MY TOPIC DETAILS
══════════════════════════════════════════════════════════

LESSON TITLE (English): [e.g. The Expanding Universe]
LESSON TITLE (Arabic):  [e.g. تَوَسُّعُ الْكَوْنِ]
LESSON NUMBER:          [e.g. 35]
LESSON ID:              [e.g. expanding-universe]   ← kebab-case filename slug
ACCENT COLOR:           [e.g. #e879f9]
CATEGORY:               [astronomy / biology / geology / physics / chemistry / numerics]
CATEGORY LABEL:         [e.g. Astronomy]
PREVIOUS PAGE:          [e.g. quran-moving-mountains.html · "Moving Mountains"]
NEXT PAGE:              [e.g. none yet]

HOOK (big text on index card): [e.g. مُوسِعُونَ  OR  ١٩٢٩]
TEASER (one sentence):         [e.g. "The Quran says the sky is expanding — confirmed 1,319 years later."]

VERSE:
  Reference: [e.g. 51:47]
  Arabic:    [e.g. وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ]
  English:   [e.g. "And the heaven We constructed with strength, and indeed We are its expander."]
  Key word:  [e.g. مُوسِعُونَ = "expanding it" — an active present-tense participle]

THE DISCOVERY (2–3 sentences max, plain language):
  [e.g. The word Musi'oon means "We are expanding it" — active, ongoing, present tense.
   Edwin Hubble confirmed in 1929 that galaxies are moving away from each other.
   No human in the 7th century could have known the universe is not static.]

S0 CLAIM (one clear direct sentence):
  [e.g. "The Quran uses a present-tense verb meaning 'expanding' — confirmed by science in 1929."]

S1 — CANVAS ANIMATION DESCRIPTION:
  [Describe visually and specifically. Example:
   "Split canvas. Left panel labelled 'Common belief 610 AD': a static dot in the center,
    lines drawn to surrounding dots — all still, no movement. Label: STATIC.
    Right panel labelled 'Quran 51:47': same central dot, but the surrounding dots slowly
    drift outward from center. Arrows on each drift direction. Label: EXPANDING.
    Left panel fades in first (0–680ms), right panel fades in second (520–1200ms).
    After animation ends, the MC question div appears."]

S1 — MC QUESTION:
  Q: [your question]
  A: [wrong option]
  B: [wrong option]
  C: [correct option]  ← mark which is correct

S1 — CORRECT ANSWER FEEDBACK (shown in green panel):
  [One sentence. e.g. "Musi'oon is present tense — the expansion is ongoing, not past."]

S2 — INTERACTIVE CANVAS DESCRIPTION:
  [Describe the mechanic. Example:
   "Button label: 'Run the expansion'.
    On click: a single bright dot at center. Lines animate outward to 12 dots,
    each dot moving away at slightly different speed. A counter below shows
    distance multiplying. After 2.5s the result panel reveals:
    'Galaxies are still moving apart today — at increasing speed.'"]

S2 — RESULT PANEL TEXT:
  [e.g. "The universe has been expanding for 13.8 billion years — and is accelerating."]

S2 — COUNTER LABELS:
  Counter 1 label: [e.g. "Year of confirmation"]   value: [e.g. 1929]
  Counter 2 label: [e.g. "Years before science"]   value: [e.g. 1319]

S3 — MC QUESTION:
  Q: [your question — about the scientific fact demonstrated in S2]
  A: [correct option]  ← mark which is correct
  B: [wrong option]
  C: [wrong option]

S3 — CORRECT ANSWER FEEDBACK:
  [One sentence.]

S4 — VERDICT TITLE:   [e.g. "Written 1,319 years before Hubble."]
S4 — VERDICT BODY:    [2–3 sentences. End with impact. No hedging. No "some say."]
S4 — GOLD BOX QUOTE:  [One short powerful sentence in quotes. Then 1–2 sentences of explanation.]

S4 — VERDICT TABLE (3 rows):
  Row 1: [Quran statement] | [Science confirms] | ✓
  Row 2: [Quran statement] | [Science confirms] | ✓
  Row 3: [Quran statement] | [Science confirms] | ✓

══════════════════════════════════════════════════════════
PART 4 — OUTPUT INSTRUCTIONS
══════════════════════════════════════════════════════════

Give me THREE outputs, each clearly labelled:

--- OUTPUT 1: quran-[slug].html ---
Complete single-file HTML page.
Follow the reference page structure EXACTLY.
Replace all content with my topic details.
Keep every CSS class name, JS function name, and HTML id unchanged.
The fb-panel CSS block must appear verbatim as given in Part 1.
Do not add any CSS class not present in the reference page.
Canvas animations must match my descriptions above.

--- OUTPUT 2: card-canvas.js entry ---
A single self-contained function:
CardCanvases['[slug]'] = function(cv) {
  var rafId = null;
  if (!cv) return { stop: function() {} };
  var ctx = cv.getContext('2d');
  var W = cv.width, H = cv.height, t = 0;
  /* animation matching the hero canvas but simplified for 118px card height */
  function frame() {
    /* draw */
    t += 0.02;
    rafId = requestAnimationFrame(frame);
  }
  rafId = requestAnimationFrame(frame);
  return { stop: function() { if (rafId) { cancelAnimationFrame(rafId); rafId = null; } } };
};
Rules: use cv only (never getElementById). Always assign RAF to rafId. Always return {stop}.

--- OUTPUT 3: index.html lessons array entry ---
One JS object only:
{ id:'[slug]', n:[number], title:'[English title]', ar:'[Arabic title]',
  hook:'[hook]', teaser:'[teaser]',
  cat:'[category]', catLabel:'[Category Label]', accent:'[color]',
  url:'quran-[slug].html' }

Output the three sections back to back. No commentary between them.
If your output gets cut off, I will type "continue" and you resume exactly where you stopped.
```

---

## How to handle ChatGPT's free tier limits

The prompt above is long. If ChatGPT says it's too long or cuts off:

**Split into 3 messages:**

Message 1:
```
I am going to send you 3 parts of a request. Do not generate anything yet.
Just reply "Ready for part 2" after each part.

PART 1 — RULES:
[paste only the RULES section from the mega-prompt above]
```

Message 2:
```
PART 2 — REFERENCE PAGE:
[paste quran-moving-mountains.html]
```

Message 3:
```
PART 3 — MY TOPIC + OUTPUT INSTRUCTIONS:
[paste your topic details + the OUTPUT INSTRUCTIONS section]
Now generate all 3 outputs.
```

---

## Where to paste each output

### Output 1 → New HTML file
Create `/home/mac/solo/quran-[slug].html` and paste everything.

### Output 2 → card-canvas.js
Open `card-canvas.js`. Scroll to the very last line. Paste the new function after it.

### Output 3 → index.html (5 edits)

| What to find | What to change |
|---|---|
| `{ id:'moving-mountains'` ... last entry | Add comma, paste new object after it |
| `<div class="stat-n">34</div>` | Change 34 → 35 |
| `34 Discoveries · Verified` | Change 34 → 35 |
| `done.size / 34 *` | Change 34 → 35 |
| `All 34` in filter tab | Change 34 → 35 |

### Previous page → add Next link
In `quran-moving-mountains.html`, find the `.nav-next-wrap` div in S4 and add:
```html
<a href="quran-[slug].html" class="btn btn-accent">
  Next · [Your Title]
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
</a>
```

---

## Final checklist before opening in browser

- [ ] `saveProgress('[slug]')` in the HTML matches `id` in the lessons array
- [ ] `initHeroCanvas()` is called at the bottom of the `<script>` block
- [ ] `.fb-panel { position:fixed` CSS is inside `<style>` (search for it)
- [ ] `<script src="theme.js"></script>` is the last line before `</body>`
- [ ] In card-canvas.js: no bare `requestAnimationFrame(` — all assigned to `rafId`
- [ ] All 5 index.html edits done

---

## How to fix the most common ChatGPT failures

**fb-panel not sliding up when correct answer clicked**
→ The `.fb-panel` CSS block is missing. Copy it from the rules section above and paste it inside the page's `<style>` tag.

**Canvas is blank / black rectangle**
→ Ask ChatGPT: "Rewrite only the initHeroCanvas() function. The canvas id is 'heroCanvas', width 640px height 130px. Draw: [describe your animation again more specifically]. Use requestAnimationFrame loop with t+=0.02."

**S4 verdict reads like a Wikipedia article**
→ Ask: "Rewrite only the verdict-sub paragraph and gold-box. Make it shorter, more direct, more impactful. End with a feeling of impossibility. No hedging. No 'some scholars say'."

**MC question sounds like a debate**
→ Ask: "Rewrite the S1 prompt and answer options. The student is discovering something remarkable, not defending a position. Remove any framing of doubt or challenge. The correct answer should feel like a satisfying discovery."

**Animation is too simple (just dots on black)**
→ Describe it more concretely: "The animation should show [exact visual]. Use colors [hex values]. Elements move [direction, speed]. Background is #040810."

---

## Topic details template — fill this before prompting

```
LESSON TITLE (English):
LESSON TITLE (Arabic):
LESSON NUMBER:
LESSON ID (slug):       ← kebab-case, e.g. "expanding-universe"
ACCENT COLOR:           ← pick unused color from CLAUDE.md
CATEGORY:               ← astronomy / biology / geology / physics / chemistry / numerics
CATEGORY LABEL:

VERSE REFERENCE:        ← e.g. 51:47
VERSE ARABIC:
VERSE ENGLISH:
KEY ARABIC WORD:        ← the specific word that carries the discovery

THE DISCOVERY:          ← 2–3 sentences, plain language, no jargon

HOOK:                   ← big text shown on index card (Arabic word or number)
TEASER:                 ← one sentence for the index card

S0 CLAIM:               ← one direct sentence
S1 CANVAS:              ← describe visually (what moves, what direction, what colors, timing)
S1 MC QUESTION:
  A:
  B:
  C:                    ← mark CORRECT next to the right one
S1 FEEDBACK:            ← one sentence shown in green panel

S2 CANVAS:              ← describe the mechanic (button label, what animates, what reveals)
S2 RESULT TEXT:
S2 COUNTER 1:           label / value
S2 COUNTER 2:           label / value

S3 MC QUESTION:
  A:                    ← mark CORRECT next to the right one
  B:
  C:
S3 FEEDBACK:            ← one sentence

S4 VERDICT TITLE:
S4 VERDICT BODY:        ← 2–3 sentences, ends with impact
S4 GOLD BOX:            ← one quote + 1–2 sentences
S4 TABLE ROW 1:         Quran says | Science confirms
S4 TABLE ROW 2:         Quran says | Science confirms
S4 TABLE ROW 3:         Quran says | Science confirms

PREVIOUS PAGE:          filename · "Title"
NEXT PAGE:              filename · "Title"  (or "none yet")
```
