# verdaccio — the local npm registry on this machine

Verdaccio runs on `http://localhost:4873` and sits between npm and `registry.npmjs.org`. Every package
it fetches for us is kept in its own storage, so the course projects can be installed again later
without internet. Kept out of the course material on purpose: it is a tool for the teacher's machine.

| File | What is in it |
| --- | --- |
| [status.md](status.md) | What is installed where, and the commands to check it is running and healthy |
| [caching-packages.md](caching-packages.md) | How to make packages land in Verdaccio's storage, not only in npm's own cache |
| [config.snapshot.yaml](config.snapshot.yaml) | Copy of the live `config.yaml`, to see what changed and to restore it |
| [log.md](log.md) | Dated notes: changes made, problems seen, what fixed them |

## Quick facts

| | |
| --- | --- |
| Version | Verdaccio `v6.2.1` |
| URL | `http://localhost:4873` (listens on `0.0.0.0:4873`, so other machines on the network can reach it) |
| Config | `%APPDATA%\verdaccio\config.yaml` |
| Storage | `%APPDATA%\verdaccio\storage\` |
| Users file | `%APPDATA%\verdaccio\htpasswd` |
| Uplink | `npmjs` → `https://registry.npmjs.org/`, `cache: true` |
| npm registry | `npm config get registry` → `http://localhost:4873` |
| npm cache | `%LocalAppData%\npm-cache` |

## Updating the config snapshot

After editing the live config, copy it here and add a line to [log.md](log.md):

```powershell
Copy-Item "$env:APPDATA\verdaccio\config.yaml" tools\verdaccio\config.snapshot.yaml
```

The snapshot holds no passwords (users live in `htpasswd`, which is **not** copied here).
