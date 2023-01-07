# How to Extend the Storefront (Shopware 6)

In order to be able to extend the templates of the B2B Suite with another plugin, you have to make sure to register a `TemplateNamespaceHierarchyBuilder` in your plugin.

## Registering a TemplateNamespaceHierarchyBuilder

Register the `TemplateNamespaceHierarchyBuilder` by tagging it in the `services.xml` file of your plugin.

```xml
<?xml version="1.0" encoding="UTF-8" ?>
<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">
    <services>
        <service id="MyPlugin\Framework\Adapter\Twig\NamespaceHierarchy\TemplateNamespaceHierarchyBuilder">
            <tag name="shopware.twig.hierarchy_builder" priority="750"/>
        </service>
    </services>
</container>
```

The really important part here is the priority. `750` should work fine for most cases, but if you are having problems here, play around with the priority.

## The TemplateNamespaceHierarchyBuilder service

The `TemplateNamespaceHierarchyBuilder` looks like this. Please replace `MyPlugin` with the name of your plugin.

```php
<?php declare(strict_types=1);

namespace MyPlugin\Framework\Adapter\Twig\NamespaceHierarchy;

use Shopware\Core\Framework\Adapter\Twig\NamespaceHierarchy\TemplateNamespaceHierarchyBuilderInterface;
use function array_merge;

class TemplateNamespaceHierarchyBuilder implements TemplateNamespaceHierarchyBuilderInterface
{
    public function buildNamespaceHierarchy(array $namespaceHierarchy): array
    {
        return array_merge($namespaceHierarchy, ['MyPlugin']);
    }
}
```
