import { useState } from 'react';
import Board from './Board.jsx';

// [BEGINNER] Game is the top-level component: main.jsx imports it and draws <Game />.
// It draws the board on the left and, from the next stage on, the list of moves on the right.
export default function Game() {
  // [BEGINNER] "Lifting state up, again": to go back to earlier moves, we must remember every
  // board of the game, not only the last one. `history` is a list of boards, one per move:
  // [ [null × 9], [null, null, null, null, 'X', …], … ]. It starts with one empty board.
  // Array(9).fill(null) makes [null, null, … nine times]; squares[0] is the top-left square.
  //
  const [history, setHistory] = useState([Array(9).fill(null)]);
  // [BEGINNER] Time travel: which move are we looking at? 0 is the empty board at the start.
  // The board to show is history[currentMove], not always the last one anymore. It is
  // calculated from the state, not stored.
  const [currentMove, setCurrentMove] = useState(0);
  // [BEGINNER] Whose turn is it? true means X plays next. X makes the first move, so it is X's
  // turn after an even number of moves (0, 2, 4, …). % is the remainder: 4 % 2 is 0, 5 % 2 is 1.
  //
  // This used to be a state of its own (useState(true)) that every move and every jump had to
  // update. But it can always be CALCULATED from currentMove, and a value that is calculated can
  // never be out of sync. Rule of thumb: don't keep in state what you can compute from other state.
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  // [BEGINNER] Board calls this (as onPlay) after a valid move.
  // If you went back to an earlier move and play from there, the moves after it are thrown away:
  // history.slice(0, currentMove + 1) keeps the boards up to the one you are looking at, and
  // [...kept, nextSquares] adds the new board: a NEW array, the spread syntax `...` copies the items.
  // Never history.push(nextSquares): that would change the state in place (see stage 06).
  // Then the newest board is the current one again.
  //
  // Two state updates, one redraw: React waits until handlePlay has finished and then draws once
  // with both new values.
  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  // [BEGINNER] Called by the move buttons below: show that move's board. The history itself is
  // not changed, so you can jump forward again. Whose turn it is follows from currentMove.
  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  // [BEGINNER] Turning data into JSX: history.map() calls the arrow function once per board and
  // returns a NEW array with what each call returned, here one <li> per move. React can show an
  // array of elements, so {moves} below draws them all.
  // map passes each item (a board, unused here) and its index: `move` is 0, 1, 2, …
  //
  // [BEGINNER] key={move} tells React WHICH item each <li> is, so after a change it can match the
  // new list with the old one: same key = same item (keep it), new key = create it, missing key =
  // remove it. Without a key React warns "Each child in a list should have a unique "key" prop".
  // A key only has to be unique among its siblings, and it never changes for an item.
  //
  // [ADVANCED] The index is usually a BAD key: if items are inserted, removed or re-ordered, the
  // same index ends up on a different item, and React mixes up their state. Here it is fine,
  // because a move's number never changes: moves are only added or dropped at the end. Data from a database
  // has a better key, its id: <li key={user.id}>. `key` is not a normal prop; Square or any other
  // component cannot read it.
  const moves = history.map((squares, move) => {
    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
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
