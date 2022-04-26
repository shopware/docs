# Elasticsearch

Perform the following steps to activate Elasticsearch in your environment.

## Enable service

Add (or uncomment) the elasticsearch service configuration.

{% code title=".platform/services.yaml" %}
```yaml

searchelastic:
    type: elasticsearch:7.9
    disk: 256
```
{% endcode %}

## Add relationship

Add (or uncomment) the relationship for it the app configuration.

{% code title=".platform.app.yaml" %}
```yaml
relationships:
    essearch: "searchelastic:elasticsearch"
```
{% endcode %}

## Configure instance

Please follow the setup and indexing steps to prepare your instance as described in [Set up Elasticsearch](../../guides/hosting/infrastructure/elasticsearch/elasticsearch-setup.md#prepare-shopware-for-elasticsearch).

After that, the following environment variables are automatically set in the `platformsh-env.php` file:

 * `SHOPWARE_ES_HOSTS`
 * `SHOPWARE_ES_INDEXING_ENABLED`
 * `SHOPWARE_ES_INDEX_PREFIX`

## Enable Elasticsearch

Ultimately, activate Elasticsearch, by setting the environment variable `SHOPWARE_ES_ENABLED` to `1`. You can either do that by uncommenting the corresponding line in `platformsh-env.php` or setting it in the [variables](./setup-template.md#variables) section of the app configuration.