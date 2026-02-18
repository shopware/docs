---
nav:
  title: Migration Context
  position: 30
---

# Migration Context

The central data structure of Shopware Migration Assistant is the migration context. The migration context contains the following information:

1. The current migration connection, which holds the credentials
2. Current Profile and Gateway instances
3. Identifier of the current run
4. Information on the current processing \([DataSet](dataselection-and-dataset)\)
5. Offset and limit of the current call

```php
// SwagMigrationAssistant\Migration\MigrationContext

class MigrationContext extends Struct implements MigrationContextInterface
{
    final public const SOURCE_CONTEXT = 'MIGRATION_CONNECTION_CHECK_FOR_RUNNING_MIGRATION';

    public function __construct(
        private SwagMigrationConnectionEntity $connection,
        private ?ProfileInterface $profile = null,
        private ?GatewayInterface $gateway = null,
        private ?DataSet $dataSet = null,
        private readonly string $runUuid = '',
        private int $offset = 0,
        private int $limit = 0
    ) {
    }

    public function getProfile(): ProfileInterface
    {
        if ($this->profile === null) {
            throw MigrationException::migrationContextPropertyMissing('profile');
        }

        return $this->profile;
    }

    public function setProfile(ProfileInterface $profile): void
    {
        $this->profile = $profile;
    }

    public function getGateway(): GatewayInterface
    {
        if ($this->gateway === null) {
            throw MigrationException::migrationContextPropertyMissing('gateway');
        }

        return $this->gateway;
    }

    public function setGateway(GatewayInterface $gateway): void
    {
        $this->gateway = $gateway;
    }

    public function getConnection(): SwagMigrationConnectionEntity
    {
        return $this->connection;
    }

    public function setConnection(SwagMigrationConnectionEntity $connection): void
    {
        $this->connection = $connection;
    }

    public function getRunUuid(): string
    {
        return $this->runUuid;
    }

    public function getDataSet(): ?DataSet
    {
        return $this->dataSet;
    }

    public function setDataSet(DataSet $dataSet): void
    {
        $this->dataSet = $dataSet;
    }

    public function getOffset(): int
    {
        return $this->offset;
    }

    public function setOffset(int $offset): void
    {
        $this->offset = $offset;
    }

    public function getLimit(): int
    {
        return $this->limit;
    }

    public function setLimit(int $limit): void
    {
        $this->limit = $limit;
    }
}
```
