# Course guide

[`README.md`](README.md) is the book's original README, from its author and publisher. This page is
the course's own starting point: where the instructions are and how the lesson stages work.

## Instructions

Read these on the `main` branch. They are not there while a lesson stage is checked out.

| Page | Read it when |
|---|---|
| [Working with the lesson stages](instructions/working-with-the-lesson-stages.md) | first: fork, clone, `upstream`, switching stages, diffs, your own `my/…` branches |
| [A new Vite + React project from the command line](instructions/new-vite-react-project-from-the-command-line.md) | you build a client yourself: `npm init`, `npm pkg set`, installing Vite and React |
| [Reading error messages](instructions/reading-error-messages.md) | something fails and the terminal is full of red text |

## The lesson stages

Each stage is a branch that adds one idea to the stage before it.

| Ladder | Branches | Where the lesson notes are |
|---|---|---|
| React's Tic-Tac-Toe tutorial | `teach/ch00-ttt-01-setup` … `teach/ch00-ttt-15-tests` | `Chapter00/tic-tac-toe/lessons/` |
| Chapter 3 server | `teach/ch03-server-01-hello` … `teach/ch03-server-19-tests` | `Chapter03 and 04/mern-skeleton/server/lessons/` |
| Chapter 4 client | `teach/ch03-client-01-hello` … `teach/ch03-client-20-tests` | `Chapter03 and 04/mern-skeleton/client/lessons/` |

To list them all after `git fetch upstream`:

```bash
git branch -r --list "upstream/teach/*"
```

## The chapters on `main`

| Folder | What is in it |
|---|---|
| `Chapter00/` | warm-ups: Express routes with `git diff`, and the Tic-Tac-Toe project |
| `Chapter02/mern-simplesetup/` | the smallest MERN app: an Express server and a Vite client |
| `Chapter03 and 04/mern-skeleton/` | users, sign-in and authorization: the finished version of the Chapter 3 and 4 ladders |
| `Chapter05/mern-social/` | the social media app, updated to current React, MUI, Express and Mongoose |
| `Chapter06 and 07/` … `Chapter11/` | the book's later chapters, mostly as published; not part of the lessons yet |
