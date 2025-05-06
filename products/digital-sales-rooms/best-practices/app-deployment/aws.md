---
nav:
   title: AWS
   position: 20

---

# Deploy with AWS Amplify

In this chapter, you will learn how to deploy the frontend source code to [AWS Amplify](https://aws.amazon.com/amplify/).

## Prerequisites

* Register an AWS account.
* Clone the frontend source code and push it to your GitHub repository.
  * Download the plugin zip. After extracting it, you will find it inside `/templates/dsr-frontends`.
* Push source code to your Git repository.

## Deploy

* Login to the AWS Amplify Hosting Console.
* Create a new app in AWS Amplify.
* Select and authorize access to your Git repository provider and select the main branch (it will auto deploy when there are some changes in the main branch).
* Choose a name for your app and make sure build settings are auto-detected.
* Set Environment variables under the Advanced Settings section.
  * Add `SHOPWARE_STORE_API`, `SHOPWARE_ADMIN_API`, `SHOPWARE_STORE_API_ACCESS_TOKEN`, `SHOPWARE_STOREFRONT_URL`, `ORIGIN` variables with appropriate values.
* Confirm the configuration and click on "Save and Deploy".

## Custom domain

After deploying your code to AWS Amplify, you may wish to point custom domains (or subdomains) to your site. AWS has an [instruction](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html).

## Configure sales channel domain

Your website is ready, and you should have a frontend app domain. Please use the current domain to configure [sales channel domain](../../configuration/domain-config.md).
