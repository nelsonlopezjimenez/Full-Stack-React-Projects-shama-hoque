# 09 — Dates and Intl

| Method | Returns | Mutates? | Level |
|---|---|---|---|
| `new Date()` / `Date.now()` | now, as a `Date` / as milliseconds | — | BEGINNER |
| `new Date('2026-10-19')` | a date (a date-only string is read as **UTC**) | — | BEGINNER |
| `d.getFullYear()` / `getMonth()` / `getDate()` / `getDay()` | number (`getMonth` is **0–11**) | no | BEGINNER |
| `d.toISOString()` | `'2026-10-19T00:00:00.000Z'` | no | BEGINNER |
| `d.setDate(d.getDate() + 7)` | a timestamp; changes `d` | **yes** | ADVANCED |
| `d2 - d1` | the difference in milliseconds | no | ADVANCED |
| `d.toLocaleDateString('en-US', options)` | formatted string | no | BEGINNER |
| `new Intl.DateTimeFormat(locale, options).format(d)` | formatted string (a reusable formatter) | no | ADVANCED |
| `new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(1234.5)` | `'$1,234.50'` | no | ADVANCED |
| `new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(-1, 'day')` | `'yesterday'` | no | ADVANCED |

## Edge cases the quiz likes

- `new Date(2026, 0, 31)` is January 31: months start at 0.
- `getDay()` is the weekday (0 = Sunday); `getDate()` is the day of the month.
- `Date` setters mutate; copy first: `const next = new Date(d)`.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
