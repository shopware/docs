# Reading and Writing Stock

## Overview

Shopware stores the current stock level alongside the product, this guide will help you when you want to read and write that value.

## Reading Stock

The `product.stock` field should be used to read the current stock level. When building extensions which need to query the stock of a product, use this field. It is always a real time calculated value of the available product stock.

{% code title="<plugin root>/src/Swag/Example/ServiceReadingData.php" %}

```php
<?php declare(strict_types=1);

namespace Swag\Example\Service;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

class ReadingStock
{
    private EntityRepository $productRepository;

    public function __construct(EntityRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }
    
    public function read(Context $context): void
    {
        $product = $this->productRepository
            ->search(new Criteria([$productId]), $context)
            ->first();
            
        $stock = $product->getStock();
    }
}

```

{% endcode %}

## Writing Stock

The `product.stock` field should be used to write the current stock level.

{% code title="<plugin root>/src/Swag/Example/ServiceReadingData.php" %}

```php
<?php declare(strict_types=1);

namespace Swag\Example\Service;

use Shopware\Core\Framework\DataAbstractionLayer\EntityRepository;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

class WritingStock
{
    private EntityRepository $productRepository;

    public function __construct(EntityRepository $productRepository)
    {
        $this->productRepository = $productRepository;
    }
    
    public function write(string $productId, int $stock, Context $context): void
    {
        $this->productRepository->update(
            [
                [
                    'id' => $productId,
                    'stock' => $stock
                ]
            ],
            $context
        );
    }
}

```

{% endcode %}
