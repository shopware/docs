---
nav:
  title: Docker Image
  position: 10

---

# Docker Image

Shopware provides a Docker image to run Shopware 6 in a containerized environment for production intent. The Docker image is based on the official PHP image and includes the required PHP extensions and configurations to run Shopware 6. But it does not contain Shopware itself.
It's intended to be used together with your existing Shopware project, copy the project into the image, build it, and run it.

If you don't have a Shopware project yet, you can create a new one with:

::: info
You can create a Project with a specific Shopware version by specifying the version like: `composer create-project shopware/production:6.6.7.0 <folder>`
:::

```bash
composer create-project shopware/production <folder>
cd <folder>
composer require shopware/docker
```

The typical Dockerfile in your project would look like this:

::: info
You may want to pin the Docker image to a specific sha256 digest to ensure you always use the same image. See [Best Practices](https://docs.docker.com/build/building/best-practices/#pin-base-image-versions) for more information.
:::

```dockerfile
#syntax=docker/dockerfile:1.4

ARG PHP_VERSION=8.3
FROM ghcr.io/shopware/docker-base:$PHP_VERSION-frankenphp AS base-image
FROM ghcr.io/shopware/shopware-cli:latest-php-$PHP_VERSION AS shopware-cli

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

::: info
We recommend using FrankenPHP over Caddy or Nginx, as it does automatic resource allocation and requires just one process to run PHP, which is better suited for containerized environments.
:::

The Docker image is versioned by the PHP Version and the PHP Patch version. The Docker Image is updated daily and contains the latest security patches.

The following tags are available with our recommended FrankenPHP image:

- `ghcr.io/shopware/docker-base:8.3-frankenphp` - PHP 8.3 with FrankenPHP
- `ghcr.io/shopware/docker-base:8.3.12-frankenphp` - PHP 8.3.12 with FrankenPHP (same as above, but much more explicit)
- `ghcr.io/shopware/docker-base:8.3-frankenphp-otel` - PHP 8.3 with FrankenPHP and OpenTelemetry
- `ghcr.io/shopware/docker-base:8.3.12-frankenphp-otel` - PHP 8.3.12 with FrankenPHP and OpenTelemetry (same as above, but much more explicit)

All images (FrankenPHP, Caddy, Nginx, FPM only) are available at Docker Hub and GitHub Container Registry ([ghcr.io](https://github.com/shopware/docker/pkgs/container/docker-base)) with the same names and tags.

## Default installed PHP Extensions

The Docker image contains the following PHP extensions: `bcmath`, `gd`, `intl`, `mysqli`, `pdo_mysql`, `pcntl`, `sockets`, `bz2`, `gmp`, `soap`, `zip`, `ftp`, `ffi`, `opcache`, `redis`, `apcu`, `amqp` and `zstd`

## Environment Variables

| Variable                              | Default Value | Description                                                                              |
|---------------------------------------|---------------|------------------------------------------------------------------------------------------|
| `PHP_SESSION_COOKIE_LIFETIME`         | 0             | [See PHP FPM documentation](https://www.php.net/manual/en/session.configuration.php)     |
| `PHP_SESSION_GC_MAXLIFETIME`          | 1440          | [See PHP FPM documentation](https://www.php.net/manual/en/session.configuration.php)     |
| `PHP_SESSION_HANDLER`                 | files         | Set to `redis` for redis session                                                         |
| `PHP_SESSION_SAVE_PATH`               | (empty)       | Set to `tcp://redis:6379` for redis session                                              |
| `PHP_MAX_UPLOAD_SIZE`                 | 128m          | See PHP documentation                                                                    |
| `PHP_MAX_EXECUTION_TIME`              | 300           | See PHP documentation                                                                    |
| `PHP_MEMORY_LIMIT`                    | 512m          | See PHP documentation                                                                    |
| `PHP_ERROR_REPORTING`                 | E_ALL         | See PHP documentation                                                                    |
| `PHP_DISPLAY_ERRORS`                  | 0             | See PHP documentation                                                                    |
| `PHP_OPCACHE_ENABLE_CLI`              | 1             | See PHP documentation                                                                    |
| `PHP_OPCACHE_FILE_OVERRIDE`           | 1             | See PHP documentation                                                                    |
| `PHP_OPCACHE_VALIDATE_TIMESTAMPS`     | 1             | See PHP documentation                                                                    |
| `PHP_OPCACHE_INTERNED_STRINGS_BUFFER` | 20            | See PHP documentation                                                                    |
| `PHP_OPCACHE_MAX_ACCELERATED_FILES`   | 10000         | See PHP documentation                                                                    |
| `PHP_OPCACHE_MEMORY_CONSUMPTION`      | 128           | See PHP documentation                                                                    |
| `PHP_OPCACHE_FILE_CACHE`              |               | See PHP documentation                                                                    |
| `PHP_OPCACHE_FILE_CACHE_ONLY`         | 0             | See PHP documentation                                                                    |
| `PHP_REALPATH_CACHE_TTL`              | 3600          | See PHP documentation                                                                    |
| `PHP_REALPATH_CACHE_SIZE`             | 4096k         | See PHP documentation                                                                    |
| `FPM_PM`                              | dynamic       | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_MAX_CHILDREN`                 | 5             | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_START_SERVERS`                | 2             | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_MIN_SPARE_SERVERS`            | 1             | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |
| `FPM_PM_MAX_SPARE_SERVERS`            | 3             | [See PHP FPM documentation](https://www.php.net/manual/en/install.fpm.configuration.php) |

This table contains only the environment variables that are specific to the Shopware Docker image. You can see all Shopware specific environment variables [here](../configurations/shopware/environment-variables.md)

Additionally, you can use also the [Deployment Helper environment variables](./deployments/deployment-helper.md#environment-variables) to specify default administration credentials, locale, currency, and sales channel URL.

## Possible Mounts

::: info
Our recommendation is to store all files in an external storage provider to not mount any volumes. Refer to [official Shopware docs for setup](https://developer.shopware.com/docs/guides/hosting/infrastructure/filesystem.html).
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

The docker image starts in the entry point PHP-FPM / Caddy. So you will need to start a extra container to run maintenance tasks like to install Shopware, install plugins, or run the update. This can be done by installing the [Deployment Helper](./deployments/deployment-helper.md) and creating one container and running as entry point `/setup`

Here we have an example of a `compose.yaml`, what the services could look like:

::: info

This is just an example compose file to demonstrate what the services could look like. It's not a ready to use compose file. You need to adjust it to your needs.

:::

```yaml
x-environment: &shopware
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

    init-perm:
        <<: *shopware
        user: "root"
        entrypoint: >
          chown 82:82
          /var/www/html/files
          /var/www/html/public/theme
          /var/www/html/public/media
          /var/www/html/public/thumbnail
          /var/www/html/public/sitemap

    init:
        <<: *shopware
        entrypoint: [ "php", "vendor/bin/shopware-deployment-helper", "run" ]
        depends_on:
            database:
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
    files:
    theme:
    media:
    thumbnail:
    sitemap:
```

<PageRef page="https://github.com/shopwareLabs/example-docker-repository/" title="Example Repository with fully working setup" target="_blank" />

## Best Practices

- Pin the docker image using a sha256 digest to ensure you always use the same image
     - Set up Dependabot / Renovate to keep the image up to date
- Use an external storage provider for all files to keep all state out of the container
- Use Redis/Valkey for Cache and Session storage so all instances share the same cache and session

## Keeping the setup up to date

Getting a shop running once is **not** the end of the job. A container that was built once and then left alone keeps running the exact PHP version it was built with — forever. Months later, that PHP will be missing security fixes that have long since been released. Your shop looks like it is "just running fine", but it is running on an outdated, potentially vulnerable runtime.

This is the most common mistake with Docker-based shops, so if you read only one section on this page, read this one.

There are three separate things that get updated, and they are updated in different ways. Do not mix them up:

| What | What it means | How you update it | How often |
|------|---------------|-------------------|-----------|
| **PHP (the base image)** | The runtime your shop runs on, with security fixes | **Rebuild and redeploy** your image — no code change needed | When a scan finds a vulnerability |
| **Shopware** | The shop software itself, plus extensions | Update with Composer, then rebuild and redeploy | When a version you want is released |
| **Your own code** | Your project and any custom extensions | Update with Composer/npm, then rebuild and redeploy | When you change something |

The rest of this section explains each one.

### Am I affected? Check what you are running

If you are not sure how old your running shop is, check the PHP version inside the running container:

```bash
docker compose exec web php -v
```

Compare that with the [latest PHP releases](https://www.php.net/supported-versions.php). If a newer patch version is available (the last number, e.g. a higher number than the `12` in `8.3.12`), your container has not been rebuilt in a while and is missing security fixes. That is the signal to do the rebuild below.

For the full picture — not just PHP, but every package in the image — scan the image with a vulnerability scanner such as [Trivy](https://trivy.dev/) or [Grype](https://github.com/anchore/grype). Trivy needs no setup and reports all known vulnerabilities (CVEs) in the image:

```bash
# Scan the image your compose setup builds (replace with your image name/tag)
trivy image my-shopware-image:latest
```

**Scan on a schedule, and rebuild only when the scan finds something.** This is the recommended rhythm: instead of rebuilding blindly every day, run the scan regularly (e.g. weekly, ideally as a scheduled job in your build pipeline) and treat a finding as the signal to rebuild. When the scan reports security issues, rebuild with `--pull` (see below) and scan again — most OS- and PHP-level findings disappear once you are on the freshly rebuilt base image. If the pipeline scan still reports vulnerabilities after a rebuild, let it fail the build so nothing vulnerable ships quietly.

### Keeping PHP up to date

The Shopware `docker-base` image is rebuilt **every day** with the newest PHP patch release and operating-system security fixes, so a fix is always waiting in the registry. To actually get those fixes into your shop, you have to **rebuild your own image and redeploy it** — this is the action you take whenever the scan above reports a vulnerability. Building alone does nothing until the new image is running.

::: warning
Rebuilding an image on your laptop does **not** update your live shop. You must also redeploy so the running containers use the new image. "Build" and "deploy" are two separate steps.
:::

Using the `compose.yaml` from the [Typical Setup](#typical-setup) above, the full command is:

```bash
# 1. Rebuild, pulling the newest base image from the registry
docker compose build --pull

# 2. Redeploy so the running containers use the new image
docker compose up -d
```

The `--pull` flag is what tells Docker to fetch the newest `docker-base` image instead of reusing an old cached one. This step does **not** change your Shopware version, your database, or your extensions — it only swaps the PHP runtime underneath, so it is safe to run whenever a scan tells you to.

You do not need to rebuild every day — only when there is actually something to fix. Automate the *detection* so you know when that is:

- **If you have a build pipeline (CI/CD):** add a scheduled scan (e.g. weekly) as described above, and trigger a rebuild-and-redeploy when it reports a vulnerability. This is the recommended approach.
- **If you pinned the image to a sha256 digest:** use [Dependabot or Renovate](#best-practices) to open an update automatically when a newer base image is published, so you rebuild in response to a real new release.
- **If you do all of this by hand:** put a recurring reminder in your calendar (for example, once a week) to run the scan, and rebuild only if it finds something. It is not elegant, but it keeps your shop patched without pointless rebuilds.

::: info
The tags like `8.3-frankenphp` are *rolling* tags: over time, the same tag points to a newer PHP patch version. This is why rebuilding with the same tag is enough to pull in security fixes — you do not need to change anything in your Dockerfile.
:::

### Updating Shopware

Updating Shopware itself (the `shopware/core` package and your extensions) works the same as with any other hosting method: you update the Composer dependencies in your project, rebuild the image, and redeploy. During deployment the [Deployment Helper](./deployments/deployment-helper.md) automatically runs the database migrations (`system:update:finish`) for you.

For the full step-by-step procedure — including backups, maintenance mode, checking extension compatibility, and the difference between small (minor) and yearly (major) updates — follow the dedicated guide:

<PageRef page="./performing-updates" title="Performing Shopware Updates" />

### Updating Shopware and PHP together (major upgrade)

When you move to a new **major** Shopware version (these come out once a year, e.g. 6.6 → 6.7), you usually also need a newer PHP version. It is tempting to change everything in one big rebuild — **do not do this.** If something breaks, you will not know whether PHP or Shopware caused it, and you will have a hard time undoing it. This is exactly the kind of "creative" update that breaks shops.

Instead, change **one thing at a time**, in order. This works because every Shopware major supports *two* PHP versions (the old one and a newer one) at the same time, so you can move PHP and Shopware in separate steps.

The PHP version is controlled by a single line in your `Dockerfile`, the `PHP_VERSION` build argument:

```dockerfile
ARG PHP_VERSION=8.3
FROM ghcr.io/shopware/docker-base:$PHP_VERSION-frankenphp AS base-image
FROM ghcr.io/shopware/shopware-cli:latest-php-$PHP_VERSION AS shopware-cli
```

**Example: going from Shopware 6.6 on PHP 8.2 to Shopware 6.7 on PHP 8.5.**

Take a **backup of your database and files before you start**, then do these steps one after another, testing after each:

1. **Check first.** Run `shopware-cli project upgrade-check` to make sure your extensions support the target Shopware version, and look up the required PHP version in the [System Requirements](../../installation/system-requirements.md).
2. **Raise PHP to an in-between version — still on old Shopware.** Change `PHP_VERSION` to a version both 6.6 and 6.7 support (here: `8.3`), then rebuild and redeploy. Because both versions support it, this is safe while still on 6.6. Test the shop.
3. **Update Shopware.** Now do the Shopware 6.6 → 6.7 update by following [Performing Shopware Updates](./performing-updates.md). Rebuild, redeploy, test the shop.
4. **Raise PHP to the final version.** Now that you are on 6.7, change `PHP_VERSION` to the final target (`8.5`), rebuild, redeploy, and test one last time.

If any step misbehaves, you know exactly which change caused it, and you can roll that one step back instead of unpicking a tangle of changes.

::: danger
Never jump several Shopware majors and PHP versions at once (for example 6.5 straight to 6.7). Go one major version at a time, and always take a backup before starting.
:::

## Adding custom PHP extensions

The Docker image contains the [docker-php-extension-installer](https://github.com/mlocati/docker-php-extension-installer) which allows you to install PHP extensions with the `install-php-extensions` command.

To install a PHP extension, you need to add the following to your Dockerfile:

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

## Adding custom Nginx configuration

Create a new config file at `/etc/nginx/conf.d/` with the `.conf` or `.inc` extension.

The `.conf` will be added to the main `http` block.

The `.inc` will be added to the main `server` block.

## Nginx and PHP_MAX_UPLOAD_SIZE

The default `client_max_body_size` is equal to the default `PHP_MAX_UPLOAD_SIZE`, which is 128M

If you wish to set the `PHP_MAX_UPLOAD_SIZE` higher than 128M, you need to manually adjust the `client_max_body_size`.

```dockerfile
USER root
RUN sed -i "s/client_max_body_size 128M/client_max_body_size 256M/" /etc/nginx/nginx.conf
USER www-data
```

## FAQ

### No transport supports the given Messenger DSN for Redis

When you are stuck with the error `No transport supports the given Messenger DSN`, you need to install the required package. When the package is already installed, it's mostly a dependency-resolving issue. Make sure that you have also the PHP Redis Extension locally installed.
