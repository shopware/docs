---
nav:
  title: Writer
  position: 80
---

# Writer

The `Writer` objects will get the converted data from the `swag_migration_data` table and write it to the right Shopware 6 table. Each `Writer` supports only one entity, which is most likely the target table.

When creating a writer, register it like this:

```html
<service id="SwagMigrationAssistant\Migration\Writer\ProductWriter"
         parent="SwagMigrationAssistant\Migration\Writer\AbstractWriter">
    <!-- ... -->
    <tag name="shopware.migration.writer"/>
</service>
```

In most cases, you should extend `AbstractWriter`, which provides most behavior. You only need to implement the `supports` method.

```php
// SwagMigrationAssistant\Migration\Writer\ProductWriter

class ProductWriter extends AbstractWriter
{
    public function supports(): string
    {
        return DefaultEntities::PRODUCT;
    }
}
```

If you need more control over writing, you can implement `WriterInterface` yourself, and the class will receive data in the `writeData` method. Received data is an array of converted values. The amount depends on the request limit. Error handling is already done in the surrounding `MigrationDataWriter` class. If writing entries fails with a `WriteException` from the DAL, it tries to exclude the reported failures and write again. If any other exception occurs, it retries entries one by one to minimize data loss.
