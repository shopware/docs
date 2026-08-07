---
nav:
  title: Add a Format Renderer
  position: 30
---

# Add a format renderer

::: warning This page documents the new Document System (v2)
The reworked document generation is an experimental feature. Activate it with the `DOCUMENT_GENERATION_REWORK` feature flag. Its API can change until it becomes the default with Shopware 6.8.
:::

## Add a new format

A renderer produces exactly one format. `getDependencies()` lists the formats that must render first, so their results are available in `RenderState` when your renderer runs.

The example below adds a plain-text format. It depends on `html` and derives its content by stripping tags from the already-rendered HTML result.

::: code-group

```php [PLUGIN_ROOT/src/Core/Checkout/Document/TextRenderer.php]
<?php declare(strict_types=1);

namespace Swag\BasicExample\Core\Checkout\Document;

use Shopware\Core\Checkout\DocumentV2\Renderer\AbstractDocumentRenderer;
use Shopware\Core\Checkout\DocumentV2\Struct\RenderInput;
use Shopware\Core\Checkout\DocumentV2\Struct\RenderResult;
use Shopware\Core\Checkout\DocumentV2\Struct\RenderState;
use Shopware\Core\Framework\Context;

readonly class TextRenderer extends AbstractDocumentRenderer
{
    public function getFormat(): string
    {
        return 'txt';
    }

    public function getFileExtension(): string
    {
        return 'txt';
    }

    public function getDependencies(): array
    {
        return ['html'];
    }

    public function renderToString(RenderInput $input, RenderState $state, Context $context): RenderResult
    {
        $html = $state->require('html');

        return new RenderResult(
            $this->getFormat(),
            strip_tags($html->content),
            sprintf('%s_txt', $input->documentNumber),
            $this->getFileExtension(),
            'text/plain',
        );
    }
}
```

```php [PLUGIN_ROOT/src/Resources/config/services.php]
<?php declare(strict_types=1);

use Swag\BasicExample\Core\Checkout\Document\TextRenderer;
use Symfony\Component\DependencyInjection\Loader\Configurator\ContainerConfigurator;

return static function (ContainerConfigurator $container): void {
    $container->services()
        ->set(TextRenderer::class)
        ->tag('shopware.document_v2.renderer');
};
```

:::

A format only becomes selectable once a document type lists it in `getSupportedFormats()`. See [add a document type](./add-a-document-type) for that step.

## Override a built-in renderer

The renderer registry keeps the first renderer registered per format. Renderers are ordered by tag priority. Register your renderer for the same format string with a higher priority to replace a built-in one.

This replaces v1's `getDecorated()` decoration chains.

```php
$container->services()
    ->set(CustomPdfRenderer::class)
    ->tag('shopware.document_v2.renderer', ['priority' => 100]);
```

`CustomPdfRenderer` extends `AbstractDocumentRenderer` with `getFormat()` returning `pdf`. It fully replaces the built-in `PdfRenderer`, including its `html` dependency declaration.
