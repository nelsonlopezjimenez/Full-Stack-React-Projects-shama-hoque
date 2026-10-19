# 07 — Map and Set

| Method | Returns | Mutates? | Level |
|---|---|---|---|
| `new Set(arr)` | set of unique values | — | BEGINNER |
| `[...new Set(arr)]` | array without duplicates | no | BEGINNER |
| `set.add(x)` | the set (so calls chain) | **yes** | BEGINNER |
| `set.has(x)` | `true` / `false` | no | BEGINNER |
| `set.delete(x)` | `true` if it was there | **yes** | BEGINNER |
| `set.size` | number (a property; not `length`) | — | BEGINNER |
| `a.union(b)` / `intersection` / `difference` / `symmetricDifference` | new set | no | ADVANCED |
| `a.isSubsetOf(b)` / `isSupersetOf` / `isDisjointFrom` | `true` / `false` | no | ADVANCED |
| `new Map(entries)` | map; keys can be **any** type | — | BEGINNER |
| `map.set(k, v)` | the map | **yes** | BEGINNER |
| `map.get(k)` | the value, or `undefined` | no | BEGINNER |
| `map.has(k)` / `map.delete(k)` / `map.size` | same as for `Set` | | BEGINNER |
| `for (const [k, v] of map)` | iterates in insertion order | no | ADVANCED |
| `Object.fromEntries(map)` / `new Map(Object.entries(obj))` | convert between a Map and an object | no | ADVANCED |

## Map or object?

- Object: a fixed shape, JSON-friendly (`{ name, email }`).
- Map: keys added and removed at runtime, non-string keys, or you need `size`.

## Files

Status: **outline**. `examples.js`, `exercises.js`, `exercises.test.js` and `quiz.md`
follow the same pattern as `01-strings/`.
