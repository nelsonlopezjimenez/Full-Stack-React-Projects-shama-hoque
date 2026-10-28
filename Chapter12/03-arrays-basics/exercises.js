// 03 — Arrays basics: exercises
//
// Replace each `throw new Error('TODO ...')` with your code.
// Two exercises say "Fix the bug": their code runs but gives the wrong answer.
// Check your work: node --test 03-arrays-basics/exercises.test.js
//
// No loops and no callbacks (map, filter... come in 04-arrays-callbacks).
// Use: length, [index], push, pop, shift, unshift, includes, indexOf,
// join, slice, splice, concat, spread (...), reverse.
//
// Read each comment carefully: some exercises MUST change the array they get,
// and others must NOT. The tests check both.

// [BEGINNER] Return a new array with the first and the last item.
// firstAndLast(['a', 'b', 'c']) → ['a', 'c']
// firstAndLast(['solo']) → ['solo', 'solo']
export function firstAndLast(arr) {
  throw new Error('TODO firstAndLast');
}

// [BEGINNER] true if the list has the item, false otherwise.
// contains(['cat', 'dog'], 'dog') → true
export function contains(list, item) {
  throw new Error('TODO contains');
}

// [BEGINNER] The item's position counting from 1 (like a person would),
// or 0 when it isn't in the list. Use the first match.
// positionOf(['a', 'b', 'c'], 'b') → 2
// positionOf(['a', 'b', 'c'], 'z') → 0
export function positionOf(list, item) {
  throw new Error('TODO positionOf');
}

// [BEGINNER] The first `n` items as a NEW array. Don't change `arr`.
// firstN([10, 20, 30, 40], 2) → [10, 20]
// firstN([10, 20], 5) → [10, 20]
export function firstN(arr, n) {
  throw new Error('TODO firstN');
}

// [BEGINNER] One NEW array with the items of `a`, then the items of `b`.
// Don't change `a` or `b`.
// merge([1, 2], [3]) → [1, 2, 3]
export function merge(a, b) {
  throw new Error('TODO merge');
}

// [BEGINNER] Waiting line: add `item` to the END of `queue` (change `queue`)
// and return how many are in line now.
// const line = ['Ana']; joinLine(line, 'Ben') → 2, and line is ['Ana', 'Ben']
export function joinLine(queue, item) {
  throw new Error('TODO joinLine');
}

// [BEGINNER] Waiting line: remove the person at the FRONT of `queue`
// (change `queue`) and return them, or undefined if the line is empty.
// const line = ['Ana', 'Ben']; serveNext(line) → 'Ana', and line is ['Ben']
export function serveNext(queue) {
  throw new Error('TODO serveNext');
}

// [BEGINNER] Fix the bug. It should return true for an empty array.
// isEmpty([]) → true, isEmpty([0]) → false
export function isEmpty(arr) {
  return arr === [];
}

// [BEGINNER] Fix the bug. It should return a NEW array with `item` added at the
// end, and leave `arr` unchanged. Right now the caller's array changes too.
// const nums = [1, 2]; copyAndAdd(nums, 3) → [1, 2, 3], and nums is still [1, 2]
export function copyAndAdd(arr, item) {
  const copy = arr;
  copy.push(item);
  return copy;
}

// [ADVANCED] The items in reverse order, as a NEW array. Don't change `arr`.
// reversedCopy([1, 2, 3]) → [3, 2, 1]
export function reversedCopy(arr) {
  throw new Error('TODO reversedCopy');
}

// [ADVANCED] Remove the item at `index` from `arr` (change `arr`)
// and return the removed item.
// const letters = ['a', 'b', 'c']; removeAt(letters, 1) → 'b', and letters is ['a', 'c']
export function removeAt(arr, index) {
  throw new Error('TODO removeAt');
}

// [ADVANCED] Insert `item` at `index` in `arr` (change `arr`); nothing is removed.
// Return the same array.
// const letters = ['a', 'c']; insertAt(letters, 1, 'b') → ['a', 'b', 'c'] (and it's `letters`)
export function insertAt(arr, index, item) {
  throw new Error('TODO insertAt');
}

// [ADVANCED] The middle item of an odd-length array, or the middle TWO items
// of an even-length one, as a NEW array. [] for an empty array.
// middle([1, 2, 3, 4, 5]) → [3]
// middle([1, 2, 3, 4]) → [2, 3]
// Hint: slice and Math.floor.
export function middle(arr) {
  throw new Error('TODO middle');
}

// [ADVANCED] Move the first `k` items to the end, as a NEW array.
// A `k` bigger than the length wraps around. Don't change `arr`.
// rotate([1, 2, 3, 4, 5], 2) → [3, 4, 5, 1, 2]
// rotate([1, 2, 3], 4) → [2, 3, 1] (4 steps = 1 step for 3 items)
// rotate([], 3) → []
export function rotate(arr, k) {
  throw new Error('TODO rotate');
}

// [ADVANCED] A list of words as an English phrase.
// toSentence(['Ana', 'Ben', 'Carla']) → 'Ana, Ben and Carla'
// toSentence(['Ana', 'Ben']) → 'Ana and Ben'
// toSentence(['Ana']) → 'Ana'
// toSentence([]) → ''
// Hint: slice everything but the last word, then join.
export function toSentence(words) {
  throw new Error('TODO toSentence');
}
