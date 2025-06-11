---
nav:
  title: Managing organizations
  position: 25
---

# Organization

The `organization` command allows you to manage organizations, which serve as the top-level container representing a company or entity in Shopware PaaS Native. Each organization can contain multiple projects. Admin users within an organization can manage user access through the `account` commands.

## Usage

```sh
sw-paas organization [command]
```

**Aliases:**
`organization`, `org`

## Commands

### Creating an Organization

Use this command to create a new organization. Only users with appropriate permissions can perform this action.

**Usage:**

:::info
It's recommended to choose a clear and distinct name for your organization, as it will be visible across your teams and projects.
:::

```sh
sw-paas organization create --name "Awesome GmbH"
```

### Retrieving an Organization

Fetch details of a specific organization using its unique identifier.

**Usage:**

```sh
sw-paas organization get --organization-id org-123
```

**Flags:**

- `--organization-id`: ID of the organization to retrieve.

### Listing All Organizations

Displays a list of all organizations you are a part of, including relevant metadata such as ID and name.

**Usage:**

```sh
sw-paas organization list
```
