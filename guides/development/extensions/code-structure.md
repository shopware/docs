---
nav:
  title: Code Structure
  position: 20

---

# Code Structure

## Shared patterns

* **Namespaces and autoloading**: Match PSR-4 to folder names; avoid deep nesting that hides ownership.
* **Configuration**: Centralize defaults; document override points. Use environment variables only in the project layer, not in Store plugins.
* **Documentation**: Each extension should ship a brief README with purpose, install/update steps, and known constraints.

## Choose the right extension type

* **Custom project/bundle**: Suitable for bespoke installations you fully control. See the [bundle guide](../../plugins/plugins/bundle.md) for the bundle layout and when to embed project-specific logic.
* **Static plugin**: Project-specific, customized plugins; the recommended option. Use the standard plugin skeleton for reusable features across a few projects. Start with the [plugin base guide](../../plugins/plugins/plugin-base-guide.md) and keep project overrides as thin as possible.
* **Managed plugin**: Same plugin layout, but [hardened for Store review](../../plugins/plugins/index.md#managed-plugins): strict metadata, no project-only hacks, testability, and BC guarantees.
* **App**: Prefer when you cannot host PHP in the shop or need SaaS-style isolation. Follow the [app base guide](../../plugins/apps/app-base-guide.md) for manifest and server structure.
* **Theme**: To customize the visual appearance of the Shopware [Storefront] only. Follow the [theme base guide](../../plugins/themes/theme-base-guide.md) for guidance.

## Project/bundle structure

* Keep domain logic in bundles, not in templates or controllers; expose services via dependency injection. See the [bundle guide](../../plugins/plugins/bundle.md) for further guidance.
* Use Composer `type: shopware-platform-plugin` or `shopware-bundle` consistently; align namespaces with the bundle name.
* Isolate integration points (events, DAL extensions) behind service classes so upgrades only touch narrow surfaces.

## Plugin structure (static/custom and managed/Store)

* Start from the default plugin skeleton ([plugin base guide](../../plugins/plugins/plugin-base-guide.md)); avoid bespoke auto-loaders or custom entrypoints.
* Keep configuration, migrations, administration, and storefront assets in their default folders; avoid cross-wiring plugins.
* Encapsulate database schema changes with migrations; ship idempotent install/update code.
* For Store plugins, avoid hard project assumptions (hostnames, queues, cron timing, file access); document requirements and provide safe fallbacks.

## App structure

* Keep the manifest minimal and explicit: permissions, webhooks, actions, and extensions should match the documented entrypoints. See the [app base guide](../../plugins/apps/app-base-guide.md) for further guidance.
* Separate app backend (API/webhook handlers) from UI assets.
* Avoid stateful coupling to shop runtime; design for multi-tenant hosting.

## Shared foundations and extension families

When several extensions belong to the same product family or customer portfolio, decide deliberately where shared functionality lives.

* Put maintenance-heavy domain or integration logic in a shared foundation only when several extensions genuinely need the same behavior.
* Keep dependent plugins and themes thin so most Shopware-version-specific changes remain in one place.
* Declare a [plugin dependency](../../plugins/plugins/dependencies/add-plugin-dependencies.md) when a plugin cannot operate without the shared foundation.
* Prefer [theme inheritance](../../plugins/themes/inheritance/add-theme-inheritance.md) for shared presentation and styling instead of coupling themes through unrelated business-logic plugins.
* Avoid dependency chains added only for convenience. Each dependency expands the set of version combinations you need to test during upgrades.

A shared foundation can reduce duplicated maintenance, but it also coordinates the release lifecycle of the extensions that depend on it. Choose the boundary based on what changes together, not only on what can technically be reused.

## Upgrade-oriented structure

To reduce upgrade friction:

* Avoid scattering related logic across multiple independent plugins.
* Prefer a single repository with consistent tooling when related extensions are maintained together.
* Keep integration points (events, decorators, DAL extensions) isolated behind service classes.
* Minimize unnecessary cross-plugin dependencies and document the compatibility range of dependencies you intentionally keep.

The more surface area exposed to the platform, the more upgrade effort is created.
