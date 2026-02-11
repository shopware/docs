---
nav:
  title: Advanced Options
  position: 6

---

# Advanced options

This page covers optional and advanced Docker configuration for Shopware projects. You can refer to information here once your local environment is running and you want to customize your environment, mirror production more closely, or support advanced workflows.

## Customizing the runtime environment

### Image variations

Shopware provides multiple Docker image variants so you can match your local setup to your project's PHP version, Node version, and preferred web server. The image tag format is `ghcr.io/shopware/docker-dev:php(PHP_VERSION)-node(NODE_VERSION)-(WEBSERVER)`.

Version matrix:

PHP versions

- `8.4` - PHP 8.4
- `8.3` - PHP 8.3
- `8.2` - PHP 8.2

Node versions

- `node24` - Node 24
- `node22` - Node 22

Web server

- `caddy` - Caddy as web server
- `nginx` - Nginx as web server

Examples

- `ghcr.io/shopware/docker-dev:php8.4-node24-caddy` - PHP 8.4, Node 24, Caddy as web server
- `ghcr.io/shopware/docker-dev:php8.3-node24-caddy` - PHP 8.3, Node 24, Caddy as web server
- `ghcr.io/shopware/docker-dev:php8.4-node22-nginx` - PHP 8.4, Node 22, Nginx as web server
- `ghcr.io/shopware/docker-dev:php8.3-node22-nginx` - PHP 8.3, Node 22, Nginx as web server

Choose the variant that best matches your production stack.

## Adding S3-compatible storage (Minio)

Some projects use Amazon S3 for file storage in production. If you want to mimic that behavior locally—for example, to test uploads or CDN-like delivery—you can add [Minio](https://www.min.io/), which is an open-source, S3-compatible storage server.

### 1. Add the Minio service

Include a `minio` service in your `compose.yaml`:

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
      - "9000:9000"
      - "9001:9001"
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

### 2. Configure Shopware to use Minio

Create a `config/packages/minio.yaml`:

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

## Using OrbStack routing

If you're using [OrbStack](https://orbstack.dev) on macOS, you can avoid manual port management by using its built-in routing feature. OrbStack automatically assigns local `.orb.local` URLs to your containers, which allows running multiple Shopware instances at the same time without port conflicts.

To enable it, create a `compose.override.yaml` in your project root with the following content:

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

The APP_URL environment variable follows this pattern: `web.<project-name>.orb.local`. The `<project-folder-name>` comes from your local directory name. For example: a project called `shopware` will have the URL `https://web.shopware.orb.local`. A project called `shopware-6` will have the URL `https://web.shopware-6.orb.local`.

You can also open `https://orb.local` in your browser to view all running containers and their assigned URLs.

## Working with production data locally

When importing production databases into your local environment, image URLs in the data may still point to production servers—leading to broken or missing images in your local store. You can proxy those images locally instead of downloading everything.

Add the `imageproxy` service to your `compose.override.yaml`:

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

This starts a proxy server that fetches images from the production environment and caches them locally. For example, a request to `http://localhost:8050/assets/images.png` will be served from `https://[REMOTE_SERVER_HOST]/assets/images.png` and then stored in the local cache for faster reuse.

Next, configure Shopware to use the proxy server. Create a new YAML file `config/packages/media-proxy.yaml`:

```yaml
shopware:
  filesystem:
    public:
      url: "http://localhost:8050"
```

Images are fetched from production on demand and cached locally.
