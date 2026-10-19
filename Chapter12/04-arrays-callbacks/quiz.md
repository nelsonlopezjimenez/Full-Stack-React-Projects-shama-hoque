# 04 — Arrays with callbacks: self-check

Predict the output **before** you run anything.

```js
const nums = [5, 10, 15, 20];
```

1. `nums.map((n) => n / 5)`
2. `nums.filter((n) => n > 10)`
3. `nums.find((n) => n > 100)`
4. `nums.findIndex((n) => n === 15)`
5. `nums.reduce((sum, n) => sum + n, 0)`
6. `nums.map((n) => { n + 1 })`
7. `nums.forEach((n) => n * 2)`
8. `[3, 20, 100].sort()`
9. `nums.some((n) => n % 2 === 1)` and `nums.every((n) => n % 5 === 0)`
10. After `const top = nums.sort((a, b) => b - a);`, what is `nums`? Is `top === nums`?

## React questions

11. What renders?

    ```jsx
    <ul>{['a', 'b'].forEach((x) => <li key={x}>{x}</li>)}</ul>
    ```

12. `items` is an empty array. What shows on the page?

    ```jsx
    <div>{items.length && <ul>...</ul>}</div>
    ```

13. Fill in the blank so only students with `grade >= 70` become `<li>`:

    ```jsx
    {students.______((s) => s.grade >= 70).map((s) => <li key={s.id}>{s.name}</li>)}
    ```

14. Why is `key={s.id}` better than `key={index}` in a list where the user can delete items?
