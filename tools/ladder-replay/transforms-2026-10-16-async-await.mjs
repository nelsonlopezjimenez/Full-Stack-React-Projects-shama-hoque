// Text transforms for the Ch03 client ladder: async/await instead of .then, modern syntax.
// Each transform gets LF-only text and returns LF-only text. `hits` records which rules matched.

const C = 'Chapter03 and 04/mern-skeleton/client/'

function replaceExact(text, oldStr, newStr, hits, name) {
  if (!text.includes(oldStr)) return text
  const count = text.split(oldStr).length - 1
  if (count !== 1) throw new Error(`${name}: matched ${count} times`)
  hits.push(name)
  return text.replace(oldStr, () => newStr)
}

// ---------- stage 06: src/Users.jsx (first fetch; explains .then → async/await) ----------
const USERS06_OLD = `  useEffect(() => {
    const controller = new AbortController()
    // [BEGINNER] A relative URL: the request goes to the same server that sent the page (Vite, on
    // port 5173), and Vite forwards everything under /api to Express (see vite.config.js).
    fetch('/api/users', { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((err) => {
        // An aborted request (see the cleanup below) is not an error worth showing.
        if (err.name !== 'AbortError') setError('Cannot reach the server')
      })
`
const USERS06_NEW = `  useEffect(() => {
    const controller = new AbortController()
    // [BEGINNER] fetch() returns a Promise: a value that arrives later. Older code (and many
    // tutorials) handle it with a chain of callbacks:
    //
    //   fetch('/api/users')
    //     .then((response) => response.json())
    //     .then((data) => setUsers(data))
    //     .catch((err) => setError('Cannot reach the server'))
    //
    // async/await (ES2017) is today's practice, and this course uses it from here on. \`await\`
    // pauses the function until the Promise has its value, so the code reads top to bottom like
    // ordinary code, local variables stay in scope, and errors are caught with the same
    // try/catch as any other exception. Underneath it is still the same Promises: \`await p\`
    // is \`p.then(...)\` written differently.
    //
    // [BEGINNER] The effect function itself cannot be async: React expects it to return nothing
    // or a cleanup function, and an async function always returns a Promise. So the async work
    // goes into an inner function that is called right away.
    async function loadUsers() {
      try {
        // [BEGINNER] A relative URL: the request goes to the same server that sent the page (Vite,
        // on port 5173), and Vite forwards everything under /api to Express (see vite.config.js).
        const response = await fetch('/api/users', { signal: controller.signal })
        const data = await response.json()
        setUsers(data)
      } catch (err) {
        // An aborted request (see the cleanup below) is not an error worth showing.
        if (err.name !== 'AbortError') setError('Cannot reach the server')
      }
    }
    loadUsers()
`

// ---------- stages 08+: list()/read() .then(...) inside effects ----------
const LOADER_NAMES = {
  'src/user/Users.jsx': 'loadUsers',
  'src/user/Profile.jsx': 'loadProfile',
  'src/user/EditProfile.jsx': 'loadUser',
}

function thenToAwait(text, rel, hits) {
  const name = LOADER_NAMES[rel]
  const re = /^( +)((?:list|read)\([^\n]*?\))\.then\(\(data\) => \{\n([\s\S]*?)\n\1\}\)\n/m
  const m = text.match(re)
  if (!m) return text
  const [whole, ind, call, body] = m
  // The callback body is already one level deeper than `ind`, the same depth as the new
  // function body, so it moves over unchanged.
  const indented = body
  const intro =
    rel === 'src/user/Users.jsx'
      ? `${ind}// [BEGINNER] The same pattern as in stage 06: an async inner function, called right away.\n`
      : ''
  const replacement =
    `${intro}${ind}async function ${name}() {\n` +
    `${ind}  const data = await ${call}\n` +
    `${indented}\n` +
    `${ind}}\n` +
    `${ind}${name}()\n`
  hits.push(`then→await ${name}`)
  let out = text.replace(whole, () => replacement)
  out = out.replace(
    '// request() never throws, so there is no .catch(). An aborted request (see the cleanup',
    '// request() never throws, so no try/catch is needed. An aborted request (see the cleanup'
  )
  if (re.test(out)) throw new Error(`${rel}: a second .then is left`)
  return out
}

