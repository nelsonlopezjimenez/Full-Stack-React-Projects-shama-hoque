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

- `examples.js`: `node 05-arrays-modern/examples.js`
- `exercises.js`: your work (12 exercises, half of them with `Array.from`)
- `exercises.test.js`: `node --test 05-arrays-modern/exercises.test.js`
- `quiz.md`: self-check questions, including React ones
- `react-lists.jsx`: worked React examples. Stars, loading rows, pagination and a
  3×3 board with `Array.from`; `toSorted` on props; `Object.groupBy` sections
- `react-exercises.jsx`: React components for you to finish

The `.jsx` files run in a Vite + React app, not in Node. The steps are at the top of each file
(and in [instructions/new-vite-react-project-from-the-command-line.md](../../instructions/new-vite-react-project-from-the-command-line.md)).

## Array.from or map?

- You have **data** (an array of students) → `students.map((s) => <li key={s.id}>...</li>)`
- You only have a **number** (5 stars, 3 pages, a 3×3 board) →
  `Array.from({ length: 5 }, (_, i) => <span key={i}>★</span>)`

`Array.from({ length: n }, fn)` works like `map` over an array of `n` empty slots:
the first callback parameter is `undefined` (name it `_`), the second is the index.
