# 03 — Arrays: basics

The first question for every array method: **does it change the original array?**

| Method | Returns | Mutates? | Level |
|---|---|---|---|
| `arr.length` | number of items (a property) | — | BEGINNER |
| `arr.push(x)` | the **new length** | **yes** | BEGINNER |
| `arr.pop()` | the removed **last** item | **yes** | BEGINNER |
| `arr.unshift(x)` | the new length | **yes** | BEGINNER |
| `arr.shift()` | the removed **first** item | **yes** | BEGINNER |
| `arr.includes(x)` | `true` / `false` | no | BEGINNER |
| `arr.indexOf(x)` | first index, or `-1` | no | BEGINNER |
| `arr.join(sep)` | **string** (default separator `','`) | no | BEGINNER |
| `arr.slice(start, end)` | new array (a shallow copy of a part) | no | BEGINNER |
| `arr.splice(start, count, ...items)` | array of the **removed** items | **yes** | ADVANCED |
| `arr.concat(other)` / `[...a, ...b]` | new array | no | BEGINNER |
| `arr.reverse()` | the **same** array, reversed | **yes** | BEGINNER |
| `Array.isArray(x)` | `true` / `false` (`typeof []` is `'object'`) | no | BEGINNER |

## Edge cases the quiz likes

- `const a = [1, 2]; const b = a; b.push(3);` → `a` is `[1, 2, 3]` too (same array).
- `[1, 2, 3].push(4)` is `4`, not the array.
- `slice` vs `splice`: one letter apart, opposite behavior.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
