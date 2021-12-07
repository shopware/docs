# Completion

The Enterprise Search does not use the default [Elasticsearch Completion](https://www.elastic.co/guide/en/elasticsearch/reference/7.10/search-suggesters.html#completion-suggester), because it does only support a fixed order and the storage size is high. As an alternative, the Enterprise Search uses aggregations to find the most important words combinations for your search input.

The Full Text Boosted field is used to generate a list of completions. Each word is a separate completion suggestion.

## Extension for compound completions

{% hint style="warning" %}
The default Enterprise Search does not support compound completions from multiple words.
{% endhint %}

To support compound completions, it's necessary to decorate the appropriate Elasticsearch Definition. And add the [Tag](https://symfony.com/doc/current/service_container/tags.html) `swag_ses.completion_definition` to the service, like to Enterprise Search default services. Make sure, that the new created decorator runs after the Enterprise Search decorator, otherwise it will override your values.

{% code title="MyProductDefinitionDecorator.php" %}
```php
<?php declare(strict_types=1);

namespace Swag\Example\Completion;

use Shopware\Core\Framework\Context;
use Shopware\Core\Framework\DataAbstractionLayer\Entity;
use Shopware\Core\Framework\DataAbstractionLayer\EntityCollection;
use Shopware\Core\Framework\DataAbstractionLayer\EntityDefinition;
use Shopware\Core\Framework\DataAbstractionLayer\Search\Criteria;
use Shopware\Elasticsearch\Framework\AbstractElasticsearchDefinition;
use Shopware\Elasticsearch\Framework\FullText;

class MyProductDefinitionDecorator extends AbstractElasticsearchDefinition
{
    private AbstractElasticsearchDefinition $decorated;

    public function __construct(
        AbstractElasticsearchDefinition $decorated
    ) {
        $this->decorated = $decorated;
    }

    public function getMapping(Context $context): array
    {
        return $this->decorated->getMapping($context);
    }

    public function extendCriteria(Criteria $criteria): void
    {
        $this->decorated->extendCriteria($criteria);
    }

    public function buildFullText(Entity $entity): FullText
    {
        return $this->decorated->buildFullText($entity);
    }

    public function getEntityDefinition(): EntityDefinition
    {
        return $this->decorated->getEntityDefinition();
    }

    public function extendEntities(EntityCollection $collection): EntityCollection
    {
        $collection = $this->decorated->extendEntities($collection);

        foreach ($collection->getIterator() as $entity) {
            // Here you can add your custom completions
            $completionTerms = ['blue shoes', 'green socks'];

            CompletionExtension::addCompletionExtension($entity, $completionTerms);
        }

        return $collection;
    }
}
```
{% endcode %}

