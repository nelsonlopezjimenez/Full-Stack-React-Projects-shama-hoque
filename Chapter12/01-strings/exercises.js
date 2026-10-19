// 01 — Strings: exercises
//
// Replace each `throw new Error('TODO ...')` with your code.
// Check your work: node --test 01-strings/exercises.test.js
// Use string methods only (no loops needed for any of these).

// [BEGINNER] Return the text in upper case followed by "!".
// shout('hi') → 'HI!'
export function shout(text) {
  throw new Error('TODO shout');
}

// [BEGINNER] Return the initials of a full name, each followed by a dot.
// initials('ada lovelace') → 'A.L.'
// initials('grace brewster hopper') → 'G.B.H.'
// Hint: split, map, join.
export function initials(fullName) {
  throw new Error('TODO initials');
}

// [BEGINNER] Return the file extension without the dot, in lower case.
// Return '' when there is no dot.
// extension('photo.JPG') → 'jpg'
// extension('archive.tar.gz') → 'gz'
// extension('README') → ''
export function extension(fileName) {
  throw new Error('TODO extension');
}

// [BEGINNER] Pad a numeric id with zeros on the left to `width` characters.
// padId(7, 4) → '0007'
// padId(12345, 4) → '12345' (never cut a longer id)
export function padId(id, width) {
  throw new Error('TODO padId');
}

// [ADVANCED] Return true if the text reads the same backwards,
// ignoring case and spaces.
// isPalindrome('Never odd or even') → true
// isPalindrome('hello') → false
export function isPalindrome(text) {
  throw new Error('TODO isPalindrome');
}

// [ADVANCED] Shorten text to at most `max` characters.
// If it was cut, the last character becomes '…' (so the result is still `max` long).
// truncate('Hello world', 8) → 'Hello w…'
// truncate('Hi', 8) → 'Hi'
export function truncate(text, max) {
  throw new Error('TODO truncate');
}

// [ADVANCED] Turn a title into a URL slug: lower case, trimmed,
// anything that isn't a letter or digit becomes a single '-',
// and no '-' at the start or end.
// slugify('  Hello, World!  ') → 'hello-world'
// slugify('React & Node: 2026') → 'react-node-2026'
export function slugify(title) {
  throw new Error('TODO slugify');
}
