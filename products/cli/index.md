---
nav:
  title: Shopware CLI
  position: 10

---

# Shopware CLI

[Shopware CLI](https://github.com/shopware/shopware-cli) is the open-source command-line interface for working with Shopware 6. It's a standalone developer tool that you install and configure separately from your Shopware instance. Once set up, it helps you automate and speed up common tasks such as:

- managing and configuring Shopware projects
- building, validating, and packaging extensions
- uploading and maintaining extensions in the Shopware Store
- running CI/CD pipelines for Shopware-based solutions

Shopware CLI runs on macOS, Linux, and via Docker. For system-level requirements (PHP, DB, memory, etc.) see the [General Requirements](../../guides/installation/system-requirements.md). Windows users should use WSL 2 or Docker. (See full [installation](/products/cli/installation.md) page for Windows details.)

## Quickstart

Select your environment to install or try out the CLI:

<Tabs>

<Tab title="macOS / Linux (Homebrew)">

```bash
brew install --cask shopware/tap/shopware-cli
```

</Tab>

<Tab title="GitHub Actions">

```yaml
- name: Install shopware-cli
  uses: shopware/shopware-cli-action@v1
```

</Tab>

<Tab title="Debian / Ubuntu (APT)">

```bash
curl -1sLf \
  'https://dl.cloudsmith.io/public/friendsofshopware/stable/setup.deb.sh' \
  | sudo -E bash
sudo apt install shopware-cli
```

</Tab>

<Tab title="Dockerfile">

Add the following line to your Docker image to copy the binary into your image:

```bash
# Dockerfile
COPY --from=ghcr.io/shopware/shopware-cli:bin /shopware-cli /usr/local/bin/shopware-cli
```

</Tab>

</Tabs>

**Binary & releases:** Prebuilt packages and archives are published at [shopware/shopware-cli · Releases](https://github.com/shopware/shopware-cli/releases).
