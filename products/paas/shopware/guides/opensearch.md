---
nav:
  title: How to set up OpenSearch
  position: 60
---

## Enable Opensearch
To use Opensearch with your Shopware instance, update your `application.yaml` file as follows:

```yaml
...
services:
  ...
  opensearch:
    enabled: true
```

A complete example would look like this:
```yaml
app:
  php:
    version: "8.3"
  environment_variables:
    - name: INSTALL_LOCALE
      value: fr-FR
      scope: RUN # Supports RUN or BUILD
services:
  mysql:
    version: "8.0"
  opensearch:
    enabled: true
```

Once that is done, commit this change and push it to your git repository. Now you need to update your application, see [here](../fundamentals/applications.md#update-your-application).

## Post-enablement actions
After you enable Opensearch and update your application, you need to index your application. You can do this as follows:
- Open an interactive session: `sw-paas exec --new`
- Once the exec session is ready, run the following command: `bin/console dal:refresh:index --use-queue`
