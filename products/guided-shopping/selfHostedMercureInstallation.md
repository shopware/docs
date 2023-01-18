# Self Hosted Mercure Installation for Guided Shopping

## Mercure settings in general

| Name | Variable | Description |
| ---- | -------- | ----------- |
| Publisher JWT Key  | publisher_jwt      | The JWT key used for authenticating publishers |
| Subscriber JWT Key | subscriber_jwt     | The JWT key used for authenticating subscribers|
| CORS Origin        | cors_origins       | Pages from where access is allowed [troubleshoot cors errors](https://mercure.rocks/docs/hub/troubleshooting#cors-issues) |
| UI                 | ui                 | Enable the UI and expose demo |
| Demo               | demo               | Enable the UI but do not expose demo |
| Anonymous          | anonymous          | Allow subscribers with no valid JWT to connect |

## Mercure installation

### 1. Docker

If you host Mercure yourself, the easiest way is to do it via docker. The image can be found at [dunglas/mercure](https://hub.docker.com/r/dunglas/mercure).

#### Configure Mercure docker

The docker image allows you to use the following env variables to configure Mercure. You can also configure it like the self installed version via the Caddyfile.

{% hint style="warning" %}
Use different publisher and subscriber keys for security reasons.
{% endhint %}

{% code %}

- MERCURE_PUBLISHER_JWT_KEY: your-256-bit-publisher-key
- MERCURE_SUBSCRIBER_JWT_KEY: your-256-bit-subscriber-key
- MERCURE_EXTRA_DIRECTIVES: |-  
   cors_origins "https://my-pwa-shop.com https://en.my-pwa-shop.com"  
   anonymous 0  
   ui 1

{% encode %}

### 2. Self installed

The [installation guide](https://mercure.rocks/docs/hub/install) explains all steps that are required for installing the Mercure.

#### Production config

{% code %}

mercure {
...  
publisher_jwt my-publisher-key HS256  
subscriber_jwt my-subscriber-key HS256  
cors_origins "https://my-pwa-shop.com https://en.my-pwa-shop.com"  
demo 0  
ui 0  
...
}

{% encode %}
