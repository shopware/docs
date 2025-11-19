---
nav:
  title: Other Installation Options
  position: 1

---

# Other Installation Options

If you haven’t already, see the [Shopware CLI overview](index.md) for a quick start and the most common installation methods (Homebrew, APT, and Docker). This page covers additional or advanced options for other package managers, CI/CD environments, or building from source.

## Package-manager installs

Shopware CLI is available through several community and distribution channels.

<details>

<summary><strong>Fedora, CentOS, openSUSE, RHEL (YUM/DNF)</strong></summary>

```bash
curl -1sLf \
  'https://dl.cloudsmith.io/public/friendsofshopware/stable/setup.rpm.sh' \
  | sudo -E bash
sudo dnf install shopware-cli
```

</details>

<details>
<summary><strong>Arch Linux (AUR)</strong></summary>

```bash
yay -S shopware-cli-bin
```

</details>

<details>
<summary><strong>Nix / NUR packages</strong></summary>

```bash
nix profile install nixpkgs#shopware-cli
# or latest from FriendsOfShopware
nix profile install github:FriendsOfShopware/nur-packages#shopware-cli
```

</details>

<details>
<summary><strong>Devenv (Nix-based)</strong></summary>

Update `devenv.yaml` with:

```yaml
inputs:
  nixpkgs:
    url: github:NixOS/nixpkgs/nixpkgs-unstable
  froshpkgs:
    url: github:FriendsOfShopware/nur-packages
    inputs:
      nixpkgs:
        follows: "nixpkgs"
```

Then reference the input in `devenv.nix`:

```nix
{ pkgs, inputs, ... }: {
  packages = [
    inputs.froshpkgs.packages.${pkgs.system}.shopware-cli
  ];
}
```

</details>

## Manual installation from releases

Download the appropriate .deb, .rpm, or .apk file from the [GitHub Releases page](https://github.com/shopware/shopware-cli/releases) and install it manually:

```bash
sudo dpkg -i shopware-cli_<version>_linux_amd64.deb   # Debian/Ubuntu
sudo rpm -i shopware-cli_<version>_linux_arm64.rpm    # Fedora/RHEL
sudo apk add shopware-cli-<version>.apk               # Alpine
```

Alternatively, download the binary and move it into your `$PATH`:

```bash
curl -L -o shopware-cli https://github.com/shopware/shopware-cli/releases/latest/download/shopware-cli-linux-amd64
chmod +x shopware-cli
sudo mv shopware-cli /usr/local/bin/
```

## CI/CD and development environments

These options let you use the CLI automatically in hosted environments. The [main page](index.md) lists Docker and GitHub Actions, which are popular.

<details> <summary><strong>GitHub Codespaces</strong></summary>

```json
{
    "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
    "features": {
        "ghcr.io/shyim/devcontainers-features/shopware-cli:latest": {}
    }
}
```

</details>

<details> <summary><strong>GitLab CI</strong></summary>

```yaml
build:
  stage: build
  image:
    name: ghcr.io/shopware/shopware-cli:latest
    entrypoint: [ "/bin/sh", "-c" ]
  script:
    - shopware-cli --version
```

</details>

<details> <summary><strong>ddev integration</strong></summary>

Add a file `.ddev/web-build/Dockerfile.shopware-cli`

```Dockerfile
# .ddev/web-build/Dockerfile.shopware-cli
COPY --from=ghcr.io/shopware/shopware-cli:bin /shopware-cli /usr/local/bin/shopware-cli
```

</details>

## Building from source

If you prefer to compile the CLI yourself (requires Go 1.20+ and Git):

```bash
git clone https://github.com/shopware/shopware-cli
cd shopware-cli

go mod tidy

go build -o shopware-cli .

./shopware-cli --version
```
