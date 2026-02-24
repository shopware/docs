---
nav:
  title: Code structure
  position: 2

---

# Code structure

## Shared patterns

* **Namespaces and autoloading**: Match PSR-4 to folder names; avoid deep nesting that hides ownership.
* **Configuration**: Centralize defaults; document override points. Use environment variables only in the project layer, not in Store plugins.
* **Documentation**: Each extension should ship a brief README with purpose, install/update steps, and known constraints.

## Choose the right extension type

* **Custom project/bundle**: Fit for bespoke installations you fully control. See the [bundle guide](../plugins/plugins/bundle.md) for the bundle layout and when to embed project-specific logic.
* **Private/custom plugin**: Use the standard plugin skeleton for reusable features across a few projects. Start from the [plugin base guide](../plugins/plugins/plugin-base-guide.md) and keep project overrides thin.
* **Store plugin**: Same plugin layout, but harden for Store review: strict metadata, no project-only hacks, testability, and BC guarantees.
* **App**: Prefer when you cannot host PHP in the shop or need SaaS-style isolation. Follow the [app base guide](../plugins/apps/app-base-guide.md) for manifest and server structure.

## Project/bundle structure

* Keep domain logic in bundles, not in templates or controllers; expose services via dependency injection (see the [bundle guide](../plugins/plugins/bundle.md)).
* Use Composer `type: shopware-platform-plugin` or `shopware-bundle` consistently; align namespaces with the bundle name.
* Isolate integration points (events, DAL extensions) behind service classes so upgrades only touch narrow surfaces.

## Plugin structure (custom and Store)

* Start from the default plugin skeleton ([plugin base guide](../plugins/plugins/plugin-base-guide.md)); avoid bespoke auto-loaders or custom entrypoints.
* Keep configuration, migrations, administration, and storefront assets in their default folders; avoid cross-wiring plugins.
* Encapsulate database schema changes with migrations; ship idempotent install/update code.
* For Store plugins, avoid hard project assumptions (hostnames, queues, cron timing, file access); document requirements and provide safe fallbacks.

## App structure

* Keep the manifest minimal and explicit: permissions, webhooks, actions, and extensions should match the documented entrypoints ([app base guide](../plugins/apps/app-base-guide.md)).
* Separate app backend (API/webhook handlers) from UI assets.
* Avoid stateful coupling to shop runtime; design for multi-tenant hosting.

## Upgrade-oriented structure

To reduce upgrade friction:

* Avoid scattering related logic across multiple independent plugins.
* Prefer a single repository with consistent tooling.
* Keep integration points (events, decorators, DAL extensions) isolated behind service classes.
* Minimize cross-plugin dependencies.

The more surface area exposed to the platform, the more upgrade effort is created.
