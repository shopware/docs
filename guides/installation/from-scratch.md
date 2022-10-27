# Installation from scratch

If it's *impossible* to get docker up and running on your development environment you can install Shopware 6 locally.

::: info
Be aware this will be a vastly more complex solution since additional system requirements then need to be managed by you, however you may experience better control over your local setup configuration
:::

## Prerequisites

- A Linux-based operating system (Windows installation is not covered here, but notes are provided about installing within a WSL instance)
- An [Apache2 server installation](https://httpd.apache.org/docs/2.4/install.html) within the Linux-based operating system you have selected
- Installation of all of the required packages mentioned in the [Installation overview](overview), there are two main goals you need to accomplish.

Please note that this guide is rather based on plugin development and contribution. If you need a template for full composer-based shop projects, please refer to the [production template](https://github.com/shopware/production).

## Setting up your webserver

Firstly, we need to set up Apache to locate Shopware 6. If you wish you could configure Nginx to serve your shopware installation, but in this guide we will explain an Apache2 installation.

### VHost configuration

In order to do this, you should add a vhost definition to your Apache site configuration.

1) Create a file with the following pattern: `/etc/apache2/sites-available/*.conf`.
Here we will create a file called `/etc/apache2/sites-available/shopware-install.conf`

1) Within the created `shopware-install.conf` file place the following configuration:

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

1) Symlink the `shopware-install.conf` file to the Apache2 `sites-enabled` directory:

```shell
sudo ln -s /etc/apache2/sites-available/shopware-install.conf /etc/apache2/sites-enabled/shopware-install.conf
```

1) Restart the Apache2 service in order to activate your new configuration:

```shell
# Your mileage with this command may vary depending upon your chosen Linux operating system
sudo service apache2 restart
```

### Domain URL naming

When making an instance within an integration like [WSL](https://docs.microsoft.com/en-us/windows/wsl/about), special attention needs to be given to how you name the URL you use for local development. In the case of shopware setup it is advised to enable 'localhostForwarding' (allow requests to localhost to be forwarded tp open ports within your active WSL instance). An example configuration in your [.wslconfig](https://docs.microsoft.com/en-us/windows/wsl/wsl-config#wslconfig) file could be:

```text
[wsl2]
memory=8GB
localhostForwarding=true # set this setting to true to be forwarded to WSL
processors=4
```

::: info
If your WSL instance is already running after making changes to your .wslconfig file, you will need to restart your WSL service with `wsl --shutdown`, then `wsl` in order for the config settings to take effect
:::

Once `localhostForwarding` is enabled, you should update you name your local development domain in you Apache2 `sites-available` config file as follows:

```text
xxxxxx.dev.localhost
```

...where 'xxxxxx' should be replaced with a 'hyphen/underscore separated' string.

::: info
Make sure the `APP_URL` variable defined within your `[PROJECT_ROOT]/.env` file matches the `ServerName` value within your Apache2 Vhost configuration
:::

### Apache2 server configuration

Make sure following Apache modules are enabled:

- mod\_rewrite
- mod\_headers
- mod\_negotiation

::: info
Checking if these modules are installed on apache is possible with the command `apachectl -M | grep [module_name]`. When searching for a specific module with `grep` make sure to only use the name suffix, such as "rewrite"
:::

After a quick restart of apache you are done here.

::: info
For Mac (OSX) operating systems:

In your apache config, it is recommended to move the document root folder to the user's `$HOME` folder in order to avoid permission issues. This is the folder where Apache looks to serve file from. By default, the document root is configured as `/usr/local/var/www`.

As this is a development machine, let's assume we want to change the document root to point to a folder in our own home directory. Search for the term "DocumentRoot" in your `httpd.conf` apache configuration, and you should see the following line:
:::

```sh
DocumentRoot "/usr/local/var/www"
```

Change this to point to your user directory where your\_user is the name of your user account:

```sh
DocumentRoot /Users/your_user/Sites/sw6/public
```

You also need to change the tag reference right below the DocumentRoot line. This should also be changed to point to your new document root also:

```text
<Directory "/Users/your_user/Sites/sw6/public">
```

Within your Apache configuration you must set your `DocumentRoot` and `Directory` directive to the **public/** folder of your sw6 installation root, otherwise apache2 **will not** successfully find your `index.php` file and serve the site.

## Setting up Shopware

Before you're able to set up Shopware, you need to clone our Shopware repositories from version control. This is explained in the "Preparatory steps" paragraph of the [Installation overview](overview).

### Starting Shopware installation

A simple cli installation wizard can be invoked by executing:

```sh
bin/setup
```

Voila, Shopware 6 is installed. To be sure the installation succeeded, just open the configured host url in your favorite browser.

## Updating the repositories

It is important to keep the `platform` and the `development` repository in sync.

::: danger
We highly discourage to update each without the other!
:::

The following steps should always yield a positive result:

```sh
git pull
cd platform
git pull
cd ..
composer update
rm -R var/cache/*
./psh.phar install
```

Please note that this will reset your database.

## Next steps

You're all set now! Now that you got a running Shopware installation, why not start with your first very own plugin? Please refer to the [Plugin base guide](../plugins/plugins/plugin-base-guide) for a nice starting point.
