# Elasticsearch

Perform the following steps to activate Elasticsearch in your environment.

## Enable service

Add (or uncomment) the Elasticsearch service configuration.

{% code title=".platform/services.yaml" %}

```yaml
elasticsearch:
   type: opensearch:1.2
   disk: 256
```

{% endcode %}

## Add relationship

Add (or uncomment) the relationship for it the app configuration.

{% code title=".platform.app.yaml" %}

```yaml
relationships:
    elasticsearch: "elasticsearch:opensearch"
```

{% endcode %}

## Configure instance

Follow the setup and indexing steps to prepare your instance as described in the [Set up Elasticsearch](../../guides/hosting/infrastructure/elasticsearch/elasticsearch-setup.md#prepare-shopware-for-elasticsearch).

After that, the following environment variables are provided by the composer package `shopware/paas-meta:

* `SHOPWARE_ES_HOSTS`

## Enable Elasticsearch

Ultimately, activate Elasticsearch by setting the environment variable `SHOPWARE_ES_ENABLED` to `1`. You can enable this by adding it to your `.platform.app.yaml` file.
