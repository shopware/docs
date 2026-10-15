---
nav:
  title: Security
  position: 10

---

# Security

## Overview

This reference presents a comprehensive compilation of all security measures implemented in Shopware 6, along with instructions on how to configure them.

:::info
If you have found a security vulnerability in Shopware, please report it to us following the instructions in our [Security Advisory Form](https://github.com/shopware/shopware/security/advisories/new).
:::

## ACL in the Administration

The Access Control List (ACL) in Shopware ensures that by default, data can only be created, read, updated, or deleted (CRUD), once the user has specific privileges for a module. [ACL in the Administration](../../concepts/framework/architecture/administration-concept#acl-in-the-administration)

## API aware field

The `ApiAware` flag allows you to control what fields of your entity are exposed to the Store API. For more information, refer to [Flags Reference](core-reference/dal-reference/flags-reference).

## Captcha

Captchas help to verify the user's humanity and prevent automated bots or scripts from gaining access. For more information, refer to [Captcha](https://docs.shopware.com/en/shopware-en/settings/basic-information#captcha) article.

## CSP

[Content Security Policies](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) (CSPs) are used to prevent Cross-Site-Scripting (XSS) attacks, as well as data injection attacks. This policy specifies the sources from which additional content (e.g., images, scripts, etc.) can be included.

The default policies are configured over the `shopware.security.csp_templates` symfony container parameter and can be adjusted over the container configuration.

## XSS on stored assets

Stored HTML and SVG files can execute scripts when opened directly in a browser. When these files share an origin with the shop, malicious content can cause cross-site scripting (XSS). Web servers and CDNs often serve stored assets without passing through Shopware, so the application's CSP does not protect these responses.

Serve stored HTML and SVG assets with the following response header:

```http
Content-Security-Policy: script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'
```

This policy blocks scripts, embedded documents, base URL overrides and form submissions while permitting images and styles. It must be present on the asset response, including when a cache serves the file.

The provided [Apache](./config-reference/server/apache.md), [Nginx](./config-reference/server/nginx.md) and [Caddy](./config-reference/server/caddy.md) configurations include CSP protection for stored HTML and SVG. Update and deploy existing configurations to receive these protections.

When using a [reverse proxy](../../guides/hosting/infrastructure/reverse-http-cache.md), ensure that it preserves the `Content-Security-Policy` header from the origin server, including on cached responses. Shopware's default Fastly and Varnish configurations preserve this header.

If you serve static assets from a dedicated CDN using a different CDN URL, configure this response header manually in that CDN. Shopware's application and webserver configuration cannot enforce headers on responses served independently by the CDN. Match the asset paths used by your CDN, including any path prefix, and verify the header on both cache hits and misses. A separate CDN URL does not replace CSP protection for active documents served from it.

## File access

Shopware 6 stores and processes a wide variety of files. This goes from product images or videos to generated documents such as invoices or delivery notes. This data should be stored securely, and backups should be generated regularly. For more information, refer to [File system](../../guides/hosting/infrastructure/filesystem)

## GDPR compliance

General Data Protection Regulation (GDPR) is a comprehensive European Union (EU) regulation that enhances individuals' privacy rights by imposing strict rules on how organizations collect, process, and protect personal data. For more information, refer to [GDPR](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/gdpr) guide.

## HTML sanitizer

HTML sanitizer improves security, reliability, and usability of the text editor by removing potentially unsafe or malicious HTML code. For more information, refer to [HTML Sanitizer](../../guides/hosting/configurations/shopware/html-sanitizer.md) guide.

## Rate limiter

Shopware 6 provides certain rate limits by default that reduces the risk of brute-force attacks for pages like login or password reset. For more information, refer to [Rate Limiter](../../guides/hosting/infrastructure/rate-limiter.md) guide.

## Reset sessions when changing password

As soon as a password is changed for a user or customer, the session is invalid and the user or customer must log in again. For more information, refer to:

- [User Changelog](https://github.com/shopware/shopware/commit/5ea99ee5d7a12bab3a01a64c3948eee7c4188ede)
- [Customer Changelog](https://github.com/shopware/shopware/commit/47b4b094c13f62db860be2f431138bb45c0bd0b6)

## SameSite cookie

SameSite prevents the browser from sending cookies along with cross-site requests. For more information on this, refer to [SameSite Protection](../../guides/hosting/configurations/framework/samesite-protection.md).

## Security plugin

Obtaining security fixes without version upgrades is possible through the [Security plugin](../../guides/hosting/installation-updates/cluster-setup.md#security-plugin).

## Storefront IP Whitelisting

To enable access even during maintenance mode, IP addresses can be added to [Storefront IP whitelisting](https://docs.shopware.com/en/shopware-6-en/settings/saleschannel#status).

## SQL injection

SQL injection allows an attacker to execute new or modify existing SQL statements to access information that they are not allowed to access. By mainly using our own [Data Abstraction Layer](/docs/concepts/framework/data-abstraction-layer.html), that does not expose SQL directly, most of the SQL injection attack vectors are prevented. Whenever direct SQL is being used, the [best practices from Doctrine DBAL](https://www.doctrine-project.org/projects/doctrine-dbal/en/current/reference/security.html) are followed to ensure proper escaping of user input.
