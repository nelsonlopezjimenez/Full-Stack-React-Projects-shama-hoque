# 03 — Arrays basics: self-check

Predict the output **before** you run anything.

1. `[1, 2, 3].push(4)`
2. `['a', 'b', 'c'].pop()`
3. ```js
   const arr = [1, 2, 3];
   arr.shift();
   console.log(arr.length);
   ```
4. `[10, 20, 30].indexOf(40)`
5. `[10, 20, 30].slice(1)` and `[10, 20, 30].slice(-1)`
6. ```js
   const arr = [1, 2, 3, 4];
   const removed = arr.splice(1, 2);
   console.log(removed, arr);
   ```
7. `['x', 'y'].join()` and `['x', 'y'].join(' - ')`
8. ```js
   const a = [1, 2];
   const b = a;
   b.push(3);
   console.log(a);
   ```
9. `[1, 2] === [1, 2]`
10. ```js
    const nums = [1, 2, 3];
    const r = nums.reverse();
    console.log(nums, r === nums);
    ```
11. `typeof []` and `Array.isArray([])`
12. Is this an error? `const list = []; list.push('a');`
13. Sort these into two groups, **changes the array** / **doesn't**:
    `push`, `slice`, `splice`, `concat`, `reverse`, `includes`, `shift`, `join`
14. `slice` or `splice`: which one would you use to get the first 3 items **without** changing
    the array? Write the call.
