---
nav:
  title: Clone Application
  position: 70
---

# Clone Application in PaaS Native

This guide explains how to clone an application in Shopware PaaS Native. Cloning creates a copy of an existing application, including its codebase and data, to a new application within the same organization.

:::info
Cloning can only take place between applications within the same organization. You cannot clone applications across different organizations.
:::

The cloning process works by creating a snapshot of the source application and then restoring that snapshot to the target application.

## Use cases

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

:::warning
If the state is `DEPLOYING_STORE_FAILED`, you should **NOT** proceed with cloning. Fix the deployment issues first or proceed with an earlier deployment that was successful.
:::

## Clone an application

You can clone an application using either interactive mode or manual mode

### Interactive mode

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

### Manual mode

If you know the specific IDs, you can provide them directly as command-line flags:

```shell
sw-paas application clone \
  --organization-id <organization-id> \
  --project-id <source-project-id> \
  --application-id <source-application-id> \
  --target-application-id <target-application-id> \
  --target-project-id <target-project-id>
```

## Clone process

The cloning process happens in two stages:

1. **Snapshot creation**: The system creates a snapshot of the source application, including its database and filesystem data
2. **Snapshot restoration**: The snapshot is then restored to the target application, overwriting any existing data

This ensures that the target application receives an exact copy of the source application's state at the time of the selected deployment.

### Monitor clone progress

After initiating the clone, you can monitor the progress using:

```shell
sw-paas app deploy list
```

Or get detailed information about a specific deployment:

```shell
sw-paas app deploy get
```

The clone operation may take some time, depending on the size of the application data. Wait until the deployment status shows `DEPLOYING_STORE_SUCCESS` before considering the clone to be complete.

## Post-clone tasks

After the clone is successfully completed, you must perform the following tasks:

### Update admin password

For clarity, we'll refer to the source application as **App A** and the cloned (target) application as **App B**.

App B will have the same admin password as App A. For security reasons, you should update the admin password in App B.

To access the Shopware Administration and retrieve the admin credentials for App B, use and the select the correct App from the interactive menu:

```shell
sw-paas open admin
```

To log in to the Admin dashboard the first time after cloning, you can use the password from App A. Just rerun the `sw-paas open admin` command for App A to fetch the admin password.

You can update the admin password through the UI:

1. Log in to the Shopware Administration of App B using the credentials shown by the `sw-paas open admin` command for App A
2. Navigate to your user profile (click on your username in the bottom left corner)
3. Go to **Your profile** and scroll to the **Password** section
4. Enter the password displayed by the `sw-paas open admin` command for App B as the new password
5. Next, in the verification modal that opens, use the password for App A

Alternatively, you can update the admin password using the Shopware console command. Open an exec session:

```shell
sw-paas exec --new
```

Once you're in the session, run the following command to update the admin password:

```shell
bin/console user:change-password admin
```

Follow the prompts to set a new password for the admin user.

### Update domain in sales channel

The cloned application will have the same domain configuration as the source application. You need to update the domain in the sales channel to match the cloned application's domain.

1. Access the Shopware Administration of the cloned application
2. From the left hand side menu pick the sales channel you want to update
3. Scroll to the **Domains** section
4. Update the domain to match the cloned application's domain (e.g., the `shopware.shop` domain assigned to the cloned application, or your custom domain if configured)
