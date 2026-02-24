---
nav:
  title: Add custom CLI commands
  position: 90

---

# Add Custom CLI Commands

Shopware CLI commands are based on Symfony Console. This means that creating custom commands in Shopware plugins follows the standard Symfony approach. 

See the [official Symfony documentation](https://symfony.com/doc/current/console.html) for the full guide.

Commands registered as services in a Shopware plugin are automatically available via `bin/console`.

## More interesting topics

* [Adding a scheduled task](add-scheduled-task)
