# App-Starter - Create an Admin Extension

In this guide, you will learn how to create an Admin Extension using the Admin Extension SDK.

## Prerequisites

> Required: Feature Flag FEATURE_NEXT_17950=1 

 * Basic CLI usage (creating files, directories, running commands)
 * We will use the following libraries / softwares
    * npm
    * ngrok
    * live-server (small local development live-reloading server)

## Create the App Wrapper

First of all we need to create the app "wrapper", the so-called app manifest. It contains just a single file with some basic configuration.

### Create manifest file

We create this file in a directory where all other app resources will reside in. Let's name this `ListingExtension`. Please execute the command below in your Shopware root directory.

```bash
mkdir -p custom/apps/ListingExtension
cd custom/apps/ListingExtension
touch manifest.xml
```

Next, we're gonna put our basic configuration into the file we just created.

{% code title="manifest.xml" %}
```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <name>ListingExtension</name>
        <label>Listing Extension App</label>
        <description>This app extends the product listing</description>
        <author>shopware AG</author>
        <copyright>(c) shopware AG</copyright>
        <version>1.0.0</version>
        <license>MIT</license>
    </meta>
</manifest>

```
{% endcode %}

### Install the App

In order to install the app, go back to the root directory of Shopware and run the following command:

```bash
bin/console app:install --activate ListingExtension
```

## Set up communication between Shopware and the App

Next, we need to set up an entry point, so Shopware and your app can communicate. The entry point is a static `.html` file, which includes the Extension SDK script and defines our extension.


> Create a graphic illustrating communication between Shopware and the App.

Let's create this file in a directory called `src`.

```bash
cd custom/apps/ListingExtension
mkdir src
touch src/index.html
```

```html
<!doctype html>
<html>
    <head>
        <script src="https://unpkg.com/@shopware-ag/admin-extension-sdk/cdn"></script>
    </head>
    <script>
        sw.notification.dispatch({
            title: 'Hi there',
            message: 'Looks like someone sent you a message'
        })
    </script>
</html>

```

### Start the local development server

Next, we need to start the live server so you don't always have to reload the page manually.

```bash
cd custom/apps/ListingExtension
npm install -g live-server
live-server src 
```

Now the file should be available on [http://127.0.0.1:8080
](http://127.0.0.1:8080
).

### Initiate the ngrok tunnel

For the next step, we will use ngrok, so your local file gets exposed to the internet. This is required, so Shopware can access your extension point. We do that by simply running

```bash
ngrok http 8080
```

This command will expose your local port `8080` (which is the port of the [local development server](#start-the-local-development-server)) to the internet and make it accessible via http/s. If your development server is running on a different port, make sure to use that port when running `ngrok http`.

The output will be something similar to 

```bash
Session Status                online
Account                       John Doe (Plan: Free)
Version                       2.3.40
Version                       2.3.40
Region                        United States (us)
Web Interface                 http://127.0.0.1:4040
Forwarding                    http://9481-31-22-212-113.ngrok.io -> http://localhost:8080
Forwarding                    https://9481-31-22-212-113.ngrok.io -> http://localhost:8080
```

You `src` directory will now be available at the public ***.ngrok.io** links.

### Add the public link to your manifest

The final step of the setup is to configure your app to use correct public link for your entry point. In our case this is `https://9481-31-22-212-113.ngrok.io`.

In order to do that, we have to add an `admin` section to our `manifest.xml` file and pass it into the `base-app-url` tag:

{% code title="manifest.xml" %}
```xml
<?xml version="1.0" encoding="UTF-8"?>
<manifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://raw.githubusercontent.com/shopware/platform/trunk/src/Core/Framework/App/Manifest/Schema/manifest-1.0.xsd">
    <meta>
        <!-- ... -->
    </meta>
    <admin>
        <base-app-url>https://9481-31-22-212-113.ngrok.io</base-app-url>
    </admin>
</manifest>
```
{% endcode %}