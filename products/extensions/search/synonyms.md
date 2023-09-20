# Synonyms

The Synonyms are defined in the `%PLUGIN_DIR%/Resources/config/Synonyms.php`. The path to this file is saved in the `swag_ses_synonym_dir` parameter of the container and can be overridden with the default [Dependency Injection](../../../guides/plugins/plugins/plugin-fundamentals/add-plugin-dependencies). See [how to override](synonyms#how-to-override) for more information.

::: info
The syntax in the association is the [Solr syntax](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-synonym-tokenfilter.html#_solr_synonyms).
:::

The path parameter is later passed to the `Swag\EnterpriseSearch\Relevance\SynonymProvider` class.

## Example

```php
// Synonyms.php
<?php declare(strict_types=1);

use Swag\EnterpriseSearch\Relevance\SynonymProvider;

return [
    SynonymProvider::DEFAULT_KEY => [
        'i-pod, i pod => ipod',
        'universe, cosmos',
    ],
];
```

The `SynonymProvider` supports multi-languages and a default fallback. The language code can be added as an array key for a specific language, like the following:

```php
// Synonyms.php with multi-language support
<?php declare(strict_types=1);

use Swag\EnterpriseSearch\Relevance\SynonymProvider;

return [
    SynonymProvider::DEFAULT_KEY => [
        'i-pod, i pod => ipod',
        'universe, cosmos',
    ],
    'en-GB' => [
        'foozball, foosball',
        'sea biscuit, sea biscit => seabiscuit',
    ],
];
```

## How to override

1. Shopware configuration
   1. Shopware is based on Symfony, so it is possible to [override](https://symfony.com/doc/2.0/cookbook/bundles/override.html#services-configuration) the Service parameters in Symfony style.
   1. Parametername `swag_ses_synonym_dir`
1. Own plugin
   1. [Create a plugin](../../../guides/plugins/plugins/plugin-base-guide)
   1. Add a [Dependency Injection](../../../guides/plugins/plugins/plugin-fundamentals/dependency-injection#injecting-another-service) file
   1. Create a file with your [Synonyms](synonyms#example)
   1. [Add a parameter](https://symfony.com/doc/2.0/cookbook/bundles/override.html#services-configuration) to the Dependency Injection file.

```html
// services.xml
<parameters>
    <parameter key="swag_ses_synonym_dir">%kernel.project_dir%/MySynonyms.php</parameter>
</parameter>
```

::: warning
Make sure that the paths match.
:::
