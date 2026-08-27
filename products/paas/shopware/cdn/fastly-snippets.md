---
nav:
  title: Fastly Snippets
  position: 43
product: hosting
lifecycle: implementation
---

# Fastly Snippets

Fastly VCL snippets customize the behavior of the Fastly service in front of your shop.

Shopware PaaS Native already deploys a maintained set of default snippets to its Fastly services. You do not have to configure anything to get them - they are enabled out of the box and cover the standard Shopware caching behavior.

On top of that you can:

- Add your own snippets, which are deployed alongside the default ones.
- Disable the default snippets with `fastly.disable_default_snippets: true` and take full control.

Custom snippets are read directly from your project repository during the deployment. Two things are required:

1. The snippet files must exist in your repository, organized in one sub-directory per VCL subroutine type.
2. The `services.fastly.snippets_path` option must point at that directory in your `application.yaml`. **Without this option, the snippet files are ignored.**

The rest of this page describes how to set that up.

## Configuration

Configure Fastly in the `services` section of your [`application.yaml`](../fundamentals/application-yaml.md):

```yaml
app:
  php:
    version: "8.4"
  environment_variables: []
services:
  mysql:
    version: "8.4"
  fastly:
    disable_default_snippets: false
    snippets_path: config/fastly
```

| Option                     | Default | Description                                                                                              |
|----------------------------|---------|----------------------------------------------------------------------------------------------------------|
| `snippets_path`            | unset   | Directory (relative to the repository root) containing your custom snippets. When unset, no custom snippets are deployed - the default snippets stay enabled |
| `disable_default_snippets` | `false` | Set to `true` to disable the default snippets that Shopware PaaS Native deploys to the Fastly services |

Apply the change with:

```sh
sw-paas application update
```

::: warning
Snippet files in your repository are only picked up when `services.fastly.snippets_path` points at their directory. Without that option the files are ignored and never configured in Fastly.
:::

## Folder layout

The directory referenced by `snippets_path` must be **exactly one level deep**: one sub-directory per Fastly VCL subroutine type, with the snippet files directly inside it.

```text
config/fastly/
├── deliver/
│   └── 001-headers.vcl
├── fetch/
│   └── default.vcl
├── hash/
│   └── default.vcl
├── hit/
│   └── default.vcl
├── miss/
│   └── default.vcl
├── pass/
│   └── default.vcl
└── recv/
    ├── 001-auth.vcl
    └── 002-geo.vcl
```

The name of the sub-directory determines the snippet type. Valid types are:

`init`, `recv`, `hash`, `hit`, `miss`, `pass`, `fetch`, `error`, `deliver`, `log`, `none`

See the [Fastly VCL subroutine reference](https://developer.fastly.com/reference/vcl/subroutines/) for what each type does.

::: danger
Deeper nesting is not supported. `config/fastly/recv/default.vcl` is valid, `config/fastly/recv/custom/default.vcl` is not, and a file placed directly in `config/fastly/` is not either. Any file outside a valid type sub-directory fails the deployment.
:::

## Snippet order

Within a type, the files are sorted by file name and the Fastly snippet priority is assigned in that order: the first file gets priority `1`, the second `2`, and so on. In Fastly, the lower priority is executed first.

Prefix your file names with a number to make the order explicit:

```text
config/fastly/recv/
├── 001-auth.vcl    # priority 1, executed first
├── 002-geo.vcl     # priority 2
└── 003-routing.vcl # priority 3
```

The numbering is only calculated for your custom snippets. The default snippets are deployed with priority `50`, so your custom snippets of the same type are executed **before** the default ones. They cover the `recv`, `fetch`, `miss`, `pass` and `deliver` subroutines on the `storefront` service and the `recv`, `fetch` and `deliver` subroutines on the `cdn` service.

## Targeting a Fastly service

Shopware PaaS Native runs two Fastly services (see [CDN](./index.md)):

- `storefront` - proxies the storefront and admin Shopware instances.
- `cdn` - proxies the CDN assets hosted on S3 (public bucket).

Which service a snippet is deployed to is decided by the beginning of its file name:

| File name                  | Deployed to                |
|----------------------------|----------------------------|
| `recv/test.vcl`            | `storefront` **and** `cdn` |
| `recv/storefront-test.vcl` | `storefront` only          |
| `recv/cdn-test.vcl`        | `cdn` only                 |

A snippet that only makes sense in front of the shop - for example one touching session handling or shop routing - should be prefixed with `storefront-` so it is ignored on the `cdn` service. A snippet that only concerns the assets should be prefixed with `cdn-`. Without a prefix, the snippet is applied to both services, so make sure it is valid for both shop and asset traffic.

The prefix has to be at the **start** of the file name, so the numbering used to order the snippets comes after it:

```text
config/fastly/
├── deliver/
│   ├── 001-security-headers.vcl        # storefront and cdn
│   ├── storefront-001-shop-headers.vcl # storefront only
│   └── cdn-001-asset-headers.vcl       # cdn only
└── recv/
    ├── 001-normalize-url.vcl           # storefront and cdn
    └── storefront-002-auth.vcl         # storefront only
```

`storefront-001-shop-headers.vcl` is picked up as a storefront-only snippet, while `001-storefront-shop-headers.vcl` is not - the prefix is not at the start, so it is treated as a regular snippet and deployed to both services.

## File naming rules

The snippet name is derived from the type and the file name without extension (`recv/001-auth.vcl` becomes `recv-001-auth`) and is used as a Kubernetes resource name. Therefore:

- Use lowercase alphanumeric characters and `-`.
- Underscores (`_`) are **not** allowed. Use `-` instead, for example `001-auth.vcl` instead of `001_auth.vcl`.
- The resulting names must be unique per type. `a.b.vcl` and `a-b.vcl` both normalize to `recv-a-b` and are rejected as a collision.

## Validation

Snippets are validated when the application is created or updated. The deployment fails with an error when:

- `snippets_path` is set but the directory is missing or empty.
- A file is not directly inside a valid subroutine type sub-directory.
- A file name contains an underscore, or two files map to the same snippet name.
- A file does not contain syntactically valid VCL.

Fix the reported problem, push the change, and run `sw-paas application update` again.
