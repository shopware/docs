---
nav:
  title: Repository
  position: 20

---

::: info
**Platform.sh** is now **Upsun**. You may still encounter references to Platform.sh in code, documentation, or older materials. These references are equivalent to Upsun.
:::

# Repository

The source code of your project will reside in a git-based VCS repository. You can start with a plain project. However, we suggest starting with a new Composer create-project. You will learn more about the setup template in the [Setup Template](setup-template) section.

::: info
This guide explains the repository setup using **GitHub**. You can also integrate Bitbucket or GitLab-based version control environments with Shopware PaaS. Refer to [Source Integrations](https://fixed.docs.upsun.com/integrations/source.html) for more information.
:::

## Create a Shopware project

Firstly, create a new project with `composer create-project shopware/production <folder-name>` using the [Symfony Flex](../../../guides/installation/template.md) template.

This will create a brand new Shopware 6 project in the given folder. Now, change it into the newly created project and require the PaaS configuration with `composer req paas`.

Secondly, create a new Git repository and push it to your favourite Git hosting service.

### Updating the PaaS template recipe

You can update the recipe to the latest version using the `composer recipes:update` [command](https://symfony.com/blog/fast-smart-flex-recipe-upgrades-with-recipes-update).

However, the template may receive breaking changes. For example, when making certain changes to file mounts (like using a "service mount" instead of a "local mount"), there is no way to migrate your existing data into the updated mount automatically. Due to this, we always recommend manually checking all changes in the `recipes:update` command provided for the PaaS package, as some updates to the `.platform-yaml` files might need extra manual actions. Every PaaS recipe update should be deemed a **breaking** update and thus be validated before applying it to your project.

## Add PaaS remote

Lastly, add a second remote, which allows us to push code towards the PaaS environment and trigger a deployment.

We first need the project ID, so we display all projects using

```bash{7}
$ shopware projects

Your projects are:
+---------------+-----------+------------------+--------------+
| ID            | Title     | Region           | Organization |
+---------------+-----------+------------------+--------------+
| 7xasjkyld189e | paas-env  | <region-domain>  | shopware     |
+---------------+-----------+------------------+--------------+

Get a project by running: platform get [id]
List a projects environments by running: platform environments -p [id]
```

To add the project remote to your local repository, just run

```bash
shopware project:set-remote 7xasjkyld189e # Replace with your project ID
```

## Conclusion

Now your repository is configured - you should have two remotes

```sh
$ git remote -v

origin	git@github.com:<project-repository>.git (fetch)
origin	git@github.com:<project-repository>.git (push)
shopware	<paas-url>.git (fetch)
shopware	<paas-url>.git (push)
```

| Remote     | Function          | Description                                                             |
|------------|-------------------|-------------------------------------------------------------------------|
| `origin`   | Project Code      | This remote contains all your project specific source code              |
| `shopware` | PaaS Environment  | Changes pushed to this remote will be synced with your PaaS environment |

## Migrating from the old template to the new template

If you have already used the [Shopware PaaS old template](https://github.com/shopware/paas), please follow the guide to [migrate it to the new structure](../../../guides/installation/template#how-to-migrate-from-production-template-to-symfony-flex).

The following tasks have to be done additionally to the flex migration:

* The root `.platform.app.yml` has been moved to `.platform/applications.yaml`
* The following services has been renamed:
    * `queuerabbit` to `rabbitmq`
    * `searchelastic` to `opensearch`

As the services are renamed, a completely new service will be created. Here are three possible options available:

* Rename the services back again
* Start with a new service and re-index Elasticsearch
* [Perform the transitional upgrade of two services in parallel for some time](https://fixed.docs.upsun.com/add-services/opensearch.html#upgrading)
