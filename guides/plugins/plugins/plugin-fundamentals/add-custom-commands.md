# Add Custom CLI Commands

To ease development tasks, Shopware contains the Symfony commands functionality. This allows \(plugin-\) developers to define new commands executable via the Symfony console at `bin/console`. The best thing about commands is, that they're more than just simple standalone PHP scripts - they integrate into Symfony and Shopware, so you've got access to all the functionality offered by both of them.

Creating a command for Shopware 6 via a plugin works exactly like you would add a command to Symfony. Make sure to have a look at the Symfony commands guide:

<PageRef page="https://symfony.com/doc/current/console.html\#registering-the-command" title="Console Commands (Symfony Docs)" target="_blank" />

## Prerequisites

This guide **does not** explain how to create a new plugin for Shopware 6. Head over to our plugin base guide to learn how to create a plugin at first:

<PageRef page="../plugin-base-guide" />

The main requirement here is to have a `services.xml` file loaded in your plugin. This can be achieved by placing the file into a `Resources/config` directory relative to your plugin's base class location.

::: info
Refer to this video on custom **[Creating a CLI command](https://www.youtube.com/watch?v=OL_qNVLLyaI)**. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::

## Registering your command

From here on, everything works exactly like in Symfony itself. Commands are recognised by Shopware, once they're tagged with the `console.command` tag in the [dependency injection](dependency-injection.md) container. So to register a new command, just add it to your plugin's `services.xml` and specify the `console.command` tag:

```html
<services>
   <!-- ... -->

   <service id="Swag\BasicExample\Command\ExampleCommand">
       <tag name="console.command"/>
   </service>
</services>
<!-- ... -->
```

Here's a full example `services.xml` which registers your custom command:

```xml
// <plugin root>/src/Resources/config/services.xml
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Command\ExampleCommand">
            <tag name="console.command"/>
        </service>
    </services>
</container>
```

Your command's class should extend from the `Symfony\Component\Console\Command\Command` class, here's an example:

```php
// <plugin root>/src/Command/ExampleCommand.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Command;

use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class ExampleCommand extends Command
{
    // Command name
    protected static $defaultName = 'swag-commands:example';

    // Provides a description, printed out in bin/console
    protected function configure(): void
    {
        $this->setDescription('Does something very special.');
    }

    // Actual code executed in the command
    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $output->writeln('It works!');

        // Exit code 0 for success
        return 0;
    }
}
```

This command is of course only a basic example, so feel free to experiment. As stated above, you now have access to all the functionality offered by Symfony and Shopware.

::: info
For inspiration, maybe have a look at the Symfony documentation - you may for example use [tables](https://symfony.com/doc/current/components/console/helpers/table.html), [progress bars](https://symfony.com/doc/current/components/console/helpers/progressbar.html), or [custom formats](https://symfony.com/doc/current/components/console/helpers/formatterhelper.html).
:::

### Running commands

Commands are run via the `bin/console` executable. To list all available commands, run `bin/console list`:

```text
$: php bin/console list
Symfony 4.4.4 (env: dev, debug: true)

Usage:
  command [options] [arguments]

Options:
  -h, --help            Display this help message
  -q, --quiet           Do not output any message
  -V, --version         Display this application version
      --ansi            Force ANSI output
      --no-ansi         Disable ANSI output
  -n, --no-interaction  Do not ask any interactive question
  -e, --env=ENV         The Environment name. [default: "dev"]
      --no-debug        Switches off debug mode.
  -v|vv|vvv, --verbose  Increase the verbosity of messages: 1 for normal output, 2 for more verbose output and 3 for debug

Available commands:
  about                                   Displays information about the current project
  help                                    Displays help for a command
  list                                    Lists commands
 feature
  feature:dump                            [administration:dump:features] Creating json file with feature config for js testing and hot reloading capabilities.
 assets
  assets:install                          
 bundle
  bundle:dump                              [administration:dump:plugins|administration:dump:bundles] Creates a json file with the configuration for each active Shopware bundle.
 cache
  cache:clear                             Clears the cache
  cache:pool:clear                        Clears cache pools
  cache:pool:delete                       Deletes an item from a cache pool
  cache:pool:list                         List available cache pools
  cache:pool:prune                        Prunes cache pools
  cache:warmup                            Warms up an empty cache
 [...]
```

Each command usually has a namespace like `cache`, so to clear the cache you would execute `php bin/console cache:clear`. If you would like to learn more about commands in general, have a look at [this article](https://symfony.com/doc/current/console.html) in the Symfony documentation.

## More interesting topics

* [Adding a scheduled task](add-scheduled-task.md)
