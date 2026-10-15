# Getting packages into Verdaccio's storage

Question: how do I make new packages go into the Verdaccio database, instead of (or as well as) the
npm cache?

## Why packages can skip Verdaccio

Verdaccio already saves everything it proxies. But it can only save a tarball that is **downloaded
through it**. npm looks in its own cache first (`%LocalAppData%\npm-cache`). If the tarball is already
there with the right integrity hash, npm never asks Verdaccio for it, so Verdaccio never stores it.
So it is npm's own cache that keeps packages away from Verdaccio, not Verdaccio itself.

## 1. Verdaccio must cache what it proxies

In `%APPDATA%\verdaccio\config.yaml` (already set like this, see [config.snapshot.yaml](config.snapshot.yaml)):

```yaml
storage: ./storage          # where packages are saved

uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    cache: true             # must not be false, or tarballs are not saved
    maxage: 2m              # how long metadata is trusted before asking npmjs again

packages:
  '@*/*':
    access: $all
    publish: $authenticated
    proxy: npmjs
  '**':
    access: $all
    publish: $authenticated
    proxy: npmjs            # without this, Verdaccio cannot fetch from npmjs at all
```

Restart Verdaccio after editing.

## 2. npm must point at Verdaccio

```powershell
npm config set registry http://localhost:4873/
npm config get registry      # check it
```

For one project only, put `registry=http://localhost:4873/` in that project's `.npmrc` instead.

## 3. Get past npm's own cache

Pick one:

```powershell
# a) A throwaway cache for this install: every tarball must come through Verdaccio
npm install --cache "$env:TEMP\npm-empty-cache"

# b) Or empty npm's cache entirely
npm cache clean --force
npm install

# c) Re-fill Verdaccio for an existing project from its lock file
Remove-Item -Recurse -Force node_modules
npm ci --cache "$env:TEMP\npm-empty-cache" --registry http://localhost:4873/
```

`--prefer-online` alone is **not** enough. It only re-checks package metadata, and tarballs still come
from npm's cache when the hash matches.

## 4. Check the lock file URLs

npm 7 and later swap the `resolved` URLs from `registry.npmjs.org` to the configured registry by
themselves (`replace-registry-host=npmjs` is the default). Yarn, pnpm and older npm do not: regenerate
the lock file against Verdaccio, or find-and-replace the `resolved` URLs.

## 5. Both places at once

Nothing extra is needed. Whenever npm downloads a tarball from Verdaccio, it also writes it to its own
cache. Once a package went through Verdaccio (step 3), it is in both.

## Pre-loading single packages

```powershell
npm pack react@18.3.1 --registry http://localhost:4873/ --cache "$env:TEMP\npm-empty-cache"
```

This makes Verdaccio fetch and store the tarball. Delete the `.tgz` that `npm pack` leaves in the
current folder.

## Checking it worked

- `%APPDATA%\verdaccio\storage\<package>\` has `package.json` (metadata) **and** `.tgz` files. Only
  `package.json` means the tarballs came from npm's cache.
- The Verdaccio terminal shows `GET /<pkg>/-/<pkg>-x.y.z.tgz` lines during the install.
- The web UI lists only published packages, not proxied ones.

## Our own packages

```powershell
npm publish --registry http://localhost:4873/
```

They live only in Verdaccio's storage and are never sent to npmjs.
