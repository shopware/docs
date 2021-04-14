# Synonyms

The Synonyms are defined in the `%PLUGIN_DIR%/Resources/config/Synonyms.php`. The path to this file is saved in the `swag_ses_synonym_dir` parameter of the container and can be overridden with the default [Dependency Injection](../../../../guides/plugins/plugins/plugin-fundamentals/add-plugin-dependencies.md). See [How to override](synonyms.md#how-to-override) for more information.

{% hint style="info" %}
The syntax in the association may look a bit strange, it's the [Solr syntax](https://www.elastic.co/guide/en/elasticsearch/reference/current/analysis-synonym-tokenfilter.html#_solr_synonyms).
{% endhint %}

The path parameter is afterwards passed to the `Swag\EnterpriseSearch\Relevance\SynonymProvider` class.

## Example

{% code title="Synonyms.php" %}
```php
<?php declare(strict_types=1);

use Swag\EnterpriseSearch\Relevance\SynonymProvider;

return [
    SynonymProvider::DEFAULT_KEY => [
        'i-pod, i pod => ipod',
        'universe, cosmos',
    ],
];
```
{% endcode %}

The `SynonymProvider` supports multi languages and a default fallback! For a specific language the language code can be added as an array key, like the following.

{% code title="Synonyms.php with multi language support" %}
```php
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
{% endcode %}

## How to override

1. Shopware Configuration
   1. Shopware is based on symfony, so it's possible to [override](https://symfony.com/doc/2.0/cookbook/bundles/override.html#services-configuration) the Service parameters in symfony style.
   2. Parametername `swag_ses_synonym_dir`
2. Own Plugin 1. [Create a plugin](../../../../guides/plugins/plugins/plugin-base-guide.md)
   1. Add a [dependency injection](../../../../guides/plugins/plugins/plugin-fundamentals/dependency-injection.md#injecting-another-service) file
   2. Create a file with your synonyms, see [Example](synonyms.md#example)
   3. [Add a parameter](https://symfony.com/doc/2.0/cookbook/bundles/override.html#services-configuration) to the Dependency Injection File.

{% code title="services.xml" %}
```markup
<parameters>
    <parameter key="swag_ses_synonym_dir">%kernel.project_dir%/MySynonyms.php</parameter>
</parameter>
```
{% endcode %}

{% hint style="warning" %}
Make sure that the paths matches!
{% endhint %}