// ---------- stages 08+: src/core/request.js ----------
const REQUEST_OLD = `    // [BEGINNER] Some error responses (e.g. a proxy's 502 page) are not JSON; \`.catch\` turns a
    // parse failure into an empty object instead of an exception.
    const data = await response.json().catch(() => ({}))
`
const REQUEST_NEW = `    // [BEGINNER] Some error responses (e.g. a proxy's 502 page) are not JSON, and response.json()
    // then throws. The inner try/catch keeps an empty object instead. \`catch {\` without \`(err)\`
    // (ES2019) is used when the error itself is not needed.
    let data = {}
    try {
      data = await response.json()
    } catch {
      // not JSON: keep the empty object
    }
`

// ---------- stages 13+: replaceAll ----------
const AUTH_OLD = `token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')`
const AUTH_NEW = `token.split('.')[1].replaceAll('-', '+').replaceAll('_', '/')`
const AUTH_COMMENT_OLD = `// immediately); the server still checks the signature and the expiry on every request.
const isExpired`
const AUTH_COMMENT_NEW = `// immediately); the server still checks the signature and the expiry on every request.
// [BEGINNER] replaceAll (ES2021) replaces every match of a plain string; older code needs a
// regular expression with the g flag for the same thing: .replace(/-/g, '+').
const isExpired`
const HELPERS_OLD = `.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')`
const HELPERS_NEW = `.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')`

// ---------- stages 02–05: Tic-Tac-Toe ----------
const TTT_STATUS_OLD = `  // [ADVANCED] A modern spelling would be a template string and a ternary:
  // const status = winner ? \`Winner: \${winner}\` : \`Next player: \${xIsNext ? 'X' : 'O'}\`;
  const winner = calculateWinner(squares);
  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }
`
const TTT_STATUS_NEW = `  // [BEGINNER] \`Winner: \${winner}\` is a template literal: text in backticks, where \${…} puts a
  // value into the text. It is today's way to build strings; react.dev still writes
  // 'Winner: ' + winner. \`a ? b : c\` (a ternary) picks b when a is true, otherwise c.
  //
  // [ADVANCED] react.dev declares \`let status;\` and assigns it in an if/else. A const with a
  // ternary is the current practice: the value is set once and cannot be changed by accident.
  const winner = calculateWinner(squares);
  const status = winner ? \`Winner: \${winner}\` : \`Next player: \${xIsNext ? 'X' : 'O'}\`;
`
const TTT_DESC_OLD = `    let description;
    if (move > 0) {
      description = 'Go to move #' + move;
    } else {
      description = 'Go to game start';
    }
`
const TTT_DESC_NEW = `    // A const with a ternary and a template literal, like the status line in Board.
    const description = move > 0 ? \`Go to move #\${move}\` : 'Go to game start';
`
const TTT_LOOP_OLD = `  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
`
const TTT_LOOP_NEW = `  for (const [a, b, c] of lines) {
`
const TTT_LOOP_COMMENT_OLD = `// [ADVANCED] \`const [a, b, c] = lines[i]\` is array destructuring again. Functions like this one,`
const TTT_LOOP_COMMENT_NEW = `// [ADVANCED] \`for (const [a, b, c] of lines)\` visits each line in turn (for…of) and unpacks its
// three indexes with array destructuring. react.dev uses the older counting loop
// \`for (let i = 0; i < lines.length; i++)\` with \`lines[i]\`; for…of needs no index to manage.
// Functions like this one,`

// ---------- lesson 06 ----------
const L06 = [
  [
    '// with .then (what this stage uses inside useEffect)',
    '// with .then: the older style, still common in existing code and tutorials',
  ],
  [
    '// the same with async/await (stage 07 uses this style)',
    '// the same with async/await: today\'s practice, used in this stage and every later one',
  ],
  [
    '| `async`/`await` around `fetch` | stage 07 | the same `fetch`, written top to bottom |',
    '| `async`/`await` around `fetch` | this stage, inside the effect | the same `fetch`, written top to bottom |',
  ],
  [
    `- **\`fetch\`** is the browser's built-in way to send HTTP requests. It returns a Promise; \`.then\` runs
  when the answer arrives, and \`response.json()\` reads the body as JSON.`,
    `- **\`fetch\`** is the browser's built-in way to send HTTP requests. It returns a Promise;
  \`await\` waits for its value, and \`response.json()\` (another Promise) reads the body as JSON.
- **\`async\`/\`await\` instead of \`.then\`.** Both handle Promises. \`.then(callback)\` chains are the
  older style you will meet in existing code; \`async\`/\`await\` reads top to bottom and uses ordinary
  \`try\`/\`catch\` for errors, so it is today's practice. An effect cannot be \`async\` itself (it may
  only return a cleanup function), so \`Users.jsx\` puts the work in \`async function loadUsers()\`
  and calls it right away.`,
  ],
]

