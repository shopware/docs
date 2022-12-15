# Valet+

## Overview

Valet+ is a fork of [laravel/valet](https://github.com/laravel/valet). It supports automatic virtual host configuration based on the folder structure.

This is a modified version of the [official Installation Guide](https://github.com/weprovide/valet-plus/wiki/Installation).

## Prerequisites

Before proceeding with this guide, have a look at [Installation overview](overview.md). Also, your system should be running [brew](https://brew.sh/) and [composer](https://getcomposer.org/) already.

## If you have Valet installed

Run `composer remove laravel/valet`.

## Installing Valet-PHP

1. Update Homebrew via `brew update`.
2. Add the Homebrew PHP tap for Valet+ via `brew tap henkrehorst/php`.
3. Install PHP 7.4 using Homebrew via `brew install valet-php@7.4`.
41. Link your PHP version using the `brew link valet-php@7.4 --force` command.

## Installing Valet+

1. If needed, install composer via `brew install composer`.
2. Install Valet+ via `composer global require weprovide/valet-plus`.
3. Make sure `~/.composer/vendor/bin` is in your path by adding `export PATH="$PATH:$HOME/.composer/vendor/bin"` to your `bash_profile` or `.zshrc`.
4. Check for the following common problem with `valet fix`. 
{% hint style="warning" %}
The above instruction will uninstall all other PHP installations.
{% endhint %}
5. Run the `valet install` command. Optionally add `--with-mariadb` to use MariaDB instead of MySQL. This will configure and install Valet+ and DnsMasq.

Additionally, it registers Valet's daemon to launch when your system starts.

## Using Valet+ with Shopware 6

1. Create a new empty folder, for example `~/sites`.
2. Clone the development template like you normally would \(dev + platform\) into this folder.
3. Adjust params installation editing `.psh.yaml.dist`.
4. Run `./psh.phar install`.
5. Move to `~/sites` and run `valet park` to register Valet for this directory. Shopware should now be accessible via the `folder-name.test`.
{% hint style="warning" %}
Note: "folder-name" is the name of the Shopware development template in `~/sites`.
{% endhint %}
6. Optional: Disable SSL via `valet unsecure` because this might cause problems with the watcher.

## Troubleshooting

### Testing your installation

1. Make sure `ping something.test` responds from 127.0.0.1.
2. Run `nginx -t` or `sudo nginx -t` and check for any errors.
   1. If there is a missing *elastisearch* file, follow the "Missing Elasticsearch stub fix" further below.

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

Now that you have a running Shopware 6 instance, you can create your first plugin. Refer to [Plugin base guide](../plugins/plugins/plugin-base-guide.md) for more information.
