# Installation from scratch

If it's impossible to get docker up and running on your development environment you can install Shopware 6 locally.

{% hint style="info" %}
Be aware this will be by far the more complex solution since additional or changed system requirements need to be managed by you.
{% endhint %}

## Prerequisites

Once you set up all the required packages mentioned in the [Installation overview](overview.md), there are two main goals you need to accomplish.

Please note that this guide is rather based on plugin development and contribution. If you need a template for full composer based shop projects, please refer to the [production template](https://github.com/shopware/production).

## Setting up your webserver

First up, we need to set up Apache to locate Shopware 6. Nginx is also possible but in this guide we will explain apache installation. In order to do this, you should add a vhost to your Apache site configuration that looks like this:

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

Please remember to replace `_DEVELOPMENT_DIR_` and `_HOST_NAME_` with your preferences respectively and add the corresponding entry to your `/etc/hosts` file.

Make sure following Apache modules are enabled:

* mod\_rewrite
* mod\_headers
* mod\_negotiation

After a quick restart of apache you are done here.

A short recommendation, at least for Mac operating system: In the apache config, it is recommended to drag the document root folder to the own user folder in order to avoid permission issues. This is the folder where Apache looks to serve file from. By default, the document root is configured as `/usr/local/var/www`. As this is a development machine, let's assume we want to change the document root to point to a folder in our own home directory. Search for the term "DocumentRoot" in your `httpd.conf` apache configuration, and you should see the following line:

```bash
DocumentRoot "/usr/local/var/www"
```

Change this to point to your user directory where your\_user is the name of your user account:

```bash
DocumentRoot /Users/your_user/Sites
```

You also need to change the tag reference right below the DocumentRoot line. This should also be changed to point to your new document root also:

```text
<Directory "/Users/your_user/Sites">
```

## Setting up Shopware

Before you're able to set up Shopware, you need to checkout our Shopware's repositories. This is explained in the "Preparatory steps" paragraph of the [Installation overview](overview.md).

### Starting Shopware installation

A simple cli installation wizard can be invoked by executing:

```bash
bin/setup
```

{% hint style="info" %}
One little note: If something goes wrong during installation check if `.psh.yaml.override` exists. If not restart setup, if yes execute `./psh.phar install` to restart the setup process.
{% endhint %}

Voila, Shopware 6 is installed. To be sure the installation succeeded, just open the configured host url in your favorite browser.

## Updating the repositories

It is important to keep the `platform` and the `development` repository in sync.

{% hint style="danger" %}
We highly discourage to update each without the other!
{% endhint %}

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

Please note that this will reset your database.

## Next steps

You're all set now! Now that you got a running Shopware installation, why not start with your first very own plugin? Please refer to the [Plugin base guide](../plugins/plugins/plugin-base-guide.md) for a nice starting point.

