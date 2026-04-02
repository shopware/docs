---
nav:
  title: Plugin Store Authentication
  position: 100
---

# Plugin Store Authentication

The build process might need to authenticate against plugin stores (Shopware official and any others). This document explains how to configure this authentication.

We rely on `composer` to fetch plugin during build time, configured with two environment variables: `SHOPWARE_PACKAGES_TOKEN` and `COMPOSER_AUTH`.

## Shopware plugin store

Under normal circumstances, during the provisioning of your organization, we automatically create the secret `SHOPWARE_PACKAGES_TOKEN`.
This secret contains the token to authenticate against the official Shopware plugin store.

If this secret is not present, you can recreate it:

```sh
sw-paas vault create --type buildenv --key SHOPWARE_PACKAGES_TOKEN
```

Then just put the token provided by Shopware.

## Third-party plugin store

To authenticate against a third-party plugin store or plugin repository, you need to create a secret named `COMPOSER_AUTH`.
The content needs to be the JSON string required for the `store/repository`. Run the following command:

```sh
sw-paas vault create --type buildenv --key COMPOSER_AUTH
```

The content of the secret needs to be a JSON string compatible with composer, for instance:

A basic auth string:

```json
{
  "http-basic": {
    "git.mycompany.com": {
      "password": "mypassword",
      "username": "myuser"
 }
 }
}
```

A bearer token:

```json
{
  "bearer": {
    "git.mycompany.com": "mytoken"
 }
}
```
