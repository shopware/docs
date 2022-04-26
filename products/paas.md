# Shopware PaaS

Shopware PaaS is a service that provides hosting, deployment and scaling for your individual Shopware project.
It comes with the full flexibility and code ownership of a self-managed Shopware project, but takes away the complexity of building custom infrastructure, build & testing pipelines or deployment automation.

## Project setup

If you are familiar with self-managed Shopware projects, you have heard about our [setup templates](../guides/installation/overview.md#setup-templates) **shopware/development** and **shopware/production** that you can use as a base for your development or production hosting respectively.

With Shopware PaaS your main starting point will be the **shopware/paas** template, designed and optimized specifically for Shopware PaaS.

{% embed url="https://github.com/shopware/paas" caption="Shopware PaaS Template" %}

You write code the same as if you would in any other self-managed Shopware project. Your project can include extensions like apps or plugins and the code is managed and versioned in a git-based VCS.

## Hosting and infrastructure

Depending on the booked plan, your store operates in shared or a dedicated multi-server environment. Additional services and infrastructure can be added through configuration.
The default setup of Shopware PaaS includes the following services.

 * Application Server
 * MySQL Database
 * Redis
 * Elasticsearch (by default not active)
 * RabbitMQ (by default not active)
 * Fastly

Shopware PaaS also comes with an application build pipeline that creates stateless artifacts of your application for deployment.