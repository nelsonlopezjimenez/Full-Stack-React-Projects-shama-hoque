// Run me: node 01-strings/examples.js
// Read each line, predict the output, then run the file and compare.

console.log('--- [BEGINNER] basics ---');
const city = '  Lima, Peru  ';
console.log(city.length);          // 14 (spaces count)
console.log(city.trim());          // 'Lima, Peru'
console.log(city.trim().toUpperCase()); // methods chain: each one returns a new string
console.log(city);                 // unchanged: strings are immutable

console.log('--- [BEGINNER] searching ---');
const file = 'report-2026.pdf';
console.log(file.includes('2026'));   // true
console.log(file.endsWith('.pdf'));   // true
console.log(file.indexOf('-'));       // 6
console.log(file.indexOf('xyz'));     // -1 means "not found"

console.log('--- [BEGINNER] cutting and splitting ---');
console.log(file.slice(0, 6));        // 'report'
console.log(file.slice(-4));          // '.pdf' (negative counts from the end)
console.log(file.at(0), file.at(-1)); // 'r' 'f'
console.log('a,b,c'.split(','));      // [ 'a', 'b', 'c' ]
console.log('a,b,c'.split(',').join(' | ')); // split + join is a common pair

console.log('--- [ADVANCED] padding and replacing ---');
console.log(String(7).padStart(3, '0'));         // '007'
console.log('Total'.padEnd(10, '.') + '$5');     // 'Total.....$5'
console.log('a-b-c'.replace('-', '+'));          // 'a+b-c' (first only)
console.log('a-b-c'.replaceAll('-', '+'));       // 'a+b+c'
console.log('a-b-c'.replace(/-/g, '+'));         // 'a+b+c' (regex with the g flag)

console.log('--- [ADVANCED] sorting words ---');
const names = ['émile', 'Zoe', 'adam'];
console.log(names.toSorted());                              // by code unit: [ 'Zoe', 'adam', 'émile' ]
console.log(names.toSorted((a, b) => a.localeCompare(b)));  // human order: [ 'adam', 'émile', 'Zoe' ]
