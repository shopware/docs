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

## File access

Shopware 6 stores and processes a wide variety of files. This goes from product images or videos to generated documents such as invoices or delivery notes. This data should be stored securely, and backups should be generated regularly. For more information, refer to [File system](../../guides/hosting/infrastructure/filesystem)

## Media upload by URL

Shopware offers a convenience feature to allow media file uploads by directly providing a URL pointing to a third party location containing that file.
By default, Shopware validates the URL to ensure that it points to a publicly accessible resource; this prevents attacks where internal networking information might be leaked. You can disable this validation by toggling the `shopware.media.enable_url_validation` to false.
However, there is still some security risk in this approach, as your Shopware server makes a request to the external URL and therefore discloses some information about itself (e.g. IP address or user agent).
If this is a concern to you, you can disable the whole URL upload feature by setting `shopware.media.enable_url_upload_feature = false`.

## GDPR compliance

General Data Protection Regulation (GDPR) is a comprehensive European Union (EU) regulation that enhances individuals' privacy rights by imposing strict rules on how organizations collect, process, and protect personal data. For more information, refer to [GDPR](https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/gdpr) guide.

Shopware provides a comprehensive [Cookie Consent Management](../../concepts/commerce/content/cookie-consent-management) system with features to help shop owners handle customer privacy preferences, ensure transparent cookie handling, and support GDPR compliance efforts.

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
