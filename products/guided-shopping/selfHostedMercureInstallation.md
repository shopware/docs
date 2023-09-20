# Self-hosted Mercure Installation for Guided Shopping

## Mercure general settings

| Name | Variable | Description |
| ---- | -------- | ----------- |
| Publisher JWT Key  | publisher_jwt      | The JWT key used for authenticating publishers |
| Subscriber JWT Key | subscriber_jwt     | The JWT key used for authenticating subscribers|
| CORS Origin        | cors_origins       | List of domains allowed to connect to the Mercure hub as value of the cors_origins. For other cases, check [troubleshoot cors errors](https://mercure.rocks/docs/hub/troubleshooting#cors-issues) |
| UI                 | ui                 | Enable the UI and expose the demo |
| Demo               | demo               | Enable the UI but do not expose the demo |
| Anonymous          | anonymous          | Allow subscribers with no valid JWT to connect |

## Mercure installation

There are two recommended ways of Mercure installations:

### 1. Docker

If you host Mercure yourself, the easiest way is to do it via docker. The image can be found at [dunglas/mercure](https://hub.docker.com/r/dunglas/mercure).

#### Configure Mercure docker

The docker image allows you to use the following *env* variables to configure Mercure.

::: warning
Use different publisher and subscriber keys for security reasons.
:::

```txt
- MERCURE_PUBLISHER_JWT_KEY: your-256-bit-publisher-key
- MERCURE_SUBSCRIBER_JWT_KEY: your-256-bit-subscriber-key
- MERCURE_EXTRA_DIRECTIVES: |-  
   cors_origins "https://my-pwa-shop.com https://en.my-pwa-shop.com"  
   anonymous 0  
   ui 1
```

You can also configure it like the self-installed version via the Caddyfile.

```txt
// Sample Caddyfile
{
    # Debug mode (disable it in production!)
    debug
    # HTTP/3 support
}
:80
log
route {
    redir / /.well-known/mercure/ui/
    encode gzip
    mercure {
        # Enable the demo endpoint (disable it in production!)
        demo
        # Publisher JWT key
        publisher_jwt MySecret
        # Subscriber JWT key
        subscriber_jwt MySecret
        # CORS
        cors_origins http://localhost:3000 http://localhost:8080 http://shopware.test http://7779-91-90-160-158.ngrok.io
        publish_origins localhost:3000 localhost:8080 shopware.test 7779-91-90-160-158.ngrok.io
        # Allow anonymous subscribers (double-check that it's what you want)
        anonymous
        # Enable the subscription API (double-check that it's what you want)
        subscriptions
    }
    respond "Not Found" 404
}
```

### 2. Self-installation

The [installation guide](https://mercure.rocks/docs/hub/install) explains all steps that are required for installing the Mercure.

#### Production configuration

```txt
mercure {
...  
publisher_jwt my-publisher-key HS256  
subscriber_jwt my-subscriber-key HS256  
cors_origins "https://my-pwa-shop.com https://en.my-pwa-shop.com"  
demo 0  
ui 0  
...
}
```
