---
nav:
  title: Shopware CLI
  position: 40

---

# Shopware CLI

[Shopware CLI](https://github.com/shopware/shopware-cli) is the open-source command-line interface for working with Shopware 6. It's a standalone developer tool that you [install](installation.md) and configure separately from your Shopware instance. Once set up, it helps you automate and speed up common tasks such as:

- managing and configuring Shopware projects  
- building, validating, and packaging extensions  
- uploading and maintaining extensions in the Shopware Store  
- running CI/CD pipelines for Shopware-based solutions

Shopware CLI runs on macOS, Linux, and via Docker. For system-level requirements (PHP, DB, memory, etc.) see the [General Requirements](../guides/requirements.md).

**Supported platforms (short):** macOS (Homebrew), Debian/Ubuntu (APT), other Linux via RPM or manual installation, and Docker. Windows users should use WSL 2 or Docker. (See full [installation](installation.md) page for Windows details.)

## Quickstart

Select your environment to install or try out the CLI:

<Tabs groupId="os">

<TabItem value="macOS" label="macOS / Linux (Homebrew)">

```bash
brew install --cask shopware/tap/shopware-cli
```

</TabItem> 

<TabItem value="debian" label="Debian / Ubuntu (APT)">

```bash
curl -1sLf \
  'https://dl.cloudsmith.io/public/friendsofshopware/stable/setup.deb.sh' \
  | sudo -E bash
sudo apt install shopware-cli
```

</TabItem> 

<TabItem value="dockerfile" label="Dockerfile">

Add the following line to your Docker image to copy the binary into your image:

```bash
# Dockerfile
COPY --from=ghcr.io/shopware/shopware-cli:bin /shopware-cli /usr/local/bin/shopware-cli
```

</TabItem>

<TabItem value="GitHub" label="GitHub Actions">

```yaml
- name: Install shopware-cli
  uses: shopware/shopware-cli-action@v1
```

</TabItem>

</Tabs>

**Binary & releases:** Prebuilt packages and archives are published at [shopware/shopware-cli · Releases](https://github.com/shopware/shopware-cli/releases).

## Overview

Shopware CLI is organized into three main command scopes that cover the most common development and maintenance workflows:

- Project commands: interact with your Shopware project (e.g., build, dump DB, or sync configuration)
- Extension commands: build and validate Shopware extensions
- Store commands: publish or update extensions in the Shopware Store

## Automatic refactoring

Shopware CLI also includes an automatic refactoring tool for PHP, JavaScript, and Admin Twig files. It uses:

- [Rector](https://getrector.org/) for PHP  
- [ESLint](https://eslint.org/) for JavaScript  
- Custom rules for Admin Twig

You can run it on an extension or a full project:

```bash
# Example: refactor an extension
shopware-cli extension fix /path/to/your/extension

# Example: refactor an entire project
shopware-cli project fix /path/to/your/project
```

Always back up or version your code before running refactoring commands, as they will modify files in place. [Learn more here](automatic-refactoring.md).

### Project commands

Work directly with your [Shopware project](deployment.md) to automate setup and maintenance tasks. Available commands include:

```bash
shopware-cli project create         # Create a new Shopware 6 project
shopware-cli project dump       # Dumps the Shopware database
shopware-cli project ci          # Build Shopware in the CI
```

### Extension commands

Create, build, and validate Shopware [extensions](plugins.md) and prepare them for the [Store](https://store.shopware.com/de/) or distribution. Available commands include:

```bash
shopware-cli extension fix   # Fix an extension
shopware-cli extension build    # Builds assets for extensions
shopware-cli extension validate         # Validate an extension
```

### Store commands

Publish and manage your extensions in the [Store](https://store.shopware.com/de/), with commands such as:

```bash
shopware-cli store login # Login to Shopware Store portal. store
shopware-cli token: Manage tokens for Store authentication
```

Run any command with `--help` to see its available options.   Example: `shopware-cli extension --help`
