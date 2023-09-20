# Add Custom Document

## Overview

Using the Shopware Administration, you can easily create new documents. This guide will teach you how to achieve the same result, which is creating a new document, using your plugin.

## Prerequisites

This guide is built upon the [plugin base guide](../../plugin-base-guide), but of course you can use those examples with any other plugin.

Furthermore adding a document via your plugin is done by using [plugin database migrations](../../plugin-fundamentals/database-migrations). Since this isn't explained in this guide, you'll have to know and understand the plugin database migrations first.

## Adding a custom document

Documents in Shopware are stored in the database table `document_base_config`. Do not confuse it with the `document` table, which contains the actually generated documents for an order and not the config for them.

Adding a new document is done by adding two entries to the database:

* One entry in the `document_base_config` table, which contains the whole configuration and the documents name
* One or more entries in the `document_base_config_sales_channel` table for each sales channel you want this document to be available

  for

We're doing this via a migration. In the following example migration, a new document named "custom" will be created, which is assigned to the `Storefront` sales channel.

```php
// <plugin root>/src/Migration/Migration1616668698AddDocument.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;

class Migration1616668698AddDocument extends MigrationStep
{
    public function getCreationTimestamp(): int
    {
        return 1616668698;
    }

    public function update(Connection $connection): void
    {
        $documentConfigId = Uuid::randomBytes();
        $documentTypeId = $this->getDocumentTypeId($connection);

        $connection->insert('document_base_config', [
            'id' => $documentConfigId,
            'name' => 'custom',
            'filename_prefix' => 'custom_',
            'global' => 0,
            'document_type_id' => $documentTypeId,
            'config' => $this->getConfig(),
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT)
        ]);

        $storefrontSalesChannelId = $this->getStorefrontSalesChannelId($connection);
        if (!$storefrontSalesChannelId) {
            return;
        }

        $connection->insert('document_base_config_sales_channel', [
            'id' => Uuid::randomBytes(),
            'document_base_config_id' => $documentConfigId,
            'sales_channel_id' => $storefrontSalesChannelId,
            'document_type_id' => $documentTypeId,
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT)
        ]);
    }

    public function updateDestructive(Connection $connection): void
    {
    }

    private function getDocumentTypeId(Connection $connection): string
    {
        $sql = <<<SQL
            SELECT id
            FROM document_type
            WHERE technical_name = "delivery_note"
SQL;
        return $connection->fetchOne($sql);
    }

    private function getConfig(): string
    {
        $config = [
            'displayPrices' => false,
            'displayFooter' => true,
            'displayHeader' => true,
            'displayLineItems' => true,
            'displayLineItemPosition' => true,
            'displayPageCount' => true,
            'displayCompanyAddress' => true,
            'pageOrientation' => 'portrait',
            'pageSize' => 'a4',
            'itemsPerPage' => 10,
            'companyName' => 'Example company',
            'companyAddress' => 'Example company address',
            'companyEmail' => 'custom@example.org'
        ];

        return json_encode($config);
    }

    private function getStorefrontSalesChannelId(Connection $connection): ?string
    {
        $sql = <<<SQL
            SELECT id
            FROM sales_channel
            WHERE type_id = :typeId
SQL;
        $salesChannelId = $connection->fetchOne($sql, [
            ':typeId' => Uuid::fromHexToBytes(Defaults::SALES_CHANNEL_TYPE_STOREFRONT)
        ]);

        if (!$salesChannelId) {
            return null;
        }

        return $salesChannelId;
    }
}
```

So it's basically fetching the "Storefront" sales channel ID, and the document type ID of the "Delivery note" document type and then inserts the necessary entries with some example data.

You'll have to provide a `name` and a `filename_prefix` for your custom document. If you create a new document for e.g. a completely new document type, you might want to set `global` to `1`, so it acts like a fallback. Also make sure to have a look at the `getConfig` method here, since it contains important configurations you can set for your custom document.

Basically, that's it already! You can now browse your Administration and use your newly configured document.

## Next steps

You might wonder "But where do I define my custom template for my custom document?". This is done by adding a new document **type**, which is covered in [this guide](add-custom-document-type).
