# Quick Setup

Let's set up Shopware PWA in the easiest way possible.

The tutorial is divided into three main steps:

1. Set up Shopware
2. Set up Shopware PWA integration plugin
3. Set up Shopware PWA

## Prerequisites

The tutorial works for a system which fulfills the following requirements \(others might work as well\)

* **Node Version**: 12.18.4
* **NPM Version**: 6.14.4
* **Yarn Version**: 1.22.4 \(we use yarn instead of node to install Shopware PWA\)
* **Docker**
* A terminal/shell like **console**, or **iTerm**

If those are fulfilled, we are good to go.

## System check

Make sure docker on your system is up and running. You can double check by typing

```bash
$ docker -v
```

into your console. The output should look something like

```text
Docker version 19.03.5, build 633a0ea
```

In addition to that, check that no process is running on your HTTP port \(80\).

```bash
$ netstat -an tcp | grep LISTEN
```

If the output contains a process listening on port 80, make sure to stop that process \(e.g. running containers or services\).

## 1. Set up Shopware

There are plenty of ways to set up Shopware, however we'll focus on the easiest one \(in my opinion\).

We're going to use a tool named Dockware which is a collection of docker images that can be used both for just trying out Shopware or setting up development environments. If you want to learn more, check out their [website](https://dockware.io/)!

All you have to do is run

```bash
$ docker run --rm -p 80:80 dockware/play:latest
```

wait a little bit and it should give your something similar to this after a while

```text
WOHOOO, dockware/play:latest IS READY :) - let's get started
-----------------------------------------------------
DOCKWARE CHANGELOG: /var/www/CHANGELOG.md
PHP: PHP 7.4.12 (cli) (built: Oct 31 2020 17:04:09) ( NTS )
Apache DocRoot: /var/www/html/public
ADMINER URL: http://localhost/adminer.php
MAILCATCHER URL: http://localhost/mailcatcher
PIMPMYLOG URL: http://localhost/logs
SHOP URL: http://localhost
ADMIN URL: http://localhost/admin
```

Now navigate to `http://localhost` to double-check everything is up and running.

That's it, Shopware is up and running.

#### Access Token

In step 3 we'll need an access token, so make sure to follow these points:

Navigate to `http://localhost/admin` and login with `shopware` / `admin` credentials.

Select **Storefront** from the Sales Channel section in the navigation menu on the left. Then scroll down to the section which says **API access** and copy the API access key. That will be the token you need later on.

## 2. Set up Shopware PWA integration plugin

Next, we have to install a single plugin to make Shopware PWA work properly.

Because we have to execute some commands in the container, we have to start a shell. But first we have to know the name of the container:

```bash
$ docker ps | grep dockware/play
```

Now copy the ID of the container or its name from last column \(in my case `lucid_varahamihira`\) and start the shell

```bash
$ docker exec -it lucid_varahamihira /bin/bash
```

Now we're connected to the container. It already has **git** installed, so we can check out the plugin straight into our plugin directory:

```bash
$ git clone https://github.com/elkmod/SwagShopwarePwa.git custom/plugins/SwagShopwarePwa
```

After that, refresh your plugin list

```bash
$ bin/console plugin:refresh
```

and install the plugin

```bash
$ bin/console plugin:install --activate SwagShopwarePwa
```

An we're good to go!

## 3. Set up Shopware PWA

Either type `exit` into your container shell or open a new console tab/window.

Switch into an empty directory of your choice:

```bash
$ mkdir shopware-pwa-project
$ cd shopware-pwa-project
```

After that, initialise a new project using

```bash
$ npx @shopware-pwa/cli init
```

during the process, it will prompt you for some configuration \(like the access token from step 1\)

```text
✔ Shopware instance address: · https://localhost
✔ Shopware instance access token: · SWSCBHLBAZI3DXPNMXRLNGVPOA
✔ Which version you'd like to use: · latest stable (recommended)
```

from the list of version to install, confirm the **latest stable version** by hitting Enter.

Afterwards, confirm every question by hitting Enter.

Initialisation of your project might take a few minutes. After it's finished, run

```bash
$ yarn dev
```

A successful startup will be confirmed a line similar to

```text
Listening on: http://192.168.43.206:3000/
```

Congratulations, your PWA and your Shopware API backend are up and running!

![](../../.gitbook/assets/image-5.png)
