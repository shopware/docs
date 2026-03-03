---
nav:
  title: Gateway and Reader
  position: 50
---

# Gateway and Reader

## Overview

Users will have to specify a gateway for the connection. The gateway defines the way of communicating with the source system. Behind the user interface, we use `Reader` objects to read the data from the source system. For the `shopware55` profile, we have the `api` gateway, which communicates via HTTP/S with the source system, and the `local` gateway, which communicates directly with the source system's database. Thus both systems must be on the same server to successfully use the `local` gateway.

## Gateway

The gateway defines how to communicate from Shopware 6 with your source system, like Shopware 5. Every profile needs to have at least one gateway. Gateways need to be defined in the corresponding service.xml using the `shopware.migration.gateway` tag:

```html
<service id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\ShopwareLocalGateway">
  <!-- ... -->
  <tag name="shopware.migration.gateway" />
</service>

<service id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\ShopwareApiGateway">
  <!-- ... -->
  <tag name="shopware.migration.gateway"/>
</service>
```

To use the `ShopwareApiGateway`, you must download the corresponding Shopware 5 plugin [Shopware Migration Connector](https://github.com/shopware/SwagMigrationConnector) first.

This tag is used by `GatewayRegistry`. This registry loads all tagged gateways, filters them by profile support and selects the active gateway from the connection's profile/gateway combination:

```php
// SwagMigrationAssistant\Migration\Gateway\GatewayRegistry

class GatewayRegistry implements GatewayRegistryInterface
{
    public function __construct(private readonly iterable $gateways)
    {
    }

    public function getGateways(MigrationContextInterface $migrationContext): array
    {
        $profile = $migrationContext->getProfile();

        $gateways = [];
        foreach ($this->gateways as $gateway) {
            if ($gateway->supports($profile)) {
                $gateways[] = $gateway;
            }
        }

        return $gateways;
    }

    public function getGateway(MigrationContextInterface $migrationContext): GatewayInterface
    {
        $connection = $migrationContext->getConnection();
        $profileName = $connection->getProfileName();
        $gatewayName = $connection->getGatewayName();

        foreach ($this->gateways as $gateway) {
            if ($gateway->supports($migrationContext->getProfile()) && $gateway->getName() === $gatewayName) {
                return $gateway;
            }
        }

        throw MigrationException::gatewayNotFound($profileName, $gatewayName);
    }
}
```

The gateway class has to implement the `GatewayInterface` to support all required methods. As you can see below, the gateway uses the right readers, which internally open a connection to the source system to receive the entity data:

```php
// SwagMigrationAssistant\Profile\Shopware\Gateway\Local\ShopwareLocalGateway

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
        $reader = $this->readerRegistry->getReader($migrationContext);

        return $reader->read($migrationContext);
    }

    public function readEnvironmentInformation(MigrationContextInterface $migrationContext, Context $context): EnvironmentInformation
    {
        // ...

        $environmentData = $this->localEnvironmentReader->read($migrationContext);

        $targetSystemCurrency = $this->currencyRepository->search(new Criteria([Defaults::CURRENCY]), $context)->get(Defaults::CURRENCY);

        // ...

        $totals = $this->readTotals($migrationContext);

        return new EnvironmentInformation(
          // ...
        );
    }

    public function readTotals(MigrationContextInterface $migrationContext): array
    {
        $readers = $this->readerRegistry->getReaderForTotal($migrationContext);

        $totals = [];
        foreach ($readers as $reader) {
            $total = $reader->readTotal($migrationContext);

            if ($total === null) {
                continue;
            }

            $totals[$total->getEntityName()] = $total;
        }

        return $totals;
    }

    public function readTable(MigrationContextInterface $migrationContext, string $tableName, array $filter = []): array
    {
        return $this->localTableReader->read($migrationContext, $tableName, $filter);
    }

    private function generateFingerprint(array $environmentData): ?string
    {
        // ...

        return Hasher::hash($config['esdKey'] . $config['installationDate']);
    }
}
```
