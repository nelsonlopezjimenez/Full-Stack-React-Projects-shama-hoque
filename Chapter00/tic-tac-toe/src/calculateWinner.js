// [BEGINNER] A plain JavaScript function, not a component: no JSX, no state, it does not even
// need React. It gets the nine squares and returns 'X', 'O' or null (no winner yet).
// `lines` lists the eight ways to win: three rows, three columns, two diagonals (by index).
//
// [ADVANCED] `const [a, b, c] = lines[i]` is array destructuring again. Functions like this one,
// whose result depends only on their arguments, are "pure": easy to test (stage 15) and safe
// to call during rendering.
//
// [BEGINNER] A .js file, not .jsx: there is no JSX in it. `export function` is a NAMED export:
// a file can have many of them, and the importer writes the same name in braces:
// import { calculateWinner } from './calculateWinner.js';
export function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}
