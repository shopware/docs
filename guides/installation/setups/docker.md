---
nav:
  title: Docker
  position: 5

---

# Docker

::: info
This setup is intended for development, if you want to use Docker for production, please check out this [guide](../../hosting/installation-updates/docker.md).
:::

Docker is a platform that enables developers to develop, ship, and run applications inside containers. These containers are lightweight, standalone, and executable packages that include everything needed to run an application: code, runtime, system tools, libraries, and settings. To get started with Docker, you can follow the official [Docker installation guide](https://docs.docker.com/get-docker/).

In this guide, we will run PHP, Node and all required services in Docker containers. If you just want to run the services (MySQL/OpenSearch/Redis/...) in Docker, check out the [Docker](./docker.md) guide.

## Prerequisites

::: info
On macOS we recommend OrbStack, instead of Docker Desktop. OrbStack is a lightweight and fast alternative to Docker Desktop, and it is free for personal use. You can follow the official [OrbStack quickstart guide](https://docs.orbstack.dev/quick-start) to install OrbStack.
:::

- Docker installed on your machine. You can follow the official [Docker installation guide](https://docs.docker.com/get-docker/) to install Docker.
- Docker Compose installed on your machine. You can follow the official [Docker Compose installation guide](https://docs.docker.com/compose/install/) to install Docker Compose.
- make installed on your machine. (`apt install make` on Ubuntu, `brew install make` on macOS)

## Create a new project

Create a new empty directory and navigate to it:

```bash
mkdir my-project
cd my-project
```

Then create a new Project:

```bash
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup

# or specific version
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup 6.6.10.0
```

This will create a new Shopware project in the current directory additionally with a `compose.yaml` and a `Makefile`. The difference to regular `composer create-project` is that we use PHP, Composer from the Docker image and do not need to install PHP and Composer on your local machine.

## Initial Setup

After the project is created, you can run the initial setup commands to install Shopware itself.

First, we need to start the containers

```bash
make up
```

This will start the containers in the background. You can install Shopware through the Browser at <http://localhost:8000> or through the CLI:

```bash
make setup
```

This will install Shopware itself, create an admin user with username `admin` and password `shopware`.

:::info
For the Database Configuration step, you should put the host as `database` instead of `localhost`, which is the Docker container name.
:::

If you want to stop the setup, you can run `make stop` and to start it again, you can run `make up` again. If you want to remove the containers, you can run `make down`. This will remove all containers and **keep the data**. If you want to remove all containers and the data, you can run `docker compose down -v`

## Development

To access the Shopware `bin/console`, you have to enter first the container:

```bash
make shell
```

and run then `bin/console` commands.

You can also run the commands directly from your host machine without entering the container:

```bash
docker compose exec web bin/console cache:clear
```

To build the Administration or Storefront, you can run the following commands:

```bash
# Build the administration
make build-administration

# Build the storefront
make build-storefront

# Start watcher for administration
make watch-admin

# Start watcher for storefront
make watch-storefront
```

## Services

The setup comes with the following services:

- Nginx + PHP-FPM at port 8000
  - Storefront at `http://localhost:8000`
  - Admin at `http://localhost:8000/admin` (username: `admin`, password: `shopware`)
- MariaDB at port 3306
- Mailpit at port 8025

### Changing environment variables

You can create a `.env` file to override the default environment variables. These are loaded automatically without having to restart the containers. **Except for the `APP_ENV` variable**, which requires `docker compose up -d` to apply the changes.

### Enable Profiler/Debugging for PHP

To enable XDebug, you will need to create a `compose.override.yaml`

```yaml
services:
    web:
        environment:
            - XDEBUG_MODE=debug
            - XDEBUG_CONFIG=client_host=host.docker.internal
            - PHP_PROFILER=xdebug
```

and then run `docker compose up -d` to apply the changes.

It also supports `blackfire`, `tideways` and `pcov`. For `tideways` and `blackfire` you will need a separate container like:

```yaml
services:
    web:
        environment:
            - PHP_PROFILER=blackfire
    blackfire:
        image: blackfire/blackfire:2
        environment:
            BLACKFIRE_SERVER_ID: XXXX
            BLACKFIRE_SERVER_TOKEN: XXXX
```

## Image Variations

The Docker image comes in different variations. You can choose the one that fits your needs best. The variations are:

`ghcr.io/shopware/docker-dev:php(PHP_VERSION)-node(NODE_VERSION)-(WEBSERVER)`

the Matrix is:

PHP Versions:

- `8.4` - PHP 8.4
- `8.3` - PHP 8.3
- `8.2` - PHP 8.2

Node Versions:

- `node24` - Node 24
- `node22` - Node 22

Webserver:

- `caddy` - Caddy as web server
- `nginx` - Nginx as web server

Example:

- `ghcr.io/shopware/docker-dev:php8.4-node24-caddy` - PHP 8.4, Node 24, Caddy as web server
- `ghcr.io/shopware/docker-dev:php8.3-node24-caddy` - PHP 8.3, Node 24, Caddy as web server
- `ghcr.io/shopware/docker-dev:php8.4-node22-nginx` - PHP 8.4, Node 22, Nginx as web server
- `ghcr.io/shopware/docker-dev:php8.3-node22-nginx` - PHP 8.3, Node 22, Nginx as web server

## Adding Minio for local S3 storage

To add Minio as a local S3 storage, you need to add `minio` service to your `compose.yaml`:

```yaml
services:
  # ....
  minio:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      start_period: 20s
      start_interval: 10s
      interval: 1m
      timeout: 20s
      retries: 3
    ports:
      - 9000:9000
      - 9001:9001
    volumes:
      - minio-data:/data
  
  minio-setup:
    image: minio/mc
    depends_on:
      minio:
        condition: service_healthy
    entrypoint: >
      /bin/sh -c "
        set -e;
        mc alias set local http://minio:9000 minioadmin minioadmin;
        mc mb local/shopware-public local/shopware-private --ignore-existing;
        mc anonymous set download local/shopware-public;
        "
    restart: no
  # ...

volumes:
  # ...
  minio-data:
```

Then, create a new YAML file `config/packages/minio.yaml` with the following content:

```yaml
# yaml-language-server: $schema=https://raw.githubusercontent.com/shopware/shopware/refs/heads/trunk/config-schema.json

shopware:
  filesystem:
    public: &s3_public
      type: "amazon-s3"
      url: "http://localhost:9000/shopware-public"
      config:
        bucket: shopware-public
        endpoint: http://minio:9000
        use_path_style_endpoint: true
        region: us-east-1
        credentials:
          key: minioadmin
          secret: minioadmin
    theme: *s3_public
    sitemap: *s3_public
    private:
      type: "amazon-s3"
      config:
        bucket: shopware-private
        endpoint: http://minio:9000
        use_path_style_endpoint: true
        region: us-east-1
        credentials:
          key: minioadmin
          secret: minioadmin

```

After adding the Minio service to your `compose.yaml` and creating the configuration file, this will configure Shopware to use Minio as the S3 storage for public and private files.

Run `docker compose up -d` to start the Minio containers. You can access the Minio console at <http://localhost:9001> with the username `minioadmin` and password `minioadmin`.

Finally, regenerate the assets to upload them to S3:

```bash
make shell
bin/console asset:install
bin/console theme:compile
```

### Using OrbStack Routing

If you are using OrbStack as your Docker provider, you can use the OrbStack routing feature to access your services without needing to manage port mappings.

OrbStack generates for each running container a URL like `https://web.orb.local` and allows for easier access to your services without needing to manage port mappings.
This allows running multiple Shopware instances at the same time without port conflicts.

Create a `compose.override.yaml` with:

```yaml
services:
  web:
      ports: !override []
      environment:
          APP_URL: https://web.sw.orb.local
          SYMFONY_TRUSTED_PROXIES: REMOTE_ADDR

###> symfony/mailer ###
  mailer:
    image: axllent/mailpit
    environment:
      MP_SMTP_AUTH_ACCEPT_ANY: 1
      MP_SMTP_AUTH_ALLOW_INSECURE: 1
###< symfony/mailer ###

```

The APP_URL environment variable always starts with `web.<project-name>.orb.local` and the rest of the URL is generated by the project name. The project name is the folder name of the project. So if you have a project called `shopware`, the URL will be `https://web.shopware.orb.local`. If you have a project called `shopware-6`, the URL will be `https://web.shopware-6.orb.local`.

You can also open `https://orb.local` in your browser and see all running containers and their URLs.

## Proxy Production Images

Typically, you import for local development a copy of the production database to your local environment. This allows you to test changes with production similar data. However, this can lead to issues that all images are missing in the local environment. To avoid this, you can download all images from the production environment and import them into your local environment. Or set up a proxy server that serves the images from the production environment.

To do this, you can add a `imageproxy` service to your `compose.override.yaml`:

```yaml
services:
    imageproxy:
        image: ghcr.io/shopwarelabs/devcontainer/image-proxy
        ports:
          - "8050:80"
        environment:
          # Your production URL.
          REMOTE_SERVER_HOST: shopware.com
```

This will start a proxy server that serves all images from the production environment. In this case if we request `http://localhost:8050/assets/images.png`, it will load `https://[REMOTE_SERVER_HOST]/assets/images.png` and serve it to the local environment, it will also cache the images locally.

Next, we need to configure Shopware to use the proxy server. To do this, create a new YAML file `config/packages/media-proxy.yaml`

```yaml
shopware:
  filesystem:
    public:
      url: "http://localhost:8050"
```

This will tell Shopware to use the proxy server URL for all images.

## Known issues

### Linux host user-id must be 1000

If you are using Docker on Linux, your host user-id must be 1000. This is a known issue with Docker on Linux. You can check your user-id with the following command:

```bash
id -u
```
