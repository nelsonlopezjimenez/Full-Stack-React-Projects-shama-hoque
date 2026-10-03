# VS Code: autocomplete fixes and GitLens decluttering

Notes from a chat on 2026-10-02. All settings go in the user `settings.json`
(`Ctrl+Shift+P` → **Preferences: Open User Settings (JSON)**), located at
`%APPDATA%\Code\User\settings.json`.

Git settings to apply on every machine (push behaviour, upstream tracking) are in
[git-config-and-push.md](git-config-and-push.md).

---

## 1. Autocomplete "eats" the dot (current pain point)

### What is actually happening

When you type `.`, VS Code is usually **not** autocorrecting because it was too
fast. The suggestion list was already open with an item highlighted, and `.` is a
**commit character** in JavaScript/TypeScript. Typing a commit character
*accepts* the highlighted suggestion and then inserts the `.`.

Example: you type `res` intending `res.json()`. The list highlights `resolve`. You
press `.` and get `resolve.` instead of `res.`.

So increasing the delay helps only a little. The real fix is to stop `.` (and
other commit characters such as `(` and `;`) from accepting suggestions.

### Recommended settings

```jsonc
{
  // MAIN FIX: typing . ( ; etc. no longer accepts the highlighted suggestion.
  // Accept only with Tab (or Enter, see below).
  "editor.acceptSuggestionOnCommitCharacter": false,

  // Delay before the suggestion list pops up while typing (default 10 ms).
  // 300-500 ms lets you type short words like `res.` before the list appears.
  "editor.quickSuggestionsDelay": 400,

  // Enter accepts only when the suggestion actually changes the text,
  // so Enter at the end of a line still makes a new line.
  // Use "off" to accept with Tab only.
  "editor.acceptSuggestionOnEnter": "smart",

  // Pre-select the suggestion you used most recently instead of the first item.
  "editor.suggestSelection": "recentlyUsedByPrefix",

  // Prefer real code completions over random words from the file.
  "editor.wordBasedSuggestions": "matchingDocuments",
  "editor.snippetSuggestions": "bottom"
}
```

Try these in order and stop when it feels right:

1. `acceptSuggestionOnCommitCharacter: false`. This alone usually fixes it.
2. Raise `quickSuggestionsDelay` if the popup still feels too eager.
3. `acceptSuggestionOnEnter: "off"` if Enter also surprises you.

You can also switch automatic suggestions off for comments and strings and
leave them on only in code:

```jsonc
"editor.quickSuggestions": { "other": "on", "comments": "off", "strings": "off" }
```

When suggestions are off, `Ctrl+Space` still opens the list on demand.

### Scope it to one language only (optional)

```jsonc
"[javascript]": { "editor.acceptSuggestionOnCommitCharacter": false },
"[javascriptreact]": { "editor.acceptSuggestionOnCommitCharacter": false }
```

---

## 2. GitLens declutter (if/when installed)

GitLens is **not installed** on this machine as of 2026-10-02. To install it, use
the Extensions panel and search for "GitLens", or run:

```powershell
& "C:\Program Files\Microsoft VS Code\bin\code.cmd" --install-extension eamodio.gitlens
```

Use the full path. Plain `code` on PATH resolves to `Code.exe`, which rejects
CLI flags.

GitLens is noisy out of the box. Keep the useful parts (Search & Compare, File
History, hovers) and turn off the always-on decorations:

```jsonc
{
  // Inline blame text at the end of the current line: the biggest distraction
  "gitlens.currentLine.enabled": false,

  // "N authors | X months ago" lines above every function
  "gitlens.codeLens.enabled": false,

  // Blame in the status bar: keep it if you like a quiet hint, otherwise off
  "gitlens.statusBar.enabled": false,

  // Keep the hovers: blame/details appear only when you hover a line
  "gitlens.hovers.enabled": true,
  "gitlens.hovers.currentLine.over": "line",

  // Fewer promos / welcome pages
  "gitlens.showWelcomeOnInstall": false,
  "gitlens.showWhatsNewAfterUpgrades": false,
  "gitlens.plusFeatures.enabled": false
}
```

If you want blame on demand, run **GitLens: Toggle File Blame** (or click the
blame icon in the editor title bar). It shows the full blame gutter only while
you need it.

You can also hide GitLens views you don't use: right-click the GitLens /
GitLens Inspect activity bar icons → hide individual views (e.g. Launchpad,
Cloud Patches, Home).

### The GitLens features worth keeping for this repo

- **Search & Compare** → compare `teach/ch03-server-02` with
  `teach/ch03-server-03` to review one ladder step as a file tree.
- **File History** → step through every version of `server.js` across the ladder.
- **Interactive rebase editor** → visual `git rebase -i` for fixing up the
  stacked branches.

---

## 3. General editor declutter (optional)

```jsonc
{
  "editor.minimap.enabled": false,
  "editor.inlayHints.enabled": "offUnlessPressed", // hold Ctrl+Alt to show
  "editor.stickyScroll.enabled": false,
  "breadcrumbs.enabled": true,
  "workbench.editor.enablePreview": false
}
```

These are personal preferences, not fixes. Turn on only the ones that bother you.

### Teaching note

For student-facing material, don't depend on any of these settings or on
GitLens. Show the built-in diff and
`git diff teach/ch03-server-02..teach/ch03-server-03 --stat` so the
instructions work on a bare VS Code install (including Gitea lab machines).
