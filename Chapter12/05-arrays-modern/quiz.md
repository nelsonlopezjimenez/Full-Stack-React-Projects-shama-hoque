# 05 — Modern array methods: self-check

Predict the output **before** you run anything.

1. `Array.from({ length: 4 }, (_, i) => i * 2)`
2. `Array.from({ length: 2 })`
3. `Array.from('hey', (ch) => ch + ch)`
4. `Array.from(new Set([1, 2, 2, 3, 3, 3]))`
5. ```js
   const rows = Array(2).fill([]);
   rows[0].push('x');
   console.log(rows);
   ```
6. `[10, 20, 30].at(-1)` and `[10, 20, 30].at(3)`
7. ```js
   const a = [3, 1, 2];
   const b = a.toSorted();
   console.log(a, b, a === b);
   ```
8. `['a', 'b', 'c'].with(0, 'z')`
9. `[[1, 2], [3]].flatMap((x) => x)` versus `[[1, 2], [3]].map((x) => x)`
10. Which of these change the original array: `sort`, `toSorted`, `splice`, `toSpliced`, `with`, `reverse`?

## React questions

11. What does this render?

    ```jsx
    <ul>{Array.from({ length: 3 }, (_, i) => <li key={i}>Row {i + 1}</li>)}</ul>
    ```

12. A component gets a `names` prop and does `const sorted = names.sort();`.
    What is the bug, and what's the one-word fix?

13. Why is `key={i}` acceptable for the stars in a `<StarRating>` but risky in a
    to-do list where items can be deleted?

14. Write the expression that gives the page numbers `[1, 2, 3, 4, 5]`
    for 47 items shown 10 per page.
