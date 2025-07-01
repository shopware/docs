---
nav:
  title: Shopware PaaS
  position: 20

---

# Shopware PaaS

::: info
Shopware PaaS is available at request for Shopware merchants. Please approach the [Shopware Sales](https://www.shopware.com/en/#contact-sales) to get more information on Shopware PaaS
:::

Shopware PaaS is a platform-as-a-service to host, deploy and scale for your individual Shopware project.
It comes with full flexibility and code ownership of a self-hosted Shopware project, but takes away the complexity of building custom infrastructure, build and testing pipelines, or deployment automation.

Get started by installing the PaaS CLI on your local development machine.

## Getting started with Shopware PaaS - How to deploy your first project

::: info
Prerequisites:

* Having a Shopware PaaS account (Select Register now on the authentication form when accessing <https://console.shopware.com>)
* Having the project_id of an empty project created on Shopware PaaS
* Having the Shopware PaaS CLI installed, see <https://developer.shopware.com/docs/products/paas/cli-setup.html>
* Having PHP ext-amqp installed (PaaS uses RabbitMQ instead of the regular DB to manage messages)
:::

Steps:

1.) Create a local Shopware project on your laptop

```sh
composer create-project shopware/production demo --no-interaction --ignore-platform-reqs
```

2.) Enter the folder newly created

```sh
cd /demo
```

3.) Install the PaaS composer package

```sh
composer req paas
```

4.) Initialize your local Git repository

```sh
git init
```

5.) Add all the existing files to Git

```sh
git add .
```

6.) Create your first commit

```sh
git commit -am "initial commit"
```

7.) Configure the PaaS CLI with your project_id

```sh
shopware project:set-remote PROJECT_ID
```

Where PROJECT_ID is the project_id of your empty project.

8.) Push the code to Shopware PaaS

```sh
git push shopware
```

## Step-by-step guide

The sub-pages describe a more detailed step-by-step guide that you can follow to set up your PaaS project.

First, make sure your [PaaS CLI is set up correctly](cli-setup).
Once your PaaS CLI is up and running, it is time to [set up your project repository](repository).

When your repository is set up correctly, you are ready to [push and deploy your project](build-deploy) to the PaaS environment.

You can look into setting up [Elasticsearch](elasticsearch), [RabbitMQ](rabbitmq) and/or [Fastly](fastly) to further enhance the performance of your PaaS project.

Finally, do not forget each PaaS project comes with [Blackfire](blackfire) which will help you to monitor the response time and investigate performance issues of your project.
