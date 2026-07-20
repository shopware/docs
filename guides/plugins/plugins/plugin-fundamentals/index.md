---
nav:
  title: Plugin Fundamentals
  position: 10

---

# Plugin Fundamentals

Plugin fundamentals are the building blocks for adding behavior to a Shopware plugin. Use this page to jump directly to the task you want to solve.

## What do you want to do?

- Run code when a plugin is installed, updated, activated, deactivated, or uninstalled: [Plugin lifecycle](plugin-lifecycle.md)
- Add configurable settings that appear in the Administration: [Plugin configuration](add-plugin-configuration.md)
- Add a custom Symfony console command: [CLI commands](add-custom-commands.md)
- Run recurring background work: [Scheduled tasks](add-scheduled-task.md)
- Add diagnostics and write plugin logs: [Logging](logging.md)
- Register services or inject dependencies: [Services and dependency injection](../services/index.md)
- React to Shopware events: [Listening to events](../framework/event/listening-to-events.md)
- Change or extend existing services: [Decorating services](../services/adjusting-service.md#decorating-the-service)
- Add a Storefront URL or render a Storefront response: [Add Custom Controller](../storefront/controllers/add-custom-controller.md)
- Add database changes: [Database migrations](../database/database-migrations.md)
- Add Composer or npm dependencies: [Plugin dependencies](../dependencies/index.md)

As a rule of thumb: use an event subscriber when your plugin reacts to something Shopware already does, use a controller when you need a new HTTP entry point, use a command for manual or scripted CLI work, and use a scheduled task for recurring background work.

## Recommended path

If you are new to plugin development, start with the [Plugin Base Guide](../plugin-base-guide.md). It explains the typical plugin development flow from creation and installation through lifecycle, configuration, services, events, database changes, testing, and diagnostics.
