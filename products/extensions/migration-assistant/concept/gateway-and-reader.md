# Gateway and Reader

## Overview

Users will have to specify a gateway for the connection. The gateway defines the way of communicating with the source system. Behind the user interface, we use `Reader` objects to read the data from the source system. For the `shopware55` profile, we have the `api` gateway, which communicates via http/s with the source system, and the `local` gateway, which communicates directly with the source system's database. Thus both systems must be on the same server to successfully use the `local` gateway.

## Gateway

The gateway defines how to communicate from Shopware 6 with your source system, like Shopware 5. Every profile needs to have at least one gateway. Gateways need to be defined in the corresponding service xml using the `shopware.migration.gateway` tag:

```html
<!-- Shopware Profile Gateways -->
<service id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\ShopwareLocalGateway">
    <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\ReaderRegistry" />
    <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\Reader\EnvironmentReader" />
    <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Local\Reader\TableReader" />
    <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Connection\ConnectionFactory" />
    <argument type="service" id="currency.repository"/>
    <tag name="shopware.migration.gateway" />
</service>

<service id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\ShopwareApiGateway">
    <argument type="service" id="SwagMigrationAssistant\Migration\Gateway\Reader\ReaderRegistry"/>
    <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\EnvironmentReader" />
    <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\TableReader" />
    <argument type="service" id="SwagMigrationAssistant\Profile\Shopware\Gateway\Api\Reader\TableCountReader" />
    <argument type="service" id="currency.repository"/>
    <tag name="shopware.migration.gateway" />
</service>
```

