# Git: push syntax, upstream tracking, and the settings used on every machine

**Date:** 2026-10-03
**Related:** [vscode-declutter-and-autocomplete.md](vscode-declutter-and-autocomplete.md) (editor settings), [git-local-exclude.md](git-local-exclude.md) (per-clone ignore rules), [gist-exercise-answers-and-git-auth.md](gist-exercise-answers-and-git-auth.md) (HTTPS vs SSH, credential security)

---

## 1. Settings to apply on every machine (once)

```bash
git config --global push.autoSetupRemote true   # needs Git 2.37+ (this machine: 2.53)
git config --global push.default simple         # the default since Git 2.0; set it explicitly anyway
```

They are stored in the user's global config (`C:\Users\<user>\.gitconfig` on Windows), not in the repository, so **every machine needs them once**. Check them with:

```bash
git config --global --get push.autoSetupRemote   # → true
git config --global --get push.default           # → simple
```

| Setting | Effect |
|---|---|
| `push.default simple` | a plain `git push` pushes only the **current** branch, to the remote branch **with the same name** (old Git versions pushed every matching branch) |
| `push.autoSetupRemote true` | the first plain `git push` of a new branch creates the remote branch **and** links the local branch to it, so `-u` is never needed |

Applied on this machine on 2026-10-03.

## 2. Upstream ("tracking") is a per-branch setting

A local branch is linked to a remote branch only when one of these happened:

| How the branch was made | Upstream set? |
|---|---|
| `git clone` (the default branch only) | yes |
| `git switch foo` when only `origin/foo` exists | yes |
| `git push -u origin foo` | yes |
| a plain `git push` with `push.autoSetupRemote true` | yes |
| `git switch -c foo`, then `git push origin foo` | **no**, even though `origin/foo` exists |
| a branch renamed locally (e.g. `master` → `main`) | the old link does not carry over |

What you get from the link: `git status` shows **ahead / behind**, and plain `git pull` / `git push` and VS Code's Sync button know where to go. An explicit `git push origin <branch>` works the same with or without it.

State on this machine on 2026-10-03:

- `main` had **no** upstream, probably lost in a `master` → `main` rename (Git still has a `vscode-merge-base` entry for `origin/master`). It was linked with `git branch --set-upstream-to=origin/main main`, and `git status` immediately showed `[ahead 1]` for an unpushed commit.
- Still without upstream: `refactor/separate-client-server` (it exists on GitHub) and `refactor/ch03-simple-auth` (local only).
- All `teach/ch03-server-*` branches and `refactor/ch03-migration` were already linked.

To see the links: `git branch -vv`.
To link an existing branch: `git branch --set-upstream-to=origin/<branch> <branch>`.

## 3. Push syntax: what to use when

`git push origin <branch>` (explicit) is **always correct** and is the safest form for scripts and for pushing a branch you are not on.

| Situation | Command |
|---|---|
| push the current, linked branch | `git push` |
| push a branch you are not on, or in a script | `git push origin <branch>` |
| first push of a new branch (without autoSetupRemote) | `git push -u origin <branch>` |
| push several branches (e.g. ladder stages) | `git push origin <branch1> <branch2> …` |
| after a rebase or `--amend` (history rewritten) | `git push --force-with-lease origin <branch>` |
| delete a remote branch | `git push origin --delete <branch>` |

Avoid:

- **`--force`**: it overwrites the remote even if someone else pushed in the meantime. `--force-with-lease` refuses when the remote moved since your last fetch. This is important when rebasing the stacked `teach/*` branches.
- **`git push --all`**: it publishes every local branch, including experiments.
- **`git push origin :branch`**: the old deletion syntax, easy to type by accident; `--delete` says what it does.

### For students

Teach `git push -u origin <branch>` on the first push and plain `git push` afterwards. It is the most common convention and works without any global settings. Explain `-u` once, as "remember where this branch goes".

## 4. SSH key passphrase and the SSH agent

Added 2026-10-04.

### Why a passphrase

The passphrase **encrypts the private key file** in `~/.ssh/`. Without one, a copy of that file (malware, a stolen laptop, a backup, an accidentally shared folder) is enough to push to every repository the key can reach, and the key never expires. With one, the copy is useless unless the attacker also guesses the passphrase.

Which key GitHub uses is set in `~/.ssh/config` (`Host github.com` → `IdentityFile …`). It is not necessarily `id_ed25519`.

### The agent: typing the passphrase rarely

| Setup | When the passphrase is asked |
|---|---|
| passphrase, **no agent** | on **every** SSH use: each `git push`, `pull`, `fetch`, `clone` |
| passphrase + **agent** | **once, when the key is added** (`ssh-add`). The agent keeps the unlocked key in memory and answers for it; Git no longer asks |

The agent forgets the key when it stops, when the key is removed (`ssh-add -d <key>`), or when a time limit given at `ssh-add -t 8h` runs out.

### Which agent, and how long a "session" lasts

On Windows there are **two** SSH installations:

