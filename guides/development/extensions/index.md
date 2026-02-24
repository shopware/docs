---
nav:
  title: Extensions
  position: 20

---

# Extensions

As a Shopware developer, your primary focus is developing extensions that enhance or modify Shopware's functionality.

Shopware offers two extension types:

- **Plugins**: full system access (self-hosted only)
- **Apps**: API-based, cloud-compatible

Plugins and apps are installed and activated for the whole Shopware instance.

:::info
Before choosing an extension type, review the recommended [Code structure](code-structure.md). Following the standard structure reduces upgrade friction and prevents long-term maintenance issues.
:::

A storefront theme is *not* a separate extension type, but a stripped-down plugin consisting of a customized storefront UI. In cloud environments, storefront themes are delivered via apps.

## Monetization

To sell an extension or offer paid features, see the [Monetization guide](./monetization) for available models such as paid extensions, In-App Purchases, and commission-based integrations.

## Which type to build?

This comparison table aims to help you decide which Shopware extension type best fits your use case.

| Task                                        | Plugin (incl. Theme) | App | Remarks |
|:--------------------------------------------|:----------------------|:----|:--------|
| Change Storefront appearance                | ✅                     | ✅   | Themes are storefront-focused plugins. In Cloud, themes are delivered via Apps. |
| Add admin modules                           | ✅                     | ✅   | Themes do not add admin modules. |
| Execute webhooks                            | ✅                     | ✅   | Apps are webhook-first. Plugins can also call external services. |
| Add custom entities                         | ✅                     | ✅   | — |
| Modify database structure                   | ✅                     | ❌   | Apps cannot modify the database schema. |
| Integrate payment providers                 | ✅                     | ✅   | — |
| Publish in the Shopware Store               | ✅                     | ✅   | — |
| Install in Shopware 6 Cloud shops                | ❌                     | ✅   | Plugins (including theme plugins) cannot run in Cloud. |
| Install in Shopware 6 self-hosted shops     | ✅                     | ✅   | Apps can be installed and used since Shopware 6.4.0.0. |
| Add custom logic/routes/commands            | ✅                     | ⚠️   | Apps implement logic externally via services and webhooks; they cannot add internal Symfony routes or CLI commands. |
| Control style/template inheritance          | ✅                     | ✅   | This capability is specific to theme plugins. |

:::info Version compatibility
Extensions must explicitly support target Shopware versions. Review the [Upgrades and Migrations](../upgrades-and-migrations/index.md) section before releasing updates to ensure compatibility with upcoming core changes.
:::

## Extension guides

These guides provide essential information on how to create, configure, and extend your store with Shopware extensions:

<PageRef page="plugins/plugin-base-guide" />

<PageRef page="apps/app-base-guide" />

<PageRef page="themes/theme-base-guide" />
