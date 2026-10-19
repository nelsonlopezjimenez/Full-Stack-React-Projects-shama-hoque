// 05 — Array.from and the modern array methods in React
//
// Worked examples to read and run in the browser. The tests don't use this file.
//
// To see it in the browser:
//   1. Create a Vite + React app: instructions/new-vite-react-project-from-the-command-line.md
//   2. Copy this file into the app's src/ folder.
//   3. Replace src/App.jsx with:
//        import ReactLists from './react-lists.jsx';
//        export default function App() {
//          return <ReactLists />;
//        }
//
// map turns DATA into elements. Array.from({ length: n }, fn) is for when there is
// no data yet, only a NUMBER: 5 stars, 3 loading rows, 4 page buttons, a 3×3 board.
import { useState } from 'react';

const students = [
  { id: 1, name: 'Ana', grade: 92, course: 'React' },
  { id: 2, name: 'Ben', grade: 67, course: 'Node' },
  { id: 3, name: 'Carla', grade: 78, course: 'React' },
  { id: 4, name: 'Dev', grade: 55, course: 'Node' },
  { id: 5, name: 'Eli', grade: 88, course: 'MongoDB' },
];

// 1. [BEGINNER] Array.from({ length }) with a callback returns ELEMENTS directly:
//    no separate map needed.
//
//    An index key is fine here: the list is just "star 0 to star 4", it never reorders.
function StarRating({ rating, max = 5 }) {
  return (
    <span aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i}>{i < rating ? '★' : '☆'}</span>
      ))}
    </span>
  );
}

// 2. [BEGINNER] Placeholder rows while data is loading.
function LoadingList({ rows = 3 }) {
  return (
    <ul>
      {Array.from({ length: rows }, (_, i) => (
        <li key={i} style={{ color: 'gray' }}>
          Loading…
        </li>
      ))}
    </ul>
  );
}

// 3. [BEGINNER] A numbered list from a range: no array of data needed.
function Countdown({ from = 5 }) {
  return (
    <ul>
      {Array.from({ length: from }, (_, i) => (
        <li key={i}>{from - i}</li>
      ))}
    </ul>
  );
}

// 4. [ADVANCED] Pagination: Array.from builds the page buttons, slice picks the items.
const allItems = Array.from({ length: 23 }, (_, i) => `Item ${i + 1}`);

function Pagination({ perPage = 5 }) {
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(allItems.length / perPage);
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1); // [1, 2, 3, 4, 5]
  const visible = allItems.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <ul>
        {visible.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      {pages.map((n) => (
        <button key={n} onClick={() => setPage(n)} disabled={n === page}>
          {n}
        </button>
      ))}
    </>
  );
}

// 5. [ADVANCED] A 3×3 board: nested Array.from (rows, then the cells in each row).
//    The same board as Chapter00's Tic-Tac-Toe, without writing nine <button>s.
function Board() {
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  function play(index) {
    if (squares[index]) return;
    // `with` returns a copy with one square changed: no slice() + assignment needed.
    setSquares(squares.with(index, xIsNext ? 'X' : 'O'));
    setXIsNext(!xIsNext);
  }

  return (
    <div>
      {Array.from({ length: 3 }, (_, row) => (
        <div key={row} style={{ display: 'flex' }}>
          {Array.from({ length: 3 }, (_, col) => {
            const index = row * 3 + col;
            return (
              <button
                key={col}
                onClick={() => play(index)}
                style={{ width: 40, height: 40, fontSize: 20 }}
              >
                {squares[index]}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// 6. [BEGINNER] Sorting props: toSorted, never sort.
//
//    props.names.sort() would reorder the PARENT's array in place. toSorted returns
//    a sorted copy and leaves the parent's data alone.
function SortedNames({ names }) {
  const sorted = names.toSorted((a, b) => a.localeCompare(b));

  return (
    <ul>
      {sorted.map((name) => (
        <li key={name}>{name}</li>
      ))}
    </ul>
  );
}

// 7. [ADVANCED] Groups with headings: Object.groupBy + Object.entries + a map inside a map.
function GroupedByCourse() {
  const groups = Object.groupBy(students, (s) => s.course);

  return Object.entries(groups).map(([course, list]) => (
    <section key={course}>
      <h3>
        {course} ({list.length})
      </h3>
      <ul>
        {list.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
    </section>
  ));
}

// 8. [ADVANCED] Every tag once, sorted: flatMap → Set → Array.from → toSorted → map.
const posts = [
  { id: 1, title: 'Hooks in depth', tags: ['react', 'js'] },
  { id: 2, title: 'Express routers', tags: ['node', 'js', 'express'] },
  { id: 3, title: 'Mongoose schemas', tags: ['mongodb', 'node'] },
];

function TagList() {
  const tags = Array.from(new Set(posts.flatMap((p) => p.tags))).toSorted();

  return (
    <ul>
      {tags.map((tag) => (
        <li key={tag}>#{tag}</li>
      ))}
    </ul>
  );
}

// 9. [ADVANCED] Changing state by position: `with` and `toSpliced`.
//
//    Compare with 04's TodoList, which used map and filter by id. By id is usually
//    the safer choice; by position is handy when the position IS the meaning
//    (a board square, a ranking slot).
function Scoreboard() {
  const [players, setPlayers] = useState([
    { id: 'a', name: 'Ana', score: 0 },
    { id: 'b', name: 'Ben', score: 0 },
    { id: 'c', name: 'Carla', score: 0 },
  ]);

  function addPoint(index) {
    const player = players[index];
    setPlayers(players.with(index, { ...player, score: player.score + 1 }));
  }

  function remove(index) {
    setPlayers(players.toSpliced(index, 1));
  }

  return (
    <ul>
      {players.map((player, index) => (
        <li key={player.id}>
          {player.name}: {player.score} <button onClick={() => addPoint(index)}>+1</button>{' '}
          <button onClick={() => remove(index)}>Remove</button>
        </li>
      ))}
    </ul>
  );
}

export default function ReactLists() {
  return (
    <main>
      <h2>1. Star rating</h2>
      <StarRating rating={4} />

      <h2>2. Loading placeholders</h2>
      <LoadingList />

      <h2>3. Countdown</h2>
      <Countdown />

      <h2>4. Pagination</h2>
      <Pagination />

      <h2>5. Board</h2>
      <Board />

      <h2>6. toSorted on props</h2>
      <SortedNames names={['Eli', 'ana', 'Carla', 'ben']} />

      <h2>7. Object.groupBy</h2>
      <GroupedByCourse />

      <h2>8. Tags</h2>
      <TagList />

      <h2>9. with and toSpliced on state</h2>
      <Scoreboard />
    </main>
  );
}
