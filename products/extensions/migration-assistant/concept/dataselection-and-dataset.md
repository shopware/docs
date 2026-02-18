---
nav:
  title: DataSelection and DataSet
  position: 20

---

# DataSelection and DataSet

These are the fundamental data structures for defining what to migrate. Each `DataSelection` consists of one or more `DataSets`:

* ProductDataSelection \(position: 100\)
  * MediaFolderDataSet
  * ProductAttributeDataSet
  * ProductPriceAttributeDataSet
  * ManufacturerAttributeDataSet
  * ProductDataSet
  * PropertyGroupOptionDataSet
  * ProductOptionRelationDataSet
  * ProductPropertyRelationDataSet
  * TranslationDataSet
  * CrossSellingDataSet
* MediaDataSelection \(position: 300\)
  * MediaFolderDataSet
  * MediaDataSet

The order of the `DataSets` in the `DataSelection` class is important and specifies the processing order. `DataSelection` also holds a position specifying the order applied when migrating \(lower numbers are migrated earlier\). The `getDataSetsRequiredForCount` method returns an array of all `DataSets`. Its count should be displayed in the Administration.

Please take a look at the `DataSelection` example:

```php
// SwagMigrationAssistant\Profile\Shopware\DataSelection\ProductDataSelection

class ProductDataSelection implements DataSelectionInterface
{
    public const IDENTIFIER = 'products';

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface;
    }

    public function getData(): DataSelectionStruct
    {
        return new DataSelectionStruct(
            self::IDENTIFIER,
            $this->getDataSets(),
            $this->getDataSetsRequiredForCount(),
            'swag-migration.index.selectDataCard.dataSelection.products', // Snippet name
            100, // The position of the dataSelection
            true, // Is process-media needed (to download / copy images for example),
            DataSelectionStruct::BASIC_DATA_TYPE, // specify the type of data (core data or plugin data)
            false // Is the selection required for every migration? (the user can't unselect this data selection)
        );
    }

    public function getDataSets(): array
    {
        return [
            // The order matters!
            new MediaFolderDataSet(),
            new ProductAttributeDataSet(),
            new ProductPriceAttributeDataSet(),
            new ManufacturerAttributeDataSet(),
            new ProductDataSet(),
            new PropertyGroupOptionDataSet(),
            new ProductOptionRelationDataSet(),
            new ProductPropertyRelationDataSet(),
            new TranslationDataSet(),
            new CrossSellingDataSet(),
            new MainVariantRelationDataSet(),
        ];
    }

    public function getDataSetsRequiredForCount(): array
    {
        return [
            new ProductDataSet(),
        ];
    }
}
```

Here's a `DataSet` example:

```php
// SwagMigrationAssistant\Profile\Shopware\DataSelection\DataSet\ProductDataSet

class ProductDataSet extends DataSet
{
    public static function getEntity(): string
    {
        return DefaultEntities::PRODUCT;
    }

    public function supports(MigrationContextInterface $migrationContext): bool
    {
        return $migrationContext->getProfile() instanceof ShopwareProfileInterface;
    }
}
```

The `DataSelections` are registered the following way:

```html
<service id="SwagMigrationAssistant\Profile\Shopware\DataSelection\ProductDataSelection">
    <tag name="shopware.migration.data_selection"/>
</service>
```

It is also possible to specify the same `DataSets` in multiple `DataSelections` \(this should only be done if no other options are available\). Have a look at the `ProductReviewDataSelection`:

::: info
There are duplicate `DataSets` from `ProductDataSelection`, because they are also required if the user does not select the product `DataSelection`. If the user selects both, these `DataSets` are only migrated once \(with their first occurrence\).
:::

```php
// SwagMigrationAssistant\Profile\Shopware\DataSelection\ProductReviewDataSelection

class ProductReviewDataSelection implements DataSelectionInterface
{
    public const IDENTIFIER = 'productReviews';

    // ...

    public function getDataSets(): array
    {
        return [
            new MediaFolderDataSet(),
            new ProductAttributeDataSet(),
            new ProductPriceAttributeDataSet(),
            new ManufacturerAttributeDataSet(),
            new ProductDataSet(),
            new PropertyGroupOptionDataSet(),
            new ProductOptionRelationDataSet(),
            new ProductPropertyRelationDataSet(),
            new TranslationDataSet(),
            new CrossSellingDataSet(),
            new CustomerAttributeDataSet(),
            new CustomerDataSet(),
            new ProductReviewDataSet(),
        ];
    }
}
```
