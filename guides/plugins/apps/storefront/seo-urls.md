---
nav:
  title: SEO URLs for App Routes
  position: 30

---

# SEO URLs for App Routes

## Overview

Storefront pages rendered by [app scripts](../app-scripts/custom-endpoints.md#storefront-endpoints) live under `/storefront/script/{hook}`. That path is technical and cannot carry an entity id. With `<seo-url>` elements in the `<storefront>` section of your `manifest.xml`, Shopware gives those pages SEO URLs, the same way it does for products and categories.

::: info
This feature was introduced in Shopware 6.7.15.0 and is not available in earlier versions.
:::

There are two kinds of SEO URLs:

- A **static** SEO URL maps a fixed path such as `/imprint` to one of your storefront scripts.
- An **entity-bound** SEO URL generates one URL per entity from a Twig template, for example `/blog/{{ ceBlog.translated.title }}`, and passes the entity id to your script.

## Prerequisites

You need an app with at least one storefront script. Read the [App Base Guide](../app-base-guide.md) and the [Custom Endpoints](../app-scripts/custom-endpoints.md) guide first. Both kinds of SEO URLs point at scripts stored in `Resources/scripts/storefront-<hook>/`.

## Static SEO URLs

Declare a `<seo-url>` with one or more `<path>` elements. The `name` identifies the route inside your app and is also the default script hook.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/shopware/trunk/src/Core/Framework/App/Manifest/Schema/manifest-3.0.xsd">
    <meta>
        <name>SwagCompanyPages</name>
        ...
    </meta>
    <storefront>
        <seo-url name="imprint">
            <label>Imprint</label>
            <label lang="de-DE">Impressum</label>
            <path>imprint</path>
            <path lang="de-DE">impressum</path>
        </seo-url>
    </storefront>
</manifest>
```

With this manifest, `/imprint` and `/impressum` run the scripts in `Resources/scripts/storefront-imprint/`. Shopware writes one SEO URL per storefront sales channel domain and picks the `<path>` matching the domain language, falling back to the `en-GB` path. Query parameters of the request stay available as `hook.query`.

Set the `hook` attribute when the script folder should differ from the route name:

```xml
<seo-url name="imprint" hook="company-imprint">
    <path>imprint</path>
</seo-url>
```

## Entity-bound SEO URLs

Declare a `<seo-url>` with an `entity` attribute and a `<default-template>`. The entity can be one of your [custom entities](../custom-data/custom-entities.md) or a core entity such as `product`.

```xml
<storefront>
    <seo-url name="blog-detail" entity="ce_blog">
        <label>Blog post</label>
        <default-template>blog/{{ ceBlog.translated.title }}</default-template>
    </seo-url>
</storefront>
```

Shopware generates one SEO URL per entity and language from the template and keeps it up to date whenever the entity is written. The template context exposes the entity under its camel-cased name, so `ce_blog` becomes `ceBlog` and `product` becomes `product`. Every field of the entity is available, translated fields through `translated`.

The generated URL resolves to `/storefront/script/blog-detail?id=<entity-id>`, so your script receives the id as `hook.query.id`:

```twig
// Resources/scripts/storefront-blog-detail/script.twig
{% set post = services.store.search('ce_blog', { 'ids': [hook.query.id] }).first %}

{% do hook.page.addExtension('post', post) %}

{% do hook.setResponse(
    services.response.render('@SwagBlog/storefront/page/blog/detail.html.twig', { 'page': hook.page })
) %}
```

### Merchant configuration

Entity-bound routes appear in the Administration under *Settings > SEO* as `storefront.app.<app name>.<name>`, for example `storefront.app.SwagBlog.blog-detail`. Merchants can adjust the template per sales channel and override single URLs like they do for products. Your `<default-template>` is only the initial value. An app update replaces it only when the merchant has not changed it.

## Linking to your pages

Use the `seoUrl` Twig function with the technical route and parameters in your storefront templates. The placeholder is replaced with the SEO URL when the page is rendered:

```twig
<a href="{{ seoUrl('frontend.script_endpoint', { 'hook': 'blog-detail', 'id': post.id }) }}">
    {{ post.translated.title }}
</a>

<a href="{{ seoUrl('frontend.script_endpoint', { 'hook': 'imprint' }) }}">
    {{ 'swag-company-pages.imprint'|trans }}
</a>
```

## Lifecycle

- **Install and update**: Shopware stores the declared routes and creates the default SEO URL template for entity-bound routes.
- **Activation**: The static SEO URLs are written and the entity-bound URLs are generated. This runs through the message queue, so make sure a [worker](../../../hosting/infrastructure/message-queue.md) processes messages.
- **Deactivation and uninstall**: The app's SEO URLs are marked as deleted and stop resolving. Uninstalling also removes the SEO URL templates.
- **New sales channel domains**: Static SEO URLs are written for new domains automatically.

## Validation rules

Shopware validates the `<seo-url>` elements when the app is installed:

- `name` and `hook` must match `[a-z0-9]+(-[a-z0-9]+)*` and `name` must be unique within the manifest.
- A `<seo-url>` declares either an `entity` or at least one `<path>`, never both.
- Entity-bound routes require a non-empty `<default-template>`. Static routes must not declare one.
- Static paths must only contain characters allowed in URLs and must not collide with an existing route such as `/account` or `/checkout`.

## Limitations

- SEO URLs are generated for storefront sales channels only. Headless sales channels are not supported yet.
- No `hreflang` links are generated for app routes.
