---
nav:
  title: App development with platform.sh
  position: 20

---

# App development with platform.sh

## Overview

This guide will walk you through the process of developing your app on Platform.sh with your local Shopware setup.

## Forwarding requests

In order to register your local Shopware instance to your app on Platform.sh you need to be able to connect from Platform.sh to your client.  
To do so, you need to forward the request from your app to your local Shopware instance. This can be done with port forwarding. This means that every request which is addressed to `localhost:8000` on your app will be forwarded to your defined port to your client.  
But why would the app send requests to localhost? This happens when your app wants to communicate with your local Shopware instance which should run on `localhost:8000`. Then your app will send each request to `localhost:8000` which then should get forwarded to your client to the port where Shopware is running on.

## How does this work in practice?

To accomplish this, just copy the command from Platform.sh which can be found in the top right corner and paste it into your terminal. This should look something like this `ssh abcde12345-master-12345--app@ssh.de-2-platform.sh`.  
To make the authentication much easier we recommend installing the [Platform.sh cli](https://docs.platform.sh/development/cli.html) and log in into your project.

To redirect the requests you need to add the option `-R` with a few parameters to the copied Platform.sh command.  
First you define the port on the remote server which needs to be forwarded. In our case this is port `8000`. The second parameter is the destination on your client. This will be your local Shopware instance which is running on `localhost:8000`.  
If you put everything together this should look something like this `ssh -R 8000:localhost:8000 abcde12345-master-12345--app@ssh.de-2-platform.sh`. The last thing you have to do is to change all URLs in your `manifest.xml` to point to your Platform.sh URL and you are done.  
For further information have a look at [remote forwarding](https://www.ssh.com/ssh/tunneling/example).

## Switching between Platform.sh and local development

The best way to switch from Platform.sh to your local setup and vice versa is to have two `manifest.xml` files.  
Create the first one for your Platform.sh setup with `bin/console app:create-manifest APP_NAME=PlatformshSetup APP_URL_CLIENT=https://your-client-url.platform.sh APP_URL_BACKEND=https://your-backend-url.platform.sh` and the other one for your local setup with  
`bin/console app:create-manifest APP_NAME=LocalSetup APP_URL_CLIENT=http://localhost/your-local-client-url APP_URL_BACKEND=http://localhost/your-local-backend-url` Then place them in `development/custom/apps/your-app-name/manifest.xml` and you are good to go.

Once you switch to local development you have to make sure to change your `APP_URL` of your Shopware instance in your `development/.psh.yaml.override` back to `http://localhost:8000`. This can be done as follows:

```yaml
const:
  APP_URL: "http://localhost:8000"
```

And vice versa change it to `http://shopware` for development with Platform.sh.  
After changing your `APP_URL` you need to execute `bin/console app:url-change:resolve`. More about this \[PLACEHOLDER-LINK: app-url-change documentation\].
