---
nav:
  title: CDN
  position: 41
---

# CDN

This section provides comprehensive information about Content Delivery Network (CDN) solutions for Shopware PaaS Native, with a focus on Fastly integration and optimization strategies.

## Fastly CDN

Fastly serves as the primary CDN solution for Shopware PaaS Native, delivering edge caching capabilities that significantly enhance your shop's performance and user experience. By storing HTTP cache at the nearest edge server to your customers, Fastly reduces response times globally while minimizing resource consumption on your application servers.

### Key Benefits

- **Global Performance**: Cached responses are served from edge locations worldwide, drastically reducing latency
- **Resource Optimization**: Reduces load on your application servers by serving cached content from the edge
- **Redis Cache Relief**: Minimizes Redis cache usage by handling HTTP cache at the CDN level
- **Automatic Scaling**: Seamlessly handles traffic spikes without impacting your application performance

### Integration

Fastly is fully integrated into Shopware PaaS Native. The integration includes:

- Automatic cache invalidation mechanisms
- Soft purge capabilities to maintain performance during cache updates
- Deployment helper integration for seamless VCL snippet management. See the [Fastly snippets documentation](./fastly-snippets.md) for more details.

### Configuration

Fastly is automatically configured and enabled by default in Shopware PaaS Native environments. No additional Shopware configuration is required - the PaaS platform handles all Fastly setup and cache management automatically.

We configure two different Fastly services:

- `storefront`: Service that proxies the storefront and admin Shopware instances.
- `cdn`: Service that proxies all the CDN assets hosted on S3 (public bucket).

## Custom Domains

Custom domain configuration has moved to its own page. See [Custom Domains](./custom-domains.md) for prerequisites, DNS records, and the step-by-step setup.
