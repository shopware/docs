# Elasticsearch

Perform the following steps to activate Elasticsearch in your environment.

## Enable service

Add (or uncomment) the Elasticsearch service configuration.

```yaml
// .platform/services.yaml
elasticsearch:
   type: opensearch:1.2
   disk: 256
```

## Add relationship

Add (or uncomment) the relationship for the app configuration.

```yaml
// .platform.app.yaml
relationships:
    elasticsearch: "elasticsearch:opensearch"
```

## Configure instance

Follow the setup and indexing steps to prepare your instance as described in the [setup Elasticsearch](../../guides/hosting/infrastructure/elasticsearch/elasticsearch-setup#prepare-shopware-for-elasticsearch).

After that, the following environment variables are provided by the Composer package `shopware/paas-meta:

* `SHOPWARE_ES_HOSTS`

## Enable Elasticsearch

Ultimately, activate Elasticsearch by setting the environment variable `SHOPWARE_ES_ENABLED` to `1`. You can either do that by uncommenting the corresponding line in `platformsh-env.php` or setting it in the [variables](./setup-template#variables) section of the app configuration.
