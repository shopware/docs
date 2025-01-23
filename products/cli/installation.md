---
nav:
  title: Installation
  position: 1

---

# Installation

You can install the pre-compiled binary (in several different ways), use Docker or compile from the source.

Below you can find the steps for each of them.

## Install the pre-compiled binary

### Homebrew

```bash
brew install shopware/tap/shopware-cli
```

### Debian/Ubuntu — APT based Linux

```bash
curl -1sLf \
  'https://dl.cloudsmith.io/public/friendsofshopware/stable/setup.deb.sh' \
  | sudo -E bash
sudo apt install shopware-cli
```

### Fedora/CentOS/SUSE/RedHat — YUM based Linux

```bash
curl -1sLf \
  'https://dl.cloudsmith.io/public/friendsofshopware/stable/setup.rpm.sh' \
  | sudo -E bash
sudo dnf install shopware-cli
```

### Archlinux User Repository (AUR)

```bash
yay -S shopware-cli-bin
```

### Manually: deb,rpm apt packages

Download the `.deb`, `.rpm` or `.apk` packages from the [releases](https://github.com/FriendsOfShopware/shopware-cli/releases/) page and install them with the appropriate tools.

### Nix

Install **Nix** package from here:

```shell
nix profile install nixpkgs#shopware-cli
```

or directly from the **FriendsOfShopware** repository (more up to date)

```shell
nix profile install github:FriendsOfShopware/nur-packages#shopware-cli
```

### Devenv

Update `devenv.yaml` with a new input:

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

Then you can use the new input in the `devenv.nix` file. Don't forget to add the `inputs` argument, to the first line.

```nix
{ pkgs, inputs, ... }: {
  packages = [
    inputs.froshpkgs.packages.${pkgs.system}.shopware-cli
  ];
}
```

### GitHub Codespaces

```json
{
    "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
    "features": {
        "ghcr.io/shyim/devcontainers-features/shopware-cli:latest": {}
    }
}
```

### GitHub Action

Using Shopware CLI Action :

```yaml
- name: Install shopware-cli
  uses: shopware/shopware-cli-action@v1
```

### Gitlab CI

```yaml
build:
  stage: build
  image:
    name: shopware/shopware-cli:latest
    entrypoint: [ "/bin/sh", "-c" ]
  script:
    - shopware-cli --version
```

### ddev

Add a file `.ddev/web-build/Dockerfile.shopware-cli`

```Dockerfile
# .ddev/web-build/Dockerfile.shopware-cli
COPY --from=shopware/shopware-cli:bin /shopware-cli /usr/local/bin/shopware-cli
```

### Docker Image

Add the following line to your docker image to copy the binary into your image.

```Dockerfile
# Dockerfile
COPY --from=shopware/shopware-cli:bin /shopware-cli /usr/local/bin/shopware-cli
```

## Manually

Download the pre-compiled binaries from the [releases](https://github.com/FriendsOfShopware/shopware-cli/releases/) page and copy them to the desired location.

## Running with Docker

You can also use it within a Docker container. To do that, you will need to execute something more or less like the examples below.

Registries:

- [shopware/shopware-cli](https://hub.docker.com/r/shopware/shopware-cli)

Example usage:

Builds assets of an extension

```bash
docker run \
    --rm \
    -v $(pwd):$(pwd) \
    -w $(pwd) \
    -u $(id -u) \
    shopware/shopware-cli \
    extension build FroshPlatformAdminer
```

## Compiling from source

If you just want to build from source for whatever reason, follow these steps:

### Clone

```bash
git clone https://github.com/FriendsOfShopware/shopware-cli
cd shopware-cli
```

### Get the dependencies

```bash
go mod tidy
```

### Build

```bash
go build -o shopware-cli .
```

### Verify

```bash
./shopware-cli --version
```
