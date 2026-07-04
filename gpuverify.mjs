/**
 * gpuverify.mjs - proper GPU scene verification harness
 * Usage:  node gpuverify.mjs [sceneId|all]
 *
 * Fixes all earlier verification bugs:
 *  ✓ Runs over HTTP (not file://) - avoids WebGL software-mode restriction
 *  ✓ Isolated page per scene - no WebGL context exhaustion
 *  ✓ Canvas is visible + sized - readPixels returns real values
 *  ✓ Captures console.error - catches GLSL compile failures
 *  ✓ 9-point pixel sampling - detects flat/black renders
 *  ✓ 2.6s wait - lets animation settle before sampling
 *  ✓ Generates HTML on-the-fly from the same server origin
 */
import puppeteer from 'puppeteer-core';
import { createServer } from 'http';
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

const ROOT = process.cwd();
const PORT = 9977;

/* ── Static file server that also serves dynamic test pages ── */
const srv = createServer((req, res) => {
  const url = req.url.split('?')[0];

  /* Dynamic test page for any scene: /test/SCENE_ID */
  if (url.startsWith('/test/')) {
    const scene = url.slice(6);
    const accent = '#60a5fa';
    const html = `<!DOCTYPE html>
<html data-theme="dark">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0b1622;--accent:${accent};--accent-light:#93c5fd">
  <canvas id="c" style="width:640px;height:130px;display:block;position:absolute;top:0;left:0"></canvas>
  <script src="/gpu.js?v=test"></script>
  <script>
    var cv = document.getElementById('c');
    cv.width = 640; cv.height = 130;
    document.documentElement.setAttribute('data-theme','dark');
    try { GPU.mount(cv, '${scene}'); }
    catch(e) { console.error('MOUNT:'+e.message); }
  </script>
</body></html>`;
    res.writeHead(200, {'Content-Type':'text/html','Access-Control-Allow-Origin':'*'});
    res.end(html);
    return;
  }

  /* Static files */
  const file = join(ROOT, url);
  if (!existsSync(file) || url === '/') { res.writeHead(404); res.end(); return; }
  const ext = extname(file);
  const types = { '.js':'text/javascript','.html':'text/html','.css':'text/css' };
  try {
    res.writeHead(200, {'Content-Type': types[ext]||'text/plain'});
    res.end(readFileSync(file));
  } catch(e) { res.writeHead(500); res.end(e.message); }
});
srv.listen(PORT);
await new Promise(r => srv.on('listening', r));

const BASE = `http://localhost:${PORT}`;

/* ── Extract all registered scene IDs from gpu.js ── */
const gpuSrc = readFileSync('gpu.js', 'utf8');
const sceneIds = [...gpuSrc.matchAll(/GPU\.Scenes\['([\w-]+)'\]\s*=/g)].map(m => m[1]);
console.log(`\n┌─ GPU verification harness`);
console.log(`│  Scenes registered: ${sceneIds.length}`);

const arg = process.argv[2];
const toTest = (arg && arg !== 'all') ? [arg] : sceneIds;
console.log(`│  Testing: ${toTest.length === sceneIds.length ? 'all' : toTest.join(', ')}`);
console.log(`└${'─'.repeat(58)}\n`);

/* ── Puppeteer browser ── */
const browser = await puppeteer.launch({
  executablePath: '/usr/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--enable-webgl', '--ignore-gpu-blocklist'],
});

const results = { ok: [], warn: [], fail: [] };

