# Self hosted Mercure installation for Guided Shopping

## Mercure installation

### Mercure settings in general

| Variable           | Description                                                                                                                    | dev | production | SAAS |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------ | --- | ---------- | ---- |
| Publisher JWT key  | The key which is used                                                                                                          | --  | ..         | .    |
| Subscriber JWT key | ...                                                                                                                            | --  | ..         | .    |
| cors_origins       | The pages from where access is allowed [toueble shoot cors errors](https://mercure.rocks/docs/hub/troubleshooting#cors-issues) | --  | ..         | .    |
| ui                 | enables the UI and expose demo endpoints                                                                                       | 1   | 0          | ??   |
| demo               | enable the UI but do not expose demo endpoints                                                                                 | 1   | 0          | ??   |
| anonymous          | allow subscribers with no valid JWT to connect                                                                                 | 0   | 0          | ??   |

### 1. via docker

if you host mercure your self the easyest way is to do it via docker.
The image can be found here [dunglas/mercure](https://hub.docker.com/r/dunglas/mercure)

#### configure mercure docker

The docker image allows you to use the following env variables to configure mercure, you could also configure it like the self installed version via the caddy file.

Use different keys for publishing and subscribers for security reasons!
<code>

- MERCURE_PUBLISHER_JWT_KEY: your-256-bit-publisher-key
- MERCURE_SUBSCRIBER_JWT_KEY: your-256-bit-subscriber-key
- MERCURE_EXTRA_DIRECTIVES: |-  
   cors_origins "https://my-pwa-shop.com https://en.my-pwa-shop.com"  
   anonymous 0  
   ui 1
  </code>

### 2. Self installed

The [installation guide](https://mercure.rocks/docs/hub/install) explains all steps that are required.

#### production config

<code>mercure {
...  
publisher_jwt my-publisher-key HS256  
subscriber_jwt my-subscriber-key HS256  
cors_origins "https://my-pwa-shop.com https://en.my-pwa-shop.com"  
demo 0  
ui 0  
...
}</code>

### 3. SAAS instance
