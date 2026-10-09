// node tools/ttt-e2e/run.mjs [--stages 01,05-07] [--keep]
//
// Checks the Tic-Tac-Toe ladder stage by stage, without touching your working folder:
//   1. makes a temporary git worktree (a second checkout of this repo) in the system temp folder
//   2. for every teach/ch00-ttt-* stage: checks it out, runs `npm ci` when its package-lock.json
//      differs from the previous stage's, then check-stage.mjs (browser scenario + build)
//   3. on the last stage checked, runs its unit tests (`npm test`) if it has any
//   4. removes the worktree (--keep leaves it, to look around)
//
// Branches are taken from local branches, or from origin/ when there are no local ones.
// No server and no database are needed: the ladder is React only.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { tempDir } from '../ladder-e2e/config.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i === -1 ? fallback : args[i + 1];
};
const wanted = option('--stages', '');
const keep = args.includes('--keep');
const FOLDER = 'Chapter00/tic-tac-toe';
const here = import.meta.dirname;

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim();
const repo = git('rev-parse', '--show-toplevel');
process.chdir(repo);

const findBranches = () => {
  for (const prefix of ['refs/heads/', 'refs/remotes/origin/']) {
    const found = git('for-each-ref', '--format=%(refname)', `${prefix}teach/ch00-ttt-*`).split('\n').filter(Boolean).sort();
    if (found.length) return found;
  }
  return [];
};
const stageOf = (ref) => ref.match(/ch00-ttt-(\d+)-/)[1];
const inRange = (nn) => {
  if (!wanted) return true;
  const n = Number(nn);
  return wanted.split(',').some((part) => {
    const [from, to = from] = part.split('-').map(Number);
    return n >= from && n <= to;
  });
};

const refs = findBranches().filter((ref) => inRange(stageOf(ref)));
if (!refs.length) throw new Error('no teach/ch00-ttt-* branches found (try: git fetch origin)');

// npm is npm.cmd on Windows, which needs a shell; the paths can contain spaces.
const npm = (cwd, ...a) => spawnSync(`npm ${a.join(' ')}`, { cwd, shell: true, stdio: 'inherit' }).status === 0;

const worktree = mkdtempSync(path.join(tempDir, 'ttt-e2e-wt-'));
rmSync(worktree, { recursive: true });
const projectDir = path.join(worktree, FOLDER);
const results = [];
let cleanedUp = false;
const cleanUp = () => {
  if (cleanedUp) return;
  cleanedUp = true;
  if (keep) console.log(`\nworktree kept: ${worktree}  (remove it with: git worktree remove --force "${worktree}")`);
  else {
    try { git('worktree', 'remove', '--force', worktree); } catch { git('worktree', 'prune'); }
  }
};
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { cleanUp(); process.exit(130); });

try {
  git('worktree', 'add', '--detach', worktree, refs[0]);
  let installedLock = '';
  for (const ref of refs) {
    const nn = stageOf(ref);
    console.log(`\n=========== stage ${nn}: ${ref.replace(/^refs\/(heads|remotes\/origin)\//, '')}`);
    execFileSync('git', ['-C', worktree, 'checkout', '--quiet', '--detach', ref]);
    const lock = readFileSync(path.join(projectDir, 'package-lock.json'), 'utf8');
    if (lock !== installedLock) {
      if (!npm(projectDir, 'ci', '--no-audit', '--no-fund', '--loglevel=error')) throw new Error(`npm ci failed for stage ${nn}`);
      installedLock = lock;
    }
    const r = spawnSync(process.execPath, [path.join(here, 'check-stage.mjs'), projectDir, nn], { stdio: 'inherit' });
    results.push([`stage ${nn}`, r.status === 0]);
  }
  const pkg = JSON.parse(readFileSync(path.join(projectDir, 'package.json'), 'utf8'));
  if (pkg.scripts?.test && existsSync(path.join(projectDir, 'src/test'))) {
    console.log(`\n=========== unit tests of stage ${stageOf(refs.at(-1))}`);
    results.push([`npm test (stage ${stageOf(refs.at(-1))})`, npm(projectDir, 'test')]);
  }
} finally {
  cleanUp();
}

console.log('\n=========== summary');
for (const [name, ok] of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`);
process.exit(results.every(([, ok]) => ok) ? 0 : 1);
