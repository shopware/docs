---
nav:
  title: Shopware CLI
  position: 40

---

# Shopware CLI

[Shopware CLI](https://github.com/shopware/shopware-cli) is the open-source command-line interface for working with Shopware 6. Install it via [installation](installation/) or our [Docker setup](docker-setup).

Shopware CLI helps you automate and speed up common tasks such as:

* managing and configuring Shopware projects
* building, validating, and packaging extensions
* uploading and maintaining extensions in the Shopware Store
* running CI/CD pipelines for Shopware-based solutions

**Supported platforms:** macOS (Homebrew), Debian/Ubuntu (APT), other Linux via RPM or manual installation, and Docker. Windows users should use WSL 2 or Docker. See our [Hardware Requirements](../guides/hardware-requirements/).

## Quickstart

Select your environment to install or try out the CLI:

<Tabs>

<Tab title="macOS / Linux (Homebrew)">

```bash
brew install --cask shopware/tap/shopware-cli
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

<Tab title="GitHub Actions">

```yaml
- name: Install shopware-cli
  uses: shopware/shopware-cli-action@v1
```

</Tab>

</Tabs>

**Binary & releases:** Prebuilt packages and archives are published at [shopware/shopware-cli · Releases](https://github.com/shopware/shopware-cli/releases).

## Develop

### Create or work on a project

Work directly with your [Shopware project](deployment/) to automate setup and maintenance tasks. Available commands include:

```bash
shopware-cli project create         # Create a new Shopware 6 project
shopware-cli project dump       # Dumps the Shopware database
shopware-cli project admin-watch
```

Useful development helpers:

```bash
shopware-cli project image-proxy  #Image proxy
shopware-cli project console   #Console shortcut
shopware-cli project worker   #Worker processes

### Work on an extension

Create, build, and validate Shopware [extensions](plugins/) and prepare them for the [Store](https://store.shopware.com/de/) or distribution. Available commands include:

```bash
shopware-cli extension fix   # Fix an extension
shopware-cli extension build    # Builds assets for extensions
shopware-cli extension validate         # Validate an extension
```

### Automatic refactoring

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

Always back up or version your code before running refactoring commands, as they will modify files in place. [Learn more here](automatic-refactoring/).

:::tip Preparing for major upgrades
Before upgrading to a new major Shopware version, review the [Upgrades and Migrations guide](/guides/upgrades-and-migrations/) and use `shopware-cli project fix` or `extension fix` to address deprecations early.
:::

## Deploy

Prepare your project for CI or production:

```bash
shopware-cli project ci          # Build Shopware in the CI
```

Package an extension for distribution:

```bash
shopware-cli extension zip
```

Publish and manage your extensions in the [Store](https://store.shopware.com/de/):

```bash
shopware-cli store login # Login to Shopware Store portal.store
shopware-cli extension publish
shopware-cli token: Manage tokens for Store authentication
```

## Run / Operate

Operational helpers:

```bash
shopware-cli project worker
shopware-cli project clear-cache
shopware-cli project admin-api
```

These commands simplify common Symfony console and runtime operations.

## Upgrade / Maintain

Keep your project or extension up to date:

```bash
shopware-cli project fix
shopware-cli extension validate --full
shopware-cli extension format
```

Run any command with `--help` to see its available options.   Example: `shopware-cli extension --help`
