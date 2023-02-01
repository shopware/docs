# What is devenv?

Imagine [devenv](https://devenv.sh) to function as a dependency manager for the services and packages that you need to run your application for local development or even in a CI/CD context.

Similar to other package managers, devenv lets you describe what your environment should look like and locks dependencies to a specific version to help you compose a reproducible setup.

Devenv not only lets you choose from and install different versions of binaries (e.g., PHP, Node, npm), but it also allows you to configure and run services (like MySQL, Redis, OpenSearch). The binaries and states of the services are stored on a per-project level.

The main difference to other tools like Docker or a VM is that it neither uses containerization nor virtualization techniques. Instead, the services run natively on your machine.

## Installation

### Nix

As devenv is built on top of Nix, first install Nix with the following command based on your OS:

{% tabs %}
{% tab title="macOS" %}

```shell
sh <(curl -L https://nixos.org/nix/install)
```

{% endtab %}

{% tab title="Linux" %}

```shell
sh <(curl -L https://nixos.org/nix/install) --daemon
```

{% endtab %}

{% tab title="Windows (WSL2)" %}

```shell
sh <(curl -L https://nixos.org/nix/install) --no-daemon
```

{% endtab %}

{% tab title="Docker" %}

```shell
docker run -it nixos/nix
```

{% endtab %}
{% endtabs %}

### Cachix

Next, install [Cachix](https://www.cachix.org/) to speed up the installation:

```shell
nix-env -iA cachix -f https://cachix.org/api/v1/install
```

Before installing devenv, instruct Cachix to use the devenv cache:

```shell
cachix use devenv
```

{% hint style="info %}
The first time you run `cachix use`, you will be prompted a warning that you are not a trusted user.
{% endhint %}

```shell
This user doesn't have permissions to configure binary caches.

You can either:

a) ...

b) ...
```

When you encounter the above message, run:

```shell
echo "trusted-users = root ${USER}" | sudo tee -a /etc/nix/nix.conf && sudo pkill nix-daemon
```

### Devenv

Finally, install devenv:

```shell
nix-env -if https://github.com/cachix/devenv/tarball/v0.5
```

Before booting up your development environment, configure Cachix to use Shopware's cache:

```shell
cachix use shopware
```

By default, `shopware/platform` uses unfree software like Blackfire. To be able to use unfree software, you have to *allow* it:

```bash
mkdir -p ~/.config/nixpkgs
echo '{ allowUnfree = true; }' > ~/.config/nixpkgs/config.nix
```

You can find the whole installation guide for devenv in their official documentation:

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://devenv.sh/getting-started/" caption="Getting started - devenv.sh" %}

### Shopware

Depending on whether you want to set up a fresh Shopware project or contribute to the Shopware core, choose between:

{% tabs %}
{% tab title="Symfony Flex" %}
If you are already using Symfony Flex, you require a Composer package to get a basic devenv configuration:

```bash
composer require devenv
```

This will create a basic `devenv.nix` file to enable devenv support for Shopware.
{% endtab %}

{% tab title="shopware/platform (Contribute)" %}
Clone [shopware/platform](https://github.com/shopware/platform) and change into the project directory:

```shell
git clone git@github.com:shopware/platform.git
```

{% endtab %}
{% endtabs %}

Since the environment is described via a `devenv.nix` file committed to version control, you can now boot up the environment:

```shell
devenv up
```

{% hint style="warning" %}
Make sure that the ports for the services are not already in use, or else the command will fail.
{% endhint %}

Ensure to change your `.env` file to have the database connect using localhost's IP address instead of the default MySQL socket:

{% code title="<PROJECT_ROOT>/.env" %}

```dotenv
DATABASE_URL="mysql://shopware:shopware@127.0.0.1:3306/shopware?sslmode=disable&charset=utf8mb4"
```

{% endcode %}

With a new terminal, go to the project directory and run the following command to launch a devenv shell.
This shell includes all needed programs (php, composer, npm, node, etc.), to initialize Shopware:

```shell
devenv shell
```

In the devenv shell, run the following command to initialize Shopware:

```shell
composer setup
```

### Direnv

If you wish to switch between multiple development environments which use devenv seamlessly, we recommend installing [direnv](https://direnv.net/).

When you enter a project directory using devenv, direnv will automatically activate the environment for you.
This means that you can use the binaries without having to run `devenv shell` manually, though you still have to run `devenv up` to start all services.

First, install direnv:

{% tabs %}
{% tab title="macOS" %}
The preferred way to install direnv on macOS is using Homebrew:

```bash
brew install direnv
```

{% endtab %}

{% tab title="Ubuntu" %}

```bash
apt install direnv
```

{% endtab %}

{% tab title="Other" %}
The installation instructions for other OS are available on direnv's [official documentation](https://direnv.net/docs/hook.html).
{% endtab %}
{% endtabs %}

Afterwards, add the following hook to your shell:

{% tabs %}

{% tab title="Bash" %}
{% code title="~/.bashrc" %}

```bash
eval "$(direnv hook bash)"
```

{% endcode %}
{% endtab %}

{% tab title="Zsh" %}
{% code title="~/.zshrc" %}

```bash
eval "$(direnv hook zsh)"
```

{% endcode %}
{% endtab %}

{% tab title="Fish" %}
{% code title="~/.config/fish/config.fish" %}

```bash
direnv hook fish | source
```

{% endcode %}
{% endtab %}

{% tab title="Other" %}
The installation instructions for other OS are available on direnv's [official documentation](https://direnv.net/docs/hook.html).
{% endtab %}

{% endtabs %}

After you change into a project directory using devenv for the first time, you need to allow direnv to load the environment:

```bash
direnv allow
```

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://devenv.sh/automatic-shell-activation/" caption="Automatic Shell Activation - devenv.sh" %}

## Default services

Here is an overview of services Shopware provides by default and how you can access them:

| Service          | Access                                         |
|------------------|------------------------------------------------|
| MySQL            | `mysql://shopware:shopware@127.0.0.1:3306`     |
| Caddy            | [http://localhost:8000](http://localhost:8000) |
| Adminer          | [http://localhost:9080](http://localhost:9080) |
| Mailhog (SMTP)   | `smtp://127.0.0.1:1025`                        |
| Mailhog (Web UI) | [http://localhost:8025](http://localhost:8025) |

## Customize your setup

To customize the predefined services to match your needs, e.g., changing the virtual host, database name, or environment variables, you can create `devenv.local.nix` to override the service definitions.
It also allows you to add and configure additional services you might require for your local development.

{% code title="<PROJECT_ROOT>/devenv.local.nix" %}

```nix
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
  
  # Override an environment variable
  env.APP_URL = "http://shopware.swag";
}
```

{% endcode %}

Refer to the official devenv documentation to get a complete list of all available services and their configuration possibilities:

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://devenv.sh/reference/options/" caption="devenv.nix Reference - devenv.sh" %}

### Enable Blackfire

{% code title="<PROJECT_ROOT>/devenv.local.nix" %}

```nix
{ pkgs, config, lib, ... }:

{
  services.blackfire.enable = true;
  services.blackfire.server-id = "<SERVER_ID>";
  services.blackfire.server-token = "<SERVER_TOKEN>";
  services.blackfire.client-id = "<CLIENT_ID>";
  services.blackfire.client-token = "<CLIENT_TOKEN>";
}
```

{% endcode %}

### Enable XDebug

{% code title="<PROJECT_ROOT>/devenv.local.nix" %}

```nix
{ pkgs, config, lib, ... }:

{
  languages.php.package = pkgs.php.buildEnv {
    extensions = { all, enabled }: with all; enabled ++ [ amqp redis blackfire grpc xdebug ];
    extraConfig = ''
      # Copy the config from devenv.nix and append the XDebug config
      # [...]
      xdebug.mode=debug
      xdebug.discover_client_host=1
      xdebug.client_host=127.0.0.1
    '';
  };
}
```

### Use MariaDB instead of MySQL

{% code title="<PROJECT_ROOT>/devenv.local.nix" %}

```nix
{ pkgs, config, lib, ... }:

{
  services.mysql.package = pkgs.mariadb;
}
```

{% endcode %}

## Known issues

### Manually reloading direnv

If you decided against using direnv, keep in mind that on every change to the `*.nix` files you need to manually reload the environment:

```shell
direnv reload
```

### Direnv slow in big projects

The bigger your project directory is getting over time (e.g. cache files piling up), the slower direnv will be.
This is a known issue and the devenv developers are working on a solution.

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://github.com/cachix/devenv/issues/257" caption="Devenv slows down with big code repositories #257" %}

## FAQ

### How do I clean up devenv?

Periodically run `devenv gc` to remove orphaned services, packages and processes and free up disk space.

### How do I access the database?

The MySQL service is exposed under its default port `3306`, see [Default services](#default-services).

Be aware that you cannot connect using the `localhost` socket. Instead, you must use `127.0.0.1`.

### Where is the database stored?

The database is stored in the `<PROJECT_ROOT>/.devenv/state/mysql` directory.

### Where do I find available packages?

The [NixOS package search](https://search.nixos.org/packages) is a good starting point.

### Where do I find the binaries?

The binaries can be found in the `<PROJECT_ROOT>/.devenv/profile/bin` directory.

This comes in handy if you want to configure interpreters in your IDE.
