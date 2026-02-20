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
- Deployment helper integration for seamless VCL snippet management

### Configuration

Fastly is automatically configured and enabled by default in Shopware PaaS Native environments. No additional Shopware configuration is required - the PaaS platform handles all Fastly setup and cache management automatically.

## Custom Domains

### Prerequisites

Before adding a custom domain to your Shopware PaaS Native environment, ensure you have:

- Shopware PaaS CLI installed and configured (`sw-paas`)
- Your organization ID (retrieve it using `sw-paas org list`)
- A registered domain with access to DNS management
- Permissions to deploy your application

### Overview

Custom domains allow you to serve your Shopware shop through your own branded domain while leveraging Fastly's CDN for optimal performance. The platform actively validates your DNS configuration during domain creation to ensure proper routing and security.

**Important:** DNS records must be configured and fully propagated **before** creating the domain in the PaaS platform. The domain creation process validates all DNS records in real-time and will fail if they are not correctly configured.

### Quick Reference: DNS Records

| Record Type | For Apex Domains | For Non-Apex Domains | Target | Count | Purpose |
|------------|:----------------:|:--------------------:|--------|:-----:|---------|
| `CNAME` | No | **Yes** | `cdn.shopware.shop` | 1 | Routes subdomain traffic to Fastly CDN |
| `A` | **Yes** | No | Fastly IPv4 addresses | 4 | Routes apex domain traffic (IPv4) |
| `AAAA` | **Yes** | No | Fastly IPv6 addresses | 4 | Routes apex domain traffic (IPv6) |
| `TXT` | **Yes** | No | Domain ownership proof | 1 | Validates domain ownership |

### Step 1: Configure DNS Records

Configure DNS records at your domain registrar or DNS provider. The required records differ based on whether you're using an apex domain or a subdomain.

#### For Non-Apex Domains (Subdomains)

If your custom domain is a subdomain (e.g., `shop.example.com`, `www.example.com`), create a `CNAME` record:

```dns
CNAME: cdn.shopware.shop
```

**Example:**

```dns
shop.example.com.  IN  CNAME  cdn.shopware.shop.
```

#### For Apex Domains

If your custom domain is an apex/root domain (e.g., `example.com`), you need to configure multiple record types:

**1. IPv4 routing** - Create four `A` records:

```dns
151.101.3.52
151.101.67.52
151.101.131.52
151.101.195.52
```

**2. IPv6 routing** - Create four `AAAA` records:

```dns
2a04:4e42::820
2a04:4e42:200::820
2a04:4e42:400::820
2a04:4e42:600::820
```

**3. Domain ownership** - Create a `TXT` record to prove domain ownership:

```dns
_shopware-challenge.<domain> IN TXT "shopware-challenge=<organization id>"
```

Replace `<domain>` with your actual domain and `<organization id>` with your organization ID from `sw-paas org list`.

**Example for domain `example.com` with organization ID `abc123`:**

```dns
_shopware-challenge.example.com.  IN  TXT  "shopware-challenge=abc123"
```

::: info
**DNS Propagation Time:** DNS changes typically propagate within 15-30 minutes but can take up to 48 hours depending on TTL settings and DNS provider. We strongly recommend waiting for full propagation before proceeding to Step 3.
:::

### Step 2: Verify DNS Propagation

Before creating the domain in the PaaS platform, verify that your DNS records have propagated correctly using the `dig` command or online DNS lookup tools.

**For non-apex domains (CNAME):**

```bash
dig shop.example.com CNAME
```

**For apex domains:**

```bash
# Verify A records
dig example.com A

# Verify AAAA records
dig example.com AAAA

# Verify TXT record
dig _shopware-challenge.example.com TXT
```

Ensure the responses match the values you configured in Step 1.

### Step 3: Create Domain in PaaS

Once DNS records are configured and propagated, create the domain using the CLI:

```bash
sw-paas domain create
```

You can attach multiple domains to a single shop by running this command for each domain.

::: warning
**Active DNS Validation:** The platform performs real-time validation of your DNS configuration during domain creation. The following checks must pass:

- **For apex domains:** A records point to correct Fastly IPv4 addresses, AAAA records point to correct Fastly IPv6 addresses, and TXT record matches your organization ID
- **For non-apex domains:** CNAME record points to `cdn.shopware.shop`
- **DNS propagation:** Records must be resolvable through public DNS

If validation fails, verify your DNS configuration and wait for propagation before retrying.
:::

### Step 4: Deploy Application

After successful domain creation, trigger an application deployment to activate the domain:

```bash
sw-paas application deploy create
```

Alternatively, you can use:

```bash
sw-paas application update
```

You may use the same commit to trigger a deployment.

### Step 5: Configure in Shopware

After deployment completes:

1. Log in to your Shopware administration panel
2. Navigate to domain/storefront configuration
3. Associate the custom domain with your desired storefront

The domain should now serve traffic through the Fastly CDN.

### Troubleshooting

#### DNS Validation Fails During Domain Creation

**Symptoms:**

- Error message during `sw-paas domain create`
- Domain creation rejected or fails validation

**Solutions:**

1. **Verify DNS record configuration**
   - Double-check that all required records are configured correctly
   - For apex domains: Ensure all 4 A records, all 4 AAAA records, and the TXT record are present
   - For non-apex domains: Ensure CNAME points to `cdn.shopware.shop`

2. **Check DNS propagation**
   - Use `dig` commands (see Step 2) to verify records are resolvable
   - Try querying from different DNS servers: `dig @8.8.8.8 example.com A`
   - Use online tools like [whatsmydns.net](https://www.whatsmydns.net) to check global propagation

3. **Wait for propagation**
   - If records appear correct in your DNS provider but aren't resolving, wait longer for propagation
   - DNS changes can take up to 48 hours in some cases

4. **Verify organization ID**
   - Run `sw-paas org list` to confirm your organization ID
   - Ensure the TXT record value exactly matches: `shopware-challenge=<your-org-id>`

5. **Check for typos**
   - Verify domain name is spelled correctly
   - Ensure no extra spaces or characters in DNS records

#### Domain Created But Not Serving Traffic

**Symptoms:**

- Domain creation succeeded but site is not accessible
- SSL/TLS certificate errors
- Connection timeouts

**Solutions:**

1. **Verify deployment completed**
   - Check that Step 4 deployment finished successfully
   - Run `sw-paas application deploy get` to check application status

2. **Check Shopware configuration**
   - Ensure domain is associated with a storefront in Shopware admin (Step 5)
   - Verify sales channel configuration

3. **Clear caches**
   - Clear browser cache and cookies
   - Try accessing the domain in incognito/private browsing mode
   - Clear Shopware caches if necessary

4. **DNS propagation delay**
   - Even after domain creation, DNS changes may still be propagating globally
   - Wait additional time and retest

#### Getting Help

If issues persist after trying the above solutions, contact Shopware support with the following information:

- Domain name you're trying to configure
- Your organization ID
- Complete error messages (exact text)
- DNS query results (output from `dig` commands)
- Timeline of actions taken and when errors occurred
- Screenshots of DNS configuration from your provider

This information will help support diagnose and resolve the issue quickly.
