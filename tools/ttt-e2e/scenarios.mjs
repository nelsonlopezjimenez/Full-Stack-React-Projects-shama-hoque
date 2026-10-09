// One browser scenario per Tic-Tac-Toe stage: sNN runs against stage NN.
// Stages that do not change what you see (03 → 02, 05/06 → 04, 09 → 08, 13–15 → 12) re-run the
// earlier scenario, so a refactor cannot silently break the game.
//
// `expectWarning` lists console messages a stage MUST print (stage 10 leaves the missing-key
// warning in on purpose). Any other warning or error fails the check.

const squareTexts = (page) => page.locator('button.square').allTextContents();

const expectSquares = async (page, expected) => {
  const texts = await squareTexts(page);
  const want = expected.map((v) => v ?? '');
  if (JSON.stringify(texts) !== JSON.stringify(want)) {
    throw new Error(`squares are ${JSON.stringify(texts)}, expected ${JSON.stringify(want)}`);
  }
  console.log('  ✓ squares', want.map((v) => v || '·').join(''));
};

const click = (page, i) => page.locator('button.square').nth(i).click();
const play = async (page, moves) => { for (const i of moves) await click(page, i); };
const empty = () => Array(9).fill('');

export const s01 = async ({ page, step }) => {
  step('one square with an X');
  await expectSquares(page, ['X']);
};

export const s02 = async ({ page, step }) => {
  step('three rows of three numbered squares');
  const rows = await page.locator('.board-row').count();
  if (rows !== 3) throw new Error(`${rows} .board-row elements, expected 3`);
  await expectSquares(page, ['1', '2', '3', '4', '5', '6', '7', '8', '9']);
};
export const s03 = s02;

export const s04 = async ({ page, step }) => {
  step('empty board, a click fills one square with X');
  await expectSquares(page, empty());
  await play(page, [0, 4]);
  await expectSquares(page, ['X', '', '', '', 'X', '', '', '', '']);
};
export const s05 = s04;
export const s06 = s04;

export const s07 = async ({ page, step }) => {
  step('X and O take turns, a filled square cannot change');
  await play(page, [0, 1]);
  await expectSquares(page, ['X', 'O', '', '', '', '', '', '', '']);
  await click(page, 0);
  await expectSquares(page, ['X', 'O', '', '', '', '', '', '', '']);
  await click(page, 2);
  await expectSquares(page, ['X', 'O', 'X', '', '', '', '', '', '']);
};

export const s08 = async ({ page, see, step }) => {
  step('status line, a winner, no moves after the win');
  await see('Next player: X');
  await click(page, 0);
  await see('Next player: O');
  await play(page, [3, 1, 4, 2]);
  await see('Winner: X');
  await click(page, 8);
  await expectSquares(page, ['X', 'X', 'X', 'O', 'O', '', '', '', '']);
};
export const s09 = async (ctx) => {
  ctx.step('board inside the .game layout');
  if (!(await ctx.page.locator('.game .game-board .board-row').count())) throw new Error('no .game .game-board');
  await s08(ctx);
};

const expectMoves = async (page, expected) => {
  const texts = await page.locator('.game-info li button').allTextContents();
  if (JSON.stringify(texts) !== JSON.stringify(expected)) {
    throw new Error(`move list is ${JSON.stringify(texts)}, expected ${JSON.stringify(expected)}`);
  }
  console.log('  ✓ moves', expected.join(' | '));
};

const pastMoves = async ({ page, step }) => {
  step('a button per move; jumping does nothing yet');
  await expectMoves(page, ['Go to game start']);
  await play(page, [0, 4]);
  await expectMoves(page, ['Go to game start', 'Go to move #1', 'Go to move #2']);
  await page.getByText('Go to game start').click();
  await expectSquares(page, ['X', '', '', '', 'O', '', '', '', '']);
};
export const s10 = async (ctx) => pastMoves(ctx);
s10.expectWarning = [/unique "key" prop/];
export const s11 = pastMoves;

export const s12 = async ({ page, see, step }) => {
  step('time travel: jump back, play on, the future is dropped');
  await play(page, [0, 4, 8]);
  await expectMoves(page, ['Go to game start', 'Go to move #1', 'Go to move #2', 'Go to move #3']);
  await page.getByText('Go to move #1').click();
  await expectSquares(page, ['X', '', '', '', '', '', '', '', '']);
  await see('Next player: O');
  await click(page, 5);
  await expectSquares(page, ['X', '', '', '', '', 'O', '', '', '']);
  await expectMoves(page, ['Go to game start', 'Go to move #1', 'Go to move #2']);
  await page.getByText('Go to game start').click();
  await expectSquares(page, empty());
  await see('Next player: X');
  step('the game still ends with a winner');
  await play(page, [0, 3, 1, 4, 2]);
  await see('Winner: X');
};
export const s13 = s12;
export const s14 = s12;
export const s15 = s12;
