// [BEGINNER] A file only sees what it imports. Board uses Square and calculateWinner, so it
// imports both. Square is the default export of Square.jsx (no braces, any name would work);
// calculateWinner is a NAMED export of calculateWinner.js (braces, and the name must match).
import Square from './Square.jsx';
import { calculateWinner } from './calculateWinner.js';

// [BEGINNER] Board has no state: it was lifted up into Game (Game.jsx). Board
// gets everything as props, exactly as Square does: which board to show (`squares`), whose turn
// it is (`xIsNext`), and a function to call with the new board after a move (`onPlay`).
// A component that is driven completely by its props is called a "controlled" component.
export default function Board({ xIsNext, squares, onPlay }) {
  // [BEGINNER] Square cannot change the squares itself. Board passes this function down, and
  // Square calls it.
  //
  // squares.slice() makes a COPY of the array. The copy is changed and handed to onPlay, and
  // Game stores it (see handlePlay in Game).
  //
  // [BEGINNER] Why a copy? This is "immutability": never change (mutate) state in place, always
  // replace it with a new value. Two reasons:
  // 1. React compares the old and the new state to see if something changed. The same array,
  //    changed inside, looks unchanged, so `squares[i] = 'X'; setSquares(squares);` may draw
  //    nothing at all.
  // 2. The old array stays as it was. That is what lets Game keep every old board (time travel).
  //
  // [ADVANCED] React compares with Object.is(old, new), which for arrays and objects checks
  // whether they are the SAME object, not whether they have the same contents. That check is
  // cheap, which is also what lets memo() skip redrawing parts that did not change.
  // Other ways to copy: [...squares], or squares.with(i, 'X') (copy with one item replaced).
  function handleClick(i) {
    // [BEGINNER] An early return: if somebody has already won, or the square already holds an
    // X or an O, stop here. (null counts as false, 'X' and 'O' count as true.)
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'X';
    } else {
      nextSquares[i] = 'O';
    }
    // [BEGINNER] Board does not store the move: it tells its parent, and Game decides.
    onPlay(nextSquares);
  }

  // [BEGINNER] The status line is not state: it is CALCULATED from the state on every render.
  // There is nothing to keep in sync, because it can never be out of date.
  //
  // [ADVANCED] A modern spelling would be a template string and a ternary:
  // const status = winner ? `Winner: ${winner}` : `Next player: ${xIsNext ? 'X' : 'O'}`;
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  // [BEGINNER] A component returns ONE element. Two buttons side by side are two elements, and
  // JSX refuses them ("Adjacent JSX elements must be wrapped in an enclosing tag").
  // <>…</> is a Fragment: a wrapper that groups them but adds nothing to the page.
  // The parentheses after `return` let the JSX start on the next line.
  //
  // [ADVANCED] JSX becomes function calls: <Square value={squares[0]} /> turns into
  // jsx(Square, { value: squares[0] }). A function can return only one value, which is why the
  // Fragment is needed. A <div> would work too, but would add a real element.
  return (
    <>
      <div className="status">{status}</div>
      {/* [BEGINNER] className="board-row" matches .board-row in styles.css: each row ends the
          line, so the 3 × 3 squares form a grid instead of one line of nine.
          Your own components start with a capital letter (<Square />), so React can tell them
          apart from HTML elements like <div> or <button>.

          onSquareClick={() => handleClick(0)} passes a small NEW function that calls
          handleClick(0) later, on the click. onSquareClick={handleClick(0)} would call
          handleClick right now, while drawing: it sets state, which draws again, which calls it
          again… and React stops with "Too many re-renders". */}
      <div className="board-row">
        <Square value={squares[0]} onSquareClick={() => handleClick(0)} />
        <Square value={squares[1]} onSquareClick={() => handleClick(1)} />
        <Square value={squares[2]} onSquareClick={() => handleClick(2)} />
      </div>
      <div className="board-row">
        <Square value={squares[3]} onSquareClick={() => handleClick(3)} />
        <Square value={squares[4]} onSquareClick={() => handleClick(4)} />
        <Square value={squares[5]} onSquareClick={() => handleClick(5)} />
      </div>
      <div className="board-row">
        <Square value={squares[6]} onSquareClick={() => handleClick(6)} />
        <Square value={squares[7]} onSquareClick={() => handleClick(7)} />
        <Square value={squares[8]} onSquareClick={() => handleClick(8)} />
      </div>
    </>
  );
}
