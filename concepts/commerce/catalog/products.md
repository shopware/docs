# Products

Products are sellable items within your shop. Depending on your setup, Shopware can handle up to 10.000s of products, with some tweaks even beyond that. However, it depends on other factors like the number of categories, sales channels or product properties.

Let's start with the product data model

![Condensed overview of the product data model](../../../.gitbook/assets/image%20%288%29.png)

You can see, that besides their relation to categories, products can also link to a set of _property group options_.

## Property Groups & Options

Product properties can be modeled using property groups and -options. They can be displayed in a table on your product detail pages, in listings or even be used for filtering.

Exemplary property groups \(e.g. for garments\) are _Size_, _Color_ or _Material_. The corresponding values of each group are referred to as _property group options_. A product can have arbitrarily many property group options.

## Product Variants

Different variations of a product can be modeled using _product variants_. Products are a self-referencing entity, which is interpreted as a parent-child relationship. This mechanism is also used to model variants. Nicely this also provides inheritance between field values from parent products to child products.

![Variant model](../../../.gitbook/assets/image%20%2810%29.png)

However, next to the field inheritance, it is also useful to attach some additional properties to be able to differ product variants. For that reason, it is critical to understand the difference between _properties_ and _options_:

**Properties** are used to model facts about a product, but usually different product variants share these facts. We can refer to properties as _non variant defining_. They could be useful to represent the following information:

* Product Series / Collection
* Washing Instructions
* Manufacturing country

Opposed to that **options** are considered variant defining, as they are the facts that differ from one product variant to another. Such as

* Shirt Size
* Color
* Container volume

It is important to understand the difference between those two, because both provide a relation between the product and the property group option entity, however only one constitutes to product variants.

### Configurator

When a variant product is loaded for a [Store API](../../api/store-api.md)-scoped request, Shopware assembles a configurator object which includes all different property groups and the corresponding variants. This way client applications, such as the [Storefront](../../../guides/plugins/plugins/storefront/) or the [PWA](../../../products/pwa.md) can display the different variant options of the product.

