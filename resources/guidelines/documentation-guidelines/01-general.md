---
nav:
  title: General
  position: 10

---

# Documentation Guidelines

Your style, your words, and your tone define you. Correspondingly, this style guide lays out standard editorial instructions that define Shopware documentation.

We recommend that every contributor follows the defined writing standards to maintain uniformity of the documentation. Refer to different sections of this guide to know more.

## Audience

It is important to consider the background of the potential audience reading your writing. This helps you to adapt your writing to meet their needs and interests.

| Who is the audience? | What are their roles? |
| :--- | :--- |
| Fullstack developer | <ul><li>Plugin development</li><li>Templates</li><li>Routes/ Controllers</li></ul>|
| Frontend developer | <ul><li>Admin</li><li>Themes</li><li>PWA</li></ul>  |
| Backend developer | <ul><li>DI/ Service architecture</li><li>Message queues</li><li>DAL</li><li>Action event system</li><li>ElasticSearch</li></ul> |
| API developer  | <ul><li>How to consume the API</li><li>Create a product/ category import</li><li>How to extend the API</li><li>API paradigm</li><li>Proper API references</li><li>Request collection</li></ul> |
| DevOps  | <ul><li>Hosting setup</li><li>Deployment</li><li>Performance tests</li></ul> |
| Project/ Solution architect | <ul><li>Hosting</li><li>Architecture</li><li>Modules/ Extension system</li><li>Paradigms/ Patterns</li><li>Commonalities app system/ Plugin system</li></ul> |
| Designer | <ul><li>Component library</li><li>Design system</li></ul> |
| Product owner/ Manager | <ul><li>Responsibilities pertaining to the product life cycle</li></ul> |
| Tech writers | <ul><li>Document all product details</li></ul> |

## List of docs maintained by us

* [Developer Guide](/docs/)
* [API Reference Guide](https://shopware.stoplight.io/)
* [PWA](https://shopware-pwa-docs.vuestorefront.io/)
* [Admin Extension SDK](https://shopware.github.io/admin-extension-sdk/)

## Word list

Choose ecommerce and technical terms from the pre-defined list of terminologies:

* [Shopware terminologies](https://shopware.atlassian.net/wiki/spaces/pr/pages/19249037615/Shopware+terminology)
* [General terms and abbreviations](https://shopware.atlassian.net/wiki/spaces/BGE/pages/735426953/Our+corporate+communications)

::: info These are internal resources visible to Shopware employees only. :::

## Use of third-party sources

Third-party sources include websites, books, blogs, videos, images, and more. Ensure to reference these external sources in the documentation only if they are trustworthy. Avoid copying any content directly from other sources like websites, encyclopedias, and Wikipedia.

## Markdown rules

Adhere to the [Markdown cheat sheet](https://www.markdownguide.org/cheat-sheet/) while creating the document.

Refer to [GitBook syntax](https://gitbook.gitbook.io/git-sync/) for features like hint block, emoji, API blocks, etc.

Symbols in Markdown sometimes serve multi-purpose. For example, `*` or `-` can be used to create bulleted lists. However, follow a single pattern to maintain uniformity throughout. Further sections describe the usage of these patterns and let us comply with them.

Also, user-defined rules govern the content quality, such as removing trailing spaces, code fence style, and more. You may refer to these rules in the [Markdown style of Shopware docs](https://github.com/shopware/docs/blob/master/markdown-style-config.yml).

The following section details the conceptual outline structure of our documentation.
