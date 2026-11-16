---
nav:
  title: Delaying the Administration Boot
  position: 95

---

# Delaying the Administration Boot

Some plugins need to finish asynchronous setup before the Administration is mounted, for example, loading data that your plugin's code needs during the first render. `Shopware.Plugin.addBootPromise()` lets a plugin make the full Administration boot wait until that setup is done. This guide explains what the function does, where it fits in the boot process, and how to use it in your plugin's `main.js`.

## Prerequisites

You need a running Shopware 6 instance and a plugin with an Administration `main.js` file. See [Adding Services](./add-custom-service.md) for how plugin code is registered from `main.js`.

## What `addBootPromise` does

`Shopware.Plugin` contains two functions:

| Function                            | Behavior                                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `Shopware.Plugin.addBootPromise()`  | Takes no arguments. Creates a new pending promise, adds it to an internal list, and returns the `resolve` function of that promise. |
| `Shopware.Plugin.getBootPromises()` | Returns the list of all promises registered with `addBootPromise()`.                                                                |

The returned function is the only way to settle the promise. There is no `reject` function, and the platform doesn't add a timeout.

## Where the boot waits

When a logged-in user opens the Administration, `bootFullApplication()` runs these steps in order:

1. Run the `init-pre`, `init`, and `init-post` initializers.
2. Load the plugin scripts.
3. Wait for `Promise.all(Shopware.Plugin.getBootPromises())`.
4. Initialize the view dependencies.
5. Create the application root.

Because step 3 waits for every registered promise, the Administration isn't mounted until each function returned by `addBootPromise()` has been called. The value you pass to that function isn't used by the boot process.

The login screen uses a separate boot path, `bootLogin()`. It doesn't load plugins and doesn't wait for boot promises.

## Register a boot promise

Plugin scripts are added to the page as `<script type="module">` elements, and the boot waits until they are loaded before it collects the boot promises. Call `addBootPromise()` directly at the top level of your plugin's `main.js`, so the promise is registered while the script runs:

```javascript
// <plugin root>/src/Resources/app/administration/src/main.js
const bootDone = Shopware.Plugin.addBootPromise();

loadSwagExampleSettings()
    .finally(() => {
        bootDone();
    });
```

In this example, `loadSwagExampleSettings()` stands for your own asynchronous setup. Calling `bootDone()` in `finally()` makes sure the boot continues even when the setup fails.

::: warning
If the function returned by `addBootPromise()` is never called, the full Administration boot stops before the application root is created. Call it on every code path, including error paths.
:::

::: info
`getBootPromises()` is read once, in step 3 of the boot. A promise that is registered later, for example inside a component, isn't part of that `Promise.all()` call and doesn't delay the boot.
:::