// ---------- lessons 02 and 03 (Tic-Tac-Toe) ----------
const L02_OLD = `The tutorial uses semicolons and \`function\` declarations; the rest of this client (and the book) leaves the
semicolons out and uses arrow functions. Both are fine. The game keeps the tutorial's style so you can
compare it with react.dev line by line.`
const L02_NEW = `The tutorial uses semicolons and \`function\` declarations; the rest of this client (and the book) leaves the
semicolons out and uses arrow functions. Both are fine, and the game keeps the tutorial's style so you can
compare it with react.dev. Where react.dev uses an older form of the syntax, the game uses today's instead
(from stage 03: template literals, \`const\` with a ternary instead of \`let\` + \`if\`/\`else\`, and \`for…of\`).
A comment at each of those places shows react.dev's version.`
const L03_OLD = `- **The ternary operator** \`xIsNext ? 'X' : 'O'\` is an \`if\`/\`else\` that gives a value.`
const L03_NEW = `- **The ternary operator** \`xIsNext ? 'X' : 'O'\` is an \`if\`/\`else\` that gives a value.
- **Template literals** \`\` \`Winner: \${winner}\` \`\` build text with values in it: backticks, and \`\${…}\` around
  each value. react.dev writes \`'Winner: ' + winner\`; template literals are today's way.
- **\`for…of\`** walks through an array item by item: \`for (const [a, b, c] of lines)\`. react.dev counts
  with \`for (let i = 0; i < lines.length; i++)\` and reads \`lines[i]\`.`

export function transform(path, text) {
  const hits = []
  if (!path.startsWith(C)) return { text, hits }
  const rel = path.slice(C.length)
  let out = text
  if (rel === 'src/Users.jsx') out = replaceExact(out, USERS06_OLD, USERS06_NEW, hits, 'users06')
  if (rel in LOADER_NAMES) out = thenToAwait(out, rel, hits)
  if (rel === 'src/core/request.js') out = replaceExact(out, REQUEST_OLD, REQUEST_NEW, hits, 'request-json')
  if (rel === 'src/auth/auth-helper.js') {
    out = replaceExact(out, AUTH_OLD, AUTH_NEW, hits, 'auth-replaceAll')
    out = replaceExact(out, AUTH_COMMENT_OLD, AUTH_COMMENT_NEW, hits, 'auth-comment')
  }
  if (rel === 'src/test/helpers.js') out = replaceExact(out, HELPERS_OLD, HELPERS_NEW, hits, 'helpers-replaceAll')
  if (rel === 'src/tic-tac-toe/TicTacToe.jsx') {
    out = replaceExact(out, TTT_STATUS_OLD, TTT_STATUS_NEW, hits, 'ttt-status')
    out = replaceExact(out, TTT_DESC_OLD, TTT_DESC_NEW, hits, 'ttt-desc')
    out = replaceExact(out, TTT_LOOP_OLD, TTT_LOOP_NEW, hits, 'ttt-loop')
    out = replaceExact(out, TTT_LOOP_COMMENT_OLD, TTT_LOOP_COMMENT_NEW, hits, 'ttt-loop-comment')
  }
  if (rel === 'lessons/02-ttt-lift-state.md') out = replaceExact(out, L02_OLD, L02_NEW, hits, 'l02')
  if (rel === 'lessons/03-ttt-winner.md') out = replaceExact(out, L03_OLD, L03_NEW, hits, 'l03')
  if (rel === 'lessons/06-users-list.md') {
    L06.forEach(([o, n], i) => {
      out = replaceExact(out, o, n, hits, `l06-${i}`)
    })
  }
  return { text: out, hits }
}

export const TARGETS = [
  'src/Users.jsx',
  ...Object.keys(LOADER_NAMES),
  'src/core/request.js',
  'src/auth/auth-helper.js',
  'src/test/helpers.js',
  'src/tic-tac-toe/TicTacToe.jsx',
  'lessons/02-ttt-lift-state.md',
  'lessons/03-ttt-winner.md',
  'lessons/06-users-list.md',
].map((p) => C + p)
