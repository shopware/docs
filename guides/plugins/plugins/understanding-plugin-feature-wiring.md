# Understanding Generated Plugin Feature Wiring

Use this page when a generated plugin feature is present but does not behave as expected. It is a troubleshooting reference for generated output, not a replacement for the normal plugin scaffolding workflow.

Generators create several coordinated artifacts. The exact files and conventions depend on the generator and the Shopware version, but the runtime path usually looks like this:

```text
generator output
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
```

A generated file being present does not prove that the feature is registered, discovered, built, or usable at runtime. When something is broken, identify the first boundary that fails instead of changing later layers blindly.

## What generated features usually connect

### PHP features

Generated commands, subscribers, services, and similar PHP features typically combine a class with service-container configuration. The service tag is what tells Symfony or Shopware how the class participates in the framework.

For example, `console.command`, `kernel.event_subscriber`, and `shopware.scheduled.task` describe different kinds of participation. A correct class with missing or mismatched service wiring can therefore look complete on disk while remaining invisible to the framework.

### Routes

Generated Storefront and Store API routes usually involve both the route class and routing configuration. The route can exist on disk without being imported into the application's routing configuration.

`debug:router` is useful here because it separates route discovery from request handling. A route that is discovered can still fail later because its service cannot be constructed, authentication rejects the request, or the endpoint itself throws an exception.

### Scheduled tasks

A generated scheduled task has two distinct runtime roles: the scheduled-task definition and its handler. Registration of the task explains why it appears in the scheduled-task storage; handler registration and the message queue explain whether the work actually executes.

A task appearing in `scheduled-task:list` therefore proves persistence, not successful execution. If a generated task is registered but does not run, the handler, task status, runner, and message consumer are separate things to investigate.

### Administration modules

A generated Administration module crosses several layers: the plugin's Administration entry point, module registration, routes and components, snippets, and the Administration build.

A successful build only proves that the assets compile. It does not prove that the module was imported, registered, or reachable through its navigation and routes.

### Storefront JavaScript

A generated Storefront JavaScript plugin also crosses several layers. The entry point imports and registers the plugin, the generated template or markup provides any selector it depends on, and the Storefront build produces the asset that the browser loads.

A successful build therefore does not prove that the browser initialized the plugin. If the generated asset exists but `init()` never runs, look at the entry-point registration, selector, rendered markup, and cache separately.

### Plugin configuration

Generated `config.xml` output has a similar distinction. XML validation or successful loading proves that the configuration is structurally understood; it does not by itself prove that the expected field is visible and behaves correctly in the Administration.

## The troubleshooting boundaries

When generated output is not working, use these boundaries in order:

1. **Source** — Does the generated class or component exist, and do its path and namespace match the generated references?
2. **Registration** — Did the generator create the service, route, module entry point, task handler, or other registration that the feature requires?
3. **Discovery** — Can Shopware or the underlying framework show that it found the generated feature?
4. **Build / cache** — Has the relevant container, Twig cache, Administration build, or Storefront build caught up with the generated files?
5. **Runtime** — Can the feature actually execute, initialize, open, or respond?

The important distinction is between **discovery** and **runtime**. For example, a route appearing in `debug:router` proves that routing found it, but not that its service can be constructed. Likewise, a compiled JavaScript asset proves compilation, but not that a browser can initialize the generated plugin.

## Common generator failure patterns

| Symptom | Useful context |
| --- | --- |
| `plugin:refresh` finds the plugin but installation fails with a base-class error | Compare the generated plugin class, `extra.shopware-plugin-class`, and PSR-4 namespace/path. |
| A generated command or subscriber is present but never appears to run | The PHP class is only one part of the feature; inspect its service registration and tag. |
| A generated route is missing from `debug:router` | Focus on route imports and route registration before debugging the endpoint itself. |
| A scheduled task is listed but never executes | Task persistence and handler execution are separate boundaries; inspect the handler and message processing. |
| Administration assets build successfully but the generated module is missing | Compilation does not prove entry-point import, module registration, or navigation wiring. |
| Storefront assets build successfully but generated JavaScript does not initialize | Check registration, the selector/markup used by the plugin, the generated asset, and cache. |
| Generated configuration loads but a field is not visible as expected | Structural validity and Administration rendering are different checks. |

## Generated output is version-specific

Generators encode conventions from the Shopware version they run against. File locations, entry points, registration patterns, and generated examples can change between versions.

When generated output looks different from an older guide, prefer the output from the generator you are actually using and use the focused documentation to understand the relevant concept. Do not assume that a generated example from another Shopware version is interchangeable.

## Where to read more

The focused feature guides explain the underlying concepts represented by generated output. Use them when the generated result needs closer inspection or deliberate modification:

- [Add Custom Controller](./storefront/controllers/add-custom-controller.md)
- [Add Custom JavaScript](./storefront/javascript/add-custom-javascript.md)
- [Add Custom Module](./administration/module-component-management/add-custom-module.md)
- [Add Store API Route](./framework/store-api/add-store-api-route.md)
- [Add Scheduled Task](./plugin-fundamentals/add-scheduled-task.md)

These are implementation references; the normal scaffolding workflow remains the preferred way to create the feature.
