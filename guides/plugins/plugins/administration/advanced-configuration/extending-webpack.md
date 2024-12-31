---
nav:
  title: Extending Webpack
  position: 240

---

# Extending Webpack

## Overview

The Shopware 6 Administration uses [Webpack](https://webpack.js.org/) as a static module bundler. Normally you don't need to change the Webpack configuration, but if you need to here is how to do it.

## Extending the Webpack configuration

The Webpack configuration can be extended by creating the file `<plugin root>/src/Resources/app/administration/build/webpack.config.js` and exporting a function from it. This will return a [webpack configuration object](https://webpack.js.org/configuration/), as seen below:

```javascript
// <plugin root>/src/Resources/app/administration/build/webpack.config.js
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

This way, the configuration is automatically loaded and then merged with the Shopware provided webpack configuration. Configurations of plugins are **not** merged into each other. Merging is done with the [webpackMerge](https://github.com/survivejs/webpack-merge) library.
