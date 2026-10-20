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

      <IfModule mod_headers.c>
         Header set Content-Security-Policy "script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'" "expr=-f %{REQUEST_FILENAME} && %{REQUEST_URI} =~ m#^/(media|thumbnail)/.*[.](?i:html)$#"
         <FilesMatch "[.](?i:svg)$">
            Header set Content-Security-Policy "script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"
         </FilesMatch>
      </IfModule>
   </Directory>

   ErrorLog ${APACHE_LOG_DIR}/shopware.error.log
   CustomLog ${APACHE_LOG_DIR}/shopware.access.log combined
</VirtualHost>
```
