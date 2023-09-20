# Dockware

Dockware is basically a managed Docker setup for Shopware 6. It makes it possible to start Shopware 6 very quickly using dockware.io. It comes with everything you need for a smooth development workflow. This includes all available Shopware 6 versions, MySQL, Adminer, Mailcatcher, easy PHP switching, XDebug, useful make commands, and more.

Dockware is maintained by *dasistweb GmbH*. They provide detailed [documentation](https://dockware.io/docs) as well. This way, we will cover just the basics here.

## Dockware versions

Dockware images come in several versions, so you can choose the one which fits your needs best. You can find a brief overview below, but as always, please refer to [their website](https://dockware.io/) for a detailed comparison.

| Image | Description | Basis |
| :--- | :--- | :--- |
| dockware \#play | Launch Shopware in just a couple of seconds locally on your system. Test every functionality and play around while verifying your requirements. | `Production` |
| dockware \#dev | This is the solution for instant coding. Run Shopware 6, prepare your IDE and immediately start with your own customizations and plugins. Provides Xdebug, watchers or more. | `Production` |
| dockware \#contribute | This image supports Shopware 6 modification to contribute to the official Shopware 6 Github platform. Contains all dev tools and the already installed demo data. | `developement` |
| dockware \#essentials | This is a plain Dockware environment without Shopware. | --- |
| dockware \#flex | This provides a flexible Apache and PHP container for all kinds of Symfony and Shopware projects. It is an image for individualization, e.g., you can manage the Shopware version on your own. | --- |

## Quickstart

First things first, install Docker on your local machine.

* If using Linux, you need to start by downloading the latest version of Docker and installing it on your system. To name a few examples, you can find the matching Docker versions for your distribution here:

  * [Docker for Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)
  * [Docker for Debian](https://docs.docker.com/install/linux/docker-ce/debian/)
  * [Docker for CentOS](https://docs.docker.com/install/linux/docker-ce/centos/)
  * [Docker for Fedora](https://docs.docker.com/install/linux/docker-ce/fedora/)

* For Windows operating system, download the latest version of [Docker desktop for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows/).
* If using Mac, start by downloading the latest version of [Docker Desktop](https://hub.docker.com/editions/community/docker-ce-desktop-mac/) for Mac and install it.

With this, you are almost ready to start, but you just need to use the following command on your host system to get it going:

```bash
# quick run with latest PHP and Shopware
$ docker run --rm -p 80:80 dockware/dev:latest
```

::: danger
Beware that this is meant for a quick start. The parameter `--rm` will throw everything away. If the container is stopped, the whole database etc., will be gone. So if you want a persistent solution, head over to the ["Using docker-compose"](#using-docker-compose) paragraph.
:::

This command will install Dockware \#dev version, which is based on `Production` template. If you want to use `development` template, you need to use \#contribute version. As soon as the docker image is downloaded and Dockware is ready, you will see this text:

```bash
SUCCESS - Shopware is now ready!
-----------------------------------------------------
SHOP URL: http://localhost
ADMIN URL: http://localhost/admin
ADMINER URL: http://localhost/adminer.php
MAILCATCHER URL: http://localhost/mailcatcher
```

### Further ways to start

You can start the Dockware image with different shopware versions:

```bash
docker run --rm -p 80:80 --env PHP_VERSION=7.2 dockware/dev:latest
```

## Using docker-compose

### Create docker-compose.yml

Create a new `docker-compose.yml` in the folder where you want to start your project and use our template below.

Dockware does already come with an installed Shopware 6. You can change the Shopware version along with the PHP version in your compose file.

Here is an overview of what versions are available: [https://hub.docker.com/r/dockware/dev](https://hub.docker.com/r/dockware/dev)

```yaml
version: "3"

services:

    shopware:
      # use either tag "latest" or any other version like "6.1.5", ...
      image: dockware/dev:latest
      container_name: shopware
      ports:
         - "80:80"
         - "3306:3306"
         - "22:22"
         - "8888:8888"
         - "9999:9999"
      volumes:
         - "db_volume:/var/lib/mysql"
         - "shop_volume:/var/www/html"
      networks:
         - web
      environment:
         # default = 0, recommended to be OFF for frontend devs
         - XDEBUG_ENABLED=1
         # default = latest PHP, optional = specific version
         - PHP_VERSION=7.4

volumes:
  db_volume:
    driver: local
  shop_volume:
    driver: local

networks:
  web:
    external: false
```

### Start Docker

Open the folder with your compose file in your terminal and execute this command to start your container:

```bash
docker-compose up -d
```

### Prepare development

Now download the current version of Shopware to your host into the "src" directory.

This is required to have code completion and IntelliSense right in your IDE.

```bash
mkdir -p ./src
docker cp shopware:/var/www/html/. ./src
```

### Prepare IDE

Open the "src" folder with your preferred IDE and wait until it finishes loading. Then add a new SFTP connection to your container. \(we recommend Automatic-Upload if possible\)

Now you are done and ready to develop your own plugins and projects.

::: info
Default credentials for Dockware can be found at [https://docs.dockware.io/use-dockware/default-credentials](https://docs.dockware.io/use-dockware/default-credentials)
:::

## Next steps

You might want to start writing your very own plugin. Head over to ["Plugin base guide"](../../plugins/plugins/plugin-base-guide.md) to get a grip on that topic.

::: info
Refer to this video on **[Using Dockware](https://www.youtube.com/watch?v=b9wVfUOKqmI)** that explains the basics of Dockware. Also available on our free online training ["Shopware 6 Backend Development"](https://academy.shopware.com/courses/shopware-6-backend-development-with-jisse-reitsma).
:::
