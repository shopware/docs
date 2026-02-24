---
nav:
  title: Additional Docker Options
  position: 40

---

# Additional Docker Options

## Connecting to a remote database

If you want to use a database outside the Docker stack (running on your host or another server, for examples), set `DATABASE_URL` in `.env.local` in the standard form:

```bash
DATABASE_URL="mysql://user:password@<host>:3306/<database>"
```

Note: containers cannot always reach services bound only to the host's `localhost`. If `localhost` does not work you can try `host.docker.internal`, your host machine’s LAN IP, or add an `extra_hosts` entry in `compose.yaml`.

## Enable profiler/debugging for PHP

Once your Shopware environment is running, you may want to enable PHP debugging or profiling to inspect code execution, set breakpoints, or measure performance. The default setup doesn’t include these tools, but you can enable them using Docker overrides.

### Enable Xdebug

To enable [Xdebug](https://xdebug.org/) inside the web container, create a `compose.override.yaml` in your project root with the following configuration:

```yaml
services:
    web:
        environment:
            - XDEBUG_MODE=debug
            - XDEBUG_CONFIG=client_host=host.docker.internal
            - PHP_PROFILER=xdebug
```

After saving the file, apply the changes:

```bash
docker compose up -d
```

This restarts the containers with Xdebug enabled. You can now attach your IDE (for example, PHPStorm or VS Code) to the remote debugger on the default Xdebug port `9003`.

### Xdebug on Linux

To enable Xdebug connectivity on Linux, you must manually map the host.docker.internal hostname to the Docker host gateway. Add the following configuration to your `compose.override.yaml`:

```yaml
services:
    web:
        extra_hosts:
            - "host.docker.internal:host-gateway"
```

Shopware’s Docker setup also supports other profilers, like [Blackfire](https://www.blackfire.io/), [Tideways](https://tideways.com/), and [PCOV](https://github.com/krakjoe/pcov). For Tideways and Blackfire, you'll need to run an additional container. For example:

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

## Image variations

The Shopware Docker image is available in several variations, allowing you to match your local setup to your project’s PHP version, Node version, and preferred web server. Use the following pattern to select the right image tag:

`ghcr.io/shopware/docker-dev:php(PHP_VERSION)-node(NODE_VERSION)-(WEBSERVER)`

Here’s the version matrix:

PHP versions:

- `8.4` - PHP 8.4
- `8.3` - PHP 8.3
- `8.2` - PHP 8.2

Node versions:

- `node24` - Node 24
- `node22` - Node 22

Web server:

- `caddy` - Caddy as web server
- `nginx` - Nginx as web server

Example:

- `ghcr.io/shopware/docker-dev:php8.4-node24-caddy` - PHP 8.4, Node 24, Caddy as web server
- `ghcr.io/shopware/docker-dev:php8.3-node24-caddy` - PHP 8.3, Node 24, Caddy as web server
- `ghcr.io/shopware/docker-dev:php8.4-node22-nginx` - PHP 8.4, Node 22, Nginx as web server
- `ghcr.io/shopware/docker-dev:php8.3-node22-nginx` - PHP 8.3, Node 22, Nginx as web server

## Adding Minio for local S3 storage

Some projects use Amazon S3 for file storage in production. If you want to mimic that behavior locally—for example, to test uploads or CDN-like delivery—you can add [Minio](https://www.min.io/), an open-source S3-compatible storage server.

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

Create a new YAML file at `config/packages/minio.yaml` with the following content:

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

If you're using [OrbStack](https://orbstack.dev) on macOS, you can take advantage of its built-in routing feature.
OrbStack automatically assigns local `.orb.local` URLs to your containers, so you don’t need to manage port mappings manually. This allows running multiple Shopware instances at the same time without port conflicts.

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

## Proxy production images

When you import a production database into your local environment, image URLs in the data may still point to production servers. As a result, your local store might show broken or missing images. You can fix this in two ways:

- **download all production images** and import them locally, or
- **set up a lightweight proxy service** that serves those images directly from the production server (recommended for quick testing).

### 1. Add the image proxy service

Add a `imageproxy` service to your `compose.override.yaml`:

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

### 2. Point Shopware to the proxy

Next, we need to configure Shopware to use the proxy server. To do this, create a new YAML file `config/packages/media-proxy.yaml`

```yaml
shopware:
  filesystem:
    public:
      url: "http://localhost:8050"
```

This tells Shopware to use the proxy server URL for all images.
