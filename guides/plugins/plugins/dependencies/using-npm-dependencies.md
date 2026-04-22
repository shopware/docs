---
nav:
  title: Adding NPM dependencies
  position: 120

---

# Adding NPM Dependencies

In this guide, you'll learn how to add NPM dependencies to your project.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course, you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. Further, a basic understanding of Node and NPM is required.

## Video

This guide is also available as a video:

<YoutubeRef video="wfBuWdff35c" title="Shopware 6: Your custom NPM dependencies (Developer Tutorial) - YouTube" target="_blank" />

::: warning
This video shows how to resolve the NPM package name as an alias. We recommend resolving all node_modules instead like shown in the code example below.
:::

## Adding a npm package to the Administration or the Storefront

Presuming you have `npm` installed, run `npm init -y` in the `<plugin root>src/Resources/app/administration/` folder or the `<plugin root>src/Resources/app/storefront/` folder. This command creates a `package.json` file in the respective folder, depending on the environment you're working in. To add a package to the `package.json` file simply run the `npm install` command. In this example we will be installing [`missionlog`](https://www.npmjs.com/package/missionlog).

So in order to install `missionlog`, run `npm install missionlog` in the folder you have created your `package.json` file in.

## Registering a package in the build system

Shopware's storefront as well as administration is based on the build system [Webpack](https://webpack.js.org/). Webpack is a source file bundler: In essence it bundles all the source files into a single `bundle.js` to be shipped to a browser. So in order to make Webpack aware of the new dependency, we have to register it and give it an alias/pseudonym so that the package can be bundled correctly.

To do this, we create a new folder called "build" under either `Resources/app/storefront` or `Resources/app/administration`. In this build folder we create a new file with the name `webpack.config.js`. We thereby make it possible to extend the Webpack configuration of Shopware.

```javascript
module.exports = (params) => {
    return { 
        resolve: { 
            modules: [
                `${params.basePath}/Resources/app/storefront/node_modules`,
            ],
       } 
   }; 
}
```

Let us take a closer look at the code. In the first line, we export a so-called arrow function. The build system from Shopware calls this function when either the Administration or Storefront is being built.

Now we add the `node_modules` folder from our extension. `resolve.modules` tells webpack what directories should be searched when resolving modules. By default, the shopware webpack config only considers the `node_modules` folder of the platform. By accessing `params.basePath` we get the absolute path to our extension. We then add the rest of the path to our extensions `node_modules`. Now webpack will also search for modules in our `node_modules` folder.

## Using the dependency

Once we have installed all the dependencies and registered the package in the build system, we can use the package in our own code.

```javascript
// <plugin root>/src/Resources/app/storefront/src/example.plugin.js
const { PluginBaseClass } = window;

// Import logger
import { log } from 'missionlog';

// Initializing the logger
log.init({ initializer: 'INFO' }, (level, tag, msg, params) => {
    console.log(`${level}: [${tag}] `, msg, ...params);
});

// The plugin skeleton
export default class ExamplePlugin extends PluginBaseClass {
    init() {
        console.log('init');

        // Use logger
        log.info('initializer', 'example plugin got started', this);
    }
}
```

We import the function log as well as the constants tag via `destructuring` in the specified code and register our above plugin in our main.js file, so it can be loaded by the plugin system.

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
import ExamplePlugin from './example.plugin';

PluginManager.register(
    'ExamplePlugin',
    ExamplePlugin
);
```

The final step in this process is to build your Storefront or Administration so that your changes are processed by Webpack.

```bash
# Build the Storefront
./bin/build-storefront.sh

# Build the Administration
./bin/build-administration.sh
```

## Next steps

Now that you know how to include new `npm` dependencies you might want to create a service with them. Learn how to do that in this guide: [How to add a custom-service](../administration/services-utilities/add-custom-service)

If you want to add [Composer dependencies](using-composer-dependencies), or even other [plugin dependencies](add-plugin-dependencies), we've got you covered as well.
