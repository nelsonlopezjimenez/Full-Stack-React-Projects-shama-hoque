# Claude Code — Teaching & Multi-Project Guide

A reference for working with Claude Code across MERN projects and teaching JWT/auth concepts to students.

---

## Part 1 — Teaching JWT, Cookies & Tokens to Students

### Context: Current Auth Flow (Ch05 mern-social)

File: `Chapter05/mern-social/server/controllers/auth.controller.js`

```js
const token = jwt.sign({ _id: user._id }, config.jwtSecret)
res.cookie('t', token, { expire: new Date() + 9999 })  // cookie strategy
return res.json({
  token,                                                 // body strategy (great for teaching!)
  user: { _id: user._id, name: user.name, email: user.email }
})
```

> ✅ Sending the token **both** in the cookie and the response body is ideal for teaching — students can see and compare both strategies.

---

### Strategy A — Environment-Aware Logging (better than plain console.log)

Use a `NODE_ENV` guard so debug output only appears in development. Never ships to production.

```js
// auth.controller.js
const isDev = process.env.NODE_ENV !== 'production'

const signin = async (req, res) => {
  // ...
  const token = jwt.sign({ _id: user._id }, config.jwtSecret)

  if (isDev) {
    console.log('\n--- DEV: JWT issued ---')
    console.log('Token:', token)
    console.log('Paste at https://jwt.io to decode it')
    console.log('-----------------------\n')
  }

  res.cookie('t', token, { maxAge: 9999000, httpOnly: true })
  return res.json({ token, user: { _id: user._id, name: user.name, email: user.email } })
}
```

**Why teach it this way:** Students see the token in the server terminal during dev. The `isDev` guard makes it safe to leave in the codebase — nothing prints in production.

---

### Strategy B — `debug` Package (professional pattern)

```js
import createDebug from 'debug'
const debug = createDebug('app:auth')  // namespaced, off by default

const token = jwt.sign({ _id: user._id }, config.jwtSecret)
debug('JWT issued for %s → %s', user.email, token)
```

**Run with:**
```bash
DEBUG=app:auth npm run dev
```

Students flip one env var to see token output. Nothing shows in production because `DEBUG` is not set. This is how major Node.js libraries (Express, Mongoose) do their own internal logging.

---

### Strategy C — Postman (best for classroom demos)

The token is already in the response body. Students use Postman directly:

**Request:**
```
POST http://localhost:5000/auth/signin
Content-Type: application/json

{
  "email": "student@test.com",
  "password": "testpassword"
}
```

**Response students see:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "_id": "...", "name": "...", "email": "..." }
}
```

**Teaching moments in Postman:**
1. **Cookies tab** → see the `t` cookie set automatically
2. **Headers tab** → see the `Set-Cookie` response header
3. Copy token → paste at **https://jwt.io** → visually decode `_id` and `iat`
4. Save token as a Postman environment variable `{{token}}` for protected routes:

```
GET http://localhost:5000/api/users/{{userId}}
Authorization: Bearer {{token}}
```

---

### Strategy D — curl (CLI / Linux students)

```bash
# Sign in and save cookie to file
curl -s -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"testpassword"}' \
  -c cookies.txt

# Pretty-print the JSON response (requires jq)
curl -s -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"testpassword"}' | jq .

