# 01 — Strings: `padId` in pseudocode

**Task:** `padId(id, width)` turns `id` into a string at least `width`
characters long by adding `'0'` characters on the left.

```text
padId(7, 4)      →  "0007"
padId(12345, 4)  →  "12345"   (already longer than width, so it is unchanged)
```

This solution doesn't use `String.prototype.padStart` (that's `padIdv1`). It
does the work by hand in two parts:

1. **Count the digits** of `id` with a `while` loop and division by 10.
2. **Pad** with our own `PadStart`. It uses the **length of the string** made
   from `id`.

The count and the string length are two ways to get the same number.
Comparing them is a good check that you understand both.

---

## [BEGINNER] Plain-English steps

### The idea

Think of a mileage counter that always shows 4 boxes. If the number is `7`,
the boxes show `0 0 0 7`. Before we can do that, we need to know:

- how many boxes the number already fills (its **length**)
- how many empty boxes are left (`width − length`) for zeros

### Steps

```text
PAD ID (id, width)

  1. Keep a copy of id, because step 3 changes id.
  2. If id is 0, stop and give back nothing.
  3. Count the digits:
        count starts at 0
        while id is bigger than 0:
            chop the last digit off id     (divide by 10, drop the decimals)
            add 1 to count
  4. Turn the saved copy into text, for example 7 becomes "7".
  5. Work out how many zeros are needed:
        zerosNeeded = width − (length of the text)
  6. If the text is already longer than width:
        give back the text unchanged
     Otherwise:
        make a string of zerosNeeded zeros
        give back zeros + text
```

### Why keep a copy? (step 1)

The counting loop divides `id` by 10 until it reaches `0`. When the loop
ends, `id` is gone because it's now `0`. If we padded `id` at that point we'd
get `"0000"`, not `"0007"`. The copy (`cloneId` in the code) keeps the
original number.

### Trace: `padId(7, 4)`

| Step | id | count | text | zerosNeeded | result |
|---|---|---|---|---|---|
| start | 7 | 0 | | | |
| loop pass 1 | 0 | 1 | | | |
| loop ends (0 is not > 0) | 0 | 1 | | | |
| turn copy into text | | | `"7"` | | |
| work out zeros | | | `"7"` | 4 − 1 = **3** | |
| join | | | | | `"000" + "7"` = **`"0007"`** |

### Trace: `padId(12345, 4)`

| Loop pass | id after `÷ 10` | count |
|---|---|---|
| start | 12345 | 0 |
| 1 | 1234 | 1 |
| 2 | 123 | 2 |
| 3 | 12 | 3 |
| 4 | 1 | 4 |
| 5 | 0 | 5 |

Text is `"12345"` and its length is 5. Since `5 > 4`, the text comes back
unchanged: **`"12345"`**.

Notice that `count` (5) equals the length of the text (5). The two methods
agree.

---

## [ADVANCED] Formal pseudocode, no built-ins

Rules for this section:

- `DIV` is whole-number division: `7 DIV 10 = 0`, `12345 DIV 10 = 1234`.
- Strings are built with `+` (concatenation) and read with `s[i]` (one
  character).
- The only conversion used is `ToText(n)`, which turns a number into a string.
  `Length(s)` is the number of characters in `s`.
- No `padStart`, `repeat`, or `slice`. Each of those becomes a loop below.

### Algorithm CountDigits

```text
Algorithm CountDigits(n)
    Input:  a positive whole number n
    Output: how many digits n has

    count ← 0
    While n > 0 Do
        n     ← n DIV 10        // removes the last digit
        count ← count + 1
    End While
    Return count
End Algorithm
```

**Loop invariant:** after *k* passes, `count = k` and `n` is the original
number with its last *k* digits removed. The loop stops when no digits are
left, so `count` is the number of digits.

### Algorithm RepeatText (does the job of `padString.repeat`)

