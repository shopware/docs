---
nav:
  title: Docker Image
  position: 10

---

Shopware provides a Docker image to run Shopware 6 in a containerized environment for production intent. The Docker image is based on the official PHP image and includes the required PHP extensions and configurations to run Shopware 6. But it does not contain Shopware itself. 
It's intended to be used together with your existing Shopware project, copy the project into the image, build it, and run it.

If you don't have yet a Shopware project, you can create a new one with:

::: info
You can create a Project with a specific Shopware version by specifiying the version like: `composer create-project shopware/production:6.6.7.0 <folder>`
:::


```bash
composer create-project shopware/production <folder>
cd <folder>
composer require shopware/docker
```

The typical Dockerfile in your project would look like this:

```dockerfile
#syntax=docker/dockerfile:1.4

ARG PHP_VERSION=8.3
FROM ghcr.io/shopware/docker-base:$PHP_VERSION-caddy as base-image
FROM ghcr.io/friendsofshopware/shopware-cli:latest-php-$PHP_VERSION as shopware-cli

FROM shopware-cli as build

ADD . /src
WORKDIR /src

RUN --mount=type=secret,id=packages_token,env=SHOPWARE_PACKAGES_TOKEN \
    --mount=type=secret,id=composer_auth,dst=/src/auth.json \
    --mount=type=cache,target=/root/.composer \
    --mount=type=cache,target=/root/.npm \
    /usr/local/bin/entrypoint.sh shopware-cli project ci /src

FROM base-image

COPY --from=build --chown=82 --link /src /var/www/html
```

The Dockerfile uses the `shopware-cli` image to build the project and then copies the built project into the `base-image` image. The `base-image` is the Shopware Docker image.

::: info
Instead of copying the Dockerfile to your project, rather run `composer req shopware/docker` to add the Dockerfile to your project. This keeps the Dockerfile up-to-date with the latest changes using Symfony Flex recipes.
:::

## Available Tags / Versioning

The Docker image is versioned by the PHP Version and the PHP Patch version. The Docker Image is updated daily and contains the latest security patches.

The following tags are available with Caddy:

- `shopware/docker-base:8.3` - PHP 8.3 with Caddy
- `shopware/docker-base:8.3-caddy` - PHP 8.3 with Caddy (same as above, but more explicit)
- `shopware/docker-base:8.3.12-caddy` - PHP 8.3.12 with Caddy (same as above, but much more explicit)
- `shopware/docker-base:8.3-caddy-otel` - PHP 8.3 with Caddy and OpenTelemetry

We also have Nginx images available:

- `shopware/docker-base:8.3-nginx` - PHP 8.3 with Nginx (same as above, but more explicit)
- `shopware/docker-base:8.3.12-nginx` - PHP 8.3.12 with Nginx (same as above, but much more explicit)
- `shopware/docker-base:8.3-nginx-otel` - PHP 8.3 with Nginx and OpenTelemetry

Additionally we have also FPM only images available:

- `shopware/docker-base:8.3-fpm` - PHP 8.3 with FPM
- `shopware/docker-base:8.3.12-fpm` - PHP 8.3.12 with FPM (same as above, but much more explicit)
- `shopware/docker-base:8.3-fpm-otel` - PHP 8.3 with FPM and OpenTelemetry
- `shopware/docker-base:8.3.12-fpm-otel` - PHP 8.3.12 with FPM and OpenTelemetry (same as above, but much more explicit)


The images are available at Docker Hub and GitHub Container Registry (ghcr.io) with the same names and tags.

## Environment Variables

