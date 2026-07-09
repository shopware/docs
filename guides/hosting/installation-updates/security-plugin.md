---
nav:
  title: Security Plugin
  position: 25

---

# Security Plugin

The [Shopware 6 Security Plugin](https://store.shopware.com/en/swag136939272659f/shopware-6-security-plugin.html) (`SwagPlatformSecurity`) backports security fixes to existing Shopware installations. It allows you to close known security vulnerabilities with a simple plugin update, without upgrading Shopware itself. The plugin is free and maintained by Shopware.

The plugin does not replace regular Shopware updates. It is meant to bridge the time until you can perform a proper update or to keep installations secure that cannot be updated immediately. Security issues in third-party dependencies such as Symfony or Twig are not covered by the plugin and still require a dependency or Shopware update — see [Third-party dependencies](#third-party-dependencies).

## Compatibility

The following table shows which plugin version covers each major Shopware version.

| Plugin version | Shopware versions | Maintained |
|----------------|-------------------|------------|
| 4.x            | 6.7.x             | ✔️         |
| 3.x            | 6.6.x             | ✔️         |
| 2.x            | 6.5.x             | ✔️         |
| 1.x            | 6.4.x             | ❌          |

Within a plugin version, every fix declares the Shopware version range it applies to. A fix is only loaded when your Shopware version is affected: if your version already contains the official patch or is older than the first affected version, the fix stays inactive automatically. Installing the plugin on a fully patched installation is therefore safe. It simply does nothing until a new vulnerability is published.

## Installation

### Through the Administration

Install and activate the extension named "Shopware 6 Security Plugin" through the Extension Store in the Administration. This is the easiest way for single-server setups.

### Through Composer

For deployments built through CI or running on multiple application servers, install the plugin as a Composer dependency through the [Shopware Composer Registry](extension-management.md), so all nodes receive the same code:

```bash
composer require store.shopware.com/swagplatformsecurity
bin/console plugin:refresh
bin/console plugin:install --activate SwagPlatformSecurity
bin/console cache:clear
```

After installing a plugin update, clear the cache again so newly added fixes are loaded.

::: warning
Installing or updating the plugin does **not** update Shopware's Composer dependencies. If `composer.lock` still pins an outdated version of Shopware or a bundled library such as Symfony or Twig, the installation stays vulnerable even with the plugin active. See the [Composer lock file and dependency updates](https://getcomposer.org/doc/01-basic-usage.md#updating-dependencies-to-their-latest-versions) documentation for how Composer handles locked dependency versions.

After installing or updating the plugin, check for and apply dependency updates in the environment where your project is built, then deploy:

```bash
composer audit
composer update <package-name> --with-all-dependencies
bin/console cache:clear
```

Update only the packages the audit reports rather than running a blanket `composer update`. See [Third-party dependencies](#third-party-dependencies).
:::

## How fixes work

Every fix in the plugin corresponds to a published security advisory and is identified by its GHSA id — the [GitHub Security Advisory](https://docs.github.com/en/code-security/security-advisories) identifier under which the vulnerability is published, for example [`GHSA-9v5m-39wh-5chq`](https://github.com/shopware/shopware/security/advisories/GHSA-9v5m-39wh-5chq). You can browse all published Shopware advisories on the [Shopware security advisories page](https://github.com/shopware/shopware/security/advisories). All applicable fixes are active by default once the plugin is activated.

In some cases, a vulnerability cannot be fixed safely or completely through the security plugin for every affected Shopware version. If an update is required instead, this will be stated in the corresponding advisory. The security plugin is an additional protection mechanism and does not replace keeping Shopware updated.

You can review and manage the fixes under *Settings > Extensions > Security Plugin* in the Administration. For each fix, the page shows a short description and a link to the official advisory with the technical details and severity.

Individual fixes can be deactivated, for example, when a fix conflicts with a customization. Deactivating a fix requires confirming with your administrator password because it reopens the corresponding vulnerability. Treat deactivation as a temporary measure only.

In a cluster setup, the fix configuration is stored in the database and therefore applies to all application servers. After changing it, the container cache is rebuilt — make sure all nodes refresh their cache.

## Composer audit integration

Tools like [`composer audit`](https://getcomposer.org/doc/03-cli.md#audit) report every advisory that affects your installed Shopware version — including the ones the Security Plugin already mitigates. To avoid these false alarms, you can exclude advisories that are covered by an active fix in your project's `composer.json` using the [advisories policy](https://getcomposer.org/doc/06-config.md#ignore-id):

```json
{
    "config": {
        "policy": {
            "advisories": {
                "ignore-id": {
                    "GHSA-9v5m-39wh-5chq": "Mitigated by an active fix in the Security Plugin.",
                    "GHSA-xvhc-gm7j-mhmc": "Mitigated by an active fix in the Security Plugin."
                }
            }
        }
    }
}
```

The *Settings > Extensions > Security Plugin* page checks your `composer.json` for you:

- If all advisories covered by active fixes are excluded, the page confirms the configuration is complete.
- If entries are missing, the page lists them and offers to add them to `composer.json` with one click.
- If an advisory is excluded although the corresponding fix is deactivated, the page warns you: in that state, the vulnerability is open but your audit tooling is silent about it. Remove the entry or activate the fix.

Only exclude an advisory while the corresponding fix is active. Never exclude advisories the plugin does not cover.

::: warning
The one-click button writes to the `composer.json` of the application server that handles the request. In cluster setups, or when your project is built in CI and deployed read-only, apply the change in your project repository instead — the page always shows the ready-to-paste snippet for this purpose. A `composer.json` modified only on the production server will be overwritten by the next deployment.
:::

## Third-party dependencies

The Security Plugin only fixes issues in Shopware's own code. It does **not** backport fixes for the third-party libraries your installation depends on. We recommend checking [Symfony security advisories](https://symfony.com/blog/category/security-advisories), [Twig security advisories](https://github.com/twigphp/Twig/security/advisories), and similar resources for other direct dependencies of Shopware. When such a library is affected, the fix lives in the dependency and reaches your installation only through a Composer update (see below) or through a Shopware update that requires the patched version.

The *Settings > Extensions > Security Plugin* page includes a dependency check that compares all installed Composer packages against the public advisory database of [packagist.org](https://packagist.org) and lists known vulnerabilities, similar to running `composer audit` on the server.

For this check, the names and versions of your installed packages are transmitted to packagist.org; the result is cached for one hour. Advisories that are excluded through the `advisories` policy in `composer.json` described above are not reported again.

Vulnerabilities in dependencies cannot be fixed by the plugin. Update the affected packages in the environment where your project is built:

```bash
composer update <package-name> --with-all-dependencies
```

Create a backup before updating, test the shop afterward, and deploy as usual. If a patched version is not reachable within your current version constraints, a Shopware update is required first.

The same applies once a dependency reaches its end of life: no further security releases are published for it, so a Shopware version that ships a maintained release is required. Check the maintenance and end-of-life status of each Symfony branch on the [Symfony releases page](https://symfony.com/releases).

Independent of the Administration page, running `composer audit` regularly in your CI pipeline is good practice.
