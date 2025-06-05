---
nav:
  title: Project Setup
  position: 20
---

# Project Setup

## Local setup

Customizations that change the file system must be developed locally. This includes Shopware updates, installing and updating plugins ([documentation](https://developers.shopware.com/developers-guide/shopware-composer/#requiring-plugins)), making the initial configurations for the installation such as the system language, making code changes if necessary, etc.

> [!NOTE]
> It's not possible to manage extensions in the Shopware Administration panel. In distributed and high available setups, you can't dynamically install or update extensions because those changes need to be done on every host server. Therefore, such operations should be performed during a deployment/rollout and not dynamically.

### Recommendation

Mac and Linux are recommended. When working with Windows, you can set up a local environment with Docker or wsl2, as in this [tutorial](https://www.youtube.com/watch?v=5XYFRDlT9WI).

## Project creation

To create a new Shopware PaaS project, execute the following command:

```
composer create-project shopware/production <folder-name>
```

Including Docker configuration at this stage is optional; it will be added in the next step.

Next, navigate to your project directory and install the necessary Shopware packages to ensure appropriate environment variables are configured:

```
cd <folder-name>
composer require shopware/k8s-meta --ignore-platform-reqs
```

This will install the required configurations (recipes) for the Shopware operator. Please ensure they are added correctly. Verify successful installation by checking the package file `config/packages/operator.yaml`.<br>

`--ignore-platform-reqs` option makes sure all recipes are pulled down by ignoring the local PHP setup.


Last step is this is to create a file named `application.yaml` at the root level of you project. This file is required; it allows some basics configuration regarding the deployment of your shop (like php version, mysql version, passing specific variables ...).
Here is a basic example:

```yaml
app:
  php:
    version: "8.3"
  environment_variables: []
  hooks: {}
services:
  mysql:
    version: "8.0"
```

Below, an advanced example including passing a Shopware environment variable:

```yaml
app:
  php:
    version: "8.3"
  environment_variables:
    - name: INSTALL_LOCALE
      value: fr-FR
      scope: RUN

  hooks: {}
services:
  mysql:
    version: "8.0"
```

## Repository setup with deploy keys for private repositories

To connect your private git repository with our backend, you need to add a deploy key to your repository.
This key is used to clone your repository and deploy your code to the cluster.

The PaaS CLI can also handle this for you. Execute the following command:

```bash
sw-paas vault create --type ssh
```

Note that this will add the ssh key as an organization level key. If you use multiple Projects you need to specify the project with the `--project` flag.

1. Generate a new SSH key pair on your local machine with an empty passphrase:

    ```bash
    ssh-keygen -t rsa -b 4096 -m PEM -f ./sw-paas
    ```
    
    We support different algorithms for SSH keys.
    The above command generates an **RSA** key.
    You can also use **ED25519** or **ECDSA** keys.
    The only requirement is that the key must be passwordless and the private key must be stored in PEM format.

2. Add the public key to your repository settings. Copy the content of the public key file `sw-paas.pub` and add it to your repository settings.

    In GitHub, you can find this under `Settings` -> `Deploy keys`.
    You can also add the key to your repository settings in GitLab or Bitbucket.
    The token should have read access to the repository.

3. Store the private key in the vault

    The private key must be stored in the vault.
    After that, the key will be used to clone the repository and deploy the code to the cluster.

```bash
cat sw-pass | sw-paas vault create --type ssh --password-stdin
```

The key can either be stored on an organization level or on a project level.
If you store the key on an organization level, all projects in this organization can use the key.
If you store the key on a project level, only this project can use the key.

A project level key will overwrite an organization level key.
The key name can be chosen freely because only one ssh key can be stored per level.
