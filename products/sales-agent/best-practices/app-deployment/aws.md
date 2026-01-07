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

## Deploy

- Login to the AWS Amplify Hosting Console.
- Create a new app in AWS Amplify.
- Select and authorize access to your Git repository provider and select the main branch (it will auto deploy when there are some changes in the main branch).
- Choose a name for your app and make sure build settings are auto-detected.
- Set Environment variables which are declared in `.env.template` under the Advanced Settings section.
- Confirm the configuration and click on "Save and Deploy".

## Custom domain

After deploying your code to AWS Amplify, you may wish to point custom domains (or subdomains) to your site. AWS has an [instruction](https://docs.aws.amazon.com/amplify/latest/userguide/custom-domains.html).
