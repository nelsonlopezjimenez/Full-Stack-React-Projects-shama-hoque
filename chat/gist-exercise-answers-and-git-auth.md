# Exercise answers in a secret gist; HTTPS vs SSH for Git

**Dates:** 2026-10-03 / 2026-10-04
**Context:** where to keep the answers to the Chapter 3 ladder exercises (`server/lessons/NN-*.md` on the `teach/ch03-server-*` branches), and how to push to GitHub safely.

> **This repo is public** (GitHub, mirrored to the students' Gitea). This note deliberately contains **no gist URL or id**; that link lives only outside the repo.

---

## 1. Why the answers are not in the repo

`main` and every `teach/*` branch are public, and students get them through Gitea. An answer key committed anywhere in the repo, even in `chat/`, is readable by students.

| Where | Who can read it | Synced between machines | History |
|---|---|---|---|
| a folder excluded from tracking (as in the webdev monorepo) | only that machine | no | no |
| **secret gist** (chosen here) | **anyone who has the URL** | yes | yes |
| private repo | only invited accounts | yes | yes |

## 2. What a gist is

A small collection of files on `gist.github.com`. **Every gist is a Git repository**: clone, commit, push, and see the revision history. It holds files only, **no folders**.

| | Public gist | Secret gist |
|---|---|---|
| listed on your profile / in the API list of your gists | yes | **no** |
| found by search | yes | no |
| readable by anyone with the URL | yes | **yes** |

**Secret ≠ private.** There is no access control, only an unguessable URL. Checked on 2026-10-04 with no credentials at all:

| Anonymous access | Result |
|---|---|
| the gist page | HTTP 200 |
| the raw file (`gist.githubusercontent.com/<user>/<id>/raw/<file>`) | HTTP 200, full content |
| `git clone https://gist.github.com/<id>.git` | works |
| the public list of the user's gists (API) | **not listed** |

So: **don't open the gist while projecting**, nor on lab machines (browser history, bookmarks), and never paste the link in a class channel. Anyone who gets the link can forward it.

**Editing** is different: only the owner can change a gist (push, or "Edit" on the page when signed in). Others who are signed in can only comment, star or fork (their own copy).

## 3. How it was set up

1. The gist was created on the web page with **Create secret gist**.
2. It was cloned **outside** the course repo (a sibling folder under `_REPOs/`), so the answers can never be committed to the public repo by accident.
3. Each answer was verified on its own stage branch in a scratch `git worktree` with a throwaway database, then written into the gist's `.md` file.
4. Commit + `git push` over **HTTPS**.

**Cloning over SSH failed at first** with `Host key verification failed`. The SSH key works for `github.com`, but `gist.github.com` was not in `~/.ssh/known_hosts`. Checking with `ssh-keyscan` + `ssh-keygen -lf` showed that `gist.github.com` presents **the same three host keys** as `github.com`; these are GitHub's published fingerprints:

| Type | Fingerprint |
|---|---|
| ED25519 | `SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU` |
| ECDSA | `SHA256:p2QAMXNIC1TJYWeIOttrVc98/R1BUFWu3/LiyKgUfQM` |
| RSA | `SHA256:uNiVztksCsDhcc0u9e8BujQXVUpKZIDTMczCvj3tD2s` |

Trusting them for `gist.github.com` is therefore safe. The decision was to **stay on HTTPS** for the gist.

## 4. "Wasn't HTTPS disabled on GitHub?"

No. Since August 2021 GitHub refuses **passwords** for Git over HTTPS. HTTPS itself still works:

| Over HTTPS | Works? |
|---|---|
| clone/pull a public repo, or a gist you have the URL of | yes, no sign-in |
| push with the account **password** | **no** |
| push with a **token** (Git Credential Manager's browser sign-in, or a personal access token) | yes |

Git for Windows includes **Git Credential Manager** (GCM). The first HTTPS push opens a browser sign-in on github.com, and GCM stores the resulting token in **Windows Credential Manager** (encrypted for the Windows user).

**What happened here:** a GitHub token was already stored from an earlier sign-in, and the push to the gist went through **without any prompt**: GCM reused the `github.com` credential for `gist.github.com`.

**Will future edits need a login?** No, as long as that token is valid. Adding another file or editing the gist is just `git add` / `git commit` / `git push` in the clone. A sign-in is needed again only if the token is revoked or expires, or on another machine. Editing on the web page needs the browser to be signed in to GitHub as the owner.

## 5. Is the browser sign-in riskier than SSH?

Not in a meaningful way. Both are standard; the risk is in different places:

| | HTTPS + browser sign-in | SSH key |
|---|---|---|
| what is stored | a **token** in Windows Credential Manager (encrypted for the user) | a **private key file** in `~/.ssh/` |
| extra protection | the Windows login | a **passphrase**, if one was set (otherwise: none) |
| expires | when revoked (github.com → Settings → Applications) | never, until the key is removed from GitHub |
| main risk | a fake sign-in page (GCM opens the real github.com, so check the address bar) | anyone/any malware that copies the key file can push to every repo; a key **without a passphrase** is usable as is |

Good practice, whichever method is used:

1. **Put a passphrase on SSH keys:** `ssh-keygen -p -f ~/.ssh/<key>`. With `ssh-agent` it is typed once per session.
2. **Review regularly** at github.com → Settings: *SSH and GPG keys*, *Applications* (OAuth / GCM), *Developer settings → Personal access tokens*. Remove what is unused or unknown.
3. **Use one method consistently** where possible, so there are fewer credentials to track. Both can coexist: having an SSH key does not remove a stored HTTPS token, and the other way round.

## 6. To switch the gist to SSH later (optional)

```bash
# 1. trust gist.github.com: compare the fingerprints with the table in §3 first
ssh-keyscan gist.github.com > /tmp/gist.keys && ssh-keygen -lf /tmp/gist.keys
cat /tmp/gist.keys >> ~/.ssh/known_hosts

# 2. point the clone at SSH (inside the gist folder)
git remote set-url origin git@gist.github.com:<gist-id>.git
git push
```
