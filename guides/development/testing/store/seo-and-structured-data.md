---
nav:
  title: SEO and structured data
  position: 50
---

# SEO and structured data

* Keep storefront HTML structure clean and streamlined.
* Inline CSS and `!important` are not permitted in ways that break maintainability or override core semantics (see also [Storefront, performance, and errors](./storefront-performance-and-errors.md)).
* Public frontend URLs created by the extension must appear in `sitemap.xml` with valid canonical tags, unique meta descriptions, and `title` tags (via Administration or snippets).
* All images need meaningful `alt` text (or media manager defaults).
* All links need meaningful `title` attributes where appropriate.
* Do not use `<h1>`–`<h6>` in templates that are served with `<meta name="robots" content="index,follow">` for non-content chrome; you may use something like `<span class="h2">` for visual hierarchy instead.
* Do not break Storefront SEO, structured data, or canonical logic that Shopware provides.

## Rich snippets (home, listing, product)

Required when the extension changes products or product pages:

* Structured data ([schema.org](https://schema.org/)) must stay valid.
* Existing rich snippets must not break; new or changed content must be marked up correctly.
* Applies to product, category, and home templates as relevant.

## Storefront XHR and non-indexable routes

* XHR and similar requests must work without errors.
* Set response header `X-Robots-Tag: noindex, nofollow` on URLs that must not be indexed. See Google’s [robots meta tag / X-Robots-Tag](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag#xrobotstag) documentation.

## External links

Use `target="_blank"` together with `rel="noopener"`.

## Lighthouse and structured-data checks {#lighthouse-and-structured-data-checks}

Run [Google Lighthouse](https://developer.chrome.com/docs/lighthouse) before and after activating the extension. No new console errors; avoid significant regressions in the SEO category when your extension touches markup.

### Rich-result and schema checks {#rich-result-and-schema-checks}

Use [Schema Markup Validator](https://validator.schema.org/) and Google’s [Rich Results Test](https://search.google.com/test/rich-results) on home, category, and product detail pages. Cover cases such as: available and unavailable products, products without reviews, single and multiple reviews, varied ratings, out-of-stock, future release dates, and product attributes (EAN, MPN, dimensions, weight) where applicable. Watch for duplicate structured data and regressions after your changes.

## Tools

* [Schema Markup Validator](https://validator.schema.org/)
* [Rich Results Test](https://search.google.com/test/rich-results)
* [Google Lighthouse](https://developer.chrome.com/docs/lighthouse)
