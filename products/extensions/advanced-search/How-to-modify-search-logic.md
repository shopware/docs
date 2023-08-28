# Modify Search Logic

@Refer: `\Shopware\Commercial\AdvancedSearch\Domain\Search\SearchLogic`

This class is the central place to build the Elasticsearch query:

* Load all searchable fields of the wanted search entity and the current context's sales channel.
* The search term will be tokenized and filtered into a list of "token". For e.g., `The 2 QUICK Brown-Foxes jumped over the lazy dog's bone` will be tokenized to `[ The, 2, QUICK, Brown, Foxes, jumped, over, the, lazy, dog's, bone ]`.
* Each search token will form a bool query to check whether the token matches any of the loaded searchable fields. This step is when `\Shopware\Commercial\AdvancedSearch\Domain\Search\TokenQueryBuilder::build` takes place, it will help to build a `token query`.
* These built queries will be combined into a single query by `AND` or `OR` operators, depending on the search behavior configured at the first step.
* This query will be used by `\Shopware\Elasticsearch\Framework\DataAbstractionLayer\ElasticsearchEntitySearcher` to search.

To modify the search logic, you can decorate the search logic class and add your own logic into it:

```xml
<service id="YourPluginNameSpace\Domain\Search\SearchLogicDecorator" decorates="Shopware\Commercial\AdvancedSearch\Domain\Search\SearchLogic">
    <argument type="service" id=".inner"/>
    <argument type="service" id="Shopware\Commercial\AdvancedSearch\Domain\Configuration\ConfigurationLoader"/>
</service>
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
