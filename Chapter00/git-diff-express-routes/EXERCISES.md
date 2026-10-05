# Exercises: Reddit-style routes and git diff

Keep working in the `reddit-routes` project from the [lesson](README.md).
Every exercise has two parts: **write the route**, then **read the diff** before you commit.

The routine for each exercise:

1. Write the code and test it in the browser.
2. Run `git diff` and answer the diff questions.
3. Run `git add app.js`, then `git diff --staged`. Check it is what you want in the commit.
4. Commit with a clear message, for example `git commit -m "feat: add /u/:username route"`.

Put every new route **above** the 404 handler. (Why? Hint: the lesson, Part 7.)

---

## Exercise 1. User profiles

```text
Visiting "/u/alice"      should print  "Welcome to u/alice's profile"
Visiting "/u/bob_dev"    should print  "Welcome to u/bob_dev's profile"
```

Diff questions:

- How many lines start with `+`? Do any lines start with `-`?
- Copy the hunk header (`@@ ... @@`). What do its four numbers mean?
- Run `git diff --stat`. Does it agree with your count?

---

## Exercise 2. Votes

```text
Visiting "/r/cats/vote/up"         should print  "You upvoted r/cats"
Visiting "/r/cats/vote/down"       should print  "You downvoted r/cats"
Visiting "/r/cats/vote/sideways"   should print  "Unknown vote "sideways". Use up or down."
                                   with status 400
```

Hint: keep the messages in an object, like `{ up: 'You upvoted', down: 'You downvoted' }`, and look up `req.params.direction` in it.
Do not write an `if` for every direction.

Diff questions:

- Your diff probably has two parts: the object and the route. Are they one hunk or two? Why?
  (Git joins changes that are close together into one hunk.)
- Open DevTools, Network tab, and visit `/r/cats/vote/sideways`. Which status code do you see?

Bonus: what does your route print for `/r/cats/vote/toString`? If it prints something strange, fix it.
(Hint: `Object.hasOwn(obj, key)`.)

---

## Exercise 3. Hot posts (a number in the URL)

```text
Visiting "/r/cats/hot/3"     should print  a heading "Hot in r/cats" and a list:
                                           1. Hot post 1 in r/cats
                                           2. Hot post 2 in r/cats
                                           3. Hot post 3 in r/cats
Visiting "/r/node/hot/5"     should print  the same, with 5 posts about r/node
Visiting "/r/cats/hot/abc"   should print  "count must be a whole number from 1 to 25"
                                           with status 400
```

Remember: `req.params.count` is a **string**. Convert it with `Number(...)` and check it with `Number.isInteger(...)`.

Diff questions:

- Before you commit, change only the limit from 25 to 50 and run `git diff --word-diff`. What does it show?
- Put it back with `git restore app.js`. Careful: this also removes everything else you have not staged.
  Stage your finished route first, or ask yourself what `git restore` will throw away.

---

## Exercise 4. The classic assignment

The original version of this assignment, with animals. Same skills, no Reddit.

```text
Visiting "/"                  should print  "Hi there, welcome to my assignment!"
================================================================
Visiting "/speak/pig"         should print  "The pig says 'Oink'"
Visiting "/speak/cow"         should print  "The cow says 'Moo'"
Visiting "/speak/dog"         should print  "The dog says 'Woof Woof!'"
================================================================
Visiting "/repeat/hello/3"    should print  "hello hello hello"
Visiting "/repeat/hello/5"    should print  "hello hello hello hello hello"
Visiting "/repeat/blah/2"     should print  "blah blah"

If a user visits any other route, print:
"Sorry, page not found...What are you doing with your life?"
```

Changing `/` and the 404 message **changes** existing lines. Your diff will show `-` and `+` pairs.

Diff questions:

- Make Exercise 4 a **single** commit. Then run `git show HEAD --stat` and `git show HEAD`. How many hunks does the commit have?
- Should `/speak/Cow` (capital C) work? Decide, implement it, and find that change in `git diff`.

---

## Exercise 5. Reading history

After Exercises 1 to 4 are committed:

1. `git log --oneline`. Write down the hash of the 404 commit from the lesson.
2. `git diff <that-hash> HEAD --stat`. How many lines were added since then?
3. `git diff HEAD~1 HEAD -- app.js`. Which exercise does it show?
4. `git diff HEAD HEAD~1 -- app.js`. Same commits, swapped. What happened to the `+` and `-` signs?
5. `git log -p -2`. What does `-2` do?

---

## Exercise 6. Prove the `.gitignore` works

1. Run `git ls-files`. Is anything inside `node_modules/` in the list? It should not be.
2. Delete the folder (`rm -rf node_modules`), then run `npm run dev`. What error do you get?
3. Run `npm install` and start the server again. Why did that work without `node_modules/` being in Git?
4. Comment out `node_modules/` in `.gitignore` (put a `#` in front) and run `git status --short`. What appears?
   Put the line back. **Do not commit** in between.
