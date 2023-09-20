# App development with docker

## Overview

This guide will walk you through the process of combining Shopware and your app in one setup.

## File Structure

At first, you need to clone the app template from [GitHub](https://github.com/shopwareLabs/AppTemplate) and create a `manifest.xml` for your app. Or take a glance at our fully working example based on this template: [appExample](https://github.com/shopwareLabs/AppExample).  
For further information about the `manifest.xml` have a look at our \[PLACEHOLDER-LINK: manifest-documentation\].  
The easiest way to create a `manifest.xml` is with our `bin/console app:create-manifest` command.

Your file structure should look as follows:

```text
...
│
├──development
│  ├──custom
│  │  └───apps
│  │      └───yourAppName
│  │          └───manifest.xml
│  │
│  ├──platform
│  └──...
│
└──shopwareAppTemplate
...
```

## Combining both in one docker setup

Once your Shopware development setup is ready to go you need to add your app to it. This is done by adding the services to your `development/docker-compose.yml`.  
At first, you need to add two networks. One for your app system and another one for combining the app system with Shopware.

This is done by adding the networks `appSystem` and `development` to your existing ones:

```yaml
// 
networks:
    shopware:
    appSystem:
    development:
```

The `appSystem`-network is only for your app server and the app database.  
The `development`-network is used to combine your app server with the Shopware server.

### Adding the app server

Now you need to define the `services` in your `development/docker-compose.yml`. First insert the following to add your app server.

```yaml
// development/docker-compose.yml
services:
[...]
  example_app_server:
    image: shopware/development:local
    volumes:
      - "../shopwareAppTemplate:/app"
      - "~/.composer:/.composer"
    environment:
      CONTAINER_UID: 1000
      APPLICATION_UID: 1000
      APPLICATION_GID: 1000
    ports:
      - "127.0.0.1:7777:8000"
    networks:
      appSystem:
      development:
        aliases:
          - example
```

This adds a new container to your docker setup running your app server's code. The new container is available inside the networks `appSystem` and `development`.  
In the `development`-network your app server has the alias `example`. This will be the url which your Shopware server needs to communicate with. This is also the url which you should use in your `manifest.xml` except for iframes.  
`volumes` represents the relative path to your app.  
`ports` exposes port `8000` to `127.0.0.1:7777` to us so that we can visit `127.0.0.1:7777` or `localhost:7777` to directly connect to your app server. This will come in handy when we register our own modules to use iframes.

### Adding the app database

The next step is to also add your mysql server to your docker setup. This is as easy as it was for your app server.  
Simply add this to your `development/docker-compose.yml`.

```yaml
// development/docker-compose.yml
services:
[...]
  example_mysql:
    build: dev-ops/docker/containers/mysql
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_USER: app
      MYSQL_PASSWORD: app
    ports:
      - "5506:3306"
    volumes:
      - ./dev-ops/docker/_volumes/mysql-example:/mysql-data
    networks:
      appSystem:
        aliases:
          - appmysql
```

As you already know you connect your mysql server to the same network as your app server and give it the alias `appmysql`. Furthermore, you can now connect to your database on port `5506` from outside of the docker container.  
Last but not least we define the credentials for the mysql server and you are done with setting up the database container.

### Combining both in one network

Now you need to add your Shopware server to your `development`-network and give him an alias as follows:

```yaml
// development/docker-composer.yml
services:
[...]
  app_server:
    image: shopware/development:latest
    networks:
      shopware:
        aliases:
          - docker.vm
      development:
        aliases:
          - shopware
    extra_hosts:
      - "docker.vm:127.0.0.1"
    volumes:
      - ~/.composer:/.composer
    tmpfs:
      - /tmp:mode=1777
```

Now your app server can communicate with the Shopware server and your app's database.

## Access your app server via ssh

To easily access a terminal on your app server, you need to create this script `development/dev-ops/docker/actions/ssh-app-server.sh`.

```sh
// development/dev-ops/docker/actions/ssh-app-server.shell script
#!/usr/bin/env bash
TTY: docker exec -i --env COLUMNS=`tput cols` --env LINES=`tput lines` -u __USERKEY__ -t __EXAMPLE_APP_SERVER_ID__ bash
```

This script can be executed from your `development` folder with `./psh.phar docker:ssh-app-server`. Keep in mind that this is only possible when the app server has been started with `./psh.phar docker:start` from your development folder.  

To make sure this script actually knows the ID of your app server which is running in the docker container, you need to define the `EXAMPLE_APP_SERVER_ID` in the `development/.psh.yaml.override`.  
Your `development/.psh.yaml.override` should look like this:

```yaml
// development/.psh.yaml.override
# ...
dynamic:
 #  ...
  EXAMPLE_APP_SERVER_ID: docker-compose ps -q example_app_server
 #  ...
# ...
```

## Initialising the app server

To initialise the app server and the app database you need to open a terminal on the app server and run `composer install --no-interaction`.  
Next you need to change your `shopwareAppTemplate/.env` and set the `DATABASE_URL` to `mysql://app:app@appmysql:3306/main`.  
This url should look familiar to you because you just configured each part of it in the `development/docker-compose.yml`.

The next steps should be done in the terminal of your app server.  
Now you can set up the database by executing `bin/console doctrine:database:create`. This will create your database with the name `main`.  
Then execute the migrations with `bin/console doctrine:migrations:migrate --no-interaction`. Now your database is ready.

## Registration

This last step assumes that you already have a valid `manifest.xml` in the correct folder. In order to check this, make sure your `manifest` is in `development/custom/apps/yourAppName/manifest.xml`.  
Then access your local Shopware instance with `./psh.phar docker:ssh` and execute the check with `bin/console app:validate`. This will tell you if you provided a valid `manifest.xml`.

For the sake of simplicity you need to change the `APP_URL` of your Shopware instance to match the network-alias you gave it.  
This is done in your `development/.psh.yaml.override` which should look like this:

```yaml
// development/.psh.yaml.override
# ...
const:
  # ...
  APP_URL: "http://shopware"
  # ...
# ...
```

To make sure your `APP_URL` changed you need to rerun `./psh.phar docker:ssh`. Now your `APP_URL` changed and you can register your app via `bin/console app:refresh --activate`. This can also be done by `bin/console app:install --activate yourAppName`.

**Note:** Like with plugins, apps get installed as inactive. You can activate them by passing the `--activate` flag to the `app:install` command or by executing `app:activate`.

## Working with iframes

Due to the fact that the aliases for your app server only work inside the docker container, you need to change it in the `manifest.xml`. In contrast to every other action, like webhooks or action buttons, iframes need to be accessible from outside the docker container.  
For this purpose iframes are the only thing in your `manifest.xml` where you need to set the source to `http://localhost:7777` as defined in the `development/docker-compose.yml`.
