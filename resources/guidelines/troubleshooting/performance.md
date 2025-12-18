---
nav:
  title: Performance
  position: 20

---

# Performance

## Common Performance Considerations

### Dynamic product groups are slow to load

When you use a `contains` filter in dynamic product groups (especially when you use that on a custom field), the loading of that dynamic product group might get slow.
The reason is that the underlying SQL query is not and cannot be optimized for this kind of filter.
When you use OpenSearch instead of relying on the DB for searching, this issue should be resolved.
Alternatively, for using `contains` on custom fields, it should be preferred to create individual bool custom fields for the different values and check those instead.
When contains on usual fields is used and slow, it should help to add a [custom field](../../../guides/plugins/plugins/framework/custom-field/index) and manually manage that.
Alternatively, [tags](https://docs.shopware.com/en/shopware-6-en/settings/tags) can be used for this purpose.

### Cache is invalided too often

It might be that your caching is not effective because the cache is invalidated too often.
You should look for the reason why the cache is invalidated that frequently.
In general, it means that probably there is a background process running that leads to the cache invalidation.
This could be more obvious cases like cron jobs manually clearing the cache or more subtle cases like your ERP system syncing products frequently,
which will lead to cache invalidations of all pages where those products are referenced.
For cases like the latter, there is the option to only clear the cache delayed and not immediately ([this will be the new default starting with shopware 6.7.0.0](https://github.com/shopware/shopware/blob/trunk/UPGRADE-6.7.md#delayed-cache-invalidation)).
You might consider [activating this feature](../../../guides/hosting/performance/performance-tweaks#redis-for-delayed-cache-invalidation) in older versions.

### High Memory Usage

While using certain APIs or e.g. the `EntityRepository` it might happen that the memory usage is increasing constantly.
First, you should make sure that you have set the `APP_ENV` variable to `prod` in your `.env` file.
If the `APP_ENV` is set to `dev` Shopware keeps many objects for debugging purposes, which will lead to high memory usage.
If the memory usage issue persists after setting `APP_ENV` to `prod`, check if you are using the [sync API](https://shopware.stoplight.io/docs/admin-api/faf8f8e4e13a0-bulk-payloads).
Also consider changing the `indexing-behavior` to your needs if you need to sync many entities.
Another reason for high memory usage might be the logging within the application.
See the logging section in the [performance guide](../../../guides/hosting/performance/performance-tweaks#logging) for more information.
After all, you still can make use of tools like blackfire.io to find the root cause of the memory usage.
