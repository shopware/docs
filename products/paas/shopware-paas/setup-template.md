---
nav:
  title: Setup Template
  position: 40

---

# Setup Template

The setup template is installed automatically using Symfony Flex when requiring the `paas` package as described in the [Repository](repository). It contains build and deployment logic for Shopware PaaS as well as configuration for the underlying infrastructure and services. In this chapter, we will have a look at these customizations.

Below is an overview of the files and directories added by the PaaS meta-package:

```text
./
├─ .platform/
│  ├─ applications.yaml
│  ├─ routes.yaml
│  ├─ services.yaml
├─ bin/
│  ├─ prestart_cacheclear.sh
├─ config/
│  ├─ packages/
│  │  ├─ paas.yaml
├─ files/
│  ├─ theme-config/
```

## [.platform/applications.yaml](https://github.com/shopware/recipes/blob/main/shopware/paas-meta/6.4/.platform/applications.yaml)

This file contains Shopware PaaS specific configuration and can be customized as needed for your individual project.

### name

It is the name of your app. It is used in commands like:

```bash
shopware ssh -A app 'bin/console theme:dump'
```

Unless there is a specific need for it, leave it as `app`.

### type

This section contains the base image used for your build process. This is also where you configure the PHP version used in your PaaS environment.

### variables

This section contains configuration for environment variables or server settings. General store settings and configurations are set here. Here you can inject custom environment variables or enable feature flags.

Variables in the `env` section are automatically injected as environment variables. If a variable is also set in your .env file, the variables set in the `applications.yaml` file will overwrite these.

### hooks

