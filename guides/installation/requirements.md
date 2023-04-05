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

**PHP**

* Tested on 8.1 and 8.2
* `memory_limit` 512M minimum
* `max_execution_time` 30 seconds minimum
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
* Composer 2.0 or higher

**SQL**

MySQL 8.0 is tested to work.
Known problematic Versions:

* 8.0.20

MariaDB 10.3.22, 10.4 and 10.5 are all tested.
Known problematic Versions:

* 10.3.29
* 10.4.19
* 10.5.10

**JavaScript**

* Node.js 18.00.0 or higher
* NPM 8.0.0 or higher

## Webserver

To run Shopware in a development context, the [Symfony CLI](https://symfony.com/doc/current/setup/symfony_server.html) will work nicely.

Below you will find the default configuration using either Caddy, Nginx or Apache as a webserver.

<Tabs>
<Tab title="Caddy">

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

</Tab>

<Tab title="Nginx">

```text
server {
    listen 80;

    index index.php index.html;
    server_name localhost;

    client_max_body_size 128M;

    root __DOCUMENT_ROOT__/public;

    # Shopware update
    location /recovery/update/ {
        location /recovery/update/assets {
        }
        if (!-e $request_filename){
            rewrite . /recovery/update/index.php last;
        }
    }

    location ~* ^.+\.(?:css|cur|js|jpe?g|gif|ico|png|svg|webp|html|woff|woff2|xml)$ {
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

        try_files $uri /index.php$is_args$args;
    }

    location ~* ^.+\.svg$ {
        add_header Content-Security-Policy "script-src 'none'";
    }

    location / {
        try_files $uri /index.php$is_args$args;
    }

    location ~ ^/(index|shopware-installer\.phar)\.php(/|$) {
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
        fastcgi_pass 127.0.0.1:9000;
    }
}
```

</Tab>

<Tab title="Apache">

::: info
The following modules are required:

* mod_negotiation
* mod_rewrite
* mod_headers
* mod_deflate

:::

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

</Tab>
</Tabs>

## Recommended stack

We recommend the following stack:

* Webserver: Caddy
* PHP: 8.1
* Node: 16
* Search: Opensearch 2.5.0
* Queue: Rabbitmq

Recommended PHP ini:
<PageRef page="../hosting/performance/performance-tweaks#php-config-tweaks" />

## Setup

Once the requirements are fulfilled, follow up with the [Template](template) guide to set up Shopware.
