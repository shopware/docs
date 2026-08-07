---
nav:
  title: Add a Document Type
  position: 20
---

# Add a document type

::: warning This page documents the new Document System (v2)
The reworked document generation is an experimental feature. Activate it with the `DOCUMENT_GENERATION_REWORK` feature flag. Its API can change until it becomes the default with Shopware 6.8.
:::

You define the type, provide the data it renders, register both as services and add a template.

## Create the document type

A document type declares its technical name and the formats it can be rendered in.

::: code-group

```php [PLUGIN_ROOT/src/Core/Checkout/Document/ExampleDocumentType.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document;

use Shopware\Core\Checkout\DocumentV2\Type\AbstractDocumentType;

readonly class ExampleDocumentType extends AbstractDocumentType
{
    final public const TECHNICAL_NAME = 'example_document';

    public function getTechnicalName(): string
    {
        return self::TECHNICAL_NAME;
    }

    public function getSupportedFormats(): array
    {
        return [
            'html',
            'pdf',
        ];
    }
}
```

:::

## Provide the data

A render data DTO carries the values a template uses. A data provider builds that DTO for a given order.

Public properties on the render data DTO end up on the template's `config` variable. `enrichOrderCriteria()` adds the associations the provider needs, so they are loaded before `provideRenderingData()` runs.

::: code-group

```php [PLUGIN_ROOT/src/Core/Checkout/Document/ExampleRenderData.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document;

use Shopware\Core\Checkout\DocumentV2\Struct\AbstractRenderData;

readonly class ExampleRenderData extends AbstractRenderData
{
    public function __construct(
        public string $noteText,
    ) {
    }
}
```

```php [PLUGIN_ROOT/src/Core/Checkout/Document/ExampleDocumentDataProvider.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document;

use Shopware\Core\Checkout\DocumentV2\Provider\AbstractDocumentDataProvider;
use Shopware\Core\Checkout\DocumentV2\Struct\AbstractRenderData;
use Shopware\Core\Checkout\DocumentV2\Struct\ProviderInput;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

readonly class ExampleDocumentDataProvider extends AbstractDocumentDataProvider
{
    public function getKey(): string
    {
        return 'example';
    }

    public function supports(string $documentType): bool
    {
        return $documentType === ExampleDocumentType::TECHNICAL_NAME;
    }

    public function enrichOrderCriteria(Criteria $criteria): void
    {
        $criteria->addAssociation('lineItems');
    }

    public function provideRenderingData(ProviderInput $input, Context $context): AbstractRenderData
    {
        return new ExampleRenderData(
            noteText: 'Thank you for your order!',
        );
    }
}
```

:::

## Register the services

Tag the type and the provider so the registries in Document v2 pick them up.

::: code-group

```php [PLUGIN_ROOT/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Swag\BasicExample\Core\Checkout\Document\ExampleDocumentDataProvider;
use Swag\BasicExample\Core\Checkout\Document\ExampleDocumentType;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $services = $container->services();

    $services->set(ExampleDocumentType::class)
        ->tag('shopware.document_v2.type');

    $services->set(ExampleDocumentDataProvider::class)
        ->tag('shopware.document_v2.provider');
};
```

:::

## Add the template

The HTML renderer resolves `@Framework/documents/<technical_name>.html.twig` for the technical name you declared. The DTO's `noteText` from above renders as `config.noteText`.

::: code-group

```twig [PLUGIN_ROOT/src/Resources/views/documents/example_document.html.twig]
{% sw_extends '@Framework/documents/base.html.twig' %}

{% block document_headline %}
    <h1 class="headline">Example document {{ documentNumber }}</h1>
    <p>{{ config.noteText }}</p>
{% endblock %}
```

:::

Types that offer the `zugferd_xml` format additionally need an XML template at `PLUGIN_ROOT/src/Resources/views/documents/zugferd/example_document.xml.twig`, resolved the same way.

## Create the database entries

Two database rows are still required outside of the code above: a `document_type` row whose `technical_name` matches your type, since the `document` table has a foreign key on it, and a number range of type `document_example_document` to number the generated documents.

The migration code is identical to v1. Reuse the [document type migration](../document/add-custom-document-type#adding-a-custom-document-type-and-its-own-base-configuration-to-the-database) and the [number range migration](../document/add-custom-document-type#adding-a-number-range) from the v1 guide, and swap in your own technical name.
