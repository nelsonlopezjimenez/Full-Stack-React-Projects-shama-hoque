// Run me: node 04-arrays-callbacks/examples.js
// Read each line, predict the output, then run the file and compare.

const students = [
  { id: 1, name: 'Ana', grade: 92, course: 'React' },
  { id: 2, name: 'Ben', grade: 67, course: 'Node' },
  { id: 3, name: 'Carla', grade: 78, course: 'React' },
  { id: 4, name: 'Dev', grade: 55, course: 'Node' },
  { id: 5, name: 'Eli', grade: 88, course: 'MongoDB' },
];

console.log('--- [BEGINNER] map: one output for every input ---');
console.log(students.map((s) => s.name));                  // [ 'Ana', 'Ben', 'Carla', 'Dev', 'Eli' ]
console.log(students.map((s, i) => `${i + 1}. ${s.name}`)); // the 2nd parameter is the index

console.log('--- [BEGINNER] filter: keep the items where the callback returns true ---');
const passing = students.filter((s) => s.grade >= 70);
console.log(passing.map((s) => s.name)); // [ 'Ana', 'Carla', 'Eli' ]
console.log(students.length);            // 5: the original array is unchanged

console.log('--- [BEGINNER] filter + map: the pair you will use most in React ---');
// This is what JSX does with <li> elements; here we build HTML strings instead.
const items = students
  .filter((s) => s.course === 'React')
  .map((s) => `<li>${s.name}</li>`);
console.log(items);            // [ '<li>Ana</li>', '<li>Carla</li>' ]
console.log(items.join('\n'));

console.log('--- [BEGINNER] find, findIndex, some, every ---');
console.log(students.find((s) => s.id === 3));         // { id: 3, name: 'Carla', ... }
console.log(students.find((s) => s.id === 99));        // undefined
console.log(students.findIndex((s) => s.name === 'Dev')); // 3
console.log(students.some((s) => s.grade < 60));       // true (Dev)
console.log(students.every((s) => s.grade >= 50));     // true
console.log([].every(() => false));                    // true: "all of nothing" passes

console.log('--- [BEGINNER] forEach returns undefined ---');
const result = students.forEach((s) => s.name);
console.log(result); // undefined: use map when you want an array back

console.log('--- [ADVANCED] reduce: many values become one ---');
const total = students.reduce((sum, s) => sum + s.grade, 0);
console.log(total, total / students.length); // 380 76

// The accumulator can be an object: count students per course.
const byCourse = students.reduce((counts, s) => {
  counts[s.course] = (counts[s.course] ?? 0) + 1;
  return counts; // forget this return and the next call gets undefined
}, {});
console.log(byCourse); // { React: 2, Node: 2, MongoDB: 1 }

console.log('--- [ADVANCED] sort mutates, and sorts as strings by default ---');
const grades = [92, 67, 100, 8];
console.log([...grades].sort());                // [ 100, 67, 8, 92 ]: string order!
console.log([...grades].sort((a, b) => a - b)); // [ 8, 67, 92, 100 ]
console.log([...grades].sort((a, b) => b - a)); // [ 100, 92, 67, 8 ]

// filter already returned a new array, so sorting it doesn't touch `students`.
const ranking = students
  .filter((s) => s.grade >= 70)
  .sort((a, b) => b.grade - a.grade)
  .map((s) => `${s.name} (${s.grade})`);
console.log(ranking); // [ 'Ana (92)', 'Eli (88)', 'Carla (78)' ]

console.log('--- [ADVANCED] classic bugs ---');
console.log([1, 2, 3].map((n) => { n * 2; }));  // [ undefined, undefined, undefined ]: braces need return
console.log([1, 2, 3].map((n) => n * 2));       // [ 2, 4, 6 ]
console.log(['1', '2', '3'].map(parseInt));     // [ 1, NaN, NaN ]: map passes the index as parseInt's radix
console.log(['1', '2', '3'].map(Number));       // [ 1, 2, 3 ]
