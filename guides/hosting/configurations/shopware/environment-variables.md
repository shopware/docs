---
nav:
  title: Environment Variables
  position: 50

---

# Environment Variables

This page lists all environment variables that can be used to configure Shopware.

| Variable                               | Default Value             | Description                                                                                                          |
|----------------------------------------|---------------------------|----------------------------------------------------------------------------------------------------------------------|
| `APP_ENV`                              | `prod`                    | Environment                                                                                                          |
| `APP_SECRET`                           | (empty)                   | Can be generated with `openssl rand -hex 32`                                                                         |
| `APP_CACHE_DIR`                        | `{projectRoot}/var/cache` | Path to a directory to store caches (since 6.6.8.0)                                                                  |
| `APP_BUILD_DIR`                        | `{projectRoot}/var/cache` | Path to a temporary directory to create cache folder (since 6.6.8.0)                                                 |
| `APP_LOG_DIR`                          | `{projectRoot}/var/log`   | Path to a directory to store logs (since 6.6.8.0)                                                                    |
| `INSTANCE_ID`                          | (empty)                   | Unique Identifier for the Store: Can be generated with `openssl rand -hex 32`                                        |
| `JWT_PRIVATE_KEY`                      | (empty)                   | Can be generated with `shopware-cli project generate-jwt --env`                                                      |
| `JWT_PUBLIC_KEY`                       | (empty)                   | Can be generated with `shopware-cli project generate-jwt --env`                                                      |
| `LOCK_DSN`                             | `flock`                   | DSN for Symfony locking                                                                                              |
| `APP_URL`                              | (empty)                   | Where Shopware will be accessible                                                                                    |
| `BLUE_GREEN_DEPLOYMENT`                | `0`                       | This needs super privilege to create trigger                                                                         |
| `DATABASE_URL`                         | (empty)                   | MySQL credentials as DSN                                                                                             |
| `DATABASE_SSL_CA`                      | (empty)                   | Path to SSL CA file                                                                                                  |
| `DATABASE_SSL_CERT`                    | (empty)                   | Path to SSL Cert file                                                                                                |
| `DATABASE_SSL_KEY`                     | (empty)                   | Path to SSL Key file                                                                                                 |
| `DATABASE_SSL_DONT_VERIFY_SERVER_CERT` | (empty)                   | Disables verification of the server certificate (1 disables it)                                                      |
| `MAILER_DSN`                           | `null://localhost`        | Mailer DSN (Admin Configuration overwrites this)                                                                     |
| `ENABLE_SERVICES`                      | `auto`                    | Determines if services are enabled, auto detects that based on `APP_ENV`, other possible values are `true` & `false` |
| `OPENSEARCH_URL`                       | (empty)                   | Open Search Hosts                                                                                                    |
| `SHOPWARE_ES_ENABLED`                  | `0`                       | Open Search Support Enabled?                                                                                         |
| `SHOPWARE_ES_INDEXING_ENABLED`         | `0`                       | Open Search Indexing Enabled?                                                                                        |
| `SHOPWARE_ES_INDEX_PREFIX`             | (empty)                   | Open Search Index Prefix                                                                                             |
| `COMPOSER_HOME`                        | `/tmp/composer`           | Caching for the Plugin Manager                                                                                       |
| `SHOPWARE_HTTP_CACHE_ENABLED`          | `1`                       | Is HTTP Cache enabled?                                                                                               |
| `SHOPWARE_HTTP_DEFAULT_TTL`            | `7200`                    | Default TTL for HTTP Cache                                                                                           |
| `MESSENGER_TRANSPORT_DSN`              | (empty)                   | DSN for default async queue (example: `amqp://guest:guest@localhost:5672/%2f/default`)                               |
| `MESSENGER_TRANSPORT_LOW_PRIORITY_DSN` | (empty)                   | DSN for low priority queue (example: `amqp://guest:guest@localhost:5672/%2f/low_prio`)                               |
| `MESSENGER_TRANSPORT_FAILURE_DSN`      | (empty)                   | DSN for failed messages queue (example: `amqp://guest:guest@localhost:5672/%2f/failure`)                             |