```text
Algorithm RepeatText(piece, times)
    Input:  a string piece, a whole number times ≥ 0
    Output: piece joined to itself `times` times

    result ← ""
    i ← 0
    While i < times Do
        result ← result + piece
        i ← i + 1
    End While
    Return result
End Algorithm
```

### Algorithm TakeFirst (does the job of `.slice(0, k)`)

```text
Algorithm TakeFirst(s, k)
    Input:  a string s, a whole number k ≥ 0
    Output: the first k characters of s (or all of s if it is shorter)

    result ← ""
    i ← 0
    While i < k AND i < Length(s) Do
        result ← result + s[i]
        i ← i + 1
    End While
    Return result
End Algorithm
```

### Algorithm PadStart (the inner function)

```text
Algorithm PadStart(str, width, padString)
    Input:  a value str, a target width, a padding string padString
    Output: str padded on the left with padString up to `width` characters

    str ← ToText(str)
    If padString is empty Then
        padString ← " "                       // same default as the built-in
    End If

    newCount ← width − Length(str)            // how many pad characters we need

    If Length(str) > width Then
        Return str                            // already long enough
    End If

    // Build at least newCount pad characters, then cut to exactly newCount.
    // Works for multi-character pads too, e.g. padString = "ab".
    If width > Length(str) Then
        copies    ← (newCount DIV Length(padString)) + 1
        padString ← RepeatText(padString, copies)
    End If

    Return TakeFirst(padString, newCount) + str
End Algorithm
```

### Algorithm PadId (the exported function)

```text
Algorithm PadId(id, width)
    Input:  a whole number id, a target width
    Output: id as text, zero-padded on the left to `width`

    cloneId ← id                              // CountDigits destroys id
    If id = 0 Then
        Return nothing
    End If

    count ← CountDigits(id)                   // method 1: arithmetic
    // ToText(cloneId) inside PadStart gives method 2: Length of the text.
    // For any positive whole number: count = Length(ToText(cloneId))

    Return PadStart(cloneId, width, "0")
End Algorithm
```

### How the pseudocode maps to the JavaScript

| Pseudocode | `exercises.js` |
|---|---|
| `n DIV 10` | `Math.floor(id / 10)` |
| `ToText(x)` | `String(x)` |
| `Length(s)` | `str.length` |
| `RepeatText(p, k)` | `padString.repeat(k)` |
| `TakeFirst(s, k)` | `padString.slice(0, k)` |
| `A + B` (strings) | `A + B` / template literal |

### Cost (Big-O)

Let *d* be the number of digits in `id` and *w* be `width`.

- `CountDigits`: one pass per digit, **O(d)**.
- `ToText`: **O(d)**.
- `RepeatText` + `TakeFirst`: about *w* − *d* pad characters, **O(w)**.
- Total: **O(d + w)**. For IDs this is tiny, but it's the same order as the
  built-in `padStart`.

### Edge cases to talk about

| Input | What this solution does | What `padIdv1` (built-in) does |
|---|---|---|
| `padId(0, 4)` | returns `undefined` (the `id = 0` guard) | `"0000"` |
| `padId(-5, 4)` | loop never runs (`-5 > 0` is false), `count = 0`; pads `"-5"` → `"00-5"` | `"00-5"` |
| `padId(7, 1)` | `newCount = 0`, returns `"7"` | `"7"` |
| `padId(12, 2)` | `Length = width`, so `newCount = 0`, returns `"12"` | `"12"` |

Discussion questions:

1. `CountDigits` (from the earlier version of this file) returned **1** for
   `n = 0`, but `PadId` returns nothing for `0`. Which is more correct for an
   ID? What would you change so `padId(0, 4)` gives `"0000"`?
2. `count` is worked out but `PadStart` uses `Length(str)`. When would those
   two numbers **not** match? (Hint: negative numbers, decimals like `7.5`.)
3. Inside the `else`, the check `width > Length(str)` is always true except
   when they are equal. What happens if you remove it?
