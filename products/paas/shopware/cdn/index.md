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

To configure your custom domain with the Fastly CDN, you must configure a DNS record. Depending of the type of your record, the DNS configuration is different.

If you have multiple custom domains, you need to create a record per domain.

**None APEX record**

Configure a `CNAME` record with your custom domain's DNS to point to:

```dns
cdn.shopware.shop
```

**APEX record**

Configure a `A` with your custom domain's DNS to point to:

```dns
151.101.3.52
151.101.67.52
151.101.131.52
151.101.195.52
```

and `AAAA` records to point to:

```dns
2a04:4e42::820
2a04:4e42:200::820
2a04:4e42:400::820
2a04:4e42:600::820
```

This configuration ensures that all traffic to your custom domain is routed through the Fastly CDN for optimal performance and caching.

#### Managing Custom Domains

Custom domain management is handled through the `sw-paas` CLI domain command. You can attach multiple domains to a single shop. Following domain creation, you must create an application deployment using `sw-paas application update` or just `sw-paas application deploy create`. You may use the same commit to trigger a deployment.

Subsequently, you can configure the domain within Shopware and associate it with a storefront. Status update functionality is currently under development.

If you encounter an error during the domain creation process, a possible solution is to check the domain's DNS configuration.
Ensure that the DNS records are correctly set up according to the guidelines provided above.
Additionally, verify that there are no typos in the domain name and that the ***DNS changes have propagated successfully***.
If issues persist, consider reaching out to support for further assistance.
