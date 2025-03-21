---
nav:
  title: Docker Image
  position: 10

---

# Docker Image

Shopware provides a Docker image to run Shopware 6 in a containerized environment for production intent. The Docker image is based on the official PHP image and includes the required PHP extensions and configurations to run Shopware 6. But it does not contain Shopware itself.
It's intended to be used together with your existing Shopware project, copy the project into the image, build it, and run it.

If you don't have yet a Shopware project, you can create a new one with:

::: info
You can create a Project with a specific Shopware version by specifying the version like: `composer create-project shopware/production:6.6.7.0 <folder>`
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
FROM ghcr.io/shopware/docker-base:$PHP_VERSION-caddy AS base-image
FROM ghcr.io/friendsofshopware/shopware-cli:latest-php-$PHP_VERSION AS shopware-cli

FROM shopware-cli AS build

ADD . /src
WORKDIR /src

RUN --mount=type=secret,id=packages_token,env=SHOPWARE_PACKAGES_TOKEN \
    --mount=type=secret,id=composer_auth,dst=/src/auth.json \
    --mount=type=cache,target=/root/.composer \
    --mount=type=cache,target=/root/.npm \
    /usr/local/bin/entrypoint.sh shopware-cli project ci /src

FROM base-image AS final

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

## Default installed PHP Extensions

The Docker image contains the following PHP extensions: `bcmath`, `gd`, `intl`, `mysqli`, `pdo_mysql`, `pcntl`, `sockets`, `bz2`, `gmp`, `soap`, `zip`, `ffi`, `opcache`, `redis`, `apcu`, `amqp` and `zstd`

## Environment Variables

