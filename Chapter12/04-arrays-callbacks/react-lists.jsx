// 04 — map and filter in React: building lists
//
// Worked examples to read and run in the browser. The tests don't use this file
// (Node can't read JSX without a build tool like Vite).
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
// The rule behind every example: inside JSX, { } holds an EXPRESSION.
// map returns an array, and React renders an array of elements one after another.
import { useState } from 'react';

const students = [
  { id: 1, name: 'Ana', grade: 92, course: 'React' },
  { id: 2, name: 'Ben', grade: 67, course: 'Node' },
  { id: 3, name: 'Carla', grade: 78, course: 'React' },
  { id: 4, name: 'Dev', grade: 55, course: 'Node' },
  { id: 5, name: 'Eli', grade: 88, course: 'MongoDB' },
];

// 1. [BEGINNER] map: one <li> per item.
//
// key: React uses it to match each <li> with the same item on the next render.
// Use a stable id from the data. The index is only safe for a list that never
// reorders, gets filtered, or has items added or removed.
function StudentNames() {
  return (
    <ul>
      {students.map((student) => (
        <li key={student.id}>{student.name}</li>
      ))}
    </ul>
  );
}

// Two mistakes that render nothing:
//   {students.forEach((s) => <li>{s.name}</li>)}   forEach returns undefined
//   {students.map((s) => { <li>{s.name}</li> })}   braces without `return`: an array of undefined
// After `=>`, use ( ) to return the JSX, or write `return` inside { }.

// 2. [BEGINNER] filter, then map: only some items become <li>.
// Doing the filter in a variable first keeps the JSX easy to read.
function PassingStudents({ min = 70 }) {
  const passing = students.filter((student) => student.grade >= min);

  return (
    <ul>
      {passing.map((student) => (
        <li key={student.id}>
          {student.name}: {student.grade}
        </li>
      ))}
    </ul>
  );
}

// 3. [BEGINNER] An empty list: show a message instead of an empty <ul>.
//
// Careful: {list.length && <ul>...</ul>} shows a "0" on the page when the list is
// empty, because && returns the 0 and React renders numbers. Compare with > 0,
// or return early like here.
function CourseList({ course }) {
  const inCourse = students.filter((student) => student.course === course);

  if (inCourse.length === 0) {
    return <p>No students in {course}.</p>;
  }

  return (
    <ul>
      {inCourse.map((student) => (
        <li key={student.id}>{student.name}</li>
      ))}
    </ul>
  );
}

// 4. [BEGINNER] find: a single item (or undefined), for a detail view.
function StudentCard({ id }) {
  const student = students.find((s) => s.id === id);

  if (!student) {
    return <p>Student {id} not found.</p>;
  }

  return (
    <p>
      <strong>{student.name}</strong> ({student.course}): {student.grade}
    </p>
  );
}

// 5. [ADVANCED] reduce: one value from the whole list.
function ClassAverage() {
  const total = students.reduce((sum, s) => sum + s.grade, 0);
  const average = students.length > 0 ? total / students.length : 0;

  return <p>Class average: {average.toFixed(1)}</p>;
}

// 6. [ADVANCED] Filter as the user types.
//
// Only the query is state. The filtered list is computed again on every render
// from `students` and `query`; don't keep a second copy of it in state.
function SearchableList() {
  const [query, setQuery] = useState('');

  const search = query.trim().toLowerCase();
  const matches = students.filter((s) => s.name.toLowerCase().includes(search));

  return (
    <>
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by name"
      />
      <ul>
        {matches.map((s) => (
          <li key={s.id}>{s.name}</li>
        ))}
      </ul>
      {matches.length === 0 && <p>No matches for "{query}".</p>}
    </>
  );
}

// 7. [ADVANCED] A ranking: filter, sort, map.
//
// filter returned a NEW array, so sort() here doesn't change `students`.
// Never call sort() directly on props or state: it changes them in place,
// and React may not re-render (or the parent's data changes behind its back).
function Ranking() {
  const ranked = students
    .filter((s) => s.grade >= 70)
    .sort((a, b) => b.grade - a.grade);

  return (
    <ol>
      {ranked.map((s) => (
        <li key={s.id}>
          {s.name} ({s.grade})
        </li>
      ))}
    </ol>
  );
}

// 8. [ADVANCED] Changing a list in state: map to update one item, filter to remove one.
//
// Both return a NEW array, which is what React needs to notice the change.
// todos.push(...) or todos[0].done = true would change the array React already
// has, so the component wouldn't re-render.
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Read the map and filter notes', done: true },
    { id: 2, text: 'Solve the exercises', done: false },
    { id: 3, text: 'Take the self-check quiz', done: false },
  ]);

  function toggle(id) {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    );
  }

  function remove(id) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  const left = todos.filter((todo) => !todo.done).length;

  return (
    <>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input type="checkbox" checked={todo.done} onChange={() => toggle(todo.id)} />
              {todo.done ? <s>{todo.text}</s> : todo.text}
            </label>{' '}
            <button onClick={() => remove(todo.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <p>{left} left to do</p>
    </>
  );
}

// 9. [ADVANCED] An object as a list: Object.entries gives [key, value] pairs to map over.
function CourseCounts() {
  const counts = students.reduce((acc, s) => {
    acc[s.course] = (acc[s.course] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <ul>
      {Object.entries(counts).map(([course, count]) => (
        <li key={course}>
          {course}: {count}
        </li>
      ))}
    </ul>
  );
}

export default function ReactLists() {
  return (
    <main>
      <h2>1. map: every student</h2>
      <StudentNames />

      <h2>2. filter + map: grade 70 or more</h2>
      <PassingStudents />

      <h2>3. Empty list</h2>
      <CourseList course="React" />
      <CourseList course="Python" />

      <h2>4. find</h2>
      <StudentCard id={3} />
      <StudentCard id={99} />

      <h2>5. reduce</h2>
      <ClassAverage />

      <h2>6. Search</h2>
      <SearchableList />

      <h2>7. Ranking</h2>
      <Ranking />

      <h2>8. map and filter on state</h2>
      <TodoList />

      <h2>9. Object.entries</h2>
      <CourseCounts />
    </main>
  );
}
