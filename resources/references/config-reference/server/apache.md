# Apache

::: info
The document root must always point to the public folder, to ensure all functionality works.
:::

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

Enable `mod_rewrite` and `mod_headers`, and deploy the current `public/.htaccess` from the Shopware template.
The following additions restrict existing HTML files under `media/` and `thumbnail/`, and apply the same policy to SVG files.
Place the rewrite condition and rule before the existing rule that serves files directly; keep the header directives in the `mod_headers` block.

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^(?:media|thumbnail)/.*\.(?i:html)$ - [E=SHOPWARE_STATIC_HTML:1]
</IfModule>

<IfModule mod_headers.c>
    Header set Content-Security-Policy "script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'" env=SHOPWARE_STATIC_HTML
    <FilesMatch "\.(?i:svg)$">
        Header set Content-Security-Policy "script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"
    </FilesMatch>
</IfModule>
```

These rules leave application-rendered HTML and bundled HTML applications unchanged.
Custom static documents must work without scripts, embedded documents, base URL overrides or form submissions; images and styles remain permitted.
