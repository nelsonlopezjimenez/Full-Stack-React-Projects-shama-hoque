# Ladder replay: change every stage of a ladder at once

Instructor tooling, not course material. `replay.mjs` rewrites a range of stacked ladder commits so that
a change appears in **every stage from the one where the code first shows up**, without a `git rebase`.

Why not a rebase? When the same lines change again in later stages (they usually do), every later commit
conflicts and has to be resolved by hand. The replay never conflicts: it takes each commit's *tree*,
edits the listed files with text rules, and writes a new commit with the same message, author, committer
and dates on top of the previous new commit. Commits whose files do not change keep their exact hash.

## Use

```bash
# 1. dry run: which rule hit which commit; the changed files land in tools/ladder-replay/out/ for review
node tools/ladder-replay/replay.mjs . teach/ch03-server-19-tests teach/ch03-client-20-tests tools/ladder-replay/<transforms>.mjs

# 2. create the new commits (no branch moves yet); old → new commit ids go to mapping.json
node tools/ladder-replay/replay.mjs . teach/ch03-server-19-tests teach/ch03-client-20-tests tools/ladder-replay/<transforms>.mjs --write
```

3. Check the new commits (build every stage, `npm test`, `node tools/ladder-e2e/run.mjs`; the e2e runner
   reads local branches, so move them first and keep tags as the undo).
4. Move each branch: tag the old tip (`git tag backup/<name>/<stage> <old>`), then
   `git update-ref refs/heads/<branch> <new> <old>`.
5. Force-push the changed branches (`git push --force-with-lease origin <branches…>`), then sync Gitea
   from the bridge machine.

## A transforms file

Exports `transform(path, text)`, which returns `{ text, hits }` (`hits` = names of the rules that matched),
and `TARGETS`, the list of repository paths to look at. The text arrives with LF line endings; files
stored with CRLF are converted back. Rules are exact string replacements that must match at most once
(`replaceExact` throws otherwise), so a rule that silently misses is visible in the dry-run report.

| File | Date | What |
|---|---|---|
| `transforms-2026-10-16-async-await.mjs` | 2026-10-16 | Ch03 client ladder: `.then` → `async`/`await` (explained once in stage 06), `request.js` JSON fallback with `try`/`catch`, `replaceAll`, Tic-Tac-Toe with template literals, `const` + ternary and `for…of`; lessons 02, 03 and 06 follow. Log: the 2026-10-16 entry in `chat/ch03-client-ladder-log.md` on the client branches. |
| `transforms-2026-10-16-server-syntax.mjs` | 2026-10-16 | Ch03 server ladder, rows S1, S2, S5: template literal for the default `mongoUri`, comments on `\|\|` vs `??` for environment variables, `events.once` in the API test. Run from `a28fe85` to `teach/ch03-client-20-tests` (the client stages sit on server stage 19). Log: `chat/ch03-teaching-ladder-log.md` on server stage 19. |

A change to a **server** stage gives every later server stage and all client stages new hashes (their files
stay the same). Replay the whole range in one run, or add a log commit on server stage 19 afterwards and
move the client stack with `git rebase --update-refs --onto teach/ch03-server-19-tests <old server-19> teach/ch03-client-20-tests`
(no conflicts as long as no client commit touches that log).
