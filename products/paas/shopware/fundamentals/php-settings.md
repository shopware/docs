---
nav:
  title: PHP settings
  position: 85
---

# PHP settings configuration

We use the official Shopware [Docker](https://github.com/shopware/docker) image as a base image during the build phase.

Among other parameters, you can configure the following using environment variables:

- `PHP_MAX_UPLOAD_SIZE`: upload_max_filesize
- `PHP_MAX_UPLOAD_SIZE`: post_max_size
- `PHP_MAX_EXECUTION_TIME`: max_execution_time

For the exhaustive list, please refer to this [page](https://github.com/shopware/docker/blob/main/fpm/rootfs/usr/local/etc/php/conf.d/docker.ini).

## Note

The following variable is natively managed by our automation and should not be updated:

- `PHP_SESSION_HANDLER`
