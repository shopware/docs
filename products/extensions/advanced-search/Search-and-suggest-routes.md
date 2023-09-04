# Search and Suggest Routes

@Refer: `\Shopware\Commercial\AdvancedSearch\Domain\Search\ProductSearchRouteDecorator`

`ProductSearchRoute` is decorated, so when searching for products from the Storefront, a `multiSearchResult` extension is added to the search product listing result. This extension includes all the search results for each Elasticsearch definition with the tag `advanced_search.supported_definition` with the given search term.

The same approach applies to `ProductSuggestRoute`. The only difference is that we added the completion search result as another extension `completionResult` to the search product listing result.

@Refer: `\Shopware\Commercial\AdvancedSearch\Domain\Suggest\ProductSuggestRouteDecorator`

You can also subscribe to the event `\Shopware\Commercial\AdvancedSearch\Event\MultiContentSearchCriteriaEvent` or `\Shopware\Commercial\AdvancedSearch\Event\MultiContentSuggestCriteriaEvent` to adjust the search criteria.

This decoration approach comes with the benefit that the caching mechanism already works for the decorated search routes.
