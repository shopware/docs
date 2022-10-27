# Adding NPM dependencies

In this guide you'll learn how add NPM dependencies to your project.

## Prerequisites

All you need for this guide is a running Shopware 6 instance and full access to both the files and a running plugin. Of course you'll have to understand JavaScript, but that's a prerequisite for Shopware as a whole and will not be taught as part of this documentation. Further a basic understanding Node and NPM is required.

## Video

This guide is also available as a video:
<!-- markdown-link-check-disable-next-line -->
<PageRef page="https://www.youtube.com/watch?v=wfBuWdff35c" title="Your custom NPM dependencies" target="_blank" video />

## Adding a npm package to the Administration or the Storefront

Presuming you have `npm` installed, run `npm init -y` in the `<plugin root>src/Resources/app/administration/` folder or the `<plugin root>src/Resources/app/storefront/` folder. This command creates a `package.json` file in the respective folder, depending on the environment you're working in. To add a package to the `package.json` file simply run the `npm install` command. In this example we will be installing [`missionlog`](https://www.npmjs.com/package/missionlog).

So in order to install `missionlog`, run `npm install missionlog` in the folder you have created your `package.json` file in.

## Registering a package in the build system

Shopware's storefront as well as administration is based on the build system [Webpack](https://webpack.js.org/). Webpack is a source file bundler: In essence it bundles all the source files into a single `bundle.js` to be shipped to a browser. So in order to make Webpack aware of the new dependency, we have to register it and give it an alias/pseudonym so that the package can be bundled correctly.

To do this we create a new folder called "build" under either `Resources/app/storefront` or `Resources/app/administration`. In this build folder we create a new file with the name `webpack.config.js`. We thereby make it possible to extend the Webpack configuration of Shopware.

<CodeBlock title="<plugin root>/src/Resources/app/storefront/build/webpack.config.js">

```javascript
const { join, resolve } = require('path'); 
module.exports = () => { 
    return { 
        resolve: { 
           alias: { 
               '@missionlog': resolve( 
                    join(__dirname, '..', 'node_modules', 'missionlog') 
               ) 
           } 
       } 
   }; 
}
```

</CodeBlock>

Let us take a closer look at the code. In the first line, we import the two functions `join` and `resolve` for the path module of Node.js. In the second line, we export a so-called arrow function. The build system from Shopware calls this function when either the administration or storefront is being built.

After that, there comes the exciting part for us: registering the alias. The alias for `missionlog` is given the prefix `@`, so it is possible to recognize later on in the source files. We will use the result of the two functions of the path module previously imported as a value.

We proceed from the inside to the outside. We use [`join`](https://nodejs.org/api/path.html#path_path_join_paths) to reflect the path to the package inside the `node_modules` folder. The `node_modules` folder contains all the packages that we have installed via `npm install`. After we identified the relevant path to the package, we use the [`resolve`](https://nodejs.org/api/path.html#path_path_resolve_paths) function to transform this path into an absolute path.

## Using the dependency

Once we have installed all the dependencies and registered the package in the build system with an alias, we can use the package in our own code.

<CodeBlock title="<plugin root>/src/Resources/app/storefront/src/main.js">

```javascript
import Plugin from 'src/plugin-system/plugin.class';

// Import logger
import { log } from '@missionlog';

// Initializing the logger
log.init({ initializer: 'INFO' }, (level, tag, msg, params) => {
    console.log(`${level}: [${tag}] `, msg, ...params);
});

// The plugin skeleton
export default class ExamplePlugin extends Plugin {
    init() {
        console.log('init');

        // Use logger
        log.info('initializer', 'example plugin got started', this);
    }
}
```

</CodeBlock>

We import the function log as well as the constants tag via `destructuring` in the specified code. Through the use of the alias, we keep the paths short and recognize that this is an alias at first glance via the prefix.

The final step in this process is to build your storefront or administration so that your changes are processed by Webpack.

## Next steps

Now that you know how to include new `npm` dependencies you might want to create a service with them. Learn how to do that in this guide: [How to add a custom-service](../administration/add-custom-service)

If you want to add [composer dependencies](using-composer-dependencies), or even other [plugin dependencies](add-plugin-dependencies), we've got you covered as well.
