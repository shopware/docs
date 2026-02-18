---
nav:
  title: Media Processing
  position: 90
---

# Media Processing

Media migration runs in two phases:

1. During conversion, create the media mapping and queue file metadata in `swag_migration_media_file`.
2. During the media-processing step, a gateway-specific processor imports the files into Shopware 6.

## Queue Media Files During Conversion

The converter writes the media mapping and queues one media file record for later processing.

```php
// SwagMigrationAssistant\Profile\Shopware\Converter\MediaConverter

abstract class MediaConverter extends ShopwareConverter
{
    // ...

    public function convert(array $data, Context $context, MigrationContextInterface $migrationContext): ConvertStruct
    {
        $this->generateChecksum($data);

        // ...

        $this->mainMapping = $this->mappingService->getOrCreateMapping(
            $migrationContext->getConnection()->getId(),
            DefaultEntities::MEDIA,
            $data['id'],
            $context,
            $this->checksum
        );

        $converted['id'] = $this->mainMapping['entityId'];

        // ...

        $this->mediaFileService->saveMediaFile([
            'runId' => $migrationContext->getRunUuid(),
            'entity' => MediaDataSet::getEntity(),
            'uri' => $data['uri'] ?? $data['path'],
            'fileName' => $data['name'] ?? $converted['id'],
            'fileSize' => (int) $data['file_size'],
            'mediaId' => $converted['id'],
        ]);

        // ...

        $this->updateMainMapping($migrationContext, $context);

        return new ConvertStruct($converted, $data, $this->mainMapping['id']);
    }
}
```

`MediaFileService` persists these records and marks them as `written` once the related entity write completed.

## Processor Selection

The media processing step resolves one processor via `supports(...)` for the current migration context.

```php
// SwagMigrationAssistant\Migration\Media\MediaFileProcessorRegistry

class MediaFileProcessorRegistry implements MediaFileProcessorRegistryInterface
{
    // ...

    public function getProcessor(MigrationContextInterface $migrationContext): MediaFileProcessorInterface
    {
        foreach ($this->processors as $processor) {
            if ($processor->supports($migrationContext)) {
                return $processor;
            }
        }

        $connection = $migrationContext->getConnection();

        throw MigrationException::processorNotFound(
            $connection->getProfileName(),
            $connection->getGatewayName()
        );
    }
}
```

## API Gateway Processing

For API migrations, `HttpMediaDownloadService` uses the shared `HttpDownloadServiceBase` workflow.

```php
// SwagMigrationAssistant\Profile\Shopware\Media\HttpMediaDownloadService

class HttpMediaDownloadService extends HttpDownloadServiceBase
{
    // ...

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface
            && $migrationContext->getGateway()->getName() === ShopwareApiGateway::GATEWAY_NAME
            && $this->getDataSetEntity($migrationContext) === MediaDataSet::getEntity();
    }

    protected function getMediaEntity(): string
    {
        return DefaultEntities::MEDIA;
    }

    protected function getHttpClient(MigrationContextInterface $migrationContext): ?HttpClientInterface
    {
        return new HttpSimpleClient();
    }
}
```

```php
// SwagMigrationAssistant\Migration\Media\Processor\HttpDownloadServiceBase

abstract class HttpDownloadServiceBase extends BaseMediaService implements MediaFileProcessorInterface
{
public function process(MigrationContextInterface $migrationContext, Context $context, array $workload): array
{
    $mappedWorkload = [];

    foreach ($workload as $work) {
        $mappedWorkload[$work->getMediaId()] = $work;
    }

    // ...

    $media = $this->getMediaFiles(array_keys($mappedWorkload), $migrationContext->getRunUuid());
    $client = $this->getHttpClient($migrationContext);

    // ...

    $promises = $this->doMediaDownloadRequests($migrationContext, $media, $mappedWorkload, $client);
    $results = Utils::settle($promises)->wait();

    $finishedUuids = [];
    $failureUuids = [];

    // ...

    $this->setProcessedFlag($migrationContext->getRunUuid(), $context, $finishedUuids, $failureUuids);

    return array_values($mappedWorkload);
}
```

## Local Gateway Processing

For local migrations, `LocalMediaProcessor` resolves local file paths and copies files into Shopware media storage.

```php
// SwagMigrationAssistant\Profile\Shopware\Media\LocalMediaProcessor

class LocalMediaProcessor extends BaseMediaService implements MediaFileProcessorInterface
{
    // ...

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface
            && $migrationContext->getGateway()->getName() === ShopwareLocalGateway::GATEWAY_NAME
            && $this->getDataSetEntity($migrationContext) === MediaDataSet::getEntity();
    }

    public function process(MigrationContextInterface $migrationContext, Context $context, array $workload): array
    {
        $mappedWorkload = [];
        foreach ($workload as $work) {
            $mappedWorkload[$work->getMediaId()] = $work;
        }

        $media = $this->getMediaFiles(\array_keys($mappedWorkload), $migrationContext->getRunUuid());
        $mappedWorkload = $this->getMediaPathMapping($media, $mappedWorkload, $migrationContext);

        return $this->copyMediaFiles($media, $mappedWorkload, $migrationContext, $context);
    }
}
```

## Media File Status Flags

`swag_migration_media_file` tracks processing state with these fields:

- `written`: the related entity write finished.
- `processed`: the media file import succeeded.
- `processFailure` (`process_failure` column): media processing failed for this record.
