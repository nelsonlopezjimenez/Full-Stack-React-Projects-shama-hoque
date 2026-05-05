**On CISGOLDEN26 (working machine):**

```bash
# Create a folder for the packages
mkdir ~/docker-debs
cd ~/docker-debs

# Download all required .deb packages without installing
sudo apt-get install --download-only -y \
  docker-ce \
  docker-ce-cli \
  containerd.io \
  docker-buildx-plugin \
  docker-compose-plugin

# Copy downloaded debs to our folder
cp /var/cache/apt/archives/docker*.deb ~/docker-debs/
cp /var/cache/apt/archives/containerd*.deb ~/docker-debs/

# Verify
ls -lh ~/docker-debs/

# Copy to Windows accessible location
cp ~/docker-debs/* /mnt/c/Users/usergolden26/Desktop/docker-debs/
```

---

**Transfer:** Copy `docker-debs` folder to USB or shared drive, paste to target machine's Windows Desktop.

---

**On target machine (cis0768), from WSL2:**

```bash
# Access the copied files
cd /mnt/c/Users/localepsilon/Desktop/docker-debs/

# Install all at once
sudo dpkg -i *.deb

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Start Docker
sudo service docker start

# Verify
docker --version
docker compose version
```

---

**If `dpkg` complains about missing dependencies:**
```bash
sudo apt-get install -f
```

That fixes dependency issues using local packages only.