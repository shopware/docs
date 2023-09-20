# Extensibility

<!-- markdown-link-check-disable -->
::: warning
This article uses many Code-References to GitLab. Please contact the Shopware Sales department to get access to the private repository.
:::

To implement the full search experience for your own entity, you have to implement multiple interfaces.

## Search/suggest gateway

You can create your own `SuggestGatewayInterface`/`SearchGatewayInterface` or use the existing SearchGateway.

The Advanced Search offers two ways to extend the search/suggest results. You can implement the following Interfaces within your services:

* [Swag\EnterpriseSearch\Suggest\SuggestGatewayInterface](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Suggest/SuggestGatewayInterface.php)
* [Swag\EnterpriseSearch\Search\SearchGatewayInterface](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Search/SearchGatewayInterface.php)

Or use the existing classes:

* [Swag\EnterpriseSearch\Suggest\SuggestGateway](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Suggest/SuggestGateway.php)
* [Swag\EnterpriseSearch\Search\SearchGateway](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Search/SearchGateway.php)

E.g., for your definition, it means the following:

```html
<service id="YourStuff" class="Swag\EnterpriseSearch\Suggest\SuggestGateway">
  <argument type="service" id="definition.repository"/>
  <argument type="service" id="Swag\EnterpriseSearch\Suggest\SuggestCriteriaBuilder"/>

  <tag name="swag_ses.suggest_gateway" key="yourDefinition"/>
</service>
```

The following tags and keys are used for registering the services in the search/suggest:

```text
swag_ses.suggest_gateway
swag_ses.search_gateway
```

The tagged services are used in the following files:

* [Swag\EnterpriseSearch\Search\MultiSearchGateway](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Search/MultiSearchGateway.php)
* [Swag\EnterpriseSearch\Suggest\MultiSuggestGateway](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Suggest/MultiSuggestGateway.php)

## The search template

To show the results in the search overview, you have to extend the `search/index.html.twig` and then apply the results in your desired styling.

You can take a look at an example of [Search Template](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/tree/release/src/Resources/views/storefront/page/search/index.html.twig).

## The suggest gateway

To show the results in the suggest dropdown, you have to extend [`Storefront/storefront/layout/header/search-suggest.html.twig`](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Resources/views/storefront/layout/header/search-suggest.html.twig) like the Advanced Search does.

## Admin boosting detail

For creating boosting based on your definition, you have to add the name to the following file.

Currently, the values are hardcoded. See here for reference of [Boosting detail modal](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Resources/app/administration/src/module/swag-enterprise-search/components/swag-enterprise-search-boosting-detail-modal/swag-enterprise-search-boosting-detail-modal.html.twig#L48).

## Configuration initial value

You need a first pair of configuration entries for a first search. Therefore you have to create a migration. An example could look like this:

```php
        $salesChannels = $connection->fetchAll('SELECT `id` FROM `sales_channel`');

        foreach ($salesChannels as $salesChannel) {
            $ids = [
                'manufacturer' => Uuid::randomHex(),
                'category' => Uuid::randomHex(),
                'product' => Uuid::randomHex(),
                'salesChannel' => $salesChannel['id'],
            ];

            $defaults = "
                INSERT INTO `gateway_configuration`
                (`id`, `entity_name`, `sales_channel_id`, `max_suggest_count`, `max_search_count`, `created_at`) VALUES
                (UNHEX(:product), 'product', :salesChannel, 10, null, NOW()),
                (UNHEX(:manufacturer), 'product_manufacturer', :salesChannel, 10, 30, NOW()),
                (UNHEX(:category), 'category', :salesChannel, 10, 30, NOW())
            ";

            $connection->executeQuery($defaults, $ids);
        }
```

This can be found in the [`Swag\EnterpriseSearch\Migration\Migration1584020367CreateNewGatewayConfiguration`](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Migration/Migration1584020367CreateNewGatewayConfiguration.php) file.

## Configuration entity

For adding a new configuration while creating a sales channel, you have to create your own [Swag\EnterpriseSearch\Configuration\GatewayConfigurationCreator](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Configuration/GatewayConfigurationCreator.php) and override the `getEntityNames()` with your additional entity.

## Autocompletion

For adding auto-completion of your definition, you have to add a [CompletionEsDefinitionDecorator](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Completion/CompletionEsDefinitionDecorator.php) to it. See this example:

```html
 <service id="swag_completion.manufacturer_es_definition"
          class="Swag\EnterpriseSearch\Completion\CompletionEsDefinitionDecorator"
          decorates="Swag\EnterpriseSearch\Manufacturer\ManufacturerEsDefinition">
      <argument type="service" id="swag_completion.manufacturer_es_definition.inner"/>

      <tag name="swag_ses.completion_definition"/>
 </service>
```

You can also change the `extendEntities()` here to apply multi-word auto-suggestions.

## Additional filtering

You may want to filter your definition. This can be done by extending the CriteriaBuilder. An example can be found in [`Swag\EnterpriseSearch\Category\SalesChannelCategorySearchCriteriaBuilder`](https://gitlab.com/shopware/shopware/enterprise/swagenterprisesearchplatform/-/blob/release/src/Category/SalesChannelCategorySearchCriteriaBuilder.php).

<!-- markdown-link-check-enable -->
