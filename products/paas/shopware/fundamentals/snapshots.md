---
nav:
  title: Snapshots
  position: 65
---

# Snapshots

Snapshots provide backups of application deployments. Each snapshot consists of a compressed archive containing the application assets and a database dump.

Use the `sw-paas snapshot` commands to create, inspect, restore, download, and delete snapshots. If
you omit resource identifiers, the CLI prompts you to select the organization, project, application,
deployment, or snapshot where required.

## Create a snapshot

Create a snapshot of an application deployment:

```sh
sw-paas snapshot create
```

You can select a deployment and add an optional description directly:

```sh
sw-paas snapshot create \
  --deployment-id <deployment-id> \
  --description "Before updating Shopware"
```

## List snapshots

List the snapshots for an application deployment:

```sh
sw-paas snapshot list
```

To include deleted snapshots in the output, use the `--include-deleted` option:

```sh
sw-paas snapshot list --include-deleted
```

## Get snapshot details

Display the details of a snapshot:

```sh
sw-paas snapshot get --snapshot-id <snapshot-id>
```

## Restore a snapshot

Restore an application deployment from a snapshot:

```sh
sw-paas snapshot restore --snapshot-id <snapshot-id>
```

## Get a snapshot download URL

Generate a URL for downloading a snapshot archive:

```sh
sw-paas snapshot download-url --snapshot-id <snapshot-id>
```

## Delete a snapshot

Delete a snapshot:

```sh
sw-paas snapshot delete --snapshot-id <snapshot-id>
```

## Select resources by name

All snapshot commands support selecting an organization, project, and application by name:

```sh
sw-paas snapshot list \
  --organization <organization-name> \
  --project <project-name> \
  --application <application-name> \
  --deployment-id <deployment-id>
```

When using a strictly scoped service account token, use resource IDs instead of names or grant the
service account the policies required for name resolution. For more information, see
[Service accounts](./account.md#service-accounts).
