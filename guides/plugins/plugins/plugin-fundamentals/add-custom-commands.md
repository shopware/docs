---
nav:
  title: Add custom CLI commands
  position: 90

---

# Add Custom CLI Commands

Shopware CLI commands are based on [Symfony Console](https://symfony.com/doc/current/console.html). This means that creating custom commands in Shopware plugins follows the standard Symfony approach.

To add a custom command in a Shopware plugin, you must register it as a service in your plugin's `src/Resources/config/services.php` and tag it with `console.command`:

```php
$services->set(Swag\BasicExample\Command\ExampleCommand::class)
    ->tag('console.command');
```

Commands registered as services in a Shopware plugin are automatically available via `bin/console`.

## More interesting topics

* [Adding a scheduled task](add-scheduled-task)
