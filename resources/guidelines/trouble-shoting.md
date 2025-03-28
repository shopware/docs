---
nav:
  title: Troubleshooting
  position: 80

---

# Troubleshooting

## Performance

### Dynamic product groups are slow to load

When you use a `contains` filter in dynamic product groups (especially when you use that on a custom field), the loading of that dynamic product group might get slow.
The reason is that the underlying SQL query is not and cannot be optimized for this kind of filter. When you use OpenSearch instead of relying on the DB for searching, this issue should be resolved.
Alternatively, for using `contains` on custom fields, it should be preferred to create individual bool custom fields for the different values and check those instead.
When contains on usual fields is used and slow, it should help to add a [custom field](../../guides/plugins/plugins/framework/custom-field/) and manually manage that.
Alternatively, [tags](https://docs.shopware.com/en/shopware-6-en/settings/tags) can be used for this purpose.

### Cache is invalided too often

It might be that your caching is not effective because the cache is invalidated too often. You should look for the reason why the cache is invalidated that frequently.
In general, it means that probably there is a background process running that leads to the cache invalidation.
This could be more obvious cases like cron jobs manually clearing the cache or more subtle cases like your ERP system syncing products frequently, which will lead to cache invalidations of all pages where those products are referenced.
For cases like the latter, there is the option to only clear the cache delayed and not immediately ([this will be the new default starting with shopware 6.7.0.0](https://github.com/shopware/shopware/blob/trunk/UPGRADE-6.7.md#delayed-cache-invalidation)). You might consider [activating this feature](../../guides/hosting/performance/performance-tweaks.md#delayed-invalidation) in older versions.
