---
nav:
  title: Frequently Asked Questions
  position: 50
---

# Frequently Asked Questions

## Can I roll back my deployment if I lose my git history?

For now, no rollback is possible when you do a force push and lose your git history

## Is it possible to write to the local filesystem?

No, all containers are stateless, and local file writes are discouraged. Persistent storage must use S3 buckets or other external storage solutions.
Changes to the filesystem and Shopware code must be made directly in the Git repository.

## Is Shopware PaaS Native available on Azure or Google Cloud Platform?

No, Shopware PaaS Native currently runs on AWS only.

## How can I connect my already deployed application to a new branch?

The application that you create is linked to a commit SHA and not to a branch. You can change the existing application commit SHA by running `sw-paas application update`. What matters is the commit configured for a given application.

## Can I run different applications like Node.js?

No, currently PaaS is limited to Shopware projects.

## How are secrets managed in PaaS?

Secrets are stored in the PaaS secret store and can be applied at the organization, project, or application level. They are encrypted in the database and decrypted only when accessed via the CLI.

## Can I access the database directly?

Yes. Follow the guide on [databases](./resources/databases.md).

## Can I customize the infrastructure (e.g., change web server configurations)?

No, the infrastructure is opinionated and pre-configured. Customizations at the server level are not allowed.

## Can I protect an application with basic auth?

Basic auth is not recommended because it can lead to unexpected behavior in the platform setup. To restrict access temporarily, use Shopware maintenance mode instead.

## Are CDN or database configurations customizable?

No, PaaS uses Fastly as the CDN and provides a fixed database configuration at the moment. Customizations to these resources are currently under development.

## Can I host my custom applications?

Custom applications and decoupled storefront hosting will be evaluated based on customer needs but are not currently supported.

## What is the difference between `exec` and `command` ?

1. **Container Management**:

   - `exec`: Uses an existing container and provides an interactive shell
   - `command`: Spins up a new container specifically for the command execution

2. **Execution Mode**:

   - `exec`: Interactive and synchronous
   - `command`: Non-interactive and can be asynchronous

3. **Use Cases**:
   - `exec`: Best for debugging, maintenance, and interactive work
   - `command`: Best for automation, CI/CD, and scheduled tasks

## Can I connect to my PaaS instance via SSH?

Yes, you can connect to your PaaS instance — but not via traditional SSH. Instead, we provide a remote terminal session through the `sw-paas exec` CLI command. This command allows you to execute shell commands inside your PaaS environment remotely, effectively giving you SSH-like access for troubleshooting, deployments, or interactive sessions.

## Where can I see the status of my PaaS application update?

You can see the status of your PaaS application by running `sw-paas application list`. This command shows the current status of your application, including whether the update was successful or if it's still in progress. To monitor all real-time events associated with the project and its applications run `sw-paas watch` this provides a live stream of events and is especially useful for tracking the progress of an ongoing update.

## Are deployments zero downtime?

Yes. Deployments are designed to be zero downtime and use Kubernetes rolling updates.

## In what order do deployment steps run?

Database migrations run first. After that, the remaining deployment flow is handled by the [deployment helper](../../../guides/hosting/installation-updates/deployments/deployment-helper#execution-flow).

## Can I configure pre-deployment and post-deployment hooks?

Yes. Use the [deployment helper](../../../guides/hosting/installation-updates/deployments/deployment-helper#configuration) to define deployment hooks.

## Can I automate deployments from CI/CD?

Yes. The CLI supports non-interactive execution and machine-to-machine authentication with tokens, so you can trigger builds and deployments from your CI/CD system.

## Can my build contact external services?

Yes. Builds run as regular Docker builds and can contact external endpoints when required, for example configured Composer repositories.

## Are database copies anonymized when cloning an application?

No. Cloning restores an exact snapshot of the source application's database and filesystem data. Anonymization is not currently supported.

## How often does the scheduler run scheduled tasks?

The platform runs the scheduler every 5 minutes.

## Can I configure additional queues?

No. Creating additional queues is not currently supported.

## Are OpenSearch and Grafana protected by SSO?

No. Single sign-on for tools such as Grafana and OpenSearch is not available at this stage.

## Are Blackfire or Tideways included?

No. Tideways and Blackfire are not currently supported as part of the platform.

## Are load tests provided by Shopware PaaS Native?

No, managed load testing is not currently provided as part of the platform.

## How many projects or applications can I create?

The available number depends on the booked plan for your organization.

## How do I request infrastructure changes or support?

Infrastructure change requests and support requests are handled through the standard ticketing process. Agencies can coordinate those requests together with the customer. In some setups, a dedicated Slack channel may also be available for faster coordination.

## Why do I see “Runtime extension management is disabled” when trying to purchase extensions in the admin?

When trying to purchase an extension via the in-app store, the admin shows the error “Runtime extension management is disabled.” Even after setting runtime_extension_management: true in `config/packages/z-shopware.yaml` and deploying, the error will persist.

This behavior is intentional. Runtime extension management is deliberately disabled in the Shopware Admin UI when using PaaS due to its ephemeral nature and cannot be enabled by changing the runtime_extension_management configuration.

To use the in-app extension store, the `SwagExtensionStore` plugin must be installed via Composer. Once this extension is installed, the Shopware Admin can connect to the extension store and allow in-app purchases.
