# HTML Sanitizer

::: info
This feature has been introduced with Shopware version 6.5. This is exclusively intended for self-hosted shops. However, it's important to note that the implementation is currently not available for cloud stores.
:::

## Overview

HTML sanitizer improves security, reliability and usability of the text editor by removing potentially unsafe or malicious HTML code. It also sanitizes styles and attributes for consistent and correct code rendering regardless of platform and browser. For example, if the `<img>` tag  is added, it is automatically removed by the editor after a few seconds and an additional notice appears that some of your inputs have been sanitized.

## Configuration

Through a workaround or an adjustment of the `z-shopware.yaml` file, it is possible to add the `<img>` tag to the allowed code.

The `z-shopware.yaml` is located below `config/packages/` on the server where Shopware is installed. By default, this file does not exist. A simple copy of the `shopware.yaml` in the same directory solves this obstacle.

In the copied `shopware.yaml` file (z-shopware.yaml), you should include an additional key called `html_sanitizer:` inside the `shopware:` section. This key will contain all the other values and wildcards required for whitelisting.

In this example, the `<img>` tag, as well as the CSS attributes `src`, `alt` and `style` are added to the whitelist:

```yaml

shopware:
    html_sanitizer:
        sets:
            -   name: basic
                tags: [ "img" ]
                attributes: [ "src", "alt", "style" ]
                options:
                    - key: HTML.Trusted
                      value: true
                    - key: CSS.Trusted
                      value: true
```

If you want to deactivate the sanitizer despite security risks, you can also do this in the `z-shopware.yaml` using the following code:

```yaml

shopware:
    html_sanitizer:
        enabled: false
```
