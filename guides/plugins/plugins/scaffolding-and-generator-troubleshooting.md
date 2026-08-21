---
nav:
  title: Scaffolding and Generator Troubleshooting
  position: 25

---

# Scaffolding and Generator Troubleshooting

Shopware's plugin scaffolding is designed to give developers a useful starting point, but generated files are often part of a larger feature. A PHP class, JavaScript module, configuration entry, route import, or service definition may each be valid on its own while the feature still is not discoverable or usable.

This guide explains the mental model behind scaffolding and gives a troubleshooting path that works well both for humans and for coding assistants.

::: info
This guide describes the current Core `bin/console plugin:create` scaffolding workflow and the conventions it generates. The newer `shopware-cli extension create ...` generator work is being developed separately in the Shopware CLI repository. See [#1255](https://github.com/shopware/shopware-cli/issues/1255) and [#1280](https://github.com/shopware/shopware-cli/issues/1280).
:::

## Start with the smallest scaffold

If you are not sure which example components you need, prefer a minimal plugin scaffold and add features when you need them. The current Core `plugin:create` command supports both a minimal skeleton and optional example components.

```bash
bin/console plugin:create SwagBasicExample --no-scaffold
```

The interactive form asks whether optional files should be scaffolded. The optional generators are examples: they are useful for learning conventions, but you should review the generated files rather than assuming that selecting a generator creates your final production implementation.

For the current Core scaffold, examples include a command, scheduled task, event subscriber, Storefront controller, Store API route, Administration module, Storefront JavaScript plugin, custom field set, and entities. The exact generated files depend on the component and your Shopware version. See the [Creating Plugins](./creating-plugins.md) guide for the current command options.

## The important mental model: a feature is usually a set of coordinated pieces

When a generated feature does not work, ask which of these layers are involved:

1. **Code** — Is the class/component present, with the right namespace and path?
2. **Registration** — Does the service container know about it?
3. **Discovery** — Is the route, command, module, task, or test imported/registered?
4. **Build/cache** — Has the relevant cache or Administration build been refreshed?
5. **Runtime verification** — Can you actually call/open/run the feature?

A common mistake is stopping after layer 1 or layer 3. For example, a storefront controller can appear in `debug:router` and still fail at request time if its service registration is incomplete.

## Why namespace and autoloading matter

Plugin Composer autoloading commonly maps the plugin namespace prefix to `src/`:

```json
"autoload": {
    "psr-4": {
        "Swag\\BasicExample\\": "src/"
    }
}
```

A file at:

```text
src/Subscriber/OrderPlacedSubscriber.php
```

therefore needs a matching namespace such as:

```php
namespace Swag\BasicExample\Subscriber;
```

When a class is not found, compare these three values first:

```text
composer.json PSR-4 prefix
        ↓
PHP namespace
        ↓
filesystem path
```

They must describe the same class.

## Service registration: what the tags mean

Many Shopware features are Symfony services. The service container needs to know how a class should participate in the framework.

For example, an event subscriber can use:

```xml
<service id="Swag\BasicExample\Subscriber\OrderPlacedSubscriber">
    <tag name="kernel.event_subscriber"/>
</service>
```

The PHP class declares which events it subscribes to. The `kernel.event_subscriber` tag tells Symfony to treat the service as an event subscriber and register it with the event dispatcher.

Likewise, a console command is registered with the `console.command` tag, while a scheduled task uses the `shopware.scheduled.task` tag.

The current Core scaffolding generators append service definitions to `src/Resources/config/services.php` for these features rather than asking you to remember every registration detail.

::: warning
Current Core code also supports legacy XML service configuration in existing plugins, but `services.xml` is deprecated. When you touch an older plugin, check whether the current version expects `services.php` or `services.yaml` before copying an example blindly.
:::

## Routes: discovery is not the same as reachability

A route-based feature normally has at least two stages of verification:

```bash
bin/console debug:router | grep my-route
```

proves that the route is in the router. It does **not** prove that the request will execute successfully.

For a Storefront controller, verify the actual URL as well. If the route is visible but the request returns a server error, inspect the controller's service definition and route configuration.

For Store API routes, a request may reach Shopware but return `401 Unauthorized` because Store API authentication is required. A 401 from the authentication layer is different from a 404 caused by an undiscovered route.

## Commands: use `bin/console` as the verification target

For a generated console command, use both:

```bash
bin/console list | grep my-prefix
```

and then run the command itself:

```bash
bin/console my-prefix:my-command
```

The first verifies discovery. The second verifies that the command can actually execute.

The same principle applies to other generators: prefer a verification command or a real request over a file listing.

## Scheduled tasks: verify the task lifecycle

A scheduled task is more than a PHP class. The framework needs to know that the class is a scheduled task.

Useful checks are:

```bash
bin/console scheduled-task:register
bin/console scheduled-task:list
```

and, where appropriate:

```bash
bin/console scheduled-task:run-single <task-name>
```

The current Core `ScheduledTaskGenerator` generates the task class and its `shopware.scheduled.task` registration. It does not generate a separate task handler as part of that scaffold.

## Configuration fields: static validity is only one checkpoint

A plugin configuration field lives inside an existing `config.xml`. A successful XML/schema validation proves that the structure is valid, but the user-facing acceptance criterion is stronger: the field should be available in the Administration.

Treat these as separate checks:

```text
config.xml validates
        ↓
configuration key exists
        ↓
Administration shows the field
```

When adding a field to an existing configuration, preserve unrelated fields and card structure. Avoid replacing the whole document unless you intentionally want to replace the configuration.

## Administration modules: a build that passes is not the finish line

Administration features commonly span:

```text
entry point
module registration
route
page component
template
localized snippets
```

An Administration build can succeed while the module is still absent from the UI. Verify both:

1. `shopware-cli project admin-build` (or the equivalent Administration build workflow for your project)
2. The module appears in the Administration and its initial route opens.

Keep English and German snippet keys aligned with the module registration. Missing or inconsistent snippets should be treated as wiring problems, not just translation problems.

## Tests: distinguish generation from test infrastructure

The focused test-generator story is intentionally narrower than “set up testing”. A generated unit test should follow the plugin's existing PHPUnit path and Composer development autoloading, but the generator should not silently create or repair the plugin's test infrastructure.

Check:

```text
phpunit.xml suite definition
Composer autoload-dev namespace
expected tests/ path
actual test class namespace
```

Then use the plugin's configured PHPUnit workflow to verify discovery when PHPUnit is available.

## A practical troubleshooting sequence

When a newly generated feature does not work, use this order:

```text
1. Does the file/class exist?
2. Does its namespace match Composer autoloading?
3. Is the service registered?
4. Is the route/command/task/module/test discovered?
5. Did you rebuild or clear the relevant cache?
6. Can you execute the feature for real?
7. If it fails, is the failure in your feature or in the framework's authentication/build/runtime layer?
```

This sequence helps avoid changing several unrelated things at once.

## Why this matters for future `shopware-cli extension create` generators

The Shopware CLI work tracked in [#1255](https://github.com/shopware/shopware-cli/issues/1255) and [#1280](https://github.com/shopware/shopware-cli/issues/1280) aims to make extension generation more contextual: an existing plugin should be inspected, framework-specific conventions should be derived where possible, and the generator should create a coordinated feature rather than just a single file.

The generator proposals are not equally sized. A command or subscriber is relatively bounded. A Storefront controller, Store API route, or Administration module crosses more files and verification layers. That is why a good generator should:

- ask only for information the developer cannot safely derive,
- preserve existing unrelated code and configuration,
- detect collisions before writing,
- respect the Shopware version targeted by the plugin,
- and verify discovery or runtime behavior where static validation is insufficient.

These principles make both the generated project and the documentation easier for developers and AI coding assistants to reason about.

## Reference implementations

When you need to understand what the current Core scaffold actually generates, the source of truth is the scaffolding generator in `shopware/shopware`, for example:

- [CommandGenerator.php](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Plugin/Command/Scaffolding/Generator/CommandGenerator.php)
- [ScheduledTaskGenerator.php](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Plugin/Command/Scaffolding/Generator/ScheduledTaskGenerator.php)
- [StorefrontControllerGenerator.php](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Plugin/Command/Scaffolding/Generator/StorefrontControllerGenerator.php)
- [StoreApiRouteGenerator.php](https://github.com/shopware/shopware/blob/trunk/src/Core/Framework/Plugin/Command/Scaffolding/Generator/StoreApiRouteGenerator.php)

For proposed CLI-side generators, use the corresponding Shopware CLI issue as the contract and then verify the implementation against the CLI repository before documenting it as available.
