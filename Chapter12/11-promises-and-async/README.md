# 11 — Promises and async/await

| Method / syntax | Resolves to | Rejects when | Level |
|---|---|---|---|
| `async function f()` | always returns a **Promise** of its return value | the function throws | BEGINNER |
| `await promise` | the resolved value | (it throws instead; use `try/catch`) | BEGINNER |
| `Promise.resolve(v)` / `Promise.reject(e)` | an already settled promise | | BEGINNER |
| `Promise.all([p1, p2])` | array of values, in input order | **any** one rejects | BEGINNER |
| `Promise.allSettled([...])` | array of `{ status, value }` or `{ status, reason }` | never | ADVANCED |
| `Promise.any([...])` | the **first fulfilled** value | **all** reject (`AggregateError`) | ADVANCED |
| `Promise.race([...])` | whichever settles **first** | the first to settle rejects | ADVANCED |
| `Promise.withResolvers()` | returns `{ promise, resolve, reject }` | | ADVANCED |
| `setTimeout` from `node:timers/promises` | a promise you can `await` | | ADVANCED |

## Edge cases the quiz likes

- Order of output: synchronous code first, then promise callbacks, then `setTimeout`.
- `await` inside `forEach` doesn't wait; use `for...of` (one at a time) or `Promise.all` (all together).
- Forgetting `await` gives you a `Promise` object, not the value.
- Two independent requests: `await Promise.all([a(), b()])` is faster than two `await`s in a row.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
