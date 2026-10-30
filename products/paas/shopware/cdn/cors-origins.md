---
nav:
  title: CORS Origins
  position: 45
---

# CORS Origins

Browsers only let a page read responses from another origin when that origin allows it with [CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS) headers. If a site that is served from its own domain, for example a [composable frontend](../composable-frontends/index.md), loads assets from the CDN of your application or calls its `/admin` and `/bundles` paths, the application has to allow that site.

Shopware PaaS Native manages this for you with CORS origins. You add the origins of the sites that are allowed to call your application, and the platform configures the storefront, the CDN, and the public bucket accordingly.

::: info
Shopware allows cross-origin requests to its API routes, such as `/store-api`, from any origin by default, so a composable frontend can call them without a CORS origin. See [CORS troubleshooting](https://developer.shopware.com/frontends/resources/troubleshooting/CORS.html) in the Shopware Frontends documentation.

Adding the origin of the frontend still helps: Fastly then answers the preflight requests (`OPTIONS`) for the Store API at the edge, instead of Shopware, and lets browsers cache the answer. See [Storefront](#storefront).
:::

## Which applications are affected

CORS origins apply to **Shopware applications** only. They configure the storefront, the CDN, and the public bucket of the Shopware application that is called.

A [composable frontend](../composable-frontends/index.md) is not changed by CORS origins. It is the site that calls your Shopware application, so you add the origin of the frontend to the Shopware application and not the other way around. The Fastly service of a composable frontend does not receive any of the CORS snippets described on this page.

## What is allowed by default

The domains attached to an application are always allowed. You do not have to add them, and they do not show up in the list of CORS origins.

A CORS origin allows **another** site in addition to those domains, for example the domain of a composable frontend.

## Manage CORS origins

You manage the origins of an application with the `sw-paas application cors` commands. The command can also be called as `sw-paas app cors`.

All commands accept the usual `--organization`, `--project` and `--application` flags (or their `--*-id` variants). Inside a project directory that is connected to your repository, they are discovered automatically.

### Add an origin

```sh
sw-paas application cors add --origin https://frontend.example.com
```

The origin has to be in the form `https://host[:port]`:

- The scheme must be `https`.
- A port is only part of the origin when it is not the default port, for example `https://frontend.example.com:8443`.
- No path, no trailing slash, and no wildcard such as `https://*.example.com`.

The value has to match exactly what the browser sends in its `Origin` header.

### List origins

```sh
sw-paas application cors list
```

The command lists the additional origins of the application. The attached domains are not part of the list. `ls` works as a short alias.

### Remove an origin

```sh
sw-paas application cors remove --origin https://frontend.example.com
```

`delete` works as an alias of `remove`.

### When changes take effect

Adding or removing an origin becomes active with the **next deployment** of the application. See [Applications](../fundamentals/applications.md) for how to deploy. Until then, the storefront and the CDN keep using the previous origins.

## What the platform configures

When an application has at least one CORS origin, the platform does the following.

### CDN

For the CDN, which serves the assets of your public bucket, Fastly answers CORS at the edge:

- Requests from an allowed origin get the matching `Access-Control-Allow-Origin` header, and the response carries `Vary: Origin`. The cached asset is shared by all origins, the header is added for every request.
- Preflight requests from an allowed origin are answered by Fastly. The allowed methods, headers, and exposed headers, and the lifetime of the preflight cache follow the CORS rule of the public bucket.
- Origins that are not on the list receive no CORS headers, and their preflight requests fail.

The origins are also added to the CORS rule of the public bucket.

### Storefront

For the storefront, Fastly answers CORS at the edge only for the paths `/admin`, `/bundles`, and `/store-api`. The CDN has no such restriction and answers on every path.

#### `/admin` and `/bundles`

These paths serve static files, such as the files of the Administration and the public assets of plugins. Browsers only load some of these files from another origin when CORS allows it, for example scripts loaded as modules and fonts. Fastly answers CORS for them like this:

- Requests from an allowed origin get `Access-Control-Allow-Origin` with that exact origin and `Vary: Origin`.
- Preflight requests from an allowed origin are answered by Fastly, with all methods and the requested headers.

#### `/store-api`

Fastly answers the preflight requests (`OPTIONS`) of an allowed origin, so the browser does not wait for Shopware. The answer contains the exact origin, the requested headers, all methods, and `Access-Control-Max-Age: 86400`, which lets browsers cache it. Without it, the preflight is answered by Shopware without a cache lifetime, and browsers repeat it after a few seconds.

Only the preflight is answered by Fastly. The actual Store API responses still come from Shopware and are not changed.

#### Other paths

Everything else is answered by Shopware itself, with its own CORS configuration. The origins you add do not restrict what Shopware answers, and origins that are not on the list are answered by Shopware as before. By default, Shopware sends `Access-Control-Allow-Origin: *` on its API routes, and the storefront pages send no CORS headers. The CORS origins of the application do not change that.

### Requirements

The edge configuration is part of the [default Fastly snippets](./fastly-snippets.md). If you set `fastly.disable_default_snippets: true`, the platform does not deploy the CORS snippets, and the origins have no effect at the edge. Add your own snippets in that case.

## Verify the configuration

After the deployment, send a preflight request from the origin you added:

```sh
curl -s -o /dev/null -D - -X OPTIONS \
  -H "Origin: https://frontend.example.com" \
  -H "Access-Control-Request-Method: GET" \
  "https://<cdn-domain>/<path-to-an-asset>"
```

The response contains `access-control-allow-origin: https://frontend.example.com`. A request with an origin that is not on the list does not.

## Troubleshooting

- **The browser still reports a CORS error:** the change needs a deployment. Compare `sw-paas application cors list` with the `Origin` header the browser sends.
- **The origin is rejected when adding it:** use `https://host[:port]` without a path, trailing slash, or wildcard.
- **It works on the CDN but not on other storefront paths:** Shopware answers CORS on those paths. Configure it in your Shopware application, the origins above do not apply there. See [CORS troubleshooting](https://developer.shopware.com/frontends/resources/troubleshooting/CORS.html) for a frontend that calls the Shopware API.
