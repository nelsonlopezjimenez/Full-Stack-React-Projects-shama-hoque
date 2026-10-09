// [BEGINNER] A component is a JavaScript function that returns what to show (JSX).
// `export default` makes Square the main thing this file offers; main.jsx imports it as App
// (the name used when importing a default export is up to the importer).
//
// className="square" is a prop: it is the HTML class attribute (`class` is a reserved word in
// JavaScript, so JSX calls it className). styles.css draws every .square as a box.
export default function Square() {
  return <button className="square">X</button>;
}
