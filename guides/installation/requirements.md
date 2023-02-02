# Requirements

Before installing Shopware 6, you should take a quick look at the requirements to check if your local environment is capable of running it.

## Operating System

Shopware 6 is currently only supported on linux and macOS setups.
Windows is only supported inside wsl.

## Versions

You can use these commands to check your actual environment:

* `php -v`: Show CLI PHP version
* `php -m`: Show CLI PHP modules
* `php -i | grep memory_limit`: Show your actual CLI PHP memory limit
* `composer -v`: Show your actual composer version
* `node -v`: Show you actual Node version
* `npm -v`: Show you actual NPM version

**PHP**

* Tested on 7.4.3, 8.0 and 8.1
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

* Tested on MySQL 5.7.21, and 8.0
  * Only MySQL 8.0.20 in specific, is not compatible
* Tested on MariaDB 10.3.22, 10.4 and 10.5
  * MariaDB 10.3.29, 10.4.19, 10.5.10 are not compatible at the moment

**JavaScript**

* Node.js 12.21.0 or higher
* NPM 6.5.0 or higher

## Webserver

To run shopware in a development context the [symfony cli](https://symfony.com/doc/current/setup/symfony_server.html) will work nicely.

Below you find the default configuration using either Caddy, Nginx or Apache as a websever.

{% tabs %}
{% tab title="Caddy" %}

```text
mydomain.com {
  root * public
  php_fastcgi 127.0.0.1:9000
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

    client_max_body_size 128M;

    root __DOCUMENT_ROOT__/public;

    # Shopware install / update
    location /recovery/install {
        index index.php;
        try_files $uri /recovery/install/index.php$is_args$args;
    }

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

    location ~ \.php$ {
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
        http2_push_preload on;
    }
}
```

{% endtab %}


{% tab title="Apache" %}

{% hint style="info" %}
`mod_headers` must be enabled to securely serve `.svg` files.
{% endhint %}

```text
<VirtualHost *:80>
   ServerName "HOST_NAME"
   DocumentRoot _SHOPWARE_LOCATION_/public
   <Directory _SHOPWARE_LOCATION_>
      Options Indexes FollowSymLinks MultiViews
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

# Setup

If the requirements are fullfilled you can continue to our template guide to set up Shopware.

{% page-ref page="template.md" %}
