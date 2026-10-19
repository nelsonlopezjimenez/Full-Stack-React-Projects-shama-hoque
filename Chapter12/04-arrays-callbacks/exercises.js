// 04 — Arrays with callbacks: exercises
//
// Replace each `throw new Error('TODO ...')` with your code.
// Two exercises say "Fix the bug": their code runs but gives the wrong answer.
// Check your work: node --test 04-arrays-callbacks/exercises.test.js
//
// No for loops: every exercise is one or two of map, filter, find, some,
// every, reduce, sort.
//
// The tests use students like this one:
//   { id: 1, name: 'Ana', grade: 92, course: 'React' }

// [BEGINNER] Return an array with just the names.
// names(students) → ['Ana', 'Ben', 'Carla', 'Dev', 'Eli']
export function names(students) {
  throw new Error('TODO names');
}

// [BEGINNER] Return the students whose grade is at least `min`.
// passing(students) → the Ana, Carla and Eli objects (in their original order)
export function passing(students, min = 70) {
  throw new Error('TODO passing');
}

// [BEGINNER] Wrap each text in <li>...</li>.
// This is what you'll do in JSX: {texts.map((t) => <li key={t}>{t}</li>)}
// toListItems(['Ana', 'Ben']) → ['<li>Ana</li>', '<li>Ben</li>']
export function toListItems(texts) {
  throw new Error('TODO toListItems');
}

// [BEGINNER] Return the student with this id, or undefined if there is none.
// findById(students, 3) → { id: 3, name: 'Carla', ... }
export function findById(students, id) {
  throw new Error('TODO findById');
}

// [BEGINNER] true if EVERY student's grade is at least `min`.
// allPassed(students, 50) → true, allPassed(students, 70) → false
export function allPassed(students, min = 70) {
  throw new Error('TODO allPassed');
}

// [BEGINNER] true if AT LEAST ONE student takes `course`.
// anyInCourse(students, 'React') → true, anyInCourse(students, 'Python') → false
export function anyInCourse(students, course) {
  throw new Error('TODO anyInCourse');
}

// [BEGINNER] Fix the bug. It should return every number doubled.
// doubled([1, 2, 3]) → [2, 4, 6]
export function doubled(nums) {
  return nums.map((n) => {
    n * 2;
  });
}

// [ADVANCED] Fix the TWO bugs. Return the grades from lowest to highest,
// WITHOUT changing the array that was passed in.
// sortedGrades([92, 8, 100, 67]) → [8, 67, 92, 100]
export function sortedGrades(grades) {
  return grades.sort();
}

// [ADVANCED] The students with a grade of at least `min`, best first,
// as <li> strings "Name (grade)". Don't change the order of `students`.
// passingList(students) → ['<li>Ana (92)</li>', '<li>Eli (88)</li>', '<li>Carla (78)</li>']
export function passingList(students, min = 70) {
  throw new Error('TODO passingList');
}

// [ADVANCED] The average grade. Return 0 for an empty array.
// average(students) → 76
export function average(students) {
  throw new Error('TODO average');
}

// [ADVANCED] Count the students in each course, with reduce.
// countByCourse(students) → { React: 2, Node: 2, MongoDB: 1 }
export function countByCourse(students) {
  throw new Error('TODO countByCourse');
}

// [ADVANCED] Build a whole list as one string: each item indented two spaces
// inside <ul>, one per line. An empty array gives '<p>Nothing to show</p>'
// instead (in React you'd return a different element the same way).
// renderList(['Ana', 'Ben']) →
//   '<ul>\n  <li>Ana</li>\n  <li>Ben</li>\n</ul>'
export function renderList(texts) {
  throw new Error('TODO renderList');
}
