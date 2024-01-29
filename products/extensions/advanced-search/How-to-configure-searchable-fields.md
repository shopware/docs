---
nav:
  title: Configure Searchable Fields
  position: 40

---

# Configure Searchable Fields

Search entities and their searchable fields are stored in `advanced_search_config` and `advanced_search_config_field` table respectively.

These configured fields help to build the search query when a search/suggest request is sent from the client.

This approach is very similar to how `product_search_config` and `product_search_config_field` work in the platform. The main difference is you can configure the configuration by sales channel instead of by language (each sales channel now has its own search config).

@Refer:

`\Shopware\Commercial\AdvancedSearch\Entity\AdvancedSearchConfig\AdvancedSearchConfigDefinition`
`\Shopware\Commercial\AdvancedSearch\Entity\AdvancedSearchConfig\Aggregate\AdvancedSearchConfigFieldDefinition`

To have the custom search configuration, you need to add a migration to insert the configuration into the database. In the below example, we add default search configuration for product, manufacturer, and category entities

@Refer: `\Shopware\Commercial\Migration\Migration1680751315SWAGAdvancedSearch_AddAdvancedSearchConfigurationDefaults`

And you might want to add the configuration for newly created saleschannel as well:
@Refer: `\Shopware\Commercial\AdvancedSearch\Subscriber\SalesChannelCreatedSubscriber`
