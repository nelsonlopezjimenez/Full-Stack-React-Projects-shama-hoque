# Verdaccio log

Newest first. One entry per change, problem or finding.

## 2026-10-15

- Started this folder. Copied the live `config.yaml` to `config.snapshot.yaml`.
- Checked status: v6.2.1 running on port 4873, npm registry points at it, 3425 package folders and
  8775 tarballs in storage (details in [status.md](status.md)).
- Question: how to make new packages land in Verdaccio's storage and not only in npm's cache. Answer:
  the config is already right (`cache: true`, `proxy: npmjs`); npm's own cache is what skips Verdaccio.
  Install with an empty `--cache` folder, or run `npm cache clean --force`. Full steps in
  [caching-packages.md](caching-packages.md).
