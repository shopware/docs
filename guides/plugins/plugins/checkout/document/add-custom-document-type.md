---
nav:
  title: Add custom document type
  position: 20

---

# Add Custom Document Type

## Overview

Using the Shopware Administration, you can easily create new documents. This guide will teach you how to achieve the same result, which is creating a new document, using your plugin.

## Prerequisites

This guide is built upon the [plugin base guide](../../plugin-base-guide), but of course you can use those examples with any other plugin.

Furthermore adding a custom document type via your plugin is done by using [plugin database migrations](../../plugin-fundamentals/database-migrations). Since this isn't explained in this guide, you'll have to know and understand the plugin database migrations first.

## Adding a custom document type to the database

Let's start with adding your custom document type to the database, so it's actually available for new document configurations. This is done by adding a plugin database migration. To be precise, we need to add an entry to the database table `document_type` table and an entry for each supported language to the `document_type_translation` table.

Let's have a look at an example migration:

```php
// <plugin root>/src/Migration/Migration1616677952AddDocumentType.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Migration\Traits\ImportTranslationsTrait;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\Migration\Traits\Translations;

class Migration1616677952AddDocumentType extends MigrationStep
{
    use ImportTranslationsTrait;

    public function getCreationTimestamp(): int
    {
        return 1616677952;
    }

    public function update(Connection $connection): void
    {
        $documentTypeId = Uuid::randomBytes();

        $connection->insert('document_type', [
            'id' => $documentTypeId,
            'technical_name' => 'example',
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT)
        ]);

        $this->addTranslations($connection, $documentTypeId);
    }

    public function updateDestructive(Connection $connection): void
    {
    }

    private function addTranslations(Connection $connection, string $documentTypeId): void
    {
        $englishName = 'Example document type name';
        $germanName = 'Beispiel Dokumententyp Name';

        $documentTypeTranslations = new Translations(
            [
                'document_type_id' => $documentTypeId,
                'name' => $germanName,
            ],
            [
                'document_type_id' => $documentTypeId,
                'name' => $englishName,
            ]
        );

        $this->importTranslation(
            'document_type_translation',
            $documentTypeTranslations,
            $connection
        );
    }
}
```

So first of all we're creating the new document type with the `technical_name` "example". Make sure to save the ID here, since you're going to need it for the following translations.

Afterwards we're inserting the translations, one for German, one for English. For this we're using the `Shopware\Core\Migration\Traits\ImportTranslationsTrait`, which adds the helper method `importTranslation`. There you have to supply the translation table and an instance of `Shopware\Core\Migration\Traits\Translations`. The latter accepts two constructor parameters:

* An array of German translations, plus the respective ID column
* An array of English translations, plus the respective ID column

  It will then take care of properly inserting those translations.

After installing your plugin, your new document type should be available in the Administration. However, it wouldn't work yet, since every document type has to come with a respective `DocumentGeneratorInterface`. This is covered in the next section.

## Adding a generator

The generator for a document type is responsible for actually generating the respective document, including a template. That's why we'll have to create a custom generator for the new type as well, we'll call it `ExampleDocumentGenerator`.

We'll place it in the same directory like all other default document generators: `<plugin root>/src/Core/Checkout/Document/DocumentGenerator`

Your custom document generator has to implement the `Shopware\Core\Checkout\Document\DocumentGenerator\DocumentGeneratorInterface`, which forces you to implement two more methods:

* `supports`: Has to return a string of the document type it supports. We named our document type "example", so our generator has to return "example".
* `generate`: This needs to return the actually rendered template as a string. You will have access to the respective order, the document configuration,

  the context and the optional template path.

* `getFileName`: Return the file name here. This is basically the same for all generators, but if you want to do custom stuff

  with the file name, this is the place to go.

Furthermore your generator has to be registered to the [service container](../../plugin-fundamentals/dependency-injection) using the tag `document.generator`.

Let's have a look at an example generator:

