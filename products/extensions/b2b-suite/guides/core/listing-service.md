# Listing Service

[Download](../example-plugins/B2bAcl.zip) a plugin showcasing the topic.

## Pattern

A repeating pattern used throughout the B2B Suite is listing service.
The B2B Suite ships without an ORM but still has use for semi-automated basic listing and filtering capabilities.
To reduce the necessary duplications, there are common implementations for this.

The diagram below shows the usually implemented objects with their outside dependencies.

![image](../../../../../.gitbook/assets/listing-service.svg)

## Search struct

The globally used `SearchStruct` is a data container moving the requested filter, sorting, and pagination data from the HTTP request to the repository/query.

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Common\Repository;

use Shopware\B2B\Common\Filter\Filter;

class SearchStruct
{
    /**
     * @var Filter[]
     */
    public array $filters = [];

    public int $limit;

    public int $offset;

    public string $orderBy;

    public string $orderDirection = 'ASC';

    public string $searchTerm;
}
```

A more special `SearchStruct` is the `CompanyFilterStruct`. See the [Company](../../../../../../docs/products/extensions/b2b-suite/guides/storefront/company) module for more details.

## Repository

The repository has to implement `Shopware\B2B\Common\Controller\GridRepository` and therefore have these three methods:

```php
<?php declare(strict_types=1);

namespace My\Namespace;

use Shopware\B2B\Common\Controller\GridRepository;

class Repository implements GridRepository
{
    public function getMainTableAlias(): string;

    /**
     * @return string[]
     */
    public function getFullTextSearchFields(): array;

    public function getAdditionalSearchResourceAndFields(): array;
}
```

But more important than that, it has to handle the data encapsulated in `Shopware\B2B\Common\Repository\SearchStruct` and be able to provide a list of items and a total count of all accessible records.

```php
<?php declare(strict_types=1);

namespace My\Namespace;

use Shopware\B2B\Company\Framework\CompanyFilterStruct\ContactSearchStruct;
use Shopware\B2B\StoreFrontAuthentication\Framework\OwnershipContext;

class Repository
{
    public function fetchList(OwnershipContext $context, ContactSearchStruct $searchStruct): array
    {
        [...]
    }

    public function fetchTotalCount(OwnershipContext $context, ContactSearchStruct $contactSearchStruct): int
    {
        [...]
    }
}
```

Since this task is completely storage engine related, there is no further service abstraction, and every user of this functionality accesses the repository directly.

## Grid helper

The GridHelper binds the HTTP request data to the `SearchStruct` and provides the canonical build grid state array to be consumed by the frontend.

```php
<?php declare(strict_types=1);

namespace Shopware\B2B\Common\Controller;

use Shopware\B2B\Common\MvcExtension\Request;
use Shopware\B2B\Common\Repository\SearchStruct;

class GridHelper
{
    public function extractSearchDataInStoreFront(
        Request $request, 
        SearchStruct $struct
    ): void {
        [...]
    }

    public function getGridState(
        Request $request,
        SearchStruct $struct,
        array $data,
        int $maxPage,
        int $currentPage
    ): array {
        [...]
    }
}
```
