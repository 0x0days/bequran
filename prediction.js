/**
 * prediction.js - Prediction-Violation-Curiosity Loop engine
 * 8 input types: slider, choice, number-pad, dial, timeline, split, thermometer, magnitude, binary-chain, card-flip
 */
(function(G) {
  'use strict';
  var cfg = null, STORE_KEY = null;
  var _drag = {}; /* shared drag/interaction state */

  /* ─────────────────────────────────────────────────────────────
     CSS - injected once into <head>
  ───────────────────────────────────────────────────────────── */
  var CSS = [
    /* Wrap card */
    '.predict-wrap{background:var(--surface);border:1px solid color-mix(in srgb,var(--accent,var(--gold)) 22%,transparent);border-radius:16px;padding:28px 24px 24px;position:relative;}',
    '.predict-eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent,var(--gold));font-weight:600;margin-bottom:14px;}',
    '.predict-q{font-family:"Playfair Display",serif;font-size:clamp(17px,4vw,22px);line-height:1.5;margin-bottom:18px;color:var(--text);}',
    '.predict-hint{font-size:12px;color:var(--muted);margin-bottom:8px;letter-spacing:.04em;line-height:1.6;}',
    '.predict-social{font-size:11px;color:var(--accent,var(--gold));font-style:italic;opacity:0.8;margin-bottom:20px;letter-spacing:.02em;line-height:1.5;}',

    /* ── SLIDER ── */
    '.predict-slider-wrap{margin-bottom:20px;}',
    '.predict-slider{width:100%;-webkit-appearance:none;appearance:none;height:8px;border-radius:100px;background:var(--surface2);outline:none;cursor:pointer;}',
    '.predict-slider::-webkit-slider-thumb{-webkit-appearance:none;width:28px;height:28px;border-radius:50%;background:var(--accent,var(--gold));cursor:pointer;border:3px solid var(--bg);box-shadow:0 0 14px color-mix(in srgb,var(--accent,var(--gold)) 55%,transparent);}',
    '.predict-slider::-moz-range-thumb{width:28px;height:28px;border-radius:50%;background:var(--accent,var(--gold));cursor:grab;border:3px solid var(--bg);box-shadow:0 0 14px color-mix(in srgb,var(--accent,var(--gold)) 55%,transparent);}',
    '.predict-val{font-family:"Playfair Display",serif;font-size:clamp(42px,10vw,64px);font-weight:700;color:var(--accent,var(--gold));text-align:center;margin-bottom:4px;line-height:1;text-shadow:0 0 40px color-mix(in srgb,var(--accent,var(--gold)) 35%,transparent);}',
    '.predict-val-unit{font-size:12px;color:var(--muted);text-align:center;margin-bottom:14px;letter-spacing:.08em;text-transform:uppercase;}',
    '.predict-range-row{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-top:8px;}',

    /* ── CHOICE ── */
    '.predict-choices{display:flex;flex-direction:column;gap:10px;margin-bottom:24px;}',
    '.predict-choice{background:var(--surface2);border:2px solid color-mix(in srgb,var(--accent,var(--gold)) 15%,transparent);border-radius:12px;padding:14px 18px;font-size:15px;font-weight:600;color:var(--text);cursor:pointer;transition:border-color .15s,background .15s;text-align:left;font-family:"DM Sans",sans-serif;-webkit-tap-highlight-color:transparent;}',
    '.predict-choice:hover{border-color:color-mix(in srgb,var(--accent,var(--gold)) 5%,transparent);background:color-mix(in srgb,var(--accent,var(--gold)) 6%,transparent);}',
    '.predict-choice.selected{border-color:var(--accent,var(--gold));background:color-mix(in srgb,var(--accent,var(--gold)) 11%,transparent);}',

    /* ── NUMBER PAD ── */
    '.pd-np{display:flex;flex-direction:column;gap:14px;margin-bottom:20px;}',
    '.pd-npd{background:var(--surface2);border:1.5px solid color-mix(in srgb,var(--accent,var(--gold)) 15%,transparent);border-radius:12px;padding:14px 20px;text-align:center;min-height:78px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative;overflow:hidden;transition:border-color .25s,box-shadow .25s;}',
    '.pd-npd.lit{border-color:color-mix(in srgb,var(--accent,var(--gold)) 5%,transparent);box-shadow:0 0 28px color-mix(in srgb,var(--accent,var(--gold)) 1%,transparent),inset 0 0 28px color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent);}',
    '.pd-npd::before{content:"";position:absolute;inset:0;background:radial-gradient(ellipse at 50% -20%,color-mix(in srgb,var(--accent,var(--gold)) 8%,transparent),transparent 65%);pointer-events:none;}',
    '.pd-npv{font-family:"Playfair Display",serif;font-size:clamp(32px,8vw,50px);font-weight:700;line-height:1;color:var(--accent,var(--gold));text-shadow:0 0 30px color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent);letter-spacing:.02em;}',
    '.pd-npv.empty{color:var(--muted);font-size:clamp(20px,5vw,28px);text-shadow:none;font-style:italic;font-family:"DM Sans",sans-serif;font-weight:400;}',
    '.pd-npu{font-size:11px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-top:5px;}',
    '.pd-npkeys{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;}',
    '.pd-npk{height:52px;background:var(--surface2);border:1px solid rgba(255,255,255,0.06);border-bottom:2px solid rgba(0,0,0,0.25);border-radius:10px;color:var(--text);font-family:"DM Sans",sans-serif;font-size:19px;font-weight:600;cursor:pointer;transition:all .1s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;position:relative;overflow:hidden;}',
    '.pd-npk::after{content:"";position:absolute;inset:0;background:radial-gradient(circle at var(--rx,50%) var(--ry,50%),color-mix(in srgb,var(--accent,var(--gold)) 18%,transparent),transparent 60%);opacity:0;transition:opacity .3s;}',
    '.pd-npk:active{transform:scale(0.93);border-color:color-mix(in srgb,var(--accent,var(--gold)) 5%,transparent);color:var(--accent,var(--gold));}',
    '.pd-npk:active::after{opacity:1;}',
    '.pd-npk.sm{font-size:13px;letter-spacing:.04em;color:var(--muted);}',

    /* ── DIAL ── */
    '.pd-dial{display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:20px;user-select:none;}',
    '.pd-dial svg{width:min(260px,100%);height:auto;cursor:grab;filter:drop-shadow(0 4px 24px color-mix(in srgb,var(--accent,var(--gold)) 12%,transparent));}',
    '.pd-dial svg:active{cursor:grabbing;}',
    '.pd-dial-hint{font-size:11px;color:var(--muted);letter-spacing:.07em;text-align:center;}',
    '@keyframes pdDialPulse{0%,100%{opacity:.7}50%{opacity:1}}',

    /* ── TIMELINE ── */
    '.pd-tl{margin-bottom:20px;user-select:none;}',
    '.pd-tl-ends{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:26px;letter-spacing:.06em;}',
    '.pd-tl-stage{position:relative;height:64px;touch-action:none;}',
    '.pd-tl-track{position:absolute;top:50%;left:16px;right:16px;height:4px;background:color-mix(in srgb,var(--accent,var(--gold)) 1%,transparent);border-radius:2px;transform:translateY(-50%);}',
    '.pd-tl-fill{position:absolute;left:0;top:0;height:100%;background:linear-gradient(90deg,color-mix(in srgb,var(--accent,var(--gold)) 3%,transparent),var(--accent,var(--gold)));border-radius:2px;pointer-events:none;}',
    '.pd-tl-pin{position:absolute;top:50%;width:28px;height:28px;background:var(--accent,var(--gold));border-radius:50%;transform:translate(-50%,-50%);box-shadow:0 0 0 5px color-mix(in srgb,var(--accent,var(--gold)) 18%,transparent),0 0 20px color-mix(in srgb,var(--accent,var(--gold)) 5%,transparent);cursor:grab;transition:box-shadow .15s;}',
    '.pd-tl-pin.dragging{cursor:grabbing;box-shadow:0 0 0 10px color-mix(in srgb,var(--accent,var(--gold)) 12%,transparent),0 0 32px color-mix(in srgb,var(--accent,var(--gold)) 65%,transparent);}',
    '.pd-tl-label{position:absolute;bottom:calc(50% + 20px);transform:translateX(-50%);font-family:"Playfair Display",serif;font-size:clamp(17px,4vw,22px);font-weight:700;color:var(--accent,var(--gold));white-space:nowrap;pointer-events:none;text-shadow:0 0 20px color-mix(in srgb,var(--accent,var(--gold)) 35%,transparent);}',

    /* ── SPLIT ── */
    '.pd-split{margin-bottom:20px;user-select:none;}',
    '.pd-split-stage{position:relative;height:110px;border-radius:12px;overflow:hidden;cursor:ew-resize;touch-action:none;border:1px solid var(--border);}',
    '.pd-split-l,.pd-split-r{position:absolute;top:0;bottom:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;pointer-events:none;}',
    '.pd-split-pct{font-family:"Playfair Display",serif;font-size:clamp(22px,6vw,32px);font-weight:700;line-height:1;}',
    '.pd-split-lbl{font-size:11px;letter-spacing:.08em;text-transform:uppercase;opacity:.8;}',
    '.pd-split-div{position:absolute;top:0;bottom:0;width:2px;transform:translateX(-50%);background:var(--bg);box-shadow:0 0 0 1px color-mix(in srgb,var(--accent,var(--gold)) 6%,transparent),0 0 14px color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent);z-index:3;pointer-events:none;}',
    '.pd-split-div::after{content:"";position:absolute;top:50%;left:50%;width:14px;height:36px;background:var(--accent,var(--gold));border-radius:7px;transform:translate(-50%,-50%);box-shadow:0 0 12px color-mix(in srgb,var(--accent,var(--gold)) 5%,transparent);}',
    '.pd-split-hint{font-size:11px;color:var(--muted);text-align:center;margin-top:10px;letter-spacing:.05em;}',

    /* ── THERMOMETER ── */
    '.pd-therm{display:flex;align-items:flex-end;justify-content:center;gap:20px;margin-bottom:20px;user-select:none;}',
    '.pd-therm-side{display:flex;flex-direction:column;align-items:center;gap:6px;min-width:80px;}',
    '.pd-therm-bigval{font-family:"Playfair Display",serif;font-size:clamp(26px,6vw,38px);font-weight:700;color:var(--accent,var(--gold));text-shadow:0 0 24px color-mix(in srgb,var(--accent,var(--gold)) 35%,transparent);line-height:1;text-align:center;}',
    '.pd-therm-unit{font-size:11px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;text-align:center;}',
    '.pd-therm-hint{font-size:10px;color:var(--muted);letter-spacing:.06em;margin-top:4px;text-align:center;}',
    '.pd-therm-body{display:flex;align-items:flex-end;gap:12px;touch-action:none;cursor:ns-resize;padding:0 8px;}',
    '.pd-therm-tube{width:18px;height:200px;background:var(--surface2);border-radius:9px;border:1px solid rgba(255,255,255,0.07);position:relative;overflow:hidden;flex-shrink:0;}',
    '.pd-therm-fill{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(0deg,var(--accent,var(--gold)),color-mix(in srgb,var(--accent,var(--gold)) 5%,transparent));border-radius:9px;transition:height .04s linear;}',
    '.pd-therm-bulb{width:30px;height:30px;background:var(--accent,var(--gold));border-radius:50%;flex-shrink:0;margin-bottom:-6px;box-shadow:0 0 18px color-mix(in srgb,var(--accent,var(--gold)) 55%,transparent);}',
    '.pd-therm-scale{display:flex;flex-direction:column;justify-content:space-between;height:200px;padding:4px 0;}',
    '.pd-therm-tick{font-size:10px;color:var(--muted);white-space:nowrap;line-height:1;}',
    '.pd-therm-tick.hi{color:var(--text);font-weight:600;}',

    /* ── MAGNITUDE ── */
    '.pd-mag{margin-bottom:20px;}',
    '.pd-mag-eyebrow{font-size:10px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;}',
    '.pd-mag-items{display:flex;flex-direction:column;gap:7px;}',
    '.pd-mag-item{display:flex;align-items:center;gap:14px;background:var(--surface2);border:2px solid color-mix(in srgb,var(--accent,var(--gold)) 1%,transparent);border-radius:11px;padding:13px 15px;cursor:pointer;transition:all .15s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}',
    '.pd-mag-item:hover{border-color:color-mix(in srgb,var(--accent,var(--gold)) 38%,transparent);background:color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent);}',
    '.pd-mag-item.sel{border-color:var(--accent,var(--gold));background:color-mix(in srgb,var(--accent,var(--gold)) 9%,transparent);}',
    '.pd-mag-pow{font-family:"Playfair Display",serif;font-size:20px;font-weight:700;color:var(--muted);min-width:36px;text-align:center;transition:color .15s;}',
    '.pd-mag-item.sel .pd-mag-pow{color:var(--accent,var(--gold));}',
    '.pd-mag-text{flex:1;}',
    '.pd-mag-range{font-size:14px;font-weight:600;color:var(--text);}',
    '.pd-mag-sub{font-size:11px;color:var(--muted);margin-top:2px;}',
    '.pd-mag-dot{width:7px;height:7px;border-radius:50%;background:var(--accent,var(--gold));opacity:0;transition:opacity .2s;flex-shrink:0;}',
    '.pd-mag-item.sel .pd-mag-dot{opacity:1;}',

    /* ── BINARY CHAIN ── */
    '.pd-bc{margin-bottom:20px;}',
    '.pd-bc-bar{height:8px;background:var(--surface2);border-radius:4px;position:relative;overflow:hidden;margin-bottom:8px;}',
    '.pd-bc-band{position:absolute;top:0;height:100%;background:linear-gradient(90deg,color-mix(in srgb,var(--accent,var(--gold)) 45%,transparent),var(--accent,var(--gold)));border-radius:4px;transition:left .4s cubic-bezier(.4,0,.2,1),width .4s cubic-bezier(.4,0,.2,1);}',
    '.pd-bc-range{font-size:11px;color:var(--accent,var(--gold));text-align:center;margin-bottom:18px;letter-spacing:.06em;font-weight:600;}',
    '.pd-bc-steps{display:flex;flex-direction:column;gap:8px;}',
    '.pd-bc-step{display:flex;align-items:center;gap:10px;background:var(--surface2);border:1.5px solid transparent;border-radius:10px;padding:12px 14px;opacity:.35;transition:opacity .25s,border-color .25s;}',
    '.pd-bc-step.active{opacity:1;border-color:color-mix(in srgb,var(--accent,var(--gold)) 3%,transparent);}',
    '.pd-bc-step.done{opacity:.55;}',
    '.pd-bc-num{width:22px;height:22px;border-radius:50%;background:color-mix(in srgb,var(--accent,var(--gold)) 15%,transparent);color:var(--accent,var(--gold));font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '.pd-bc-step.done .pd-bc-num{background:color-mix(in srgb,var(--accent,var(--gold)) 25%,transparent);}',
    '.pd-bc-q{flex:1;font-size:13px;color:var(--text);line-height:1.4;}',
    '.pd-bc-btns{display:flex;gap:7px;flex-shrink:0;}',
    '.pd-bc-btn{padding:11px 16px;min-height:44px;border-radius:7px;border:1.5px solid color-mix(in srgb,var(--accent,var(--gold)) 25%,transparent);background:var(--surface);color:var(--muted);font-size:12px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;transition:all .12s;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}',
    '.pd-bc-btn:hover{border-color:var(--accent,var(--gold));color:var(--text);}',
    '.pd-bc-btn.picked{border-color:var(--accent,var(--gold));background:color-mix(in srgb,var(--accent,var(--gold)) 14%,transparent);color:var(--accent,var(--gold));}',
    '.pd-bc-commit{margin-top:16px;text-align:center;font-size:13px;color:var(--muted);}',
    '.pd-bc-commit b{font-family:"Playfair Display",serif;font-size:26px;font-weight:700;color:var(--accent,var(--gold));display:block;text-shadow:0 0 24px color-mix(in srgb,var(--accent,var(--gold)) 35%,transparent);}',

    /* ── CARD FLIP ── */
    '.pd-cards{display:flex;gap:12px;justify-content:center;margin-bottom:24px;perspective:1000px;}',
    '.pd-card{flex:1;max-width:140px;height:118px;cursor:pointer;-webkit-tap-highlight-color:transparent;touch-action:manipulation;}',
    '.pd-card-i{width:100%;height:100%;position:relative;transform-style:preserve-3d;transition:transform .5s cubic-bezier(.34,1.26,.64,1);}',
    '.pd-card.flip .pd-card-i{transform:rotateY(180deg);}',
    '.pd-card-f,.pd-card-b{position:absolute;inset:0;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;backface-visibility:hidden;-webkit-backface-visibility:hidden;border:2px solid color-mix(in srgb,var(--accent,var(--gold)) 18%,transparent);transition:border-color .18s,box-shadow .18s;}',
    '.pd-card-f{background:var(--surface2);}',
    /* Islamic diagonal grid on front */
    '.pd-card-f::before{content:"";position:absolute;inset:0;border-radius:10px;background:repeating-linear-gradient(45deg,color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent) 0,color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent) 1px,transparent 1px,transparent 11px),repeating-linear-gradient(-45deg,color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent) 0,color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent) 1px,transparent 1px,transparent 11px);pointer-events:none;}',
    '.pd-card-b{background:var(--surface2);transform:rotateY(180deg);}',
    '.pd-card.sel .pd-card-f,.pd-card.sel .pd-card-b{border-color:var(--accent,var(--gold));box-shadow:0 0 0 3px color-mix(in srgb,var(--accent,var(--gold)) 2%,transparent),0 0 22px color-mix(in srgb,var(--accent,var(--gold)) 28%,transparent);}',
    '.pd-card.faded{opacity:.38;}',
    '.pd-card-q{font-family:"Playfair Display",serif;font-size:30px;color:color-mix(in srgb,var(--accent,var(--gold)) 35%,transparent);line-height:1;}',
    '.pd-card-qtip{font-size:9px;color:var(--muted);letter-spacing:.1em;text-transform:uppercase;margin-top:5px;}',
    '.pd-card-num{font-family:"Playfair Display",serif;font-size:clamp(26px,7vw,36px);font-weight:700;color:var(--accent,var(--gold));text-shadow:0 0 22px color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent);line-height:1;}',
    '.pd-card-unit{font-size:10px;color:var(--muted);letter-spacing:.09em;text-transform:uppercase;margin-top:5px;}',

    /* ── SUBMIT ── */
    '.predict-submit{width:100%;padding:15px;border-radius:10px;border:none;font-family:"DM Sans",sans-serif;font-size:15px;font-weight:700;cursor:pointer;background:var(--accent,var(--gold));color:#100900;transition:filter .15s,box-shadow .15s;margin-top:4px;box-shadow:0 4px 20px color-mix(in srgb,var(--accent,var(--gold)) 3%,transparent);}',
    '.predict-submit:hover{filter:brightness(1.08);box-shadow:0 6px 28px color-mix(in srgb,var(--accent,var(--gold)) 4%,transparent);}',
    '.predict-submit:disabled{opacity:.32;cursor:default;filter:none;box-shadow:none;}',

    /* ── REVEAL ── */
    '.predict-reveal{background:var(--surface);border:1px solid color-mix(in srgb,var(--accent,var(--gold)) 22%,transparent);border-radius:14px;padding:20px;margin-bottom:24px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;}',
    '.pr-block{text-align:center;flex:1;min-width:72px;}',
    '.pr-label{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:6px;}',
    '.pr-num{font-family:"Playfair Display",serif;font-size:clamp(22px,5vw,34px);font-weight:700;line-height:1;}',
    '.pr-num.yours{color:var(--muted);}',
    '.pr-num.actual{color:var(--accent,var(--gold));}',
    '.pr-vs{font-size:18px;color:var(--muted);flex-shrink:0;}',
    '.pr-gap{flex:1;min-width:72px;text-align:center;}',
    '.pr-gap-num{font-family:"Playfair Display",serif;font-size:clamp(16px,4vw,24px);font-weight:700;color:var(--accent,var(--gold));}',
    '.pr-gap-lbl{font-size:10px;color:var(--muted);letter-spacing:.08em;text-transform:uppercase;margin-top:4px;}',
    '.pr-reaction{font-size:14px;line-height:1.75;color:var(--muted);margin:16px 0 20px;text-align:center;font-style:italic;border-top:1px solid var(--border);padding-top:16px;}',
    '.pr-continue{display:block;width:100%;padding:15px;border-radius:10px;border:none;font-family:"DM Sans",sans-serif;font-size:15px;font-weight:700;cursor:pointer;background:var(--accent,var(--gold));color:#100900;margin-top:4px;transition:filter .15s,box-shadow .15s;box-shadow:0 4px 20px color-mix(in srgb,var(--accent,var(--gold)) 3%,transparent);}',
    '.pr-continue:hover{filter:brightness(1.08);}',

    /* ── CURIOSITY SEED ── */
    '.curiosity-seed{background:var(--surface);border:1px solid color-mix(in srgb,var(--accent,var(--gold)) 22%,transparent);border-left:3px solid var(--accent,var(--gold));border-radius:10px;padding:20px 22px;margin:28px 0 8px;}',
    '.cs-eyebrow{font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent,var(--gold));margin-bottom:10px;font-weight:700;}',
    '.cs-question{font-size:15px;font-weight:600;color:var(--text);margin-bottom:16px;line-height:1.5;}',
    '.cs-choices{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px;}',
    '.cs-btn{padding:9px 16px;border-radius:8px;border:1px solid color-mix(in srgb,var(--accent,var(--gold)) 3%,transparent);background:var(--surface2);color:var(--text);font-size:13px;font-weight:600;cursor:pointer;font-family:"DM Sans",sans-serif;transition:all .15s;}',
    '.cs-btn:hover{border-color:var(--accent,var(--gold));background:color-mix(in srgb,var(--accent,var(--gold)) 1%,transparent);}',
    '.cs-next-link{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--accent,var(--gold));text-decoration:none;font-weight:500;}',
    '.cs-next-link:hover{opacity:.8;}',

    /* ── LANDING MODE ── */
    '#s0.pred-landing>*:not(#predictReveal){display:none!important;}',
    '#s0.pred-landing{animation:none;}',

    /* ── SCALE BALANCE ── */
    '.pd-bal{margin:8px 0 4px;}',
    '.pd-bal-scene{position:relative;height:178px;margin-bottom:14px;}',
    '.pd-bal-post{position:absolute;left:50%;top:36px;width:5px;height:118px;margin-left:-2.5px;background:linear-gradient(var(--accent,#f59e0b),rgba(122,143,163,0.3));border-radius:3px;}',
    '.pd-bal-base{position:absolute;left:50%;bottom:4px;width:128px;height:9px;margin-left:-64px;background:rgba(122,143,163,0.32);border-radius:5px;}',
    '.pd-bal-beam{position:absolute;left:13%;right:13%;top:34px;height:0;transform-origin:50% 50%;transition:transform .2s cubic-bezier(.34,1.3,.5,1);}',
    '.pd-bal-arm{position:absolute;left:0;right:0;top:-3px;height:6px;border-radius:4px;background:linear-gradient(90deg,var(--accent,#f59e0b),var(--accent-light,#fcd34d));box-shadow:0 0 14px rgba(245,158,11,.45);}',
    '.pd-bal-arm:before{content:"";position:absolute;left:50%;top:-5px;width:14px;height:14px;margin-left:-7px;border-radius:50%;background:var(--accent-light,#fcd34d);box-shadow:0 0 10px rgba(245,158,11,.6);}',
    '.pd-bal-pan{position:absolute;top:0;width:0;}',
    '.pd-bal-pan.pan-l{left:0;}.pd-bal-pan.pan-r{right:0;}',
    '.pd-bal-string{position:absolute;left:0;top:0;width:1.5px;height:34px;margin-left:-.75px;background:rgba(255,255,255,0.22);}',
    '.pd-bal-dish{position:absolute;top:34px;left:0;min-width:96px;padding:9px 12px;border-radius:14px;background:var(--surface2,#182840);border:1.5px solid var(--border,rgba(255,255,255,.1));text-align:center;transition:box-shadow .25s,border-color .25s;}',
    '.pd-bal-dish.glow{border-color:var(--ok,#22c55e);box-shadow:0 0 0 3px rgba(34,197,94,.18),0 0 22px rgba(34,197,94,.32);}',
    '.pd-bal-ar{font-family:"Amiri",serif;direction:rtl;font-size:19px;color:var(--accent-light,#fcd34d);line-height:1.3;min-height:24px;}',
    '.pd-bal-cnt{font-family:"Playfair Display",serif;font-size:26px;font-weight:700;color:var(--text,#e2ddd4);line-height:1.1;}',
    '.pd-bal-nm{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted,#7a8fa3);margin-top:2px;}',
    '.pd-bal-level{position:absolute;left:50%;top:0;transform:translateX(-50%);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);opacity:0;transition:opacity .25s;}',
    '.pd-bal-level.on{opacity:1;color:var(--ok,#22c55e);}',
    '.pd-bal-track{position:relative;height:30px;border-radius:16px;background:rgba(255,255,255,0.07);border:1px solid var(--border);cursor:grab;touch-action:none;}',
    '.pd-bal-track:active{cursor:grabbing;}',
    '.pd-bal-trackfill{position:absolute;left:0;top:0;bottom:0;border-radius:16px;background:linear-gradient(90deg,rgba(245,158,11,.16),var(--accent,#f59e0b));opacity:.5;}',
    '.pd-bal-pin{position:absolute;top:50%;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:var(--accent,#f59e0b);box-shadow:0 2px 8px rgba(0,0,0,.45);border:2px solid rgba(255,255,255,.35);}',
    '.pd-bal-hint{text-align:center;font-size:12px;color:var(--muted);margin-top:10px;}',

    /* ═══════════ PREMIUM MOTION LAYER (motionsites-grade) ═══════════
       Layered AFTER base rules so later declarations win. Decorative
       infinite motion is gated behind prefers-reduced-motion. Lifts EVERY
       input type at once - zero per-page edits. */
    '@keyframes qnpIn{from{opacity:0;transform:translateY(16px);filter:blur(7px)}to{opacity:1;transform:none;filter:blur(0)}}',
    '@keyframes qnpPop{0%{transform:scale(1)}42%{transform:scale(1.05)}100%{transform:scale(1)}}',
    '@keyframes qnpShine{0%{background-position:175% 0}60%,100%{background-position:-75% 0}}',
    '@keyframes qnpSweep{0%{left:-65%}52%,100%{left:155%}}',
    '@keyframes qnpGlowPulse{0%,100%{box-shadow:0 0 16px color-mix(in srgb,var(--accent,var(--gold)) 42%,transparent)}50%{box-shadow:0 0 30px color-mix(in srgb,var(--accent,var(--gold)) 80%,transparent)}}',
    '@keyframes qnpRing{0%{transform:translate(-50%,-50%) scale(.65);opacity:.6}100%{transform:translate(-50%,-50%) scale(2.5);opacity:0}}',
    '@keyframes qnpFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}',
    '@keyframes qnpValPulse{0%,100%{text-shadow:0 0 38px color-mix(in srgb,var(--accent,var(--gold)) 30%,transparent)}50%{text-shadow:0 0 56px color-mix(in srgb,var(--accent,var(--gold)) 60%,transparent)}}',

    /* cinematic staggered entrance for the whole prediction card */
    '@media (prefers-reduced-motion:no-preference){',
    '.predict-wrap>*{animation:qnpIn .62s cubic-bezier(.16,1,.3,1) both}',
    '.predict-wrap>*:nth-child(2){animation-delay:.05s}',
    '.predict-wrap>*:nth-child(3){animation-delay:.11s}',
    '.predict-wrap>*:nth-child(4){animation-delay:.18s}',
    '.predict-wrap>*:nth-child(5){animation-delay:.25s}',
    '.predict-wrap>*:nth-child(6){animation-delay:.32s}',
    '}',

    /* SLIDER - floating glowing value + thumb spring */
    '@media (prefers-reduced-motion:no-preference){.predict-val{animation:qnpFloat 3.4s ease-in-out infinite,qnpValPulse 3.4s ease-in-out infinite}}',
    '.predict-slider{transition:background .12s linear}',
    '.predict-slider::-webkit-slider-thumb{transition:transform .15s cubic-bezier(.34,1.6,.64,1),box-shadow .2s}',
    '.predict-slider:active::-webkit-slider-thumb{transform:scale(1.22)}',
    '.predict-slider:active::-moz-range-thumb{transform:scale(1.22)}',

    /* CHOICE - spring lift + select pop + glow */
    '.predict-choice{transition:transform .2s cubic-bezier(.34,1.56,.64,1),border-color .18s,background .18s,box-shadow .25s;will-change:transform}',
    '.predict-choice:hover{transform:translateY(-3px);box-shadow:0 10px 26px color-mix(in srgb,var(--accent,var(--gold)) 16%,transparent)}',
    '.predict-choice:active{transform:translateY(0) scale(.97)}',
    '.predict-choice.selected{box-shadow:0 0 0 1px var(--accent,var(--gold)),0 0 26px color-mix(in srgb,var(--accent,var(--gold)) 30%,transparent);animation:qnpPop .42s cubic-bezier(.34,1.56,.64,1)}',

    /* MAGNITUDE - slide-in hover + select pop */
    '.pd-mag-item{transition:transform .2s cubic-bezier(.34,1.56,.64,1),border-color .15s,background .15s,box-shadow .25s}',
    '.pd-mag-item:hover{transform:translateX(5px)}',
    '.pd-mag-item.sel{animation:qnpPop .42s cubic-bezier(.34,1.56,.64,1)}',
    '.pd-mag-item.sel .pd-mag-dot{box-shadow:0 0 12px var(--accent,var(--gold))}',

    /* BINARY-CHAIN - button press spring + live band glow */
    '.pd-bc-btn{transition:transform .16s cubic-bezier(.34,1.56,.64,1),border-color .12s,background .12s,color .12s}',
    '.pd-bc-btn:active{transform:scale(.91)}',
    '@media (prefers-reduced-motion:no-preference){.pd-bc-band{animation:qnpGlowPulse 2.8s ease-in-out infinite}}',

    /* CARD-FLIP - 3D hover tilt + perpetual light shimmer on the face */
    '.pd-card:not(.flip):hover .pd-card-i{transform:translateY(-5px) rotateX(7deg) rotateY(-5deg)}',
    '.pd-card-f::after{content:"";position:absolute;inset:0;border-radius:10px;background:linear-gradient(115deg,transparent 36%,color-mix(in srgb,var(--accent,var(--gold)) 24%,transparent) 50%,transparent 64%);background-size:260% 100%;pointer-events:none}',
    '@media (prefers-reduced-motion:no-preference){.pd-card-f::after{animation:qnpShine 3.6s ease-in-out infinite}}',

    /* DIAL - glowing pulsing handle */
    '#pd-dhandle{filter:drop-shadow(0 0 5px color-mix(in srgb,var(--accent,var(--gold)) 70%,transparent))}',
    '@media (prefers-reduced-motion:no-preference){#pd-dhandle{animation:pdDialPulse 1.9s ease-in-out infinite}}',

    /* TIMELINE - expanding pulse ring behind the pin */
    '.pd-tl-pin::after{content:"";position:absolute;top:50%;left:50%;width:28px;height:28px;border-radius:50%;border:2px solid var(--accent,var(--gold));pointer-events:none}',
    '@media (prefers-reduced-motion:no-preference){.pd-tl-pin::after{animation:qnpRing 2.1s ease-out infinite}}',

    /* THERMOMETER - glowing bulb + liquid sheen */
    '@media (prefers-reduced-motion:no-preference){.pd-therm-bulb{animation:qnpGlowPulse 2.6s ease-in-out infinite}}',
    '.pd-therm-fill::after{content:"";position:absolute;inset:0;border-radius:9px;background:linear-gradient(0deg,transparent,rgba(255,255,255,.22))}',

    /* SPLIT - glowing divider line */
    '@media (prefers-reduced-motion:no-preference){.pd-split-div{animation:qnpGlowPulse 3s ease-in-out infinite}}',

    /* SUBMIT / CONTINUE - sweeping light shimmer */
    '.predict-submit,.pr-continue{position:relative;overflow:hidden}',
    '.predict-submit::after,.pr-continue::after{content:"";position:absolute;top:0;left:-65%;width:45%;height:100%;background:linear-gradient(110deg,transparent,rgba(255,255,255,.38),transparent);transform:skewX(-20deg);pointer-events:none}',
    '@media (prefers-reduced-motion:no-preference){.predict-submit:not(:disabled)::after,.pr-continue::after{animation:qnpSweep 3.6s ease-in-out infinite}}',

    /* ── ORBIT (living orrery) ── */
    '.pd-orbit{position:relative;margin:6px 0;border-radius:16px;overflow:hidden;background:radial-gradient(ellipse at 50% 46%,#0a1530,#03060e 75%);border:1px solid var(--border);box-shadow:inset 0 0 60px rgba(0,0,0,.5);}',
    '.pd-orbit-cv{display:block;width:100%;height:auto;touch-action:none;cursor:grab;}',
    '.pd-orbit-cv:active{cursor:grabbing;}',
    '.pd-orbit-readout{position:absolute;top:14px;left:0;right:0;text-align:center;pointer-events:none;}',
    '.pd-orbit-val{font-family:"Playfair Display",serif;font-size:clamp(34px,9vw,52px);font-weight:700;color:#fff;text-shadow:0 0 32px var(--accent,#7dd3fc),0 0 8px var(--accent,#7dd3fc);}',
    '.pd-orbit-unit{font-size:12px;color:var(--accent,#7dd3fc);letter-spacing:.12em;text-transform:uppercase;margin-left:7px;vertical-align:super;}',
    '.pd-orbit-hint{position:absolute;bottom:11px;left:0;right:0;text-align:center;font-size:11px;color:rgba(255,255,255,.5);letter-spacing:.06em;pointer-events:none;}',

    /* ── FURNACE (glowing crucible) ── */
    '.pd-furn{position:relative;margin:6px 0;border-radius:16px;overflow:hidden;background:radial-gradient(ellipse at 50% 82%,#1a0d06,#040303 78%);border:1px solid var(--border);cursor:ns-resize;}',
    '.pd-furn-cv{display:block;width:100%;height:auto;touch-action:none;}',
    '.pd-furn-readout{position:absolute;top:18px;left:0;right:0;text-align:center;pointer-events:none;font-family:"Playfair Display",serif;font-size:clamp(32px,8vw,48px);font-weight:700;color:#ff9d00;}',
    '.pd-furn-unit{font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-left:7px;vertical-align:super;opacity:.85;}',
    '.pd-furn-hint{position:absolute;bottom:11px;left:0;right:0;text-align:center;font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.06em;pointer-events:none;}',

    /* ── EXCAVATE (torch-lit dig) ── */
    '.pd-exc{position:relative;margin:6px 0;border-radius:16px;overflow:hidden;border:1px solid var(--border);cursor:ew-resize;}',
    '.pd-exc-cv{display:block;width:100%;height:auto;touch-action:none;}',
    '.pd-exc-readout{position:absolute;top:14px;left:0;right:0;text-align:center;pointer-events:none;font-family:"Playfair Display",serif;font-size:clamp(34px,9vw,52px);font-weight:700;color:var(--accent,#fcd34d);text-shadow:0 2px 0 rgba(0,0,0,.6),0 0 26px var(--accent,#fcd34d);}',
    '.pd-exc-unit{font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-left:7px;vertical-align:super;opacity:.8;}',
    '.pd-exc-hint{position:absolute;bottom:11px;left:0;right:0;text-align:center;font-size:11px;color:rgba(255,235,180,.5);letter-spacing:.06em;pointer-events:none;}',

    /* ── ERA (cinematic discovery timeline) ── */
    '.pd-era{position:relative;margin:6px 0;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:#060912;cursor:ew-resize;}',
    '.pd-era-cv{display:block;width:100%;height:auto;touch-action:none;}',
    '.pd-era-readout{position:absolute;top:14px;left:0;right:0;text-align:center;pointer-events:none;font-family:"Playfair Display",serif;font-size:clamp(34px,9vw,52px);font-weight:700;color:#fff;text-shadow:0 0 30px var(--accent,#e879f9);}',
    '.pd-era-unit{font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-left:7px;vertical-align:super;color:var(--accent,#e879f9);}',
    '.pd-era-hint{position:absolute;bottom:11px;left:0;right:0;text-align:center;font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.06em;pointer-events:none;}',

    /* ── COSMIC ARCHETYPES (expand / parallax / starlife / pulsar / warp) ── */
    '.pd-cos{position:relative;margin:6px 0;border-radius:16px;overflow:hidden;border:1px solid var(--border);background:#04060f;cursor:ew-resize;}',
    '.pd-cos-cv{display:block;width:100%;height:auto;touch-action:none;}',
    '.pd-cos-readout{position:absolute;top:14px;left:0;right:0;text-align:center;pointer-events:none;font-family:"Playfair Display",serif;font-size:clamp(34px,9vw,52px);font-weight:700;color:#fff;text-shadow:0 0 30px var(--accent,#60a5fa);}',
    '.pd-cos-unit{font-size:13px;letter-spacing:.1em;text-transform:uppercase;margin-left:7px;vertical-align:super;color:var(--accent,#60a5fa);}',
    '.pd-cos-hint{position:absolute;bottom:11px;left:0;right:0;text-align:center;font-size:11px;color:rgba(255,255,255,.45);letter-spacing:.06em;pointer-events:none;}',

    /* ── KEYBOARD FOCUS (a11y) ── */
    '[role="slider"]:focus-visible{outline:2px solid var(--accent,var(--gold,#f59e0b));outline-offset:3px;border-radius:8px;}',
    '.pd-card:focus-visible{outline:2px solid var(--accent,var(--gold,#f59e0b));outline-offset:3px;}',
    '.pd-card:focus-visible .pd-card-f,.pd-card:focus-visible .pd-card-b{border-color:var(--accent,var(--gold,#f59e0b));}',

    /* ── LIGHT MODE ── */
    'html[data-theme="light"] .predict-wrap{border-color:rgba(180,83,9,0.22);}',
    'html[data-theme="light"] .predict-slider{background:#d1d5db;}',
    'html[data-theme="light"] .predict-choice,.html[data-theme="light"] .pd-mag-item{background:var(--surface2);}',
    'html[data-theme="light"] .pd-npk{border-color:rgba(26,36,51,0.12);border-bottom-color:rgba(26,36,51,0.22);background:var(--surface);}',
    'html[data-theme="light"] .pd-npk:active{border-color:rgba(180,83,9,0.5);}',
    'html[data-theme="light"] .pd-tl-track{background:rgba(180,83,9,0.12);}',
    'html[data-theme="light"] .pd-bc-btn{background:var(--surface2);}',
    'html[data-theme="light"] .pd-card-f,.html[data-theme="light"] .pd-card-b{border-color:rgba(180,83,9,0.18);}',
    'html[data-theme="light"] .pd-card.sel .pd-card-f,.html[data-theme="light"] .pd-card.sel .pd-card-b{box-shadow:0 0 0 3px rgba(180,83,9,0.15),0 0 18px rgba(180,83,9,0.2);}',
  ].join('');

  var _cssInjected = false;
  function injectCSS() {
    if (_cssInjected) return;
    var el = document.createElement('style');
    el.textContent = CSS;
    document.head.appendChild(el);
    _cssInjected = true;
  }

  /* ─────────────────────────────────────────────────────────────
     Helpers
  ───────────────────────────────────────────────────────────── */
  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function saveGuess(v) { try { localStorage.setItem(STORE_KEY, String(v)); } catch(e) {} }
  function loadGuess()  { try { return localStorage.getItem(STORE_KEY); } catch(e) { return null; } }
  function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }
  /* round to the configured step without binary-float noise (e.g. 10.1 not 10.1000001) */
  function snap(v){ var st=cfg.step||1, r=Math.round(v/st)*st, d=(st%1!==0)?((String(st).split('.')[1]||'').length):0; return d?Number(r.toFixed(d)):Math.round(r); }

  /* keyboard + screen-reader support for any value widget (ARIA slider) */
  function keyNav(el, get, set, label) {
    if (!el) return;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'slider');
    el.setAttribute('aria-valuemin', cfg.min);
    el.setAttribute('aria-valuemax', cfg.max);
    if (label) el.setAttribute('aria-label', label);
    function sync(){ var v=get(); el.setAttribute('aria-valuenow', v); el.setAttribute('aria-valuetext', v + (cfg.unit ? (' '+cfg.unit) : '')); }
    sync();
    el.addEventListener('keydown', function(e){
      var st=cfg.step||1, big=Math.max(st, Math.round((cfg.max-cfg.min)/10)), v=Number(get()), nv;
      switch(e.key){
        case 'ArrowUp': case 'ArrowRight': nv=v+st; break;
        case 'ArrowDown': case 'ArrowLeft': nv=v-st; break;
        case 'PageUp': nv=v+big; break;
        case 'PageDown': nv=v-big; break;
        case 'Home': nv=cfg.min; break;
        case 'End': nv=cfg.max; break;
        default: return;
      }
      e.preventDefault();
      set(clamp(snap(nv), cfg.min, cfg.max));
      sync();
    });
  }

  /* polar coordinate helper for dial */
  function polar(cx, cy, r, deg) {
    var rad = deg * Math.PI / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  /* ─────────────────────────────────────────────────────────────
     Widget HTML builders
  ───────────────────────────────────────────────────────────── */

  /* ── SLIDER ── */
  function buildSlider() {
    var saved = loadGuess();
    var initVal = saved !== null ? Number(saved) : Math.round((cfg.min + cfg.max) / 2);
    var pct = ((initVal - cfg.min) / (cfg.max - cfg.min)) * 100;
    return '<div class="predict-slider-wrap">'
      + '<div class="predict-val" id="pd-val">' + initVal + '</div>'
      + '<div class="predict-val-unit">' + esc(cfg.unit || '') + '</div>'
      + '<input type="range" class="predict-slider" id="pd-slider"'
      + ' min="'+cfg.min+'" max="'+cfg.max+'" step="'+(cfg.step||1)+'"'
      + ' value="'+initVal+'" oninput="Prediction._sm(this)"'
      + ' style="background:linear-gradient(90deg,var(--accent,var(--gold)) '+pct.toFixed(1)+'%,var(--surface2) '+pct.toFixed(1)+'%)">'
      + '<div class="predict-range-row"><span>'+cfg.min+(cfg.unit||'')+'</span><span>'+cfg.max+(cfg.unit||'')+'</span></div>'
      + '</div>';
  }

  /* ── CHOICE ── */
  function buildChoice() {
    var s = '<div class="predict-choices" id="pd-choices">';
    (cfg.choices || []).forEach(function(c) {
      s += '<button class="predict-choice" data-val="'+esc(c)+'" onclick="Prediction._pc(this)">'+esc(c)+'</button>';
    });
    return s + '</div>';
  }

  /* ── NUMBER PAD ── */
  function buildNumberPad() {
    _drag.npVal = '';
    return '<div class="pd-np">'
      + '<div class="pd-npd" id="pd-npd">'
      + '<div class="pd-npv empty" id="pd-npv">enter a number</div>'
      + (cfg.unit ? '<div class="pd-npu">'+esc(cfg.unit)+'</div>' : '')
      + '</div>'
      + '<div class="pd-npkeys">'
      + [7,8,9,4,5,6,1,2,3].map(function(n){
          return '<button class="pd-npk" onclick="Prediction._nk(\''+n+'\')">'+n+'</button>';
        }).join('')
      + '<button class="pd-npk sm" onclick="Prediction._nk(\'clr\')">CLR</button>'
      + '<button class="pd-npk" onclick="Prediction._nk(\'0\')">0</button>'
      + '<button class="pd-npk sm" onclick="Prediction._nk(\'del\')">⌫</button>'
      + '</div></div>';
  }

  /* ── DIAL ── */
  function buildDial() {
    var saved = loadGuess();
    var initVal = saved !== null ? Number(saved) : Math.round((cfg.min + cfg.max) / 2);
    _drag.dialVal = initVal;
    return '<div class="pd-dial">' + genDialSVG(initVal) + '<p class="pd-dial-hint">drag to set your prediction</p></div>';
  }

  function genDialSVG(val) {
    var W=260, CX=130, CY=130, R_OUT=122, R_ARC=100, RT_OUT=116, RT_IN=109;
    var S=135, RANGE=270; /* start angle, total range in degrees */
    var ratio = clamp((val - cfg.min) / (cfg.max - cfg.min), 0, 1);
    var endDeg = S + ratio * RANGE;

    /* ticks */
    var ticks = '';
    for (var i=0; i<=60; i++) {
      var td = S + (i/60)*RANGE;
      var major = i%6===0, grand = i%12===0;
      var ri = grand ? RT_IN-5 : (major ? RT_IN-2 : RT_IN);
      var p1 = polar(CX,CY,RT_OUT,td), p2 = polar(CX,CY,ri,td);
      ticks += '<line x1="'+p1.x.toFixed(2)+'" y1="'+p1.y.toFixed(2)+'"'
             + ' x2="'+p2.x.toFixed(2)+'" y2="'+p2.y.toFixed(2)+'"'
             + ' stroke="color-mix(in srgb,var(--accent,var(--gold)) '+(grand?.45:major?.28:.14)+')"'
             + ' stroke-width="'+(grand?2:major?1.5:1)+'"/>';
    }

    /* arcs */
    function arcD(a1, a2, r) {
      var p1=polar(CX,CY,r,a1), p2=polar(CX,CY,r,a2);
      var lg = ((a2-a1) > 180) ? 1 : 0;
      return 'M '+p1.x.toFixed(2)+' '+p1.y.toFixed(2)
           + ' A '+r+' '+r+' 0 '+lg+' 1 '+p2.x.toFixed(2)+' '+p2.y.toFixed(2);
    }
    var bgArc = arcD(S, S+RANGE-0.1, R_ARC);
    var valArc = ratio > 0.001 ? arcD(S, endDeg, R_ARC) : '';
    var hPos = polar(CX,CY,R_ARC,endDeg);

    return '<svg id="pd-dial-svg" viewBox="0 0 '+W+' '+W+'" style="touch-action:none;">'
      + '<defs><radialGradient id="dgb" cx="50%" cy="30%"><stop offset="0%" stop-color="color-mix(in srgb,var(--accent,var(--gold)) 7%,transparent)"/><stop offset="100%" stop-color="rgba(0,0,0,0)"/></radialGradient>'
      + '<linearGradient id="darc" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="color-mix(in srgb,var(--accent,var(--gold)) 50%,transparent)"/><stop offset="100%" stop-color="var(--accent,var(--gold))"/></linearGradient></defs>'
      /* outer glow */
      + '<circle cx="'+CX+'" cy="'+CY+'" r="'+R_OUT+'" fill="url(#dgb)" stroke="color-mix(in srgb,var(--accent,var(--gold)) 1%,transparent)" stroke-width="1"/>'
      + ticks
      /* bg arc */
      + '<path d="'+bgArc+'" fill="none" stroke="color-mix(in srgb,var(--accent,var(--gold)) 1%,transparent)" stroke-width="10" stroke-linecap="round"/>'
      /* value arc */
      + '<path id="pd-darc" d="'+valArc+'" fill="none" stroke="url(#darc)" stroke-width="10" stroke-linecap="round"/>'
      /* inner glass */
      + '<circle cx="'+CX+'" cy="'+CY+'" r="84" fill="var(--surface2)" stroke="color-mix(in srgb,var(--accent,var(--gold)) 1%,transparent)" stroke-width="1"/>'
      + '<circle cx="'+CX+'" cy="'+CY+'" r="80" fill="none" stroke="color-mix(in srgb,var(--accent,var(--gold)) 5%,transparent)" stroke-width="1"/>'
      /* value text */
      + '<text id="pd-dnum" x="'+CX+'" y="'+CY+'" text-anchor="middle" dominant-baseline="middle"'
      + ' style="font-family:\'Playfair Display\',serif;font-size:38px;font-weight:700;fill:var(--accent,var(--gold));">'+Math.round(val)+'</text>'
      + '<text x="'+CX+'" y="'+(CY+26)+'" text-anchor="middle" dominant-baseline="middle"'
      + ' style="font-family:\'DM Sans\',sans-serif;font-size:11px;fill:var(--muted);letter-spacing:.08em;text-transform:uppercase;">'+esc(cfg.unit||'')+'</text>'
      /* handle */
      + '<circle id="pd-dhandle" cx="'+hPos.x.toFixed(2)+'" cy="'+hPos.y.toFixed(2)+'"'
      + ' r="11" fill="var(--accent,var(--gold))" stroke="var(--bg)" stroke-width="3"'
      + ' style="filter:drop-shadow(0 0 8px color-mix(in srgb,var(--accent,var(--gold)) 7%,transparent))"/>'
      + '</svg>';
  }

  function initDial() {
    var svg = document.getElementById('pd-dial-svg');
    if (!svg) return;
    var CX=130, CY=130, R_ARC=100, S=135, RANGE=270;
    var dragging = false;

    function degFromEvent(e) {
      var r = svg.getBoundingClientRect();
      var sx = 260 / r.width;
      var x = (e.clientX - r.left)*sx - CX;
      var y = (e.clientY - r.top)*sx - CY;
      var d = Math.atan2(y,x)*180/Math.PI;
      if (d < 0) d += 360;
      return d;
    }
    function degToVal(deg) {
      var d = deg;
      if (d < S - 360 + RANGE) d += 360; /* normalize end-zone */
      if (d < S) { return d < (S - (360-RANGE)/2) ? cfg.max : cfg.min; }
      if (d > S+RANGE) return cfg.max;
      return Math.round(cfg.min + ((d-S)/RANGE)*(cfg.max-cfg.min));
    }
    function updateDialUI(val) {
      _drag.dialVal = val;
      var ratio = clamp((val-cfg.min)/(cfg.max-cfg.min),0,1);
      var endDeg = S + ratio*RANGE;
      function arcD(a1,a2,r){
        var p1=polar(CX,CY,r,a1),p2=polar(CX,CY,r,a2),lg=(a2-a1)>180?1:0;
        return 'M '+p1.x.toFixed(2)+' '+p1.y.toFixed(2)+' A '+r+' '+r+' 0 '+lg+' 1 '+p2.x.toFixed(2)+' '+p2.y.toFixed(2);
      }
      var arcEl=document.getElementById('pd-darc');
      if(arcEl) arcEl.setAttribute('d', ratio>0.001 ? arcD(S,endDeg,R_ARC) : '');
      var numEl=document.getElementById('pd-dnum');
      if(numEl) numEl.textContent = val;
      var hp=polar(CX,CY,R_ARC,endDeg);
      var hEl=document.getElementById('pd-dhandle');
      if(hEl){ hEl.setAttribute('cx',hp.x.toFixed(2)); hEl.setAttribute('cy',hp.y.toFixed(2)); }
    }
    svg.addEventListener('pointerdown',function(e){
      e.preventDefault(); dragging=true; svg.setPointerCapture(e.pointerId);
      updateDialUI(degToVal(degFromEvent(e)));
    });
    svg.addEventListener('pointermove',function(e){
      if(!dragging) return; e.preventDefault();
      updateDialUI(degToVal(degFromEvent(e)));
    });
    svg.addEventListener('pointerup',function(){ dragging=false; });
  }

  /* ── TIMELINE ── */
  function buildTimeline() {
    var saved = loadGuess();
    var initVal = saved !== null ? Number(saved) : Math.round((cfg.min+cfg.max)/2);
    _drag.tlVal = initVal;
    var ratio0 = ((initVal-cfg.min)/(cfg.max-cfg.min));
    var pct0 = ratio0*100;
    var left0 = 'calc(16px + (100% - 32px) * '+ratio0.toFixed(4)+')';
    return '<div class="pd-tl">'
      + '<div class="pd-tl-ends"><span>'+cfg.min+(cfg.unit||'')+'</span><span>'+cfg.max+(cfg.unit||'')+'</span></div>'
      + '<div class="pd-tl-stage" id="pd-tl-stage">'
      + '<div class="pd-tl-track"><div class="pd-tl-fill" id="pd-tl-fill" style="width:'+pct0+'%"></div></div>'
      + '<div class="pd-tl-label" id="pd-tl-label" style="left:'+left0+'">'+initVal+'</div>'
      + '<div class="pd-tl-pin" id="pd-tl-pin" style="left:'+left0+'"></div>'
      + '</div></div>';
  }

  function initTimeline() {
    var stage = document.getElementById('pd-tl-stage');
    if (!stage) return;
    var dragging = false;
    function update(e) {
      var r = stage.getBoundingClientRect();
      var pad = 16;
      var trackW = r.width - pad*2;
      var x = clamp(e.clientX - r.left - pad, 0, trackW);
      var ratio = x / trackW;
      var val = Math.round(cfg.min + ratio*(cfg.max-cfg.min));
      _drag.tlVal = val;
      var pct = ratio*100;
      var left = 'calc('+pad+'px + (100% - '+(pad*2)+'px) * '+ratio.toFixed(4)+')';
      var pin = document.getElementById('pd-tl-pin');
      var lbl = document.getElementById('pd-tl-label');
      var fill = document.getElementById('pd-tl-fill');
      if(pin){ pin.style.left = left; }
      if(lbl){ lbl.style.left = left; lbl.textContent = val; }
      if(fill){ fill.style.width = pct+'%'; }
    }
    stage.addEventListener('pointerdown',function(e){
      e.preventDefault(); dragging=true; stage.setPointerCapture(e.pointerId);
      document.getElementById('pd-tl-pin').classList.add('dragging');
      update(e);
    });
    stage.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); update(e); } });
    stage.addEventListener('pointerup',function(){
      dragging=false;
      var pin=document.getElementById('pd-tl-pin');
      if(pin) pin.classList.remove('dragging');
    });
  }

  /* ── SPLIT ── */
  function buildSplit() {
    var saved = loadGuess();
    var initPct = saved !== null ? Number(saved) : 50;
    _drag.splitPct = initPct;
    var lc = cfg.leftColor || 'rgba(14,165,233,0.75)';
    var rc = cfg.rightColor || 'rgba(139,92,246,0.55)';
    var ll = cfg.leftLabel || 'Left';
    var rl = cfg.rightLabel || 'Right';
    return '<div class="pd-split">'
      + '<div class="pd-split-stage" id="pd-split-stage">'
      + '<div class="pd-split-l" id="pd-sl" style="left:0;width:'+initPct+'%;background:'+lc+';">'
      + '<div class="pd-split-pct" id="pd-slpct" style="color:#fff">'+Math.round(initPct)+'%</div>'
      + '<div class="pd-split-lbl" style="color:rgba(255,255,255,0.7)">'+esc(ll)+'</div>'
      + '</div>'
      + '<div class="pd-split-r" id="pd-sr" style="right:0;width:'+(100-initPct)+'%;background:'+rc+';">'
      + '<div class="pd-split-pct" id="pd-srpct" style="color:#fff">'+Math.round(100-initPct)+'%</div>'
      + '<div class="pd-split-lbl" style="color:rgba(255,255,255,0.7)">'+esc(rl)+'</div>'
      + '</div>'
      + '<div class="pd-split-div" id="pd-sdiv" style="left:'+initPct+'%"></div>'
      + '</div>'
      + '<p class="pd-split-hint">drag the divider left or right</p>'
      + '</div>';
  }

  function initSplit() {
    var stage = document.getElementById('pd-split-stage');
    if (!stage) return;
    var dragging = false;
    function update(e) {
      var r = stage.getBoundingClientRect();
      var pct = clamp((e.clientX - r.left)/r.width*100, 2, 98);
      _drag.splitPct = pct;
      var sl=document.getElementById('pd-sl'), sr=document.getElementById('pd-sr');
      var div=document.getElementById('pd-sdiv');
      var lp=document.getElementById('pd-slpct'), rp=document.getElementById('pd-srpct');
      if(sl) sl.style.width = pct+'%';
      if(sr) sr.style.width = (100-pct)+'%';
      if(div) div.style.left = pct+'%';
      if(lp) lp.textContent = Math.round(pct)+'%';
      if(rp) rp.textContent = Math.round(100-pct)+'%';
    }
    stage.addEventListener('pointerdown',function(e){
      e.preventDefault(); dragging=true; stage.setPointerCapture(e.pointerId); update(e);
    });
    stage.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); update(e); } });
    stage.addEventListener('pointerup',function(){ dragging=false; });
  }

  /* ── THERMOMETER ── */
  function buildThermometer() {
    var saved = loadGuess();
    var initVal = saved !== null ? Number(saved) : Math.round((cfg.min+cfg.max)/2);
    _drag.thermVal = initVal;
    var ratio = (initVal-cfg.min)/(cfg.max-cfg.min);
    var fillH = (ratio*100).toFixed(1)+'%';

    /* generate 5 scale ticks */
    var ticks = '';
    for(var i=0;i<=4;i++){
      var tv = Math.round(cfg.min + (i/4)*(cfg.max-cfg.min));
      var hi = i===4||i===0;
      ticks += '<div class="pd-therm-tick'+(hi?' hi':'')+'">'+tv+(cfg.unit||'')+'</div>';
    }

    return '<div class="pd-therm">'
      + '<div class="pd-therm-side">'
      + '<div class="pd-therm-bigval" id="pd-tv">'+initVal+'</div>'
      + '<div class="pd-therm-unit">'+esc(cfg.unit||'')+'</div>'
      + '<div class="pd-therm-hint">drag up / down</div>'
      + '</div>'
      + '<div class="pd-therm-body" id="pd-therm-body">'
      + '<div class="pd-therm-tube"><div class="pd-therm-fill" id="pd-tf" style="height:'+fillH+'"></div></div>'
      + '<div class="pd-therm-bulb"></div>'
      + '</div>'
      + '<div class="pd-therm-scale">'+ticks+'</div>'
      + '</div>';
  }

  function initThermometer() {
    var body = document.getElementById('pd-therm-body');
    if (!body) return;
    var dragging = false, startY = 0, startVal = 0;
    function update(e) {
      var tube = body.querySelector('.pd-therm-tube');
      if(!tube) return;
      var r = tube.getBoundingClientRect();
      var y = clamp(e.clientY - r.top, 0, r.height);
      var ratio = 1 - y/r.height;
      var val = Math.round(cfg.min + ratio*(cfg.max-cfg.min));
      _drag.thermVal = val;
      var fill = document.getElementById('pd-tf');
      var display = document.getElementById('pd-tv');
      if(fill) fill.style.height = (ratio*100).toFixed(1)+'%';
      if(display) display.textContent = val;
    }
    body.addEventListener('pointerdown',function(e){
      e.preventDefault(); dragging=true; body.setPointerCapture(e.pointerId); update(e);
    });
    body.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); update(e); } });
    body.addEventListener('pointerup',function(){ dragging=false; });
  }

  /* ── MAGNITUDE ── */
  function buildMagnitude() {
    var items = '';
    (cfg.magnitudes || []).forEach(function(m, i) {
      items += '<div class="pd-mag-item" data-val="'+esc(String(m.value))+'" data-i="'+i+'" onclick="Prediction._mag(this)">'
        + '<div class="pd-mag-pow">'+(m.power !== undefined ? ('10<sup>'+m.power+'</sup>') : (i+1))+'</div>'
        + '<div class="pd-mag-text"><div class="pd-mag-range">'+esc(m.label)+'</div>'
        + (m.sub ? '<div class="pd-mag-sub">'+esc(m.sub)+'</div>' : '')+'</div>'
        + '<div class="pd-mag-dot"></div>'
        + '</div>';
    });
    return '<div class="pd-mag">'
      + '<div class="pd-mag-eyebrow">Choose the closest range</div>'
      + '<div class="pd-mag-items">'+items+'</div>'
      + '</div>';
  }

  /* ── BINARY CHAIN ── */
  function buildBinaryChain() {
    var lo = cfg.min || 0, hi = cfg.max || 100;
    _drag.bcState = { step:0, lo:lo, hi:hi };
    var pivot = Math.round((lo+hi)/2);
    var totalRange = hi - lo;

    function stepHTML(n, qtext, active) {
      return '<div class="pd-bc-step'+(active?' active':'') + '" id="pd-bc-s'+n+'">'
        + '<div class="pd-bc-num">'+(n+1)+'</div>'
        + '<div class="pd-bc-q" id="pd-bc-q'+n+'">'+qtext+'</div>'
        + (active
          ? '<div class="pd-bc-btns" id="pd-bc-b'+n+'">'
            +'<button class="pd-bc-btn" onclick="Prediction._bc(true)">Yes</button>'
            +'<button class="pd-bc-btn" onclick="Prediction._bc(false)">No</button>'
            +'</div>'
          : '<div class="pd-bc-btns" id="pd-bc-b'+n+'"></div>')
        + '</div>';
    }

    return '<div class="pd-bc">'
      + '<div class="pd-bc-bar"><div class="pd-bc-band" id="pd-bc-band" style="left:0%;width:100%"></div></div>'
      + '<div class="pd-bc-range" id="pd-bc-range">'+lo+(cfg.unit||'')+' – '+hi+(cfg.unit||'')+'</div>'
      + '<div class="pd-bc-steps">'
      + stepHTML(0, 'Is it more than '+pivot+(cfg.unit||'')+'?', true)
      + stepHTML(1, '…', false)
      + stepHTML(2, '…', false)
      + '</div>'
      + '<div class="pd-bc-commit" id="pd-bc-commit"></div>'
      + '</div>';
  }

  /* ── CARD FLIP ── */
  function buildCardFlip() {
    var cards = '';
    (cfg.choices || []).forEach(function(c, i) {
      cards += '<div class="pd-card" data-val="'+esc(String(c))+'" id="pd-card-'+i+'" tabindex="0" role="button" aria-label="Predict '+esc(String(c))+(cfg.unit?(' '+esc(cfg.unit)):'')+'" onclick="Prediction._card('+i+')" onkeydown="Prediction._ck(event,'+i+')">'
        + '<div class="pd-card-i">'
        + '<div class="pd-card-f"><div class="pd-card-q">؟</div><div class="pd-card-qtip">tap to reveal</div></div>'
        + '<div class="pd-card-b"><div class="pd-card-num">'+esc(String(c))+'</div>'
        + (cfg.unit ? '<div class="pd-card-unit">'+esc(cfg.unit)+'</div>' : '')
        + '</div></div></div>';
    });
    return '<div class="pd-cards">'+cards+'</div>';
  }

  /* ── SCALE BALANCE ── (predict a count against a known twin count) */
  function balAngle(guess, lc) {
    var range = Math.max(1, (cfg.max - cfg.min));
    return clamp((guess - lc) / range * 60, -15, 15);
  }
  function buildScaleBalance() {
    var saved = loadGuess();
    var initVal = saved !== null ? Number(saved) : Math.round((cfg.min+cfg.max)/2);
    _drag.balVal = initVal;
    var lc = Number(cfg.leftCount);
    var ang = balAngle(initVal, lc), ca = (-ang).toFixed(2);
    var ratio0 = (initVal-cfg.min)/(cfg.max-cfg.min);
    var left0 = 'calc(14px + (100% - 28px) * '+ratio0.toFixed(4)+')';
    function dish(side, ar, cnt, nm, cntId) {
      return '<div class="pd-bal-pan pan-'+side+'">'
        + '<div class="pd-bal-string"></div>'
        + '<div class="pd-bal-dish" id="pd-bal-d'+side+'" style="transform:translateX(-50%) rotate('+ca+'deg)">'
        +   '<div class="pd-bal-ar">'+esc(ar)+'</div>'
        +   '<div class="pd-bal-cnt"'+(cntId?' id="'+cntId+'"':'')+'>'+cnt+'</div>'
        +   '<div class="pd-bal-nm">'+esc(nm)+'</div>'
        + '</div></div>';
    }
    return '<div class="pd-bal">'
      + '<div class="pd-bal-scene">'
      +   '<div class="pd-bal-post"></div><div class="pd-bal-base"></div>'
      +   '<div class="pd-bal-level" id="pd-bal-level">balanced</div>'
      +   '<div class="pd-bal-beam" id="pd-bal-beam" style="transform:rotate('+ang.toFixed(2)+'deg)">'
      +     '<div class="pd-bal-arm"></div>'
      +     dish('l', cfg.leftArabic||'', lc, cfg.leftLabel||'Known', null)
      +     dish('r', cfg.rightArabic||'', initVal, cfg.rightLabel||'Predict', 'pd-bal-rc')
      +   '</div>'
      + '</div>'
      + '<div class="pd-bal-track" id="pd-bal-track">'
      +   '<div class="pd-bal-trackfill" id="pd-bal-fill" style="width:'+(ratio0*100).toFixed(1)+'%"></div>'
      +   '<div class="pd-bal-pin" id="pd-bal-tpin" style="left:'+left0+'"></div>'
      + '</div>'
      + '<p class="pd-bal-hint">drag to weigh how often “'+esc(cfg.rightLabel||'')+'” appears</p>'
      + '</div>';
  }
  function initScaleBalance() {
    var track = document.getElementById('pd-bal-track');
    if (!track) return;
    var lc = Number(cfg.leftCount), step = cfg.step||1, dragging=false;
    function applyVal(val) {
      val = clamp(Math.round(val/step)*step, cfg.min, cfg.max);
      _drag.balVal = val;
      var ratio = (val-cfg.min)/((cfg.max-cfg.min)||1);
      var left = 'calc(14px + (100% - 28px) * '+ratio.toFixed(4)+')';
      var pin=document.getElementById('pd-bal-tpin'), fill=document.getElementById('pd-bal-fill');
      if(pin) pin.style.left=left;
      if(fill) fill.style.width=(ratio*100)+'%';
      var rc=document.getElementById('pd-bal-rc'); if(rc) rc.textContent=val;
      var ang=balAngle(val, lc), ca='translateX(-50%) rotate('+(-ang).toFixed(2)+'deg)';
      var beam=document.getElementById('pd-bal-beam'); if(beam) beam.style.transform='rotate('+ang.toFixed(2)+'deg)';
      var dl=document.getElementById('pd-bal-dl'), dr=document.getElementById('pd-bal-dr');
      if(dl) dl.style.transform=ca; if(dr) dr.style.transform=ca;
      var balanced=Math.abs(val-lc)<=step;
      var lvl=document.getElementById('pd-bal-level'); if(lvl) lvl.classList.toggle('on',balanced);
      if(dl) dl.classList.toggle('glow',balanced); if(dr) dr.classList.toggle('glow',balanced);
    }
    function update(e) {
      var r = track.getBoundingClientRect(), pad = 14, trackW = r.width - pad*2;
      var x = clamp(e.clientX - r.left - pad, 0, trackW);
      applyVal(cfg.min + (x/trackW)*(cfg.max-cfg.min));
    }
    track.addEventListener('pointerdown',function(e){ e.preventDefault(); dragging=true; try{track.setPointerCapture(e.pointerId);}catch(_){} update(e); });
    track.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); update(e); } });
    track.addEventListener('pointerup',function(){ dragging=false; });
    keyNav(track, function(){ return _drag.balVal; }, applyVal, cfg.question);
  }

  /* ── ORBIT ── (living orrery: drag a planet around its orbit to scrub a value) */
  function buildOrbit() {
    var saved = loadGuess();
    var initVal = saved !== null ? Number(saved) : Math.round((cfg.min+cfg.max)/2);
    _drag.orbitVal = initVal;
    return '<div class="pd-orbit">'
      + '<canvas class="pd-orbit-cv" id="pd-orbit-cv" height="300"></canvas>'
      + '<div class="pd-orbit-readout"><span class="pd-orbit-val" id="pd-orbit-val">'+initVal+'</span>'
      +   (cfg.unit?'<span class="pd-orbit-unit">'+esc(cfg.unit)+'</span>':'')+'</div>'
      + '<p class="pd-orbit-hint">drag the glowing planet around its orbit</p>'
      + '</div>';
  }
  function initOrbit() {
    var cv = document.getElementById('pd-orbit-cv');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var accent = (getComputedStyle(document.body).getPropertyValue('--accent')||'').trim() || '#7dd3fc';
    var dpr = Math.min(window.devicePixelRatio||1, 2), CH = 300;
    function size(){ var w=cv.offsetWidth||640; cv.width=w*dpr; cv.height=CH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); window.addEventListener('resize', size);
    var rng=(function(){var s=20260611;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0xffffffff;};})();
    var stars=[]; for(var i=0;i<78;i++) stars.push({x:rng(),y:rng(),r:rng()*1.3+0.3,p:rng()*6.28});
    var amb=[{rad:0.20,sp:0.55,sz:3,col:'#fcd34d',ph:0},{rad:0.40,sp:-0.32,sz:4.5,col:'#cbd5e1',ph:2.1}];
    var t=0;
    function valToAngle(v){ var r=(v-cfg.min)/((cfg.max-cfg.min)||1); return -Math.PI/2 + r*Math.PI*2; }
    function draw(){
      var w=cv.width/dpr, h=cv.height/dpr, cx=w/2, cy=h/2+8;
      ctx.clearRect(0,0,w,h);
      for(var i=0;i<stars.length;i++){ var st=stars[i], tw=0.5+0.5*Math.sin(t*2+st.p);
        ctx.globalAlpha=0.25+tw*0.6; ctx.fillStyle='#cfe8ff'; ctx.beginPath(); ctx.arc(st.x*w,st.y*h,st.r,0,6.283); ctx.fill(); }
      ctx.globalAlpha=1;
      var mainR=Math.min(w,h)*0.34, S=Math.min(w,h);
      ctx.strokeStyle='rgba(255,255,255,0.09)'; ctx.lineWidth=1;
      [0.20,0.40].forEach(function(rr){ ctx.beginPath(); ctx.arc(cx,cy,S*rr,0,6.283); ctx.stroke(); });
      ctx.strokeStyle=accent+'44'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,cy,mainR,0,6.283); ctx.stroke();
      amb.forEach(function(pl){ var a=t*pl.sp+pl.ph, pr=S*pl.rad, px=cx+Math.cos(a)*pr, py=cy+Math.sin(a)*pr;
        ctx.fillStyle=pl.col; ctx.shadowColor=pl.col; ctx.shadowBlur=10; ctx.beginPath(); ctx.arc(px,py,pl.sz,0,6.283); ctx.fill(); ctx.shadowBlur=0; });
      var g=ctx.createRadialGradient(cx,cy,0,cx,cy,40); g.addColorStop(0,'#ffffff'); g.addColorStop(.35,accent); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,30+2.5*Math.sin(t*2.2),0,6.283); ctx.fill();
      var ang=valToAngle(_drag.orbitVal), mx=cx+Math.cos(ang)*mainR, my=cy+Math.sin(ang)*mainR;
      ctx.strokeStyle=accent; ctx.lineWidth=2.5; ctx.shadowColor=accent; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(cx,cy,mainR,-Math.PI/2,ang,false); ctx.stroke(); ctx.shadowBlur=0;
      ctx.fillStyle='#fff'; ctx.shadowColor=accent; ctx.shadowBlur=20; ctx.beginPath(); ctx.arc(mx,my,8,0,6.283); ctx.fill(); ctx.shadowBlur=0;
      ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(mx,my,13,0,6.283); ctx.stroke();
    }
    function frame(){ if(!cv.isConnected) return; if(cv.offsetParent!==null){ t+=0.016; draw(); } _drag.orbitRaf=requestAnimationFrame(frame); }
    var dragging=false;
    function setFromEvent(e){
      var r=cv.getBoundingClientRect(), cx=r.left+r.width/2, cy=r.top+r.height/2+8;
      var fromTop=Math.atan2(e.clientY-cy, e.clientX-cx)+Math.PI/2; if(fromTop<0) fromTop+=Math.PI*2;
      var ratio=fromTop/(Math.PI*2), step=cfg.step||1;
      var val=clamp(Math.round((cfg.min+ratio*(cfg.max-cfg.min))/step)*step, cfg.min, cfg.max);
      _drag.orbitVal=val; var ve=document.getElementById('pd-orbit-val'); if(ve) ve.textContent=val;
    }
    cv.addEventListener('pointerdown',function(e){ e.preventDefault(); dragging=true; try{cv.setPointerCapture(e.pointerId);}catch(_){} setFromEvent(e); });
    cv.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); setFromEvent(e); } });
    cv.addEventListener('pointerup',function(){ dragging=false; });
    keyNav(cv, function(){ return _drag.orbitVal; }, function(v){ _drag.orbitVal=v; var ve=document.getElementById('pd-orbit-val'); if(ve) ve.textContent=v; }, cfg.question);
    frame();
  }

  /* ── FURNACE ── (glowing crucible: drag up to raise the heat) */
  function buildFurnace() {
    var saved = loadGuess();
    var initVal = saved !== null ? Number(saved) : Math.round((cfg.min+cfg.max)/2);
    _drag.furnVal = initVal;
    return '<div class="pd-furn">'
      + '<canvas class="pd-furn-cv" id="pd-furn-cv" height="280"></canvas>'
      + '<div class="pd-furn-readout"><span id="pd-furn-val">'+initVal+'</span>'
      +   (cfg.unit?'<span class="pd-furn-unit">'+esc(cfg.unit)+'</span>':'')+'</div>'
      + '<p class="pd-furn-hint">drag up to raise the heat</p>'
      + '</div>';
  }
  function furnHeat(r) {
    var stops=[[40,8,8],[150,20,10],[255,60,0],[255,150,10],[255,225,120],[255,255,255]];
    var f=r*(stops.length-1), i=Math.floor(f), fr=f-i; if(i>=stops.length-1){i=stops.length-2;fr=1;}
    var a=stops[i], b=stops[i+1];
    return 'rgb('+Math.round(a[0]+(b[0]-a[0])*fr)+','+Math.round(a[1]+(b[1]-a[1])*fr)+','+Math.round(a[2]+(b[2]-a[2])*fr)+')';
  }
  function initFurnace() {
    var cv = document.getElementById('pd-furn-cv'); if(!cv) return;
    var ctx = cv.getContext('2d'); var dpr=Math.min(window.devicePixelRatio||1,2), CH=280;
    function size(){ var w=cv.offsetWidth||640; cv.width=w*dpr; cv.height=CH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); window.addEventListener('resize', size);
    var sparks=[], t=0;
    function ratio(){ return clamp((_drag.furnVal-cfg.min)/((cfg.max-cfg.min)||1),0,1); }
    function draw(){
      var w=cv.width/dpr, h=cv.height/dpr, r=ratio(), col=furnHeat(r);
      ctx.clearRect(0,0,w,h);
      var cx=w/2, poolY=h*0.6, poolW=Math.min(w*0.52,270);
      var g=ctx.createRadialGradient(cx,poolY,0,cx,poolY,poolW*0.95);
      g.addColorStop(0,col.replace('rgb(','rgba(').replace(')',','+(0.22+r*0.55)+')')); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      ctx.fillStyle='#141414'; ctx.strokeStyle='#2c2c2c'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(cx-poolW/2-14,poolY-8); ctx.lineTo(cx+poolW/2+14,poolY-8);
      ctx.lineTo(cx+poolW/2-8,poolY+66); ctx.lineTo(cx-poolW/2+8,poolY+66); ctx.closePath(); ctx.fill(); ctx.stroke();
      var pg=ctx.createLinearGradient(0,poolY-24,0,poolY+24);
      pg.addColorStop(0,'#fff'); pg.addColorStop(.35,col); pg.addColorStop(1,furnHeat(Math.max(0,r-0.28)));
      ctx.fillStyle=pg; ctx.shadowColor=col; ctx.shadowBlur=28+r*34;
      ctx.beginPath(); ctx.ellipse(cx,poolY,poolW/2,24+r*4*Math.sin(t*3),0,0,6.283); ctx.fill(); ctx.shadowBlur=0;
      ctx.globalAlpha=0.25+0.3*(0.5+0.5*Math.sin(t*4)); ctx.fillStyle='#fff';
      ctx.beginPath(); ctx.ellipse(cx,poolY-5,poolW*0.26,4,0,0,6.283); ctx.fill(); ctx.globalAlpha=1;
      var emit=Math.floor(r*3+ (r>0?0.5:0));
      for(var k=0;k<emit;k++) sparks.push({x:cx+(Math.random()-0.5)*poolW*0.72,y:poolY,vx:(Math.random()-0.5)*0.7,vy:-(1+Math.random()*2.4)-r*2.2,life:1,sz:1+Math.random()*1.7});
      for(var i=sparks.length-1;i>=0;i--){ var s=sparks[i]; s.x+=s.vx; s.y+=s.vy; s.vy+=0.02; s.life-=0.02;
        if(s.life<=0){ sparks.splice(i,1); continue; }
        ctx.globalAlpha=s.life; ctx.fillStyle=furnHeat(Math.min(1,r+0.2)); ctx.beginPath(); ctx.arc(s.x,s.y,s.sz*s.life,0,6.283); ctx.fill(); }
      ctx.globalAlpha=1; if(sparks.length>200) sparks.splice(0,sparks.length-200);
      var ve=document.getElementById('pd-furn-val'); if(ve){ ve.style.color=r>0.72?'#fff':col; ve.style.textShadow='0 0 30px '+col; }
    }
    function frame(){ if(!cv.isConnected) return; if(cv.offsetParent!==null){ t+=0.05; draw(); } _drag.furnRaf=requestAnimationFrame(frame); }
    var dragging=false;
    function setFromEvent(e){
      var rc=cv.getBoundingClientRect(); var y=clamp(e.clientY-rc.top,0,rc.height);
      var rr=1-y/rc.height, step=cfg.step||1;
      var val=clamp(Math.round((cfg.min+rr*(cfg.max-cfg.min))/step)*step,cfg.min,cfg.max);
      _drag.furnVal=val; var ve=document.getElementById('pd-furn-val'); if(ve) ve.textContent=val;
    }
    cv.addEventListener('pointerdown',function(e){ e.preventDefault(); dragging=true; try{cv.setPointerCapture(e.pointerId);}catch(_){} setFromEvent(e); });
    cv.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); setFromEvent(e); } });
    cv.addEventListener('pointerup',function(){ dragging=false; });
    keyNav(cv, function(){ return _drag.furnVal; }, function(v){ _drag.furnVal=v; var ve=document.getElementById('pd-furn-val'); if(ve) ve.textContent=v; }, cfg.question);
    frame();
  }

  /* ── EXCAVATE ── (torch-lit dig: sweep sand off a tablet to reveal a date) */
  function buildExcavate() {
    var saved=loadGuess(), initVal=saved!==null?Number(saved):Math.round((cfg.min+cfg.max)/2);
    _drag.excVal=initVal;
    return '<div class="pd-exc">'
      + '<canvas class="pd-exc-cv" id="pd-exc-cv" height="270"></canvas>'
      + '<div class="pd-exc-readout"><span id="pd-exc-val">'+initVal+'</span>'
      +   (cfg.unit?'<span class="pd-exc-unit">'+esc(cfg.unit)+'</span>':'')+'</div>'
      + '<p class="pd-exc-hint">drag the brush to uncover the date</p>'
      + '</div>';
  }
  function initExcavate() {
    var cv=document.getElementById('pd-exc-cv'); if(!cv) return;
    var ctx=cv.getContext('2d'); var accent=(getComputedStyle(document.body).getPropertyValue('--accent')||'').trim()||'#fcd34d';
    var dpr=Math.min(window.devicePixelRatio||1,2), CH=270;
    function size(){ var w=cv.offsetWidth||640; cv.width=w*dpr; cv.height=CH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); window.addEventListener('resize',size);
    var rng=(function(){var s=84017;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0xffffffff;};})();
    var glyphs=[]; for(var i=0;i<28;i++) glyphs.push({gx:rng(),gy:rng(),k:Math.floor(rng()*4)});
    var motes=[]; for(var j=0;j<30;j++) motes.push({x:rng(),y:rng(),v:0.1+rng()*0.3,sw:rng()*6.28,r:0.5+rng()*1.4});
    var t=0, PAD=0.08;
    function ratio(){ return clamp((_drag.excVal-cfg.min)/((cfg.max-cfg.min)||1),0,1); }
    function glyph(x,y,k,c){ ctx.strokeStyle=c; ctx.lineWidth=1.4; ctx.beginPath();
      if(k===0){ ctx.arc(x,y,4,0,6.283); } else if(k===1){ ctx.moveTo(x-4,y+4);ctx.lineTo(x,y-5);ctx.lineTo(x+4,y+4); }
      else if(k===2){ ctx.moveTo(x-4,y);ctx.lineTo(x+4,y);ctx.moveTo(x,y-4);ctx.lineTo(x,y+4); }
      else { ctx.moveTo(x-4,y-3);ctx.lineTo(x+4,y-3);ctx.lineTo(x,y+4);ctx.closePath(); } ctx.stroke(); }
    function draw(){
      var w=cv.width/dpr,h=cv.height/dpr,r=ratio();
      var bg=ctx.createLinearGradient(0,0,0,h); bg.addColorStop(0,'#1c130a'); bg.addColorStop(1,'#070402');
      ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
      var tg=ctx.createRadialGradient(w/2,-30,0,w/2,-30,h*1.1); tg.addColorStop(0,'rgba(255,200,110,0.18)'); tg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=tg; ctx.fillRect(0,0,w,h);
      var tx=w*0.08, tw=w*0.84, ty=h*0.2, th=h*0.62;
      ctx.fillStyle='#2a2417'; ctx.strokeStyle='#4c4124'; ctx.lineWidth=2;
      ctx.beginPath(); ctx.rect(tx,ty,tw,th); ctx.fill(); ctx.stroke();
      ctx.save(); ctx.beginPath(); ctx.rect(tx,ty,tw,th); ctx.clip();
      for(var i=0;i<glyphs.length;i++){ var gl=glyphs[i]; glyph(tx+12+gl.gx*(tw-24), ty+14+gl.gy*(th-28), gl.k, 'rgba(180,150,70,0.5)'); }
      ctx.restore();
      var brushX=tx+PAD*tw+(tw-2*PAD*tw)*r;
      ctx.save(); ctx.beginPath(); ctx.rect(brushX,ty,tx+tw-brushX,th); ctx.clip();
      var sg=ctx.createLinearGradient(0,ty,0,ty+th); sg.addColorStop(0,'#caa531'); sg.addColorStop(1,'#8f6f1c');
      ctx.fillStyle=sg; ctx.fillRect(brushX-4,ty,tw,th);
      ctx.fillStyle='rgba(255,235,170,0.5)'; ctx.beginPath(); ctx.moveTo(brushX-4,ty);
      for(var sx=brushX-4;sx<tx+tw+8;sx+=10){ ctx.lineTo(sx, ty+5+Math.sin(sx*0.08+t*2)*4); } ctx.lineTo(tx+tw+8,ty); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.strokeStyle=accent; ctx.lineWidth=2.5; ctx.shadowColor=accent; ctx.shadowBlur=16;
      ctx.beginPath(); ctx.moveTo(brushX,ty-6); ctx.lineTo(brushX,ty+th+6); ctx.stroke(); ctx.shadowBlur=0;
      ctx.fillStyle=accent; ctx.beginPath(); ctx.moveTo(brushX-7,ty-14); ctx.lineTo(brushX+7,ty-14); ctx.lineTo(brushX,ty-2); ctx.closePath(); ctx.fill();
      for(var m=0;m<motes.length;m++){ var mo=motes[m]; mo.y-=mo.v/CH; if(mo.y<0){mo.y=1;mo.x=rng();}
        var mx=mo.x*w, my=mo.y*h+Math.sin(t+mo.sw)*3; ctx.globalAlpha=0.25+0.4*(0.5+0.5*Math.sin(t*2+mo.sw));
        ctx.fillStyle='#e7c873'; ctx.beginPath(); ctx.arc(mx,my,mo.r,0,6.283); ctx.fill(); }
      ctx.globalAlpha=1;
    }
    function frame(){ if(!cv.isConnected) return; if(cv.offsetParent!==null){ t+=0.02; draw(); } _drag.excRaf=requestAnimationFrame(frame); }
    var dragging=false;
    function setFromEvent(e){ var rc=cv.getBoundingClientRect(); var w=rc.width, tx=w*0.08, tw=w*0.84;
      var x=clamp(e.clientX-rc.left-(tx+PAD*tw),0,(tw-2*PAD*tw)); var rr=x/((tw-2*PAD*tw)||1);
      var step=cfg.step||1, val=clamp(Math.round((cfg.min+rr*(cfg.max-cfg.min))/step)*step,cfg.min,cfg.max);
      _drag.excVal=val; var ve=document.getElementById('pd-exc-val'); if(ve) ve.textContent=val; }
    cv.addEventListener('pointerdown',function(e){ e.preventDefault(); dragging=true; try{cv.setPointerCapture(e.pointerId);}catch(_){} setFromEvent(e); });
    cv.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); setFromEvent(e); } });
    cv.addEventListener('pointerup',function(){ dragging=false; });
    keyNav(cv, function(){ return _drag.excVal; }, function(v){ _drag.excVal=v; var ve=document.getElementById('pd-exc-val'); if(ve) ve.textContent=v; }, cfg.question);
    frame();
  }

  /* ── ERA ── (cinematic discovery timeline: scrub a glowing playhead, streaking stars) */
  function buildEra() {
    var saved=loadGuess(), initVal=saved!==null?Number(saved):Math.round((cfg.min+cfg.max)/2);
    _drag.eraVal=initVal;
    return '<div class="pd-era">'
      + '<canvas class="pd-era-cv" id="pd-era-cv" height="260"></canvas>'
      + '<div class="pd-era-readout"><span id="pd-era-val">'+initVal+'</span>'
      +   (cfg.unit?'<span class="pd-era-unit">'+esc(cfg.unit)+'</span>':'')+'</div>'
      + '<p class="pd-era-hint">drag to scan across the decades</p>'
      + '</div>';
  }
  function initEra() {
    var cv=document.getElementById('pd-era-cv'); if(!cv) return;
    var ctx=cv.getContext('2d'); var accent=(getComputedStyle(document.body).getPropertyValue('--accent')||'').trim()||'#e879f9';
    var dpr=Math.min(window.devicePixelRatio||1,2), CH=260;
    function size(){ var w=cv.offsetWidth||640; cv.width=w*dpr; cv.height=CH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); window.addEventListener('resize',size);
    var rng=(function(){var s=550199;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0xffffffff;};})();
    var stars=[]; for(var i=0;i<90;i++) stars.push({x:rng(),y:rng(),z:0.3+rng()*0.7,r:rng()*1.4+0.3});
    function ratio(){ return clamp((_drag.eraVal-cfg.min)/((cfg.max-cfg.min)||1),0,1); }
    var t=0, PAD=0.08, lastR=ratio(), vel=0;
    function draw(){
      var w=cv.width/dpr,h=cv.height/dpr,r=ratio(),cy=h*0.5;
      vel=vel*0.85+(r-lastR)*0.15; lastR=r;
      ctx.fillStyle='#060912'; ctx.fillRect(0,0,w,h);
      for(var i=0;i<stars.length;i++){ var st=stars[i];
        st.x-=0.0006*st.z + vel*st.z*1.1; if(st.x<0)st.x+=1; if(st.x>1)st.x-=1;
        var sx=st.x*w, sy=st.y*h, streak=Math.min(42,Math.abs(vel)*1000*st.z);
        ctx.globalAlpha=0.3+st.z*0.5;
        if(streak>1){ ctx.strokeStyle='#bcd4ff'; ctx.lineWidth=st.r; ctx.beginPath(); ctx.moveTo(sx,sy); ctx.lineTo(sx+(vel>0?streak:-streak),sy); ctx.stroke(); }
        else { ctx.fillStyle='#bcd4ff'; ctx.beginPath(); ctx.arc(sx,sy,st.r,0,6.283); ctx.fill(); } }
      ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(255,255,255,0.14)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(w*PAD,cy); ctx.lineTo(w*(1-PAD),cy); ctx.stroke();
      var span=cfg.max-cfg.min, stepYr=span<=40?5:10, first=Math.ceil(cfg.min/stepYr)*stepYr;
      ctx.font='11px "DM Sans",sans-serif'; ctx.textAlign='center';
      for(var y=first;y<=cfg.max;y+=stepYr){ var txx=w*PAD+(y-cfg.min)/span*(w*(1-2*PAD));
        ctx.strokeStyle='rgba(255,255,255,0.22)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(txx,cy-8); ctx.lineTo(txx,cy+8); ctx.stroke();
        ctx.fillStyle='rgba(180,200,230,0.5)'; ctx.fillText(y,txx,cy+24); }
      var px=w*PAD+r*(w*(1-2*PAD));
      var pg=ctx.createLinearGradient(px-30,0,px+30,0); pg.addColorStop(0,'rgba(0,0,0,0)'); pg.addColorStop(.5,accent+'55'); pg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=pg; ctx.fillRect(px-30,0,60,h);
      ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.shadowColor=accent; ctx.shadowBlur=18; ctx.beginPath(); ctx.moveTo(px,18); ctx.lineTo(px,h-18); ctx.stroke();
      var pr=7+1.5*Math.sin(t*3); ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(px,cy,pr,0,6.283); ctx.fill();
      ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(px,cy,pr+5,0,6.283); ctx.stroke(); ctx.shadowBlur=0;
    }
    function frame(){ if(!cv.isConnected) return; if(cv.offsetParent!==null){ t+=0.03; draw(); } _drag.eraRaf=requestAnimationFrame(frame); }
    var dragging=false;
    function setFromEvent(e){ var rc=cv.getBoundingClientRect(); var w=rc.width;
      var x=clamp(e.clientX-rc.left-w*PAD,0,w*(1-2*PAD)); var rr=x/((w*(1-2*PAD))||1);
      var step=cfg.step||1, val=clamp(Math.round((cfg.min+rr*(cfg.max-cfg.min))/step)*step,cfg.min,cfg.max);
      _drag.eraVal=val; var ve=document.getElementById('pd-era-val'); if(ve) ve.textContent=val; }
    cv.addEventListener('pointerdown',function(e){ e.preventDefault(); dragging=true; try{cv.setPointerCapture(e.pointerId);}catch(_){} setFromEvent(e); });
    cv.addEventListener('pointermove',function(e){ if(dragging){ e.preventDefault(); setFromEvent(e); } });
    cv.addEventListener('pointerup',function(){ dragging=false; });
    keyNav(cv, function(){ return _drag.eraVal; }, function(v){ _drag.eraVal=v; var ve=document.getElementById('pd-era-val'); if(ve) ve.textContent=v; }, cfg.question);
    frame();
  }

  /* shared cosmic widget shell + horizontal-drag wiring */
  function cosShell(id, hint) {
    var s=loadGuess(), v=s!==null?Number(s):Math.round((cfg.min+cfg.max)/2);
    _drag[id+'Val']=v;
    return '<div class="pd-cos"><canvas class="pd-cos-cv" id="pd-'+id+'-cv" height="270"></canvas>'
      + '<div class="pd-cos-readout"><span id="pd-'+id+'-val">'+v+'</span>'
      +   (cfg.unit?'<span class="pd-cos-unit">'+esc(cfg.unit)+'</span>':'')+'</div>'
      + '<p class="pd-cos-hint">'+hint+'</p></div>';
  }
  function cosAccent(fb){ return (getComputedStyle(document.body).getPropertyValue('--accent')||'').trim()||fb; }
  function cosSetup(id, drawFn, vert){
    var cv=document.getElementById('pd-'+id+'-cv'); if(!cv) return;
    var ctx=cv.getContext('2d'), dpr=Math.min(window.devicePixelRatio||1,2), CH=270;
    function size(){ var w=cv.offsetWidth||640; cv.width=w*dpr; cv.height=CH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); window.addEventListener('resize',size);
    var t=0;
    function frame(){ if(!cv.isConnected) return; if(cv.offsetParent!==null){ t+=0.02; drawFn(ctx, cv.width/dpr, cv.height/dpr, t); } _drag[id+'Raf']=requestAnimationFrame(frame); }
    /* relative drag: from where you grabbed, drag UP (or right) to increase,
       DOWN (or left) to decrease - feels like a camera zoom / scrub knob */
    var drag=false, sx=0, sy=0, sr=0;
    function setE(e){
      var rc=cv.getBoundingClientRect(), travel=(vert?rc.height:rc.width)||1;
      var rr=clamp(sr + ((e.clientX-sx)-(e.clientY-sy))/travel, 0, 1);
      var val=clamp(snap(cfg.min+rr*(cfg.max-cfg.min)),cfg.min,cfg.max);
      _drag[id+'Val']=val; var ve=document.getElementById('pd-'+id+'-val'); if(ve) ve.textContent=val;
    }
    cv.addEventListener('pointerdown',function(e){ e.preventDefault(); drag=true; try{cv.setPointerCapture(e.pointerId);}catch(_){}
      sx=e.clientX; sy=e.clientY; sr=clamp((_drag[id+'Val']-cfg.min)/((cfg.max-cfg.min)||1),0,1); });
    cv.addEventListener('pointermove',function(e){ if(drag){ e.preventDefault(); setE(e); } });
    cv.addEventListener('pointerup',function(){ drag=false; });
    keyNav(cv, function(){ return _drag[id+'Val']; },
      function(v){ _drag[id+'Val']=v; var ve=document.getElementById('pd-'+id+'-val'); if(ve) ve.textContent=v; }, cfg.question);
    frame();
  }
  function cosRatio(id){ return clamp((_drag[id+'Val']-cfg.min)/((cfg.max-cfg.min)||1),0,1); }

  /* ── EXPAND ── (universe expanding; galaxies recede & redshift) */
  function buildExpand(){ return cosShell('exp','drag up or down to expand the universe'); }
  function initExpand(){
    var accent=cosAccent('#60a5fa');
    var rng=(function(){var s=7777;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0xffffffff;};})();
    var gx=[]; for(var i=0;i<64;i++) gx.push({a:rng()*6.283,d:0.08+rng()*0.92,sz:1+rng()*2.6,tw:rng()*6.28});
    cosSetup('exp', function(ctx,w,h,t){
      var cx=w/2,cy=h/2,r=cosRatio('exp'); ctx.fillStyle='#04060f'; ctx.fillRect(0,0,w,h);
      var a=0.25+r*1.55, maxd=Math.min(w,h)*0.52;
      for(var i=0;i<gx.length;i++){ var g=gx[i], dd=g.d*a, dist=Math.min(dd,1.18)*maxd, ang=g.a+t*0.03*(1-g.d);
        var px=cx+Math.cos(ang)*dist, py=cy+Math.sin(ang)*dist, rs=clamp((dd-0.35)/1.0,0,1);
        var col = rs<0.5 ? 'rgb('+Math.round(190+rs*130)+','+Math.round(215+rs*80)+',255)'
                         : 'rgb(255,'+Math.round(255-(rs-0.5)*330)+','+Math.round(255-(rs-0.5)*390)+')';
        var tw=0.55+0.45*Math.sin(t*2+g.tw); ctx.globalAlpha=tw*(1-rs*0.3); ctx.fillStyle=col; ctx.shadowColor=col; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.arc(px,py,g.sz*(0.7+0.3*tw),0,6.283); ctx.fill(); }
      ctx.shadowBlur=0; ctx.globalAlpha=1;
      var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,42); cg.addColorStop(0,'#fff'); cg.addColorStop(.4,accent); cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,30,0,6.283); ctx.fill();
    });
  }

  /* ── PARALLAX-STAR ── (drag a star nearer/farther; size ∝ 1/distance) */
  function buildParallax(){ return cosShell('par','drag up or down to move the star'); }
  function initParallax(){
    var accent=cosAccent('#93c5fd');
    var rng=(function(){var s=33199;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0xffffffff;};})();
    var far=[]; for(var i=0;i<110;i++) far.push({x:rng(),y:rng(),z:0.2+rng()*0.8,r:rng()*1.2+0.3,tw:rng()*6.28});
    cosSetup('par', function(ctx,w,h,t){
      var cx=w/2,cy=h/2,r=cosRatio('par'); ctx.fillStyle='#03050d'; ctx.fillRect(0,0,w,h);
      var dx=(r-0.5)*46;
      for(var i=0;i<far.length;i++){ var s=far[i], sx=((s.x+ (dx*s.z)/w)%1+1)%1*w, sy=s.y*h, tw=0.4+0.6*(0.5+0.5*Math.sin(t*2+s.tw));
        ctx.globalAlpha=tw*0.7; ctx.fillStyle='#cfe0ff'; ctx.beginPath(); ctx.arc(sx,sy,s.r,0,6.283); ctx.fill(); }
      ctx.globalAlpha=1;
      var sz=9+(1-r)*48, fx=cx-dx*0.6;
      var gg=ctx.createRadialGradient(fx,cy,0,fx,cy,sz*2.4); gg.addColorStop(0,'#fff'); gg.addColorStop(.3,accent); gg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(fx,cy,sz*2.2,0,6.283); ctx.fill();
      ctx.strokeStyle=accent; ctx.globalAlpha=0.8; ctx.lineWidth=2; var spk=sz*2.6+8*Math.sin(t*3);
      [[1,0],[0,1],[0.71,0.71],[0.71,-0.71]].forEach(function(d){ ctx.beginPath(); ctx.moveTo(fx-d[0]*spk,cy-d[1]*spk); ctx.lineTo(fx+d[0]*spk,cy+d[1]*spk); ctx.stroke(); });
      ctx.globalAlpha=1; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(fx,cy,sz*0.5,0,6.283); ctx.fill();
    });
  }

  /* ── STAR-LIFE ── (the Sun swells into a red giant) */
  function buildStarlife(){ return cosShell('sl','drag up or down through time'); }
  function initStarlife(){
    var accent=cosAccent('#fb7185');
    cosSetup('sl', function(ctx,w,h,t){
      var cx=w/2,cy=h/2,r=cosRatio('sl'); ctx.fillStyle='#070310'; ctx.fillRect(0,0,w,h);
      var maxR=Math.min(w,h)*0.40, rad=14+Math.pow(r,1.5)*maxR;
      var c1,c2; if(r<0.5){ c1='#fff7e0'; c2='rgb(255,'+Math.round(210-r*120)+',70)'; }
      else { var k=(r-0.5)*2; c1='rgb(255,'+Math.round(220-k*120)+',120)'; c2='rgb('+Math.round(240-k*30)+','+Math.round(90-k*55)+','+Math.round(40-k*22)+')'; }
      var orbitR=maxR*1.02, ex=cx+Math.cos(t*0.6)*orbitR, ey=cy+Math.sin(t*0.6)*orbitR*0.4;
      ctx.globalAlpha=clamp(1-(rad/(orbitR*0.92)),0,1); ctx.fillStyle='#5ab0ff'; ctx.shadowColor='#5ab0ff'; ctx.shadowBlur=8;
      ctx.beginPath(); ctx.arc(ex,ey,4,0,6.283); ctx.fill(); ctx.shadowBlur=0; ctx.globalAlpha=1;
      for(var f=0;f<10;f++){ var fa=t*0.5+f*0.628, fl=rad*(1.05+0.12*Math.sin(t*4+f)); ctx.globalAlpha=0.10;
        ctx.strokeStyle=c2; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx+Math.cos(fa)*rad*0.8,cy+Math.sin(fa)*rad*0.8); ctx.lineTo(cx+Math.cos(fa)*fl,cy+Math.sin(fa)*fl); ctx.stroke(); }
      ctx.globalAlpha=1;
      var g=ctx.createRadialGradient(cx,cy,0,cx,cy,rad*1.3); g.addColorStop(0,c1); g.addColorStop(.55,c2); g.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,rad*1.3,0,6.283); ctx.fill();
    });
  }

  /* ── PULSAR ── (spinning neutron star; spin rate ∝ value) */
  function buildPulsar(){ return cosShell('pul','drag up or down to spin faster'); }
  function initPulsar(){
    var accent=cosAccent('#a78bfa'); var ang=0;
    cosSetup('pul', function(ctx,w,h,t){
      var cx=w/2,cy=h/2,r=cosRatio('pul'); ang+=0.02+r*0.7;
      ctx.fillStyle='#05060f'; ctx.fillRect(0,0,w,h);
      ctx.strokeStyle='rgba(167,139,250,0.18)'; ctx.lineWidth=1;
      [0.5,0.8].forEach(function(e){ ctx.beginPath(); ctx.ellipse(cx,cy,Math.min(w,h)*0.5*e,Math.min(w,h)*0.22*e,ang*0.3,0,6.283); ctx.stroke(); });
      var len=Math.max(w,h)*0.6;
      [ang,ang+Math.PI].forEach(function(A){ ctx.save(); ctx.translate(cx,cy); ctx.rotate(A);
        var bg=ctx.createLinearGradient(0,0,len,0); bg.addColorStop(0,accent+'cc'); bg.addColorStop(1,'rgba(0,0,0,0)');
        ctx.fillStyle=bg; ctx.beginPath(); ctx.moveTo(0,-3); ctx.lineTo(len,-26); ctx.lineTo(len,26); ctx.lineTo(0,3); ctx.closePath(); ctx.fill(); ctx.restore(); });
      var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,26); cg.addColorStop(0,'#fff'); cg.addColorStop(.5,accent); cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,20+2*Math.sin(t*8),0,6.283); ctx.fill();
    });
  }

  /* ── WARP ── (spacetime gravity well; depth ∝ value) */
  function buildWarp(){ return cosShell('warp','drag up or down to deepen the well'); }
  function initWarp(){
    var accent=cosAccent('#67e8f9');
    cosSetup('warp', function(ctx,w,h,t){
      var cx=w/2,cy=h*0.38,r=cosRatio('warp'); ctx.fillStyle='#04070c'; ctx.fillRect(0,0,w,h);
      var maxR=Math.min(w,h)*0.46, dip=h*0.5*r, N=11;
      for(var k=0;k<=N;k++){ var fr=k/N, R=maxR*(1-fr*0.92), yoff=dip*fr*fr;
        ctx.strokeStyle='rgba(103,232,249,'+(0.10+fr*0.32)+')'; ctx.lineWidth=1.2;
        ctx.beginPath(); ctx.ellipse(cx,cy+yoff,R,R*0.42,0,0,6.283); ctx.stroke(); }
      var thY=cy+dip;
      var tg=ctx.createRadialGradient(cx,thY,0,cx,thY,maxR*0.22); tg.addColorStop(0,'#fff'); tg.addColorStop(.4,accent); tg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=tg; ctx.beginPath(); ctx.ellipse(cx,thY,maxR*0.2,maxR*0.1,0,0,6.283); ctx.fill();
      var pa=t*1.6, prog=(t*0.12)%1, pr=maxR*(1-prog)*0.9, py=cy+dip*prog*prog;
      ctx.fillStyle='#fff'; ctx.shadowColor=accent; ctx.shadowBlur=12;
      ctx.beginPath(); ctx.arc(cx+Math.cos(pa)*pr,py+Math.sin(pa)*pr*0.42,3,0,6.283); ctx.fill(); ctx.shadowBlur=0;
    });
  }

  /* ── DEPTH-PROBE ── (vertical: lower a probe through strata) */
  function buildDprobe(){ return cosShell('dprobe','drag the probe up &amp; down'); }
  function initDprobe(){
    var accent=cosAccent('#0ea5e9');
    var rng=(function(){var s=4242;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0xffffffff;};})();
    var bub=[]; for(var i=0;i<22;i++) bub.push({x:rng(),y:rng(),v:0.15+rng()*0.4,r:0.6+rng()*1.6});
    cosSetup('dprobe', function(ctx,w,h,t){
      var r=cosRatio('dprobe'), cx=w/2, top=16, py=top+r*(h-2*top);
      var g=ctx.createLinearGradient(0,0,0,h); g.addColorStop(0,'#0d2a3c'); g.addColorStop(.5,'#0a1622'); g.addColorStop(1,'#02060a');
      ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
      for(var k=1;k<=6;k++){ var y=k/7*h; ctx.strokeStyle='rgba(255,255,255,0.055)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke(); }
      for(var b=0;b<bub.length;b++){ var bb=bub[b]; bb.y-=bb.v/270; if(bb.y<0){bb.y=1;bb.x=rng();} ctx.globalAlpha=0.18+0.2*Math.sin(t*2+b); ctx.fillStyle=accent; ctx.beginPath(); ctx.arc(bb.x*w,bb.y*h,bb.r,0,6.283); ctx.fill(); }
      ctx.globalAlpha=1;
      ctx.strokeStyle='rgba(255,255,255,0.22)'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(cx,0); ctx.lineTo(cx,py); ctx.stroke();
      var pr=(t*42)%72; ctx.globalAlpha=clamp(1-pr/72,0,1); ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,py,14+pr,0,6.283); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillStyle=accent; ctx.shadowColor=accent; ctx.shadowBlur=22; ctx.beginPath(); ctx.ellipse(cx,py,12,16,0,0,6.283); ctx.fill(); ctx.shadowBlur=0;
      ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx,py-3,4,0,6.283); ctx.fill();
    }, true);
  }

  /* ── GLOBE ── (rotating Earth; drag to set ocean coverage) */
  function buildGlobe(){ return cosShell('globe','drag up or down to set the ocean'); }
  function initGlobe(){
    var accent=cosAccent('#0ea5e9');
    var rng=(function(){var s=9091;return function(){s=(s*1664525+1013904223)&0xffffffff;return (s>>>0)/0xffffffff;};})();
    var land=[]; for(var i=0;i<11;i++) land.push({lat:(rng()-0.5)*1.5,lon:rng()*6.28,sz:0.1+rng()*0.16});
    cosSetup('globe', function(ctx,w,h,t){
      var r=cosRatio('globe'), cx=w/2, cy=h/2+8, R=Math.min(w,h)*0.34;
      ctx.fillStyle='#04060f'; ctx.fillRect(0,0,w,h);
      var ag=ctx.createRadialGradient(cx,cy,R*0.92,cx,cy,R*1.3); ag.addColorStop(0,accent+'55'); ag.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=ag; ctx.beginPath(); ctx.arc(cx,cy,R*1.3,0,6.283); ctx.fill();
      var og=ctx.createRadialGradient(cx-R*0.3,cy-R*0.3,R*0.1,cx,cy,R); og.addColorStop(0,'#33b1e8'); og.addColorStop(1,'#063a5c');
      ctx.fillStyle=og; ctx.beginPath(); ctx.arc(cx,cy,R,0,6.283); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx,cy,R,0,6.283); ctx.clip();
      var ls=clamp((1-r)*1.7,0,1.5);
      for(var i=0;i<land.length;i++){ var l=land[i], lon=l.lon+t*0.18, depth=Math.cos(lon);
        if(depth<-0.15) continue; var x=cx+Math.sin(lon)*Math.cos(l.lat)*R, y=cy+Math.sin(l.lat)*R;
        ctx.globalAlpha=clamp(depth+0.35,0,1)*0.92; ctx.fillStyle='#4a8a3e';
        ctx.beginPath(); ctx.ellipse(x,y,l.sz*R*ls*(0.6+0.4*depth),l.sz*R*ls*0.8,0,0,6.283); ctx.fill(); }
      ctx.restore(); ctx.globalAlpha=1;
      var sg=ctx.createRadialGradient(cx-R*0.35,cy-R*0.35,0,cx-R*0.35,cy-R*0.35,R*0.8); sg.addColorStop(0,'rgba(255,255,255,0.4)'); sg.addColorStop(.5,'rgba(255,255,255,0)');
      ctx.fillStyle=sg; ctx.beginPath(); ctx.arc(cx,cy,R,0,6.283); ctx.fill();
    });
  }

  /* ── VESSEL ── (pour water into a cup; level ∝ value) */
  function buildVessel(){ return cosShell('vessel','drag up or down to pour water'); }
  function initVessel(){
    var accent=cosAccent('#fdba74');
    cosSetup('vessel', function(ctx,w,h,t){
      var r=cosRatio('vessel'), cx=w/2, cw=Math.min(w*0.42,190), top=h*0.16, bot=h*0.86, ch=bot-top;
      ctx.fillStyle='#0a0c12'; ctx.fillRect(0,0,w,h);
      function vx(yy){ var f=(yy-top)/ch; return (cw+(cw*0.8-cw)*f)/2; }
      var wl=bot-r*ch;
      ctx.save(); ctx.beginPath(); ctx.moveTo(cx-vx(top),top); ctx.lineTo(cx+vx(top),top); ctx.lineTo(cx+vx(bot),bot); ctx.lineTo(cx-vx(bot),bot); ctx.closePath(); ctx.clip();
      var wg=ctx.createLinearGradient(0,wl,0,bot); wg.addColorStop(0,accent); wg.addColorStop(1,'#9c5a2a');
      ctx.fillStyle=wg; ctx.fillRect(cx-cw,wl,cw*2,ch+10);
      ctx.fillStyle='rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.moveTo(cx-cw,wl);
      for(var x=cx-cw;x<=cx+cw;x+=8) ctx.lineTo(x,wl+Math.sin(x*0.09+t*3)*3); ctx.lineTo(cx+cw,wl+8); ctx.lineTo(cx-cw,wl+8); ctx.closePath(); ctx.fill();
      for(var bi=0;bi<8;bi++){ var by=bot-((t*40+bi*30)%(r*ch+1)); ctx.globalAlpha=0.3; ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(cx+Math.sin(bi*2+t)*cw*0.3,by,1.6,0,6.283); ctx.fill(); }
      ctx.globalAlpha=1; ctx.restore();
      ctx.strokeStyle='rgba(255,255,255,0.45)'; ctx.lineWidth=3; ctx.beginPath();
      ctx.moveTo(cx-vx(top),top); ctx.lineTo(cx-vx(bot),bot); ctx.lineTo(cx+vx(bot),bot); ctx.lineTo(cx+vx(top),top); ctx.stroke();
    });
  }

  /* ── DRIFT ── (tectonic plates separating; gap ∝ speed) */
  function buildDrift(){ return cosShell('drift','drag up or down to set the speed'); }
  function initDrift(){
    var accent=cosAccent('#a8a29e');
    cosSetup('drift', function(ctx,w,h,t){
      var r=cosRatio('drift'), cx=w/2, cy=h/2, gap=18+r*70+ (Math.sin(t*1.5)*r*6), ph=92;
      ctx.fillStyle='#0a0c10'; ctx.fillRect(0,0,w,h);
      var mg=ctx.createLinearGradient(cx-gap,0,cx+gap,0); mg.addColorStop(0,'rgba(0,0,0,0)'); mg.addColorStop(.5,accent); mg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=mg; ctx.globalAlpha=0.5+0.3*Math.sin(t*4); ctx.fillRect(cx-gap,cy-ph/2,gap*2,ph); ctx.globalAlpha=1;
      [[0,cx-gap],[cx+gap,w]].forEach(function(seg,si){
        ctx.fillStyle='#39352f'; ctx.fillRect(seg[0],cy-ph/2,seg[1]-seg[0],ph);
        ctx.strokeStyle='rgba(0,0,0,0.25)'; ctx.lineWidth=1;
        for(var k=1;k<4;k++){ var y=cy-ph/2+k*ph/4; ctx.beginPath(); ctx.moveTo(seg[0],y); ctx.lineTo(seg[1],y); ctx.stroke(); }
        ctx.fillStyle=accent; ctx.font='16px "DM Sans"'; ctx.textAlign='center'; ctx.globalAlpha=0.6;
        ctx.fillText(si?'→':'←', si?seg[0]+26:seg[1]-26, cy+5); ctx.globalAlpha=1;
      });
      var rg=ctx.createRadialGradient(cx,cy,0,cx,cy,gap+14); rg.addColorStop(0,'#fff'); rg.addColorStop(.4,accent); rg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=rg; ctx.fillRect(cx-gap-14,cy-ph/2,gap*2+28,ph);
    });
  }

  /* ── WHEEL ── (radial count dial with tick ring) */
  function buildWheel(){ return cosShell('wheel','turn the dial to set the count'); }
  function initWheel(){
    var cv=document.getElementById('pd-wheel-cv'); if(!cv) return;
    var ctx=cv.getContext('2d'), accent=cosAccent('#f59e0b'), dpr=Math.min(window.devicePixelRatio||1,2), CH=270;
    function size(){ var w=cv.offsetWidth||640; cv.width=w*dpr; cv.height=CH*dpr; ctx.setTransform(dpr,0,0,dpr,0,0); }
    size(); window.addEventListener('resize',size); var t=0;
    function draw(){
      var w=cv.width/dpr,h=cv.height/dpr,cx=w/2,cy=h*0.58,R=Math.min(w,h*1.1)*0.3,r=cosRatio('wheel');
      ctx.fillStyle='#08060f'; ctx.fillRect(0,0,w,h);
      for(var i=0;i<48;i++){ var a=-Math.PI/2+i/48*6.283, hi=i%6===0, r1=R*(hi?0.86:0.92), r2=R;
        ctx.strokeStyle=hi?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.18)'; ctx.lineWidth=hi?2:1;
        ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1); ctx.lineTo(cx+Math.cos(a)*r2,cy+Math.sin(a)*r2); ctx.stroke(); }
      ctx.strokeStyle='rgba(255,255,255,0.10)'; ctx.lineWidth=8; ctx.beginPath(); ctx.arc(cx,cy,R*0.7,0,6.283); ctx.stroke();
      ctx.strokeStyle=accent; ctx.lineWidth=8; ctx.shadowColor=accent; ctx.shadowBlur=16; ctx.lineCap='round';
      ctx.beginPath(); ctx.arc(cx,cy,R*0.7,-Math.PI/2,-Math.PI/2+r*6.283); ctx.stroke(); ctx.shadowBlur=0; ctx.lineCap='butt';
      var ha=-Math.PI/2+r*6.283, hx=cx+Math.cos(ha)*R*0.7, hy=cy+Math.sin(ha)*R*0.7;
      ctx.fillStyle='#fff'; ctx.shadowColor=accent; ctx.shadowBlur=18; ctx.beginPath(); ctx.arc(hx,hy,9,0,6.283); ctx.fill(); ctx.shadowBlur=0;
      ctx.strokeStyle=accent; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(hx,hy,13,0,6.283); ctx.stroke();
      var cg=ctx.createRadialGradient(cx,cy,0,cx,cy,R*0.4); cg.addColorStop(0,accent+'33'); cg.addColorStop(1,'rgba(0,0,0,0)');
      ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,R*0.4,0,6.283); ctx.fill();
    }
    function frame(){ if(!cv.isConnected) return; if(cv.offsetParent!==null){ t+=0.02; draw(); } _drag.wheelRaf=requestAnimationFrame(frame); }
    var drag=false;
    function setE(e){ var rc=cv.getBoundingClientRect(), cx=rc.left+rc.width/2, cy=rc.top+rc.height*0.58;
      var ft=Math.atan2(e.clientY-cy,e.clientX-cx)+Math.PI/2; if(ft<0)ft+=6.283;
      var rr=ft/6.283, st=cfg.step||1, val=clamp(Math.round((cfg.min+rr*(cfg.max-cfg.min))/st)*st,cfg.min,cfg.max);
      _drag.wheelVal=val; var ve=document.getElementById('pd-wheel-val'); if(ve) ve.textContent=val; }
    cv.addEventListener('pointerdown',function(e){ e.preventDefault(); drag=true; try{cv.setPointerCapture(e.pointerId);}catch(_){} setE(e); });
    cv.addEventListener('pointermove',function(e){ if(drag){ e.preventDefault(); setE(e); } });
    cv.addEventListener('pointerup',function(){ drag=false; });
    keyNav(cv, function(){ return _drag.wheelVal; }, function(v){ _drag.wheelVal=v; var ve=document.getElementById('pd-wheel-val'); if(ve) ve.textContent=v; }, cfg.question);
    frame();
  }

  /* ── MIRROR ── (find the symmetry centre; halves balance) */
  function buildMirror(){ return cosShell('mirror','drag up or down to find the centre'); }
  function initMirror(){
    var accent=cosAccent('#4ade80');
    cosSetup('mirror', function(ctx,w,h,t){
      var r=cosRatio('mirror'), val=_drag.mirrorVal, P=w*0.08, lane=w-2*P, dx=P+r*lane, cy=h*0.52, bh=80;
      ctx.fillStyle='#07120a'; ctx.fillRect(0,0,w,h);
      var left=Math.round(val-cfg.min), right=Math.round(cfg.max-val), bal=Math.abs(left-right)<=(cfg.step||1)*1.5;
      var lg=ctx.createLinearGradient(P,0,dx,0); lg.addColorStop(0,'rgba(0,0,0,0.1)'); lg.addColorStop(1,accent+'66');
      ctx.fillStyle=lg; ctx.fillRect(P,cy-bh/2,dx-P,bh);
      var rg=ctx.createLinearGradient(dx,0,w-P,0); rg.addColorStop(0,accent+'66'); rg.addColorStop(1,'rgba(0,0,0,0.1)');
      ctx.fillStyle=rg; ctx.fillRect(dx,cy-bh/2,(w-P)-dx,bh);
      var gap=11, tickH=bal?bh*0.46:16; ctx.strokeStyle='rgba(255,255,255,0.28)'; ctx.lineWidth=1.5;
      for(var i=1;i<60;i++){ var xl=dx-i*gap, xr=dx+i*gap; if(xl<P && xr>w-P) break;
        if(xl>P){ ctx.beginPath(); ctx.moveTo(xl,cy-bh/2); ctx.lineTo(xl,cy-bh/2+tickH); ctx.stroke(); }
        if(xr<w-P){ ctx.beginPath(); ctx.moveTo(xr,cy-bh/2); ctx.lineTo(xr,cy-bh/2+tickH); ctx.stroke(); } }
      var col=bal?'#22c55e':accent; ctx.strokeStyle=col; ctx.lineWidth=3; ctx.shadowColor=col; ctx.shadowBlur=bal?24:12;
      ctx.beginPath(); ctx.moveTo(dx,cy-bh/2-14); ctx.lineTo(dx,cy+bh/2+14); ctx.stroke(); ctx.shadowBlur=0;
      ctx.font='12px "DM Sans"'; ctx.textAlign='center'; ctx.fillStyle='rgba(255,255,255,0.7)';
      ctx.fillText(left+' before', P+(dx-P)/2, cy+bh/2+24);
      ctx.fillText(right+' after', dx+((w-P)-dx)/2, cy+bh/2+24);
      if(bal){ ctx.fillStyle='#22c55e'; ctx.font='700 11px "DM Sans"'; ctx.fillText('⟷ symmetric', w/2, cy-bh/2-24); }
    });
  }

  /* ─────────────────────────────────────────────────────────────
     buildSp - assemble prediction stage HTML and init drag widgets
  ───────────────────────────────────────────────────────────── */
  function buildSp() {
    var sp = document.getElementById('sp');
    if (!sp) return;
    var type = cfg.inputType || 'slider';
    var needsDisabled = (type==='choice'||type==='magnitude'||type==='binary-chain'||type==='card-flip'||type==='number-pad');

    var inner = '<div class="predict-wrap">'
      + '<p class="predict-eyebrow">Before we show you anything —</p>'
      + '<p class="predict-q">'+esc(cfg.question)+'</p>'
      + '<p class="predict-hint">Commit to your prediction. Your guess will be revealed next to the real answer.</p>'
      + '<p class="predict-social">Most people who see this don\'t believe it at first - what do you think?</p>';

    if (type==='slider')        inner += buildSlider();
    else if (type==='choice')   inner += buildChoice();
    else if (type==='number-pad') inner += buildNumberPad();
    else if (type==='dial')     inner += buildDial();
    else if (type==='timeline') inner += buildTimeline();
    else if (type==='split')    inner += buildSplit();
    else if (type==='thermometer') inner += buildThermometer();
    else if (type==='magnitude') inner += buildMagnitude();
    else if (type==='binary-chain') inner += buildBinaryChain();
    else if (type==='card-flip') inner += buildCardFlip();
    else if (type==='scale-balance') inner += buildScaleBalance();
    else if (type==='orbit')    inner += buildOrbit();
    else if (type==='furnace')  inner += buildFurnace();
    else if (type==='excavate') inner += buildExcavate();
    else if (type==='era')      inner += buildEra();
    else if (type==='expand')   inner += buildExpand();
    else if (type==='parallax') inner += buildParallax();
    else if (type==='starlife') inner += buildStarlife();
    else if (type==='pulsar')   inner += buildPulsar();
    else if (type==='warp')     inner += buildWarp();
    else if (type==='dprobe')   inner += buildDprobe();
    else if (type==='globe')    inner += buildGlobe();
    else if (type==='vessel')   inner += buildVessel();
    else if (type==='drift')    inner += buildDrift();
    else if (type==='wheel')    inner += buildWheel();
    else if (type==='mirror')   inner += buildMirror();
    else inner += buildSlider(); /* fallback */

    inner += '<button class="predict-submit" id="pd-submit"'
      + (needsDisabled ? ' disabled' : '')
      + ' onclick="Prediction.submit()">Lock in my answer →</button>'
      + '</div>';

    sp.innerHTML = inner;

    /* init pointer-based widgets */
    if (type==='dial')         setTimeout(initDial, 20);
    if (type==='timeline')     setTimeout(initTimeline, 20);
    if (type==='split')        setTimeout(initSplit, 20);
    if (type==='thermometer')  setTimeout(initThermometer, 20);
    if (type==='scale-balance') setTimeout(initScaleBalance, 20);
    if (type==='orbit')        setTimeout(initOrbit, 20);
    if (type==='furnace')      setTimeout(initFurnace, 20);
    if (type==='excavate')     setTimeout(initExcavate, 20);
    if (type==='era')          setTimeout(initEra, 20);
    if (type==='expand')       setTimeout(initExpand, 20);
    if (type==='parallax')     setTimeout(initParallax, 20);
    if (type==='starlife')     setTimeout(initStarlife, 20);
    if (type==='pulsar')       setTimeout(initPulsar, 20);
    if (type==='warp')         setTimeout(initWarp, 20);
    if (type==='dprobe')       setTimeout(initDprobe, 20);
    if (type==='globe')        setTimeout(initGlobe, 20);
    if (type==='vessel')       setTimeout(initVessel, 20);
    if (type==='drift')        setTimeout(initDrift, 20);
    if (type==='wheel')        setTimeout(initWheel, 20);
    if (type==='mirror')       setTimeout(initMirror, 20);
  }

  /* ─────────────────────────────────────────────────────────────
     Reaction text
  ───────────────────────────────────────────────────────────── */
  function reactionText(guess, correct) {
    /* non-numeric (choice/card-flip with string correct values) */
    var gNum = Number(guess), cNum = Number(correct);
    if (isNaN(gNum) || isNaN(cNum)) {
      var match = String(guess).trim().toLowerCase() === String(correct).trim().toLowerCase();
      return match
        ? 'You had a feeling. Now see the evidence behind it.'
        : 'Now see why the answer is what it is - and why it matters.';
    }
    var gap = Math.abs(gNum - cNum);
    var pct = cNum > 0 ? (gap/cNum*100) : gap;
    if (gap===0)   return 'You got it exactly. Now see where it comes from.';
    if (pct<=5)    return 'Remarkably close. Even that small gap tells a story.';
    if (pct<=15)   return 'Not far off - but the precise number is what makes this extraordinary.';
    if (pct<=35)   return 'Most people guess in that range. The real answer surprises everyone.';
    return 'That\'s what almost everyone guesses. The real answer is one of the most striking in Quranic science.';
  }

  /* ─────────────────────────────────────────────────────────────
     buildReveal - inject gap panel into top of S0
  ───────────────────────────────────────────────────────────── */
  function buildReveal(fresh) {
    var container = document.getElementById('predictReveal');
    if (!container) return;
    var guess = loadGuess();
    if (guess === null) { container.style.display='none'; return; }
    container.style.display='';

    var gNum = Number(guess), cNum = Number(cfg.correct);
    var isNumeric = !isNaN(gNum) && !isNaN(cNum);
    var isMatch = isNumeric ? gNum === cNum
                            : String(guess).trim().toLowerCase() === String(cfg.correct).trim().toLowerCase();

    /* gap block - only shown for numeric types */
    var gapBlock = '';
    if (isNumeric) {
      var gap = Math.abs(gNum - cNum);
      var gapStr = gap===0 ? 'Exact!' : (gNum>cNum?'+':'-')+gap+(cfg.unit||'');
      gapBlock = '<div class="pr-gap"><div class="pr-gap-num">'+esc(gapStr)+'</div>'
               + '<div class="pr-gap-lbl">'+(gap===0?'spot on':'off')+'</div></div>';
    } else {
      /* for text answers show a match/mismatch indicator */
      gapBlock = '<div class="pr-gap"><div class="pr-gap-num" style="font-size:22px">'+(isMatch?'✓':'✗')+'</div>'
               + '<div class="pr-gap-lbl">'+(isMatch?'correct':'different')+'</div></div>';
    }

    var continueLabel = isNumeric
      ? 'Show me where this number comes from →'
      : 'Show me the full discovery →';

    var s0 = document.getElementById('s0');
    if (fresh && s0) s0.classList.add('pred-landing');

    container.innerHTML = '<div class="predict-reveal">'
      + '<div class="pr-block"><div class="pr-label">Your guess</div>'
      + '<div class="pr-num yours" style="font-size:clamp(16px,4vw,24px)">'+esc(guess)+'</div></div>'
      + '<div class="pr-vs">→</div>'
      + '<div class="pr-block"><div class="pr-label">The answer</div>'
      + '<div class="pr-num actual" style="font-size:clamp(16px,4vw,24px)">'+esc(cfg.correctLabel||String(cfg.correct))+'</div></div>'
      + gapBlock
      + '</div>'
      + '<p class="pr-reaction">'+esc(reactionText(guess, cfg.correct))+'</p>'
      + (fresh ? '<button class="pr-continue" onclick="Prediction.continueToLesson()">'+continueLabel+'</button>' : '');
  }

  /* ─────────────────────────────────────────────────────────────
     buildSeed - curiosity teaser at end of S4
  ───────────────────────────────────────────────────────────── */
  function buildSeed() {
    var c = document.getElementById('curiositySeed');
    if (!c || !cfg.curiositySeed) return;
    var seed = cfg.curiositySeed;
    c.innerHTML = '<div class="curiosity-seed">'
      + '<div class="cs-eyebrow">Before you go —</div>'
      + '<div class="cs-question">'+esc(seed.question)+'</div>'
      + '<div class="cs-choices">'
      + '<button class="cs-btn" onclick="Prediction._sc(\''+esc(seed.nextUrl||'')+'\')">Yes, probably</button>'
      + '<button class="cs-btn" onclick="Prediction._sc(\''+esc(seed.nextUrl||'')+'\')">Doubt it</button>'
      + '<button class="cs-btn" onclick="Prediction._sc(\''+esc(seed.nextUrl||'')+'\')">No idea</button>'
      + '</div>'
      + (seed.nextUrl ? '<a href="'+esc(seed.nextUrl)+'" class="cs-next-link">Find out in the next lesson →</a>' : '')
      + '</div>';
  }

  /* ─────────────────────────────────────────────────────────────
     Public API
  ───────────────────────────────────────────────────────────── */
  G.Prediction = {

    init: function(config) {
      cfg = config;
      STORE_KEY = 'qn_pred_'+(cfg.lessonId||'default');
      injectCSS();
      buildSp();
      buildReveal();
      buildSeed();
      if (loadGuess() !== null) {
        var sp=document.getElementById('sp'), s0=document.getElementById('s0');
        if(sp&&s0){ sp.classList.remove('active'); s0.classList.add('active'); }
      }
    },

    submit: function() {
      var guess;
      var type = cfg.inputType || 'slider';
      if (type==='choice') {
        var sel=document.querySelector('.predict-choice.selected'); if(!sel) return; guess=sel.dataset.val;
      } else if (type==='number-pad') {
        if(!_drag.npVal) return; guess=_drag.npVal;
      } else if (type==='dial') {
        guess=String(_drag.dialVal!==undefined?_drag.dialVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='timeline') {
        guess=String(_drag.tlVal!==undefined?_drag.tlVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='split') {
        guess=String(Math.round(_drag.splitPct!==undefined?_drag.splitPct:50));
      } else if (type==='thermometer') {
        guess=String(_drag.thermVal!==undefined?_drag.thermVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='magnitude') {
        var ms=document.querySelector('.pd-mag-item.sel'); if(!ms) return; guess=ms.dataset.val;
      } else if (type==='binary-chain') {
        if(_drag.bcVal===undefined) return; guess=String(_drag.bcVal);
      } else if (type==='card-flip') {
        var cs=document.querySelector('.pd-card.sel'); if(!cs) return; guess=cs.dataset.val;
      } else if (type==='scale-balance') {
        guess=String(_drag.balVal!==undefined?_drag.balVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='orbit') {
        guess=String(_drag.orbitVal!==undefined?_drag.orbitVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='furnace') {
        guess=String(_drag.furnVal!==undefined?_drag.furnVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='excavate') {
        guess=String(_drag.excVal!==undefined?_drag.excVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='era') {
        guess=String(_drag.eraVal!==undefined?_drag.eraVal:Math.round((cfg.min+cfg.max)/2));
      } else if (type==='expand'||type==='parallax'||type==='starlife'||type==='pulsar'||type==='warp'||type==='dprobe'||type==='globe'||type==='vessel'||type==='drift'||type==='wheel'||type==='mirror') {
        var k={expand:'expVal',parallax:'parVal',starlife:'slVal',pulsar:'pulVal',warp:'warpVal',dprobe:'dprobeVal',globe:'globeVal',vessel:'vesselVal',drift:'driftVal',wheel:'wheelVal',mirror:'mirrorVal'}[type];
        guess=String(_drag[k]!==undefined?_drag[k]:Math.round((cfg.min+cfg.max)/2));
      } else {
        var sl=document.getElementById('pd-slider'); if(!sl) return; guess=sl.value;
      }
      saveGuess(guess);
      var sp=document.getElementById('sp'), s0=document.getElementById('s0');
      if(sp) sp.classList.remove('active');
      if(s0) s0.classList.add('active');
      buildReveal(true);
      window.scrollTo(0,0);
    },

    continueToLesson: function() {
      var s0=document.getElementById('s0');
      if(s0) s0.classList.remove('pred-landing');
      buildReveal(false);
      /* Hero canvas was initialised while s0 was hidden (getBoundingClientRect → 0×0).
         Reset the guard and re-run now that the canvas is visible. */
      var hc=document.getElementById('heroCanvas');
      if(hc){ hc._hcInit=false; }
      if(typeof initHeroCanvas==='function') setTimeout(initHeroCanvas,20);
      window.scrollTo(0,0);
    },

    onS0: function() { buildReveal(); },
    reset: function() { try{ localStorage.removeItem(STORE_KEY); }catch(e){} },

    /* data for the shareable discovery card (read by theme.js) */
    shareInfo: function() {
      if (!cfg) return null;
      return { question: cfg.question || '',
               answer: cfg.correctLabel || (cfg.correct!=null ? String(cfg.correct) : ''),
               unit: cfg.unit || '', lessonId: cfg.lessonId || '' };
    },

    /* twin-count data for the "count them yourself" S1 proof (scale-balance lessons) */
    twinData: function() {
      if (!cfg || cfg.inputType !== 'scale-balance') return null;
      return { la: cfg.leftArabic||'', ll: cfg.leftLabel||'', lc: Number(cfg.leftCount),
               ra: cfg.rightArabic||'', rl: cfg.rightLabel||'', rc: Number(cfg.correct), unit: cfg.unit||'' };
    },

    /* Slider - live value + animated fill track */
    _sm: function(el) {
      var v=document.getElementById('pd-val'); if(v) v.textContent=el.value;
      var pct=((+el.value - +el.min)/((+el.max - +el.min)||1))*100;
      el.style.background='linear-gradient(90deg,var(--accent,var(--gold)) '+pct.toFixed(1)+'%,var(--surface2) '+pct.toFixed(1)+'%)';
    },

    /* Choice */
    _pc: function(el) {
      document.querySelectorAll('.predict-choice').forEach(function(b){ b.classList.remove('selected'); });
      el.classList.add('selected');
      var s=document.getElementById('pd-submit'); if(s) s.disabled=false;
    },

    /* Number pad */
    _nk: function(k) {
      var maxLen = String(Math.abs(cfg.max||9999)).length;
      if (k==='clr') { _drag.npVal=''; }
      else if (k==='del') { _drag.npVal=(_drag.npVal||'').slice(0,-1); }
      else {
        if ((_drag.npVal||'').length >= maxLen) return;
        _drag.npVal = (_drag.npVal||'') + k;
      }
      var el=document.getElementById('pd-npv'), d=document.getElementById('pd-npd');
      var s=document.getElementById('pd-submit');
      if(el){
        if(_drag.npVal){
          el.textContent=_drag.npVal; el.classList.remove('empty');
          if(d) d.classList.add('lit');
          if(s) s.disabled=false;
        } else {
          el.textContent='enter a number'; el.classList.add('empty');
          if(d) d.classList.remove('lit');
          if(s) s.disabled=true;
        }
      }
    },

    /* Magnitude */
    _mag: function(el) {
      document.querySelectorAll('.pd-mag-item').forEach(function(m){ m.classList.remove('sel'); });
      el.classList.add('sel');
      var s=document.getElementById('pd-submit'); if(s) s.disabled=false;
    },

    /* Binary chain */
    _bc: function(yes) {
      var state=_drag.bcState;
      if(!state||state.step>=3) return;
      var pivot=Math.round((state.lo+state.hi)/2);

      /* mark current step done */
      var stepEl=document.getElementById('pd-bc-s'+state.step);
      var btnsEl=document.getElementById('pd-bc-b'+state.step);
      if(stepEl) stepEl.classList.replace('active','done');
      if(btnsEl) btnsEl.innerHTML='<span class="pd-bc-btn picked">'+(yes?'Yes ↑':'No ↓')+'</span>';

      /* narrow range */
      if(yes) state.lo=pivot; else state.hi=pivot;
      state.step++;

      /* update band */
      var totalRange=cfg.max-cfg.min;
      var bl=((state.lo-cfg.min)/totalRange)*100;
      var bw=((state.hi-state.lo)/totalRange)*100;
      var band=document.getElementById('pd-bc-band');
      var range=document.getElementById('pd-bc-range');
      if(band){ band.style.left=bl+'%'; band.style.width=bw+'%'; }
      if(range) range.textContent=state.lo+(cfg.unit||'')+' – '+state.hi+(cfg.unit||'');

      if(state.step<3) {
        /* activate next step */
        var nextPivot=Math.round((state.lo+state.hi)/2);
        var nextStep=document.getElementById('pd-bc-s'+state.step);
        var nextQ=document.getElementById('pd-bc-q'+state.step);
        var nextBtns=document.getElementById('pd-bc-b'+state.step);
        if(nextStep) nextStep.classList.add('active');
        if(nextQ) nextQ.textContent='Is it more than '+nextPivot+(cfg.unit||'')+'?';
        if(nextBtns) nextBtns.innerHTML=
          '<button class="pd-bc-btn" onclick="Prediction._bc(true)">Yes</button>'
          +'<button class="pd-bc-btn" onclick="Prediction._bc(false)">No</button>';
      } else {
        /* done */
        var mid=Math.round((state.lo+state.hi)/2);
        _drag.bcVal=mid;
        var commit=document.getElementById('pd-bc-commit');
        if(commit) commit.innerHTML='Your prediction<b>'+mid+(cfg.unit||'')+'</b>';
        var sub=document.getElementById('pd-submit'); if(sub) sub.disabled=false;
      }
    },

    /* Card flip */
    _card: function(idx) {
      var cards=document.querySelectorAll('.pd-card');
      cards.forEach(function(c,i){
        c.classList.remove('sel','faded');
        if(i===idx){ c.classList.add('flip','sel'); }
        else { c.classList.add('faded'); }
      });
      var s=document.getElementById('pd-submit'); if(s) s.disabled=false;
    },
    /* card-flip keyboard activate */
    _ck: function(e, idx) { if(e.key==='Enter'||e.key===' '||e.key==='Spacebar'){ e.preventDefault(); this._card(idx); } },

    /* Seed click */
    _sc: function(url) {
      if(url) setTimeout(function(){ window.location.href=url; },200);
    }
  };

})(window);