```php
// <plugin root>/src/Core/Checkout/Document/DocumentGenerator/ExampleDocumentGenerator.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document\DocumentGenerator;

use Shopware\Core\Checkout\Document\DocumentConfiguration;
use Shopware\Core\Checkout\Document\DocumentConfigurationFactory;
use Shopware\Core\Checkout\Document\DocumentGenerator\DocumentGeneratorInterface;
use Shopware\Core\Checkout\Document\Twig\DocumentTemplateRenderer;
use Shopware\Core\Checkout\Order\OrderEntity;
use Shopware\Core\Framework\Context;
use Twig\Error\Error;

class ExampleDocumentGenerator implements DocumentGeneratorInterface
{
    public const DEFAULT_TEMPLATE = '@SwagBasicExample/documents/example_document.html.twig';
    public const EXAMPLE_DOC = 'example';

    private string $rootDir;

    private DocumentTemplateRenderer $documentTemplateRenderer;

    public function __construct(DocumentTemplateRenderer $documentTemplateRenderer, string $rootDir)
    {
        $this->rootDir = $rootDir;
        $this->documentTemplateRenderer = $documentTemplateRenderer;
    }

    public function supports(): string
    {
        return self::EXAMPLE_DOC;
    }

    /**
     * @throws Error
     */
    public function generate(OrderEntity $order, DocumentConfiguration $config, Context $context, ?string $templatePath = null): string
    {
        $templatePath = $templatePath ?? self::DEFAULT_TEMPLATE;

        return $this->documentTemplateRenderer->render($templatePath, [
            'order' => $order,
            'config' => DocumentConfigurationFactory::mergeConfiguration($config, new DocumentConfiguration())->jsonSerialize(),
            'rootDir' => $this->rootDir,
            'context' => $context,
        ], $context, $order->getSalesChannelId(), $order->getLanguageId(), $order->getLanguage()->getLocale()->getCode());
    }

    public function getFileName(DocumentConfiguration $config): string
    {
        return $config->getFilenamePrefix() . $config->getDocumentNumber() . $config->getFilenameSuffix();
    }
}
```

First of all we're injecting the `rootDir` of the Shopware installation into our generator, since we'll need that for rendering our template, and the `DocumentTemplateRenderer`, which will do the template rendering.

The `supports` method just returns the string "example", which is the technical name of our new document type. The `getFileName` method is very default - it just builds a string consisting of the file name prefix, that you configured, the current document number and the file name suffix.

Now let's have a look at the `generate` method. Technically it's possible to apply a custom template path, which is why this is an optional parameter, which we have to check for. Yet, it can't be defined in the Administration and will most likely be empty. We're using a default template path here, which has to point to a template file for our new document type. This can be an existing default document template, in that case you can use them via the following path: `@Framework/documents/delivery_note.html.twig`

In this example we're rendering a custom template though, which we will have a short look at in the next section.

Afterwards we're using the previously injected `DocumentTemplateRenderer` to actually render and return the template at the said template path.

### Adding a document type template

Let's have a quick look at an example document type template. Go ahead and create a new file at the path `<plugin root>/src/Resources/views/documents/example_document.html.twig`.

In there you should extend from the default document base template:

```twig
// <plugin root>/src/Resources/views/documents/example\_document.html.twig
{% sw_extends '@Framework/documents/base.html.twig' %}
```

This could be it already. The [base.html.twig](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Framework/Resources/views/documents/base.html.twig) template comes with a lot of default templating, which you can now override by using blocks. If you don't know how that's done, have a look at our guide regarding [customizing templates](../../storefront/customize-templates).

## Adding a number range

You're almost done here. You've got a new document type in the database, a generator for your new document type and it even uses a custom template. However, you also need to add a new number range for your documents, otherwise a new number for your documents wouldn't be generated.

Adding a new number range is also done by using a [plugin database migration](../../plugin-fundamentals/database-migrations).

