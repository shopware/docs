---
nav:
  title: Extending the Storefront
  position: 70

---

# How to Extend the Storefront (Shopware 6)

In order to be able to extend the templates of the B2B Suite with another plugin, you have to make sure to register a `TemplateNamespaceHierarchyBuilder` in your plugin.

## Registering a TemplateNamespaceHierarchyBuilder

Register the `TemplateNamespaceHierarchyBuilder` by tagging it in the `services.php` file of your plugin.

```php
// <plugin root>/src/Resources/config/services.php
<?php declare(strict_types=1);

use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;
use MyPlugin\Framework\Adapter\Twig\NamespaceHierarchy\TemplateNamespaceHierarchyBuilder;

return static function (ContainerConfigurator $configurator): void {
    $services = $configurator->services();

    $services->set(TemplateNamespaceHierarchyBuilder::class)
        ->tag('shopware.twig.hierarchy_builder', ['priority' => 750]);
};
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
