# Add Custom Document Type

## Overview

Using the Shopware Administration, you can easily create new documents. This guide will teach you how to achieve the same result, which is creating a new document, using your plugin.

## Prerequisites

This guide is built upon the [plugin base guide](../../plugin-base-guide), but of course you can use those examples with any other plugin.

Furthermore, adding a custom document type via your plugin is done by using [plugin database migrations](../../plugin-fundamentals/database-migrations). Since this isn't explained in this guide, you will have to know and understand the plugin database migrations first.

## Adding a custom document type, and its own base configuration to the database

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
    
    final public const TYPE = 'example';
    
    public function getCreationTimestamp(): int
    {
        return 1616677952;
    }

    public function update(Connection $connection): void
    {
        $documentTypeId = Uuid::randomBytes();

        $connection->insert('document_type', [
            'id' => $documentTypeId,
            'technical_name' => self::TYPE,
            'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT)
        ]);

        $this->addTranslations($connection, $documentTypeId);
        $this->addDocumentBaseConfig($connection, $documentTypeId);
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
    
    private function addDocumentBaseConfig(Connection $connection, string $documentTypeId): void
    {
        $defaultConfig = [
            'displayPrices' => true,
            'displayFooter' => true,
            'displayHeader' => true,
            'displayLineItems' => true,
            'diplayLineItemPosition' => true,
            'displayPageCount' => true,
            'displayCompanyAddress' => true,
            'pageOrientation' => 'portrait',
            'pageSize' => 'a4',
            'itemsPerPage' => 10,
            'companyName' => 'Example Company',
            'taxNumber' => '',
            'vatId' => '',
            'taxOffice' => '',
            'bankName' => '',
            'bankIban' => '',
            'bankBic' => '',
            'placeOfJurisdiction' => '',
            'placeOfFulfillment' => '',
            'executiveDirector' => '',
            'companyAddress' => '',
            'referencedDocumentType' => self::TYPE,
        ];

        $documentBaseConfigId = Uuid::randomBytes();

        $connection->insert(
            'document_base_config',
            [
                'id' => $documentBaseConfigId,
                'name' => self::TYPE,
                'global' => 1,
                'filename_prefix' => self::TYPE . '_',
                'document_type_id' => $documentTypeId,
                'config' => json_encode($defaultConfig, \JSON_THROW_ON_ERROR),
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]
        );
        $connection->insert(
            'document_base_config_sales_channel',
            [
                'id' => Uuid::randomBytes(),
                'document_base_config_id' => $documentBaseConfigId,
                'document_type_id' => $documentTypeId,
                'created_at' => (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT),
            ]
        );
    }
}
```

So first, we are creating the new document type with the `technical_name` as "example". Make sure to save the ID here since you are going to need it for the following translations:

Afterwards we're inserting the translations, one for German, one for English. For this we're using the `Shopware\Core\Migration\Traits\ImportTranslationsTrait`, which adds the helper method `importTranslation`. There you have to supply the translation table and an instance of `Shopware\Core\Migration\Traits\Translations`. The latter accepts two constructor parameters:

* An array of German translations, plus the respective ID column
* An array of English translations, plus the respective ID column

  It will then take care of properly inserting those translations.

And the last, We are creating the new document base configuration for the new document type to store some default configurations for our new document type.

After installing your plugin, your new document type should be available in the Administration. However, it wouldn't work yet, since every document type has to come with a respective `AbstractDocumentRenderer`. This is covered in the next section.

## Adding a renderer

The renderer for a document type is responsible for rendering the respective document, including a template. That is why we will have to create a custom renderer for the new type as well, lets call it `ExampleDocumentRenderer`.

We will place it in the same directory as all other default document renderers: `<plugin root>/src/Core/Checkout/Document/Renderer`

Your custom document renderer has to implement the `Shopware\Core\Checkout\Document\Renderer\AbstractDocumentRenderer`, which forces you to implement three methods:

* `getDecorated`: Shall return the decorated service (see decoration pattern adr).
* `supports`: Has to return a string of the document type it supports. We named our document type "example", so our renderer has to return "example".
* `render`: This needs to return the instance `Shopware\Core\Checkout\Document\Renderer\RendererResult`, which will contain the instance of `Shopware\Core\Checkout\Document\Renderer\RenderedDocument` based on each `orderId`. You will have access to the array of `DocumentGenerateOperation` which contains all respective orderIds, the context and the instance of `Shopware\Core\Checkout\Document\Renderer\DocumentRendererConfig` (additional configuration).

Furthermore, your renderer has to be registered to the [service container](../../plugin-fundamentals/dependency-injection) using the tag `document.renderer`.

Let's have a look at an example renderer:

```php
// <plugin root>/src/Core/Checkout/Document/Render/ExampleDocumentRenderer.php
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document\Render;

use Shopware\Core\Checkout\Document\Renderer\AbstractDocumentRenderer;
use Shopware\Core\Checkout\Document\Renderer\DocumentRendererConfig;
use Shopware\Core\Checkout\Document\Renderer\RenderedDocument;
use Shopware\Core\Checkout\Document\Renderer\RendererResult;
use Shopware\Core\Checkout\Document\Service\DocumentConfigLoader;
use Shopware\Core\Checkout\Document\Struct\DocumentGenerateOperation;
use Shopware\Core\Checkout\Document\Twig\DocumentTemplateRenderer;
use Shopware\Core\Checkout\Order\OrderEntity;
use Shopware\Core\Defaults;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Core\Framework\Plugin\Exception\DecorationPatternException;
use Shopware\Core\System\Locale\LocaleEntity;
use Shopware\Core\System\NumberRange\ValueGenerator\NumberRangeValueGeneratorInterface;

