---
nav:
  title: Store
  position: 5
---

# Shopware Store review and quality

This section is for **extension developers** (plugins, apps, themes) who plan to distribute through the [Shopware Store](https://store.shopware.com/). It describes what reviewers check during publication and how you can align your implementation and tests with those expectations before you submit.

Store review complements your own automated and manual testing: it verifies that your extension stays within supported integration boundaries, behaves predictably for merchants and end customers, and meets listing, security, and compliance rules. Treat these pages as a checklist-oriented companion to the general [testing guidelines](../testing-guidelines).

## Quality guidelines

Publication is gated on Shopware’s quality, security, and compliance rules. The guidelines summarize non-negotiable requirements that apply to every Store extension, independent of type or size.

<PageRef page="./quality-guidelines" title="Quality guidelines for Store extensions" />

## Scope and integration boundaries

Reviewers validate that your extension does not rely on unsupported or fragile patterns (for example, undocumented core internals, unsafe database or filesystem usage, or API misuse). The following pages spell out prohibited behaviors and how functionality should integrate with Shopware core, persistence, and public APIs.

<PageRef page="./not-allowed-store-behaviors" title="Not allowed store behaviors" />

<PageRef page="./functionality-integration" title="Functionality and integration" />

## Storefront, SEO, and compliance

Merchants expect stable storefront behavior, sensible performance characteristics, and clear handling of errors. Review also covers SEO-related output, structured data where relevant, and privacy-oriented behavior such as cookies and consent. Use these topics when defining acceptance criteria for themes and Storefront-facing plugins.

<PageRef page="./storefront-performance-and-errors" title="Storefront, performance, and errors" />

<PageRef page="./seo-and-structured-data" title="SEO and structured data" />

<PageRef page="./cookies-and-privacy" title="Cookies and privacy" />

## Listing, lifecycle, and code quality

Beyond runtime behavior, review covers how you present the extension in the Store (descriptions, media, translations), what happens on install and uninstall (including data cleanup), and maintainability signals in your codebase. The common review errors page is a practical index of recurring feedback you can preempt.

<PageRef page="./content-and-translations" title="Content and translations" />

<PageRef page="./installation-and-cleanup" title="Uninstallation and data cleanup" />

<PageRef page="./code-quality" title="Code quality" />

<PageRef page="./store-review-errors" title="Common Store review errors" />

## Frequently asked questions

For submission logistics, timelines, and readiness questions that do not fit a single technical page, start here.

<PageRef page="./faq" title="Frequently asked questions" />

## Related

Functional scenarios and test ideas used in the broader extension testing story are documented under testing guidelines; pair that guide with the Store-specific pages above when you plan your test matrix.

<PageRef page="../testing-guidelines" title="Testing guidelines for extensions" />
