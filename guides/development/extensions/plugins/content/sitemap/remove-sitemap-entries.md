---
nav:
  title: Remove sitemap entries
  position: 30

---

# Remove Sitemap Entries

## Overview

This guide covers how to remove URLs from the sitemap.

## By using the configuration

To remove a URL from the sitemap, use the configuration setting `shopware.sitemap.excluded_urls`

```yaml
shopware:
    sitemap:
        excluded_urls:
            -   salesChannelId: '98432def39fc4624b33213a56b8c944d'
                resource: 'Shopware\Core\Content\Product\ProductEntity'
                identifier: 'd20e4d60e35e4afdb795c767eee08fec'
```

The `salesChannelId` is the ID of the sales channel from which you want to exclude the URL.
The `resource` is the full class name of the entity from which you want to exclude the URL, for example, `Shopware\Core\Content\Product\ProductEntity`.
The `identifier` is the entity's ID for which you want to exclude the URL.
