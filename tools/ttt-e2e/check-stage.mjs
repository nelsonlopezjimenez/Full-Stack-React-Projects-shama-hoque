// node check-stage.mjs <projectDir> <NN>
// Starts one Tic-Tac-Toe stage's own vite.config.js on TTT_VITE_PORT (default 5220), runs
// scenario sNN from scenarios.mjs in a real browser, then builds the stage with `vite build`.
// Fails on a failed step, a page error, a console warning the stage does not expect, a missing
// expected warning, or a failed build. TTT_DEBUG=1 prints every console message.
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { chromium } from 'playwright-core';
import * as scenarios from './scenarios.mjs';
import { tempDir, launchBrowser } from '../ladder-e2e/config.mjs';

const [projectDir, stage] = process.argv.slice(2);
if (!projectDir || !stage) {
  console.log('usage: node check-stage.mjs <projectDir> <NN>');
  process.exit(2);
}
const scenario = scenarios[`s${stage}`];
if (!scenario) throw new Error(`no scenario s${stage} in scenarios.mjs`);
const vitePort = Number(process.env.TTT_VITE_PORT ?? 5220);
const outDir = process.env.TTT_OUT ?? path.join(tempDir, 'ttt-e2e');

// Vite comes from the stage's own node_modules, so the check uses the stage's versions.
const vite = await import(pathToFileURL(path.join(projectDir, 'node_modules/vite/dist/node/index.js')).href);

const server = await vite.createServer({
  root: projectDir,
  configFile: path.join(projectDir, 'vite.config.js'),
  logLevel: 'error',
  server: { port: vitePort, strictPort: true }
});
await server.listen();

const browser = await launchBrowser(chromium);
const page = await browser.newPage();
const expected = scenario.expectWarning ?? [];
const seen = new Set();
const problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
page.on('console', (m) => {
  if (process.env.TTT_DEBUG) console.log(`  [console.${m.type()}]`, m.text().split('\n')[0]);
  if (m.type() !== 'error' && m.type() !== 'warning') return;
  const text = m.text();
  const match = expected.find((re) => re.test(text));
  if (match) seen.add(match);
  // The browser asks for /favicon.ico; there is none, and that is fine.
  else if (!text.startsWith('Failed to load resource')) problems.push(`console.${m.type()}: ${text}`);
});

const see = async (text) => {
  await page.getByText(text).first().waitFor({ timeout: 8000 });
  console.log('  ✓ sees', JSON.stringify(String(text)));
};
const step = (s) => console.log('•', s);

let ok = true;
try {
  await page.goto(`http://localhost:${vitePort}/`);
  await page.waitForFunction(() => document.getElementById('root')?.childElementCount > 0, null, { timeout: 60_000 });
  console.log(`--- browser (stage ${stage})`);
  await scenario({ page, see, step });
  await page.waitForTimeout(300);
  for (const re of expected) {
    if (seen.has(re)) console.log('  ✓ expected warning', re);
    else { ok = false; console.log('MISSING expected warning', re); }
  }
} catch (err) {
  ok = false;
  const shot = path.join(outDir, `fail-${stage}.png`);
  console.log('FAILED:', err.message.split('\n')[0], `\n  screenshot: ${shot}`);
  await page.screenshot({ path: shot }).catch(() => {});
}
if (problems.length) { ok = false; console.log('PROBLEMS:\n  ' + problems.join('\n  ')); }
await browser.close();
await server.close();

// The build runs AFTER the browser check on purpose: vite.build() sets process.env.NODE_ENV to
// 'production' for the rest of this process, and a dev server started after it would serve
// React's production build, which prints no warnings (the stage-10 key warning would be missed).
console.log(`--- build (stage ${stage})`);
try {
  await vite.build({ root: projectDir, logLevel: 'warn', build: { outDir: path.join(outDir, 'dist', stage), emptyOutDir: true } });
  console.log('build ok');
} catch (err) {
  ok = false;
  console.log('BUILD FAILED:', err.message);
}
console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL');
process.exit(ok ? 0 : 1);
