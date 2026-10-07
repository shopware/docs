---
nav:
  title: Additional Devenv Config
  position: 50

---

# Additional Devenv Options

All examples on this page go into a `devenv.local.nix` file in your project root. Devenv merges it with the `devenv.nix` provided by `frosh/devenv-meta`, so you only need to specify what you want to change.

After changing `devenv.local.nix`, restart your services with `devenv down` and `devenv up`. If you don't use Direnv, also leave and re-enter the Devenv shell.

## Enable Blackfire

To enable [Blackfire](https://blackfire.io/) profiling in your Devenv setup, add the following configuration to your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.blackfire.enable = true;
  services.blackfire.server-id = "<SERVER_ID>";
  services.blackfire.server-token = "<SERVER_TOKEN>";
  services.blackfire.client-id = "<CLIENT_ID>";
  services.blackfire.client-token = "<CLIENT_TOKEN>";
}
```

## Enable XDebug

To enable [Xdebug](https://xdebug.org/) for debugging or profiling, add the following configuration to your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  languages.php.extensions = [ "xdebug" ];
  languages.php.ini = ''
    xdebug.mode = debug
    xdebug.discover_client_host = 1
    xdebug.client_host = 127.0.0.1
  '';
}
```

## Enable RabbitMQ

To process messages with [RabbitMQ](https://www.rabbitmq.com/) instead of the database, enable the service:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.rabbitmq.enable = true;
  services.rabbitmq.managementPlugin.enable = true;
}
```

While RabbitMQ is enabled, Devenv also enables the `amqp` PHP extension and sets `MESSENGER_TRANSPORT_DSN` to `amqp://guest:guest@127.0.0.1:5672/%2f/messages`.

Your project also needs the AMQP transport for Symfony Messenger. Install it inside the Devenv shell:

```bash
composer require symfony/amqp-messenger
```

## Enable OpenSearch

To use [OpenSearch](https://opensearch.org/) for the product search, enable the service:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.opensearch.enable = true;
}
```

While OpenSearch is enabled, Devenv sets `OPENSEARCH_URL` to `http://127.0.0.1:9200` and enables indexing with `SHOPWARE_ES_ENABLED=1` and `SHOPWARE_ES_INDEXING_ENABLED=1`. After starting the services, build the search index:

```bash
bin/console es:index
```

## Use MariaDB instead of MySQL

To switch from MySQL to [MariaDB](https://mariadb.org/), update your `devenv.local.nix` file. `lib.mkForce` is required because the default configuration sets the MySQL package explicitly:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.mysql.package = lib.mkForce pkgs.mariadb;
}
```

MySQL and MariaDB can't share a data directory. Before switching, remove `<PROJECT_ROOT>/.devenv/state/mysql`, which deletes your local database, and reinstall Shopware afterward.

## Use a custom MySQL port

You can change the default MySQL port if it conflicts with another service on your system:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.mysql.settings.mysqld.port = 3307;
}
```

`DATABASE_URL` follows the new port automatically.

## Customize Caddy ports or virtual hosts

The default configuration serves Shopware on port `8000`. To serve it on a different port or domain, replace the default virtual host with `lib.mkForce`. Otherwise, Devenv adds your virtual host next to the default one, and Caddy still tries to listen on port `8000`.

<Tabs>
<Tab title="Change port only">

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.caddy.virtualHosts = lib.mkForce {
    ":8001".extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      encode zstd gzip
      file_server
    '';
  };

  env.APP_URL = "http://127.0.0.1:8001";
}
```

</Tab>

<Tab title="Change port and virtual host">

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.caddy.virtualHosts = lib.mkForce {
    "http://shopware.swag:8001".extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      encode zstd gzip
      file_server
    '';
  };

  env.APP_URL = "http://shopware.swag:8001";
}
```

Make sure the domain resolves to your machine, for example with an `/etc/hosts` entry:

```text
127.0.0.1 shopware.swag
```

</Tab>
</Tabs>

Shopware stores the Storefront URL in the database. If Shopware is already installed, update the sales channel domain to the same URL as `APP_URL`, either in the Administration under **Sales Channels > Storefront > Domains**, or in the Devenv shell:

```bash
mysql -u shopware -pshopware -h 127.0.0.1 -P "$MYSQL_TCP_PORT" shopware \
  -e "UPDATE sales_channel_domain SET url = '${APP_URL:?Set env.APP_URL in devenv.local.nix first}' WHERE url = 'http://127.0.0.1:8000'"
bin/console cache:clear
```

Run the command in a new Devenv shell after changing `devenv.local.nix`, so that `APP_URL` and `MYSQL_TCP_PORT` contain the new values.

:::info
`bin/console sales-channel:update:domain` only replaces the host name and keeps the old port, so it can't be used to change the port.
:::

