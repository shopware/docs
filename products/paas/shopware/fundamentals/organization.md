---
nav:
  title: Organizations
  position: 20
---

# Organizations

An organization serves as the top-level container representing a company or an entity in Shopware PaaS Native. It acts as the primary organizational unit that encompasses all resources, projects, and users associated with a particular business entity. By default, the initial admin user is added to an Organization and can further add more users.

To create additional organizations via CLI, run;

```sh
sw-paas organization create
```

## Organization Members

Organization members are users who have been granted access to an organization and its resources.

### Roles

Organization members can be assigned different roles that determine their level of access and permissions:

- `read-only`: Access to projects and applications. Only actions allowed are `get` and `list`.
- `developer`: Access to projects and applications. All actions are allowed.
- `project-admin`: Access to projects and applications. All actions are allowed.
- `account-admin`: Access to account management. Actions for managing users are allowed.

### User Management

If you already have the `project-admin` role and wish to add additional users to your organization, they can share their **user ID (sub-id)** with you. You can instruct them to retrieve it using the following command:

```sh
sw-paas account whoami --output json
```

Or, if they have `jq` installed for easier parsing:

```sh
sw-paas account whoami --output json | jq ".sub"
```

Once you receive their `sub` (subject ID), you can proceed to add them to your organization with the appropriate role.

```sh
sw-paas organization user add
```

To remove a user from the organization:

```sh
sw-paas organization user remove
```
