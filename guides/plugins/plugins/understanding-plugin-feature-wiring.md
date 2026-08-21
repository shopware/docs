---
nav:
  title: Understanding Plugin Feature Wiring
  position: 25
---

# Understanding Plugin Feature Wiring

A Shopware plugin feature is usually a chain of coordinated pieces rather than one file. Understanding that chain makes generated code easier to adapt and failures much faster to localize.

```text
feature intent
    ↓
source artifacts
    ↓
framework registration
    ↓
discovery
    ↓
build / cache
    ↓
runtime
    ↓
verification
```

A feature can be correct at one boundary and broken at the next. A PHP class existing on disk does not prove that Symfony registered it. A route appearing in `debug:router` does not prove that its service can be constructed. A successful asset build does not prove that a browser can initialize the feature.

## Scaffolding is a starting point

The Core `bin/console plugin:create` command can create a minimal plugin or optional example components. Those examples encode conventions for the Shopware version running the command, but they are still starting points for your implementation.

If you already know which feature you need, a minimal plugin plus the focused feature guide is often easier to reason about than generating every optional example.

Generated features also differ in size. A command or subscriber may need a class and service registration. An Administration module or Storefront JavaScript plugin coordinates several source, build, and runtime layers.

## The five boundaries to check

1. **Code** — Is the class or component present, and does its namespace/path match autoloading?
2. **Registration** — Is the service, route, module, task, or entry point registered?
3. **Discovery** — Can Shopware prove that it found the feature?
4. **Build/cache** — Did the relevant container, Twig cache, Administration build, or Storefront build refresh?
5. **Runtime** — Can the feature actually execute, open, or initialize?

Checking these boundaries in order prevents changes to working code when the failure is really registration, authentication, cache, or runtime wiring.

## Common framework wiring

### Composer and PSR-4

When a class is not found, compare the Composer PSR-4 prefix, PHP namespace, and filesystem path. All three must describe the same class.

### Symfony services

Many plugin features are services. Tags such as `kernel.event_subscriber`, `console.command`, and `shopware.scheduled.task` tell Symfony and Shopware how the service participates in the framework.

### Routes

Use `debug:router` to prove route discovery, then make a real request to prove reachability. A missing route, container-construction error, authentication response, and endpoint exception are different failure boundaries.

### Configuration

A valid `config.xml` proves structural validity. The stronger user-facing check is that the field appears and behaves correctly in the Administration.

### Builds and caches

Build commands compile assets. Cache clears refresh runtime-discovered configuration and templates. They are related but not interchangeable; for example, a successful Storefront build does not itself guarantee that changed Twig output is rendered.

## Focused lifecycle guides

The following pages explain how the pieces of larger extension points connect from source to runtime:

- [Storefront JavaScript Plugin Lifecycle](./storefront/javascript/storefront-javascript-plugin-lifecycle.md)
- [Administration Module Lifecycle](./administration/module-component-management/administration-module-lifecycle.md)
- [Store API Route Lifecycle](./framework/store-api/store-api-route-lifecycle.md)
- [Scheduled Task Lifecycle](./plugin-fundamentals/scheduled-task-lifecycle.md)

Each lifecycle page links to the corresponding implementation guide and includes troubleshooting at the boundaries where failures commonly occur.

## Generated code and Shopware versions

Generated files are tied to the Shopware version whose generator produced them. When a framework convention matters, compare generated output with the corresponding Core scaffolding generator and stubs for the version you target.

The newer `shopware-cli extension create ...` generator work is developed separately from Core `plugin:create`. Verify CLI generator availability and behavior against `shopware/shopware-cli` rather than assuming the two generator systems are equivalent.
