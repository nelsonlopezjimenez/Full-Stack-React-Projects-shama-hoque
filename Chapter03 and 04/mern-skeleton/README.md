# MERN Skeleton — built step by step

The skeleton app from chapters 3 (backend) and 4 (frontend) of *Full-Stack React Projects*,
rebuilt **from an empty folder**, one idea at a time.

Every stage is a git branch that starts from the stage before it:

```bash
git switch teach/ch03-server-01-hello      # check out a stage and run it
git diff teach/ch03-server-01-hello teach/ch03-server-02-memory-users -- server   # one lesson
```

Each stage explains itself in `server/lessons/NN-name.md` or `client/lessons/NN-name.md`.

| Series | Branches | Plan |
|---|---|---|
| Server (Express + MongoDB) | `teach/ch03-server-01-hello` … `teach/ch03-server-19-tests` | [`chat/ch03-teaching-ladder-checklist.md`](../../chat/ch03-teaching-ladder-checklist.md) |
| Client (React), on top of the finished server | `teach/ch03-client-01-hello` … | [`chat/ch03-client-ladder-checklist.md`](../../chat/ch03-client-ladder-checklist.md) |

To run a client stage, start the server first (`cd server && npm run dev`), then the client
(`cd client && npm run dev`) in a second terminal.

The book's original code (Node 8, Express 4, React 16, webpack 4) is still on `main` until the ladder
is finished, and always in the history:

```bash
git show main:"Chapter03 and 04/mern-skeleton/server/server.js"
```
