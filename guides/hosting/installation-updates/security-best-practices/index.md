---
nav:
  title: Security Best Practices
  position: 25

---

# Security Best Practices

This guide describes recommended security practices and how responsibilities differ by hosting model.
For a more detailed list of Shopware's security mechanisms and how to configure them, see the [security reference](../../../../resources/references/security.md).
If you suspect an attack, follow the [incident response guide](incident-response.md) immediately.

## Understand your responsibilities

With **Shopware SaaS**, Shopware operates and secures the platform and its infrastructure, including automatically applying platform updates and security patches.
You do not need to manage servers or install the Security Plugin yourself.

With **[Shopware PaaS Native](../../../../products/paas/shopware/index.md)**, Shopware manages the underlying infrastructure, including servers, networking, managed databases, and platform backups.
A [web application firewall](../../../../products/paas/shopware/cdn/security-features.md) is enabled and configured by default.
You or your agency remain responsible for the application: testing and deploying [Shopware updates](../../../../products/paas/shopware/guides/update-shopware.md), Security Plugin and other extension updates, Composer dependency updates, and security fixes to your custom code.
Managed infrastructure and a firewall do not replace these application updates.

In both models, you remain responsible for your configuration, access and user management, and the security of external apps and integrations you operate or connect.
See section 29.2 of the [Shopware terms and conditions](https://www.shopware.com/en/gtc/) for the responsibility boundary.
For **self-hosted installations**, you or your hosting provider also manage infrastructure security.

The application update and extension recommendations below apply to self-hosted and PaaS Native shops.
Infrastructure maintenance applies to the services you operate yourself.

## Stay on a supported Shopware version

Run a Shopware version that is still receiving security updates.
Check the [release calendar](https://developer.shopware.com/release-notes/#release-calendar) to see which versions are supported and how security fixes are delivered.
If your Shopware version is approaching its end of life, plan and complete an upgrade to a supported version before security support ends.
Apply security updates promptly and keep your extensions and Composer dependencies up to date.

## Keep the Security Plugin installed

Always keep a compatible version of the Security Plugin installed, activated, and up to date, even when Shopware itself is fully updated.
Having the plugin in place makes it easier to apply the next security update without waiting for a complete platform update.
The plugin does not replace regular Shopware updates or extend security support for versions that have reached their end of life.

See the [Security Plugin](security-plugin.md) guide for compatibility, installation, and details about the fixes it provides.

## Keep your infrastructure supported

For infrastructure you operate yourself, run supported versions of your operating system, PHP, database, web server, search engine, and cache or message queue services.
Apply their vendors' security updates and check the [recommended stack and supported versions](../../index.md#recommended-stack-and-supported-versions) for compatibility with Shopware.

Use PHP 8.4 or later on a compatible Shopware release, and keep it updated to the latest patch version of a supported PHP branch.
PHP 8.4 introduced [driver-specific PDO SQL parsers](https://wiki.php.net/rfc/pdo_driver_specific_parsers), which protect against some [SQL injection techniques caused by parsing mismatches in older PHP versions](https://www.slcyber.io/research/a-novel-technique-for-sql-injection-in-pdos-prepared-statements).
This is an additional protection layer and does not replace security fixes in Shopware or its extensions.
On PaaS Native, select supported, compatible PHP and database versions in your [application configuration](../../../../products/paas/shopware/fundamentals/application-yaml.md) and deploy the change.

## Manage extensions through deployments

Consider disabling runtime extension management in production and managing extensions solely through Composer and a separate build and deployment process.
On PaaS Native, runtime extension management is already disabled; extensions must be managed through Composer and deployments, as described in the [PaaS Native FAQ](../../../../products/paas/shopware/faq.md).

Runtime plugin installation allows PHP code to be added to the running shop.
An attacker who gains access to an account with extension installation privileges can use this capability to execute malicious code on the shop server.
Disabling runtime extension management reduces this route from account compromise to remote code execution.

As an additional benefit, managing extensions through deployments makes it easier to test new plugins and plugin updates in staging and catch compatibility issues before they affect your production shop.

See [Extension Management](../extension-management.md) for the Composer workflow and the configuration to make the Administration's Extension Manager read-only.

Use this deployment process for Security Plugin updates as well, and treat relevant security releases as urgent.
Test and deploy them as soon as possible; do not wait for the next routine feature release or maintenance window.

## Manage Administration users and API access

Create a separate Administration account for each person and never share login credentials.
Review accounts and roles regularly in [Users & Permissions](https://docs.shopware.com/en/shopware-6/configuration/settings/system/user/) or [Users & Permissions for SaaS](https://docs.shopware.com/en/shopware-6/in-the-cloud/saas/user-saas/).
Remove access promptly when an employee leaves, an agency engagement ends, or a temporary account is no longer needed.
Give users and integrations only the permissions they need, and reserve full administrator access for tasks that require it.

Require long, unique passwords for local Administration accounts.
Where Shopware manages these passwords, consider setting **Minimum password length (log-in)** to [at least 15 characters](https://pages.nist.gov/800-63-4/sp800-63b.html#passwordver) under **Settings → System → Users & Permissions → Configuration**.
The setting applies when a password is set or changed.
If you raise the minimum, ask users with shorter passwords to update them.

[Create a dedicated integration](https://docs.shopware.com/en/shopware-6/configuration/settings/system/integrationen/#create-integration) for each external application and environment.
Give each integration a recognizable name and record who owns it, so you know whom to contact and which application will be affected if you revoke access.
Store security keys in a secrets manager and keep them out of source code, tickets, and logs.
Remove [integrations](https://docs.shopware.com/en/shopware-6/configuration/settings/system/integrationen/#manage-integration) and [user access keys](https://docs.shopware.com/en/shopware-6/configuration/settings/system/user/#integrations) when they are no longer needed.

If you suspect a key has been exposed, revoke it promptly.
For an integration you still need, [regenerate its API access key](https://docs.shopware.com/en/shopware-6/configuration/settings/system/integrationen/#edit-integration) and update the connected application with both the new access ID and the new security key.
If you suspect someone used the exposed key, follow the [incident response guide](./incident-response.md) to investigate and invalidate any affected sessions or tokens that have already been issued.
