# Valet+

::: danger
This approach is no longer recommended. It is kept here as a reference.
:::

## Overview

Valet+ is a fork of [laravel/valet](https://github.com/laravel/valet). It supports automatic virtual host configuration based on the folder structure.

This is a modified version of the [official Installation Guide](https://github.com/weprovide/valet-plus/wiki/Installation).

## Prerequisites

Before proceeding with this guide, have a look at [Installation overview](overview). Also, your system should be running [brew](https://brew.sh/) and [Composer](https://getcomposer.org/) already.

## If you have Valet installed

Run `composer remove laravel/valet`.

## Installing Valet-PHP

* Update Homebrew via `brew update`.
* Add the Homebrew PHP tap for Valet+ via `brew tap henkrehorst/php`.
* Install PHP 7.4 using Homebrew via `brew install valet-php@7.4`.
* Link your PHP version using the `brew link valet-php@7.4 --force` command.

## Installing Valet+

* If needed, install Composer via `brew install composer`.
* Install Valet+ via `composer global require weprovide/valet-plus`.
* Make sure `~/.composer/vendor/bin` is in your path by adding `export PATH="$PATH:$HOME/.composer/vendor/bin"` to your `bash_profile` or `.zshrc`.
* Check for the following common problem with `valet fix`.
* The above instruction will uninstall all other PHP installations. Now, run the `valet install` command. Optionally add `--with-mariadb` to use MariaDB instead of MySQL. This will configure and install Valet+ and DnsMasq.

Additionally, it registers Valet's daemon to launch when your system starts.

## Using Valet+ with Shopware 6

* Create a new empty folder, for example `~/sites`.
* Clone the development template like you normally would \(dev + platform\) into this folder.
* Adjust params installation editing `.psh.yaml.dist`.
* Run `./psh.phar install`.
* Move to `~/sites` and run `valet park` to register Valet for this directory. Shopware should now be accessible via the `folder-name.test`. This "folder-name" is the name of the Shopware development template in `~/sites`.
* Optional: Disable SSL via `valet unsecure` because this might cause problems with the watcher.

## Troubleshooting

### Testing your installation

* Make sure `ping something.test` responds from 127.0.0.1.
* Run `nginx -t` or `sudo nginx -t` and check for any errors. If there is a missing *elastisearch* file, follow the "Missing Elasticsearch stub fix" further below.

### Install Error: "*The process has been signaled with signal 9*"

This is due to `valet fix` uninstalling `valet-php@7.4` for some reason. You can fix it by reinstalling Valet-PHP \(Step 3 and 4 of "Installing Valet-PHP"\). Make sure to **NOT** run `valet fix` afterwards and just proceed with `valet install`.

### Missing Elasticsearch stub fix

```bash
sudo cp ~/.composer/vendor/weprovide/valet-plus/cli/stubs/elasticsearch.conf /usr/local/etc/nginx/valet/elasticsearch.conf
```

```bash
valet domain test
```

### Watchers not working

Try disabling SSL via `valet unsecure`.

## Next steps

Now that you have a running Shopware 6 instance, you can create your first plugin. Refer to [Plugin base guide](../../plugins/plugins/plugin-base-guide) for more information.
