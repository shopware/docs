---
nav:
  title: Using the Vault
  position: 30
---

# Guide: Using the Shopware PaaS Vault

This guide explains how to securely manage secrets using the Shopware PaaS CLI Vault. You’ll learn how to create, retrieve, and delete secrets — including SSH keys — with practical examples.

## What is the Vault?

The Vault is a secure, centralized location to store sensitive data such as:

- Environment variables
- Build-time secrets
- SSH keys for accessing private Git repositories

Secrets stored in the Vault are reusable across all applications in your organization.

## Secret Types

| Type       | Description                                      |
|------------|--------------------------------------------------|
| `env`      | Runtime environment variables for your app       |
| `buildenv` | Build-time environment variables                 |
| `ssh`      | SSH keys for secure Git access                   |

## Creating a Secret

To create a secret interactively:

```sh
sw-paas vault create
```

You will be prompted to select a secret type, key, and value.

### Creating an SSH Key Secret

To generate and store an SSH key for deployments:

```sh
sw-paas vault create --type ssh
```

After generation, the CLI will output the public key. Add this to your Git hosting provider (e.g., GitHub under **Deploy Keys**).

## Retrieving a Secret

Secrets are accessed by their unique `secret-id`. You can retrieve a secret using:

```sh
sw-paas vault get --secret-id SECRET-ID
```

To list all secrets and find their IDs:

```sh
sw-paas vault list
```

## Deleting a Secret

To delete a secret from the Vault:

```sh
sw-paas vault delete --secret-id SECRET-ID
```

::: warning
This action is permanent. Ensure the secret is not in use before deleting it.
:::

## Example Workflow: Using SSH Keys

### Step 1: Generate and store an SSH key

```sh
sw-paas vault create --type ssh
```

### Step 2: Add the public key to GitHub as a deploy key

Navigate to your GitHub repository → Settings → Deploy Keys → Add Key.

### Step 3: List all secrets to verify

```sh
sw-paas vault list
```

### Step 4: Retrieve a specific secret

```sh
sw-paas vault get --secret-id ssh-abc123xyz
```

### Step 5: Delete a secret (when no longer needed)

```sh
sw-paas vault delete --secret-id ssh-abc123xyz
```

## Default Secrets & Ownership

The Shopware PaaS Vault contains both system-managed and user-managed secrets. Understanding the difference helps you identify which secrets you can manage and which are maintained by the platform.

### System-Managed vs. User-Managed Secrets

**System-managed secrets** are automatically created and maintained by Shopware PaaS for internal operations. While these secrets are visible when you run `sw-paas vault list`, they should not be modified or deleted as they are critical for platform functionality.

**User-managed secrets** are created by you for your application's specific needs, such as API tokens, database credentials, or SSH keys for private repositories.

### Common Secrets Reference

