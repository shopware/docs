---
nav:
  title: Document (v2)
  position: 120
---

# Documents (v2) in apps

::: warning This page documents the new Document System (v2)
The reworked document generation is an experimental feature. Activate it with the `DOCUMENT_GENERATION_REWORK` feature flag. Its API can change until it becomes the default with Shopware 6.8.
:::

Apps extend the Document System (v2) declaratively: the manifest registers a document type, Twig templates render it, and an app script provides the data.

**Prerequisites**: a running app (see the [app base guide](../app-base-guide)) and the `DOCUMENT_GENERATION_REWORK` feature flag enabled for testing.

## Register a document type

Declare the document type in the manifest. `identifier`, `label`, and `formats` are required. `config` is optional and falls back to defaults.

```xml
<documents>
    <document-type>
        <identifier>swag_warranty</identifier>
        <label>Warranty</label>
        <label lang="de-DE">Garantie</label>
        <formats>
            <format>html</format>
            <format>pdf</format>
        </formats>
        <config>
            <page-size>a4</page-size>
            <page-orientation>portrait</page-orientation>
            <items-per-page>10</items-per-page>
            <display-header>true</display-header>
            <display-footer>true</display-footer>
        </config>
    </document-type>
</documents>
```

`formats` accepts the built-in formats only: `html`, `pdf`, `zugferd_xml`, and `zugferd_embedded_pdf`.

Installing the app merges the type into the document type registry and seeds a number range of type `document_<identifier>`. On update, changed manifest declarations are synchronized. Removed ones are deleted.

The identifier is globally unique across all apps, installing an app that claims an identifier another app already registered fails.

## Add the templates

Templates ship with the app, in the same locations plugins use. The HTML template renders the `html`, `pdf`, and `zugferd_embedded_pdf` formats:

::: code-group

```twig [Resources/views/documents/swag_warranty.html.twig]
{% sw_extends '@Framework/documents/base.html.twig' %}

{% block document_headline %}
    <h1 class="headline">Warranty for order {{ order.orderNumber }}</h1>
{% endblock %}
```

:::

If the type offers `zugferd_xml` or `zugferd_embedded_pdf`, add the XML template as well:

::: code-group

```twig [Resources/views/documents/zugferd/swag_warranty.xml.twig]
<?xml version="1.0" encoding="UTF-8"?>
<warranty>
    <orderNumber>{{ order.orderNumber }}</orderNumber>
    <documentNumber>{{ meta.documentNumber }}</documentNumber>
</warranty>
```

:::

App document types have no typed render data. Templates work with the loaded `order`, the shared document meta data, and whatever the app's script attaches to the order (next section).

## Provide data with the document-generation script

The `document-generation` script hook fires once per generation, after the order is loaded and the document number is allocated, before rendering starts. It exposes `order`, `documentType`, `documentNumber`, `formats`, and `context`, plus the `repository` and `config` facades for loading additional data.

The script attaches data to the order as an extension:

::: code-group

```twig [Resources/scripts/document-generation/document-data.twig]
{% set order = hook.order %}

{% do order.addArrayExtension('swag_warranty_data', {
    'warrantyEnd': order.orderDate|date_modify('+2 years')|date('Y-m-d'),
    'documentNumber': hook.documentNumber
}) %}
```

:::

The document template reads the extension:

```twig
<p>Warranty valid until {{ order.extensions.swag_warranty_data.get('warrantyEnd') }}</p>
```

## Enrich built-in documents

The same combination works for documents the app did not register: the script's `supports` check is up to you, `hook.documentType` tells you which type is being generated, and the visual side is a regular Twig override of the built-in template.

## Limits

**No custom formats or renderers.** Apps choose from the four built-in formats.

**No typed data providers.** The script hook and order extensions replace the plugin-side `AbstractDocumentDataProvider`.

**No configuration UI.** The `config` block in the manifest is the only configuration surface for app document types.

**Number ranges persist.** Uninstalling the app deletes its document types, but never the number ranges, reinstalling must not reuse document numbers.
