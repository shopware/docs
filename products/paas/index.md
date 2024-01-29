---
nav:
  title: PaaS
  position: 20

---

# PaaS

::: info
Shopware PaaS is available at request for Shopware merchants. Please approach the [Shopware Sales](https://www.shopware.com/en/#contact-sales) to get more information on Shopware PaaS
:::

Shopware PaaS is a platform-as-a-service to host, deploy and scale for your individual Shopware project.
It comes with full flexibility and code ownership of a self-hosted Shopware project, but takes away the complexity of building custom infrastructure, build and testing pipelines, or deployment automation.

Get started by installing the PaaS CLI on your local development machine.

## Step-by-step guide

The sub-pages describe a step-by-step guide that you can follow to set up your PaaS project.

First of all make sure your [CLI is set up correctly](cli-setup).
After your CLI took is working correctly, it is time to [set up your project repository](repository).

When your repository is set up correctly, you are ready to [push and deploy your project](build-deploy) to the PaaS environment.

After your first deploy, the Storefront for your website will not work directly. You will have to [set up the building of the theme](theme-build) for frontend assets to be generated correctly.

Finally, you can look into setting up [Elasticsearch](elasticsearch), [RabbitMQ](rabbitmq) and/or [Fastly](fastly) to further enhance the performance of your PaaS project.
