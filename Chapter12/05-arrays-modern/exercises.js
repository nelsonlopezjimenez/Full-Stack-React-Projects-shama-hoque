// 05 — Modern array methods: exercises
//
// Replace each `throw new Error('TODO ...')` with your code.
// Check your work: node --test 05-arrays-modern/exercises.test.js
//
// No for loops, and never change an array you were given:
// use Array.from, at, toSorted, toReversed, with, toSpliced, flatMap, Object.groupBy.

// [BEGINNER] Every whole number from start to end, both included.
// Return [] when end is smaller than start.
// range(1, 5) → [1, 2, 3, 4, 5]
// range(3, 3) → [3]
// range(5, 1) → []
// Hint: Array.from({ length: ... }, (_, i) => ...)
export function range(start, end) {
  throw new Error('TODO range');
}

// [BEGINNER] The last item, or undefined for an empty array.
// lastItem(['a', 'b', 'c']) → 'c'
export function lastItem(arr) {
  throw new Error('TODO lastItem');
}

// [BEGINNER] An array of the characters in a string, emoji included.
// chars('ok👍') → ['o', 'k', '👍'] (split('') would give 4 items)
export function chars(text) {
  throw new Error('TODO chars');
}

// [BEGINNER] The numbers from lowest to highest, as a NEW array.
// sortedCopy([30, 4, 100]) → [4, 30, 100]
export function sortedCopy(nums) {
  throw new Error('TODO sortedCopy');
}

// [BEGINNER] Page numbers for pagination buttons: 1, 2, 3, ...
// One page per `perPage` items; a last, partly full page still counts.
// pageNumbers(25, 10) → [1, 2, 3]
// pageNumbers(20, 10) → [1, 2]
// pageNumbers(0, 10) → []
export function pageNumbers(totalItems, perPage) {
  throw new Error('TODO pageNumbers');
}

// [ADVANCED] A rating as stars: `rating` full stars '★', the rest empty '☆',
// `max` stars in total.
// starRating(3) → '★★★☆☆'
// starRating(1, 3) → '★☆☆'
export function starRating(rating, max = 5) {
  throw new Error('TODO starRating');
}

// [ADVANCED] A rows × cols grid (array of arrays) where every cell is `fill`.
// Each row must be its OWN array: changing grid[0][0] must not change grid[1][0].
// grid(2, 3, 0) → [[0, 0, 0], [0, 0, 0]]
export function grid(rows, cols, fill) {
  throw new Error('TODO grid');
}

// [ADVANCED] The values without duplicates, from lowest to highest.
// uniqueSorted([3, 1, 3, 2, 1]) → [1, 2, 3]
export function uniqueSorted(nums) {
  throw new Error('TODO uniqueSorted');
}

// [ADVANCED] A copy with the item at `index` replaced by `value`.
// Negative indexes count from the end. The original must not change.
// replaceAt(['a', 'b', 'c'], 1, 'X') → ['a', 'X', 'c']
// replaceAt(['a', 'b', 'c'], -1, 'X') → ['a', 'b', 'X']
export function replaceAt(arr, index, value) {
  throw new Error('TODO replaceAt');
}

// [ADVANCED] A copy without the item at `index`. The original must not change.
// removeAt(['a', 'b', 'c'], 0) → ['b', 'c']
export function removeAt(arr, index) {
  throw new Error('TODO removeAt');
}

// [ADVANCED] Every tag used by any post, once each, in alphabetical order.
// allTags([{ tags: ['react', 'js'] }, { tags: ['node', 'js'] }]) → ['js', 'node', 'react']
export function allTags(posts) {
  throw new Error('TODO allTags');
}

// [ADVANCED] Group the students by course: { course: [students...] }.
// groupByCourse([{ name: 'Ana', course: 'React' }, { name: 'Ben', course: 'Node' }])
//   → { React: [{ name: 'Ana', ... }], Node: [{ name: 'Ben', ... }] }
export function groupByCourse(students) {
  throw new Error('TODO groupByCourse');
}
