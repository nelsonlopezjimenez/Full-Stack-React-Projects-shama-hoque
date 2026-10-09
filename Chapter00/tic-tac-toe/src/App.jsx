// [BEGINNER] Square is a component of its own again, so the button is written once instead of
// nine times. It is not exported: only Board (below) uses it.
//
// `{ value }` reads the prop called value. Board writes <Square value="1" />, and React calls
// Square({ value: '1' }). In JSX, curly braces switch back to JavaScript: {value} shows the
// variable, while plain `value` would show the word "value".
//
// [ADVANCED] `function Square({ value })` is destructuring. It is short for
// `function Square(props) { const value = props.value; ... }`. Props are read-only: a component
// never changes its own props, only its parent can pass new ones.
function Square({ value }) {
  return <button className="square">{value}</button>;
}

// [BEGINNER] `export default` makes Board the main thing this file offers; main.jsx imports it
// as App (the name used when importing a default export is up to the importer).
export default function Board() {
  // [BEGINNER] A component returns ONE element. Two buttons side by side are two elements, and
  // JSX refuses them ("Adjacent JSX elements must be wrapped in an enclosing tag").
  // <>…</> is a Fragment: a wrapper that groups them but adds nothing to the page.
  // The parentheses after `return` let the JSX start on the next line.
  //
  // [ADVANCED] JSX becomes function calls: <Square value="1" /> turns into
  // jsx(Square, { value: '1' }). A function can return only one value, which is why the
  // Fragment is needed. A <div> would work too, but would add a real element.
  return (
    <>
      {/* [BEGINNER] className="board-row" matches .board-row in styles.css: each row ends the
          line, so the 3 × 3 squares form a grid instead of one line of nine.
          Your own components start with a capital letter (<Square />), so React can tell them
          apart from HTML elements like <div> or <button>. */}
      <div className="board-row">
        <Square value="1" />
        <Square value="2" />
        <Square value="3" />
      </div>
      <div className="board-row">
        <Square value="4" />
        <Square value="5" />
        <Square value="6" />
      </div>
      <div className="board-row">
        <Square value="7" />
        <Square value="8" />
        <Square value="9" />
      </div>
    </>
  );
}
