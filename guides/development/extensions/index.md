---
nav:
  title: Extensions
  position: 1

---

# Extensions

As a Shopware developer, your primary focus is on developing extensions that enhance or modify Shopware's functionality.

## Server-side extension formats: plugins and bundles

Besides apps (API-based, cloud-compatible), self-hosted projects use several code extension shapes:

| Type | Typical use | Merchant can disable in Admin? |
|------|-------------|----------------------------------|
| **Plugin** (`custom/plugins`) | Store extensions, distributable features | Yes (Plugin Manager) |
| **Static plugin** (`custom/static-plugins` + Composer) | Your team’s code in Git; needs Composer dependencies | Yes (lifecycle), not listed like Store plugins—require via Composer |
| **Shopware bundle** (`src/` or `vendor`) | Project-specific core customizations | **No** — not in Plugin Manager; always loaded |
| **Symfony bundle** | Same as Shopware bundle, minus Shopware-specific features (themes, migrations, …) | **No** |

When to choose what:

* **Static plugin**: default for private project code you version in Git, especially when the plugin must declare PHP dependencies via Composer.
* **Store-style plugin**: when you install from the Shopware Store or share a zip; lives under `custom/plugins` and is managed in the Administration.
* **Shopware / Symfony bundle**: when code must stay active (merchants cannot deactivate it) and you want full control without plugin lifecycle UI. See the [bundle guide](../../plugins/plugins/bundle.md) and the [feature comparison](../../plugins/plugins/index.md#types-of-plugins).

Plugins and apps are installed and activated for the whole Shopware instance (apps from the cloud perspective; plugins on self-hosted).

## Apps and themes

Shopware also offers:

* **Apps**: API-based, cloud-compatible
* **Plugins** (above): full system access (self-hosted only)

:::info
Before choosing an extension type, review the recommended [Code structure](code-structure.md). Following the standard structure reduces upgrade friction and prevents long-term maintenance issues.
:::

A storefront theme is *not* a separate extension type, but a stripped-down plugin consisting of a customized storefront UI. In cloud environments, storefront themes are delivered via apps.

## Monetization

To sell an extension or offer paid features, see the [Monetization guide](../../development/monetization/) for available models such as paid extensions, In-App Purchases, and commission-based integrations.

## Which type to build?

This comparison table helps you decide which Shopware extension type best fits your use case.

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
Extensions must explicitly support target Shopware versions. Review the [Upgrades and Migrations](../../upgrades-migrations/index.md) section before releasing updates to ensure compatibility with upcoming core changes.
:::

## Extension guides

These guides provide essential information on how to create, configure, and extend your store with Shopware extensions:

<PageRef page="../../../guides/plugins/plugins/plugin-base-guide" />

<PageRef page="../../../guides/plugins/apps/app-base-guide" />

<PageRef page="../../../guides/plugins/themes/theme-base-guide" />
