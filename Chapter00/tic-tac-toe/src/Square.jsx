// [BEGINNER] Square has no state anymore. It shows what Board gives it (`value`) and, when it is
// clicked, calls the function Board gives it (`onSquareClick`). A component like this, that only
// draws its props, is easy to understand: the same props always give the same button.
//
// [BEGINNER] One component per file, named like the file. `export default` makes Square what
// this file offers, and Board.jsx imports it: import Square from './Square.jsx';
//
// [ADVANCED] The name onSquareClick follows React's habit: props that are event handlers are
// called onSomething, and the functions that handle them handleSomething.
export default function Square({ value, onSquareClick }) {
  return (
    <button className="square" onClick={onSquareClick}>
      {value}
    </button>
  );
}
