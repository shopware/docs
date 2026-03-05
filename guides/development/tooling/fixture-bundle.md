---
nav:
  title: Fixture Bundle
  position: 30

---

# Fixture Bundle

The Fixture Bundle provides a flexible and organized way to load test and demo data into your Shopware 6 application. It's designed to be extensible and easy to use, supporting dependency management, priority-based execution, and group filtering. This guide will walk you through the process of creating and managing data fixtures for your Shopware project.

## Installation

To get started, add the Fixture Bundle to your project using Composer:

```bash
composer require shopware/fixture-bundle:*
```

## Creating a basic fixture

To create a fixture, you need to create a new class that implements the `Shopware\Core\Framework\Test\TestCaseBase\FixtureInterface` and has the `#[Fixture]` attribute.

Here is an example of a simple fixture that creates two product categories:

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Test\Fixture;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Test\TestCaseBase\Fixture;
use Shopware\Core\Framework\Test\TestCaseBase\FixtureInterface;
use Shopware\Core\Framework\Uuid\Uuid;
use Symfony\Component\DependencyInjection\Attribute\Autowire;

#[Fixture(name: 'category')]
class CategoryFixture implements FixtureInterface
{
    public function __construct(
        #[Autowire(service: 'category.repository')]
        private readonly EntityRepository $categoryRepository,
    ) {
    }

    public function load(): void
    {
        $categories = [
            [
                'id' => Uuid::randomHex(),
                'name' => 'Electronics',
                'active' => true,
            ],
            [
                'id' => Uuid::randomHex(),
                'name' => 'Clothing',
                'active' => true,
            ],
        ];

        $this->categoryRepository->create($categories, Context::createDefaultContext());
    }
}
```

### The `Fixture` attribute

The `#[Fixture]` attribute configures the behavior of your fixture and accepts the following parameters:

* **`priority`** (`int`, default: `0`): A higher integer means the fixture will be executed earlier.
* **`dependsOn`** (`array`, default: `[]`): An array of fixture class names that must be executed before this fixture.
* **`groups`** (`array`, default: `['default']`): An array of group names this fixture belongs to. This allows for selective loading of fixtures.

## Commands

The Fixture Bundle comes with two `bin/console` commands to help you manage your fixtures.

### Loading fixtures

To execute your fixtures and load data into the database, use the `fixture:load` command.

* **Load all fixtures:**

    ```bash
    bin/console fixture:load
    ```

* **Load fixtures from a specific group:**
    You can also load a subset of fixtures by specifying a group. This is useful for separating test data from demo data, for example.

    ```bash
    bin/console fixture:load --group=test-data
    ```

### Listing fixtures

To see a list of all available fixtures, their execution order, and their configuration, use the `fixture:list` command.

```bash
bin/console fixture:list
```

This command provides a clear overview of how your fixtures are prioritized and what their dependencies are.

**Example output:**

```text
 Available Fixtures
 ==================

+-------+---------------------+----------+-----------------+---------------------+
| Order | Class               | Priority | Groups          | Depends On          |
+-------+---------------------+----------+-----------------+---------------------+
| 1     | CategoryFixture     | 100      | catalog, test-  | -                   |
|       |                     |          | data            |                     |
| 2     | ManufacturerFixture | 90       | catalog         | -                   |
| 3     | ProductFixture      | 50       | catalog, test-  | CategoryFixture,    |
|       |                     |          | data            | ManufacturerFixture |
| 4     | CustomerFixture     | 0        | customers       | -                   |
+-------+---------------------+----------+-----------------+---------------------+

 [OK] Found 4 fixture(s).
```

## Execution order

The execution order of fixtures is determined by the following rules:

1. **Dependencies**: If a fixture declares dependencies using `dependsOn`, it will always run after its dependencies have been executed.
2. **Priority**: Among fixtures without dependency relationships, those with a higher `priority` value are executed first.
3. **Circular dependency detection**: The system will throw an exception if circular dependencies are detected, preventing infinite loops.

## Specialized fixtures

The Fixture Bundle includes several specialized loaders to simplify common data creation tasks.

### Theme fixtures

The `ThemeFixtureLoader` provides a convenient, fluent interface for configuring theme settings. It automatically handles theme discovery, recompilation, and only applies changes when necessary.

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Test\Fixture;