To use the `ShopwareApiGateway`, you must download the corresponding Shopware 5 plugin [Shopware migration connector](https://github.com/shopware/SwagMigrationConnector) first.

This tag is used by `GatwayRegistry`. This registry loads all tagged gateways and chooses a suitable gateway based on the migration's context and a unique identifier composed of a combination of profile and gateway name:

```php
<?php declare(strict_types=1);

namespace SwagMigrationAssistant\Migration\Gateway;

use SwagMigrationAssistant\Exception\MigrationContextPropertyMissingException;
use SwagMigrationAssistant\Exception\GatewayNotFoundException;
use SwagMigrationAssistant\Migration\MigrationContextInterface;

class GatewayRegistry implements GatewayRegistryInterface
{
    /**
     * @var GatewayInterface[]
     */
    private iterable $gateways;

    /**
     * @param GatewayInterface[] $gateways
    */
    public function __construct(iterable $gateways)
    {
        $this->gateways = $gateways;
    }

    /**
     * @throws GatewayNotFoundException
     *
     * @return GatewayInterface[]
     */
    public function getGateways(MigrationContextInterface $migrationContext): array
    {
        $gateways = [];
        foreach ($this->gateways as $gateway) {
            if ($gateway->supports($migrationContext)) {
                $gateways[] = $gateway;
            }
        }

        return $gateways;
    }

    /**
     * @throws GatewayNotFoundException
     */
    public function getGateway(MigrationContextInterface $migrationContext): GatewayInterface
    {
        $connection = $migrationContext->getConnection();
        if ($connection === null) {
            throw new MigrationContextPropertyMissingException('Connection');
        }

        $profileName = $connection->getProfileName();
        $gatewayName = $connection->getGatewayName();

        foreach ($this->gateways as $gateway) {
            if ($gateway->supports($migrationContext) && $gateway->getName() === $gatewayName) {
                return $gateway;
            }
        }

        throw new GatewayNotFoundException($profileName . '-' . $gatewayName);
    }
}
```

The gateway class has to implement the `GatewayInterface` to support all required methods. As you can see below, the gateway uses the right readers, which internally open a connection to the source system to receive the entity data:

```php
<?php declare(strict_types=1);

namespace SwagMigrationAssistant\Profile\Shopware\Gateway\Local;

use Shopware\Core\Defaults;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepositoryInterface;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\System\Currency\CurrencyEntity;
use SwagMigrationAssistant\Migration\EnvironmentInformation;
use SwagMigrationAssistant\Migration\Gateway\Reader\EnvironmentReaderInterface;
use SwagMigrationAssistant\Migration\Gateway\Reader\ReaderRegistry;
use SwagMigrationAssistant\Migration\MigrationContextInterface;
use SwagMigrationAssistant\Migration\RequestStatusStruct;
use SwagMigrationAssistant\Profile\Shopware\Exception\DatabaseConnectionException;
use SwagMigrationAssistant\Profile\Shopware\Gateway\Connection\ConnectionFactoryInterface;
use SwagMigrationAssistant\Profile\Shopware\Gateway\ShopwareGatewayInterface;
use SwagMigrationAssistant\Profile\Shopware\Gateway\TableReaderInterface;
use SwagMigrationAssistant\Profile\Shopware\ShopwareProfileInterface;

class ShopwareLocalGateway implements ShopwareGatewayInterface
{
    public const GATEWAY_NAME = 'local';

    private ReaderRegistry $readerRegistry;

    private EnvironmentReaderInterface $localEnvironmentReader;

    private TableReaderInterface $localTableReader;

    private ConnectionFactoryInterface $connectionFactory;

    private EntityRepositoryInterface $currencyRepository;

    public function __construct(
        ReaderRegistry $readerRegistry,
        EnvironmentReaderInterface $localEnvironmentReader,
        TableReaderInterface $localTableReader,
        ConnectionFactoryInterface $connectionFactory,
        EntityRepositoryInterface $currencyRepository
    ) {
        $this->readerRegistry = $readerRegistry;
        $this->localEnvironmentReader = $localEnvironmentReader;
        $this->localTableReader = $localTableReader;
        $this->connectionFactory = $connectionFactory;
        $this->currencyRepository = $currencyRepository;
    }

    public function getName(): string
    {
        return self::GATEWAY_NAME;
    }

    public function getSnippetName(): string
    {
        return 'swag-migration.wizard.pages.connectionCreate.gateways.shopwareLocal';
    }

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface;
    }

    public function read(MigrationContextInterface $migrationContext): array
    {
        $reader = $this->readerRegistry->getReader($migrationContext);

        return $reader->read($migrationContext);
    }

    public function readEnvironmentInformation(MigrationContextInterface $migrationContext, Context $context): EnvironmentInformation
    {
        $connection = $this->connectionFactory->createDatabaseConnection($migrationContext);
        $profile = $migrationContext->getProfile();

        if ($connection === null) {
            $error = new DatabaseConnectionException();

            return new EnvironmentInformation(
                $profile->getSourceSystemName(),
                $profile->getVersion(),
                '-',
                [],
                [],
                new RequestStatusStruct($error->getErrorCode(), $error->getMessage())
            );
        }

        try {
            $connection->connect();
        } catch (\Exception $e) {
            $error = new DatabaseConnectionException();

            return new EnvironmentInformation(
                $profile->getSourceSystemName(),
                $profile->getVersion(),
                '-',
                [],
                [],
                new RequestStatusStruct($error->getErrorCode(), $error->getMessage())
            );
        }
        $connection->close();
        $environmentData = $this->localEnvironmentReader->read($migrationContext);

        /** @var CurrencyEntity $targetSystemCurrency */
        $targetSystemCurrency = $this->currencyRepository->search(new Criteria([Defaults::CURRENCY]), $context)->get(Defaults::CURRENCY);
        if (!isset($environmentData['defaultCurrency'])) {
            $environmentData['defaultCurrency'] = $targetSystemCurrency->getIsoCode();
        }

        $totals = $this->readTotals($migrationContext, $context);

        return new EnvironmentInformation(
            $profile->getSourceSystemName(),
            $profile->getVersion(),
            $environmentData['host'],
            $totals,
            $environmentData['additionalData'],
            new RequestStatusStruct(),
            false,
            [],
            $targetSystemCurrency->getIsoCode(),
            $environmentData['defaultCurrency']
        );
    }

    public function readTotals(MigrationContextInterface $migrationContext, Context $context): array
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
}
```
