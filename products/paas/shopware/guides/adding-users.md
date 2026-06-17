---
nav:
  title: Adding users to the Organization
  position: 10
---

# Adding users to the Organization

Giving someone access to an organization always involves **two people**:

- **The requester** — the person who wants access.
- **The account-admin** — an organization member with the `account-admin` role who grants that access.

---

## Method 1: Add a user via their user ID (recommended)

This is the easiest way. The requester already knows their own user ID (the `sub` field), so they just hand it to the account-admin.

**Step 1 — Requester: find your user ID.**

```sh
sw-paas account whoami
```

This prints the `sub` (subject ID) value. Copy it.

**Step 2 — Requester: share the user ID.**
Send the `sub` value to the account-admin (chat, email, etc.).

**Step 3 — Account-admin: add the user.**

```sh
sw-paas account user add --sub "<user-id of the new user>"
```

The CLI grants the user access at the chosen level.

**Step 4 — Account-admin: confirm it worked.**

```sh
sw-paas account user list
```

The new user should appear in the list.

---

## Method 2: Request access via the organization-id

Use this when the requester should ask for access and the account-admin approves it. The requester does not know the `organization-id`, so the account-admin shares it first.

**Step 1 — Account-admin: find and share the organization-id.**

```sh
sw-paas organization get
```

Copy the `organization-id` and send it to the requester.

**Step 2 — Requester: request access.**

```sh
sw-paas account user request
```

The CLI asks for the `organization-id` from Step 1.

**Step 3 — Account-admin: approve the request.**

```sh
sw-paas account user requests resolve
```

The CLI walks you through choosing the pending request and approving it. Once approved, the access is active.

The requester can check the status of their request anytime:

```sh
sw-paas account user requests list
```

---

## Removing a user

To revoke access later, the account-admin runs:

```sh
sw-paas account user remove
```

---

For more on accounts and roles, see the [account guide](../fundamentals/account.md).
