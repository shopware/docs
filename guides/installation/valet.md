# Valet+

## Overview

Valet+ is a fork of [laravel/valet](https://github.com/laravel/valet). It supports automatic virtual host configuration based on the folder structure.

This is a modified version of the [official Installation Guide](https://github.com/weprovide/valet-plus/wiki/Installation).

## Prerequisites

You should have a look at our [overview](overview) before proceeding with this guide. Also, your system should be running [brew](https://brew.sh/) and [composer](https://getcomposer.org/) already.

## If you have Valet installed

Run `composer remove laravel/valet`.

## Installing Valet-PHP

1. Update Homebrew via `brew update`
1. Add the Homebrew PHP tap for Valet+ via `brew tap henkrehorst/php`
1. Install PHP 7.4 using Homebrew via `brew install valet-php@7.4`
1. Link your PHP version using the `brew link valet-php@7.4 --force` command

## Installing Valet+

1. If needed, install composer via `brew install composer`
1. Install Valet+ via `composer global require weprovide/valet-plus`
1. Make sure `~/.composer/vendor/bin` is in your path by adding `export PATH="$PATH:$HOME/.composer/vendor/bin"` to your `bash_profile` or `.zshrc`
1. Check for the following, common problem with `valet fix`. **Warning: This will uninstall all other PHP installations**
1. Run the `valet install` command. Optionally add `--with-mariadb` to use MariaDB instead of MySQL. This will configure and install Valet+ and DnsMasq.

   Additionally, it registers Valet's daemon to launch when your system starts.

## Using Valet+ with Shopware 6

1. Create a new empty folder for example `~/sites`
1. Clone the development template like you normally would \(dev + platform\) into this folder
1. Adjust params instalation editing `.psh.yaml.dist`
1. Run `./psh.phar install`
1. Move to `~/sites` and run `valet park` to register valet for this directory. Shopware should now be accessible via the `folder-name.test`. Notice: "folder-name" is the name of the Shopware development template in `~/sites`
1. Optional: Disable SSL via `valet unsecure` because this might cause problems with the watcher

## Troubleshooting

### Testing your installation

1. Make sure `ping something.test` responds from 127.0.0.1.
1. Run `nginx -t` or `sudo nginx -t` and check for any errors.
   1. If there is a missing _elastisearch_ file, follow "Missing Elasticsearch stub fix" further below

### Install Error: "_The process has been signaled with signal 9_"

This is due to `valet fix` uninstalling `valet-php@7.4` for some reason. You can fix it by reinstalling Valet-PHP \(Step 3 + 4 of "Installing Valet-PHP"\). Make sure to **NOT** run `valet fix` afterwards and just proceed with `valet install`.

### Missing Elasticsearch stub fix

```sh
sudo cp ~/.composer/vendor/weprovide/valet-plus/cli/stubs/elasticsearch.conf /usr/local/etc/nginx/valet/elasticsearch.conf
```

```sh
valet domain test
```

### Watchers not working

Try disabling SSL via `valet unsecure`.

## Next steps

Now, that you've got a running Shopware 6 instance, you could try to create your first plugin. Head over to our [plugin base guide](../plugins/plugins/plugin-base-guide) for more information.
