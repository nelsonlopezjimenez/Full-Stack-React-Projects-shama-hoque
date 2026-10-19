# 08 — JSON and cloning

Background: [chat/js-cloning-objects-arrays-and-lodash.md](../../chat/js-cloning-objects-arrays-and-lodash.md)

| Method | Returns | Mutates? | Level |
|---|---|---|---|
| `JSON.stringify(value)` | **string** | no | BEGINNER |
| `JSON.stringify(value, null, 2)` | indented string (for logs and files) | no | BEGINNER |
| `JSON.parse(str)` | the value; **throws** `SyntaxError` on bad JSON | no | BEGINNER |
| `{ ...obj }` / `[...arr]` | **shallow** copy | no | BEGINNER |
| `structuredClone(value)` | **deep** copy (keeps `Date`, `Map`, `Set`) | no | ADVANCED |
| `JSON.stringify(value, ['a', 'b'])` | string with only those keys | no | ADVANCED |
| a `toJSON()` method on an object | what `stringify` uses instead of the object | no | ADVANCED |

## Edge cases the quiz likes

- `JSON.stringify({ a: undefined, f() {} })` is `'{}'`.
- `JSON.stringify(new Date(0))` gives a date string; `JSON.parse` gives back a **string**, not a `Date`.
- Shallow copy: `const b = { ...a }; b.inner.x = 1` also changes `a.inner.x`.
- `structuredClone` throws on functions.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
