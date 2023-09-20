# Repository

The source code of your project will reside in a git-based VCS repository. You can start with a plain project. However, we suggest starting with a new Composer create-project. You will learn more about the setup template in the [Setup Template](setup-template) section.

::: info
This guide explains the repository setup using **GitHub**. You can also integrate Bitbucket or GitLab-based version control environments with Shopware PaaS. Refer to [Source Integrations](https://docs.platform.sh/integrations/source.html) for more information.
:::

## Create a Shopware project

Firstly,  create a new project with `composer create-project shopware/platform:dev-flex <folder-name>` using the [Symphony Flex](../../guides/installation/flex) template.

This will create a brand new Shopware 6 project in the given folder. Now, change it into the newly created project and require the PaaS configuration with `composer req paas`.

Secondly, create a new Git repository and push it to your favorite Git hosting service.

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

Now your repository is configured - you should have three remotes

```sh
$ git remote -v

origin	git@github.com:<project-repository>.git (fetch)
origin	git@github.com:<project-repository>.git (push)
platform	<paas-url>.git (fetch)
platform	<paas-url>.git (push)
```

| Remote     | Function          | Description                                                             |
|------------|-------------------|-------------------------------------------------------------------------|
| `origin`   | Project Code      | This remote contains all your project specific source code              |
| `platform` | PaaS Environment  | Changes pushed to this remote will be synced with your PaaS environment |

## Migrating from old template to the new template

If you have already used the [Shopware PaaS old template](https://github.com/shopware/paas), please follow the guide to [migrate it to the new structure](../../guides/installation/flex#how-to-migrate-from-production-template-to-symfony-flex).

Following tasks has to be done additionally to the flex migration:

* The root `.platform.app.yml` has been moved to `.platform/applications.yaml`
* The following services has been renamed:
    * `queuerabbit` to `rabbitmq`
    * `searchelastic` to `opensearch`

As the services are renamed, a completely new service will be created. Here are three possible options available:

* Rename the services back again
* Start with a new service and re-index Elasticsearch
* [Perform the transitional upgrade of two services in parallel for some time](https://docs.platform.sh/add-services/opensearch.html#upgrading)
