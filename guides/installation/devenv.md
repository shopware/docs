---
nav:
  title: Devenv
  position: 30

---

# Devenv

## What is devenv?

Imagine [devenv](https://devenv.sh) to function as a dependency manager for the services and packages that you need to run your application for local development or even in a CI/CD context.

Similar to other package managers, devenv lets you describe what your environment should look like and locks dependencies to a specific version to help you compose a reproducible setup.

Devenv not only lets you choose from and install different versions of binaries (e.g., PHP, Node, npm), but it also allows you to configure and run services (like MySQL, Redis, OpenSearch). The binaries and states of the services are stored on a per-project level.

The main difference to other tools like Docker or a VM is that it neither uses containerization nor virtualization techniques. Instead, the services run natively on your machine.

## Installation

### Nix

As devenv is built on top of Nix, first install Nix with the following command based on your OS:

<Tabs>
<Tab title="macOS">

```shell
sh <(curl -L https://nixos.org/nix/install)
```

</Tab>

<Tab title="Linux">

```shell
sh <(curl -L https://nixos.org/nix/install) --daemon
```

</Tab>

<Tab title="Windows (WSL2)">

```shell
sh <(curl -L https://nixos.org/nix/install) --no-daemon
```

</Tab>

<Tab title="Docker">

```shell
docker run -it nixos/nix
```

</Tab>
</Tabs>

#### Using Oh My ZSH?

You probably won't be able to use the commands below. Use the following steps to continue using [oh my zsh](https://ohmyz.sh/):

* Open `/etc/zshrc` and look for the following lines (probably at the end of the file):

 ```bash
 # Nix
 if [ -e '/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh' ]; then
    . '/nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh'
 fi
 # End Nix
 ```

* Copy these lines and delete them from this file.
* Open `~/.zshrc` and add the above-copied lines to the end of this file.
* Initiate the terminal with `source ~/.zshrc` or reboot your terminal for nix to work.

[Credits: "nixos installation issue,'command not found: nix'", StackOverflow](https://stackoverflow.com/a/70822086/982278)

### Cachix

Next, install [Cachix](https://www.cachix.org/) to speed up the installation:

```shell
nix-env -iA cachix -f https://cachix.org/api/v1/install
```

Before installing devenv, instruct Cachix to use the devenv cache:

```shell
cachix use devenv
```

::: info
The first time you run `cachix use`, you will be prompted a warning that you are not a trusted user.
:::

> This user doesn't have permission to configure binary caches.
>
> You can either:
>
> a) ...
>
> b) ...

When you encounter the above message, run:

```shell
echo "trusted-users = root ${USER}" | sudo tee -a /etc/nix/nix.conf && sudo pkill nix-daemon
```

### Devenv

Finally, install devenv:

```shell
nix-env -if https://github.com/cachix/devenv/tarball/latest
```

Before booting up your development environment, configure Cachix to use Shopware's cache:

```shell
cachix use shopware
```

You can find the whole installation guide for devenv in their official documentation:

<PageRef page="https://devenv.sh/getting-started/" title="Getting started - devenv.sh" target="_blank" />

### Shopware

Depending on whether you want to set up a fresh Shopware project or contribute to the Shopware core, you have to choose between the [Symfony Flex template](template) or the Shopware project.

<Tabs>
<Tab title="Symfony Flex">
If you are already using our Symfony Flex template, you require a Composer package to get a basic devenv configuration:

```shell
cd <YOUR_SHOPWARE_FLEX_PROJECT_ROOT>
```

```shell
composer require devenv
```

This will create a basic `devenv.nix` file to enable devenv support for Shopware.
</Tab>

<Tab title="shopware/shopware (Contribute)">
Clone [shopware/shopware](https://github.com/shopware/shopware) and change into the project directory:

```shell
git clone git@github.com:shopware/shopware.git
```

</Tab>
</Tabs>

Since the environment is described via a `devenv.nix` file committed to version control, you can now boot up the environment:

```shell
devenv up
```

::: warning
Make sure that the ports for the services are not already in use, or else the command will fail.
:::

Check your default web services with the following commands:

<Tabs>
<Tab title="macOS">

```bash
netstat -p tcp -van | grep '^Proto\|LISTEN'
```

</Tab>

<Tab title="Ubuntu">

```bash
ss -tulpn | grep ':80\|:3306\|:6379'
```

</Tab>
</Tabs>

Ensure to change your `.env` file to have the database connect using localhost's IP address instead of the default MySQL socket:

```txt
// <PROJECT_ROOT>/.env
DATABASE_URL="mysql://shopware:shopware@127.0.0.1:3306/shopware?sslmode=disable&charset=utf8mb4"
```

With a new terminal, go to the project directory and run the following command to launch a devenv shell.
This shell includes all needed programs (php, composer, npm, node, etc.) to initialize Shopware:

```shell
devenv shell
```

In the devenv shell, run the following command to initialize Shopware:

```shell
bin/console system:install --basic-setup --create-database --force
```

### Direnv

If you wish to switch between multiple development environments which use devenv seamlessly, we recommend installing [direnv](https://direnv.net/).

When you enter a project directory using devenv, direnv will automatically activate the environment for you.
This means you can use the binaries without having to run `devenv shell` manually, though you still have to run `devenv up` to start all services.

First, install direnv:

<Tabs>
<Tab title="macOS">
The preferred way to install direnv on macOS is using Homebrew:

```bash
brew install direnv
```

</Tab>

<Tab title="Ubuntu">

```bash
apt install direnv
```

</Tab>

<Tab title="Other">
The installation instructions for other OS are available on direnv's [official documentation](https://direnv.net/docs/hook.html).
</Tab>
</Tabs>

Afterward, add the following hook to your shell:

<Tabs>

<Tab title="Bash">

```bash
// ~/.bashrc
eval "$(direnv hook bash)"
```

</Tab>

<Tab title="Zsh">

```bash
// ~/.zshrc
eval "$(direnv hook zsh)"
```

</Tab>

<Tab title="Fish">

```bash
// ~/.config/fish/config.fish
direnv hook fish | source
```

</Tab>

<Tab title="Other">
The installation instructions for other OS are available on direnv's [official documentation](https://direnv.net/docs/hook.html).
</Tab>

</Tabs>

After you change into a project directory using devenv for the first time, you need to allow direnv to load the environment:

```bash
direnv allow
```

<PageRef page="https://devenv.sh/automatic-shell-activation/" title="Automatic Shell Activation - devenv.sh" target="_blank" />

## Default services

Here is an overview of services Shopware provides by default and how you can access them:

| Service        | Access                                          |
|----------------|-------------------------------------------------|
| MySQL          | `mysql://shopware:shopware@127.0.0.1:3306`      |
| Mailhog (SMTP) | `smtp://127.0.0.1:1025`                         |
| Redis (TCP)    | `tcp://127.0.0.1:6379`                          |

### Caddy
Caddy is a powerful, enterprise-ready, open-source web server with automatic HTTPS written in Go.

[http://127.0.0.1:8000](http://127.0.0.1:8000)

### Adminer
Adminer is a full-featured database management tool written in PHP.

[http://localhost:8010](http://localhost:8010)

### Mailhog
MailHog is an email testing tool for developers.

[http://localhost:8025](http://localhost:8025)


## Customize your setup

To customize the predefined services to match your needs, e.g., changing the virtual host, database name, or environment variables, you can create `devenv.local.nix` to override the service definitions.
It also allows you to add and configure additional services you might require for your local development.

::: warning
After changing `devenv.local.nix`, please [reload your environment](#manually-reloading-devenv).
:::

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  # Disable a service
  services.adminer.enable = false;
  
  # Use a custom virtual host
  services.caddy.virtualHosts."http://shopware.swag" = {
    extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      file_server
    '';
  };
  
  # Customize nodejs version
  languages.javascript = {
    package = pkgs.nodejs-18_x;
  };

  # Override an environment variable
  env.APP_URL = "http://shopware.swag:YOUR_CADDY_PORT";
}
```

Refer to the official devenv documentation to get a complete list of all available services and their configuration possibilities:

<PageRef page="https://devenv.sh/reference/options/" title="devenv.nix Reference - devenv.sh" target="_blank" />

### Enable Blackfire

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.blackfire.enable = true;
  services.blackfire.server-id = "<SERVER_ID>";
  services.blackfire.server-token = "<SERVER_TOKEN>";
  services.blackfire.client-id = "<CLIENT_ID>";
  services.blackfire.client-token = "<CLIENT_TOKEN>";
}
```

### Enable XDebug

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  # XDebug
  languages.php.extensions = [ "xdebug" ];
  languages.php.ini = ''
    xdebug.mode = debug
    xdebug.discover_client_host = 1
    xdebug.client_host = 127.0.0.1
  '';
}
```

### Use MariaDB instead of MySQL

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.mysql.package = pkgs.mariadb;
}
```

### Use customized MySQL port

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.mysql.settings = {
    mysqld = {
      port = 33881;
    };
  };
  
}
```

### Use customized VirtualHosts port for Caddy

<Tabs>
<Tab title="Port">

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.caddy.virtualHosts.":8029" = {
    extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      file_server
    '';
 };
}
```

</Tab>

<Tab title="Port and virtual host">

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.caddy.virtualHosts."http://shopware.swag:8029" = {
    extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      file_server
    '';
  };
```

</Tab>
</Tabs>


### Use customized Adminer port

```nix
// <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.adminer.listen = "127.0.0.1:9084";
}
```

## Known issues

### Manually reloading devenv

If you decided against using direnv, keep in mind that on every change to the `*.nix` files you need to manually reload the environment. Run `exit` to quit the current devenv shell and enter the shell again to reload:

```shell
devenv shell
```

### Direnv slow in big projects

The bigger your project directory is getting over time (e.g., cache files piling up), the slower direnv will be.
This is a known issue, and the devenv developers are working on a solution.

<PageRef page="https://github.com/cachix/devenv/issues/257" title="Devenv slows down with big code repositories #257" target="_blank" />

### Fail to start Redis with locale other than en_US

```shell
14:04:52 redis.1           | 364812:M 07 Nov 2023 14:04:52.999 # Failed to configure LOCALE for invalid locale name.
```

You can export a different locale to your shell with the following command:

```shell
export LANG=en_US.UTF8;
```

## FAQ

### How do I clean up devenv?

Periodically run `devenv gc` to remove orphaned services, packages and processes and free-up disk space.

### How do I access the database?

The MySQL service is exposed under its default port `3306`, see [default services](#default-services).

Be aware that you cannot connect using the `localhost` socket. Instead, you must use `127.0.0.1`.

### Where is the database stored?

The database is stored in the `<PROJECT_ROOT>/.devenv/state/mysql` directory.

### Where do I find available packages?

The [NixOS package search](https://search.nixos.org/packages) is a good starting point.

### Where do I find the binaries?

The binaries can be found in the `<PROJECT_ROOT>/.devenv/profile/bin` directory.

This comes in handy if you want to configure interpreters in your IDE.

### How do I stop all processes at once?

In case you can't find and stop running devenv processes, you can use the following command to kill them:

```shell
kill $(ps -ax | grep /nix/store  | awk '{print $1}')
```

### Are you unable to access http://127.0.0.1:8000 in your Browser?

Try using http://localhost:8000 instead. This mostly applies to when using WSL2.

### Are you looking for a full test setup with demo data?

Run the below command:

```shell
composer setup && APP_ENV=prod bin/console framework:demodata && APP_ENV=prod bin/console dal:refresh:index
```
