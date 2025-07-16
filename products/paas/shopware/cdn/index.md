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

- Pre-configured VCL snippets for optimal Shopware performance
- Automatic cache invalidation mechanisms
- Soft purge capabilities to maintain performance during cache updates
- Deployment helper integration for seamless VCL snippet management

### Configuration

Fastly is automatically configured and enabled by default in Shopware PaaS Native environments. No additional Shopware configuration is required - the PaaS platform handles all Fastly setup, VCL snippets, and cache management automatically.

#### Custom Domain DNS Configuration

To utilize custom domains with the Fastly CDN, you must configure your DNS settings to point to the PaaS CDN endpoint:

**Configure your custom domain's DNS to point to:**

```dns
cdn.shopware.shop
```

This configuration ensures that all traffic to your custom domain is routed through the Fastly CDN for optimal performance and caching.

#### Managing Custom Domains

Custom domain management is handled through the `sw-paas` CLI domain command. You can attach multiple domains to a single shop. Following domain creation, you must update the application using `sw-paas application update`. You may use the same commit to trigger a deployment. This process will be automated in future releases.

Subsequently, you can configure the domain within Shopware and associate it with a storefront. Status update functionality is currently under development.
