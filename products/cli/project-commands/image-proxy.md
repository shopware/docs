---
nav:
  title: Image Proxy
  position: 90
---

# Image Proxy

The `shopware-cli project image-proxy` command starts a local HTTP server that serves static files from your Shopware project's `public` folder. When a requested file is not found locally, it automatically proxies the request to an upstream server and caches the response for future requests.

This is particularly useful during development when you want to work with a local Shopware installation but need access to media files (images, documents, etc.) from a production or staging environment without downloading the entire media library.

## Usage

```bash
# Start the proxy server using configuration from .shopware-project.yml
shopware-cli project image-proxy

# Specify a custom upstream URL
shopware-cli project image-proxy --url https://my-shop.com

# Use a different port
shopware-cli project image-proxy --port 3000

# Clear the cache before starting
shopware-cli project image-proxy --clear

# Use external URL for reverse proxy setups
shopware-cli project image-proxy --external-url https://dev.example.com

# Skip Shopware config file creation
shopware-cli project image-proxy --skip-config
```

## Configuration

You can configure the upstream URL in your `.shopware-project.yml` file:

```yaml
# .shopware-project.yml
image_proxy:
  url: https://production.example.com
```

If no URL is provided via the `--url` flag or configuration file, the command will exit with an error.

## How It Works

The image proxy follows this request flow:

1. **Check Local Files**: First, it looks for the requested file in your local `public` folder
2. **Check Cache**: If not found locally, it checks the file cache (`var/cache/image-proxy/`)
3. **Proxy Request**: If not cached, it forwards the request to the upstream server
4. **Cache Response**: Successful responses (HTTP 200) are cached to disk for future requests

### Shopware Integration

By default, the command creates a Shopware configuration file at `config/packages/zzz-sw-cli-image-proxy.yml` that automatically configures Shopware to use the proxy server for all public filesystem operations. This file is automatically removed when the server stops.

The configuration looks like:
```yaml
shopware:
  filesystem:
    public:
      type: "local"
      url: 'http://localhost:8080'  # or your configured URL
      config:
        root: "%kernel.project_dir%/public"
```

### Cache Behavior

- Files are cached in `var/cache/image-proxy/` within your project directory
- The cache preserves the `Content-Type` header to ensure files are served with correct MIME types
- Cache files are named by replacing `/` with `_` in the request path
- There is no automatic cache expiration - files remain cached until manually cleared
- Cached responses include an `X-Cache: HIT` header when served


## Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--url` | Upstream server URL (overrides config) | From config |
| `--port` | Port to listen on | `8080` |
| `--clear` | Clear cache before starting | `false` |
| `--external-url` | External URL for Shopware config (e.g., for reverse proxy setups) | `http://localhost:{port}` |
| `--skip-config` | Skip creating Shopware config file | `false` |

## Example Scenarios

### Development with Production Media

When developing locally but needing access to production media files:

```bash
# Configure once
echo "image_proxy:
  url: https://production.example.com" >> .shopware-project.yml

# Start proxy
shopware-cli project image-proxy

# Access your local Shopware at http://localhost:8080
# Media files will be transparently fetched from production
```

### Testing with Fresh Cache

To ensure you're working with the latest media files:

```bash
shopware-cli project image-proxy --clear
```

### Multiple Environments

Switch between different upstream servers:

```bash
# Staging environment
shopware-cli project image-proxy --url https://staging.example.com

# Production environment
shopware-cli project image-proxy --url https://production.example.com
```

### Reverse Proxy Setup

When running behind a reverse proxy (nginx, Apache, etc.):

```bash
# Configure external URL for Shopware
shopware-cli project image-proxy --external-url https://dev.example.com
```

### Manual Configuration

If you want to manage Shopware configuration manually:

```bash
# Run proxy without creating config file
shopware-cli project image-proxy --skip-config
```
