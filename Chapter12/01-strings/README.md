# 01 — Strings

Strings are **immutable**: no string method changes the original string.
Every method below returns a **new** value, so you must store or use the result.

```js
const name = 'ada';
name.toUpperCase();          // returns 'ADA' ... and it's thrown away
console.log(name);           // 'ada'
const loud = name.toUpperCase(); // keep the result
```

## Method table

| Method | Returns | Level |
|---|---|---|
| `str.length` | number of characters (a property, no `()`) | BEGINNER |
| `str.toUpperCase()` / `toLowerCase()` | new string | BEGINNER |
| `str.trim()` / `trimStart()` / `trimEnd()` | new string without surrounding whitespace | BEGINNER |
| `str.includes(sub)` | `true` / `false` | BEGINNER |
| `str.startsWith(sub)` / `endsWith(sub)` | `true` / `false` | BEGINNER |
| `str.indexOf(sub)` | first index, or `-1` if not found | BEGINNER |
| `str.slice(start, end)` | new string from `start` up to (not including) `end`; negatives count from the end | BEGINNER |
| `str.split(sep)` | **array** of strings | BEGINNER |
| `str.repeat(n)` | new string repeated `n` times | BEGINNER |
| `str.at(i)` | character at `i`; `at(-1)` is the last one; `undefined` if out of range | BEGINNER |
| `str.padStart(len, fill)` / `padEnd` | new string padded to `len` characters | ADVANCED |
| `str.replace(a, b)` | new string, **first** match replaced (all matches with a `/g` regex) | ADVANCED |
| `str.replaceAll(a, b)` | new string, **every** match replaced | ADVANCED |
| `str.localeCompare(other)` | negative / `0` / positive (use it to sort words) | ADVANCED |
| `` `Hi ${name}` `` | template literal: new string with values inserted | BEGINNER |
| `[...str]` / `Array.from(str)` | array of characters | ADVANCED |

## Edge cases the quiz likes

- `'abc'[5]` is `undefined`, and so is `'abc'.at(5)`.
- `'a,b,,c'.split(',')` is `['a', 'b', '', 'c']`: empty strings are kept.
- `'hello'.split('')` is `['h', 'e', 'l', 'l', 'o']`.
- `'aaa'.replace('a', 'b')` is `'baa'`: only the first match is replaced.
- `'abc'.slice(-2)` is `'bc'`.

## Files

- `examples.js`: `node 01-strings/examples.js`
- `exercises.js`: your work
- `exercises.test.js`: `node --test 01-strings/exercises.test.js`
- `quiz.md`: self-check questions
