import { useState } from 'react';

// [BEGINNER] Square has no state anymore. It shows what Board gives it (`value`) and, when it is
// clicked, calls the function Board gives it (`onSquareClick`). A component like this, that only
// draws its props, is easy to understand: the same props always give the same button.
//
// [ADVANCED] The name onSquareClick follows React's habit: props that are event handlers are
// called onSomething, and the functions that handle them handleSomething.
function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}

// [BEGINNER] Board has no state anymore: it was lifted up once more, into Game (below). Board
// gets everything as props, exactly as Square does: which board to show (`squares`), whose turn
// it is (`xIsNext`), and a function to call with the new board after a move (`onPlay`).
// A component that is driven completely by its props is called a "controlled" component.
function Board({ xIsNext, squares, onPlay }) {
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
  // 2. The old array stays as it was. Later (time travel, stage 12) we keep every old board.
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

// [BEGINNER] Game is the new top-level component, so it is the `export default` now: main.jsx
// imports it as App (the name used when importing a default export is up to the importer).
// It draws the board on the left and, from the next stage on, the list of moves on the right.
export default function Game() {
  // [BEGINNER] Whose turn is it? A true/false state: true means X plays next. X always starts.
  // A component can have as many useState calls as it needs, one per thing to remember.
  const [xIsNext, setXIsNext] = useState(true);

  // [BEGINNER] "Lifting state up, again": to go back to earlier moves, we must remember every
  // board of the game, not only the last one. `history` is a list of boards, one per move:
  // [ [null × 9], [null, null, null, null, 'X', …], … ]. It starts with one empty board.
  // Array(9).fill(null) makes [null, null, … nine times]; squares[0] is the top-left square.
  //
  // The board to show is the last one in the list. It is calculated, not stored.
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const currentSquares = history[history.length - 1];

  // [BEGINNER] Board calls this (as onPlay) after a valid move. [...history, nextSquares] is a NEW
  // array with all old boards plus the new one: the spread syntax `...` copies the items.
  // Never history.push(nextSquares): that would change the state in place (see stage 06).
  //
  // Two state updates, one redraw: React waits until handlePlay has finished and then draws once
  // with both new values. !xIsNext flips true to false and back.
  function handlePlay(nextSquares) {
    setHistory([...history, nextSquares]);
    setXIsNext(!xIsNext);
  }

  // [BEGINNER] Called by the move buttons below. It does nothing yet: stage 12 fills it in.
  function jumpTo(nextMove) {
    // TODO
  }

  // [BEGINNER] Turning data into JSX: history.map() calls the arrow function once per board and
  // returns a NEW array with what each call returned, here one <li> per move. React can show an
  // array of elements, so {moves} below draws them all.
  // map passes each item (a board, unused here) and its index: `move` is 0, 1, 2, …
  //
  // [BEGINNER] Open the Console (F12): React warns
  //   Each child in a list should have a unique "key" prop.
  // That warning is left in on purpose. Stage 11 explains it and fixes it.
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  // [BEGINNER] The class names game, game-board and game-info are in styles.css: the board on the
  // left, the information next to it. The <ol> (ordered list) numbers the moves 1, 2, 3, …
  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <ol>{moves}</ol>
      </div>
    </div>
  );
}

// [BEGINNER] A plain JavaScript function, not a component: no JSX, no state, it does not even
// need React. It gets the nine squares and returns 'X', 'O' or null (no winner yet).
// `lines` lists the eight ways to win: three rows, three columns, two diagonals (by index).
//
// [ADVANCED] `const [a, b, c] = lines[i]` is array destructuring again. Functions like this one,
// whose result depends only on their arguments, are "pure": easy to test (stage 15) and safe
// to call during rendering. It is defined below Board, which is fine: function declarations are
// hoisted, so they exist before the line that calls them runs.
function calculateWinner(squares) {
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
