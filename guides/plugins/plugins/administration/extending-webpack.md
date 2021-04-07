# Extending Webpack

## Overview

The Shopware 6 Administration uses [Webpack](https://webpack.js.org/) as a static module bundler.
The default configuration should work for most plugins, 
but if you really need to extend the webpack configuration,
this guide will show you how it's done.

## Extending the Webpack configuration

The Webpack configuration can be extended by creating the file `<plugin root>src/Resources/app/administration/build/webpack.config.js`
and exporting a function from it, that returns an [webpack configuration object](https://webpack.js.org/configuration/). 
As seen below:

{% code title="<plugin root>src/Resources/app/administration/build/webpack.config.js" %}
```javascript
const path = require('path');

module.exports = () => {
    return {
        resolve: {
            alias: {
                SwagBasicExample: path.join(__dirname, '..', 'src')
            }
        }
    };
};
```
{% endcode %}

The configuration is then automatically loaded and then merged with the Shopware provided webpack configuration and all other plugin webpack configurations.
Merging is done with the [webpackMerge](https://github.com/survivejs/webpack-merge) library.
This merging makes it technically possible to override the Shopware provided configuration, although it is generally advised against.