| | Git for Windows' SSH | Windows' built-in OpenSSH |
|---|---|---|
| program | `/usr/bin/ssh` (inside Git Bash). **Git uses this one by default** | `C:\Windows\System32\OpenSSH\ssh.exe` |
| agent | started by hand: `eval "$(ssh-agent -s)"` then `ssh-add ~/.ssh/<key>` | the Windows **service** `ssh-agent` (often *Disabled* by default) |
| key stays unlocked | while that agent runs, usually **until that Git Bash window closes**. Other windows and VS Code do not see it. (GitHub's docs give a `~/.bashrc` snippet that shares one agent until log-off.) | across **all** terminals, VS Code, and **restarts**: Windows stores the added key encrypted for the user account |
| passphrase typed | once per window (or per login with the snippet) | **once**, until the key is removed |

### Passphrase length

The passphrase must resist **offline guessing**: whoever has the file can try guesses as fast as their hardware allows.

| Kind | Example | Strength |
|---|---|---|
| **4–6 random words** (recommended) | `copper-lantern-drift-mosaic-quiet` | strong, easy to type and remember |
| 15+ random characters | `t7#Kq2!vLx9@pRw4` | strong, awkward to type |
| a word plus a year | `Raspberry2026!` | weak: in every guessing list |

Pick the words **at random** (dice, or a password manager's generator), not a favourite phrase. Use it for this key only, and keep a copy in a password manager. With an agent it is typed rarely, so a long passphrase costs almost nothing.

**Optional:** `-a 100` makes every guess slower (key-derivation rounds; the default is 16). Unlocking then takes about a second.

### How passphrases are actually guessed

**Not like in the movies.** A guess is tested by trying to decrypt the key file, and the answer is all or nothing: right (the key decrypts) or wrong. A guess with 9 of 10 correct characters looks exactly like a completely wrong one, so there is no "first letter found, next letter…".

(Partial information leaks only from badly built systems, e.g. a comparison that answers faster when the first characters match. That is why the ladder's `authenticate()` uses `crypto.timingSafeEqual` instead of `===`.)

What attackers do, roughly in this order:

| Step | Method | What it tries | What it catches |
|---|---|---|---|
| 1 | leaked-password lists | billions of real passwords from past breaches, most common first | `123456`, `iloveyou`, `Password1` |
| 2 | lists + rules | each word with typical changes: capital first letter, a year or number at the end, `!`, `a→@`, `o→0` | `Raspberry2026!`, `M0ng0db!` |
| 3 | masks | human patterns, e.g. capital + 6 lowercase + 4 digits + symbol | most "complex" passwords made up by people |
| 4 | personal information | names, pets, city, birthdays, school, project names | anything about the owner |
| 5 | brute force (`a`, `b`, … `zz`, …) | **every** combination | only **short** ones: the work grows enormously with each extra character |

**How long it takes**, assuming an attacker tests **10,000 guesses per second** against the key file. That is an illustrative rate; the real one depends on hardware and on the `-a` rounds. Figures computed with Node on 2026-10-04:

| Passphrase | Possibilities | Strength | Try them all | On average (half) |
|---|---|---|---|---|
| word + capital + year + `!` (~100k words × 2 × 100 years × 5 symbols) | 1.0 × 10⁸ | 27 bits | **2.8 hours** | 1.4 hours |
| 8 random lowercase letters (26⁸) | 2.1 × 10¹¹ | 38 bits | 242 days | 121 days |
| 10 random lowercase letters (26¹⁰) | 1.4 × 10¹⁴ | 47 bits | ~450 years | ~220 years |
| **5 random words**, 7,776-word list (7,776⁵) | 2.8 × 10¹⁹ | 65 bits | ~90 million years | ~45 million years |
| **6 random words** (7,776⁶) | 2.2 × 10²³ | 78 bits | ~700 billion years | ~350 billion years |
| 15 random printable characters (95¹⁵) | 4.6 × 10²⁹ | 99 bits | ~1.5 × 10¹⁸ years | ~7 × 10¹⁷ years |

- **Bits:** each extra bit doubles the work. One random word from a 7,776-word list adds ~12.9 bits (×7,776).
- **Random beats clever:** a human "clever" change (capital, year, `!`) adds almost nothing, because step 2 already tries it.
- **Length beats complexity:** five ordinary random words beat a short password full of symbols.
- **`-a 100`** (100 rounds instead of 16) cuts the attacker's rate about 6×, so every time in the table gets about 6× longer. It helps a medium passphrase, but it doesn't rescue a weak one: 2.8 hours becomes ~17 hours.

### Doing it in steps

Each step works on its own:

1. **Add the passphrase** (to an existing key, without changing the key itself):
   ```bash
   ssh-keygen -p -a 100 -f ~/.ssh/<github-key>
   ```
   Until step 2 or 3, each push asks for it.
2. **Git Bash agent**, on days with many pushes:
   ```bash
   eval "$(ssh-agent -s)"
   ssh-add ~/.ssh/<github-key>        # passphrase once for this window
   ```
3. **Windows agent service**, when comfortable (once per machine):
   ```powershell
   # ADMIN PowerShell
   Get-Service ssh-agent | Set-Service -StartupType Automatic
   Start-Service ssh-agent
   ```
   ```bash
   /c/Windows/System32/OpenSSH/ssh-add.exe ~/.ssh/<github-key>      # passphrase once
   git config --global core.sshCommand "C:/Windows/System32/OpenSSH/ssh.exe"
   /c/Windows/System32/OpenSSH/ssh.exe -T git@github.com             # "Hi <user>!" without a prompt
   ```
   `core.sshCommand` makes Git use Windows' ssh, the one that talks to the service. To undo it: `git config --global --unset core.sshCommand`.

**Trade-off:** while a key is in an agent, programs running under your account can *use* it (not copy it out). That is the same level as the HTTPS token stored by Git Credential Manager. The passphrase still makes a **copied key file** worthless.
