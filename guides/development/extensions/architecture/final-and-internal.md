---
nav:
  title: Final and Internal Annotation
  position: 20

---

# Final and Internal Annotation

::: info
This document represents core guidelines and has been mirrored from the core in our Shopware 6 repository.
You can find the original version [here](https://github.com/shopware/shopware/blob/trunk/coding-guidelines/core/final-and-internal.md)
:::

## Overview

We use `@final` and `@internal` annotations to mark classes as final or internal. This allows us to mark services and classes as public or private API and to define which breaking changes can be expected.

When you build extensions, treat only documented extension points as supported API. Infrastructure classes such as framework internals, container wiring, and core compiler passes are not extension points unless explicitly documented otherwise.

## Final

We mark classes as `@final` when developers can use the class but should not extend it.

The following changes to the class are allowed:

- Adding new public methods/properties/constants
- Adding new optional parameters to public methods
- Protected and private methods/properties/constants can be changed without any restrictions.
- Widening the type of public method params

The following changes to the class are not allowed:

- Removing public methods/properties/constants
- Removing public method parameters
- Narrowing the type of public methods/properties/constants

Due to the fact that we "only" mark the classes as `@final` via doc annotation, it is possible for developers to extend the base class and replace the service in the DI container. This is not recommended and should be avoided. But it is possible, and without any guarantees.

## Internal

We mark classes as `@internal` when the class is a private API and should not be used or extended by other developers.

This means we can change the class without any restrictions, and we can also remove the class without deprecation.

Due to the fact that we "only" mark the class as `@internal` via doc annotation, it is possible for developers to use the class or replace the service. This is not recommended and should be avoided. But it is possible, and without any guarantees.

### Compiler passes

Core compiler passes are implementation details of the dependency injection container. Do not use them as extension points, do not subclass them, and do not rely on their constructor arguments, execution order, or service registration behavior.

If you need to customize the container in your own extension, register your own compiler pass instead of depending on a Shopware core compiler pass.

```php
<?php declare(strict_types=1);

namespace Swag\Example;

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;

final class ExampleCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        if (!$container->hasDefinition('Swag\Example\Service\ExampleService')) {
            return;
        }

        $definition = $container->getDefinition('Swag\Example\Service\ExampleService');
        $definition->setPublic(true);
    }
}
```

Register your compiler pass in your bundle class:

```php
<?php declare(strict_types=1);

namespace Swag\Example;

use Shopware\Core\Framework\Plugin;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class SwagExample extends Plugin
{
    public function build(ContainerBuilder $container): void
    {
        parent::build($container);

        $container->addCompilerPass(new ExampleCompilerPass());
    }
}
```

Prefer native Symfony dependency injection features where possible, for example:

- service decoration
- service tags
- autowiring and autoconfiguration
- explicit service aliases
- documented Shopware extension points

Use a compiler pass only when container manipulation is actually required.