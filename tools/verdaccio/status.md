# Verdaccio status

## Snapshot — 2026-10-15

| Check | Result |
| --- | --- |
| `verdaccio --version` | `v6.2.1` |
| `curl http://localhost:4873/-/ping` | `200` (running) |
| `npm config get registry` | `http://localhost:4873` |
| `npm config get cache` | `C:\Users\localepsilon\AppData\Local\npm-cache` |
| Package folders in storage | 3425 (top-level names; a scope like `@babel/` counts once) |
| `.tgz` tarballs in storage | 8775 |
| Config backups next to the live config | `config.yaml.1.bak` (2025-11-03), `config.yaml.2.bak` (May 16), `config.yaml.4.cache` (May 16) |

## Commands to check it

```powershell
# Is it running?
curl.exe -s -o NUL -w "%{http_code}`n" http://localhost:4873/-/ping   # 200 = up

# Which version?
verdaccio --version

# Is npm using it?
npm config get registry          # expect http://localhost:4873
npm ping                         # asks the configured registry

# Does it have a package, and which versions?
npm view react versions --registry http://localhost:4873/

# Is the tarball really stored (not just the metadata)?
Get-ChildItem "$env:APPDATA\verdaccio\storage\react"          # expect package.json + react-x.y.z.tgz files

# How much is stored?
(Get-ChildItem "$env:APPDATA\verdaccio\storage" -Directory).Count
(Get-ChildItem "$env:APPDATA\verdaccio\storage" -Recurse -Filter *.tgz).Count
```

The web UI at http://localhost:4873 lists only packages **published** to Verdaccio. Packages it
proxied from npmjs do not show there; look in the storage folder instead.

## Starting it

```powershell
verdaccio                                           # uses %APPDATA%\verdaccio\config.yaml
verdaccio --config "$env:APPDATA\verdaccio\config.yaml"   # same, explicit
```

## Where the log goes

The config has `log: { type: stdout, format: pretty, level: http }`, so the log is only in the
terminal that started Verdaccio; nothing is written to a file. With `level: http` every request is shown,
for example `GET /react/-/react-18.3.1.tgz` when a tarball is downloaded through it.

To keep the log in a file as well:

```powershell
verdaccio 2>&1 | Tee-Object -FilePath "$env:APPDATA\verdaccio\verdaccio.log" -Append
```
