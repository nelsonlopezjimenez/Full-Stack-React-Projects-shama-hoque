# Chapter 12 — JavaScript built-in methods

Not a chapter of the book. This is a study and practice folder for the JavaScript
built-ins you use in every chapter (`map`, `filter`, `reduce`, `Object.entries`,
`structuredClone`, `Promise.all`, ...). The quizzes and exams draw from these topics.

## How to study one topic

1. **Read** the topic's `README.md`. Its table tells you, for each method:
   what it **returns**, whether it **mutates** the original, and its level.
2. **Run** the examples and compare the output with what you expected:
   `node 01-strings/examples.js`
3. **Solve** the exercises in `exercises.js`. Each one says `[BEGINNER]` or `[ADVANCED]`.
4. **Check** your work with the tests:
   `node --test 01-strings/exercises.test.js`
5. **Self-check** with `quiz.md` (predict-the-output questions, the same style as the quiz).

Run every topic's tests at once from inside `Chapter12/`:

```bash
npm test
```

No `npm install` needed: the tests use Node's built-in test runner (`node:test`).
Node 22 or newer is required (some methods, like `Set.prototype.union`, are new).

## Topics

| Folder | Topic | Status |
|---|---|---|
| `01-strings/` | `slice`, `split`, `trim`, `padStart`, `replaceAll`, `at`, ... | ready |
| `02-numbers-and-math/` | `toFixed`, `parseInt`, `Number.isInteger`, `Math.*` | outline |
| `03-arrays-basics/` | `push`, `pop`, `slice`, `splice`, `includes`, `indexOf`, `join` | outline |
| `04-arrays-callbacks/` | `forEach`, `map`, `filter`, `find`, `some`, `every`, `reduce`, `sort` | ready + React |
| `05-arrays-modern/` | `Array.from`, `at`, `toSorted`, `toReversed`, `with`, `flat`, `flatMap`, `Object.groupBy` | ready + React |
| `06-objects/` | `Object.keys/values/entries/fromEntries`, spread, destructuring, `freeze` | outline |
| `07-map-and-set/` | `Map`, `Set`, set operations (`union`, `intersection`, ...) | outline |
| `08-json-and-cloning/` | `JSON.stringify/parse`, shallow vs deep copy, `structuredClone` | outline |
| `09-dates-and-intl/` | `Date`, `Intl.DateTimeFormat`, `Intl.NumberFormat`, `toLocaleString` | outline |
| `10-regexp/` | `test`, `match`, `matchAll`, `replace` with groups, flags | outline |
| `11-promises-and-async/` | `async/await`, `Promise.all`, `allSettled`, `any`, `race` | outline |

## Inside each topic folder

```text
01-strings/
├── README.md          study notes + the method table (returns? mutates? level)
├── examples.js        runnable demos: node 01-strings/examples.js
├── exercises.js       your work: replace each `throw new Error('TODO ...')`
├── exercises.test.js  the checks: node --test 01-strings/exercises.test.js
└── quiz.md            predict-the-output questions for self-study
```

Topics marked "+ React" also have two `.jsx` files that use the same methods
to build lists in React components:

```text
04-arrays-callbacks/
├── react-lists.jsx      worked examples: read them, run them in a Vite app
└── react-exercises.jsx  components for you to finish
```

They run in a Vite + React app, not in Node: see the steps at the top of each file.

## Three questions to ask about every method

The quiz asks these over and over. Learn the answer for each method in the tables.

1. **What does it return?** A new array? The same array? A single value? `undefined`?
2. **Does it mutate** (change) the original? `sort` does; `toSorted` doesn't.
3. **What happens at the edges?** Empty array, missing key, negative index, `NaN`.

## Related notes

- [chat/js-cloning-objects-arrays-and-lodash.md](../chat/js-cloning-objects-arrays-and-lodash.md):
  shallow vs deep copies, background for `08-json-and-cloning/`.
