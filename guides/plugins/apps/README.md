# Apps

{% embed url="https://www.shopware.com/media/pdf/14/2b/06/EN_Apps-Plugins-Themes-All-you-need-to-know.pdf" %}

{% code title="test.twig" %}
```twig
// Some code
{% how does this look in plain text? %}
{% macro getById(mediaId) %}
    {% set criteria = {
        'ids': [ mediaId ]
    } %}
    
     {% return services.repository.search('media', criteria).first %}
{% endmacro %}
```
{% endcode %}
