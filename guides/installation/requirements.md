# Requirements

Before installing Shopware 6, take a quick look at the requirements below to check if your local environment is capable of running it.

## Operating System

Shopware 6 is currently only supported on linux and macOS setups.
Windows is only supported inside WSL 2.

## Versions

You can use these commands to check your actual environment:

* `php -v`: Shows CLI PHP version
* `php -m`: Shows CLI PHP modules
* `php -i | grep memory_limit`: Shows your actual CLI PHP memory limit
* `composer -v`: Shows your actual composer version
* `node -v`: Shows your actual Node version
* `npm -v`: Shows your actual NPM version

### PHP

* Compatible version : 8.1 and 8.2
* `memory_limit` : 512M minimum
* `max_execution_time` : 30 seconds minimum
* Extensions:
  * ext-curl
  * ext-dom  
  * ext-fileinfo  
  * ext-gd  
  * ext-iconv  
  * ext-intl  
  * ext-json  
  * ext-libxml  
  * ext-mbstring  
  * ext-openssl  
  * ext-pcre  
  * ext-pdo  
  * ext-pdo\_mysql  
  * ext-phar  
  * ext-simplexml
  * ext-sodium
  * ext-xml  
  * ext-zip  
  * ext-zlib
* Composer recommended version : 2.0 or higher

### SQL

* MySQL

  * Recommended version : 8.0

  * Problematic versions: 8.0.20

* MariaDB

  * Compatible versions : at least 10.3

  * Recommended version : at least 10.11

  * Problematic versions: 10.3.29, 10.4.19, 10.5.10

The `media:delete-unused` command requires at least MariaDB 10.9 or MySQL 8.

For optimal MySQL performance, it is advisable to have minimum of 32 MB.

### JavaScript

* Node.js 18.0.0 or higher
* NPM 8.0.0 or higher

## Webserver

To run Shopware in a development context, the [Symfony CLI](https://symfony.com/doc/current/setup/symfony_server.html) will work nicely.

Below you will find the default configuration using either Caddy, Nginx or Apache as a webserver.

{% tabs %}
{% tab title="Caddy" %}

```text
mydomain.com {
  header {
    X-Frame-Options DENY
    Referrer-Policy no-referrer-when-downgrade
  }

  @svg {
    file
    path *.svg
  }

  header @svg Content-Security-Policy "script-src 'none'"

  @default {
    not path /theme/* /media/* /thumbnail/* /bundles/* /css/* /fonts/* /js/* /recovery/* /sitemap/*
  }

  root * public
  php_fastcgi 127.0.0.1:9000
  encode zstd gzip
  file_server
}
```

{% endtab %}

{% tab title="Nginx" %}

```text
server {
    listen 80;

    index index.php index.html;
    server_name localhost;

    client_max_body_size 32M;

    root __DOCUMENT_ROOT__/public;

    location /recovery/update/ {
        index index.php;
        try_files $uri /recovery/install/index.php$is_args$args;
    }

    location ~ ^/(recovery\/update\/index|index|shopware-installer\.phar)\.php(/|$) {
        fastcgi_split_path_info ^(.+\.php)(/.+)$;
        include fastcgi.conf;
        fastcgi_param HTTP_PROXY "";
        fastcgi_buffers 8 16k;
        fastcgi_buffer_size 32k;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        send_timeout 300s;
        client_body_buffer_size 128k;
        fastcgi_pass unix:/run/php/php8.2-fpm.sock;
    }

    location = /sitemap.xml {
            log_not_found off;
            access_log off;
            try_files $uri /;
    }

    location = /robots.txt {
            log_not_found off;
            access_log off;
            try_files $uri /;
    }

    location ~* ^.+\.(?:css|cur|js|jpe?g|gif|ico|png|svg|webp|avif|html|woff|woff2|xml)$ {
        expires 1y;
        add_header Cache-Control "public, must-revalidate, proxy-revalidate";

        access_log off;

        # The directive enables or disables messages in error_log about files not found on disk.
        log_not_found off;

        tcp_nodelay off;

        ## Set the OS file cache.
        open_file_cache max=3000 inactive=120s;
        open_file_cache_valid 45s;
        open_file_cache_min_uses 2;
        open_file_cache_errors off;

        location ~* ^.+\.svg$ {
            add_header Content-Security-Policy "script-src 'none'";
        }
    }

    location / {
        try_files $uri /index.php$is_args$args;
    }
}

```

{% endtab %}

{% tab title="Apache" %}

{% hint style="info" %}
The following modules are required:

* mod_negotiation
* mod_rewrite
* mod_headers
* mod_deflate

{% endhint %}

```text
<VirtualHost *:80>
   ServerName "HOST_NAME"
   DocumentRoot _SHOPWARE_LOCATION_/public
   <Directory _SHOPWARE_LOCATION_>
      Options -Indexes +FollowSymLinks +MultiViews
      AllowOverride All
      Order allow,deny
      allow from all
   </Directory>
   ErrorLog ${APACHE_LOG_DIR}/shopware.error.log
   CustomLog ${APACHE_LOG_DIR}/shopware.access.log combined
</VirtualHost>
```

{% endtab %}
{% endtabs %}

## Recommended stack

We recommend the following stack:

* Webserver: Caddy
* PHP: 8.2
* SQL: MySQL 8 or Percona MySQL 8
* Node: 18
* Search: OpenSearch 2.8.0
* Queue: RabbitMQ

Recommended PHP ini:
{% page-ref page="../hosting/performance/performance-tweaks.md#php-config-tweaks" %}

## Setup

Once the requirements are fulfilled, follow up with the [Template](template.md) guide to set up Shopware.
