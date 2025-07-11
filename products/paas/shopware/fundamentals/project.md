---
nav:
  title: Projects
  position: 30
---

# Projects

Projects represent a codebase in a GitHub, Bitbucket, or GitLab repository that is deployed to Shopware PaaS Native. Projects can contain many applications.

## Creating a New Project

Initialize a new project in your organization by specifying its name, repository, and type.

```sh
sw-paas project create
```

Ensure that Shopware PaaS Native has access to the repository by following [this guide](../guides/setting-up-repository-access.md).

## List All Projects

Displays all projects associated with your user or organization, along with key metadata such as project name, type, and repository.

**Usage:**

```sh
sw-paas project list
```
