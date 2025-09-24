---
nav:
  title: Setup
  position: 3
---

# Setup

This guide will help you set up a complete Shopware development environment using Docker. All commands are executed inside Docker containers, requiring no local PHP or Node.js installation.

::: tip Why Docker?
Our Docker setup provides a **zero-configuration** development environment that works identically for all developers. It includes PHP, MySQL, Node.js, and all required services pre-configured and optimized for Shopware.
:::

## Prerequisites

::: info macOS Users
We recommend [OrbStack](https://orbstack.dev) over Docker Desktop for better performance. Install via `brew install orbstack` or enable [Docker VMM](https://docs.docker.com/desktop/features/vmm/#docker-vmm) if using Docker Desktop.
:::

You only need:
- **Docker** - [Installation guide](https://docs.docker.com/get-docker/)
- **Docker Compose** - [Installation guide](https://docs.docker.com/compose/install/) (mostly included with Docker)
- **Make** - `apt install make` (Ubuntu) or `brew install make` (macOS)

## Quick Start

### 1. Create your project

```bash
# Create and enter project directory
mkdir my-shopware-project
cd my-shopware-project

# Create new Shopware project with Docker
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup

# Or install a specific version
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.3-node24-caddy new-shopware-setup 6.6.10.0
```

This creates a complete Shopware project with:
- Shopware source code
- `compose.yaml` for Docker services
- `Makefile` with convenience commands
- Pre-configured environment settings

### 2. Start the environment

```bash
make up
```

This starts:
- **Web server** (Nginx/Caddy) on port 8000
- **MariaDB** on port 3306
- **Mailpit** (email testing) on port 8025

### 3. Install Shopware

```bash
make setup
```

This automatically:
- Creates the database
- Installs Shopware
- Creates admin user (username: `admin`, password: `shopware`)
- Sets up demo data

Your shop is now running at:
- **Storefront**: <http://localhost:8000>
- **Administration**: <http://localhost:8000/admin>
- **Mailpit**: <http://localhost:8025>

## Project Structure

Your Shopware project follows the [Symfony Flex](https://symfony.com/doc/current/setup/flex.html) structure:

```
my-shopware-project/
├── bin/                    # CLI scripts and commands
├── config/                 # Configuration files
├── custom/                 # Your plugins and themes
│   ├── plugins/
│   └── static-plugins/
├── public/                 # Web root
├── var/                    # Cache, logs, and generated files
├── vendor/                 # Composer dependencies
├── .env                    # Environment variables
├── composer.json           # Project dependencies
├── compose.yaml           # Docker services
└── Makefile              # Convenience commands
```

### Managing Extensions

Install plugins and themes via Composer:

```bash
# Enter container
make shell

# Install from Shopware Store (requires authentication)
composer require store.shopware.com/swagexampleaddon

# Install dev tools
composer require --dev shopware/dev-tools

# Install custom plugin from custom/plugins
composer require my-vendor/my-plugin
```

### Environment Variables

Configure your shop via `.env.local` (not `.env` which gets overwritten):

```bash
# .env.local
APP_ENV=dev
APP_URL=http://localhost:8000
DATABASE_URL=mysql://shopware:shopware@database:3306/shopware
```

## Daily Development

### Running Commands

Execute Shopware commands inside the container:

```bash
# Enter the container shell
make shell

# Then run any command
bin/console cache:clear
bin/console system:install --basic-setup
```

Or directly from your host:

```bash
docker compose exec web bin/console cache:clear
```

### Building Assets

```bash
# Build administration
make build-administration

# Build storefront
make build-storefront

# Watch for changes (hot reload)
make watch-admin
make watch-storefront
```

### Managing the Environment

```bash
make up      # Start containers
make stop    # Stop containers (data persists)
make down    # Remove containers (keeps data)

# Complete reset (removes all data)
docker compose down -v
```

## Configuration

### Changing PHP/Node Version

You can choose different PHP, Node.js, and web server combinations by using different Docker images:

`ghcr.io/shopware/docker-dev:php[VERSION]-node[VERSION]-[WEBSERVER]`

Available options:
- **PHP**: `8.4`, `8.3`, `8.2`
- **Node**: `node24`, `node22`
- **Web Server**: `caddy`, `nginx`

Examples:
- `php8.4-node24-caddy` - PHP 8.4, Node 24, Caddy (recommended)
- `php8.3-node24-nginx` - PHP 8.3, Node 24, Nginx
- `php8.2-node22-caddy` - PHP 8.2, Node 22, Caddy

To change versions, update the image in your initial setup command:

```bash
docker run --rm -it -v $PWD:/var/www/html ghcr.io/shopware/docker-dev:php8.4-node24-caddy new-shopware-setup
```

### Debugging

#### Enable XDebug

Create `compose.override.yaml`:

```yaml
services:
    web:
        environment:
            - XDEBUG_MODE=debug
            - XDEBUG_CONFIG=client_host=host.docker.internal
            - PHP_PROFILER=xdebug
```

Then restart: `docker compose up -d`

#### Enable Blackfire

```yaml
services:
    web:
        environment:
            - PHP_PROFILER=blackfire
    blackfire:
        image: blackfire/blackfire:2
        environment:
            BLACKFIRE_SERVER_ID: YOUR_SERVER_ID
            BLACKFIRE_SERVER_TOKEN: YOUR_SERVER_TOKEN
```

#### Enable Tideways

```yaml
services:
    web:
        environment:
            PHP_PROFILER: tideways
            TIDEWAYS_KEY: YOUR_API_KEY
            TIDEWAYS_CONNECTION: tcp://tideways:9135
    tideways:
        image: ghcr.io/tideways/daemon
```

### Advanced Features

#### Using OrbStack Routing

OrbStack users can access services via `.orb.local` domains without port mapping:

```yaml
# compose.override.yaml
services:
  web:
      ports: !override []
      environment:
          APP_URL: https://web.my-project.orb.local
          SYMFONY_TRUSTED_PROXIES: REMOTE_ADDR
```

#### Production Image Proxy

Proxy production images locally when working with production databases:

```yaml
# compose.override.yaml
services:
    imageproxy:
        image: ghcr.io/shopwarelabs/devcontainer/image-proxy
        ports:
          - "8050:80"
        environment:
          REMOTE_SERVER_HOST: your-production-domain.com
```

Then configure Shopware:

```yaml
# config/packages/media-proxy.yaml
shopware:
  filesystem:
    public:
      url: "http://localhost:8050"
```

## Updating Shopware

For detailed update instructions including preparations, compatibility checks, and best practices, see our [Performing Updates Guide](../hosting/installation-updates/performing-updates).

Quick update commands:

```bash
# Enter container
make shell

# Run update process
bin/console system:update:prepare
composer update
composer recipes:update
bin/console system:update:finish
```

## Production Deployment

::: warning
This Docker setup is for **development only**. For production deployments, see our [production Docker guide](../hosting/installation-updates/docker.md) or [deployment documentation](../hosting/installation-updates/deployments/).
:::

## Troubleshooting

### Linux: Permission Issues

On Linux, ensure your user ID is 1000:

```bash
id -u  # Should output 1000
```

### Port Conflicts

If port 8000 is already in use, modify `compose.yaml`:

```yaml
services:
  web:
    ports:
      - "8080:8000"  # Use port 8080 instead
```

### Admin Watcher Not Working

The admin watcher may not work out of the box in some configurations. Use the build command instead:

```bash
make build-administration
```

## Alternative Setup Methods

While we strongly recommend Docker, alternative setup methods are documented for specific use cases:

- [Manual Setup](./requirements) - For specific infrastructure requirements
- [Devenv (Legacy)](./devenv) - Existing Nix-based projects

## Next Steps

- Learn about [Shopware's architecture](../../concepts/)
- Create your first [plugin](../../plugins/)
- Build a custom [theme](../../themes/)
- Explore the [API](../../integrations/api/)