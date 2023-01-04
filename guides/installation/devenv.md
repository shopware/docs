## What is devenv?

Imagine [devenv](https://devenv.sh) to function as a dependency manager for the services and packages that you need to run your application for local development or even in a CI/CD context.

Similar to other package managers, devenv lets you describe what your environment should look like and locks dependencies to a specific version to help you compose a reproducible setup.

devenv not only let's you choose from and install different versions of binaries (e.g. PHP, Node, npm), it also allows you to configure and run services (like MySQL, Redis, OpenSearch). The binaries and states of the services are stored on a per-project level.

The main difference to other tools like Docker or a VM is that it is neither using a containerization or virtualization technique - the services are running natively on your machine.

## Installation

You can follow the installation instructions on the [Devenv website](https://devenv.sh/getting-started/).
It is highly recommended to use [`Cachix`](https://docs.cachix.org/installation) and [`direnv`](https://direnv.net/).

For Shopware there is a "Cachix cache", which can be applied using:

```shell
cachix use shopware
```

{% info %}
When running `cachix use` for the first time, you will see a warning that your user is not in trusted-users. 

```bash
This user doesn't have permissions to configure binary caches.

You can either:
...
```

When faced with this message, you can run 
```
echo "trusted-users = root ${USER}" | sudo tee -a /etc/nix/nix.conf && sudo pkill nix-daemon
```

{% endinfo %}

## Customize your setup

To customize the predefined services to match your needs, e.g. changing the virtual host, database name or environment variables, you can create `devenv.local.nix` to override the service definitions. It also allows you to add and configure further services you might require for your local development.

{% code title="<PROJECT_ROOT>/devenv.local.nix" %}

```nix
{ pkgs, config, lib, ... }:

{
  # Install XDebug
  # TODO @Soner :-D

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

Refer to the offical devenv documentation to get a complete list of all available services and their configuration possibilites:

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://devenv.sh/reference/options/" caption="devenv.nix Reference - devenv.sh" %}


## Automatic Shell Activation

If you wish to seamlessly switch between multiple development environments which use devenv we recommend to install [direnv](https://direnv.net/).

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

The installation guides for other operating systems are available in the official documentation of `direnv`:

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://direnv.net/docs/installation.html" caption="Installation - direnv.net" %}

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

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://direnv.net/docs/hook.html" caption="Setup - direnv.net" %}

{% endtab %}

{% endtabs %}

<!-- markdown-link-check-disable-next-line -->
{% embed url="https://devenv.sh/automatic-shell-activation/" caption="Automatic Shell Activation - devenv.sh" %}

## Template

### Shopware Project

If you are already using Symfony Flex, you can require a basic devenv configuration with `composer require devenv`.

It will generate a basic `devenv.nix` to work with Shopware.

### Contribution

In Platform repository the [`devenv.nix`](https://gitlab.shopware.com/shopware/6/product/platform/-/blob/trunk/devenv.nix) file is responsible for devenv support
