---
nav:
  title: Remove sitemap entries
  position: 30
---

# Remove Sitemap Entries

This guide shows how to exclude specific URLs from the sitemap.

## Using the configuration

To remove a URL from the sitemap, use the `shopware.sitemap.excluded_urls` configuration key.

```yaml
shopware:
    sitemap:
        excluded_urls:
            -   salesChannelId: '98432def39fc4624b33213a56b8c944d'
                resource: 'Shopware\Core\Content\Product\ProductEntity'
                identifier: 'd20e4d60e35e4afdb795c767eee08fec'
```

The `salesChannelId` is the ID of the sales channel you want to exclude the URL from.
The `resource` is the fully qualified class name used by the sitemap URL provider, for example, `Shopware\Core\Content\Product\ProductEntity`.
The `identifier` is the entity ID of the record you want to exclude.

To find matching values, inspect the provider that generates the sitemap entries for your entity type.
