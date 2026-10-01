# Stage 07 — One job per file

**Branch:** `teach/ch03-server-07-split` (six commits, one per step below)

## Goal

The server does exactly the same as in stage 06: same routes, same answers, same `api.http`.
Only the **organization** of the code changes. One file becomes this:

```
server.js            connect to MongoDB, then start listening
express.js           build the app: middleware + routes
config/config.js     every setting (port, database address) in one place
models/              what the data looks like (the schema)
controllers/         what each route does (the handler functions)
routes/              which URL + method calls which handler
```

Follow the commits one at a time:

```bash
git log --oneline teach/ch03-server-06-update..teach/ch03-server-07-split
git show <commit>          # one step
```

## Why not keep everything in one file?

`server.js` from stage 06 works. The problems start when it grows:

1. **Finding things.** A bug in the email rule is in the model, and a wrong status code is in a controller.
   The file name tells you where to look. In one 150-line file (or a 2000-line one, a few chapters
   later) you scroll and search.
2. **One reason to change.** Each file changes for one kind of reason: the schema when the data
   changes, a route file when a URL changes. Small, focused files give small, focused diffs, and
   two people working on different features rarely edit the same file. That means fewer merge conflicts.
3. **Reuse.** A function in its own file can be imported anywhere. In step **f** the "find the user
   or answer 404" code, copied three times so far, becomes one function. Later stages reuse
   `requireSignin` and the error handler the same way.
4. **Testing.** In step **e** the app is built in `express.js` and started in `server.js`. A test can
   import the app without opening a port or connecting to a database. Stage 19 relies on this.
5. **Settings are not code.** The port and the database address change between computers. Kept in
   `.env`, they change without touching code, and passwords never end up in git.

**The cost:** more files, and `import` lines between them. A 20-line script does not need any of this.
The structure pays off once an app has several routes, several people, or tests. All three are
coming in this course.

This layout (model, controller, routes) is close to **MVC** (Model–View–Controller). There is no
View here because the server only answers JSON; the React client will be the view.

---

## a) Settings → `config/config.js` and `.env`

- `config/config.js` reads `PORT` and `MONGODB_URI` from **environment variables**, with defaults.
- `.env` holds your values. It is git-ignored, so copy `.env.example` → `.env` and adjust it.
- `npm run dev` now starts `node --env-file-if-exists=.env`, which loads `.env` if it exists.
- `server.js` imports `config` and uses `config.port` and `config.mongoUri`.

Try: set `PORT=3001` in `.env`, restart, and change `@baseUrl` in `api.http`. Then set it back.

## b) The schema → `models/user.model.js`

- The schema and `mongoose.model('User', ...)` move to their own file, which ends with `export default`.
- `server.js` gets the model with `import User from './models/user.model.js'`. Every route keeps
  using `User` exactly as before.
- **One job:** this file answers "what does a user look like, and what rules apply?" Stages 09 and 14
  (passwords) change only this file and the auth code.

## c) The handlers → `controllers/user.controller.js`

- Each route's function gets a name (`create`, `list`, `read`, `update`, `remove`) and moves to the
  controller. `server.js` keeps only one line per route:
  `app.get('/api/users/:userId', userCtrl.read)`.
- We pass `userCtrl.read`, the function itself, **without** `()`. Express calls it for each request.
- Look at `read`, `update` and `remove`: all three still start with the same four lines. Now that they
  sit next to each other, the copy is easy to see. Step f removes it.

## d) The URLs → `routes/user.routes.js`

- `express.Router()` creates a mini-app that holds only routes. `server.js` plugs it in with
  `app.use('/', userRoutes)`.
- `router.route('/api/users/:userId').get(...).patch(...).delete(...)` writes the path **once** and
  lists the methods under it. The file reads like the REST table from stage 06.
- **One job:** "which URL and method runs which function". Stages 10 and 11 add security checks
  here, between the URL and the handler.
