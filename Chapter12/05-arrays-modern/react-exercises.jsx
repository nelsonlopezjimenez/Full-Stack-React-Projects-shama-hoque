// 05 — Your turn: Array.from and the modern methods in React
//
// Same setup as react-lists.jsx: copy this file into a Vite app's src/ folder and
// render <ReactExercises /> from App.jsx. There are no automatic tests here;
// check your work in the browser (and in the console: React warns about missing keys).
//
// Replace each `return null` (and the TODO comments) with your JSX.
import { useState } from 'react';

// 1. [BEGINNER] An <ol> with one <li> per number from `from` to `to`.
//    <NumberList from={3} to={7} /> shows 3, 4, 5, 6, 7.
//    Use Array.from({ length: ... }, (_, i) => ...).
function NumberList({ from, to }) {
  // TODO
  return null;
}

// 2. [BEGINNER] A row of `count` empty checkboxes (<input type="checkbox" />),
//    each with a label "Day 1", "Day 2", ... (a habit tracker).
function HabitRow({ count = 7 }) {
  // TODO
  return null;
}

// 3. [ADVANCED] Page buttons. Show one <button> per page (use Array.from).
//    The current page's button is disabled. Clicking a button calls onChange(pageNumber).
//    Also add "Previous" and "Next" buttons, disabled on the first / last page.
function PageButtons({ total, perPage, current, onChange }) {
  // TODO
  return null;
}

// 4. [ADVANCED] A multiplication table as a <table>: `size` rows and `size` columns,
//    the cell in row r and column c shows r × c (starting at 1 × 1).
//    Use Array.from twice: once for the <tr>s, once for the <td>s in each row.
function MultiplicationTable({ size = 5 }) {
  // TODO
  return null;
}

// 5. [ADVANCED] Keep the names in state. Show them sorted A→Z with toSorted
//    (don't sort the state itself), each with a "Remove" button.
//    Removing must take out the right name even though the display order differs
//    from the state order. Hint: remove by name (filter) or find its index in the state.
function SortedRoster() {
  const [roster, setRoster] = useState(['Eli', 'Ana', 'Dev', 'Ben', 'Carla']);
  // TODO
  return null;
}

// Uses <PageButtons /> so you can try it. You don't need to change this.
function PagerDemo() {
  const [page, setPage] = useState(1);
  return (
    <>
      <p>Page {page}</p>
      <PageButtons total={42} perPage={10} current={page} onChange={setPage} />
    </>
  );
}

export default function ReactExercises() {
  return (
    <main>
      <h2>1. Number list</h2>
      <NumberList from={3} to={7} />

      <h2>2. Habit row</h2>
      <HabitRow />

      <h2>3. Page buttons</h2>
      <PagerDemo />

      <h2>4. Multiplication table</h2>
      <MultiplicationTable />

      <h2>5. Sorted roster</h2>
      <SortedRoster />
    </main>
  );
}