For this we need a few more things:

* An entry in `number_range_type`, which is just a new type of a number range with a technical name
* An entry in `number_range`, which represents a properly configured number range, which then will use the previously created type
* An entry in `number_range_sales_channel` to assign a sales channel to our configured number range
* An entry for each language in the tables `number_range_translation` and `number_range_type_translation`

Sounds like a lot, but having a look at an example migration, you will notice that it's not too much of a hassle.

```php
// <plugin root>/src/Migration/Migration1616974646AddDocumentNumberRange.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Migration;

use Doctrine\DBAL\Connection;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Migration\MigrationStep;
use Shopware\Core\Framework\Uuid\Uuid;
use Shopware\Core\Migration\Traits\ImportTranslationsTrait;
use Shopware\Core\Migration\Traits\Translations;

class Migration1616974646AddDocumentNumberRange extends MigrationStep
{
    use ImportTranslationsTrait;

    public function getCreationTimestamp(): int
    {
        return 1616974646;
    }

    public function update(Connection $connection): void
    {
        $numberRangeId = Uuid::randomBytes();
        $numberRangeTypeId = Uuid::randomBytes();

        $this->insertNumberRange($connection, $numberRangeId, $numberRangeTypeId);
        $this->insertTranslations($connection, $numberRangeId, $numberRangeTypeId);

    }

    public function updateDestructive(Connection $connection): void
    {
    }

    private function insertNumberRange(Connection $connection, string $numberRangeId, string $numberRangeTypeId): void
    {
        $connection->insert('number_range_type', [
            'id' => $numberRangeTypeId,
            'global' => 0,
            'technical_name' => 'document_example',
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT)
        ]);

        $connection->insert('number_range', [
            'id' => $numberRangeId,
            'type_id' => $numberRangeTypeId,
            'global' => 0,
            'pattern' => '{n}',
            'start' => 10000,
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT)
        ]);

        $storefrontSalesChannelId = $this->getStorefrontSalesChannelId($connection);
        if (!$storefrontSalesChannelId) {
            return;
        }

        $connection->insert('number_range_sales_channel', [
            'id' => Uuid::randomBytes(),
            'number_range_id' => $numberRangeId,
            'sales_channel_id' => $storefrontSalesChannelId,
            'number_range_type_id' => $numberRangeTypeId,
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT)
        ]);
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

    private function insertTranslations(Connection $connection, string $numberRangeId, string $numberRangeTypeId): void
    {
        $numberRangeTranslations = new Translations(
            [
                'number_range_id' => $numberRangeId,
                'name' => 'Beispiel',
            ],
            [
                'number_range_id' => $numberRangeId,
                'name' => 'Example',
            ]
        );

        $numberRangeTypeTranslations = new Translations(
            [
                'number_range_type_id' => $numberRangeTypeId,
                'type_name' => 'Beispiel',
            ],
            [
                'number_range_type_id' => $numberRangeTypeId,
                'type_name' => 'Example',
            ]
        );

        $this->importTranslation(
            'number_range_translation',
            $numberRangeTranslations,
            $connection
        );

        $this->importTranslation(
            'number_range_type_translation',
            $numberRangeTypeTranslations,
            $connection
        );
    }
}
```

As already said, we're first creating the entries in the tables `number_range`, `number_range_type` and `number_range_sales_channel`. For the latter, we're assigning a Storefront sales channel, if any available. Make sure to check here, since in theory there could be no storefront sales channel.

Afterwards we import the translations for the `number_range_translation` and the `number_range_type_translation` tables by using the `ImportTranslationsTrait` once again.

And that's it now! You've just created:

* A custom document type, including translations
* A custom document generator, including a custom template
* A custom number range and number range type, which will now be used by your custom document type

## Next steps

With your custom document type, you also might want to add a new actual document configuration, which is making use of your new type. Creating a custom document is explained in [this guide](add-custom-document).
