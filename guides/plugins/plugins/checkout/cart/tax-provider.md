# Tax provider

## Overview

Tax calculations differ from country to country. Especially in the US, the sales tax calculation can be tedious, as the laws and regulation differ from state to state or even county or certain city taxes can apply. Therefore, most shops use a third-party service (so called tax providers) to calculate sales taxes for them.

Starting with version 6.5.0.0, Shopware allows plugins to integrate custom tax calculation, which could include an automatic tax calculation with a tax provider. A plugin should provide a class extending the `Shopware\Core\Checkout\Cart\TaxProvider\AbstractTaxProvider`, which is called during checkout and provide new tax rates.

## Prerequisites

As most guides, this guide is also built upon our [plugin base guide](../../plugin-base-guide.md), but it's not mandatory to use exactly that plugin as a foundation. The examples in this guide use the namespace however.

## Creating a tax provider

First of all, we need to create a class which handles the tax calculation or calls your preferred tax provider.

For an easy start, extend your class from `Shopware\Core\Checkout\Cart\TaxProvider\AbstractTaxProvider` and implement the `provide` method.

You probably want to call a tax provider, which will calculate the taxes for you. In our case, we simply apply a hefty 50% tax rate for all line-items in the cart.

{% code title="<plugin root>/src/Checkout/Cart/Tax/TaxProvider.php" %}

```php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Checkout\Cart\Tax;

use Shopware\Core\Checkout\Cart\Cart;
use Shopware\Core\Checkout\Cart\LineItem\LineItem;
use Shopware\Core\Checkout\Cart\Tax\Struct\CalculatedTax;
use Shopware\Core\Checkout\Cart\Tax\Struct\CalculatedTaxCollection;
use Shopware\Core\Checkout\Cart\TaxProvider\AbstractTaxProvider;
use Shopware\Core\Checkout\Cart\TaxProvider\Struct\TaxProviderResult;
use Shopware\Core\System\SalesChannel\SalesChannelContext;
use TaxJar\Client;

class TaxProvider extends AbstractTaxProvider
{
    public function provide(Cart $cart, SalesChannelContext $context): TaxProviderResult
    {
        $lineItemTaxes = [];
    
        foreach ($cart->getLineItems() as $lineItem) {
            $taxRate = 50;
            $price = $lineItem->getPrice()->getTotalPrice();
            $tax = $price * $taxRate / 100;

            // shopware will look for the `uniqueIdentifier` property of the lineItem to identify this lineItem even in nested-line-item structures
            $lineItemTaxes[$lineItem->getUniqueIdentifier()] = new CalculatedTaxCollection(
                [
                    new CalculatedTax($tax, $taxRate, $price),
                ]
            );
        }
        
        // you could do the same for deliveries
        // $deliveryTaxes = []; // use the id of the delivery position as keys, if you want to transmit delivery taxes
        
        // foreach ($cart->getDeliveries() as $delivery) {
        //     foreach ($delivery->getPositions() as $position) {
        //         $deliveryTaxes[$delivery->getId()] = new CalculatedTaxCollection(...);
        //         ...
        //     }
        // }
        
        // If you call a tax provider, you will probably get calculated tax sums for the whole cart
        // Use the cartPriceTaxes to let Shopware show the correct sums in the checkout
        // If omitted, Shopware will try to calculate the tax sums itself
        // $cartPriceTaxes = [];
        
        return new TaxProviderResult(
            $lineItemTaxes,
            // $deliveryTaxes,
            // $cartPriceTaxes
        );
    }
}

```

{% endcode %}

## Registering the tax provider in the DI container

After you've created your tax provider, you need to register it in the DI container. To do so, you need to create a new service in the `services.xml` file and tag the service as `shopware.tax.provider`.

{% code title="<plugin root>/src/Resources/config/services.xml" %}

