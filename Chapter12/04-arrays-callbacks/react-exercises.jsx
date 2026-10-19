// 04 — Your turn: lists in React with map and filter
//
// Same setup as react-lists.jsx: copy this file into a Vite app's src/ folder and
// render <ReactExercises /> from App.jsx. There are no automatic tests here;
// check your work in the browser (and in the console: React warns about missing keys).
//
// Replace each `return null` (and the TODO comments) with your JSX.
import { useState } from 'react';

const students = [
  { id: 1, name: 'Ana', grade: 92, course: 'React' },
  { id: 2, name: 'Ben', grade: 67, course: 'Node' },
  { id: 3, name: 'Carla', grade: 78, course: 'React' },
  { id: 4, name: 'Dev', grade: 55, course: 'Node' },
  { id: 5, name: 'Eli', grade: 88, course: 'MongoDB' },
];

// 1. [BEGINNER] Render a <ul> with one <li> per student whose grade is below 70,
//    showing "Name: grade". If there are none, render <p>Everyone passed.</p>.
//    Expected: Ben: 67, Dev: 55
function FailingStudents() {
  // TODO: filter, then map
  return null;
}

// 2. [BEGINNER] Render every student as <li>"Name (course)"</li>, but give the
//    <li> of students with a grade of 90 or more a style of { fontWeight: 'bold' }.
//    Hint: inside the map callback, style={s.grade >= 90 ? { fontWeight: 'bold' } : undefined}
function HonorRoll() {
  // TODO: map
  return null;
}

// 3. [ADVANCED] A <select> with an "All" option plus one <option> per course
//    (no duplicates), and below it a <ul> of the students in the chosen course.
//    Hint: Array.from(new Set(students.map((s) => s.course))) gives each course once.
function CourseFilter() {
  const [course, setCourse] = useState('All');
  // TODO: the list of courses, the filtered students, then the JSX
  return null;
}

// 4. [ADVANCED] Keep the students in state. Render each one as an <li> with
//    "Name: grade" and a "+5" button. Clicking it adds 5 to that student's grade,
//    but never above 100. Update the state with map (don't change the old objects).
function CurveButtons() {
  const [list, setList] = useState(students);
  // TODO: a function that updates one student, then the JSX
  return null;
}

export default function ReactExercises() {
  return (
    <main>
      <h2>1. Failing students</h2>
      <FailingStudents />

      <h2>2. Honor roll</h2>
      <HonorRoll />

      <h2>3. Course filter</h2>
      <CourseFilter />

      <h2>4. Curve buttons</h2>
      <CurveButtons />
    </main>
  );
}