| Secret Name | Description | Managed By | Editable by User | Notes |
|-------------|-------------|------------|------------------|-------|
| `STOREFRONT_CREDENTIALS` | Internal storefront credentials | System | No | **Do not delete** - Required for storefront functionality |
| `GRAFANA_CREDENTIALS` | Grafana dashboard login credentials | System | No | **Do not delete** - Needed for `sw-paas open grafana` |
| `NATS_USER_CREDENTIALS` | NATS messaging user credentials | System | No | **Do not delete** - Required for internal messaging |
| `STOREFRONT_PROXY_KEY` | Storefront proxy authentication | System | No | **Do not delete** - Required for routing |
| `SSH_PRIVATE_KEY` | Deploy SSH key for repository access | User | Yes | See [SSH key workflow](#example-workflow-using-ssh-keys) |
| `SHOPWARE_PACKAGES_TOKEN` | Token for accessing Shopware packages | User | Yes | Watch for typo variants (e.g. missing underscore: `SHOPWAREPACKAGES_TOKEN`) |

::: info
System-managed secrets use the same retrieval mechanism as user-managed secrets, which is why they appear in your vault list. This is intentional to provide transparency into the credentials your environment is using.
:::

### Filtering Secrets by Application

By default, `sw-paas vault list` shows secrets across all applications in your organization, which can lead to duplicate entries if multiple apps use the same secret names.

To view secrets for a specific application:

```sh
sw-paas vault list --application-id YOUR-APP-ID
```

To find your application ID:

```sh
sw-paas application list
```

## Permissions & Behavior

::: danger
**Do not delete system-managed secrets.** Deleting secrets like `STOREFRONT_CREDENTIALS`, `GRAFANA_CREDENTIALS`, `NATS_USER_CREDENTIALS`, or `STOREFRONT_PROXY_KEY` will cause platform outages and break critical functionality.
:::

### System-Managed Secret Restrictions

System-managed secrets must be treated as read-only and must not be modified or deleted. The platform does not technically prevent you from changing or removing these secrets, but doing so is unsupported and will break critical platform functionality. They are essential for:

- Storefront operations and routing
- Monitoring and observability (Grafana)
- Internal messaging and communication (NATS)
- Platform infrastructure

If you believe a system-managed secret is incorrect or causing issues:

1. **Do not delete or modify the secret**
2. Document the issue, including the secret name and observed behavior
3. Contact Shopware PaaS support immediately
4. Do not attempt to work around system secrets by creating duplicates

### Secret History & Rollback

::: warning
**Important:** Shopware PaaS does not maintain version history for secrets. Once a secret is modified or deleted, the previous value cannot be recovered through the platform.
:::

Always back up critical secret values locally before making changes:

```sh
# Retrieve and save a secret locally before modifying
sw-paas vault get --secret-id SECRET-ID > backup-SECRET-NAME.txt
```

## Housekeeping & Legacy Secrets

### Identifying Legacy or Typo Secrets

Over time, your Vault may accumulate outdated or incorrectly-named secrets. Common issues include:

- **Typo secrets**: e.g. `SHOPWAREPACKAGES_TOKEN` instead of `SHOPWARE_PACKAGES_TOKEN`
- **Deprecated secrets**: No longer used by current application versions
- **Duplicate secrets**: Same secret created multiple times with different IDs

### Recommended Cleanup Process

1. **Audit your secrets**:

   ```sh
   sw-paas vault list --application-id YOUR-APP-ID
   ```

2. **Identify unused secrets**: Review each secret and confirm whether it's actively used by your application

3. **Back up before deletion**:

   ```sh
   sw-paas vault get --secret-id SECRET-ID > backup-SECRET-NAME.txt
   ```

4. **Delete unused secrets**:

   ```sh
   sw-paas vault delete --secret-id SECRET-ID
   ```

5. **Document the cleanup**: Keep a record of what was deleted and when for future reference

### Dealing with Typo Secrets

If you discover a secret with a typo in its name, you have two options:

**Option 1: Edit the existing secret (faster)**

1. Edit the secret to correct its name or value:

   ```sh
   sw-paas vault edit
   ```

2. Select the secret from the list and update its value as needed

3. Update your application to use the corrected secret name if it changed

4. Test thoroughly to ensure the updated secret works

**Option 2: Create a new secret and delete the old one**

1. Back up the typo secret's value:

   ```sh
   sw-paas vault get --secret-id TYPO-SECRET-ID > backup-typo-SECRET-NAME.txt
   ```

2. Create a correctly-named secret:

   ```sh
   sw-paas vault create
   ```

3. Update your application to use the correct secret

4. Test thoroughly to ensure it works

5. Delete the typo secret:

   ```sh
   sw-paas vault delete --secret-id TYPO-SECRET-ID
   ```

### Regular Maintenance

Establish a periodic review process:

- **Quarterly audit**: Review all user-managed secrets for relevance
- **Document ownership**: Maintain a record of which secrets are used by which applications

## Safety & Recovery

### Best Practices

1. **Always back up before deletion**:

   ```sh
   sw-paas vault get --secret-id SECRET-ID > $(date +%Y%m%d)-SECRET-NAME-backup.txt
   ```

2. **Rotate sensitive credentials regularly** (e.g., every 90 days):
   - Update API tokens and authentication credentials on a scheduled basis
   - Use the `sw-paas vault edit` command to quickly update credential values
   - Create new secrets and deprecate old ones for non-editable secret types

3. **Test changes in non-production environments first**

4. **Document secret purposes**: Add comments or maintain an external inventory

5. **Use descriptive names**: Choose clear, consistent naming conventions for your secrets

6. **Limit access**: Only share vault access with team members who need it

### What to Do If You Accidentally Delete a Secret

Since there is no built-in recovery mechanism:

1. **Check local backups** you may have created before deletion

2. **Review your application's configuration files** (if the secret was stored there temporarily during development)

3. **Regenerate the secret** if it's a token or credential that can be recreated:
   - For API tokens: Generate a new token from the service provider
   - For SSH keys: Create a new key pair and update deployment keys

4. **Contact support** if the deleted secret was critical and you have no backup

### Support Escalation

If you encounter issues that cannot be resolved with the above troubleshooting steps:

1. **Gather information**:
   - Secret name and ID
   - Application ID
   - Error messages or unexpected behavior
   - Steps to reproduce the issue

2. **Check system status**: Verify there are no ongoing PaaS incidents

3. **Contact Shopware PaaS support** with the gathered information
