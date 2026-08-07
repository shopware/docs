---
nav:
  title: Customize Document Data and Templates
  position: 40
---

# Customize document data and templates

::: warning This page documents the new Document System (v2)
The reworked document generation is an experimental feature. Activate it with the `DOCUMENT_GENERATION_REWORK` feature flag. Its API can change until it becomes the default with Shopware 6.8.
:::

## Add data to an existing document

Any number of providers can support the same document type. Each provider stores its render data DTO under its own key, and public fields on that DTO are flattened onto the template's `config` variable.

If a key is already used by another provider for the same document type, generation throws an exception.

The example below adds a note to the built-in invoice.

::: code-group

```php [PLUGIN_ROOT/src/Core/Checkout/Document/InvoiceNoteRenderData.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document;

use Shopware\Core\Checkout\DocumentV2\Struct\AbstractRenderData;

readonly class InvoiceNoteRenderData extends AbstractRenderData
{
    public function __construct(
        public string $invoiceNote,
    ) {
    }
}
```

```php [PLUGIN_ROOT/src/Core/Checkout/Document/InvoiceNoteDataProvider.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document;

use Shopware\Core\Checkout\DocumentV2\Provider\AbstractDocumentDataProvider;
use Shopware\Core\Checkout\DocumentV2\Struct\AbstractRenderData;
use Shopware\Core\Checkout\DocumentV2\Struct\ProviderInput;
use Shopware\Core\Framework\Context;

readonly class InvoiceNoteDataProvider extends AbstractDocumentDataProvider
{
    public function getKey(): string
    {
        return 'invoiceNote';
    }

    public function supports(string $documentType): bool
    {
        return $documentType === 'invoice';
    }

    public function provideRenderingData(ProviderInput $input, Context $context): AbstractRenderData
    {
        $order = $input->order;

        return new InvoiceNoteRenderData(
            invoiceNote: sprintf('Please quote order %s in all correspondence.', $order->getOrderNumber()),
        );
    }
}
```

```php [PLUGIN_ROOT/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Swag\BasicExample\Core\Checkout\Document\InvoiceNoteDataProvider;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $container->services()
        ->set(InvoiceNoteDataProvider::class)
        ->tag('shopware.document_v2.provider');
};
```

:::

## Override a document template

Templates live at `@Framework/documents/` and are overridden with `sw_extends`, the same mechanism used everywhere else in Shopware. The invoice template exposes blocks from `base.html.twig` and the `includes/` partials, so overriding `invoice.html.twig` gives access to all of them.

The same templates render for every format that needs HTML, so a change to `invoice.html.twig` reaches the HTML, PDF, and ZUGFeRD-embedded-PDF output alike.

The example below appends the note from the provider above to the invoice footer.

::: code-group

```twig [PLUGIN_ROOT/src/Resources/views/documents/invoice.html.twig]
{% sw_extends '@Framework/documents/invoice.html.twig' %}

{% block document_footer %}
    {{ parent() }}
    <p>{{ config.invoiceNote }}</p>
{% endblock %}
```

:::

The ZUGFeRD XML templates under `@Framework/documents/zugferd/` are overridden the same way.

Templates are shared with the v1 document system during the transition, overrides apply to both systems.
