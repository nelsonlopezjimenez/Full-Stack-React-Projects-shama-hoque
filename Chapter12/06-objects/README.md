# 06 — Objects

| Method / syntax | Returns | Mutates? | Level |
|---|---|---|---|
| `obj.key` / `obj['key']` | the value, or `undefined` | no | BEGINNER |
| `'key' in obj` / `Object.hasOwn(obj, 'key')` | `true` / `false` | no | BEGINNER |
| `Object.keys(obj)` | array of keys | no | BEGINNER |
| `Object.values(obj)` | array of values | no | BEGINNER |
| `Object.entries(obj)` | array of `[key, value]` pairs | no | BEGINNER |
| `Object.fromEntries(pairs)` | new object (the reverse of `entries`) | no | ADVANCED |
| `{ ...obj, key: v }` | new object (shallow copy + override) | no | BEGINNER |
| `const { a, b = 1, ...rest } = obj` | destructuring with a default and a rest | no | BEGINNER |
| `obj?.a?.b` / `value ?? fallback` | optional chaining / nullish fallback | no | BEGINNER |
| `delete obj.key` | `true` | **yes** | BEGINNER |
| `Object.assign(target, source)` | `target` | **yes** (the target) | ADVANCED |
| `Object.freeze(obj)` | the same object, now read-only (shallow) | **yes** | ADVANCED |

## Edge cases the quiz likes

- `{ a: 1 } === { a: 1 }` is `false`: objects compare by reference.
- `const` stops reassignment, not changes: `const o = {}; o.x = 1` works.
- `0 || 'x'` is `'x'`, but `0 ?? 'x'` is `0`.
- Transform every value: `Object.fromEntries(Object.entries(o).map(([k, v]) => [k, v * 2]))`.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