```markup
<?xml version="1.0" ?>

<container xmlns="http://symfony.com/schema/dic/services"
           xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
           xsi:schemaLocation="http://symfony.com/schema/dic/services http://symfony.com/schema/dic/services/services-1.0.xsd">

    <services>
        <service id="Swag\BasicExample\Checkout\Cart\Tax\TaxProvider">
            <tag name="shopware.tax.provider" />
        </service>
    </services>
```

{% endcode %}

## Migrate your tax provider to the database

To let Shopware know of your new tax provider, you will have to persist it to the database.

You can either to do so via a migration or the entity repository.

### Via migration

You may want to have a look at the [migration guide](../../plugin-fundamentals/database-migrations.md) to learn more about migrations.

{% code title="<plugin root>/src/Migration/MigrationTaxProvider.php" %}

```php
<?php declare(strict_types=1);

namespace SwagTaxProviders\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\System\TaxProvider\Aggregate\TaxProviderTranslation\TaxProviderTranslationDefinition;
use Shopware\Core\System\TaxProvider\TaxProviderDefinition;

class MigrationTaxProvider extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1662366151;
    }

    public function update(Connection $connection): void
    {
        $ruleId = $connection->fetchOne(
            'SELECT `id` FROM `rule` WHERE `name` = :name',
            ['name' => 'Always valid (Default)']
        );

        $id = Uuid::randomBytes();

        $connection->insert(TaxProviderDefinition::ENTITY_NAME, [
            'id' => $id,
            'identifier' => Swag\BasicExample\Checkout\Cart\Tax\TaxProvider::class, // your tax provider class
            'active' => true,
            'priority' => 1,
            'availability_rule_id' => $ruleId,
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
        ]);
    }

    public function updateDestructive(Connection $connection): void
    {
    }
}
```

{% endcode %}

### Via repository

You may want to have a look at the [repository guide](../../../../../concepts/framework/data-abstraction-layer#crud-operations) to learn more about on how to use the entity repository to manipulate data.

A good place for persisting your tax provider to the database would be the `install` lifecycle method of your plugin.

If you do not know of plugin lifecycle methods yet, please refer to our [plugin lifecycle guide](../../plugin-fundamentals/plugin-lifecycle.md).

{% code title="<plugin root>/src/BasicExample.php" %}

```php
<?php declare(strict_types=1);

namespace SwagBasicExample;

use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Filter\EqualsFilter;
use Shopware\Core\Framework\Plugin;
use Shopware\Core\Framework\Plugin\Context\InstallContext;
use Shopware\Core\Framework\Uuid\Uuid;

class SwagBasicExample extends Plugin
{
    public function install(InstallContext $installContext): void
    {
        $ruleRepo = $this->container->get('rule.repository');

        // create a rule, which will be used to determine the availability of your tax provider
        // do not rely on specific rules to be always present
        $rule = $ruleRepo->create([
            [
                'name' => 'Cart > 0',
                'priority' => 0,
                'conditions' => [
                    [
                        'type' => 'cart.cartAmount',
                        'operator' => '>=',
                        'value' => 0,
                    ],
                ],
            ],
        ], $installContext->getContext());
        
        $criteria = new Criteria();
        $criteria->addFilter(
            new EqualsFilter('name', 'Cart > 0')
        );

        $ruleId = $ruleRepo->searchIds($criteria, $installContext->getContext())->firstId();

        $taxRepo = $this->container->get('tax_provider.repository');
        $taxRepo->create([
            [
                'id' => Uuid::randomHex(),
                'identifier' => Swag\BasicExample\Checkout\Cart\Tax\TaxProvider::class,
                'priority' => 1,
                'active' => false, // activate this via the `activate` lifecycle method
                'availabilityRuleId' => $ruleId,
            ],
        ], $installContext->getContext());
    }
    
    // do not forget to add an `uninstall` method, which removes your tax providers, when the plugin is uninstalled
    // you also may want to add the `activate` and `deactivate` methods to activate and deactivate the tax providers
}

```

{% endcode %}

You should now see the new tax provider showing up in the Administration in `Settings > Tax`, where you can change the active state, priority and availability rule manually.
