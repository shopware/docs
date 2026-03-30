---
nav:
  title: Plugin Store Authentication
  position: 100
---

# Plugin Store Authentication
The build process might needs to authentication against plugins stores (Shopware official and any other one), this document explain how configure this authentication.

We rely on `composer` to fecth plugin during build time configured with two environment variables: `SHOPWARE_PACKAGES_TOKEN` and `COMPOSER_AUTH`.

## Shopware plugin store
Under normal circumstances, during the provisioning of your organization we automatically create the secret `SHOPWARE_PACKAGES_TOKEN`.
This secret contains the token to authenticate against the official Shopware plugin store.

If this secret is not present you can recreate it:
```
sw-paas vault create --type buildenv --key SHOPWARE_PACKAGES_TOKEN
```
Then just put the token provided by Shopware.

## Third party plugin store
To authenticate against third party plugin store or plugin repository you need to create a secret named `COMPOSER_AUTH`.
The content need to be the json string required for the store/repository, run the following command:
```
sw-paas vault create --type buildenv --key COMPOSER_AUTH
```

The content of the secret needs to be a json string compatible with composer, for instance:
- basic auth string:
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

- a bearer token:
```json
{
  "bearer": {
    "git.mycompany.com": "mytoken"
  }
}
```