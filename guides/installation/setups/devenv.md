---
nav:
  title: Devenv
  position: 30

---

# Devenv

[Devenv](https://devenv.sh) is a Nix-based tool for defining and managing fully reproducible development environments for local workstations or continuous integration (CI) systems. It works like a dependency manager for your entire development stack.

Instead of manually installing and configuring PHP, Node.js, MySQL, Redis, or other services, you describe your setup once in a `devenv.nix` file. Devenv then installs and runs the exact versions you specify, ensuring consistency across every developer’s machine.

Devenv lets you choose specific versions of binaries (e.g., PHP, Node, or npm) and configure and run services like MySQL, Redis, or OpenSearch. All binaries and service states are stored on a per-project basis, providing an isolated yet native development environment.

Unlike Docker or virtual machines, Devenv does not use containerization or virtualization. Instead, all services and binaries run natively on your host system. This makes it an appealing choice for Shopware core contributors or advanced users who want consistent local and CI builds.

## Required on your host

Devenv provides project-local PHP, Node, Composer and services via Nix, so you don't need to install those runtimes globally for a project that uses Devenv.

On the host you only need a minimal toolchain:

- [Nix package manager](https://nixos.org/download.html)
- Git
- Optional: Docker Engine, only if you plan to run additional containerized services alongside Devenv

See the [Shopware 6 requirements](../requirements.md) for general system requirements and supported versions. Devenv will provide the exact runtime versions per project.

> **Note:** If you previously installed Nix using an older single-user script or via a package manager (for example, `brew install nix`), remove it first to prevent permission or path conflicts. Removing `/nix` deletes the global Nix store and may require elevated privileges. Use `sudo` if appropriate and double-check before running destructive commands.

## Installation

### Nix

Devenv is built on top of [Nix](https://nixos.org/), so you need to [install it](https://nixos.org/download.html) first. The Nix community recommends using the cross-platform [Determinate Systems installer](https://determinate.systems/posts/determinate-nix-installer), which provides a fast, consistent setup across macOS, Linux, and WSL2 that requires no manual configuration:

```bash
curl -L https://install.determinate.systems/nix | sh -s -- install
```

This installs Nix in multi-user mode and automatically configures your shell. If you prefer, you can still use the [official Nix installer](https://nixos.org/download.html), but it may require additional manual steps, such as updating your shell profile or enabling the Nix daemon.

For CI pipelines, Docker images, or other non-interactive environments, you can skip the Determinate Systems installer and invoke Nix directly using `nix-shell` or [Nix Flakes](https://nixos.wiki/wiki/Flakes). Use `nix-shell` for a simple, one-off environment defined by a `shell.nix` file. Use Nix Flakes for more reproducible builds and shared dependency management across systems or teams.

After installation, restart your terminal to load Nix’s environment variables automatically. Alternatively, to avoid restarting, you can load Nix manually in your current shell session:

```bash
# Load Nix into your current shell session

. /nix/var/nix/profiles/default/etc/profile.d/nix-daemon.sh
```

The Determinate Systems installer also handles shell integration, including Zsh and [Oh My Zsh](https://ohmyz.sh/), so you don't need to manually copy Nix configuration lines into your shell startup files.

::: warning
If you have previously installed Nix using an older single-user script or via a package manager (for example, `brew install nix`), remove it first to prevent permission or path conflicts:

```bash
rm -rf ~/.nix-profile ~/.nix-defexpr ~/.nix-channels ~/.local/state/nix
rm -rf /nix
```

Removing `/nix` deletes the global Nix store and may require elevated privileges. Only run these commands if you intend to completely remove previous Nix installations.
:::

If Nix commands aren’t available after installation, restart your terminal or run `source ~/.zshrc`.

### Install Devenv

Once Nix is installed, install or update Devenv with the Nix profile command:

```bash
nix profile install github:cachix/devenv/latest
```

You can find the full installation guide and advanced options in the [official Devenv documentation](https://devenv.sh/getting-started/).

## Quick checks (verify host & Devenv)

Run these to confirm your host environment is ready:

```bash
# Nix installed and on PATH
nix --version

# Devenv installed and available
devenv --version
which devenv

# Direnv (optional)
direnv --version || echo "direnv not installed"

# Basic sanity: list Devenv commands
devenv help

# Check few common ports (macOS / Linux examples)
lsof -i :8000 -i :3306 -i :6379 || ss -tulpn | grep ':8000\|:3306\|:6379'
```

### Shopware

Depending on your goals, you can either create a new Shopware project using the production template or contribute to the Shopware core, which already includes a `devenv.nix` file.

<Tabs>
<Tab title="New Shopware project">

First, create a new Shopware project using Composer:

```bash
composer create-project shopware/production <project-name>
cd <project-name>
```

Add Devenv support for Shopware using the [Frosh Devenv Meta](https://github.com/FriendsOfShopware/devenv-meta) package:

```bash
composer require frosh/devenv-meta
```

This command generates a basic `devenv.nix` configuration, enabling Devenv for your project.

</Tab>

<Tab title="Contribute to shopware/shopware">
Clone the Shopware core repository and switch into the project directory:

```bash
git clone https://github.com/shopware/shopware.git && cd shopware
```

</Tab>
</Tabs>

Once your project includes a `devenv.nix` file, you can start the environment:

```bash
devenv up
```

::: warning
Before starting Devenv, ensure that common service ports (e.g., `8000`, `3306`, `6379`) are not already in use. If they are, Devenv will fail to start the corresponding services.
:::

Check for active services:

<Tabs>
<Tab title="macOS">

```bash
lsof -i :80 -i :3306 -i :6379 -i :8000
```

</Tab>

<Tab title="Linux (Ubuntu, Debian, etc.)">

```bash
ss -tulpn | grep ':80\|:3306\|:6379\|:8000'
```

If you see no output for a given port, rerun the check with elevated privileges to include system services. For example:

```bash
sudo ss -tulpn | grep ':80\|:3306\|:6379\|:8000'
```

</Tab>
</Tabs>

## Configure your database connection (optional)

Verify your `.env` file points to the correct database:

```bash
# <PROJECT_ROOT>/.env
DATABASE_URL="mysql://shopware:shopware@127.0.0.1:3306/shopware?sslmode=disable&charset=utf8mb4"
```

If you changed your MySQL port or user in `devenv.local.nix`, update these values here as well.

## Launch Devenv and install Shopware

Start Devenv in the project directory:

```bash
devenv up
```

Then open a *new terminal* and enter the Devenv shell, which provides PHP, Composer, Node.js, npm, etc.:

```bash
devenv shell
```

Inside the Devenv shell, install Shopware:

```bash
bin/console system:install --basic-setup --create-database --force
```

Once installation completes, open `http://localhost:8000/admin` in your browser. You should see the Shopware Admin interface.

The default credentials are:

- User: `admin`
- Password: `shopware`

::: info
On Windows with WSL2, change the default sales channel domain to `http://localhost:8000`. Use *http*, not https.
:::

To create a full test setup with demo data, run:

```bash
composer setup && APP_ENV=prod bin/console framework:demodata && APP_ENV=prod bin/console dal:refresh:index
```

If installation completes without schema creation, run `bin/console database:migrate`.

### Direnv (optional)

[Direnv](https://direnv.net/) makes it easier to work with multiple Devenv projects by automatically activating the correct environment when you enter a project directory. It's optional but recommended for a smoother workflow.

With Direnv, you don’t have to run `devenv shell` manually every time you use the binaries. The environment loads automatically.

You still need to start the services once with `devenv up`.

First, install Direnv:

<Tabs>
<Tab title="macOS">
Install Direnv on macOS with Homebrew:

```bash
brew install direnv
```

</Tab>

<Tab title="Ubuntu/Debian">

```bash
apt install direnv
```

</Tab>

<Tab title="Other systems">

If you have [Nix](https://nixos.org) installed, you can install Direnv using:

```bash
nix profile install nixpkgs#direnv
```

Otherwise, follow the installation steps for your platform in Direnv's [official documentation](https://direnv.net/docs/hook.html).
</Tab>
</Tabs>

Add the Direnv hook to your shell configuration file:

<Tabs>

<Tab title="Bash">

```bash
#  ~/.bashrc
eval "$(direnv hook bash)"
```

</Tab>

<Tab title="Zsh">

```bash
#  ~/.zshrc
eval "$(direnv hook zsh)"
```

</Tab>

<Tab title="Fish">

```bash
#  ~/.config/fish/config.fish
direnv hook fish | source
```

</Tab>

<Tab title="Other shells">
See Direnv's [official documentation](https://direnv.net/docs/hook.html) for installation instructions for other shells.
</Tab>

</Tabs>

After configuring your shell, reload it or restart your terminal.

### First use

When you enter a Devenv project directory for the first time, allow Direnv to load the environment:

```bash
direnv allow
```

If you change the Devenv configuration or your `.envrc` file after running `direnv allow`, reload the environment with:

```bash
direnv reload
```

Direnv will now automatically activate the Devenv environment whenever you enter the directory.

See the official [Automatic Shell Activation guide](https://devenv.sh/automatic-shell-activation/) for more details.

## Default services

When you start Devenv with `devenv up`, Shopware automatically provides several core services. You can access them using the following addresses:

| Service | Default address | Description |
|----------|-----------------|--------------|
| MySQL | `mysql://shopware:shopware@127.0.0.1:3306` | Primary database for Shopware. |
| Mailhog (SMTP) | `smtp://127.0.0.1:1025` | Local mail capture for testing email. |
| Redis (TCP) | `tcp://127.0.0.1:6379` | Used for caching and sessions. |
| Caddy | `http://127.0.0.1:8000` | Web server. |
| Adminer | `http://127.0.0.1:9080` | Database management tool. |

::: tip
The MySQL service listens on port `3306` and stores its data in `<PROJECT_ROOT>/.devenv/state/mysql`. Use `127.0.0.1` instead of `localhost` when connecting to MySQL.
:::

### Redis

Redis is used for caching and sessions and runs on `tcp://127.0.0.1:6379`.

If Redis fails to start with an error such as `Failed to configure LOCALE for invalid locale name`, set a valid locale before starting Devenv:

```bash
export LANG=en_US.UTF-8
```

### Caddy

[Caddy](https://caddyserver.com/) is an open-source web server written in Go with automatic HTTPS. It serves your local Shopware instance by default at [http://127.0.0.1:8000](http://127.0.0.1:8000).

### Adminer

[Adminer](https://www.adminer.org/) is a full-featured, lightweight database management tool written in PHP. You can use it to view and manage your Shopware database: [http://127.0.0.1:9080](http://127.0.0.1:9080).

Default credentials:

- User: `shopware`
- Password: `shopware`

### Mailhog

[MailHog](https://github.com/mailhog/MailHog) is an email testing tool that intercepts outgoing messages so you can preview them in your browser: [http://localhost:8025](http://localhost:8025).

## Customize your setup

You can customize the predefined Devenv services to match your local needs—for example, changing virtual hosts, database names, or environment variables. You can override defaults to match your local dev setup, e.g., to free ports or change domains.

To override or extend the defaults, create a `devenv.local.nix` file in your project root.
This file lets you disable built-in services, adjust configuration, or add new ones that your project requires.

After editing `devenv.local.nix`, [reload your environment](#manually-reloading-devenv) to apply the changes.

Example:

```nix
# <PROJECT_ROOT>/devenv.local.nix
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

For a full list of all available services and their configuration options, refer to the official [Devenv documentation](https://devenv.sh/reference/options/).

If you're not using [Direnv](#direnv), remember to reload the environment manually after changing any `*.nix` file:

```bash
exit
devenv shell
```

All binaries installed by Devenv are located in `<PROJECT_ROOT>/.devenv/profile/bin`.

You can search for available packages on [NixOS package search](https://search.nixos.org/packages).

This comes in handy if you want to configure interpreters in your IDE.

::: warning
Do not commit service tokens or credentials to version control. Store secrets in `.env` or a secret manager.
:::

### Enable Blackfire (optional)

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

### Enable XDebug (optional)

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

### Use MariaDB instead of MySQL (optional)

To switch from MySQL to [MariaDB](https://mariadb.org/), update your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
 services.mysql.package = pkgs.mariadb;
}
```

### Use a custom MySQL port (optional)

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

### Customize Caddy ports or virtual hosts (optional)

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

### Use a custom Adminer port (optional)

If you need to change the default Adminer port (for example, to avoid conflicts with another service), update your `devenv.local.nix` file:

```nix
# <PROJECT_ROOT>/devenv.local.nix
{ pkgs, config, lib, ... }:

{
 services.adminer.listen = "127.0.0.1:9084";
}
```

After modifying `devenv.local.nix`, reload your environment.

### Use Varnish (optional, advanced)

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

### Use an older package version (optional, advanced)

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

## Maintenance (recommended)

Run `devenv gc` periodically to remove unused packages, services, and caches. This helps free disk space and keeps your environment clean.

Use `devenv down` to stop services first. If processes remain, as a last resort terminate them manually:

```bash
kill $(ps -ax | grep /nix/store | grep -v "grep" | awk '{print $1}')
```

If you can’t access [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser, try [http://localhost:8000](http://localhost:8000) instead. This issue is common when using WSL2 on Windows.

On macOS or Linux, the app should be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).
