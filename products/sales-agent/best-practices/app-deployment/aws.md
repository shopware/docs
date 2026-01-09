---
nav:
  title: AWS
  position: 20
---

# Deploy with AWS Amplify

In this chapter, you will learn how to deploy the frontend source code to [AWS Amplify](https://aws.amazon.com/amplify/).

## Prerequisites

- Register an AWS account.
- Clone the frontend source code and push it to your Git repository (for example, GitHub).

## Setup Redis with Amazon ElastiCache

AWS Amplify does not include Redis by default. To use Redis for caching, you need to set up [Amazon ElastiCache](https://aws.amazon.com/elasticache/) or use an external Redis provider.

### Option 1: Amazon ElastiCache

Amazon ElastiCache is a fully managed in-memory data store service compatible with Redis.

1. Navigate to the [ElastiCache Console](https://console.aws.amazon.com/elasticache/).
2. Click "Create" and select "Redis OSS" as the cluster engine.
3. Configure your cluster settings (node type, number of replicas, etc.).
4. Configure security groups to allow access from your Amplify application.
5. Once created, note the **Primary Endpoint** for your Redis connection.

::: warning
ElastiCache runs within a VPC. Connecting from AWS Amplify (which runs outside VPC by default) requires additional configuration such as VPC peering or using a public endpoint. For serverless applications, consider using Option 2.
:::

### Option 2: Serverless Redis providers

For easier integration with serverless deployments like AWS Amplify, consider using:

- [Upstash](https://upstash.com/) - Serverless Redis with REST API support, ideal for edge/serverless environments.
- [Redis Cloud](https://redis.com/cloud/overview/) - Managed Redis with public endpoints.

These providers offer public endpoints that work seamlessly with AWS Amplify without VPC configuration.

## Deploy

- Login to the AWS Amplify Hosting Console.
- Create a new app in AWS Amplify.
- Select and authorize access to your Git repository provider and select the main branch (it will auto-deploy when there are some changes in the main branch).
- Choose a name for your app and make sure build settings are auto-detected.
- Set Environment variables which are declared in `.env.template` under the Advanced Settings section.
- Confirm the configuration and click on "Save and Deploy".

## Custom domain

After deploying your code to AWS Amplify, you may wish to point custom domains (or subdomains) to your site. AWS has an [instruction](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html).
