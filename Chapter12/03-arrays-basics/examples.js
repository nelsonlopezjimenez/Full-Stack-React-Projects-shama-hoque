// Run me: node 03-arrays-basics/examples.js
// Read each line, predict the output, then run the file and compare.

console.log('--- [BEGINNER] length and indexes ---');
const colors = ['red', 'green', 'blue'];
console.log(colors.length);                 // 3
console.log(colors[0]);                     // 'red'
console.log(colors[colors.length - 1]);     // 'blue': the last index is length - 1
console.log(colors[10]);                    // undefined: no error, just nothing there

console.log('--- [BEGINNER] push / pop: the END of the array ---');
const stack = ['a', 'b'];
console.log(stack.push('c'));  // 3: push returns the NEW LENGTH, not the array
console.log(stack);            // [ 'a', 'b', 'c' ]
console.log(stack.pop());      // 'c': pop returns the item it removed
console.log(stack);            // [ 'a', 'b' ]
console.log([].pop());         // undefined: nothing to remove

console.log('--- [BEGINNER] unshift / shift: the START of the array ---');
const queue = ['b', 'c'];
console.log(queue.unshift('a')); // 3: the new length again
console.log(queue);              // [ 'a', 'b', 'c' ]
console.log(queue.shift());      // 'a'
console.log(queue);              // [ 'b', 'c' ]

console.log('--- [BEGINNER] searching ---');
const pets = ['cat', 'dog', 'cat'];
console.log(pets.includes('dog'));   // true
console.log(pets.includes('Dog'));   // false: the comparison is exact (===)
console.log(pets.indexOf('cat'));    // 0: the FIRST match
console.log(pets.lastIndexOf('cat')); // 2
console.log(pets.indexOf('fish'));   // -1 means "not found"
console.log([NaN].includes(NaN), [NaN].indexOf(NaN)); // true -1: only includes finds NaN

console.log('--- [BEGINNER] join: array → string ---');
console.log(colors.join());       // 'red,green,blue' (the default separator is a comma)
console.log(colors.join(', '));   // 'red, green, blue'
console.log(colors.join(''));     // 'redgreenblue'
console.log('a-b-c'.split('-'));  // [ 'a', 'b', 'c' ]: split goes the other way

console.log('--- [BEGINNER] slice: a COPY of a part (original unchanged) ---');
const nums = [10, 20, 30, 40, 50];
console.log(nums.slice(1, 3)); // [ 20, 30 ]: from index 1 up to (not including) 3
console.log(nums.slice(2));    // [ 30, 40, 50 ]: to the end
console.log(nums.slice(-2));   // [ 40, 50 ]: negatives count from the end
console.log(nums.slice());     // a shallow copy of the whole array
console.log(nums);             // [ 10, 20, 30, 40, 50 ]: unchanged

console.log('--- [ADVANCED] splice: CHANGES the array, returns what it removed ---');
const letters = ['a', 'b', 'c', 'd'];
console.log(letters.splice(1, 2)); // [ 'b', 'c' ]: removed 2 items starting at index 1
console.log(letters);              // [ 'a', 'd' ]
console.log(letters.splice(1, 0, 'X', 'Y')); // []: removed nothing...
console.log(letters);              // [ 'a', 'X', 'Y', 'd' ]: ...but inserted two items
console.log(letters.splice(-1, 1, 'Z')); // [ 'd' ]: replace the last item
console.log(letters);              // [ 'a', 'X', 'Y', 'Z' ]

console.log('--- [BEGINNER] concat and spread: new arrays ---');
const front = [1, 2];
const back = [3, 4];
console.log(front.concat(back));        // [ 1, 2, 3, 4 ]
console.log([...front, ...back]);       // [ 1, 2, 3, 4 ]: the modern way
console.log([0, ...front, 2.5, ...back]); // spread lets you put items anywhere
console.log(front, back);               // both unchanged

console.log('--- [BEGINNER] reverse CHANGES the array ---');
const order = [1, 2, 3];
const reversed = order.reverse();
console.log(reversed, order, reversed === order); // [ 3, 2, 1 ] [ 3, 2, 1 ] true
console.log([...order].reverse(), order);         // reverse a copy to keep the original

console.log('--- [ADVANCED] references: two names, ONE array ---');
const a = [1, 2];
const b = a;               // not a copy: b points to the same array
b.push(3);
console.log(a);            // [ 1, 2, 3 ]
const c = [...a];          // a real (shallow) copy
c.push(4);
console.log(a, c);         // [ 1, 2, 3 ] [ 1, 2, 3, 4 ]
console.log([1, 2] === [1, 2]); // false: two different arrays, even with the same items
console.log(a === b);      // true: the same array

console.log('--- [ADVANCED] const arrays can still change ---');
const list = [];
list.push('ok');           // allowed: const stops reassignment, not changes
console.log(list);         // [ 'ok' ]
// list = ['new'];         // TypeError: Assignment to constant variable.

console.log('--- [BEGINNER] Array.isArray ---');
console.log(typeof [1, 2]);        // 'object': typeof can't tell arrays apart
console.log(Array.isArray([1, 2])); // true
console.log(Array.isArray('abc'));  // false
