# Dependency injection

## Table of contents

*   [Shopware DIC](#shopware-dic)
*   [Dependency Injection Extension B2B](#dependency-injection-extension-b2b)
*   [Tags](#tags)

## Shopware DIC

The B2B-Suite registers with the [DI-container](../../../../../../guides/plugins/plugins/plugin-fundamentals/dependency-injection.md) from Symfony. 
Be sure you are familiar with the basic usage patterns and practices. 
Especially [service decoration](../../../../../../guides/plugins/plugins/plugin-fundamentals/adjusting-service.md) is an equally important extension point.

## Dependency Injection Extension B2B

The B2B-Suite provides an abstract `DependencyInjectionConfiguration` class, that is used throughout the Suite as an initializer of DI-Contents across all components.

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Common;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;

abstract class DependencyInjectionConfiguration
{
    /**
     * @return string[] array of service xml files
     */
    abstract public function getServiceFiles(): array;

    /**
     * @return CompilerPassInterface[]
     */
    abstract public function getCompilerPasses(): array;

    /**
     * @return DependencyInjectionConfiguration[] child components required by this component
     */
    abstract public function getDependingConfigurations(): array;
}
```

Every macro layer of every component defines its own dependencies. 
That way you can just require the up most components you want to use and every other dependency is injected automatically.

For example this code will enable the contact component your own plugin.

```php
<?php declare(strict_types=1);

namespace MyB2bPlugin;

use Shopware\B2B\Common\B2BContainerBuilder;
use Shopware\B2B\Contact\Framework\DependencyInjection\ContactFrameworkConfiguration
use Shopware\Components\Plugin;
use Symfony\Component\DependencyInjection\ContainerBuilder;

class MyB2bPlugin extends Plugin
{
    [...]

    public function build(ContainerBuilder $container)
    {
        $containerBuilder = B2BContainerBuilder::create();
        $containerBuilder->addConfiguration(new ContactFrameworkConfiguration());
        $containerBuilder->registerConfigurations($container);
    }
}
```

## Tags

Additionally, the B2B-Suite makes heavy use of service tags as a more modern replacement for collect events. 
They are used to helping you extend central B2B services with custom logic. 

Please take a look at the example plugins and there usage of that extension mechanism. 
Be sure you know [the basics](http://symfony.com/doc/current/service_container/tags.html).