# Extract just the token into a shell variable
TOKEN=$(curl -s -X POST http://localhost:5000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"testpassword"}' | jq -r .token)
echo $TOKEN

# Call a protected route using Bearer token
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/users

# Call a protected route using the saved cookie
curl -b cookies.txt http://localhost:5000/api/users
```

---

### Cookie vs Token Body — Teaching Comparison Table

| Concept              | Cookie `t`                      | `token` in response body          |
|----------------------|---------------------------------|-----------------------------------|
| **Who sends it**     | Browser auto-attaches           | Client must store & send manually |
| **Storage**          | Browser cookie jar              | `localStorage` / React state      |
| **How to send to API** | Automatically (same-origin)   | `Authorization: Bearer <token>` header |
| **Visible in DevTools** | Application → Cookies        | Network → Response body           |
| **CSRF risk**        | Yes (mitigate with `SameSite`)  | No                                |
| **XSS risk**         | Less (use `HttpOnly`)           | Yes if stored in localStorage     |

**Classroom exercise:**
1. Use Postman to call a protected route with the Bearer token
2. Use the browser to call the same route — cookie attaches automatically
3. Decode the token at https://jwt.io and explain `_id` and `iat` fields

---

### Bug Fix: Cookie Options in auth.controller.js

```js
// ❌ Current (buggy) — wrong key name, string concatenation for date
res.cookie('t', token, { expire: new Date() + 9999 })

// ✅ Fixed — use `expires` with a proper Date, or `maxAge` in milliseconds
res.cookie('t', token, { expires: new Date(Date.now() + 9999000) })

// ✅ Better — maxAge is cleaner, add httpOnly for XSS protection
res.cookie('t', token, { maxAge: 9999000, httpOnly: true })
```

---

## Part 2 — Claude Code Memory Across Multiple Projects

### How Memory Is Scoped

Claude Code memory is **project-scoped** — each repo gets its own isolated memory bucket:

```
C:\Users\usergolden26\.claude\projects\
  c--...-Full-Stack-React-Projects-shama-hoque\memory\   ← this project
  c--...-uCertify-repo\                                  ← separate bucket
  c--...-MtGDB\                                          ← separate bucket
```

When you open Claude Code in a project, only **that project's memory** loads automatically. Other projects' memories are invisible unless explicitly brought in.

The same scoping applies to **`CLAUDE.md`** — it only loads for sessions rooted in that directory.

---

### Cross-Project Strategy 1 — Primer Memory (recommended)

In **each project**, write a memory that describes the other project and its key patterns. It auto-loads every session in that project.

**How to set it up:** Open Claude Code in the other project and say:
> "Remember that this simpler MERN project is related to the Full-Stack-React-Projects-shama-hoque repo, which has the advanced version. Key shared patterns are: [list them]."

Claude writes a memory file to that project's bucket — the link is established permanently for all future sessions there.

---

### Cross-Project Strategy 2 — Direct File Read

Claude can read files **anywhere on your filesystem**, not just the current project. In any session, say:

> "Read the memory files from my other MERN project at
> `C:\Users\usergolden26\.claude\projects\c--Users-usergolden26-Documents--REPOs-Full-Stack-React-Projects-shama-hoque\memory\`
> and use them as context for this session."

Claude reads those files and carries that knowledge forward for the duration of the session.

---

### Cross-Project Strategy 3 — Shared Patterns Document

Create one markdown file **outside both repos** as a living reference:

```
C:\Users\usergolden26\Documents\MERN-PATTERNS.md
```

- Both projects' memories point to this file
- Useful as a student-facing "patterns cheatsheet"
- Tell Claude: "Update MERN-PATTERNS.md with what we just learned" to keep it current

---

### Recommended Setup for Simpler ↔ Advanced MERN Projects

Since the two projects represent a pedagogical progression (simpler → advanced):

| In the **simpler** project memory | In the **advanced** project memory (this repo) |
|---|---|
| "Advanced version at `[path]`. Adds cookie + body dual strategy, `requireSignin` middleware, `hasAuthorization`, social features." | "Simpler version at `[path]`. Same JWT/cookie pattern without social features. Good teaching reference for basics before Ch05." |

---

### Quick Reference: What Persists Across Sessions

| What                    | Same project folder | Different project folder |
|-------------------------|---------------------|--------------------------|
| Conversation history    | ❌ new session      | ❌ new session           |
| Memory (`MEMORY.md`)    | ✅ auto-loads       | ❌ separate bucket       |
| `CLAUDE.md` instructions | ✅ auto-loads      | ❌ loads its own         |
| Git context             | ✅ same repo        | ❌ different repo        |
| Filesystem access       | ✅ full access      | ✅ full access (cross-read with explicit path) |
