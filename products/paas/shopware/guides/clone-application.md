---
nav:
  title: Clone Application
  position: 70
---

# Guide: Clone Application in PaaS Native

This guide explains how to clone an application in Shopware PaaS Native. Cloning creates a copy of an existing application, including its codebase and data, to a new application within the same organization.

**Important**: Cloning can only take place between applications within the same organization. You cannot clone applications across different organizations.

The cloning process works by creating a snapshot of the source application and then restoring that snapshot to the target application.

## Use Cases

Common scenarios for cloning applications include:

- **Feature testing**: Clone an application to test new features without affecting the original
- **Disaster recovery**: Create backups by cloning applications to different projects
- **Development environments**: Clone production data to development environments for realistic testing

## Prerequisites

Before cloning an application, ensure that:

- Both the source and target applications are within the same organization
- You have access to both the source and target projects
- The target application already exists (or you have permissions to create it)
- The latest deployment of the source application was successful (state: `DEPLOYING_STORE_SUCCESS`)

You can check the deployment status with the following command:

```shell
sw-paas app deploy list
```

If the state is `DEPLOYING_STORE_FAILED`, you should **NOT** proceed with cloning. Fix the deployment issues first or proceed with an earlier deployment that was successful.

## Clone Process

### Interactive Mode

If you run the clone command without any parameters, the CLI will guide you through an interactive selection process:

```shell
sw-paas application clone
```

The interactive mode will prompt you to select:

1. **Source application selection**:
   - Organization (if you have access to multiple)
   - Project within the organization
   - Application within the project
   - Deployment

2. **Target application selection**:
   - Project within the same organization (only projects from the selected organization will be shown)
   - Application within the project (the target application must already exist)

This interactive mode is recommended if you're unsure about the specific IDs or prefer a guided experience.

### Manual Mode

If you know the specific IDs, you can provide them directly as command-line flags:

```shell
sw-paas application clone \
  --organization-id <organization-id> \
  --project-id <source-project-id> \
  --application-id <source-application-id> \
  --target-application-id <target-application-id> \
  --target-project-id <target-project-id>
```

### How Cloning Works

The cloning process happens in two stages:

1. **Snapshot creation**: The system creates a snapshot of the source application, including its database and filesystem data
2. **Snapshot restoration**: The snapshot is then restored to the target application, overwriting any existing data

This ensures that the target application receives an exact copy of the source application's state at the time of the selected deployment.

### Monitor Clone Progress

After initiating the clone, you can monitor the progress using:

```shell
sw-paas app deploy list
```

Or get detailed information about a specific deployment:

```shell
sw-paas app deploy get
```

The clone operation may take some time depending on the size of the application data. Wait until the deployment status shows `DEPLOYING_STORE_SUCCESS` before considering the clone complete.

## Post-Clone Tasks

After the clone is successfully completed, you may need to:

1. **Update application configuration**: Review and adjust any environment-specific settings in the cloned application
2. **Configure domains**: Set up custom domains for the cloned application if needed
3. **Update secrets**: Ensure all necessary secrets and environment variables are configured for the new application
4. **Test the cloned application**: Verify that the cloned application is working correctly before using it in production
