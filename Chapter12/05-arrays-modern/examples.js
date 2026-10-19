// Run me: node 05-arrays-modern/examples.js
// Read each line, predict the output, then run the file and compare.

console.log('--- [BEGINNER] Array.from: make an array from anything with a length ---');
console.log(Array.from('abc'));          // [ 'a', 'b', 'c' ]
console.log(Array.from({ length: 3 }));  // [ undefined, undefined, undefined ]

// The 2nd argument is a callback, like map's: (value, index) => newValue.
// With { length: n } every value is undefined, so we name it _ and use the index.
console.log(Array.from({ length: 3 }, (_, i) => i));      // [ 0, 1, 2 ]
console.log(Array.from({ length: 5 }, (_, i) => i + 1));  // [ 1, 2, 3, 4, 5 ]
console.log(Array.from({ length: 3 }, (_, i) => i * 10)); // [ 0, 10, 20 ]
console.log(Array.from({ length: 3 }, () => 'hi'));       // [ 'hi', 'hi', 'hi' ]

console.log('--- [BEGINNER] Array.from(x, fn) is Array.from(x).map(fn) in one step ---');
console.log(Array.from('abc', (ch) => ch.toUpperCase())); // [ 'A', 'B', 'C' ]
console.log(Array.from('abc').map((ch) => ch.toUpperCase())); // same result

console.log('--- [BEGINNER] range: numbers from start to end ---');
const start = 3;
const end = 7;
console.log(Array.from({ length: end - start + 1 }, (_, i) => start + i)); // [ 3, 4, 5, 6, 7 ]

console.log('--- [ADVANCED] Array.from turns other iterables into real arrays ---');
const tags = new Set(['react', 'node', 'react']);
console.log(Array.from(tags));                 // [ 'react', 'node' ]: a Set drops duplicates
const scores = new Map([['Ana', 92], ['Ben', 67]]);
console.log(Array.from(scores.keys()));        // [ 'Ana', 'Ben' ]
console.log(Array.from(scores, ([name, score]) => `${name}: ${score}`)); // [ 'Ana: 92', 'Ben: 67' ]
// In the browser: Array.from(document.querySelectorAll('li')) turns a NodeList
// into an array, so you can call map and filter on it.

console.log('--- [ADVANCED] Array.from knows about emoji; split("") does not ---');
console.log(Array.from('ok👍').length); // 3
console.log('ok👍'.split('').length);    // 4: the emoji is two code units, split cuts it in half

console.log('--- [ADVANCED] the Array(n).fill([]) trap ---');
const bad = Array(2).fill([]);              // ONE array, put in both slots
bad[0].push('x');
console.log(bad);                           // [ [ 'x' ], [ 'x' ] ]
const good = Array.from({ length: 2 }, () => []); // the callback runs twice: two arrays
good[0].push('x');
console.log(good);                          // [ [ 'x' ], [] ]

console.log('--- [BEGINNER] at: negative indexes count from the end ---');
const nums = [30, 10, 20];
console.log(nums.at(0), nums.at(-1)); // 30 20
console.log(nums.at(5));              // undefined

console.log('--- [BEGINNER] change by copy: the original stays the same ---');
console.log(nums.toSorted((a, b) => a - b)); // [ 10, 20, 30 ]
console.log(nums.toReversed());              // [ 20, 10, 30 ]
console.log(nums.with(1, 99));               // [ 30, 99, 20 ]
console.log(nums.toSpliced(0, 1));           // [ 10, 20 ]: removed the item at 0
console.log(nums);                           // [ 30, 10, 20 ]: unchanged after all four

console.log('--- [BEGINNER] findLast / findLastIndex ---');
console.log([1, 8, 3, 9, 2].findLast((n) => n > 5));      // 9
console.log([1, 8, 3, 9, 2].findLastIndex((n) => n > 5)); // 3

console.log('--- [ADVANCED] flat and flatMap ---');
console.log([[1, 2], [3, [4]]].flat());         // [ 1, 2, 3, [ 4 ] ]: one level by default
console.log([[1, 2], [3, [4]]].flat(Infinity)); // [ 1, 2, 3, 4 ]
const posts = [
  { title: 'Hooks', tags: ['react', 'js'] },
  { title: 'Express', tags: ['node', 'js'] },
];
console.log(posts.map((p) => p.tags));     // [ [ 'react', 'js' ], [ 'node', 'js' ] ]
console.log(posts.flatMap((p) => p.tags)); // [ 'react', 'js', 'node', 'js' ]
console.log(Array.from(new Set(posts.flatMap((p) => p.tags))).toSorted()); // [ 'js', 'node', 'react' ]

console.log('--- [ADVANCED] Object.groupBy ---');
const students = [
  { id: 1, name: 'Ana', course: 'React' },
  { id: 2, name: 'Ben', course: 'Node' },
  { id: 3, name: 'Carla', course: 'React' },
];
const byCourse = Object.groupBy(students, (s) => s.course);
console.log(byCourse); // [Object: null prototype] { React: [ ... ], Node: [ ... ] }
// "null prototype" means a plain object without inherited methods; read it like any object:
console.log(byCourse.React.map((s) => s.name)); // [ 'Ana', 'Carla' ]
console.log(Object.keys(byCourse));             // [ 'React', 'Node' ]
