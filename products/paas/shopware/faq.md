---
nav:
  title: Frequently Asked Questions
  position: 50
---

## Frequently Asked Questions

### Can I roll back my deployment if I lose my git history?

For now, no rollback is possible when you do a force push and lose your git history

### Is it possible to write to the local filesystem?

No, all containers are stateless, and local file writes are discouraged. Persistent storage must use S3 buckets or other external storage solutions.

### How can I connect my already deployed application to a new branch?

The application that you create is linked to a commit SHA and not to a branch. You can change the existing application commit SHA by running `sw-paas application update`. What matters is the commit configured for a given application.

### Why can't I manage extensions in the Shopware Administration?

Plugin management via the Administration interface is not supported in PaaS because the platform runs in a high-availability (HA) and clustered environment. In such setups, local changes aren't feasible, as all instances must remain identical and stateless. To ensure consistency across all deployments, plugins must be installed or updated via Composer, as part of the project’s codebase. You need to install or update extensions [via Composer](./../../../guides/hosting/installation-updates/extension-managment.html#installing-extensions-with-composer).

### Can I run different applications like Node.js?

No, currently PaaS is limited to Shopware projects.

### How are secrets managed in PaaS?

Secrets are stored in the PaaS secret store and can be applied at the organization, project, or application level. They are encrypted in the database and decrypted only when accessed via the CLI.

### Can I access the database directly?

Yes. Follow the guide on [open command](./CLI/open).

### Can I customize the infrastructure (e.g., change web server configurations)?

No, the infrastructure is opinionated and pre-configured. Customizations at the server level are not allowed.

### Are CDN or database configurations customizable?

No, PaaS uses Fastly as the CDN and provides a fixed database configuration at the moment. Customizations to these resources are currently under development.

### Can I host my custom applications?

Custom applications and decoupled storefront hosting will be evaluated based on customer needs but are not currently supported.

### What is the difference between `exec` and `command` ?

1. **Container Management**:

   - `exec`: Uses an existing container and provides an interactive shell
   - `command`: Spins up a new container specifically for the command execution

2. **Execution Mode**:

   - `exec`: Interactive and synchronous
   - `command`: Non-interactive and can be asynchronous

3. **Use Cases**:
   - `exec`: Best for debugging, maintenance, and interactive work
   - `command`: Best for automation, CI/CD, and scheduled tasks

### Can I connect to my PaaS instance via SSH

Yes, you can connect to your PaaS instance — but not via traditional SSH. Instead, we provide a remote terminal session through the `sw-paas exec` command. This command allows you to execute shell commands inside your PaaS environment remotely, effectively giving you SSH-like access for troubleshooting, deployments, or interactive sessions. You can find the detailed guide on how to use `sw-paas exec` in the [documentation here](../shopware/CLI/exec).

### Where can I see the status of my PaaS application update?

You can see the status of your PaaS application by running `sw-paas application list`. This command shows the current status of your application, including whether the update was successful or if it's still in progress. See more in the [documentation here](../shopware/CLI/applications). To monitor all real-time events associated with the project and its applications run `sw-paas watch` this provides a live stream of events and is especially useful for tracking the progress of an ongoing update. [Learn more here](../shopware/CLI/watch).
