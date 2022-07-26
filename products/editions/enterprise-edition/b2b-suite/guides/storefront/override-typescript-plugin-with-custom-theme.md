# How to override existing TypeScript with custom theme

You can download a theme showcasing the topic [here](/products/editions/enterprise-edition/b2b-suite/example-plugins/B2bOverrideTsPlugin.zip).

## Table of contents

* [Description](#description)
* [Setting the theme to compile ts](#setting-the-theme-to-compile-ts)
* [Extending an existing b2b plugin](#extending-an-existing-b2b-plugin)
* [Override the b2b plugin](#override-the-b2b-plugin)

## Description

This guide goes through details on how you could extend and override b2b-suite typescript plugins.
Before learn how to extend a b2b plugin, we strongly recommend to read the shopware 6 storefront extension
[documentation](https://developer.shopware.com/docs/guides/plugins/plugins/storefront/override-existing-javascript) as we will only point
out the specifications for extending b2b plugins in particular, assuming previous knowledge on how to do it for a
shopware 6 javascript plugin.

## Setting the theme to compile ts

You can create a new theme according to the [documentation](https://developer.shopware.com/docs/guides/plugins/themes/create-a-theme).
From shopware 6.4.15.0 typescript files will be automatically compiled. For previous versions, the default build process it's
not configured to compile your typescript code. Therefore, If you are running on shopware 6.4.15.0 or above,
and you don't need to customize the compiler options, you can skip this section.

If you need to add custom webpack and typescript compiler options, additional configuration files should be added to your theme.
The webpack config should include a typescript loader, and aliases to ease the imports.

Example webpack config '<PluginName>/src/Resources/app/storefront/build/webpack.config.js':

```typescript
const path = require('path');

module.exports = () => {
    return {
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [{
                        loader: path.resolve(__dirname, '..', 'node_modules', 'ts-loader')
                    }],
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            alias: {
                '@b2b': path.resolve(__dirname, './../../../../../../SwagB2bPlatform/SwagB2bPlatform/Resources/app/storefront/src/js'),
                apexcharts: path.resolve(__dirname, './../../../../../../SwagB2bPlatform/SwagB2bPlatform/Resources/app/storefront/node_modules/apexcharts')
            },
            extensions: [ '.ts', '.tsx', '.js', '.jsx', '.json', '.less', '.sass', '.scss', '.twig' ]
        }
    };
};
```

Additionally, add custom typescript compiler configuration.
Example custom typescript configuration '<PluginName>/src/Resources/app/storefront/tsconfig.json'

```json
{
  "compilerOptions": {
    "sourceMap": true,
    "removeComments": true,
    "target": "es5",
    "module": "es6",
    "moduleResolution": "node",
    "allowJs": true,
    "noEmit": false,
    "esModuleInterop": true,
    "strict": false,
    "experimentalDecorators": true,
    "lib": ["es2017", "dom"],
    "types": ["node"]
  }
}
```

In order to have webpack, its loaders and typescript modules available, a package.json should be added and the modules
installed via 'npm install' beforehand.
Please note loader versions need to be fixed to support webpack 4 while the shopware 6 storefront its based on it.

Here an example '<PluginName>/src/Resources/app/storefront/package.json'

```json
{
    "name": "example-theme",
        "version": "1.0.0",
        "description": "Example theme",
        "main": "main.js",
        "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
    },
    "author": "shopware AG",
        "license": "MIT",
        "devDependencies": {
        "@types/node": "^18.6.1",
        "ts-loader": "8.1.0",
        "typescript": "^4.7.4",
        "webpack": "4.38.0"
    }
}
```

## Extending an existing b2b plugin

In your own typescript code, you could import the b2b plugins directly or using the alias created in the previous section.

Here and example '<PluginName>/src/Resources/app/storefront/src/plugins/my-custom-ajax-panel-modal.ts':

```typescript
import AjaxPanelModalPlugin from '@b2b/plugins/ajax-panel-modal.plugin';

export default class MyModal extends AjaxPanelModalPlugin {
    public init() {
        // init code
    }

    protected someMethod(event: MouseEvent): void {
        // additional code
    }
}
```

## Override the b2b plugin

In order to override the b2b plugin, you could use the Plugin Manager as described for in the
[documentation](https://developer.shopware.com/docs/guides/plugins/plugins/storefront/override-existing-javascript).
