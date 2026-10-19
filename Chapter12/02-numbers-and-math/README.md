# 02 — Numbers and Math

| Method | Returns | Mutates? | Level |
|---|---|---|---|
| `Number(str)` | number, or `NaN` if the whole string isn't numeric | no | BEGINNER |
| `parseInt(str, 10)` / `parseFloat(str)` | number read from the start of the string (`'12px'` → 12) | no | BEGINNER |
| `num.toFixed(d)` | **string** with `d` decimals | no | BEGINNER |
| `Number.isInteger(x)` / `Number.isNaN(x)` | `true` / `false` | no | BEGINNER |
| `Math.round` / `floor` / `ceil` / `trunc` | number | no | BEGINNER |
| `Math.max(...nums)` / `Math.min(...nums)` | number (`-Infinity` / `Infinity` with no arguments) | no | BEGINNER |
| `Math.random()` | number in `[0, 1)` | no | BEGINNER |
| `Math.abs` / `Math.sqrt`, `**` | number | no | BEGINNER |
| `num.toLocaleString()` | formatted **string** (`1234.5` → `'1,234.5'`) | no | ADVANCED |
| `0.1 + 0.2`, `Number.EPSILON` | why floating point isn't exact | — | ADVANCED |

## Edge cases the quiz likes

- `NaN === NaN` is `false`; use `Number.isNaN`.
- `(2.5).toFixed(0)` gives a string, so `+` concatenates.
- `parseInt('08')` is 8, `Number('')` is 0, `Number('12px')` is `NaN`.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
