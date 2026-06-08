---
nav:
  title: Add Custom CLI Commands
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

A minimal command class:

```php
// <plugin root>/src/Command/ExampleCommand.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Command;

use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(name: 'swag:example', description: 'Example command')]
class ExampleCommand extends Command
{
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('Hello from ExampleCommand');

        return Command::SUCCESS;
    }
}
```

## Next steps

* [Adding a scheduled task](add-scheduled-task.md)
