---
nav:
  title: Repository Access
  position: 20
---

## Setting Up Repository Access via Deploy Keys

To enable Shopware PaaS to access your private Git repository, you must configure an **SSH deploy key**. This key allows the platform to securely clone your code during deployments.

Regardless of whether you use the CLI or set things up manually, you must **add the public SSH key to your repository**.

### Option 1: Automated Setup via PaaS CLI

For a quicker setup, you can use the PaaS CLI to automatically generate and register the key:

```sh
sw-paas vault create --type ssh
```

By default, this command stores the key at the **organization level**, making it available to all projects within the org. To limit the key to a specific project, use the `--project` flag:

```sh
sw-paas vault create --type ssh --project <project-id>
```

After running the command, copy the generated public key and add it to your Git repository's **Deploy keys** section (see instructions below).

### Option 2: Manual Setup

If you prefer full control over the SSH key creation process, follow these steps:

#### 1. Generate a Passwordless SSH Key Pair

Run the following command to generate an RSA key pair in PEM format:

```bash
ssh-keygen -t rsa -b 4096 -m PEM -f ./sw-paas
```

:::info
Alternative algorithms like **ED25519** and **ECDSA** are also supported, provided the key is **passwordless** and the **private key is in PEM format**.
:::

#### 2. Add the Public Key to Your Repository

Open the file `sw-paas.pub`, copy its contents, and add it as a **read-only deploy key** in your Git repository:

- **GitHub**: Go to your repository `Settings` → `Deploy keys`
- **GitLab**/**Bitbucket**: Look for the equivalent "Deploy keys" section in your repository settings
  Be sure to enable **read-only access**.

#### 3. Store the Private Key in the Vault

Once the public key is added to your repo, store the corresponding private key in the Shopware PaaS Vault:

```bash
cat sw-paas | sw-paas vault create --type ssh --password-stdin
```

You can store the key at either:

- **Organization level**: Shared across all projects.
- **Project level**: Dedicated to a single project (takes precedence over the org-level key).

:::warning
Only one SSH key can be stored per level (organization or project). You may name the key freely, but keep in mind that a project-level key **overrides** an organization-level one during deployments.
:::
