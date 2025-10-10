---
nav:
  title: PHPStan
  position: 10
---

# PHPStan

## Common PHPStan Issues in Shopware Code

### EntityRepositorys Should Define a Generic Type

**Problem**: Repository returns EntityCollection without type information.

```php
$products = $this->productRepository->search($criteria, $context)->getEntities();
foreach ($products as $product) {
    // PHPStan doesn't know $product is ProductEntity
    $name = $product->getName(); // Call to an undefined method Shopware\Core\Framework\DataAbstractionLayer\Entity::getName()
}
```

**Solution**: Add PHPDoc with generics to EntityRepository:

```php
class Foo
{
    /**
     * @param EntityRepository<ProductCollection> $productRepository
     */
    public function __construct(
        private readonly EntityRepository $productRepository,
    ) {
    }

    public function doSomething(): void
    {
        // ...
        $products = $this->productRepository->search($criteria, $context)->getEntities();
        foreach ($products as $product) {
            $name = $product->getName(); // PHPStan correctly identifies this as ProductEntity
        }
    }
}
```

Be aware that the `EntityRepository` class is a generic class, which gets an EntityCollection as type.
This might sound counterintuitive and different to other well-known repository classes, which take the Entity class as the generic type.
But it was the easiest technical solution to get PHPStan to understand the type of the collection returned by the search method.

### Null Safety with First method and Associations

**Problem**: Calling `first` could return `null`, also entity associations can be `null` if not loaded.

```php
$product = $this->productRepository->search($criteria, $context)->first();
$manufacturer = $product->getManufacturer(); // Cannot call method getManufacturer() on Shopware\Core\Content\Product\ProductEntity|null.
$manufacturerName = $manufacturer->getName(); // Cannot call method getName() on Shopware\Core\Content\Product\Aggregate\ProductManufacturer\ProductManufacturerEntity|null.
```

**Solution**: Ensure associations are added before in the criteria and always check for possible `null` returns:

```php
$criteria = new Criteria();
$criteria->addAssociation('manufacturer');

$product = $this->productRepository->search($criteria, $context)->first();
if ($product === null) {
    throw new ProductNotFoundException();
}

$manufacturer = $product->getManufacturer();
if ($manufacturer === null) {
    throw new ManufacturerNotLoadedException();
}

$manufacturerName = $manufacturer->getName(); // No error
```

Or use the null-safe operators:

```php
$manufacturerName = $product?->getManufacturer()?->getName() ?? 'Unknown';
```

### Missing Generic Type for EntityCollection

**Problem**: Custom EntityCollection does not have a generic type.

```php
class FooCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return FooEntity::class;
    }
}

$foo = $fooCollection->first();
if ($foo === null) {
    throw new FooNotFoundException();
}
$foo->bar(); // Cannot call method bar() on Shopware\Core\Framework\DataAbstractionLayer\Entity.
```

**Solution**: Add a generic type to EntityCollection:

```php
/**
 * @extends EntityCollection<FooEntity>
 */
class FooCollection extends EntityCollection
{
    protected function getExpectedClass(): string
    {
        return FooEntity::class;
    }
}

$foo = $fooCollection->first();
if ($foo === null) {
    throw new FooNotFoundException();
}
$foo->bar(); // No error
```