Lifecycle hooks are custom scripts that are called during your build and deploy processes. See more on the [deployment process](./build-deploy#push-main-branch).

#### build hook

This script is called during the build process and builds your application's assets (composer dependencies, javascript- and css- assets of Shopware core and extensions) and disables the UI installer. You can customize this script if you need. During the execution, you may perform write operations on the file system, which are prohibited in the proceeding steps unless the corresponding directory is [mounted](#mounts).

You do not have access to any of the services (like the database or Redis) configured, as the application is not running yet. You should ensure to perform as much of your entire building procedure during the build step, as web traffic is blocked during the execution of the deploy step.

#### deploy hook

::: warning
The environment will be cut off from web traffic during the execution of the deploy hook. The shorter this script is, the shorter the downtime will be.
:::

This script is called during the deployment process. Theme configuration is copied, the install scripts are executed and secrets are generated.

* Copy theme configuration
* Run database migrations
* Set sales channel domains for non-production environments
* Clear cache

If this is the first deployment, the following operations are performed:

* Setup script is executed
* Theme is set
* Secrets are generated
* `install.lock` file is created

You can also customize this script, however, make sure to keep operations to a minimum, as your store will not be exposed to web traffic during the execution. Connections made during the meantime will be queued in a suspended state and not necessarily fail but will take longer than usual (i.e., until the deployment has finished).

#### post_deploy

Analogous to the two preceding hooks, the post_deploy hook provides an entry point for custom scripts. However, this hook is executed after the application container accepts connections.

### relationships

This section defines the mapping between services created in the [services.yaml](https://github.com/shopware/recipes/blob/main/shopware/paas-meta/6.4/.platform/services.yaml) and the application itself.

### mounts

By default, the entire storage of your application is read-only. Mounts define directories that are writable after the build is complete. They aren’t available during the build.

Every mount has one of two types: `local` or `service`.
A local mount is unique to the service that is accessing it. For example `/var/cache` is a good local mount because the Symfony cache should not be shared between different app servers.
A service mount references to another service (of the type `network-storage`). These mounts are shared between other services and between the different app servers. For example the `/public/media` folder is a good shared mount because the [workers](#workers) that consume the Messenger queue should be able to read and write to the media directory.

### web

The public root of your application `public/index.php` is configured so the server knows where to route dynamic requests.

### workers

Workers are copies of your application instance after the [build hook](#build-hook) has been executed. They are usually configured with a start command. By default, there are two configured workers - one for message queues and one for scheduled tasks.

## [.platform / routes.yaml](https://github.com/shopware/recipes/blob/main/shopware/paas-meta/6.4/.platform/routes.yaml)

This file configures incoming HTTP requests routed to the `app` instance.

## [.platform / services.yaml](https://github.com/shopware/recipes/blob/main/shopware/paas-meta/6.4/.platform/services.yaml)

This file contains services that are used by the `app` instances. Depending on your setup, uncomment or add services that you need, and they will be created and scaled automatically.

In our template there are 4 different services enabled by default:

* `db`
* `cacheredis`
* `rabbitmq`
* `fileshare`

## [files / theme-config](https://github.com/shopware/recipes/tree/main/shopware/paas-meta/6.4/files/theme-config)

We suggest checking in your theme configuration to version control in this directory. Read more on the concept of [builds without database](../../../guides/hosting/installation-updates/deployments/build-w-o-db).

## Automatic Environment Variables

Shopware PaaS automatically sets environment variables based on the services configured in your `services.yaml` and linked via `relationships` in your `applications.yaml`. This eliminates the need to manually configure connection strings.

### Global Variables

These variables are set automatically for every deployment:

| Variable     | Example Value                              |
|--------------|--------------------------------------------|
| `APP_SECRET` | `a3c45d78e91f2b3c4d5e6f7a8b9c0d1e`         |
| `APP_ENV`    | `prod`                                     |
| `APP_URL`    | `https://main-abc123.eu-5.platformsh.site` |
| `MAILER_DSN` | `smtp://localhost:25`                      |

### Database (`database`)

| Variable       | Example Value                                       |
|----------------|-----------------------------------------------------|
| `DATABASE_URL` | `mysql://user:password@database.internal:3306/main` |

### Database Replica (`database-replica`)

| Variable                 | Example Value                                               |
|--------------------------|-------------------------------------------------------------|
| `DATABASE_REPLICA_0_URL` | `mysql://user:password@database-replica.internal:3306/main` |

### RabbitMQ (`rabbitmqqueue`)

| Variable                         | Example Value                                            |
|----------------------------------|----------------------------------------------------------|
| `MESSENGER_TRANSPORT_DSN`        | `amqp://guest:guest@rabbitmq.internal:5672/%2f/messages` |
| `MESSENGER_TRANSPORT_DSN_PREFIX` | `amqp://guest:guest@rabbitmq.internal:5672/%2f/`         |

### Redis Cache (`rediscache`)

| Variable    | Example Value                      |
|-------------|------------------------------------|
| `CACHE_DSN` | `redis://rediscache.internal:6379` |
| `CACHE_URL` | `redis://rediscache.internal:6379` |

### Redis Session (`redissession`)

| Variable             | Example Value                        |
|----------------------|--------------------------------------|
| `SESSION_REDIS_HOST` | `redissession.internal`              |
| `SESSION_REDIS_PORT` | `6379`                               |
| `SESSION_REDIS_URL`  | `redis://redissession.internal:6379` |

### OpenSearch (`opensearch`)

| Variable               | Example Value                     |
|------------------------|-----------------------------------|
| `OPENSEARCH_URL`       | `http://opensearch.internal:9200` |
| `ADMIN_OPENSEARCH_URL` | `http://opensearch.internal:9200` |

### Elasticsearch (`elasticsearch`)

| Variable             | Example Value                        |
|----------------------|--------------------------------------|
| `ELASTICSEARCH_HOST` | `elasticsearch.internal`             |
| `ELASTICSEARCH_PORT` | `9200`                               |
| `ELASTICSEARCH_URL`  | `http://elasticsearch.internal:9200` |

### MongoDB (`mongodatabase`)

| Variable           | Example Value            |
|--------------------|--------------------------|
| `MONGODB_SERVER`   | `mongodb.internal:27017` |
| `MONGODB_DB`       | `main`                   |
| `MONGODB_USERNAME` | `user`                   |
| `MONGODB_PASSWORD` | `password`               |
