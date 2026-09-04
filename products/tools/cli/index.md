---
nav:
  title: Shopware CLI
  position: 10

---

# Shopware CLI

[Shopware CLI](https://github.com/shopware/shopware-cli) is the open-source command-line interface for working with Shopware 6. It's a standalone developer tool that you install and configure separately from your Shopware instance. Once set up, it helps you automate and speed up common tasks such as:

- managing and configuring Shopware projects
- starting and operating an integrated Docker-based development environment
- building, validating, and packaging extensions
- uploading and maintaining extensions in the Shopware Store
- running CI/CD pipelines for Shopware-based solutions

**CI/CD workflow:** Shopware CLI builds and prepares your deployment artifact. Then, the [Deployment Helper](../../../guides/hosting/installation-updates/deployments/deployment-helper/index.md) handles the deploy phase: installing Shopware, managing extensions, and running migrations on the target environment.

For GitHub Actions, GitLab CI, and Docker examples, see [CI/CD and development environments](installation.md#cicd-and-development-environments).

Shopware CLI runs on macOS, Linux, and via Docker. For workstation hardware requirements, see the [System Requirements](../../../guides/installation/system-requirements.md). For PHP and stack requirements — including **`memory_limit ≥ 512M`** — see the [recommended stack](../../../guides/hosting/index.md#recommended-stack-and-supported-versions). Windows users should use WSL 2 or Docker. (See [Installation Options](installation.md) page for Windows details.)

## Verifier tooling requirements

The Shopware CLI binary itself does not require PHP or Node.js for every command. When you run verifier tooling directly on the host — such as `extension validate --full`, `project validate`, `extension fix`, `project fix`, or the format commands — provide:

- **PHP 8.2.0** or newer
- **Node.js 20.0.0** or newer
- **Composer** when the CLI prepares PHP verifier dependencies or resolves project/extension dependencies
- **npm** when the CLI prepares its JavaScript verifier dependencies

Basic `extension validate` uses the built-in `sw-cli` checks and does not require a local PHP or Node.js runtime. The [Docker images](installation.md#docker-image) include the verifier runtime dependencies and are recommended for consistent validation, refactoring, and formatting environments.

When you use the Docker-based development environment, run Composer and PHP tools inside the web container rather than on the host. See [Running Composer, PHP, and npm](../../../guides/development/dev-environment.md#running-composer-php-and-npm).

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
  uses: shopware/shopware-cli-action@v3
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

## Telemetry

Shopware CLI collects limited usage telemetry to help us improve the tool and understand which features are most valuable to you. No personal data, credentials, or file contents are collected. You can opt out anytime by setting the `DO_NOT_TRACK` environment variable.

See [Telemetry & Privacy](../../../resources/references/telemetry.md#shopware-cli) for full details about what data is collected and how to disable telemetry.
