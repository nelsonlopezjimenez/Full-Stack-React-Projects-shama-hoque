# Docker — Classroom Setup Guide

Extracted from the `with-node13.12` branch (commits 9b1c322, 30d3a6e, 9e9c5d4)
before that branch was deleted. The Dockerfile and docker-compose.yml in those
commits targeted Node 13 / webpack and are obsolete — **do not reuse them**.
A new Dockerfile for the current Vite + Node 20+ stack still needs to be written.

---

## Status of Docker support

| Item | Status |
|---|---|
| Classroom image export / load workflow | ✅ documented below |
| WSL2 Docker Engine install | ✅ documented below |
| `Dockerfile` for current Vite/Node 20+ stack | ⬜ not yet written |
| `docker-compose.yml` for current stack | ⬜ not yet written |

---

## Classroom image transfer workflow

### 1 — Build and tag the image (instructor machine)

Once a working `Dockerfile` exists for the current stack:

```bash
docker compose build
docker tag mern-social-mern-social:latest mern-social-mern-social:latest
```

### 2 — Export the image bundle (instructor)

Include both the app image and MongoDB so students need nothing extra:

```bash
docker save mern-social-mern-social:latest mongo:8.0 | gzip > mern-social-complete.tar.gz
ls -lh mern-social-complete.tar.gz   # check file size before distributing
```

### 3 — Create a standalone compose file for students

```bash
cat > mern-social-student.yml << 'EOF'
services:
  mern-social:
    image: mern-social-mern-social:latest
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
      - PORT=3003
      - JWT_SECRET=your_secret_key
      - MONGODB_URI=mongodb://mongo:27017/mernproject
    depends_on:
      - mongo

  mongo:
    image: mongo:8.0
    ports:
      - "27017:27017"
    volumes:
      - mern-social-data:/data/db

volumes:
  mern-social-data:
EOF
```

### 4 — Distribute (choose one)

- **USB drive** — simplest for classroom, no network needed
- **Shared network folder** — fast on campus LAN
- **Gitea LFS** — works if Gitea is already running on the network

### 5 — Load and run on student machines

```bash
docker load < mern-social-complete.tar.gz
docker compose -f mern-social-student.yml up
```

App runs at `http://localhost:3003`.

---

## Install Docker Engine on WSL2 Ubuntu (no Docker Desktop)

Run these steps once per machine inside WSL2:

```bash
# 1 — remove old versions
sudo apt remove docker docker-engine docker.io containerd runc

# 2 — install dependencies
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release

# 3 — add Docker's official GPG key and repo
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list

# 4 — install Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# 5 — run without sudo
sudo usermod -aG docker $USER
newgrp docker

# 6 — start Docker
sudo service docker start

# 7 — verify
docker --version
docker compose version

# optional: auto-start Docker on every WSL2 login
echo 'sudo service docker start > /dev/null 2>&1' >> ~/.bashrc
```

---

## Notes for writing the new Dockerfile (TODO)

The old `Dockerfile` from `with-node13.12` used:
```dockerfile
FROM node:13.12-alpine
RUN npm run build
CMD ["node", "./dist/server.generated.js"]   # webpack SSR output — no longer exists
```

The current stack requires a multi-stage build:
- **Stage 1** — build the Vite client (`npm run build` in `client/`, outputs to `dist/client/`)
- **Stage 2** — run the Express server (`node server.js` in `server/`)
- The server serves the built client from `../dist/client` in production mode

The `docker-compose.yml` should use `mongo:8.0` as a service
(not `172.18.0.1:27017` which hardcodes the WSL2 bridge IP and breaks on different machines).
