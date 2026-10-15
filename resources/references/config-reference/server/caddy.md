# Caddy

The static-file policy below restricts existing SVG files and HTML files under `media/` and `thumbnail/`.
Application-rendered HTML and bundled HTML applications retain their own response policies.
Custom static documents must work without scripts, embedded documents, base URL overrides or form submissions; images and styles remain permitted.

```text
mydomain.com {
  header {
    X-Frame-Options DENY
    Referrer-Policy no-referrer-when-downgrade
  }

  @staticDocuments {
    file
    path_regexp staticDocuments (?i)([.]svg$|^/(media|thumbnail)/.*[.]html$)
  }

  header @staticDocuments Content-Security-Policy "script-src 'none'; object-src 'none'; frame-src 'none'; base-uri 'none'; form-action 'none'"

  @default {
    not path /theme/* /media/* /thumbnail/* /bundles/* /css/* /fonts/* /js/* /recovery/* /sitemap/*
  }

  root * public
  php_fastcgi 127.0.0.1:9000
  encode zstd gzip
  file_server
}
```