| Variable                             | Default Value    | Description                                                                              |
|--------------------------------------|------------------|------------------------------------------------------------------------------------------|
| `PHP_SESSION_COOKIE_LIFETIME`        | 0                | [See PHP FPM documentation](https://www.php.net/manual/en/session.configuration.php)     |
| `PHP_SESSION_GC_MAXLIFETIME`         | 1440             | [See PHP FPM documentation](https://www.php.net/manual/en/session.configuration.php)     |
| `PHP_SESSION_HANDLER`                | files            | Set to `redis` for redis session                                                         |
| `PHP_SESSION_SAVE_PATH`              | (empty)          | Set to `tcp://redis:6379` for redis session                                              |
| `PHP_MAX_UPLOAD_SIZE`                | 128m             | See PHP documentation                                                                    |
| `PHP_MAX_EXECUTION_TIME`             | 300              | See PHP documentation                                                                    |
| `PHP_MEMORY_LIMIT`                   | 512m             | See PHP documentation                                                                    |
| `PHP_ERROR_REPORTING`                | E_ALL            | See PHP documentation                                                                    |
| `PHP_DISPLAY_ERRORS`                 | 0                | See PHP documentation                                                                    |
| `PHP_OPCACHE_ENABLE_CLI`             | 1                | See PHP documentation                                                                    |
| `PHP_OPCACHE_FILE_OVERRIDE`          | 1                | See PHP documentation                                                                    |
| `PHP_OPCACHE_VALIDATE_TIMESTAMPS`    | 1                | See PHP documentation                                                                    |
| `PHP_OPCACHE_INTERNED_STRINGS_BUFFER`| 20               | See PHP documentation                                                                    |
| `PHP_OPCACHE_MAX_ACCELERATED_FILES`  | 10000            | See PHP documentation                                                                    |
| `PHP_OPCACHE_MEMORY_CONSUMPTION`     | 128              | See PHP documentation                                                                    |
| `PHP_OPCACHE_FILE_CACHE`             |                  | See PHP documentation                                                                    |
| `PHP_OPCACHE_FILE_CACHE_ONLY`        | 0                | See PHP documentation                                                                    |
| `PHP_REALPATH_CACHE_TTL`             | 3600             | See PHP documentation                                                                    |
| `PHP_REALPATH_CACHE_SIZE`            | 4096k            | See PHP documentation                                                                    |
| `FPM_PM`                             | dynamic          | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_MAX_CHILDREN`                | 5                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_START_SERVERS`               | 2                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_MIN_SPARE_SERVERS`           | 1                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_MAX_SPARE_SERVERS`           | 3                | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |

This table contains only the environment variables that are specific to the Shopware Docker image. You can see all Shopware specific environment variables [here](../configurations/shopware/environment-variables.md)

Additionally, you can use also the [Deployment Helper environment variables](./deployments//deployment-helper.md#environment-variables) to specify default administration credentials, locale, currency, and sales channel URL.

## Possible Mounts

::: info
Our recommendation is to store all files in an external storage provider to not mount any volumes. Refer to [official Shopware docs for setup](https://developer.shopware.com/docs/guides/hosting/infrastructure/filesystem).
:::

In a very basic setup when all files are stored locally you need 5 volumes:

| Usage                  | Path                             |
|------------------------|----------------------------------|
| invoices/private files | `/var/www/html/files`            |
| theme files            | `/var/www/html/public/theme`     |
| images                 | `/var/www/html/public/media`     |
| image thumbnails       | `/var/www/html/public/thumbnail` |
| generated sitemap      | `/var/www/html/public/sitemap`   |

Shopware logs by default to `var/log`, but when `shopware/docker` Composer package is installed, we change it to stdout. This means you can use `docker logs` to see the logs or use logging driver to forward the logs to a logging service.

## Ideal Setup

The ideal setup requires an external storage provider like S3. In that way you don't need any mounts and can scale the instances without any problems.

Additionally, Redis is required for the session storage and the cache, so the Browser sessions are shared between all instances and cache invalidations are happening on all instances.

## Typical Setup

The docker image starts in entry point PHP-FPM / Caddy. So you will need to start a extra container to run maintenance tasks like to install Shopware, install plugins, or run the update. This can be done by installing the [Deployment Helper](./deployments/deployment-helper.md) and creating one container and running as entry point `/setup`

Here we have an example of a `compose.yaml`, how the services could look like:

::: info

This is just an example compose file to demonstrate how the services could look like. It's not a ready to use compose file. You need to adjust it to your needs.

:::

```yaml
x-environment: &shopware
  image: local
  build:
    context: .
  environment:
    DATABASE_URL: 'mysql://shopware:shopware@database/shopware'
    APP_URL: 'http://localhost:8000'
  volumes:
    - files:/var/www/html/files
    - theme:/var/www/html/public/theme
    - media:/var/www/html/public/media
    - thumbnail:/var/www/html/public/thumbnail
    - sitemap:/var/www/html/public/sitemap

services:
    database:
        image: mariadb:11.4

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
```

<PageRef page="https://github.com/shopwareLabs/example-docker-repository/" title="Example Repository with fully working setup" target="_blank" />

## Best Practices

- Pin the docker image using a sha256 digest to ensure you always use the same image
     - Setup Dependabot / Renovate to keep the image up-to-date
- Use a external storage provider for all files, to keep all state out of the container
- Use Redis/Valkey for Cache and Session storage so all instances share the same cache and session
- Use Nginx Variant instead of Caddy as it's more battle tested

## Adding custom PHP extensions

The Docker image is contains the [docker-php-extension-installer](https://github.com/mlocati/docker-php-extension-installer) which allows you to install PHP extensions with the `install-php-extensions` command.

To install a PHP extension you need to add the following to your Dockerfile:

```dockerfile
# ...

USER root
RUN install-php-extensions tideways
USER www-data
```

## Adding custom PHP configuration

Create a new INI file at `/usr/local/etc/php/conf.d/` with the extension `.ini` and add your configuration.

```dockerfile
COPY custom.ini /usr/local/etc/php/conf.d/
```

## FAQ

### No transport supports the given Messenger DSN for Redis

When you are stuck with the error `No transport supports the given Messenger DSN`, you need to install the required package. When the package is already installed, it's mostly a dependency resolving issue. Make sure that you have also the PHP Redis Extension locally installed.
