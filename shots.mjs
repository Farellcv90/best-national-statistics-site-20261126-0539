// Screenshot runner for Meridia National Statistics: serves app/ on a
// scratch port with serve.ts, opens each scene from shots.json in Chromium,
// waits until the page reports window.__shotReady, and saves a JPEG into
// screenshots/. Playwright lives outside the repo
// (~/workspace/makefun/scratch/shots), so the entry stays dependency-free.
// Console errors and failed requests are collected and reported.
//
//   node shots.mjs
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(process.env.HOME, 'workspace/makefun/scratch/shots/package.json'));
const { chromium } = require('playwright-core');
const CHROME = join(process.env.HOME, '.cache/ms-playwright/chromium-1255/chrome-linux64/chrome');
const PORT = 8091;

const server = spawn('node', ['serve.ts', '--port', String(PORT)], { cwd: here, stdio: 'ignore' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/`);
      if (res.ok) return;
    } catch { /* not up yet */ }
    await wait(250);
  }
  throw new Error('server did not start on port ' + PORT);
}

const scenes = JSON.parse(readFileSync(join(here, 'shots.json'), 'utf8'));
mkdirSync(join(here, 'screenshots'), { recursive: true });
await waitForServer();

let problems = 0;
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
try {
  for (const scene of scenes) {
    const page = await browser.newPage({
      viewport: { width: scene.viewport.width, height: scene.viewport.height },
    });
    page.on('pageerror', (err) => { problems++; console.error(`[${scene.file}] page error:`, err.message); });
    page.on('console', (msg) => {
      if (msg.type() === 'error') { problems++; console.error(`[${scene.file}] console error:`, msg.text()); }
    });
    page.on('requestfailed', (req) => { problems++; console.error(`[${scene.file}] failed request:`, req.url()); });
    page.on('response', (res) => {
      if (res.status() >= 400) { problems++; console.error(`[${scene.file}] HTTP ${res.status()}:`, res.url()); }
    });
    await page.goto(`http://127.0.0.1:${PORT}/${scene.path}`, { waitUntil: 'load' });
    await page.waitForFunction(() => window.__shotReady === true, null, { timeout: 20000 });
    await wait(400);
    await page.screenshot({
      path: join(here, 'screenshots', scene.file),
      type: 'jpeg',
      quality: 82,
    });
    const bytes = statSync(join(here, 'screenshots', scene.file)).size;
    console.log(`shot ${scene.file} (${scene.viewport.width}x${scene.viewport.height}) ${bytes} bytes`);
    await page.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(problems === 0 ? 'no console errors, no failed requests' : `${problems} problem(s) seen`);
