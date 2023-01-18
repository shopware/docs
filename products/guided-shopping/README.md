# Guided Shopping Installation

Guided Shopping is the state-of-the-art new feature that seamlessly integrates into your Shopware system landscape and co-operates with your existing ecommerce infrastructure.

You can create interactive live video events for your customers straight from your Shopware website without having to switch between a presentation tool, video conferencing system, and store system. It is one sophisticated solution to highlight your products, engage your customers and reinforce brand loyalty.

![Untitled](../../../docs/.gitbook/assets/products-guidedShopping.png)

To install this feature, you need the below prerequisites and know how to get the plugin for Shopware 6.

{% hint style="warning" %}
Guided Shopping is a commercial extension and is available as open source.
{% endhint %}

## Prerequisites

1. Instance of [Shopware 6](https://developer.shopware.com/docs/guides/installation/from-scratch) (supported versions: > 6.4.10.0)
1. Instance of [Shopware PWA](https://github.com/vuestorefront/shopware-pwa) (supported versions: > 1.2.0)
1. Install and activate [PWA plugin](https://github.com/shopware/SwagShopwarePwa) in an instance of Shopware 6 (supported versions > 0.3)
1. Install [Mercure package](https://packagist.org/packages/symfony/mercure#v0.5.3) in an instance of Shopware 6 (supported versions is 0.5.3)

{% hint style="info" %}
To install Mercure 0.5.3, use the following command :

```
composer require symfony/mercure ^0.5.3*
```

{% endhint %}

1. Mercure service is available with one of the options:
   1. [Self-hosted installation](./selfHostedMercureInstallation.md)
   1. [Cloud](https://mercure.rocks/) service is publicly accessible . Refer to the [basic configuration](#basic-configuration) section.
1. An account in [daily.co](http://daily.co/) for developer’s API KEY required. Refer to [set up an account](#set-up-an-account)

## Get the plugin for Shopware 6

1. Clone or download the [repository](https://github.com/shopware/guided-shopping).
1. Extract the plugin from `custom/plugins/SwagGuidedShopping` directory, including the outer folder `SwagGuidedShopping`.
1. Make sure the plugin has a PHP package structure containing _`composer.json`_ file, _`src/`_ folder and so on.
1. Prepare a zip file containing the plugin as in the following structure:

{% code %}

```bash
# SwagGuidedShopping.zip

**SwagGuidedShopping**/
├── bin
├── composer.json
├── composer.lock
├── makefile
├── phpstan.neon
├── phpunit.xml
├── [README.md](http://readme.md/)
├── src
└── tests
```

{% encode %}

## Install the plugin

### Install via the admin panel using the zip package

1. Log in to the admin panel.
1. Go to Extensions > My extensions

   ![Untitled](../../../docs/.gitbook/assets/products-guidedShopping-extensionsMenu.png)

1. Click on the “Upload extension” button and choose the zip file containing the plugin from your device.

   ![Untitled](../../../docs/.gitbook/assets/products-guidedShopping-uploadExtension.png)

1. Once it is uploaded and listed, click “Install app”.

    ![Untitled](../../../docs/.gitbook/assets/products-guidedShopping-swagExtensionOnList.png)

1. On successful installation, activate the plugin by clicking on the switch button on the left.

1. Next, you must configure the plugin. Refer to the [setting the plugin](#setting-the-plugin) section.

### Install via the terminal server

1. Log in to a server.
2. Zip the plugin and place it in `<shopware-root-dir>/custom/plugins` directory.
3. Extract the zipped file from `<shopware-root-dir>/custom/plugins` directory.
4. Run the below Symfony commands:

```bash
# refresh the list of available plugins
bin/console plugin:refresh
# find the plugin **name** (first column on the list). In this case, it is "**SwagGuidedShopping"**
bin/console plugin:install **SwagGuidedShopping** --activate
# clear the cache afterwards
bin/console cache:clear

# Now it is ready to use :) 🏁
```

## Basic configuration

Minimum configuration for a working stack apart from project specific CMS configuration.

### Mercure

Except for the self-hosted service, we recommend using any cloud-based service.

{% hint style="info" %}
💡 We tested the service provided by [StackHero](https://www.stackhero.io/en/services/Mercure-Hub/pricing). Depending on the expected traffic, you can easily switch between the plans. For a small demo between few people at the same time, the “Hobby” plan is sufficient.
{% endhint %}

#### Set up CORS allowed origins

In our case, it would be the domain where the Shopware PWA is hosted and available.

For instance: `https://shopware-pwa-gs.herokuapp.com`(frontend)

### Set up publish allowed origins

The domains which requests the Mercure service must be added to publish allowed origins else it gets rejected.

For instance: (HTTP protocol must not be included):
`shopware-pwa-gs.herokuapp.com` (frontend) and `pwa-demo-api.shopware.com`(backend - API)

### Set up the publisher (JWT) key

Set whatever you want

### Set up the subscriber (JWT) key

Set whatever you want

### Additional settings

Default is recommended - [Sample Mercure config on StackHero](sampleMercureConfig.md).

## Daily

The service is responsible for streaming a video between the attendees.

### Set up an account

1. Go to the [Daily dashboard](https://dashboard.daily.co/).
2. Visit the “developers” section on the left.
3. Get the **API KEY**.

## Setting the plugin

Once the plugin is installed and the services are up and running, you will have all the required credentials. The next thing to do is to configure the Guided Shopping plugin itself.

Here, we focus on external services because they are crucial for working with a plugin.

### Video section

1. You can leave the **API Base URL** as it is `https://api.daily.co/v1/` if not necessary.
1. Put your **API KEY** into the right input.

![an example of Video section in the plugin’s configuration](../../../docs/.gitbook/assets/products-guidedShopping-videoConfig.png)

### Mercure section

1. Replace *Mercure Hub Url* and *Mercure Hub Public Url* with your domain’s URL where the Mercure service is working and accessible from your stack. For instance, for the URL `https://fcoxpx.stackhero-network.com`, it would be `https://fcoxpx.stackhero-network.com/.well-known/mercure`
1. Paste the secret tokens that were set up in your Mercure service configuration.

![an example of Mercure section in the plugin’s configuration](../../../docs/.gitbook/assets/products-guidedShopping-mercureConfigExample.png)

## Install guided shopping into PWA

1. Make sure you have a `guided-shopping` repository.
1. Link the guided-shopping plugin to PWA using the below command:

    ```
    ln -s /YOUR/PATH/TO/GS-REPO/src/Resources/app/pwa /YOUR/PATH/TO/SHOPWARE-PWA-REPO/sw-plugins/guided-shopping
    ```

1. Enable local plugin at test-project/sw-plugins/local-plugins.json add `"guided-shopping": true`.
1. install additional deps

    ```
    make install-pwa
    ```

1. Update jest.config.ts: Follow the example file below:

    ```js
    module.exports = {
      preset: "ts-jest",
      testEnvironment: "jsdom",
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
        "^~/(.*)$": "<rootDir>/$1",
        "^vue$": "vue/dist/vue.common.js",
      },
      verbose: true,
      testMatch: [
        "<rootDir>/sw-plugins/guided-shopping/**/__tests__/**/*.spec.{js,ts}",
      ],
      moduleFileExtensions: ["ts", "tsx", "js", "json"],
      transform: {
        "^.+\\.js$": "babel-jest",
        "^.+\\.ts$": "ts-jest",
        ".*\\.(vue)$": "vue-jest",
      },
      coverageDirectory: "coverage",
      coverageReporters: ["html", "lcov", "text", "cobertura"],
      collectCoverage: true,
      watchPathIgnorePatterns: ["/node_modules/", "/dist/", "/.git/"],
      modulePathIgnorePatterns: [".yalc"],
      roots: [
        "<rootDir>/sw-plugins",
      ],
      coveragePathIgnorePatterns: [
        '/node_modules/',
        '/.nuxt/',
        '/.shopware-pwa/'
      ],
      transformIgnorePatterns: [
        "/node_modules/(?!@shopware-pwa)"
      ],
      collectCoverageFrom: [
        "sw-plugins/guided-shopping/logic/**/*.{js,ts}",
      ],
    }
    ```

1. Update `tsconfig.json` and add `@types/jest` into `compilerOptions.types`

## Rebuild Shopware PWA

In order to synchronize `SwagGuidedShopping` plugin on the backend (installed before), the Shopware PWA must be rebuilt (recompiled) after the plugins are downloaded. Thanks to this, the PWA will contain the Guided Shopping plugin installed and ready to use.

1. Check credentials in the `.env` file (ADMIN_USER and ADMIN_PASSWORD)
1. Run the build command.

    ```bash
    # being in the root directory of your Shopware PWA project:
    yarn build
    # under the hood, plugins synchronization will be processed at the same time
    ```
    
    {% hint style="info" %}
    💡 Alternatively, you can invoke the `plugins` command manually, using directly:
    `npx @shopware-pwa/cli@canary plugins --user YOUR_ADMIN_USERNAME --password=YOUR_SECRET_PASS`
    then, the application is ready for the rebuild process.
    
    Note that the admin credentials are required to connect to the installed plugin library through an ADMIN API.
    {% endhint %}

1. Re-deploy Shopware PWA

Now let us rehearse the steps before deployment by going through the [Checklist](checklist.md).
