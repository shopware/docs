---
nav:
  title: Account
  position: 15

---

# Account

An account represents your access to resources within the Shopware PaaS environment. The `sw-paas account` commands cover identity inspection, context management, human user memberships, service accounts for automation, and access tokens.

## Roles and memberships

To inspect your current identity and memberships, run:

```sh
sw-paas account whoami
```

The output shows the authenticated user and the organization, project, and application memberships currently attached to that user.

Human users can be granted access at three scopes:

* **Organization**
* **Project**
* **Application**

The available roles depend on the scope:

* **Organization:** `member`, `account-admin`
* **Project:** `read-only`, `developer`, `admin`
* **Application:** `read-only`, `developer`, `admin`

### Access inheritance

Access is rooted at the organization level.

To do anything in Shopware PaaS, a user must first be a member of the organization. Project and application access build on top of that organization membership rather than replacing it.

The inheritance model works from broader scope to narrower scope:

* an organization membership is the baseline for any further access
* an organization admin can also manage project- and application-level access within that organization
* a project admin also has the effective permissions needed at application level within that project

This means access becomes more specific as you move from organization to project to application, but it always starts with the organization.

## Context

Many account and resource commands ask for an `organization-id` and sometimes a `project-id`. To avoid repeating these values, you can store them in your local CLI context.

Set the context interactively:

```sh
sw-paas account context set
```

Display the current context:

```sh
sw-paas account context show
```

Remove the saved context:

```sh
sw-paas account context delete
```

The context is a local convenience feature only. It does not grant access by itself and does not affect permissions stored in the backend.

## Human user access

Human users are managed through `account user`. These commands are used to inspect memberships, grant direct access, revoke access, and let users request access themselves.

In practice, there are two common ways to grant human access:

* **Direct grant:** an existing account admin grants a membership directly with `sw-paas account user add`
* **Access request:** a user requests access themselves with `sw-paas account user request`, and an organization admin later approves or denies that request

The direct grant flow is useful when an admin already knows which user should get which role. The request flow is useful when users need to ask for access to an organization, project, or application on their own.

Even when access is granted at project or application level, the organization remains the parent scope for that access model.

Both direct grants and access requests can be limited in time. This is useful for short-lived access, for example when someone needs temporary permissions for debugging or incident analysis.

### Listing memberships

To list memberships at organization, project, or application level, run:

```sh
sw-paas account user list
```

The command supports interactive scope selection. You can also script it by passing explicit scope and IDs.

Depending on the membership state, the output may also show:

* the username of the member
* when the membership was created
* when the membership expires
* when the membership was revoked

Use `--include-revoked` to include revoked memberships in the result.

### Granting access directly

If you already have the required rights to manage memberships, you can grant access directly:

```sh
sw-paas account user add
```

For scripted usage:

```sh
sw-paas account user add --scope organization --organization-id <organization-id> --sub <user-sub> --role member
sw-paas account user add --scope project --organization-id <organization-id> --project-id <project-id> --sub <user-sub> --project-role developer
sw-paas account user add --scope application --organization-id <organization-id> --project-id <project-id> --application-id <application-id> --sub <user-sub> --app-role admin
```

You can optionally pass `--expires` to create time-limited access. When an expiry is set, later membership listings show when that access expires.

### Revoking access

To revoke an existing membership, run:

```sh
sw-paas account user remove
```

Revocation removes the active access. If revoked memberships are included in list output, the revoke time is shown as well.

## Membership requests

Users can request access themselves instead of being added directly by another user.

This is the usual flow:

1. A user creates a request for organization-, project-, or application-level access.
2. The request stays in `pending` state until it is reviewed.
3. An organization admin approves or denies the request.
4. If approved, the membership is created with the requested role.
5. If denied, no membership is created.

Create a request:

```sh
sw-paas account user request
```

You can request organization-, project-, or application-level access. The request stores the requested role and, if provided, the requested lifetime via `--expires`.

List your own requests:

```sh
sw-paas account user requests list
```

Organization admins can list requests for an organization with:

```sh
sw-paas account user requests list --admin --organization-id <organization-id>
```

Organization admins can then approve or deny a pending request:

```sh
sw-paas account user requests resolve
```

Requests move through the statuses `pending`, `approved`, and `denied`.

If an approved request was created with an expiry, that requested duration becomes the effective membership expiry and is shown in later membership listings.

## Service accounts

Service accounts are machine identities for automation such as CI/CD pipelines or deployment tooling. They are managed separately from human users and do not use `account user`.

Unlike human users, service accounts do not request access themselves. You create the service account first, then assign the permissions it needs through grants.

Create a service account:

```sh
sw-paas account service-account create
```

List service accounts:

```sh
sw-paas account service-account list
```

Update a service account description:

```sh
sw-paas account service-account update
```

Delete a service account:

```sh
sw-paas account service-account delete
```

### Service account grants

Service accounts receive access through grants.

List grants:

```sh
sw-paas account service-account grant list
```

Add a grant:

```sh
sw-paas account service-account grant add
```

For organization-scoped service accounts, grants are usually managed through named policies. To inspect the available managed policies:

```sh
sw-paas account service-account grant policies
```

Example:

```sh
sw-paas account service-account grant add \
  --service-account-id <service-account-id> \
  --organization-id <organization-id> \
  --project-id <project-id> \
  --policy project:deployer
```

Revoke a grant:

```sh
sw-paas account service-account grant revoke
```

Grants can also be time-limited via `--expires`. Grant listings can show when a grant expires and, when revoked grants are included, when a grant was revoked.

## Authentication tokens

The `token` command manages access tokens for either your own account or a service account.

### Personal tokens

Create a personal access token:

```sh
sw-paas account token create
```

List your personal tokens:

```sh
sw-paas account token list
```

Revoke one of your personal tokens:

```sh
sw-paas account token revoke
```

### Service account tokens

To manage tokens for a service account, pass `--service-account-id`:

```sh
sw-paas account token create --service-account-id <service-account-id>
sw-paas account token list --service-account-id <service-account-id>
sw-paas account token revoke --service-account-id <service-account-id>
```

Tokens can be created with `--expires` to limit their lifetime. Token listings show whether a token has been revoked and when it expires.
