# Import products & categories

One of the main tasks when creating a new store is to get product information into it. In the following we want to discuss, what viable approaches there are to performing this task.

We'll assume readers already have knowledge of these sections, before reading this guide

* [Admin API](../../../concepts/api/admin-api/)
* [Products](../../../concepts/commerce/catalog/products.md) and [Categories](../../../concepts/commerce/catalog/categories.md)

## Approaches

Let's start with the different approaches

* Use Import/Export Module
* Use the API
* Build a custom import module
* Use a third party library/module
* Use the Shopware Migration Assistant

All of these approaches are viable and to determine the correct approach for your project, as always, depends on your requirements. Whilst we can't make this decision for you, we can give some guidelines and insights to the pros, cons, challenges and implications for each approach.

### Import / Export Module

The Import / Export module might be the first and most obvious choice. It allows uploading via files, can handle partial/incremental updates, mappings and multiple types of entities, such as products, categories or customers. However the amount automation, logging and configuration possibilities is quite limited and due to its file-based nature, the module tends to import data rather slowly. It's not recommended to use this module for anything else than shops with a few hundred products, occasional updates and little customisation.

### Use the API

Shopware offers a fully functional import interface with the so-called Sync endpoint. The Sync endpoint takes any entity type and allows batch imports, queue-based indexing, relational imports \(e.g. categories and products in one request\). Any data that's present in Shopware can be written using this endpoint, but in comparison to the import / export module you can not define any mappings. This ultimately means: If your source of product information doesn't provide the data 1:1 according to the Shopware format, you have to implement or configure a middleware \(data hub, enterprise service bus, feed management\) that takes care of mapping the data according to the specification.

### Build a custom import module

When customisation, control and import speed are a critical, you are better off, writing a custom import module using the programmatic APIs provided by Shopware. This approach you will have full control over your source of products, field mappings & validation, synchronisation and also subsequent tasks related to the import, like downloading media, indexing etc. You can call an API, consume a product feed or even provide a webhook that other applications can call. It depends on the requirements. We have collected some guidelines \(UUID generation, checksums, entity writer\) that help you write a custom import module.

### Use a third party library / module

There are several plugins that provide integrations with existing PIM \(product information management\) or ERP \(enterprise resource planning\) systems. Depending on your integration case, these will cover between 30% to 80% of your integration work. The rest is usually configuration, additional modules or additional implementation on top of the "standard" connector or adapter. Usually these integrations are well-tested and resilient, so you can safely rely on using those as a base, however support is always up to the supplier of the integration and oftentimes customisation options are also limited in these services.

### Use the Shopware Migration Assistant

The [Migration Assistant](../../../products/plugins/migration-assistant/) is a Shopware 6 extension that provides import adapters for existing eCommerce systems like Magento 1/2 or Shopware 5. However, its architecture is based on profiles \(more powerful than in the Import/Export module\) and it lets you define custom profiles or extend existing ones. The tool has been build with resilience and import performance in mind and has already served as a base for multiple successful migration projects. It is worth considering, not only for shop migration projects, but also for recurring product imports from external systems.

