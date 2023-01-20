# Hosting your App

When you plan to build an app, there will come a point when you have to consider which kinds of server infrastructure you will need. This article is a starting point, so you can investigate further and make an informed decision.

## Does your app need hosting

Not all apps need hosting. If your app requires a server depends on the kinds of functionalities that it uses.

- **Features that require a server**
  - [Custom Modules](../administration/add-custom-modules)
  - [Action Buttons](../administration/add-custom-action-button)
  - [Webhooks](../app-base-guide#webhooks)
  - [Payment Processing](../payment)
- **Features that work without a server**
  - [Themes](../storefront/apps-as-themes)
  - [Template changes](../storefront/)
  - [CMS Blocks](../content/cms/add-custom-cms-blocks)
  - [App configuration](../configuration)
  
## Hosting options

Modern server providers offer several ways to host web based applications. Booking such a hosting is often tied to different tiers of resources available to you. These are generally measured in units like the amount of virtual CPUs and gigabytes of RAM and billing intervals are per millisecond, hour or month. Here are the most common options starting with the most labor-intensive.

### Dedicated server

A dedicated server is a classic way to host performance critical applications. With this model, you rent one or several pieces of hardware from your provider. This is cheaper if your order compute and memory resources in bulk. But this model also has the drawback of high management overhead. With a dedicated server, you are responsible for the operating system and software upgrades, as well as backups.

### Infrastructure as a Service

So-called IaaS providers provide a solid layer of abstraction over dedicated hosting solutions. With an IaaS model, you are no longer forced to rent physical pieces of hardware but rather virtual machines with configurable amounts of computing power and memory. Another improvement is the availability of so-called managed services, like databases, object storage, and queues. These services allow you to off-load maintenance, backups, and availability to the cloud provider so that you can concentrate on using these services.

Be aware that even though IaaS solutions massively reduce the amount of application management, it still requires you to keep an overview of your servers and services and how they are networked together.

### Platform as a Service

The next step in abstraction is the PaaS providers. They allow you to declare the resources you need in a few configuration files. Once the config is set up, they take care of getting your code up and running on their infrastructure. They not only provide managed services like databases for you, they also help with deploying your application and creating several environments for production, staging, and testing use. Many PaaS providers use git to integrate directly with development workflows. This is also in contrast to IaaS providers where it is your
responsibility to provide deployables.

### Serverless

Serverless services, also called function as a service, provide the most elastic way to scale your application. A serverless solution treats your application code as a function that is called with some input parameters. In the case of a web application, the "function" takes a HTTP request and returns a response that is then passed to the client.

This is reflected by the way serverless solutions often directly take source code and then take care of distributing it. This makes serverless applications very scalable due to the fact that the service provider takes care to boot a runtime for your code and as many parallel runtimes as are necessary to handle large loads. This approach abstracts away any notion of reserved resources, billing is handled by the millisecond, hence the name serverless.

This makes this approach the easiest to get started quickly, at least in theory. Keep in mind that in real world applications, things like databases even as managed services, are still often modeled as reserved resources. Also, it is necessary to take care of a dedicated entry point to map incoming requests to the function as a service model.

This is where tools like ["Serverless Framework"](https://serverless.com/) come into play to help you. It allows you to manage the lifecycle of your serverless application in many languages and on all big FaaS providers. It is optimized to be used with continuous integration, allowing for automated deployments.

## Pricing

To give you an example of the potential costs of hosting an app we have provided the following example calculation:

Let's assume your app is a PHP application on platform.sh, and it generates a revenue of 5\$ per user per month. This means that with 50 users, that app makes 205\$ a month. A standard plan on platform.sh costs 50\$ a month and provides 0.96 vCPU and 0.8 GB of RAM. According to the [symfony benchmark](http://www.phpbenchmarks.com/en/benchmark/symfony/5.0) a REST API built with Symfony can handle about 6000req/s on a machine with 32 GB RAM and 32GB of RAM. So considering a real world application is between 5 and 10 times slower than the benchmark, it leaves the standard plan to handle roughly between 50-100req/s or about one request per user every second.

Keep in mind, though, that this example is a very theoretical calculation. How much computational power your app needs is specific to the kinds of work it does and its tech stack. But we hope it provides some orientation.