use Shopware\Core\Framework\Test\TestCaseBase\Fixture;
use Shopware\Core\Framework\Test\TestCaseBase\FixtureInterface;
use Shopware\Storefront\Theme\ThemeDefinition;

#[Fixture(name: 'theme', groups: ['theme-config', 'branding'])]
class ThemeFixture implements FixtureInterface
{
    public function __construct(
        private readonly ThemeFixtureLoader $themeFixtureLoader
    ) {
    }

    public function load(): void
    {
        // Will be uploaded just once and reused based on file content
        $logo = $this->mediaHelper->upload(__DIR__ . '/shop.png', $this->mediaHelper->getDefaultFolder(ThemeDefinition::ENTITY_NAME)->getId());

        $this->themeFixtureLoader->apply(
            (new ThemeFixtureDefinition('Shopware default theme'))
                ->config('sw-color-brand-primary', '#ff6900')
                ->config('sw-border-radius-default', '8px')
                ->config('sw-font-family-base', '"Inter", sans-serif')
                ->config('sw-logo-desktop', $logo)
        );
    }
}
```

### Custom field fixtures

The `CustomFieldSetFixtureLoader` helps you create and manage custom field sets and their associated custom fields for different entities.

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Test\Fixture;

use Shopware\Core\Framework\Test\TestCaseBase\Fixture;
use Shopware\Core\Framework\Test\TestCaseBase\FixtureInterface;
use Shopware\Core\System\CustomField\CustomFieldTypes;

#[Fixture(name: 'custom-field')]
class CustomFieldFixture implements FixtureInterface
{
    public function __construct(
        private readonly CustomFieldSetFixtureLoader $customFieldSetFixtureLoader
    ) {
    }

    public function load(): void
    {
        $this->customFieldSetFixtureLoader->apply(
            (new CustomFieldSetFixtureDefinition('Product Specifications', 'product_specs'))
                ->relation('product')
                ->field(
                    (new CustomFieldFixtureDefinition('weight', CustomFieldTypes::FLOAT))
                        ->label('en-GB', 'Weight (kg)')
                        ->label('de-DE', 'Gewicht (kg)')
                )
                ->field(
                    (new CustomFieldFixtureDefinition('warranty_period', CustomFieldTypes::INT))
                        ->label('en-GB', 'Warranty Period (months)')
                )
        );
    }
}
```

### Customer fixtures

The `CustomerFixtureLoader` offers a comprehensive way to create customers with addresses, custom fields, and other properties. The loader uses the email address as a unique identifier, updating existing customers if a match is found.

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Test\Fixture;

use Shopware\Core\Framework\Test\TestCaseBase\Fixture;
use Shopware\Core\Framework\Test\TestCaseBase\FixtureInterface;

#[Fixture(name: 'customer', groups: ['customers', 'addresses'])]
class CustomerFixture implements FixtureInterface
{
    public function __construct(
        private readonly CustomerFixtureLoader $customerFixtureLoader
    ) {
    }

    public function load(): void
    {
        $this->customerFixtureLoader->apply(
            (new CustomerFixtureDefinition('max.mustermann@example.com'))
                ->firstName('Max')
                ->lastName('Mustermann')
                ->salutation('mr')
                ->password('password')
                ->defaultBillingAddress([
                    'firstName' => 'Max',
                    'lastName' => 'Mustermann',
                    'street' => 'Musterstraße 123',
                    'zipcode' => '12345',
                    'city' => 'Musterstadt',
                    'country' => 'DEU',
                ])
                ->addAddress('work', [
                    'firstName' => 'Max',
                    'lastName' => 'Mustermann',
                    'street' => 'Office Street 789',
                    'zipcode' => '11111',
                    'city' => 'Business City',
                    'country' => 'DEU',
                ])
        );
    }
}
```

## Best practices

* **Meaningful Names**: Give your fixture classes clear, descriptive names.
* **Organize with Groups**: Use groups like `test-data`, `demo-data`, or `performance-test` to categorize fixtures.
* **Declare Dependencies**: Explicitly declare dependencies to ensure a predictable and correct execution order.
* **Focused Fixtures**: Each fixture should have a single, clear responsibility.
* **Idempotent Design**: Fixtures should be possible to run multiple times without causing errors or creating duplicate data.
* **Use Dependency Injection**: Inject services into your fixture's constructor instead of fetching them from the container.

By following these guidelines, you can build a robust and maintainable set of data fixtures for your Shopware project.
