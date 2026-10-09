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

// [BEGINNER] `export default` makes Board the main thing this file offers; main.jsx imports it
// as App (the name used when importing a default export is up to the importer).
export default function Board() {
  // [BEGINNER] "Lifting state up": to find a winner later, ONE component has to know all nine
  // squares. So the state moves from each Square up to their parent, Board, and Board passes the
  // values back down as props. That keeps the squares and the board in sync.
  //
  // Array(9).fill(null) makes [null, null, … nine times]. squares[0] is the top-left square,
  // squares[8] the bottom-right one. Later it will look like ['O', null, 'X', 'X', 'X', 'O', …].
  const [squares, setSquares] = useState(Array(9).fill(null));

  // [BEGINNER] State is private to the component that owns it: Square cannot change Board's
  // squares itself. Board passes this function down instead, and Square calls it.
  //
  // squares.slice() makes a COPY of the array. The copy is changed and handed to setSquares,
  // and React draws the board again with the new array. (Stage 06 explains why a copy.)
  function handleClick(i) {
    const nextSquares = squares.slice();
    nextSquares[i] = 'X';
    setSquares(nextSquares);
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
