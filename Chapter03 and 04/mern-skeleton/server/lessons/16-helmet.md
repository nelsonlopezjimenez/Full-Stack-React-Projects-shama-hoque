# Stage 16 — Security headers (helmet) and other standard middleware

**Branch:** `teach/ch03-server-16-helmet`

## Goal

Every answer carries the HTTP headers that tell browsers to be careful. Also added: compression and
form bodies.

## Before: what the server tells the world

Send request 31 on stage 15 and read the response headers:

```
X-Powered-By: Express
```

That one line tells an attacker which framework to look up vulnerabilities for, and no header asks the
browser for any protection.

## New ideas

- **`helmet()`** is one middleware that sets about a dozen security headers:

| Header | What it tells the browser |
|---|---|
| `Content-Security-Policy` | which sources scripts, styles, images may come from (limits XSS) |
| `Strict-Transport-Security` | "only talk to me over HTTPS from now on" |
| `X-Content-Type-Options: nosniff` | do not guess file types (a "picture" cannot run as a script) |
| `X-Frame-Options: SAMEORIGIN` | other sites may not show this one in a frame (clickjacking) |
| `Referrer-Policy: no-referrer` | do not leak our URLs to other sites |
| (removed) `X-Powered-By` | stop advertising Express |

  For a JSON API most of these matter little. They matter a lot once the same server sends the React
  app (stage 18), and adding helmet costs one line.
- **`compression()`** gzips big answers when the client sends `Accept-Encoding: gzip`. A long user
  list becomes several times smaller.
- **`express.urlencoded()`** reads bodies from classic HTML forms (`name=Ann&email=...`).

**Middleware order matters.** These all run for every request, top to bottom, before the routes.

## Try it

1. `npm install` (helmet, compression).
2. Request 31: compare the headers with the table above.
3. Request 32: a form-style body works too.

## Exercise

`helmet()` takes options. Turn off one header, e.g. `helmet({ referrerPolicy: false })`, and check
request 31. When might you need to relax the Content-Security-Policy? (Hint: a page that loads a
script from a CDN.)