for (const scene of toTest) {
  const page = await browser.newPage();
  const glErrs = [];
  page.on('console', m => {
    if (m.type() === 'error') glErrs.push(m.text().slice(0, 200));
  });
  page.on('pageerror', e => glErrs.push('JS: ' + e.message.slice(0, 150)));

  /* Navigate to same-origin dynamic test page for this scene */
  await page.setViewport({ width: 700, height: 180, deviceScaleFactor: 1 });
  await page.goto(`${BASE}/test/${scene}`, { waitUntil: 'load' });

  /* Wait for animation (cosmos nebula needs 2.5s to show interesting content) */
  await new Promise(r => setTimeout(r, 2700));

  /* ── Sample 9 pixels across the canvas ── */
  const samples = await page.evaluate(() => {
    const cv = document.getElementById('c');
    if (!cv) return { err: 'no-canvas' };
    const gl = cv.getContext('webgl');
    if (!gl) return { err: 'no-webgl' };
    const W = cv.width, H = cv.height;
    const pts = [
      [W*0.1, H*0.2], [W*0.3, H*0.2], [W*0.5, H*0.2],
      [W*0.1, H*0.5], [W*0.5, H*0.5], [W*0.9, H*0.5],
      [W*0.2, H*0.8], [W*0.5, H*0.8], [W*0.8, H*0.8],
    ];
    return {
      pixels: pts.map(([x, y]) => {
        const px = new Uint8Array(4);
        gl.readPixels(x|0, (H - y)|0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
        return Array.from(px);
      }),
      w: W, h: H,
    };
  });

  /* Screenshot */
  const cvEl = await page.$('#c');
  if (cvEl) await cvEl.screenshot({ path: `/tmp/gpv-${scene}.png` });

  await page.close();

  /* ── Analyse ── */
  if (!samples?.pixels) {
    const reason = samples?.err || 'no data';
    results.fail.push({ scene, reason });
    console.log(`  ✗ FAIL  ${scene.padEnd(26)} ${reason}`);
    continue;
  }

  const px = samples.pixels;
  const allTransparent = px.every(p => p[3] === 0);
  const allBlack = px.every(p => p[3] === 255 && p[0]+p[1]+p[2] < 10);
  const allSame = px.every(p => JSON.stringify(p) === JSON.stringify(px[0]));
  const hasVariety = !allSame;
  const hasContent = px.some(p => p[3] === 255 && (p[0]+p[1]+p[2]) > 25);
  const shaderErr = glErrs.filter(e => /shader|compile|link|fragment|vertex/i.test(e));
  const mountErr = glErrs.filter(e => /MOUNT|error/i.test(e));

  const status =
    allTransparent  ? 'FAIL - all pixels transparent (shader compile failed or canvas 0x0)' :
    allBlack        ? 'WARN - all pixels black (check dark mode + accent)' :
    shaderErr.length ? `FAIL - GLSL error: ${shaderErr[0].slice(0,80)}` :
    mountErr.length  ? `FAIL - mount error: ${mountErr[0].slice(0,80)}` :
    !hasContent      ? 'WARN - very dark, may be correct (history/forge dark bg)' :
    !hasVariety      ? 'WARN - uniform color (flat fill?)' :
    'OK';

  const bucket = status.startsWith('OK') ? 'ok' : status.startsWith('WARN') ? 'warn' : 'fail';
  results[bucket].push({ scene, status, representative: px[4] });
  const icon = { ok:'✓', warn:'⚠', fail:'✗' }[bucket];
  const center = px[4];
  console.log(`  ${icon} ${bucket.toUpperCase().padEnd(5)} ${scene.padEnd(26)} rgb(${center[0]},${center[1]},${center[2]}) ${bucket==='fail'?'← '+status:''}`);
}

srv.close();
await browser.close();

/* ── Summary ── */
console.log('\n' + '─'.repeat(60));
console.log(`RESULTS  ✓ ${results.ok.length} OK   ⚠ ${results.warn.length} WARN   ✗ ${results.fail.length} FAIL   (total ${toTest.length})`);

if (results.warn.length) {
  console.log('\nWARNINGS (usually fine - check screenshot):');
  results.warn.forEach(r => console.log(`  ${r.scene}: ${r.status}`));
}
if (results.fail.length) {
  console.log('\nFAILURES (need fixing):');
  results.fail.forEach(r => console.log(`  ${r.scene}: ${r.reason||r.status}`));
}
console.log(`\nScreenshots → /tmp/gpv-<scene>.png`);
