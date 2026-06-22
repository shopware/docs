---
nav:
  title: Modify search logic
  position: 80

---

# Modify Search Logic

@Refer: `\Shopware\Commercial\AdvancedSearch\Domain\Search\SearchLogic`

This class is the central place to build the Elasticsearch query:

* Load all searchable fields of the wanted search entity and the current context's sales channel.
* The search term will be tokenized and filtered into a list of "token". For e.g., `The 2 QUICK Brown-Foxes jumped over the lazy dog's bone` will be tokenized to `[ The, 2, QUICK, Brown, Foxes, jumped, over, the, lazy, dog's, bone ]`.
* Each search token will form a bool query to check whether the token matches any of the loaded searchable fields. This step is when `\Shopware\Commercial\AdvancedSearch\Domain\Search\TokenQueryBuilder::build` takes place, it will help to build a `token query`.
* These built queries will be combined into a single query by `AND` or `OR` operators, depending on the search behavior configured at the first step.
* This query will be used by `\Shopware\Elasticsearch\Framework\DataAbstractionLayer\ElasticsearchEntitySearcher` to search.

To modify the search logic, you can decorate the search logic class and add your own logic into it:

```php
$services->set(YourPluginNameSpace\Domain\Search\SearchLogicDecorator::class)
    ->decorate(Shopware\Commercial\AdvancedSearch\Domain\Search\SearchLogic::class)
    ->args([
        service('.inner'),
        service(Shopware\Commercial\AdvancedSearch\Domain\Configuration\ConfigurationLoader::class),
    ]);
```

```php
<?php declare(strict_types=1);

namespace YourPluginNameSpace;

use OpenSearchDSL\Query\Compound\BoolQuery;
use Shopware\Commercial\AdvancedSearch\Domain\Configuration\ConfigurationLoader;
use Shopware\Commercial\AdvancedSearch\Domain\Search\AbstractSearchLogic;
use Shopware\Core\Framework\Api\Context\SalesChannelApiSource;
use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;

class SearchLogicDecorator extends AbstractSearchLogic
{
    public function __construct(
        private readonly AbstractSearchLogic $decorated,
        private readonly ConfigurationLoader $configurationLoader
    ) {
    }

    public function build(EntityDefinition $definition, Criteria $criteria, Context $context): BoolQuery
    {
        if (!$context->getSource() instanceof SalesChannelApiSource) {
            return new BoolQuery();
        }

        $salesChannelId = $context->getSource()->getSalesChannelId();
        // you probably want get the search configs of the context's sales channel but it's optional
        $searchConfig = $this->configurationLoader->load($salesChannelId);

        // you probably want to add extra logic into existing logic but it's optional
        $bool = $this->getDecorated()->build($definition, $criteria, $context);

        // Add your own logic
        return $bool;
    }

    public function getDecorated(): AbstractSearchLogic
    {
        return $this->decorated;
    }
}
```

## Strictness-based matching

Besides the binary `AND` / `OR` operators, the search behavior can be configured with a strictness value (since Commercial 7.11.0) — a decimal between `0.0` and `1.0` that defines the share of the search terms a product must match. It is stored per sales channel in the `strictness` field of the `advanced_search_config` entity (default `1.0`); the legacy `and_logic` flag is deprecated in its favor.

* `0.0` — at least one term must match (equivalent to `OR`).
* `1.0` — all terms must match (equivalent to `AND`).
* A value in between requires `ceil(numberOfTerms × strictness)` terms to match. For example, the query `blue running shoes` (3 terms) with `0.5` requires `ceil(3 × 0.5) = 2` of the terms to match.

The `strictness` field drives the search behavior on its own — no feature flag is required for it to take effect.

To edit it as presets in the Administration (the **Search behavior** section), enable the `SwagCommercial.config.enableAdvancedSearchStrictnessPresets` system configuration. The UI then offers the presets `0`, `0.33`, `0.5`, `0.66`, and `1`; otherwise it shows the legacy `AND` / `OR` toggle (which maps to `1.0` / `0.0`). Regardless of that flag, you can set any decimal between `0.0` and `1.0` directly through the Admin API:

```bash
PATCH /api/advanced-search-config/{id}
{
    "strictness": 0.5
}
```
