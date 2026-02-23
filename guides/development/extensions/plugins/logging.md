# Logging

## Overview

As a plugin developer, you may want to log certain actions or errors to a log file to aid in debugging or to simply keep a record of performed actions.

## Prerequisites

This guide is built upon our [plugin base guide](../plugin-base-guide), which explains the basics of a plugin as a whole. Make sure to have a look at it to get started on building your first plugin.

## Configuring Monolog

First, you must make sure that your plugin loads package configuration from the `/Resources/config/packages` folder:

::: code-group

```php [[plugin root]/src/SwagBasicExample.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample;

use Shopware\Core\Framework\Plugin;
use Symfony\Component\Config\FileLocator;
use Symfony\Component\Config\Loader\DelegatingLoader;
use Symfony\Component\Config\Loader\LoaderResolver;
use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Loader\DirectoryLoader;
use Symfony\Component\DependencyInjection\Loader\GlobFileLoader;
use Symfony\Component\DependencyInjection\Loader\YamlFileLoader;

class SwagBasicExample extends Plugin
{
    public function build(ContainerBuilder $container): void
    {
        parent::build($container);

        $locator = new FileLocator('Resources/config');

        $resolver = new LoaderResolver([
            new YamlFileLoader($container, $locator),
            new GlobFileLoader($container, $locator),
            new DirectoryLoader($container, $locator),
        ]);

        $configLoader = new DelegatingLoader($resolver);

        $confDir = \rtrim($this->getPath(), '/') . '/Resources/config';

        $configLoader->load($confDir . '/{packages}/*.yaml', 'glob');
    }
}
```

:::

This is a Symfony Bundle requirement, the same can also be achieved using Bundle Extensions. Please refer to the [Symfony Documentation](https://symfony.com/doc/current/bundles/extension.html).

We will now use monolog configuration to create a channel for your log messages; the channel should be a unique name identifying your plugin. See below for an example:

::: code-group

```yaml [[plugin root]/src/Resources/config/packages/monolog.yaml]

monolog:
  channels: ['my_plugin_channel']
```

:::

Monolog automatically registers a logger service that you can inject in to your services, which is scoped to your channel. You can access the logger with the service ID: `monolog.logger.my_plugin_channel`.

With your newly created channel, you can create a handler, directing your new channel to it.

::: code-group

```yaml [[plugin root]/src/Resources/config/packages/monolog.yaml]
monolog:
  channels: ['my_plugin_channel']

  handlers:
    myPluginLogHandler:
        type: rotating_file
        path: "%kernel.logs_dir%/my_plugin_%kernel.environment%.log"
        level: error
        channels: [ "my_plugin_channel"]
```

:::

Following this approach allows project owners to redirect your channel to a different one to better suit their needs.
