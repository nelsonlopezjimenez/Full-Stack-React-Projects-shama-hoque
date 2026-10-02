# JavaScript — Cloning objects and arrays, and where lodash fits today

**Date:** 2026-10-02
**Project:** General JavaScript (applies to every chapter)
**Status:** Q&A only. No code changed.

---

## Question 1

> JavaScript method: `Object.assign(...)`: is it current, or are `...object` and `object.map()` more current for cloning an object or array?

### Answer

All of them are still valid. The difference is how deep the copy goes and what you're copying.

#### Objects

| Method | Depth | Status |
|---|---|---|
| `Object.assign({}, obj)` | Shallow | Still valid, but older style (ES2015) |
| `{ ...obj }` | Shallow | **Preferred** for shallow copies (ES2018) |
| `structuredClone(obj)` | **Deep** | **Current standard** for deep copies (Node 17+, all modern browsers) |
| `JSON.parse(JSON.stringify(obj))` | Deep (lossy) | Outdated. It loses `Date`, `Map`, `Set`, `undefined`, functions and circular references |

```js
const user = { name: 'Ana', address: { city: 'Lima' } };

const a = { ...user };            // shallow: a.address === user.address
const b = structuredClone(user);  // deep:    b.address !== user.address
```

`Object.assign` is still the right tool in one case: when you **mutate an existing target**, such as merging into `this` or into a Mongoose doc:

```js
Object.assign(existingUser, req.body); // mutates existingUser in place
```

To build a **new** object, spread is more idiomatic:

```js
const updated = { ...user, name: 'Luis' }; // copy + override
```

#### Arrays

`.map()` isn't a cloning method. It **transforms** each element. It does return a new array, but people only use it for copying when they also change the items:

| Method | Use |
|---|---|
| `[...arr]` | **Preferred** shallow copy |
| `arr.slice()` / `Array.from(arr)` | Older but valid shallow copies |
| `arr.map(x => ({ ...x }))` | Copies the array **and** shallow-copies each object inside it, one level deeper |
| `structuredClone(arr)` | Full deep copy |

ES2023 also added non-mutating versions of the old mutating methods, which copy and change in one step:

```js
const sorted   = arr.toSorted();      // instead of [...arr].sort()
const reversed = arr.toReversed();
const replaced = arr.with(0, 'new');  // copy with index 0 replaced
const removed  = arr.toSpliced(1, 1);
```

#### Rule of thumb

- Shallow copy of an object or array: use `{ ...obj }` or `[...arr]`
- Deep copy: use `structuredClone()`
- Merging into an object that already exists: use `Object.assign(target, src)`
- Copying and transforming items: use `.map()`

One catch: `structuredClone` can't copy functions, class prototypes, or DOM nodes. For a Mongoose document, call `.toObject()` first.

---

## Question 2

> Related to this topic is the use of lodash. What is it and what is its current status?

### Answer

**What it is.** [lodash](https://lodash.com) is a utility library, the successor to Underscore.js. It gives you a few hundred helper functions for objects, arrays, strings and functions: `_.cloneDeep`, `_.merge`, `_.get`, `_.groupBy`, `_.debounce`, `_.isEqual` and many more. Before ES2015, JavaScript had few of these built in, so lodash was in almost every project. It is still one of the most downloaded packages on npm, mostly as a dependency of other packages.

The book uses it too. In `Chapter03 and 04/mern-skeleton/server/controllers/user.controller.js` (on `main`), the `update` handler merges the request body into the user document:

```js
import _ from 'lodash'

let user = req.profile
user = _.extend(user, req.body)   // same idea as Object.assign(user, req.body)
```

**Current status.**

- **Mature and in maintenance mode.** Version 4.17.x has been the line for years. Releases are rare and are mostly security fixes. A lodash v5 has been talked about for a long time but has not replaced v4. It works and is safe to use when kept up to date, but don't expect new features.
- **Much of it now exists in the language.** Most of the helpers people reached for are built in now:

  | lodash | Native replacement |
  |---|---|
  | `_.cloneDeep(obj)` | `structuredClone(obj)` |
  | `_.clone(obj)` / `_.extend` / `_.assign` | `{ ...obj }` / `Object.assign()` |
  | `_.get(obj, 'a.b.c')` | `obj?.a?.b?.c` |
  | `_.uniq(arr)` | `[...new Set(arr)]` |
  | `_.flatten` / `_.flattenDeep` | `arr.flat()` / `arr.flat(Infinity)` |
  | `_.groupBy(arr, fn)` | `Object.groupBy(arr, fn)` (ES2024) |
  | `_.find`, `_.filter`, `_.map`, `_.includes` | Array methods |
  | `_.keys`, `_.values`, `_.toPairs` | `Object.keys`, `Object.values`, `Object.entries` |
  | `_.isNil(x)` | `x == null` |

- **Some things still have no native equivalent.** `_.merge` (deep merge), `_.isEqual` (deep equality), `_.debounce` / `_.throttle`, `_.set` with a path. For these lodash is still reasonable, or you can write a short helper.
- **Bundle size.** `import _ from 'lodash'` pulls in the whole library. On the client, import single functions (`import debounce from 'lodash/debounce.js'`) or use `lodash-es`, which bundlers can tree-shake.
- **Modern alternatives.** [es-toolkit](https://es-toolkit.dev) is a smaller, faster, TypeScript-first library with a `es-toolkit/compat` layer that matches the lodash API. Some projects use it as a drop-in replacement. The [You Don't Need Lodash/Underscore](https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore) project lists native replacements and has an ESLint plugin that flags them.

#### Recommendation for this course

- For new code, use the native feature first (spread, `structuredClone`, optional chaining, array methods).
- In the MERN Skeleton controller, `_.extend(user, req.body)` is the only lodash call. The `refactor/ch03-migration` branch already replaces it with a native copy of only the allowed fields, and removes the lodash dependency. Copying only allowed fields also stops a client from setting fields like `hashed_password` through the request body.
- Keep lodash (or es-toolkit) only for deep merge, deep equality, or debounce/throttle.
