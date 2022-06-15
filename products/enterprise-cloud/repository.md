# Repository

The source code of your project will reside in a git-based VCS repository. You can start with a plain project, however we suggest starting with a fork of the [shopware/paas](https://github.com/shopware/paas) setup template from GitHub. You will find out more about the setup template in the [Setup Template](setup-template.md) section.

{% hint style="info" %}
This guide explains the repository setup using **GitHub**. You can also integrate Bitbucket or GitLab based version control environments with Shopware Enterprise Cloud. More information in [Source Integrations](https://docs.platform.sh/integrations/source.html).
{% endhint %}

## Fork and clone setup template

First of all create a new fork of the [shopware/paas](https://github.com/shopware/paas) setup template.

![Screenshot of the fork button on GitHub](../../.gitbook/assets/fork-repository.png)

In the next step, clone it to your local machine (the following commands require [git command line tools](https://git-scm.com/book/en/v2/Getting-Started-The-Command-Line)):

```bash
git clone <path-to-your-fork> shopware-cloud-project
```

This will create a local copy of the forked repository in a directory named `shopware-cloud-project`.

### Add an upstream remote

Have a look at the remotes using `git remote -v`. By default, your repository is configured with a remote named `origin` which points to your forked repository. However, we also want to ensure you can receive updates whenever Shopware makes changes to the setup repository. Hence, we configure a so-called upstream remote:

```bash
git remote add upstream https://github.com/shopware/paas
```

If you run `git remote -v` again, you will see that there's a new remote named `upstream`. From now on, you can always pull the latest changes from the official template using

```bash
git fetch upstream
git checkout main # Assuming your default branch is called "main"
git merge upstream/main
```

Be aware that you might have to resolve some conflicts if you made changes in your template.

## Add Enterprise Cloud remote

Next, we need to add a third remote, which allows us to push code towards the Enterprise Cloud environment and trigger a deployment.

We first need the project ID, so we display all projects using

```bash{7}
$ shopware projects

Your projects are:
+---------------+-----------------------+------------------+--------------+
| ID            | Title                 | Region           | Organization |
+---------------+-----------------------+------------------+--------------+
| 7xasjkyld189e | enterprise-cloud-env  | <region-domain>  | shopware     |
+---------------+-----------------------+------------------+--------------+

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
platform	<enterprise-cloud-url>.git (fetch)
platform	<enterprise-cloud-url>.git (push)
upstream	https://github.com/shopware/paas (fetch)
upstream	https://github.com/shopware/paas (push)
```

| Remote | Function | Description |
| --- | --- | --- |
| `origin` | Project Code | This remote contains all your project specific source code |
| `platform` | Enterprise Cloud Environment | Changes pushed to this remote will be synced with your Enterprise Cloud environment |
| `upstream` | Official Template | Maintained by Showpare and used to pull latest changes |
