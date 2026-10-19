# 10 — Regular expressions

| Method | Returns | Mutates? | Level |
|---|---|---|---|
| `/re/.test(str)` | `true` / `false` | no* | BEGINNER |
| `str.match(/re/)` | the first match as an array (with groups), or `null` | no | BEGINNER |
| `str.match(/re/g)` | array of **all** matched strings, or `null` | no | BEGINNER |
| `str.matchAll(/re/g)` | iterator of full match arrays (use `[...]` or `for...of`) | no | ADVANCED |
| `str.replace(/re/g, '$1')` | new string; `$1` is capture group 1 | no | ADVANCED |
| `str.replace(/re/g, (match, g1) => ...)` | new string built by a function | no | ADVANCED |
| `str.split(/\s+/)` | array, split on a pattern | no | BEGINNER |
| `/(?<year>\d{4})/` then `match.groups.year` | named groups | no | ADVANCED |

Flags: `g` global, `i` ignore case, `m` multiline, `u` unicode, `s` dot matches newlines.

\* A regex with the `g` flag remembers `lastIndex`, so calling `test` twice on the
same regex can give `true`, then `false`.

## Patterns worth knowing

`\d` digit, `\w` word character, `\s` whitespace, `.` any character,
`^` start, `$` end, `[abc]` one of, `[^abc]` none of, `+` one or more,
`*` zero or more, `?` optional, `{2,4}` 2 to 4 times.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
