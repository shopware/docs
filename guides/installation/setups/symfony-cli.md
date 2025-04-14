---
nav:
  title: Symfony CLI
  position: 10

---

# Symfony CLI

Symfony CLI is a popular tool in the Symfony ecosystem that helps to spawn a local development environment. It is a lightweight and an alternative way to Docker to run the application locally.

## Prerequisites

- Symfony CLI installed on your machine. You can follow the official [Symfony CLI installation guide](https://symfony.com/download) to install Symfony CLI.
- PHP Installed locally

Here are various ways to install PHP on your machine. You can choose the one that suits you best.

<Tabs>

<Tab title="Ubuntu">

Add a new software repository to your system to have the latest PHP version.

```bash
sudo add-apt-repository ppa:ondrej/php

sudo apt-get install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-xml php8.3-zip php8.3-opcache php8.3-mbstring php8.3-intl php8.3-cli
```

</Tab>

<Tab title="Debian">

Add a new software repository to your system to have the latest PHP version:

```bash
curl https://packages.sury.org/php/README.txt | bash

sudo apt-get install -y php8.3-fpm php8.3-mysql php8.3-curl php8.3-gd php8.3-xml php8.3-zip php8.3-opcache php8.3-mbstring php8.3-intl php8.3-cli
```

</Tab>

<Tab title="macOS">

The easiest way is to use [Homebrew](https://brew.sh/):

```bash
brew install php@8.3
```

</Tab>

</Tabs>

Shopware requires also a Database server, you can install MySQL or MariaDB locally using your system package manager or if Docker is installed, Symfony CLI can run the database server in a container.

## Create a new project

```bash
composer create-project shopware/production <project-name>

# or install a specific version
composer create-project shopware/production:6.6.10.0 <project-name>
```

Symfony Flex will ask while you create if you want to use Docker or not, choose **Yes** if you want to run the database in a container. If you choose **No**, you need to install MySQL or MariaDB locally.

## Initial Setup

### Local

After the project is created, you need to adjust the `DATABASE_URL` to match your local database server. To do that create a `.env.local` file in the project root and add the following line:

```dotenv
DATABASE_URL=mysql://username:password@localhost:3306/dbname
```

### Docker

To run the database in a container, you need to start the containers first with:

```bash
docker compose up -d
```

To stop the containers, you can run:

```bash
docker compose down
```

This will stop the containers and remove them. If you want to remove the containers and the data, you can run `docker compose down -v`.
This will remove all containers and the data.
If you want to remove the containers and keep the data, you can run `docker compose down` without the `-v` flag.
This will remove all containers and keep the data.

## Install Shopware

::: info
It's important that you prefix all your commands with `symfony` to ensure that the correct PHP version is used. If you don't do this, you might run into issues with the wrong PHP version being used or the Docker MySQL database is not used.
:::

After that you can run the following command to install Shopware:

```bash
symfony console system:install --basic-setup
```

The flag `--basic-setup` will automatically create an admin user and a default sales channel for the given `APP_URL`. If you don't created a MySQL Database yet, you can pass the `--create-database` flag to create a new database.

### Default Administration Credentials

The Shopware's default Administration credentials are:

| Username | Password   |
|:---------|:-----------|
| `admin`  | `shopware` |

Change these credentials after finishing the installation.

## Starting the Webserver

To start the webserver, run the following command:

```bash
symfony server:start
```

This will start the webserver on port 8000. You can access the Shopware Administration at [http://localhost:8000/admin](http://localhost:8000/admin) and the Storefront at [http://localhost:8000](http://localhost:8000).

If you wish to run it on the background, you can use the `-d` flag:

```bash
symfony server:start -d
```

### Stopping the Webserver

To stop the webserver, run the following command:

```bash
symfony server:stop
```

This will stop the webserver and all running processes.

## Change PHP Version

To change the used PHP version, you need to create a `.php-version` file in the project root and add the desired PHP version to it. For example, to use PHP 8.3, create a file called `.php-version` and add the following line:

```dotenv
8.3
```

This will set the PHP version to 8.3 for the current project so that any `symfony` commands will use this version. Make sure to commit this change to your version control system to keep track of the PHP version configuration. You can also verify the PHP version by running the command:

```bash
symfony php -v
```

## Changing PHP Configuration

To change the PHP Configuration, you need to create a `php.ini` file in the project root and add the desired PHP configuration to it. For example, to change the `memory_limit` to `512M`, create a file called `php.ini` and add the following line:

```ini
memory_limit = 512M
```

This will set the `memory_limit` to `512M` for the current project so that any `symfony` commands will use this configuration. Make sure to commit this change to your version control system to keep track of the PHP configuration.
You can also verify the PHP configuration by running the command:

```bash
symfony php -i
```

## Building/Watcher the Administration and Storefront

<PageRef page="../template#building-watching-administration-and-storefront" />
