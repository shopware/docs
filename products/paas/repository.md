# Repository

The source code of your project will reside in a git-based VCS repository. You can start with a plain project, however we suggest starting with a new composer create-project. You will find out more about the setup template in the [Setup Template](setup-template.md) section.

{% hint style="info" %}
This guide explains the repository setup using **GitHub**. You can also integrate Bitbucket or GitLab based version control environments with Shopware PaaS. More information in [Source Integrations](https://docs.platform.sh/integrations/source.html).
{% endhint %}

## Create a Shopware project

First we create a new project with `composer create-project shopware/platform:dev-flex <folder-name>` using the [flex template](../../guides/installation/flex.md).

This will create a brand new Shopware 6 project in the given folder. Now we have to change into our new created project and require the PaaS configuration with `composer req paas`.

Second we have to create a new Git repository and push it to your favorite Git hosting service.

## Add PaaS remote

Next, we need to add a second remote, which allows us to push code towards the PaaS environment and trigger a deployment.

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