import { useState } from 'react';

// [BEGINNER] Square is a component of its own, so the button is written once instead of
// nine times. It is not exported: only Board (below) uses it.
//
// A square has to REMEMBER that it was clicked. A normal variable cannot do that: React calls
// Square() again every time it redraws it, and a `let value` would start over each time.
// `useState(null)` gives the component a memory that survives redraws:
// - `value` is what it remembers now (null at the start, so the button is empty),
// - `setValue` changes it AND tells React to draw the component again.
// The two names are your choice; `[x, setX]` is the usual pattern.
//
// [ADVANCED] `const [value, setValue] = useState(null)` is array destructuring: useState returns
// an array of two items. Hooks (functions named useSomething) must be called at the top level of
// a component, never inside an if or a loop, because React matches them up by their order.
function Square() {
  const [value, setValue] = useState(null);

  // [BEGINNER] An event handler: a function React calls when something happens. The tutorial
  // starts with console.log('clicked!') here (open the Console with F12 to see it).
  function handleClick() {
    setValue('X');
  }

  // [BEGINNER] onClick={handleClick} passes the function itself, so React can call it later,
  // on every click. onClick={handleClick()} would call it right away, while drawing.
  return (
    <button
      className="square"
      onClick={handleClick}
    >
      {value}
    </button>
  );
}

// [BEGINNER] `export default` makes Board the main thing this file offers; main.jsx imports it
// as App (the name used when importing a default export is up to the importer).
export default function Board() {
  // [BEGINNER] A component returns ONE element. Two buttons side by side are two elements, and
  // JSX refuses them ("Adjacent JSX elements must be wrapped in an enclosing tag").
  // <>…</> is a Fragment: a wrapper that groups them but adds nothing to the page.
  // The parentheses after `return` let the JSX start on the next line.
  //
  // [ADVANCED] JSX becomes function calls: <Square /> turns into
  // jsx(Square, {}). A function can return only one value, which is why the
  // Fragment is needed. A <div> would work too, but would add a real element.
  return (
    <>
      {/* [BEGINNER] className="board-row" matches .board-row in styles.css: each row ends the
          line, so the 3 × 3 squares form a grid instead of one line of nine.
          Your own components start with a capital letter (<Square />), so React can tell them
          apart from HTML elements like <div> or <button>.
          The squares get no props now: each one keeps its own value in its own state, so all
          nine are independent of each other. */}
      <div className="board-row">
        <Square />
        <Square />
        <Square />
      </div>
      <div className="board-row">
        <Square />
        <Square />
        <Square />
      </div>
      <div className="board-row">
        <Square />
        <Square />
        <Square />
      </div>
    </>
  );
}
