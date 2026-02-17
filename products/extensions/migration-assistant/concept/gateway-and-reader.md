---
nav:
  title: Gateway and Reader
  position: 50

---

# Gateway and Reader

## Overview

Users will have to specify a gateway for the connection. The gateway defines the way of communicating with the source system. Behind the user interface, we use `Reader` objects to read the data from the source system. For the `shopware55` profile, we have the `api` gateway, which communicates via http/s with the source system, and the `local` gateway, which communicates directly with the source system's database. Thus both systems must be on the same server to successfully use the `local` gateway.

## Gateway

The gateway defines how to communicate from Shopware 6 with your source system, like Shopware 5. Every profile needs to have at least one gateway. Gateways need to be defined in the corresponding service xml using the `shopware.migration.gateway` tag:

```html
<!-- Shopware Profile Gateways -->
<service id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\ShopwareLocalGateway">
  <argument type="service" id="SwagMigrationAssistant\Migration\Gateway\Reader\ReaderRegistry"/>
  <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\Reader\EnvironmentReader"/>
  <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\Reader\TableReader"/>
  <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Connection\ConnectionFactory"/>
  <argument type="service" id="currency.repository"/>
  <argument type="service" id="language.repository"/>
  <tag name="shopware.migration.gateway" />
</service>

<service id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\ShopwareApiGateway">
  <argument type="service" id="SwagMigrationAssistant\Migration\Gateway\Reader\ReaderRegistry"/>
  <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\EnvironmentReader"/>
  <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\TableReader"/>
  <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\TableCountReader"/>
  <argument type="service" id="currency.repository"/>
  <argument type="service" id="language.repository"/>
  <tag name="shopware.migration.gateway"/>
</service>
```

To use the `ShopwareApiGateway`, you must download the corresponding Shopware 5 plugin [Shopware migration connector](https://github.com/shopware/SwagMigrationConnector) first.

This tag is used by `GatwayRegistry`. This registry loads all tagged gateways and chooses a suitable gateway based on the migration's context and a unique identifier composed of a combination of profile and gateway name:

```php
class GatewayRegistry implements GatewayRegistryInterface
{
    /**
     * @param GatewayInterface[] $gateways
     */
    public function __construct(private readonly iterable $gateways)
    {
    }

    /**
     * @return GatewayInterface[]
     */
    public function getGateways(MigrationContextInterface $migrationContext): array
    {
      // ...
    }

    public function getGateway(MigrationContextInterface $migrationContext): GatewayInterface
    {
      // ...
    }
}
```

See full implementation [GatewayRegistry](https://github.com/shopware/SwagMigrationAssistant/blob/trunk/src/Migration/Gateway/GatewayRegistry.php)

The gateway class has to implement the `GatewayInterface` to support all required methods. As you can see below, the gateway uses the right readers, which internally open a connection to the source system to receive the entity data:

```php
class ShopwareLocalGateway implements ShopwareGatewayInterface
{
    final public const GATEWAY_NAME = 'local';

    /**
     * @param EntityRepository<CurrencyCollection> $currencyRepository
     * @param EntityRepository<LanguageCollection> $languageRepository
     */
    public function __construct(
        private readonly ReaderRegistry $readerRegistry,
        private readonly EnvironmentReaderInterface $localEnvironmentReader,
        private readonly TableReaderInterface $localTableReader,
        private readonly ConnectionFactoryInterface $connectionFactory,
        private readonly EntityRepository $currencyRepository,
        private readonly EntityRepository $languageRepository,
    ) {
    }

    public function getName(): string
    {
        return self::GATEWAY_NAME;
    }

    public function getSnippetName(): string
    {
        return 'swag-migration.wizard.pages.connectionCreate.gateways.shopwareLocal';
    }

    public function supports(ProfileInterface $profile): bool
    {
        return $profile instanceof ShopwareProfileInterface;
    }

    public function read(MigrationContextInterface $migrationContext): array
    {
      // ...
    }

    public function readEnvironmentInformation(MigrationContextInterface $migrationContext, Context $context): EnvironmentInformation
    {
      // ...
    }

    public function readTotals(MigrationContextInterface $migrationContext): array
    {
      // ...
    }

    public function readTable(MigrationContextInterface $migrationContext, string $tableName, array $filter = []): array
    {
      // ...
    }

    /**
     * @param array<string, mixed> $environmentData
     */
    private function generateFingerprint(array $environmentData): ?string
    {
      // ...
    }
}
```

See full implementation [ShopwareLocalGateway](https://github.com/shopware/SwagMigrationAssistant/blob/trunk/src/Profile/Shopware/Gateway/Local/ShopwareLocalGateway.php)