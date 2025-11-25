---
nav:
  title: Additional Devenv Options
  position: 50

---

# Additional Devenv Options

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
 # XDebug
 languages.php.extensions = [ "xdebug" ];
 languages.php.ini = ''
 xdebug.mode = debug
 xdebug.discover_client_host = 1
 xdebug.client_host = 127.0.0.1
 '';
}
```

After modifying your `devenv.local.nix` file, reload your environment.

## Use MariaDB instead of MySQL

To switch from MySQL to [MariaDB](https://mariadb.org/), update your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
 services.mysql.package = pkgs.mariadb;
}
```

## Use a custom MySQL port

You can change the default MySQL port if it conflicts with another service on your system:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
 services.mysql.settings = {
 mysqld = {
 port = 33881;
 };
 };

}
```

After any change, run `devenv reload` to apply updates.

## Customize Caddy ports or virtual hosts

You can adjust the Caddy web server configuration to use a different port or virtual host.

<Tabs>
<Tab title="Change port only">

```nix
# <PROJECT_ROOT>/devenv.local.nix
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

<Tab title="Change port and virtual host">

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
 services.caddy.virtualHosts."http://shopware.swag:8029" = {
 extraConfig = ''
 root * public
 php_fastcgi unix/${config.languages.php.fpm.pools.web.socket}
 file_server
 '';
 };
}
```

</Tab>
</Tabs>

## Use a custom Adminer port

If you need to change the default Adminer port (for example, to avoid conflicts with another service), update your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
 services.adminer.listen = "127.0.0.1:9084";
}
```

After modifying `devenv.local.nix`, reload your environment.

## Use Varnish

You can integrate [Varnish](https://varnish-cache.org/) into your local Shopware development setup to test reverse caching behavior. The following example shows how to configure Caddy and Varnish in your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
 # caddy config
 services.caddy = {
 enable = true;

 # all traffic to localhost is redirected to varnish
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
 # ACL for purgers IP. (This needs to contain app server ips)
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

After updating your `devenv.local.nix`, reload your development environment to apply the changes:

```bash
devenv reload
```

## Use an older package version

Sometimes, you may want to pin a service to an older version to, for example, ensure compatibility with legacy components or reproduce a previous environment state.

Here are examples showing how to use older versions of MySQL and RabbitMQ in your `devenv.local.nix` configuration:

**Example: Use a specific MySQL version**:

```nix
{
 services.mysql = let
 mysql8033 = pkgs.mysql80.overrideAttrs (oldAttrs: {
 version = "8.0.33";
 # the final url would look like this: https://github.com/mysql/mysql-server/archive/mysql-8.0.33.tar.gz
 # make sure the url exists.
 # alternatively you could use that url directly via pkgs.fetchurl { url = "xyz"; hash="xyz";};
 # for reference see the [different fetchers](https://ryantm.github.io/nixpkgs/builders/fetchers/#chap-pkgs-fetchers)
 src = pkgs.fetchFromGitHub {
 owner = "mysql";
 repo = "mysql-server";
 rev = "mysql-8.0.33";
 # leave empty on the first run, you will get prompted with the expected hash
 sha256 = "sha256-s4llspXB+rCsGLEtI4WJiPYvtnWiKx51oAgxlg/lATg=";
 };
 });
 in
 {
 enable = true;
 package = mysql8033; # use the overridden package
 # ...
 };
}
```

**Example**: Use a specific RabbitMQ version:

```nix
{
 services.rabbitmq = let
 rabbitmq3137 = pkgs.rabbitmq-server.overrideAttrs (oldAttrs: {
 version = "3.13.7";
 src = pkgs.fetchurl {
 url = "https://github.com/rabbitmq/rabbitmq-server/releases/download/v3.13.7/rabbitmq-server-3.13.7.tar.xz";
 sha256 = "sha256-GDUyYudwhQSLrFXO21W3fwmH2tl2STF9gSuZsb3GZh0=";
 };
 });
 in
 {
 enable = true;
 package = rabbitmq3137; # use the overridden package
 };
}
```

Pinning versions may increase build time; use only when necessary.

## Maintenance

Run `devenv gc` periodically to remove unused packages, services, and caches. This helps free disk space and keeps your environment clean.

Use `devenv down` to stop services first. If processes remain, as a last resort terminate them manually:

```bash
kill $(ps -ax | grep /nix/store | grep -v "grep" | awk '{print $1}')
```

If you can’t access [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser, try [http://localhost:8000](http://localhost:8000) instead. This issue is common when using WSL2 on Windows.

On macOS or Linux, the app should be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).
