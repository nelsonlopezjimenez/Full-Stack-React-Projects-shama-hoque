# 05 — Arrays: modern methods (ES2019–ES2024)

The "change array by copy" methods return a new array, so they're safe for React state.

| Method | Returns | Mutates? | Level |
|---|---|---|---|
| `arr.at(i)` | item at `i`; `at(-1)` is the last | no | BEGINNER |
| `arr.toSorted(fn)` | new sorted array | no (`sort` does) | BEGINNER |
| `arr.toReversed()` | new reversed array | no (`reverse` does) | BEGINNER |
| `arr.toSpliced(start, count, ...items)` | new array with the change | no (`splice` does) | ADVANCED |
| `arr.with(i, value)` | new array with one item replaced | no | ADVANCED |
| `arr.findLast(fn)` / `findLastIndex(fn)` | last match / its index | no | BEGINNER |
| `arr.flat(depth)` | new array with nested arrays flattened (default depth 1) | no | ADVANCED |
| `arr.flatMap(fn)` | `map`, then `flat(1)` | no | ADVANCED |
| `Array.from(iterable, mapFn)` | new array; `Array.from({ length: 3 }, (_, i) => i)` → `[0, 1, 2]` | no | ADVANCED |
| `Object.groupBy(arr, fn)` | object: key → array of items | no | ADVANCED |
| `Map.groupBy(arr, fn)` | `Map`: key → array of items | no | ADVANCED |

## Mutating method → copying twin

| Mutates | Copies instead |
|---|---|
| `sort` | `toSorted` |
| `reverse` | `toReversed` |
| `splice` | `toSpliced` |
| `arr[i] = v` | `arr.with(i, v)` |

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
