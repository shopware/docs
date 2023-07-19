# SameSite protection

{% hint style="info" %}
This feature has been introduced with Shopware version 6.4.3.1
{% endhint %}

## Overview

The [SameSite configuration](https://symfony.com/doc/current/reference/configuration/framework.html#cookie-samesite) comes with the Symfony FrameworkBundle and supersedes the removed `sw_csrf` Twig function.
It is widely [available](https://caniuse.com/same-site-cookie-attribute) in modern browsers and is set to `lax` per default.

For more information, refer to [SameSite cookies site](https://web.dev/i18n/en/samesite-cookies-explained/)

## Configuration

Changes to the `cookie_samesite` attribute can be applied to your `framework.yaml`. The `cookie_secure` ensures that cookies are either sent via http or https,
depending on the request origin.

```yml

framework:
  session:
    cookie_secure: 'auto'
    cookie_samesite: lax
```

If you want to deactivate the SameSite protection despite security risks, change the value from `lax` to `null`. For detailed
configuration options please check the official [Symfony Docs](https://symfony.com/doc/current/reference/configuration/framework.html#cookie-samesite).