class ExampleDocumentRenderer extends AbstractDocumentRenderer
{
    public const DEFAULT_TEMPLATE = '@SwagBasicExample/documents/example_document.html.twig';

    final public const TYPE = 'example';

    /**
     * @internal
     */
    public function __construct(
        private readonly EntityRepository $orderRepository,
        private readonly DocumentConfigLoader $documentConfigLoader,
        private readonly DocumentTemplateRenderer $documentTemplateRenderer,
        private readonly NumberRangeValueGeneratorInterface $numberRangeValueGenerator,
        private readonly string $rootDir,
    ) {
    }

    public function supports(): string
    {
        return self::TYPE;
    }

    /**
     * @param array<DocumentGenerateOperation> $operations
     */
    public function render(array $operations, Context $context, DocumentRendererConfig $rendererConfig): RendererResult
    {
        $ids = \array_map(fn (DocumentGenerateOperation $operation) => $operation->getOrderId(), $operations);

        if (empty($ids)) {
            return new RendererResult();
        }

        $result = new RendererResult();

        $template = self::DEFAULT_TEMPLATE;

        $orders = $this->orderRepository->search(new Criteria($ids), $context)->getEntities();
        foreach ($orders as $order) {
            $orderId = $order->getId();

            try {
                $operation = $operations[$orderId] ?? null;
                if ($operation === null) {
                    continue;
                }

                $config = clone $this->documentConfigLoader->load(self::TYPE, $order->getSalesChannelId(), $context);

                $config->merge($operation->getConfig());

                $number = $config->getDocumentNumber() ?: $this->getNumber($context, $order, $operation);

                $now = (new \DateTime())->format(Defaults::STORAGE_DATE_TIME_FORMAT);

                $config->merge([
                    'documentDate' => $operation->getConfig()['documentDate'] ?? $now,
                    'documentNumber' => $number,
                    'custom' => [
                        'invoiceNumber' => $number,
                    ],
                ]);

                // The document that uploaded by manual
                if ($operation->isStatic()) {
                    $doc = new RenderedDocument('', $number, $config->buildName(), $operation->getFileType(), $config->jsonSerialize());
                    $result->addSuccess($orderId, $doc);

                    continue;
                }

                /** @var LocaleEntity $locale */
                $locale = $order->getLanguage()->getLocale();

                $html = $this->documentTemplateRenderer->render(
                    $template,
                    [
                        'order' => $order,
                        'config' => $config,
                        'rootDir' => $this->rootDir,
                        'context' => $context,
                    ],
                    $context,
                    $order->getSalesChannelId(),
                    $order->getLanguageId(),
                    $locale->getCode()
                );

                $doc = new RenderedDocument(
                    $html,
                    $number,
                    $config->buildName(),
                    $operation->getFileType(),
                    $config->jsonSerialize(),
                );

                $result->addSuccess($orderId, $doc);
            } catch (\Throwable $exception) {
                $result->addError($orderId, $exception);
            }
        }

        return $result;
    }

    public function getDecorated(): AbstractDocumentRenderer
    {
        throw new DecorationPatternException(self::class);
    }

    private function getNumber(Context $context, OrderEntity $order, DocumentGenerateOperation $operation): string
    {
        return $this->numberRangeValueGenerator->getValue(
            'document_' . self::TYPE,
            $context,
            $order->getSalesChannelId(),
            $operation->isPreview()
        );
    }
}
```

First, we are injecting the `rootDir` of the Shopware installation into our renderer since we will need that for rendering our template, and the `DocumentTemplateRenderer`, which will do the template rendering. We also inject `orderRepository` to get all order entities by list of order's id, `documentConfigLoader` to load the document configuration and `numberRangeValueGenerator` to get the document number

The `supports` method just returns the string "example", which is the technical name of our new document type.

Now let's have a look at the `render` method. This function contains three parameters:

* `$operations`: An array of `DocumentGenerateOperation` objects.
* `$context`: A Context object.
* `$rendererConfig`: A `DocumentRendererConfig` object, so we can add additional configuration later.

The function returns a `RendererResult` object.
Here's what the function does:

* It creates an array of `$ids`, which is populated with the `orderId` of each `DocumentGenerateOperation` object in $operations.
* If `$ids` is empty, the function returns an empty `RendererResult` object.
* A search is performed on the order repository to find all orders by `$ids`.
* For each order found, the function attempts to generate a document.
* If successful, a new `RenderedDocument` object is created. This object is then added to the `RendererResult` object as a success.
* If an error occurs, the exception is caught and the error message is added to the `RendererResult` object as an error.
* `The RendererResult` object is returned.

In this example, we are rendering a specific template, which we will have a look at in the next section.

### Adding a document type template

Let's have a quick look at an example document type template. Go ahead and create a new file at the path `<plugin root>/src/Resources/views/documents/example_document.html.twig`.

In there you should extend from the default document base template:

```twig
// <plugin root>/src/Resources/views/documents/example\_document.html.twig
{% sw_extends '@Framework/documents/base.html.twig' %}
```

This could be it already. The [base.html.twig](https://github.com/shopware/platform/blob/v6.3.4.1/src/Core/Framework/Resources/views/documents/base.html.twig) template comes with a lot of default templating, which you can now override by using blocks. If you don't know how that's done, have a look at our guide regarding [customizing templates](../../storefront/customize-templates).

## Adding a number range

You are almost done here. You have a new document type in the database, a renderer for your new document type, and it even uses a custom template. However, you also need to add a new number range for your documents; otherwise, a new number wouldn't be generated for your documents.

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

And that's it now. You Have just created:

* A custom document type, including translations
* A custom document renderer
* A custom number range and number range type, which will now be used by your custom document type

## Next steps

With your custom document type, you also might want to add a new actual document configuration, which is making use of your new type. Creating a custom document is explained in [this guide](add-custom-document).