| Variable                             | Default Value    | Description                                                                              |
|--------------------------------------|------------------|------------------------------------------------------------------------------------------|
| APP_ENV                              | prod             | Environment                                                                              |
| APP_SECRET                           | (empty)          | Can be generated with `openssl rand -hex 32`                                             |
| INSTANCE_ID                          | (empty)          | Unique Identifier for the Store: Can be generated with `openssl rand -hex 32`            |
| JWT_PRIVATE_KEY                      | (empty)          | Can be generated with `shopware-cli project generate-jwt --env`                          |
| JWT_PUBLIC_KEY                       | (empty)          | Can be generated with `shopware-cli project generate-jwt --env`                          |
| LOCK_DSN                             | flock            | DSN for Symfony locking                                                                  |
| APP_URL                              | (empty)          | Where Shopware will be accessible                                                        |
| DATABASE_HOST                        | (empty)          | Host of MySQL (needed for for checking is MySQL alive)                                   |
| DATABASE_PORT                        | 3306             | Host of MySQL (needed for for checking is MySQL alive)                                   |
| BLUE_GREEN_DEPLOYMENT                | 0                | This needs super priviledge to create trigger                                            |
| DATABASE_URL                         | (empty)          | MySQL credentials as DSN                                                                 |
| DATABASE_SSL_CA                      | (empty)          | Path to SSL CA file (needs to be readable for uid 512)                                   |
| DATABASE_SSL_CERT                    | (empty)          | Path to SSL Cert file (needs to be readable for uid 512)                                 |
| DATABASE_SSL_KEY                     | (empty)          | Path to SSL Key file (needs to be readable for uid 512)                                  |
| DATABASE_SSL_DONT_VERIFY_SERVER_CERT | (empty)          | Disables verification of the server certificate (1 disables it)                          |
| MAILER_DSN                           | null://localhost | Mailer DSN (Admin Configuration overwrites this)                                         |
| OPENSEARCH_URL                       | (empty)          | OpenSearch Hosts                                                                         |
| SHOPWARE_ES_ENABLED                  | 0                | OpenSearch Support Enabled?                                                              |
| SHOPWARE_ES_INDEXING_ENABLED         | 0                | OpenSearch Indexing Enabled?                                                             |
| SHOPWARE_ES_INDEX_PREFIX             | (empty)          | OpenSearch Index Prefix                                                                  |
| COMPOSER_HOME                        | /tmp/composer    | Caching for the Plugin Manager                                                           |
| SHOPWARE_HTTP_CACHE_ENABLED          | 1                | Is HTTP Cache enabled?                                                                   |
| SHOPWARE_HTTP_DEFAULT_TTL            | 7200             | Default TTL for Http Cache                                                               |
| MESSENGER_TRANSPORT_DSN              | (empty)          | DSN for default async queue (example: `amqp://guest:guest@localhost:5672/%2f/default`    |
| MESSENGER_TRANSPORT_LOW_PRIORITY_DSN | (empty)          | DSN for low priority  queue (example: `amqp://guest:guest@localhost:5672/%2f/low_prio`   |
| MESSENGER_TRANSPORT_FAILURE_DSN      | (empty)          | DSN for failed messages queue (example: `amqp://guest:guest@localhost:5672/%2f/failure`  |
| COMPOSER_PLUGIN_LOADER               | 1                | [When enabled, disables dynamic plugin loading all plugins needs to be installed with Composer](https://developer.shopware.com/docs/guides/hosting/installation-updates/cluster-setup.html#composer-plugin-loader)
| INSTALL_LOCALE                       | en-GB            | Default locale for the Shop                                                              |
| INSTALL_CURRENCY                     | EUR              | Default currency for the Shop                                                            |
| INSTALL_ADMIN_USERNAME               | admin            | Default admin username                                                                   |
| INSTALL_ADMIN_PASSWORD               | shopware         | Default admin password                                                                   |
| PHP_SESSION_COOKIE_LIFETIME          | 0                | [See PHP FPM documentation](https://www.php.net/manual/en/session.configuration.php)     |
| PHP_SESSION_GC_MAXLIFETIME           | 1440             | [See PHP FPM documentation](https://www.php.net/manual/en/session.configuration.php)     |
| PHP_SESSION_HANDLER                  | files            | Set to `redis` for redis session                                                         |
| PHP_SESSION_SAVE_PATH                | (empty)          | Set to `tcp://redis:6379` for redis session                                              |
| PHP_MAX_UPLOAD_SIZE                  | 128m             | See PHP documentation                                                                    |
| PHP_MAX_EXECUTION_TIME               | 300              | See PHP documentation                                                                    |
| PHP_MEMORY_LIMIT                     | 512m             | See PHP documentation                                                                    |
| PHP_ERROR_REPORTING                  | E_ALL            | See PHP documentation                                                                    |
| PHP_DISPLAY_ERRORS                   | 0                | See PHP documentation                                                                    |
| PHP_OPCACHE_ENABLE_CLI               | 1                | See PHP documentation                                                                    |
| PHP_OPCACHE_FILE_OVERRIDE            | 1                | See PHP documentation                                                                    |
| PHP_OPCACHE_VALIDATE_TIMESTAMPS      | 1                | See PHP documentation                                                                    |
| PHP_OPCACHE_INTERNED_STRINGS_BUFFER  | 20               | See PHP documentation                                                                    |
| PHP_OPCACHE_MAX_ACCELERATED_FILES    | 10000            | See PHP documentation                                                                    |
| PHP_OPCACHE_MEMORY_CONSUMPTION       | 128              | See PHP documentation                                                                    |
| PHP_OPCACHE_FILE_CACHE               |                  | See PHP documentation                                                                    |
| PHP_OPCACHE_FILE_CACHE_ONLY          | 0                | See PHP documentation                                                                    |
| PHP_REALPATH_CACHE_TTL               | 3600             | See PHP documentation                                                                    |
| PHP_REALPATH_CACHE_SIZE              | 4096k            | See PHP documentation                                                                    |
| FPM_PM                               | dynamic          | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| FPM_PM_MAX_CHILDREN                  | 5                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| FPM_PM_START_SERVERS                 | 2                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| FPM_PM_MIN_SPARE_SERVERS             | 1                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| FPM_PM_MAX_SPARE_SERVERS             | 3                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |

## Possible Mounts

::: info
Our recommandation is to store all files in an external storage provider to not mount any volumes. Refer to [official Shopware docs for setup](https://developer.shopware.com/docs/guides/hosting/infrastructure/filesystem).
:::

In a very basic setup when all files are stored locally you need 5 volumes:

| Usage                  | Path                           |
|------------------------|--------------------------------|
| invoices/private files | /var/www/html/files            |
| theme files            | /var/www/html/public/theme     |
| images                 | /var/www/html/public/media     |
| image thumbnails       | /var/www/html/public/thumbnail |
| generated sitemap      | /var/www/html/public/sitemap   |


Shopware logs by default to `var/log`, but when `shopware/docker` Composer package is installed, we change it to stdout. This means you can use `docker logs` to see the logs or use logging driver to forward the logs to a logging service.

## Ideal Setup

The ideal setup requires an external storage provider like S3. In that way you can don't need any mounts and can scale the instances without any problems.

Additionally Redis is required for the session storage and the cache, so the Browser sessions are shared between all instances and cache invalidations are happening on all instances.

## Typical Setup

The docker image starts in entrypoint PHP-FPM / Caddy. So you will need to start a extra container to run maintenance tasks like to install Shopware, install plugins, or run the update. This can be done by installing the [Deployment Helper](./deployments/deployment-helper.md) and creating one container and running as entrypoint `/setup`

Here is an example of the `compose.yml` (`docker-compose.yml`) with all the requierd services:

```yaml
x-environment: &shopware
  image: local
  build:
    context: .
  environment:
    APP_ENV: prod
    DATABASE_URL: 'mysql://shopware:shopware@database/shopware'
    DATABASE_HOST: 'database'
    APP_URL: 'http://localhost:8000'
    APP_SECRET: 'test'
    PHP_SESSION_HANDLER: redis
    PHP_SESSION_SAVE_PATH: 'tcp://cache:6379/1'
  volumes:
    - files:/var/www/html/files
    - theme:/var/www/html/public/theme
    - media:/var/www/html/public/media
    - thumbnail:/var/www/html/public/thumbnail
    - sitemap:/var/www/html/public/sitemap

services:
    database:
        image: mariadb:11.4
        environment:
            MARIADB_ROOT_PASSWORD: shopware
            MARIADB_USER: shopware
            MARIADB_PASSWORD: shopware
            MARIADB_DATABASE: shopware
        volumes:
            - mysql-data:/var/lib/mysql
        healthcheck:
            test: [ "CMD", "mariadb-admin" ,"ping", "-h", "localhost", "-pshopware" ]
            timeout: 20s
            retries: 10

    init-perm:
        image: alpine
        volumes:
            - files:/var/www/html/files
            - theme:/var/www/html/public/theme
            - media:/var/www/html/public/media
            - thumbnail:/var/www/html/public/thumbnail
            - sitemap:/var/www/html/public/sitemap
        command: chown 82:82 /var/www/html/files /var/www/html/public/theme /var/www/html/public/media /var/www/html/public/thumbnail /var/www/html/public/sitemap

    init:
        <<: *shopware
        entrypoint: /setup
        depends_on:
            db:
                condition: service_started
            init-perm:
                condition: service_completed_successfully
    web:
        <<: *shopware
        depends_on:
            init:
                condition: service_completed_successfully
        ports:
            - 8000:8000

    worker:
        <<: *shopware
        depends_on:
            init:
                condition: service_completed_successfully
        entrypoint: [ "php", "bin/console", "messenger:consume", "async", "low_priority", "--time-limit=300", "--memory-limit=512M" ]
        deploy:
            replicas: 3

    scheduler:
        <<: *shopware
        depends_on:
            init:
                condition: service_completed_successfully
        entrypoint: [ "php", "bin/console", "scheduled-task:run" ]

volumes:
    mysql-data:
    files:
    theme:
    media:
    thumbnail:
    sitemap:
```

## Best Practices

- Pin the docker image using a sha256 digest to ensure you always use the same image
     - Setup Dependabot / Renovate to keep the image up-to-date
- Use a external storage provider for all files, to keep all state out of the container
- Use Redis/Valkey for Cache and Session storage so all instances share the same cache and session
- Use Nginx Variant instead of Caddy as it's more battle tested

## FAQ

### No transport supports the given Messenger DSN for Redis

When you are stuck with the error `No transport supports the given Messenger DSN`, you need to install the required package. When the package is already installed, it's mostly a dependency resolving issue. Make sure that you have also the PHP Redis Extension locally installed.

