# 04 — Arrays: methods that take a callback

These call your function once per item: `(item, index, array) => ...`.

| Method | Your callback returns | Method returns | Mutates? | Level |
|---|---|---|---|---|
| `forEach(fn)` | nothing | `undefined` | no | BEGINNER |
| `map(fn)` | the new item | new array, **same length** | no | BEGINNER |
| `filter(fn)` | `true` to keep | new array, same or shorter | no | BEGINNER |
| `find(fn)` | `true` when found | the **first** match, or `undefined` | no | BEGINNER |
| `findIndex(fn)` | `true` when found | index, or `-1` | no | BEGINNER |
| `some(fn)` | `true` / `false` | `true` if **any** item passes | no | BEGINNER |
| `every(fn)` | `true` / `false` | `true` if **all** pass (`true` for `[]`) | no | BEGINNER |
| `reduce(fn, start)` | the next accumulator | the final accumulator | no | ADVANCED |
| `sort(compareFn)` | negative / 0 / positive | the **same** array, sorted | **yes** | ADVANCED |

## Edge cases the quiz likes

- `[10, 9, 1].sort()` is `[1, 10, 9]`: without a compare function it sorts as **strings**.
  For numbers: `sort((a, b) => a - b)`.
- `arr.map((x) => { x * 2 })` gives `[undefined, ...]`: braces need `return`.
- `reduce` without a start value throws on an empty array.
- `['1', '2', '3'].map(parseInt)` is `[1, NaN, NaN]` (the index is passed as the radix).

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
