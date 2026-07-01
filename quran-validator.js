/**
 * quran-validator.js — Portable inline Quran word validator
 *
 * Usage:
 *   <div id="qv-here"></div>
 *   <script src="quran-validator.js"></script>
 *   <script>
 *   var v = QuranValidator.attach('qv-here', {
 *     mode: 'count',   // 'count' (ratio + progress) | 'locate' (find the verse)
 *     title: 'Read it yourself in the Quran',
 *     subtitle: 'Count every البحر and البر in the Quran',
 *     groups: [
 *       { id:'sea', label:'Sea', arabic:'البحر', color:'#0ea5e9',
 *         occurrences:[[2,50],[5,96],...] },
 *       { id:'land', label:'Land', arabic:'البر', color:'#f59e0b',
 *         occurrences:[[5,96],[6,59],...] }
 *     ]
 *   });
 *   // To add/remove a group later (e.g. enhanced toggle):
 *   v.reinit(newConfig);
 *   </script>
 */
(function(G) {
  'use strict';

  /* ── shared state ─────────────────────────────────────────── */
  var _instances = {};
  var _instCount = 0;
  var _cssInjected = false;
  var _dataCache = null;   /* shared parsed verses array */
  var VPP = 15;            /* verses per page */

  /* ── surah names ──────────────────────────────────────────── */
  var SN = {
    1:"Al-Fatihah",2:"Al-Baqarah",3:"Ali 'Imran",4:"An-Nisa",5:"Al-Ma'idah",
    6:"Al-An'am",7:"Al-A'raf",8:"Al-Anfal",9:"At-Tawbah",10:"Yunus",
    11:"Hud",12:"Yusuf",13:"Ar-Ra'd",14:"Ibrahim",15:"Al-Hijr",16:"An-Nahl",
    17:"Al-Isra",18:"Al-Kahf",19:"Maryam",20:"Ta-Ha",21:"Al-Anbiya",
    22:"Al-Hajj",23:"Al-Mu'minun",24:"An-Nur",25:"Al-Furqan",26:"Ash-Shu'ara",
    27:"An-Naml",28:"Al-Qasas",29:"Al-'Ankabut",30:"Ar-Rum",31:"Luqman",
    32:"As-Sajdah",33:"Al-Ahzab",34:"Saba",35:"Fatir",36:"Ya-Sin",
    37:"As-Saffat",38:"Sad",39:"Az-Zumar",40:"Ghafir",41:"Fussilat",
    42:"Ash-Shura",43:"Az-Zukhruf",44:"Ad-Dukhan",45:"Al-Jathiyah",
    46:"Al-Ahqaf",47:"Muhammad",48:"Al-Fath",49:"Al-Hujurat",50:"Qaf",
    51:"Adh-Dhariyat",52:"At-Tur",53:"An-Najm",54:"Al-Qamar",55:"Ar-Rahman",
    56:"Al-Waqi'ah",57:"Al-Hadid",58:"Al-Mujadila",59:"Al-Hashr",
    60:"Al-Mumtahanah",61:"As-Saf",62:"Al-Jumu'ah",63:"Al-Munafiqun",
    64:"At-Taghabun",65:"At-Talaq",66:"At-Tahrim",67:"Al-Mulk",68:"Al-Qalam",
    69:"Al-Haqqah",70:"Al-Ma'arij",71:"Nuh",72:"Al-Jinn",73:"Al-Muzzammil",
    74:"Al-Muddathir",75:"Al-Qiyamah",76:"Al-Insan",77:"Al-Mursalat",
    78:"An-Naba",79:"An-Nazi'at",80:"'Abasa",81:"At-Takwir",82:"Al-Infitar",
    83:"Al-Mutaffifin",84:"Al-Inshiqaq",85:"Al-Buruj",86:"At-Tariq",
    87:"Al-A'la",88:"Al-Ghashiyah",89:"Al-Fajr",90:"Al-Balad",91:"Ash-Shams",
    92:"Al-Layl",93:"Ad-Duha",94:"Ash-Sharh",95:"At-Tin",96:"Al-'Alaq",
    97:"Al-Qadr",98:"Al-Bayyinah",99:"Az-Zalzalah",100:"Al-'Adiyat",
    101:"Al-Qari'ah",102:"At-Takathur",103:"Al-'Asr",104:"Al-Humazah",
    105:"Al-Fil",106:"Quraysh",107:"Al-Ma'un",108:"Al-Kawthar",
    109:"Al-Kafirun",110:"An-Nasr",111:"Al-Masad",112:"Al-Ikhlas",
    113:"Al-Falaq",114:"An-Nas"
  };

  /* ── helpers ──────────────────────────────────────────────── */
  function norm(t) {
    return t.replace(/[ً-ٰٟۖ-ۜ۟-۪ۤۧۨ-ۭ]/g,'')  /* diacritics */
            .replace(/ـ/g,'')                        /* kashida / tatweel */
            .replace(/[ٱأإآء]/g,'ا')                 /* alef variants + hamza */
            .replace(/اا/g,'ا')                      /* double-alef from hamza+alef */
            .replace(/ة/g,'ت');                      /* taa marbuta → taa: matches construct forms */
  }
  function esc(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
  function toAr(n) {
    return String(n).replace(/[0-9]/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[+d];});
  }
  /* Auto-derive word match from arabic config field.
     Strip diacritics first, then strip recognised single-char / tri-char
     prepositions + definite-article combinations and check for EQUALITY
     with the normalised target. This correctly rejects false positives like
     البحرين (dual suffix ين) while accepting والبحر, بالبحر etc. */
  var PREPS = ['وي','في','ويا','فيا','وال','فال','بال','لال','كال','و','ف','ب','ل','ك','ي'];
  /* Possessive/pronominal suffixes that attach to nouns (longest first to avoid
     partial matches, e.g. strip 'هم' before 'ه'). */
  var SUFFS = ['هما','كما','هم','هن','كم','كن','ها','نا','ه','ك','ى','ي'];
  function makeMatchFn(arabic) {
    var target = norm(arabic);
    /* Dual nominative (ان) is the only suffix worth allowing generically —
       e.g. البحران (the two seas) at 35:12. Dual genitive/accus (ين) is
       deliberately excluded to avoid the البحرين false-positive. */
    var dualTarget = target + 'ان';
    function check(stem) {
      if (stem === target || stem === dualTarget) return true;
      /* also try stripping possessive suffixes from the stem */
      for (var j = 0; j < SUFFS.length; j++) {
        var suf = SUFFS[j];
        if (stem.length > suf.length && stem.slice(-suf.length) === suf) {
          var bare = stem.slice(0, -suf.length);
          if (bare === target || bare === dualTarget) return true;
        }
      }
      return false;
    }
    return function(token) {
      var t = norm(token);
      if (check(t)) return true;
      for (var i = 0; i < PREPS.length; i++) {
        var pre = PREPS[i];
        if (t.length > pre.length && t.slice(0, pre.length) === pre) {
          if (check(t.slice(pre.length))) return true;
        }
      }
      return false;
    };
  }

  /* ── CSS (injected once) ──────────────────────────────────── */
  var CSS = [
    /* ── improvement 1: section wrapper — distinct section feel with accent left-rail */
    '.qvsec{border-top:1px solid var(--border);border-left:3px solid var(--accent,#0ea5e9);padding:18px 0 18px 16px;margin-bottom:28px;background:linear-gradient(90deg,rgba(14,165,233,.04) 0%,transparent 60%);}',
    /* improvement 1: invitation button replaces old row+toggle */
    '.qv-invite{display:flex;align-items:center;gap:14px;width:100%;background:transparent;border:1px solid rgba(255,255,255,.1);border-radius:10px;padding:14px 18px;cursor:pointer;text-align:left;transition:border-color .2s,box-shadow .2s;font-family:"DM Sans",sans-serif;margin-bottom:0;}',
    '.qv-invite:hover{border-color:var(--accent,#0ea5e9);box-shadow:0 0 18px rgba(14,165,233,.18);}',
    '.qv-invite:active{box-shadow:0 0 8px rgba(14,165,233,.1);}',
    '.qv-invite-icon{flex-shrink:0;opacity:.85;}',
    '.qv-invite-text{flex:1;}',
    '.qv-invite-hl{font-size:15px;font-weight:600;color:var(--text);line-height:1.3;margin-bottom:4px;}',
    '.qv-invite-sub{font-size:12px;color:var(--muted);line-height:1.5;}',
    /* panel */
    '.qvpanel{display:none;animation:qvrise .3s ease;margin-top:12px;}',
    '.qvpanel.qvopen{display:block;}',
    '@keyframes qvrise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    /* loading */
    '.qvload{display:flex;align-items:center;gap:10px;padding:20px;justify-content:center;background:var(--surface);border-radius:10px;font-size:13px;color:var(--muted);}',
    '.qvspin{width:18px;height:18px;border-radius:50%;border:2px solid var(--surface2);border-top-color:var(--accent,#0ea5e9);animation:qvspin .8s linear infinite;flex-shrink:0;}',
    '@keyframes qvspin{to{transform:rotate(360deg)}}',
    /* ── improvement 2: embed card — darker, more manuscript-like */
    '.qvembed{border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;height:500px;background:#06080e;}',
    /* ── improvement 2: guide — accent-tinted richer background */
    '.qvguide{flex-shrink:0;background:rgba(14,165,233,.06);border-bottom:1px solid rgba(14,165,233,.14);padding:12px 14px;}',
    '.qvgr1{display:flex;align-items:center;gap:8px;margin-bottom:8px;}',
    /* improvement 2: badge larger (24px) and more prominent */
    '.qvbadge{font-family:"Amiri",serif;font-size:24px;font-weight:700;padding:3px 10px;border-radius:5px;direction:rtl;flex-shrink:0;line-height:1.5;border:1px solid transparent;}',
    '.qvgi{font-size:13px;color:var(--text);flex:1;line-height:1.35;}',
    '.qvgs{font-size:11px;color:var(--muted);margin-top:2px;}',
    /* ── improvement 3: dot arc — replaces old pills */
    '.qv-dots{display:flex;flex-wrap:wrap;gap:3px;flex-shrink:0;align-items:center;max-width:140px;}',
    '.qv-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;transition:transform .2s,filter .2s,background .2s;}',
    '.qv-dot.qvd-done{filter:brightness(1.4);transform:scale(1);}',
    '.qv-dot.qvd-active{background:#fff!important;animation:qvdpulse 1s ease infinite;}',
    '.qv-dot.qvd-dim{background:rgba(255,255,255,.14);}',
    '@keyframes qvdpulse{0%,100%{transform:scale(1);opacity:.8}50%{transform:scale(1.35);opacity:1}}',
    /* ── 3-element action bar: ← [confirm] → ── */
    '.qv-action-bar{display:flex;gap:8px;align-items:stretch;padding:10px 14px 12px;background:rgba(0,0,0,.18);}',
    '.qv-nav-btn{width:44px;height:44px;flex-shrink:0;border-radius:50%;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);color:var(--muted);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .2s,background .2s,color .2s;font-family:"DM Sans",sans-serif;touch-action:manipulation;}',
    '.qv-nav-btn:hover:not(:disabled){border-color:rgba(255,255,255,.28);background:rgba(255,255,255,.09);color:var(--text);}',
    '.qv-nav-btn:active:not(:disabled){transform:scale(.92);}',
    '.qv-nav-btn:disabled{opacity:.25;cursor:default;}',
    '.qv-confirm-btn{flex:1;height:44px;border-radius:10px;border:none;background:var(--ok,#22c55e);color:var(--ok-bg,#052e16);font-family:"DM Sans",sans-serif;font-size:14px;font-weight:700;cursor:pointer;transition:filter .15s,transform .12s;letter-spacing:.01em;touch-action:manipulation;}',
    '.qv-confirm-btn:hover{filter:brightness(1.10);}',
    '.qv-confirm-btn:active{transform:scale(.97);}',
    '.qv-confirm-btn:disabled{opacity:.35;cursor:default;filter:none;}',
    /* content */
    '.qvcontent{flex:1;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;}',
    '.qvpage{max-width:580px;margin:0 auto;padding:10px 15px 12px;}',
    '.qvpage{transition:transform .18s ease,opacity .18s ease;}',
    /* bottom nav */
    '.qvnav{flex-shrink:0;height:42px;display:flex;align-items:center;justify-content:space-between;padding:0 14px;background:var(--surface);border-top:1px solid var(--border);}',
    '.qvnavbtn{height:30px;padding:0 11px;border-radius:6px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);font-size:12px;cursor:pointer;font-family:"DM Sans",sans-serif;}',
    '.qvpinfo{font-size:11px;color:var(--muted);}',
    /* surah header */
    '.qvshdr{text-align:center;padding:10px 0 7px;}',
    '.qvsorn{display:flex;align-items:center;gap:7px;margin-bottom:4px;}',
    '.qvsorl{flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(245,158,11,.18),transparent);}',
    '.qvsord{color:rgba(245,158,11,.30);font-size:8px;}',
    '.qvsar{font-family:"Amiri",serif;direction:rtl;font-size:16px;color:rgba(245,158,11,.72);}',
    '.qvsen{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);}',
    /* ── improvement 2: verse — larger Arabic (clamp 20-26px), more breathing room */
    '.qvv{display:flex;align-items:baseline;gap:7px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);}',
    '.qvv:last-child{border-bottom:none;}',
    '.qvvt{flex:1;font-family:"Amiri",serif;direction:rtl;text-align:right;font-size:clamp(20px,4vw,26px);line-height:2.5;color:var(--text);word-break:break-word;}',
    '.qvvn{font-family:"Amiri",serif;font-size:11px;color:var(--muted);flex-shrink:0;direction:rtl;opacity:.6;}',
    /* improvement 2: target verse — warm amber radial gradient glow, not just a border */
    '.qvv.qvtgt{border-radius:8px;padding:8px 10px;border-left:2px solid transparent;animation:qvpulse 2s ease infinite;background:radial-gradient(ellipse at 50% 50%,rgba(245,158,11,.14) 0%,rgba(245,158,11,.05) 55%,transparent 80%)!important;}',
    '@keyframes qvpulse{0%,100%{opacity:.7}50%{opacity:1}}',
    /* ── improvement 4: word highlights — flash animation + more visible checkmark */
    '.qvhl{border-radius:3px;padding:1px 2px;cursor:pointer;transition:filter .12s;}',
    '.qvhl:hover{filter:brightness(1.35);}',
    '.qvhl.qvconfirmed{opacity:.5;}',
    '.qvhl.qvconfirmed::after{content:" ✓";font-size:11px;font-weight:700;color:#22c55e;font-family:"DM Sans",sans-serif;}',
    '.qvhl.qv-flash{animation:qvFlash .5s ease forwards;}',
    '@keyframes qvFlash{0%{transform:scale(1)}35%{transform:scale(1.18);filter:brightness(2)}100%{transform:scale(1)}}',
    /* ── improvement 5: done screen — premium cinematic completion */
    /* done screen sits ABOVE the verse page in the scroll area, not replacing it */
    '.qvdone{display:none;flex-direction:column;align-items:center;padding:20px 16px 18px;gap:12px;text-align:center;position:relative;overflow:hidden;border-bottom:1px solid rgba(245,158,11,.18);background:linear-gradient(to bottom,rgba(245,158,11,.06),transparent);}',
    '.qvdone.qvvis{display:flex;}',
    /* dismiss ×  in top-right corner */
    '.qv-done-dismiss{position:absolute;top:10px;right:12px;width:28px;height:28px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:var(--muted);font-size:16px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:border-color .15s,color .15s;font-family:"DM Sans",sans-serif;}',
    '.qv-done-dismiss:hover{border-color:rgba(255,255,255,.3);color:var(--text);}',
    /* actions row: share + browse */
    '.qv-done-actions{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;width:100%;}',
    '.qv-done-flash{position:absolute;inset:0;background:rgba(245,158,11,.16);pointer-events:none;opacity:0;transition:opacity .5s;}',
    '.qv-done-flash.qvf-on{opacity:1;}',
    '.qv-done-num{font-family:"Playfair Display",serif;font-size:52px;font-weight:700;line-height:1;text-shadow:0 0 28px currentColor;margin:0;padding:0;}',
    '.qv-done-words{display:flex;gap:16px;justify-content:center;align-items:center;flex-wrap:wrap;}',
    '.qv-done-word{display:flex;flex-direction:column;align-items:center;gap:4px;}',
    '.qv-done-ar{font-family:"Amiri",serif;direction:rtl;font-size:26px;line-height:1.4;}',
    '.qv-done-ct{font-size:13px;color:var(--muted);}',
    '.qv-done-line{font-family:"Playfair Display",serif;font-style:italic;font-size:18px;color:#f59e0b;margin:4px 0;}',
    '.qv-done-share{font-size:12px;color:var(--muted);background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:7px 14px;cursor:pointer;font-family:"DM Sans",sans-serif;transition:border-color .15s;text-decoration:none;display:inline-block;}',
    '.qv-done-share:hover{border-color:rgba(255,255,255,.22);color:var(--text);}',
    '.qv-done-browse{font-size:12px;font-weight:600;color:var(--ok,#22c55e);background:rgba(34,197,94,.10);border:1px solid rgba(34,197,94,.28);border-radius:6px;padding:7px 14px;cursor:pointer;font-family:"DM Sans",sans-serif;transition:border-color .15s,background .15s;}',
    '.qv-done-browse:hover{border-color:rgba(34,197,94,.5);background:rgba(34,197,94,.18);}',
    /* light mode overrides */
    'html[data-theme="light"] .qvvt{color:#1c2b3a;}',
    'html[data-theme="light"] .qvsar{color:#92400e;}',
    'html[data-theme="light"] .qvembed{background:#f0ece4;}',
    'html[data-theme="light"] .qvguide{background:rgba(14,165,233,.05);border-bottom-color:rgba(14,165,233,.18);}',
    'html[data-theme="light"] .qvsec{background:linear-gradient(90deg,rgba(14,165,233,.05) 0%,transparent 60%);}'
  ].join('');

  function injectCSS() {
    if (_cssInjected) return;
    var el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _cssInjected = true;
  }

  /* ── Validator instance ───────────────────────────────────── */
  function Validator(containerId, config) {
    this.id = _instCount++;
    this.el = document.getElementById(containerId);
    if (!this.el) { console.warn('QuranValidator: container #' + containerId + ' not found'); return; }
    this.config = config;
    this.allV = null;
    this.curP = 0;
    this.totP = 0;
    this.gIdx = 0;
    this.conf = {};
    this.comb = [];
    this.loaded = false;
    _instances[this.id] = this;
    this._buildComb();
    this._renderShell();
    /* Auto-open by default — no toggle click needed */
    var _self = this;
    setTimeout(function(){ _self.onToggle(true); }, 0);
  }

  Validator.prototype = {

    /* Build sorted combined occurrence list from all groups */
    _buildComb: function() {
      var comb = [];
      var cfg = this.config;
      (cfg.groups || []).forEach(function(g) {
        var seenCount = {};
        (g.occurrences || []).forEach(function(o) {
          /* idx distinguishes duplicate [s,a] entries for the same group */
          var baseKey = o[0] + ':' + o[1] + ':' + g.id;
          seenCount[baseKey] = (seenCount[baseKey] || 0);
          var idx = seenCount[baseKey]++;
          comb.push({ s: o[0], a: o[1], gid: g.id, idx: idx });
        });
      });
      comb.sort(function(a,b){ return a.s !== b.s ? a.s - b.s : a.a - b.a; });
      this.comb = comb;
    },

    /* Build a lookup: gid → group config */
    _groupMap: function() {
      var map = {};
      (this.config.groups || []).forEach(function(g){ map[g.id] = g; });
      return map;
    },

    /* Get element by local suffix */
    _q: function(suffix) {
      return document.getElementById('qv' + this.id + '-' + suffix);
    },

    /* ── improvement 1: invitation button shell ─────────────── */
    _renderShell: function() {
      var id = this.id;
      var cfg = this.config;
      var mode = cfg.mode || 'count';
      /* improvement 4: renamed button labels */
      var confirmLabel = mode === 'locate' ? '✓ I found this verse' : '✓ I verified this word';
      var html = '<div class="qvsec">'
        /* improvement 1: full-width invitation button with scripture icon */
        + '<button class="qv-invite" onclick="QuranValidator._toggle(' + id + ',true)">'
        + '<span class="qv-invite-icon">'
        + '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--accent,#0ea5e9)">'
        + '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>'
        + '<path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'
        + '</svg>'
        + '</span>'
        + '<span class="qv-invite-text">'
        + '<div class="qv-invite-hl">Verify it in the Quran</div>'
        + '<div class="qv-invite-sub">Count every occurrence yourself — not because you were told, but because you saw it.</div>'
        + '</span>'
        + '</button>'
        + '<div class="qvpanel" id="qv' + id + '-panel">'
        + '<div class="qvload" id="qv' + id + '-loading"><div class="qvspin"></div>Loading Quran…</div>'
        + '<div class="qvembed" id="qv' + id + '-embed" style="display:none">'
        /* guide */
        + '<div class="qvguide"><div class="qvgr1">'
        + '<span class="qvbadge" id="qv' + id + '-badge">…</span>'
        + '<div style="flex:1"><div class="qvgi" id="qv' + id + '-info">—</div>'
        + '<div class="qvgs" id="qv' + id + '-sub">—</div></div>'
        /* improvement 3: dot arc container (was .qvpills) */
        + '<div class="qv-dots" id="qv' + id + '-pills"></div>'
        + '</div>'
        /* ── 3-element action bar: ← [confirm] → — clear 2-action workflow ── */
        + '<div class="qv-action-bar">'
        + '<button class="qv-nav-btn" id="qv' + id + '-bp" disabled onclick="QuranValidator._prev(' + id + ')" aria-label="Previous occurrence" title="Previous occurrence">←</button>'
        + '<button class="qv-confirm-btn" id="qv' + id + '-bc" onclick="QuranValidator._confirm(' + id + ')">' + confirmLabel + '</button>'
        + '<button class="qv-nav-btn" id="qv' + id + '-bn" onclick="QuranValidator._next(' + id + ')" aria-label="Skip to next occurrence" title="Skip to next occurrence">→</button>'
        + '</div></div>'
        /* content */
        + '<div class="qvcontent" id="qv' + id + '-content">'
        + '<div class="qvpage" id="qv' + id + '-page"></div>'
        /* improvement 5: done screen — built dynamically in _checkDone */
        + '<div class="qvdone" id="qv' + id + '-done">'
        + '<div class="qv-done-flash" id="qv' + id + '-dflash"></div>'
        + '<button class="qv-done-dismiss" onclick="QuranValidator._dismissDone(' + id + ')" aria-label="Close and browse verses" title="Go back to verses">×</button>'
        + '<div class="qv-done-num" id="qv' + id + '-dnum" style="color:#f59e0b">—</div>'
        + '<div class="qv-done-words" id="qv' + id + '-dwords"></div>'
        + '<div class="qv-done-line" id="qv' + id + '-dline"></div>'
        + '<div class="qv-done-actions">'
        + '<a class="qv-done-share" id="qv' + id + '-dshare" href="#" onclick="QuranValidator._share(' + id + ');return false;">Share this verification →</a>'
        + '<button class="qv-done-browse" onclick="QuranValidator._dismissDone(' + id + ')">Browse verified verses ↓</button>'
        + '</div>'
        + '</div></div>'
        /* bottom nav */
        + '<div class="qvnav">'
        + '<button class="qvnavbtn" onclick="QuranValidator._prevPage(' + id + ')">← Prev</button>'
        + '<span class="qvpinfo" id="qv' + id + '-pinfo">—</span>'
        + '<button class="qvnavbtn" onclick="QuranValidator._nextPage(' + id + ')">Next →</button>'
        + '</div>'
        + '</div></div></div>';
      this.el.innerHTML = html;
    },

    /* Toggle open/close */
    onToggle: function(on) {
      var panel = this._q('panel');
      if (on) {
        panel.classList.add('qvopen');
        if (!this.loaded) this._load();
      } else {
        panel.classList.remove('qvopen');
      }
    },

    /* Load Quran data (uses sessionStorage + in-memory cache) */
    _load: function() {
      var self = this;
      if (_dataCache) { self._init(_dataCache); return; }
      try {
        var stored = sessionStorage.getItem('_qvData');
        if (stored) { _dataCache = JSON.parse(stored); self._init(_dataCache); return; }
      } catch(e) {}
      /* determine path: works whether page is at root or in subdir */
      var base = (window.location.pathname.indexOf('/BeQuran/') !== -1 ||
                  window.location.pathname.split('/').pop().indexOf('.html') !== -1)
                 ? '' : '';
      fetch(base + 'book/quran-uthmani.txt')
        .then(function(r){ if(!r.ok) throw new Error('HTTP '+r.status); return r.text(); })
        .then(function(txt){
          var vv = [];
          txt.split('\n').forEach(function(ln){
            ln = ln.trim(); if(!ln) return;
            var p = ln.split('|'); if(p.length < 3) return;
            vv.push({ s:+p[0], a:+p[1], text:p.slice(2).join('|') });
          });
          _dataCache = vv;
          try { sessionStorage.setItem('_qvData', JSON.stringify(vv)); } catch(e){}
          self._init(vv);
        })
        .catch(function(e){
          var ld = self._q('loading');
          if(ld) ld.innerHTML = '<span style="color:#f87171">Could not load Quran: ' + e.message + '</span>';
        });
    },

    /* Initialise / reinitialise after data load */
    _init: function(data) {
      this.allV = data;
      this.totP = Math.ceil(data.length / VPP);
      this.loaded = true;
      this.gIdx = 0;
      this.conf = {};
      this._buildComb();
      var ld = this._q('loading'), em = this._q('embed');
      if(ld) ld.style.display = 'none';
      if(em) em.style.display = 'flex';
      var done = this._q('done');
      if(done) { done.classList.remove('qvvis'); }
      var pg = this._q('page');
      if(pg) pg.style.display = '';
      if(this.comb.length === 0) { this._showEmptyState(); return; }
      var first = this.comb[0];
      this.curP = Math.floor(this._vIdx(first.s, first.a) / VPP);
      this._renderPage(this.curP, null);
      this._updateGuide();
      this._updateProg();
    },

    /* Re-init with new config (for enhanced toggles etc.) */
    reinit: function(newConfig) {
      this.config = newConfig;
      this._buildComb();
      if(this.loaded) {
        this.gIdx = 0;
        this.conf = {};
        var done = this._q('done');
        if(done) done.classList.remove('qvvis');
        var pg = this._q('page');
        if(pg) pg.style.display = '';
        if(this.comb.length === 0) { this._showEmptyState(); return; }
        var first = this.comb[0];
        this.curP = Math.floor(this._vIdx(first.s, first.a) / VPP);
        this._renderPage(this.curP, null);
        this._updateGuide();
        this._updateProg();
      }
    },

    _showEmptyState: function() {
      var pg = this._q('page');
      if(pg) pg.innerHTML = '<div style="padding:20px;text-align:center;color:var(--muted);font-size:13px">No occurrences configured.</div>';
    },

    /* Find verse index in allV */
    _vIdx: function(s, a) {
      for(var i=0; i<this.allV.length; i++)
        if(this.allV[i].s === s && this.allV[i].a === a) return i;
      return 0;
    },

    /* Count confirmed by group id */
    _cnt: function(gid) {
      var n = 0;
      for(var k in this.conf)
        if(this.conf[k] && k.split(':')[2] === gid) n++;
      return n;
    },

    /* Highlight a verse's text — auto-derives match from group.arabic */
    _hlVerse: function(text, s, a) {
      var self = this;
      var gmap = self._groupMap();
      /* find which groups have an occurrence at this verse */
      var activeGroups = self.comb.filter(function(o){ return o.s===s && o.a===a; })
                                   .map(function(o){ return gmap[o.gid]; })
                                   .filter(Boolean);
      if(!activeGroups.length) return esc(text);
      return text.split(' ').map(function(word) {
        for(var i=0; i<activeGroups.length; i++) {
          var g = activeGroups[i];
          var matchFn = makeMatchFn(g.arabic);
          if(matchFn(word)) {
            var key = s+':'+a+':'+g.id;
            var confirmed = self.conf[key] ? ' qvconfirmed' : '';
            /* derive rgba from hex color */
            var bg = hexToRgba(g.color, 0.18);
            var border = hexToRgba(g.color, 0.55);
            var style = 'background:'+bg+';color:'+g.color+';border-bottom:1.5px solid '+border+';';
            return '<span class="qvhl'+confirmed+'" style="'+style+'" '
                 + 'data-inst="'+self.id+'" data-key="'+key+'" '
                 + 'onclick="QuranValidator._click(this)">'
                 + esc(word) + '</span>';
          }
        }
        return esc(word);
      }).join(' ');
    },

    /* Render a page of verses */
    _renderPage: function(pn, dir) {
      var self = this;
      var pg = self._q('page');
      if(!pg) return;
      var start = pn * VPP, end = Math.min(start + VPP, self.allV.length);
      var tgt = self.comb[self.gIdx] || null;
      var prevS = -1, html = '';
      for(var i=start; i<end; i++) {
        var v = self.allV[i];
        if(v.s !== prevS) {
          var name = SN[v.s] || ('Surah ' + v.s);
          html += '<div class="qvshdr"><div class="qvsorn"><div class="qvsorl"></div>'
                + '<div class="qvsord">✦</div><div class="qvsorl"></div></div>'
                + '<div class="qvsar">' + esc(name) + '</div>'
                + '<div class="qvsen">Surah ' + v.s + '</div></div>';
          prevS = v.s;
        }
        var isT = tgt && tgt.s === v.s && tgt.a === v.a;
        var g = isT ? self._groupMap()[tgt.gid] : null;
        /* improvement 2: target verse gets amber radial glow (overrides via CSS !important) */
        var tgtStyle = isT && g ? 'border-left-color:'+g.color+';' : '';
        html += '<div class="qvv' + (isT ? ' qvtgt' : '') + '" '
              + (isT ? 'style="'+tgtStyle+'"' : '') + ' '
              + 'id="qv'+self.id+'-v-'+v.s+'-'+v.a+'">'
              + '<div class="qvvt">' + self._hlVerse(v.text, v.s, v.a) + '</div>'
              + '<div class="qvvn">﴿' + toAr(v.a) + '﴾</div>'
              + '</div>';
      }
      if(dir) {
        pg.style.transform = dir==='f' ? 'translateX(-14px)' : 'translateX(14px)';
        pg.style.opacity = '0';
        var _pn = pn, _self = self;
        setTimeout(function(){
          pg.innerHTML = html;
          _self.curP = _pn;
          pg.style.transition = 'none';
          pg.style.transform = ''; pg.style.opacity = '1';
          setTimeout(function(){ pg.style.transition = ''; }, 20);
          _self._updatePageInfo();
          _self._scrollTgt();
        }, 185);
      } else {
        pg.innerHTML = html;
        self.curP = pn;
        self._updatePageInfo();
        self._scrollTgt();
      }
    },

    /* Scroll only inside the content div — never the main page */
    _scrollTgt: function() {
      var self = this;
      var tgt = self.comb[self.gIdx];
      if(!tgt) return;
      setTimeout(function(){
        var el = self._q('v-' + tgt.s + '-' + tgt.a);
        if(!el) return;
        var content = self._q('content');
        if(!content) return;
        var eRect = el.getBoundingClientRect();
        var cRect = content.getBoundingClientRect();
        var relTop = eRect.top - cRect.top + content.scrollTop;
        var target = relTop - (content.clientHeight / 2) + (el.clientHeight / 2);
        content.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
      }, 80);
    },

    _updatePageInfo: function() {
      var pi = this._q('pinfo');
      if(pi) pi.textContent = 'Page ' + (this.curP + 1) + ' / ' + this.totP;
    },

    /* Update guide badge + info text */
    _updateGuide: function() {
      if(this.gIdx >= this.comb.length) { this._checkDone(); return; }
      var o = this.comb[this.gIdx];
      var g = this._groupMap()[o.gid] || {};
      var badge = this._q('badge');
      if(badge) {
        badge.textContent = g.arabic || '—';
        badge.style.background = hexToRgba(g.color || '#888', 0.15);
        badge.style.borderColor = hexToRgba(g.color || '#888', 0.35);
        badge.style.color = g.color || '#888';
      }
      /* count how many of this group we've passed */
      var groupOccs = this.comb.filter(function(x){ return x.gid === o.gid; });
      var occNum = groupOccs.indexOf(o) + 1;
      var total = groupOccs.length;
      var name = SN[o.s] || ('Surah ' + o.s);
      var mode = this.config.mode || 'count';
      var info = this._q('info'), sub = this._q('sub');
      if(info) info.textContent = (g.label || o.gid) + ' — occurrence ' + occNum + ' of ' + total + ' · ' + name + ' · ' + o.s + ':' + o.a;
      if(sub) sub.textContent = mode === 'locate'
        ? 'Navigate to this verse · tap "I found this verse" to confirm'
        : 'Find the highlighted word · tap "I verified this word" to confirm · use → to skip';
      var bp = this._q('bp'), bc = this._q('bc'), bn = this._q('bn');
      if(bp) bp.disabled = this.gIdx === 0;
      if(bn) bn.disabled = this.gIdx >= this.comb.length - 1;
      if(bc) bc.disabled = !!(this.conf[o.s + ':' + o.a + ':' + o.gid + ':' + (o.idx||0)]);
    },

    /* ── improvement 3: dot arc replaces N/M pill ────────────── */
    _updateProg: function() {
      var self = this;
      var container = self._q('pills');
      if(!container) return;
      var html = '';
      /* build a flat list of all occurrences with their state */
      var gmap = self._groupMap();
      self.comb.forEach(function(o, i) {
        var g = gmap[o.gid] || {};
        var key = o.s + ':' + o.a + ':' + o.gid + ':' + (o.idx||0);
        var isDone = !!(self.conf[key]);
        var isActive = (i === self.gIdx);
        var color = g.color || '#888';
        var cls = isDone ? 'qvd-done' : (isActive ? 'qvd-active' : 'qvd-dim');
        var bgStyle = isDone ? 'background:' + color + ';box-shadow:0 0 5px ' + hexToRgba(color, 0.6) + ';'
                     : (isActive ? '' /* handled by CSS animation */ : '');
        html += '<div class="qv-dot ' + cls + '" style="' + bgStyle + '" title="' + esc((g.label || o.gid) + ' ' + o.s + ':' + o.a) + '"></div>';
      });
      container.innerHTML = html;
    },

    /* Dismiss the completion screen and restore verse view */
    _dismissDone: function() {
      var done = this._q('done');
      if(done) done.classList.remove('qvvis');
      /* scroll back to the verse content */
      var content = this._q('content');
      if(content) content.scrollTo({ top: 0, behavior: 'smooth' });
      /* navigate to last confirmed occurrence so user has context */
      this._scrollTgt();
    },

    /* Navigate to a specific occurrence index */
    _goTo: function(idx) {
      if(idx < 0 || idx >= this.comb.length) return;
      /* Auto-dismiss done screen when user navigates back into verses */
      try { var done = this._q('done'); if(done) done.classList.remove('qvvis'); } catch(e){}
      this.gIdx = idx;
      var o = this.comb[idx];
      var vi = this._vIdx(o.s, o.a);
      var tp = Math.floor(vi / VPP);
      var dir = tp > this.curP ? 'f' : (tp < this.curP ? 'b' : null);
      this._renderPage(tp, dir);
      this._updateGuide();
    },

    next: function()  { if(this.gIdx < this.comb.length - 1) this._goTo(this.gIdx + 1); },
    prev: function()  { if(this.gIdx > 0) this._goTo(this.gIdx - 1); },
    skip: function()  { this.next(); },

    prevPage: function() { if(this.curP > 0) this._renderPage(this.curP - 1, 'b'); },
    nextPage: function() { if(this.curP < this.totP - 1) this._renderPage(this.curP + 1, 'f'); },

    /* ── improvement 4: confirm — flash animation on highlighted word ── */
    confirm: function() {
      var o = this.comb[this.gIdx];
      if(!o) return;
      var key = o.s + ':' + o.a + ':' + o.gid + ':' + (o.idx||0);
      if(this.conf[key]) return;
      /* flash the highlighted word element before confirming */
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
      if(!reduced) {
        var baseKey = o.s + ':' + o.a + ':' + o.gid;
        var hlEl = this._q('content') && this._q('content').querySelector('[data-key="' + baseKey + '"]');
        if(hlEl) {
          hlEl.classList.add('qv-flash');
          /* remove flash class after animation so it can replay next time */
          setTimeout(function(){ hlEl.classList.remove('qv-flash'); }, 520);
        }
      }
      this.conf[key] = true;
      this._updateProg();
      var self = this;
      setTimeout(function(){
        self._renderPage(self.curP, null);
        if(self.gIdx < self.comb.length - 1) {
          setTimeout(function(){ self._goTo(self.gIdx + 1); }, 110);
        } else {
          self._checkDone();
        }
      }, reduced ? 0 : 160);
    },

    handleWordClick: function(el) {
      var o = this.comb[this.gIdx];
      if(!o) return;
      /* match on s:a:gid — idx not in data-key since HTML can't know which duplicate */
      var baseKey = o.s + ':' + o.a + ':' + o.gid;
      if(el.dataset.key === baseKey) this.confirm();
    },

    /* ── improvement 5: cinematic completion screen ──────────── */
    _checkDone: function() {
      var self = this;
      var allConfirmed = self.comb.every(function(o){
        return self.conf[o.s + ':' + o.a + ':' + o.gid + ':' + (o.idx||0)];
      });
      if(!allConfirmed) return;

      var pg = self._q('page'), done = self._q('done');
      /* Keep pg visible — user can dismiss done and return to verses */
      if(done) {
        done.classList.add('qvvis');
        /* Scroll done screen into view within the content container */
        var content = self._q('content');
        if(content) content.scrollTo({ top: 0, behavior: 'smooth' });
      }

      var mode = self.config.mode || 'count';
      var groups = self.config.groups || [];
      var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

      /* golden flash overlay */
      var flashEl = self._q('dflash');
      if(flashEl && !reduced) {
        flashEl.classList.add('qvf-on');
        setTimeout(function(){ flashEl.classList.remove('qvf-on'); }, 700);
      }

      var numEl = self._q('dnum');
      var wordsEl = self._q('dwords');
      var lineEl = self._q('dline');

      if(mode === 'count') {
        if(groups.length >= 2) {
          var c0 = self._cnt(groups[0].id);
          var c1 = self._cnt(groups[1].id);
          var total = c0 + c1;
          var ratio = total > 0 ? (c0 / total * 100).toFixed(1) : '—';

          /* big number = ratio, counting up from 0 */
          if(numEl) {
            numEl.style.color = groups[0].color || '#f59e0b';
            if(reduced) {
              numEl.textContent = ratio + '%';
            } else {
              numEl.textContent = '0.0%';
              var startTs = null;
              var targetRatio = parseFloat(ratio);
              requestAnimationFrame(function animNum(ts) {
                if(!startTs) startTs = ts;
                var p = Math.min((ts - startTs) / 800, 1);
                var eased = 1 - Math.pow(1 - p, 3);
                numEl.textContent = (eased * targetRatio).toFixed(1) + '%';
                if(p < 1) requestAnimationFrame(animNum);
                else numEl.textContent = ratio + '%';
              });
            }
          }

          /* two Arabic words side-by-side with counts */
          if(wordsEl) {
            var wHtml = '';
            groups.forEach(function(g) {
              var ct = self._cnt(g.id);
              wHtml += '<div class="qv-done-word">'
                     + '<span class="qv-done-ar" style="color:' + (g.color || '#f59e0b') + '">' + esc(g.arabic) + '</span>'
                     + '<span class="qv-done-ct">' + ct + ' × ' + esc(g.label) + '</span>'
                     + '</div>';
            });
            wordsEl.innerHTML = wHtml;
          }

          if(lineEl) lineEl.textContent = 'You counted it yourself.';

        } else if(groups.length === 1) {
          var c = self._cnt(groups[0].id);
          if(numEl) {
            numEl.style.color = groups[0].color || '#f59e0b';
            if(reduced) {
              numEl.textContent = String(c);
            } else {
              numEl.textContent = '0';
              var startTs2 = null;
              requestAnimationFrame(function(ts) {
                (function animNum2(ts2) {
                  if(!startTs2) startTs2 = ts2;
                  var p = Math.min((ts2 - startTs2) / 800, 1);
                  var eased2 = 1 - Math.pow(1 - p, 3);
                  numEl.textContent = String(Math.round(eased2 * c));
                  if(p < 1) requestAnimationFrame(animNum2);
                  else numEl.textContent = String(c);
                })(ts);
              });
            }
          }
          if(wordsEl) {
            wordsEl.innerHTML = '<div class="qv-done-word">'
              + '<span class="qv-done-ar" style="color:' + (groups[0].color || '#f59e0b') + '">' + esc(groups[0].arabic) + '</span>'
              + '<span class="qv-done-ct">' + esc(groups[0].label) + '</span>'
              + '</div>';
          }
          if(lineEl) lineEl.textContent = 'You counted it yourself.';
        }
      } else {
        /* locate mode */
        if(numEl) { numEl.style.color = '#22c55e'; numEl.textContent = '✓'; }
        if(wordsEl) wordsEl.innerHTML = '';
        if(lineEl) lineEl.textContent = 'You found it. The verse is real.';
      }
    },

    /* Share verification */
    _share: function() {
      if(typeof window.__qnShare === 'function') {
        window.__qnShare();
        return;
      }
      if(navigator.share) {
        navigator.share({
          title: 'I verified this in the Quran myself',
          url: window.location.href
        }).catch(function(){});
      }
    }
  };

  /* ── hex color utility ────────────────────────────────────── */
  function hexToRgba(hex, alpha) {
    hex = hex.replace('#','');
    if(hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
    var r = parseInt(hex.slice(0,2),16);
    var g = parseInt(hex.slice(2,4),16);
    var b = parseInt(hex.slice(4,6),16);
    return 'rgba('+r+','+g+','+b+','+alpha+')';
  }

  /* ── public API ───────────────────────────────────────────── */
  G.QuranValidator = {
    attach: function(containerId, config) {
      injectCSS();
      var v = new Validator(containerId, config);
      return {
        reinit: function(newConfig) { v.reinit(newConfig); }
      };
    },
    /* delegation targets for generated onclick handlers */
    _toggle:   function(id, on) { _instances[id].onToggle(on); },
    _next:     function(id)     { _instances[id].next(); },
    _prev:     function(id)     { _instances[id].prev(); },
    _skip:     function(id)     { _instances[id].skip(); },
    _confirm:  function(id)     { _instances[id].confirm(); },
    _prevPage: function(id)     { _instances[id].prevPage(); },
    _nextPage: function(id)     { _instances[id].nextPage(); },
    _click:    function(el)     { _instances[+el.dataset.inst].handleWordClick(el); },
    _share:      function(id)   { _instances[id]._share(); },
    _dismissDone:function(id)  { _instances[id]._dismissDone(); }
  };

})(window);
