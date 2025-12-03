---
nav:
  title: Standalone Admin Watcher
  position: 3

---

# Standalone Admin Watcher

::: info
`shopware-cli extension admin-watch` can be different to the regular Admin Watcher. You can start the regular Admin Watcher with `shopware-cli project admin-watch`
:::

Shopware CLI has an integrated Standalone Admin Watcher. This is useful if the regular Admin Watcher struggles with the number of installed extensions, and you only want to watch one single extension. The Standalone Watcher works by using the regular build Administration and injects only the changed files of the extension.

Therefore, the Watcher starts in few milliseconds and is very fast. Additionally, it can be targeted to an external Shopware 6 Instance to debug JavaScript or CSS changes with the external data.

## Starting the standalone Admin Watcher

To start the standalone Admin Watcher, you can use the following command:

```bash
shopware-cli extension admin-watch <path-to-extension> <url-to-shopware>
```

The first parameter is the **path to extension** you want to watch and the last parameter is the URL to the Shopware 6 instance. The URL must be reachable from the machine where the CLI is executed. You can watch also multiple extensions by providing multiple paths, but the last parameter must be the URL to the Shopware 6 instance.

You can also pass **path of a Shopware project** to the command. In this case, the CLI will automatically detect the extensions.

The listing port of the Admin Watcher can be changed with `--listen :<port>`.

## Usage behind a proxy

If you want to use the Standalone Admin Watcher behind a proxy, for example, SSL, you should set `--external-url` to the URL where the Admin Watcher will be reachable in the Browser.
