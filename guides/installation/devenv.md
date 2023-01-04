# What is devenv?

Imagine [devenv](https://devenv.sh) to function as a dependency manager for the services and packages that you need to run your application for local development or even in a CI/CD context.

Similar to other package managers, devenv lets you describe what your environment should look like and locks dependencies to a specific version to help you compose a reproducible setup.

Devenv not only lets you choose from and install different versions of binaries (e.g. PHP, Node, npm), it also allows you to configure and run services (like MySQL, Redis, OpenSearch).
The binaries and states of the services are stored on a per-project level.

The main difference to other tools like Docker or a VM is that it is neither using a containerization nor virtualization technique - the services are running natively on your machine.

## Installation

### Nix

As devenv is built on top of Nix, you need to install it first:

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

{% hint style="info" %}
When running `cachix use ...` for the first time, you will see a warning that your user is not in trusted-users.

```bash
This user doesn't have permissions to configure binary caches.

You can either:
...
```

When faced with this message, you can run
```
echo "trusted-users = root ${USER}" | sudo tee -a /etc/nix/nix.conf && sudo pkill nix-daemon
```
{% endhint %}

### Devenv

Finally, install devenv:

```shell
nix-env -if https://github.com/cachix/devenv/tarball/v0.5
```

Before booting up your development environment, configure Cachix to use Shopware's cache:

```
cachix use shopware
```

By default, `shopware/platform` uses unfree software like Blackfire.
To be able to use unfree software, you have to allow that:

```bash
mkdir -p ~/.config/nixpkgs
echo '{ allowUnfree = true; }' > ~/.config/nixpkgs/config.nix
```

You can find the whole installation guide for devenv in their official documentation:

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://devenv.sh/getting-started/" caption="Getting started - devenv.sh" %}

### Shopware

Now, clone [shopware/platform](https://github.com/shopware/platform) and change into the project directory:

```shell
git clone git@github.com:shopware/platform.git
```

Since the environment is described via a `devenv.nix` file committed to version control, you can now boot up the environment: 

```shell
devenv up
```

{% hint style="info" %}
Make sure that the ports for the services are not already in use or the command will fail. 
{% endhint %}

Ensure to change your `.env` file to have the database connect using localhost's IP address instead of the default MySQL socket:

{% code title=".env" %}
```dotenv
DATABASE_URL="mysql://shopware:shopware@127.0.0.1:3306/shopware?sslmode=disable&charset=utf8mb4"
```
{% endcode %}

Still inside the project directory, run the following command to initialize Shopware:

```shell
composer setup
```

### Direnv

If you wish to seamlessly switch between multiple development environments which use devenv we recommend to install [direnv](https://direnv.net/).

When you enter a project directory using devenv, direnv will automatically activate the environment for you.
This means that you can use the binaries and services without having to run `devenv up` manually.

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
>direnv hook fish | source
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

## Customize your setup

To customize the predefined services to match your needs, e.g. changing the virtual host, database name or environment variables, you can create `devenv.local.nix` to override the service definitions.
It also allows you to add and configure additional services you might require for your local development.

{% code title="<PROJECT_ROOT>/devenv.local.nix" %}

```nix
{ pkgs, config, lib, ... }:

{
  # Disable a service
  services.adminer.enable = lib.mkForce false;
  
  # Use a custom virtual host
  services.caddy.virtualHosts."http://shopware.swag" = {
    extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      file_server
    '';
  };
  
  # Override an environment variable
  env.APP_URL = lib.mkForce "http://shopware.swag";
}
```

{% endcode %}

Refer to the official devenv documentation to get a complete list of all available services and their configuration possibilities:

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://devenv.sh/reference/options/" caption="devenv.nix Reference - devenv.sh" %}

### Enable Blackfire

Adjust your local devenv file as follows:

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

To activate the changes, run:

```shell
direnv reload
devenv up
```

{% endcode %}

### Enable XDebug

Adjust your local devenv file as follows:

{% code title="<PROJECT_ROOT>/devenv.local.nix" %}

```nix
{ pkgs, config, lib, ... }:

{
  // TODO How to enable XDebug?
}
```

To activate the changes, run:

```shell
direnv reload
devenv up
```

{% endcode %}

## Template

### Shopware Project

If you are already using Symfony Flex, you can require a basic devenv configuration with `composer require devenv`.

It will generate a basic `devenv.nix` to work with Shopware.

### Contribution

In Platform repository the [`devenv.nix`](https://gitlab.shopware.com/shopware/6/product/platform/-/blob/trunk/devenv.nix) file is responsible for devenv support

## Known issues

### Manually reloading direnv

If you decided against using direnv, keep in mind that on every change to the `*.nix` files you need to manually reload the environment:

```shell
direnv reload
```

### Direnv slow in big projects

The bigger your project directory is getting over time (e.g. cache files piling up), the slower direnv will be.
This is a known issue and the direnv developers are working on a solution.

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://github.com/cachix/devenv/issues/257" caption="Devenv slows down with big code repositories #257" %}