## Use a custom Adminer port

If you need to change the default Adminer port (for example, to avoid conflicts with another service), update your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.adminer.listen = "127.0.0.1:8011";
}
```

## Run multiple projects at the same time

Each Devenv project keeps its own databases and services, but all projects use the same default ports. To run a second project at the same time, move its services to free ports:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  services.caddy.virtualHosts = lib.mkForce {
    ":8001".extraConfig = ''
      root * public
      php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
      encode zstd gzip
      file_server
    '';
  };
  env.APP_URL = "http://127.0.0.1:8001";

  services.mysql.settings.mysqld.port = 3307;
  services.redis.port = 6380;
  services.mailpit.smtpListenAddress = "127.0.0.1:1026";
  services.mailpit.uiListenAddress = "127.0.0.1:8026";
  services.adminer.listen = "127.0.0.1:8011";
}
```

`DATABASE_URL`, `MAILER_DSN`, and the Redis session configuration follow the new ports automatically. If Shopware is already installed in this project, update the sales channel domain as described in [Customize Caddy ports or virtual hosts](#customize-caddy-ports-or-virtual-hosts).

## Use Varnish

You can integrate [Varnish](https://varnish-cache.org/) into your local Shopware development setup to test reverse caching behavior. The following example shows how to configure Caddy and Varnish in your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
  # caddy config
  services.caddy = {
    enable = true;

    # all traffic to localhost is redirected to Varnish
    virtualHosts."http://localhost" = {
      extraConfig = ''
        reverse_proxy 127.0.0.1:6081 {
          # header_up solves this issue: https://discord.com/channels/1308047705309708348/1309107911175176217
          header_up Host sw.localhost
        }
      '';
    };

    # the actual shopware application is served from sw.localhost,
    # choose any domain you want.
    # you may need to add the domain to /etc/hosts:
    # 127.0.0.1       sw.localhost
    virtualHosts."http://sw.localhost" = {
      extraConfig = ''
        # set header to avoid CORS errors
        header {
          Access-Control-Allow-Origin *
          Access-Control-Allow-Credentials true
          Access-Control-Allow-Methods *
          Access-Control-Allow-Headers *
          defer
        }
        root * public
        php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
        encode zstd gzip
        file_server
        log {
          output stderr
          format console
          level ERROR
        }
      '';
    };
  };

  # varnish config
  services.varnish = {
    enable = true;
    package = pkgs.varnish;
    listen = "127.0.0.1:6081";
    # enables xkey module
    extraModules = [ pkgs.varnishPackages.modules ];
    # it's a slightly adjusted version from the [docs](https://developer.shopware.com/docs/guides/hosting/infrastructure/reverse-http-cache.html#configure-varnish)
    vcl = ''
      # ...
      # Specify your app nodes here. Use round-robin balancing to add more than one.
      backend default {
        .host = "sw.localhost";
        .port = "80";
      }
      # ...
      # ACL for purgers IP. (This needs to contain app server IPs)
      acl purgers {
        "sw.localhost";
        "127.0.0.1";
        "localhost";
        "::1";
      }
      # ...
    '';
  };
}
```

## Use an older package version

Sometimes, you may want to pin a service to an older version, for example, to match your production environment or to reproduce a previous environment state. If the version is no longer available in the nixpkgs revision your project uses, add an older nixpkgs revision as an additional input and take the package from there.

Add the input to a `devenv.local.yaml` file in your project root:

```yaml
# <PROJECT_ROOT>/devenv.local.yaml
inputs:
  nixpkgs-mysql80:
    url: github:NixOS/nixpkgs/nixos-25.05
```

Then use the package from that input in your `devenv.local.nix` file. This example uses MySQL 8.0, which current nixpkgs no longer provides:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, lib, inputs, ... }:

let
  pkgs-mysql80 = import inputs.nixpkgs-mysql80 { system = pkgs.stdenv.system; };
in
{
  services.mysql.package = lib.mkForce pkgs-mysql80.mysql80;
}
```

The same approach works for any other package, for example, `services.rabbitmq.package`. To pin the version for your whole team, add the input to `devenv.yaml` and the package to `devenv.nix` instead, and commit both together with `devenv.lock`.

MySQL can't open a data directory created by a newer version. When switching to an older version, remove `<PROJECT_ROOT>/.devenv/state/mysql` first, which deletes your local database.

## Maintenance

Use `devenv down` to stop all services of a project that you started with `devenv up -d`. If you started them with `devenv up` in the foreground, press `Ctrl+C` instead.

Run `devenv gc` periodically to remove old shell generations. To free up disk space in the Nix store afterward, run `nix store gc`.

If you can’t access [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser, try [http://localhost:8000](http://localhost:8000) instead. This issue is common when using WSL2 on Windows.

On macOS or Linux, the app should be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).
