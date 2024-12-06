---
nav:
  title: Cross search
  position: 60

---

# Cross Search

@Refer: `\Shopware\Commercial\AdvancedSearch\Domain\CrossSearch\CrossSearchLogic`

At times, the need arises to search for categories using product names. To enable Elasticsearch with this capability, it becomes essential to index associated data across different indexes. However, it's important to note that this operation leads to a notable increase in the overall size of the index.

To solve this problem, an **experimental** feature called Cross Search has been introduced. You can configure which associations could be cross-searched:

```yaml
# config/packages/advanced_search.yaml
advanced_search:
  # When searching for `manufacturer.product.name`, if `product_manufacturer.product` cross_search is enabled, the `product` index will be used for search field `name`
  cross_search:
    product.product_manufacturer: false
    product.category: false
    category.product: true
    product_manufacturer.product: true
```

By default, only `category - product` and `product_manufacturer - product` associations are enabled, but you can change this behavior in the parameter. This way, we don't need to index product's data inside category and manufacturer indexes.

You can add your own Cross Search mapping to the parameter. If the mapping is not defined or is false, you need to index the associated data accordingly.

Be aware that this comes with a downside: when Cross Search is enabled, we need an extra aggregated Elasticsearch query to accomplish the desired search behavior.
