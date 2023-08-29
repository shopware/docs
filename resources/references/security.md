# Security

## Overview

This reference presents a comprehensive compilation of all security measures implemented in Shopware 6, along with instructions on how to configure them.

## API aware fields

The `ApiAware` flag allows you to control what fields of your entity are exposed to the Store API. For more information, refer to [Flags Reference](core-reference/dal-reference/flags-reference.md).

## HTML sanitizer

HTML sanitizer improves security, reliability, and usability of the text editor by removing potentially unsafe or malicious HTML code. For more information, refer to [HTML Sanitizer](../../../guides/hosting/configurations/shopware/html-sanitizer.md) guide.

## Rate limiter

Shopware 6 provides certain rate limits by default that reduces the risk of brute-force attacks for pages like login or password reset. For more information, refer to [Rate Limiter](../../../guides/hosting/infrastructure/rate-limiter.md) guide.

## SameSite cookies

SameSite prevents the browser from sending cookies along with cross-site requests. For more information on this, refer to [SameSite Protection](../../../guides/hosting/configurations/framework/samesite-protection.md).

## Security plugin

Obtaining security fixes without version upgrades is possible through the [Security plugin](../../../guides/hosting/installation-updates/cluster-setup.md#security-plugin).
