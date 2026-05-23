/**
 * quran-validator.js — Portable inline Quran word validator
 *
 * Usage:
 *   <div id="qv-here"></div>
 *   <script src="quran-validator.js"></script>
 *   <script>
 *   var v = QuranValidator.attach('qv-here', {
 *     mode: 'count',   // 'count' (ratio + progress) | 'locate' (find the verse)
 *     title: 'Validate it yourself',
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
            .replace(/اا/g,'ا');                     /* double-alef from hamza+alef */
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
  function makeMatchFn(arabic) {
    var target = norm(arabic);
    /* Dual nominative (ان) is the only suffix worth allowing generically —
       e.g. البحران (the two seas) at 35:12. Dual genitive/accus (ين) is
       deliberately excluded to avoid the البحرين false-positive. */
    var dualTarget = target + 'ان';
    return function(token) {
      var t = norm(token);
      if (t === target || t === dualTarget) return true;
      for (var i = 0; i < PREPS.length; i++) {
        var pre = PREPS[i];
        if (t.length > pre.length && t.slice(0, pre.length) === pre) {
          var rest = t.slice(pre.length);
          if (rest === target || rest === dualTarget) return true;
        }
      }
      return false;
    };
  }

  /* ── CSS (injected once) ──────────────────────────────────── */
  var CSS = [
    /* section wrapper + toggle */
    '.qvsec{border-top:1px solid var(--border);padding-top:22px;margin-bottom:28px;}',
    '.qvrow{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;}',
    '.qvinfo h4{font-size:14px;font-weight:500;color:var(--text);margin-bottom:3px;}',
    '.qvinfo p{font-size:12px;color:var(--muted);}',
    '.qvsw{position:relative;width:44px;height:24px;flex-shrink:0;}',
    '.qvsw input{opacity:0;width:0;height:0;position:absolute;}',
    '.qvtr{position:absolute;inset:0;border-radius:12px;background:var(--surface2);border:1px solid var(--border);cursor:pointer;transition:background .25s,border-color .25s;}',
    '.qvsw input:checked+.qvtr{background:#1a5f8a;border-color:var(--accent);}',
    '.qvth{position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:var(--muted);pointer-events:none;transition:transform .25s,background .25s;}',
    '.qvsw input:checked~.qvth{transform:translateX(20px);background:var(--accent-light);}',
    /* panel */
    '.qvpanel{display:none;animation:qvrise .3s ease;}',
    '.qvpanel.qvopen{display:block;}',
    '@keyframes qvrise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}',
    /* loading */
    '.qvload{display:flex;align-items:center;gap:10px;padding:20px;justify-content:center;background:var(--surface);border-radius:10px;font-size:13px;color:var(--muted);}',
    '.qvspin{width:18px;height:18px;border-radius:50%;border:2px solid var(--surface2);border-top-color:var(--accent);animation:qvspin .8s linear infinite;flex-shrink:0;}',
    '@keyframes qvspin{to{transform:rotate(360deg)}}',
    /* embed card */
    '.qvembed{border:1px solid var(--border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;height:500px;background:var(--bg);}',
    /* guide */
    '.qvguide{flex-shrink:0;background:var(--surface2);border-bottom:1px solid var(--border);padding:10px 14px;}',
    '.qvgr1{display:flex;align-items:center;gap:8px;margin-bottom:8px;}',
    '.qvbadge{font-family:"Amiri",serif;font-size:18px;font-weight:700;padding:2px 9px;border-radius:5px;direction:rtl;flex-shrink:0;line-height:1.5;border:1px solid transparent;}',
    '.qvgi{font-size:13px;color:var(--text);flex:1;line-height:1.35;}',
    '.qvgs{font-size:11px;color:var(--muted);margin-top:2px;}',
    '.qvpills{display:flex;gap:5px;flex-shrink:0;}',
    '.qvpill{font-size:10px;font-weight:700;padding:3px 7px;border-radius:100px;border:1px solid transparent;}',
    '.qvgr2{display:grid;grid-template-columns:1fr 1.4fr 1fr 1fr;gap:7px;}',
    '.qvbtn{height:40px;border-radius:7px;border:none;font-family:"DM Sans",sans-serif;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;touch-action:manipulation;}',
    '.qvbtn.prev,.qvbtn.next,.qvbtn.skip{background:var(--surface);border:1px solid var(--border);color:var(--muted);}',
    '.qvbtn.prev:hover,.qvbtn.next:hover{border-color:rgba(255,255,255,.2);color:var(--text);}',
    '.qvbtn.confirm{background:var(--ok);color:var(--ok-bg);font-weight:700;}',
    '.qvbtn.confirm:hover{filter:brightness(1.1);}',
    '.qvbtn.confirm:disabled{opacity:.4;cursor:default;filter:none;}',
    '.qvbtn:active{transform:scale(.96);}',
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
    /* verse */
    '.qvv{display:flex;align-items:baseline;gap:7px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);}',
    '.qvv:last-child{border-bottom:none;}',
    '.qvvt{flex:1;font-family:"Amiri",serif;direction:rtl;text-align:right;font-size:clamp(15px,3.6vw,18px);line-height:2.1;color:var(--text);word-break:break-word;}',
    '.qvvn{font-family:"Amiri",serif;font-size:11px;color:var(--muted);flex-shrink:0;direction:rtl;opacity:.6;}',
    '.qvv.qvtgt{border-radius:5px;padding:5px 7px;border-left:2px solid transparent;animation:qvpulse 2s ease infinite;}',
    '@keyframes qvpulse{0%,100%{opacity:.6}50%{opacity:1}}',
    /* word highlights */
    '.qvhl{border-radius:3px;padding:1px 2px;cursor:pointer;transition:filter .12s;}',
    '.qvhl:hover{filter:brightness(1.35);}',
    '.qvhl.qvconfirmed{opacity:.45;}',
    '.qvhl.qvconfirmed::after{content:" ✓";font-size:9px;color:var(--ok);font-family:"DM Sans",sans-serif;}',
    /* done */
    '.qvdone{display:none;flex-direction:column;align-items:center;padding:22px 14px;gap:11px;text-align:center;}',
    '.qvdone.qvvis{display:flex;}',
    '.qvdonebox{background:var(--surface);border:1px solid rgba(14,165,233,.26);border-radius:10px;padding:16px;width:100%;max-width:300px;}',
    '.qvdoneeq{font-size:22px;font-weight:700;margin-bottom:6px;}',
    '.qvdonesub{font-size:12px;color:var(--muted);line-height:1.7;}',
    '.qvdoneok{font-size:13px;color:var(--ok);font-weight:600;}',
    /* light mode */
    'html[data-theme="light"] .qvvt{color:#1c2b3a;}',
    'html[data-theme="light"] .qvsar{color:#92400e;}'
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

    /* Inject the toggle + panel shell HTML */
    _renderShell: function() {
      var id = this.id;
      var cfg = this.config;
      var mode = cfg.mode || 'count';
      var confirmLabel = mode === 'locate' ? '✓ Found it' : '✓ Confirm';
      var html = '<div class="qvsec">'
        + '<div class="qvrow">'
        + '<div class="qvinfo"><h4>' + esc(cfg.title || 'Validate it yourself') + '</h4>'
        + '<p>' + esc(cfg.subtitle || 'Count the words in the actual Quran') + '</p></div>'
        + '<label class="qvsw">'
        + '<input type="checkbox" id="qv' + id + '-toggle" onchange="QuranValidator._toggle(' + id + ',this.checked)">'
        + '<div class="qvtr"></div><div class="qvth"></div>'
        + '</label>'
        + '</div>'
        + '<div class="qvpanel" id="qv' + id + '-panel">'
        + '<div class="qvload" id="qv' + id + '-loading"><div class="qvspin"></div>Loading Quran…</div>'
        + '<div class="qvembed" id="qv' + id + '-embed" style="display:none">'
        /* guide */
        + '<div class="qvguide"><div class="qvgr1">'
        + '<span class="qvbadge" id="qv' + id + '-badge">…</span>'
        + '<div style="flex:1"><div class="qvgi" id="qv' + id + '-info">—</div>'
        + '<div class="qvgs" id="qv' + id + '-sub">—</div></div>'
        + '<div class="qvpills" id="qv' + id + '-pills"></div>'
        + '</div>'
        + '<div class="qvgr2">'
        + '<button class="qvbtn prev" id="qv' + id + '-bp" disabled onclick="QuranValidator._prev(' + id + ')">← Prev</button>'
        + '<button class="qvbtn confirm" id="qv' + id + '-bc" onclick="QuranValidator._confirm(' + id + ')">' + confirmLabel + '</button>'
        + '<button class="qvbtn skip" onclick="QuranValidator._skip(' + id + ')">Skip</button>'
        + '<button class="qvbtn next" onclick="QuranValidator._next(' + id + ')">Next →</button>'
        + '</div></div>'
        /* content */
        + '<div class="qvcontent" id="qv' + id + '-content">'
        + '<div class="qvpage" id="qv' + id + '-page"></div>'
        + '<div class="qvdone" id="qv' + id + '-done">'
        + '<div style="font-size:28px;color:#fcd34d">✦</div>'
        + '<div style="font-family:\'Playfair Display\',serif;color:#fcd34d;font-size:20px">' + (mode === 'locate' ? 'Found!' : 'Verified!') + '</div>'
        + '<div class="qvdonebox"><div class="qvdoneeq" id="qv' + id + '-deq" style="color:var(--accent-light)">—</div>'
        + '<div class="qvdonesub" id="qv' + id + '-dsub"></div></div>'
        + '<div class="qvdoneok">You verified this yourself.</div>'
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
        var tgtStyle = isT && g ? 'border-left-color:'+g.color+';background:'+hexToRgba(g.color,0.06)+';' : '';
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
      if(sub) sub.textContent = mode === 'locate' ? 'Navigate to this verse and tap Found it' : 'Find the highlighted word and tap Confirm';
      var bp = this._q('bp'), bc = this._q('bc');
      if(bp) bp.disabled = this.gIdx === 0;
      if(bc) bc.disabled = !!(this.conf[o.s + ':' + o.a + ':' + o.gid + ':' + (o.idx||0)]);
    },

    /* Update pills showing confirmed counts */
    _updateProg: function() {
      var self = this;
      var pills = self._q('pills');
      if(!pills) return;
      var html = '';
      (self.config.groups || []).forEach(function(g) {
        var total = g.occurrences ? g.occurrences.length : 0;
        var done = self._cnt(g.id);
        var bg = hexToRgba(g.color || '#888', 0.12);
        var bdr = hexToRgba(g.color || '#888', 0.28);
        html += '<span class="qvpill" style="background:'+bg+';border-color:'+bdr+';color:'+(g.color||'#888')+'">'
              + done + '/' + total + '</span>';
      });
      pills.innerHTML = html;
    },

    /* Navigate to a specific occurrence index */
    _goTo: function(idx) {
      if(idx < 0 || idx >= this.comb.length) return;
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

    confirm: function() {
      var o = this.comb[this.gIdx];
      if(!o) return;
      var key = o.s + ':' + o.a + ':' + o.gid + ':' + (o.idx||0);
      if(this.conf[key]) return;
      this.conf[key] = true;
      this._updateProg();
      this._renderPage(this.curP, null);
      var self = this;
      if(this.gIdx < this.comb.length - 1) {
        setTimeout(function(){ self._goTo(self.gIdx + 1); }, 110);
      } else {
        this._checkDone();
      }
    },

    handleWordClick: function(el) {
      var o = this.comb[this.gIdx];
      if(!o) return;
      /* match on s:a:gid — idx not in data-key since HTML can't know which duplicate */
      var baseKey = o.s + ':' + o.a + ':' + o.gid;
      if(el.dataset.key === baseKey) this.confirm();
    },

    _checkDone: function() {
      var self = this;
      var allConfirmed = self.comb.every(function(o){
        return self.conf[o.s + ':' + o.a + ':' + o.gid + ':' + (o.idx||0)];
      });
      if(!allConfirmed) return;
      /* build done screen */
      var deq = self._q('deq'), dsub = self._q('dsub');
      var mode = self.config.mode || 'count';
      if(mode === 'count') {
        /* compute ratio from first two groups */
        var groups = self.config.groups || [];
        if(groups.length >= 2) {
          var c0 = self._cnt(groups[0].id);
          var c1 = self._cnt(groups[1].id);
          var total = c0 + c1;
          var ratio = total > 0 ? (c0 / total * 100).toFixed(1) : '—';
          if(deq) {
            deq.textContent = c0 + ' ÷ ' + total + ' = ' + ratio + '%';
            deq.style.color = groups[0].color || 'var(--accent-light)';
          }
          var subLines = groups.map(function(g){ return g.arabic + ' (' + g.label + '): ' + self._cnt(g.id); }).join(' · ');
          if(self.config.claimedRatio) subLines += '\nClaimed ratio: ' + self.config.claimedRatio;
          if(dsub) dsub.textContent = subLines;
        } else if(groups.length === 1) {
          var c = self._cnt(groups[0].id);
          if(deq) { deq.textContent = c + ' occurrences confirmed'; deq.style.color = groups[0].color || 'var(--accent-light)'; }
          if(dsub) dsub.textContent = groups[0].arabic + ' (' + groups[0].label + ')';
        }
      } else {
        /* locate mode */
        if(deq) { deq.textContent = 'Verse located'; deq.style.color = 'var(--ok)'; }
        if(dsub) dsub.textContent = 'You found the verse in the Quran.';
      }
      var pg = self._q('page'), done = self._q('done');
      if(pg) pg.style.display = 'none';
      if(done) done.classList.add('qvvis');
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
    _click:    function(el)     { _instances[+el.dataset.inst].handleWordClick(el); }
  };

})(window);
