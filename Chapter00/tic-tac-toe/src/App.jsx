// [BEGINNER] A component is a JavaScript function that returns what to show (JSX).
// `export default` makes Board the main thing this file offers; main.jsx imports it as App
// (the name used when importing a default export is up to the importer).
//
// The component used to be called Square, but it draws nine squares now, so it is the Board.
export default function Board() {
  // [BEGINNER] A component returns ONE element. Two buttons side by side are two elements, and
  // JSX refuses them ("Adjacent JSX elements must be wrapped in an enclosing tag").
  // <>…</> is a Fragment: a wrapper that groups them but adds nothing to the page.
  // The parentheses after `return` let the JSX start on the next line.
  //
  // [ADVANCED] JSX becomes function calls: <button className="square">1</button> turns into
  // jsx('button', { className: 'square', children: '1' }). A function can return only one value,
  // which is why the Fragment is needed. A <div> would work too, but would add a real element.
  return (
    <>
      {/* [BEGINNER] className="board-row" matches .board-row in styles.css: each row ends the
          line, so the 3 × 3 buttons form a grid instead of one line of nine. */}
      <div className="board-row">
        <button className="square">1</button>
        <button className="square">2</button>
        <button className="square">3</button>
      </div>
      <div className="board-row">
        <button className="square">4</button>
        <button className="square">5</button>
        <button className="square">6</button>
      </div>
      <div className="board-row">
        <button className="square">7</button>
        <button className="square">8</button>
        <button className="square">9</button>
      </div>
    </>
  );
}
