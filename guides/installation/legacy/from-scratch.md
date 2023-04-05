# Installation from Scratch

::: danger
This approach is no longer recommended. It is kept here as a reference.
:::

If it is *impossible* to get Docker up and running on your development environment, you can install Shopware 6 locally.

::: info
Be aware that this will be a vastly more complex solution since additional system requirements then need to be managed by you. However, you may experience better control over your local setup configuration.
:::

## Prerequisites

- A Linux-based operating system (Windows installation is not covered here, but notes are provided about installing within a WSL instance).
- An [Apache2 server installation](https://httpd.apache.org/docs/2.4/install.html) within the Linux-based operating system you have selected.
- Installation of all the required packages mentioned in the [Installation overview](overview.md). There are two main goals you need to accomplish.

Please note that this guide is based on plugin development and contribution. If you need a template for full composer-based shop projects, refer to the [production template](https://github.com/shopware/production).

## Setting up your web server

Firstly, we need to set up Apache to locate Shopware 6. If you wish, you could configure Nginx to serve your shopware installation, but this guide explains to you about Apache2 installation.

### VHost configuration

Firstly, you must add a vhost definition to your Apache site configuration.

- Create a file with the following pattern: `/etc/apache2/sites-available/*.conf`.
Here we will create a file called `/etc/apache2/sites-available/shopware-install.conf`

- Within the created `shopware-install.conf` file, place the following configuration:

```text
<VirtualHost *:80>
   ServerName "HOST_NAME"
   DocumentRoot _DEVELOPMENT_DIR_/public

   <Directory _DEVELOPMENT_DIR_>
      Options Indexes FollowSymLinks MultiViews
      AllowOverride All
      Order allow,deny
      allow from all
      Require all granted
   </Directory>

   ErrorLog ${APACHE_LOG_DIR}/shopware-platform.error.log
   CustomLog ${APACHE_LOG_DIR}/shopware-platform.access.log combined
   LogLevel debug
</VirtualHost>
```

- Symlink the `shopware-install.conf` file to the Apache2 `sites-enabled` directory:

```shell
sudo ln -s /etc/apache2/sites-available/shopware-install.conf /etc/apache2/sites-enabled/shopware-install.conf
```

- Restart the Apache2 service to activate your new configuration:

```shell
# Your mileage with this command may vary depending on your chosen Linux operating system
sudo service apache2 restart
```

### Domain URL naming

When making an instance within an integration like [WSL](https://docs.microsoft.com/en-us/windows/wsl/about), special attention needs to be given to how you name the URL you use for local development. In the case of Shopware setup, it is advised to enable 'localhostForwarding' (allow requests to localhost to be forwarded to open ports within your active WSL instance). An example configuration in your [.wslconfig](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#wslconfig) file could be:

```text
[wsl2]
memory=8GB
localhostForwarding=true # set this setting to true to be forwarded to WSL
processors=4
```

::: info
If your WSL instance is already running after making changes to your *.wslconfig* file, you will need to restart your WSL service with `wsl --shutdown`, then `wsl` for the config settings to take effect.
:::

Once `localhostForwarding` is enabled, you should update your local development domain name in you Apache2 `sites-available` config file as follows:

```text
xxxxxx.dev.localhost
```

...where 'xxxxxx' should be replaced with a 'hyphen/underscore separated' string.

::: info
Make sure the `APP_URL` variable defined within your `[PROJECT_ROOT]/.env` file matches the `ServerName` value within your Apache2 Vhost configuration
:::

### Apache2 server configuration

Make sure the following Apache modules are enabled:

- mod\_rewrite
- mod\_headers
- mod\_negotiation

::: info
Checking if these modules are installed on Apache is possible with the command `apachectl -M | grep [module_name]`. When searching for a specific module with `grep` make sure only to use the name suffix, such as "rewrite"
:::

After a quick restart of Apache, you are done.

::: info
For Mac (OSX) operating systems:

In your Apache config, it is recommended to move the document root folder to the user's `$HOME` folder to avoid permission issues. This is the folder which Apache looks to serve a file from. By default, the document root is configured as `/usr/local/var/www`.

As this is a development machine, let's assume you want to change the document root to point to a folder in your home directory. Search for the term "DocumentRoot" in your `httpd.conf` apache configuration, and you should see the following line:
:::

```bash
DocumentRoot "/usr/local/var/www"
```

Change this to point to your user directory where your\_user is the name of your user account:

```bash
DocumentRoot /Users/your_user/Sites/sw6/public
```

You also need to change the tag reference right below the "DocumentRoot" line. This should also be changed to point to your new document root:

```text
<Directory "/Users/your_user/Sites/sw6/public">
```

Within your Apache configuration, you must set your `DocumentRoot` and `Directory` directive to the **public/** folder of your sw6 installation root. Otherwise, apache2 **will not** successfully find your `index.php` file and serve the site.

## Setting up Shopware

Before you set up Shopware, you need to clone our Shopware repositories from version control. This is explained in the "Preparatory steps" paragraph of the [Installation overview](overview.md).

### Starting Shopware installation

A simple CLI installation wizard can be invoked by executing the following:

```bash
bin/setup
```

Now, Shopware 6 is installed. To be sure the installation succeeded, just open the configured host URL in your favorite browser.

## Updating the repositories

It is important to keep the `platform` and the `development` repository in sync.

The following steps should always yield a positive result:

```bash
git pull
cd platform
git pull
cd ..
composer update
rm -R var/cache/*
./psh.phar install
```

::: warning
Note that this will reset your database.
:::

## Next steps

Now that you got a running Shopware installation, why not start with your first very own plugin? Refer to the [Plugin base guide](../../plugins/plugins/plugin-base-guide.md) for a good starting point.
