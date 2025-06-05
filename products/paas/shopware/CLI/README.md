---
nav:
  title: CLI Setup
  position: 20
---

# Shopware PaaS CLI

The Shopware PaaS CLI allows you to manage shops and resources within the PaaS cloud in a simple way.

## Installation

Visit the [releases page for the sw-paas](https://github.com/shopware/paas-cli/releases) GitHub project and find the appropriate archive for your operating system and architecture.
Download the archive and retrieve it to your home directory. (See [configuration](#configuration) for more details).

> [!NOTE]
> To make this as easy as possible, we will be adding the binaries to some package managers soon.

## Access the PaaS system

We use Cognito as our OAuth provider, you need an Invitation in our System to access the resources.
The first User with a Shopware Account has the ability to add more Users to an Organization.

### Authentication

After successful installation, you will need to authenticate to enable authorized access to other CLI functionalities.

The `auth` command uses OAuth for authentication. It opens a browser window where you log in to your Shopware PaaS account.
After successful login, the authentication token is retrieved and saved in the `XDG` state directory, which depends on your system.

```sh
sw-paas auth
```

To view your user-id and roles in the PaaS system, execute:

```sh
sw-paas account whoami
```

![Login example](gifs/login.gif)

#### Machine token

To use the CLI in a CI/CD pipeline, you can use a machine token. The machine token is a `JWT` token which is used to authenticate the user. The token is connected to the user who created it and has the same permissions as the user. The token can be created in the account management of the paas system.

Create a machine token in the account management and use it with the following command:

```sh
sw-paas account token create
```

To list all tokens attached to your organization, use the following command:

```sh
sw-paas account token list
```

To revoke a token, use the following command:

```sh
sw-paas account token revoke --token-id <token-id>
```

### Authorization

To access resources in our paas system, you need to have specific roles inside the organization. To add somebody to a [role](#role-overview) in your organization, you need to have **Account Admin** role in your organization.

Check for the role:

```sh
sw-paas account whoami
```

If you are already `Account Admin`, then add the user-id of the user you want to add.

On the `user cli` use this command to get the user-id:

```sh
sw-paas account whoami --output json
# or if you have jq installed
sw-paas account whoami --output json | jq ".sub"
```

Add the user to your organization and select a new [role](#role-overview):

```sh
sw-paas account user add --sub "<user-id of the new user>"
```

![User add example](gifs/add-user.gif)

#### Role overview

| Role          | Description                                                                          |
|---------------|--------------------------------------------------------------------------------------|
| ReadOnly      | Gets access to projects and applications. Only actions allowed are `get` and `list`. |
| Developer     | Gets access to projects and applications. All actions are allowed.                   |
| Project Admin | Gets access to projects and applications. All actions are allowed.                   |
| Account Admin | Gets access to account management. Actions for managing users are allowed.           |

#### User policies

One user will have policies for the paas system which are also shown in the `whoami` command. A policy has always a binding to a organization. The domain together with the resource describes which object will be accessed. For example, to access the projects and applications you need the domain `project` and the resource `project` or `*`.

### Configuration

You can customize the config file and also generate a default one <!--with (TODO add command)-->. The location depends on your system.

### File overview

|                 | Unix                   | MacOS                                      | Windows        |
|-----------------|------------------------|--------------------------------------------|----------------|
| XDG_CONFIG_HOME | ~/.config/sw-paas      | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |
| XDG_STATE_HOME  | ~/.local/state/sw-paas | ~/Library/Application&nbsp;Support/sw-paas | %LOCALAPPDATA% |

#### Context configuration

If you have multiple projects or organizations, we provide a way to select one, so you don't have to pass the `organizationId` and `projectId` every time. You can set the context with the following command:

```sh
sw-paas account context set
```

This will generate a context file inside the state directory. This file can look like this:

```yaml
organizationId: 32e6f582-4138-4f58-bb59-97ef96fcc0e6
projectId: 7922bf05-8b48-4680-8f8b-e015c5047401
```

You can also show the currently selected context with the following command:

```sh
sw-paas account context show
```

If you now list the applications, you don't need to pass the required parameters anymore:

```sh
sw-paas application list
```

To delete the context, you can use the following command:

```sh
sw-paas account context delete
```

## Resources

### Organization

An Organization has multiple users and represents the contract in the Shopware Account. The name is provided by the Shopware Account and is equal to the company name.

View all organizations where the user has access to:

```sh
sw-paas org list
```

### Project

A project is mapped to an organization and, therefore, to all users of the organization. The project is the representation of a git repository.

> [!NOTE]
> You can't restrict access to single projects and also can't rename a project for now.

View all projects:

```sh
sw-paas project list
```

#### Create your first project

To create a project you can run the following command:

```sh
sw-paas project create --name test --repository shopware-redstone/customer --type shopware
```

or use the interactive one:

```sh
sw-paas project create
```

![Project create example](gifs/create-project.gif)

### Application

An Application is a representation of a git branch and, therefore, mapped to the project. You can have multiple applications in a project, e.g. one for production and one for staging or testing or even for a feature testing. The application is also the representation of the deployed shop in the cluster.

> [!NOTE]
> You can't restrict access to single Applications and also can't rename an application for now.

View all projects:

```sh
sw-paas application list
```

#### Create your first application

To create an application, you can run the following command:

```sh
sw-paas application create --name test --type shopware
```

or use the interactive one:

```sh
sw-paas application create
```

#### Updating an application

To update an application, you can run the following command:

```sh
sw-paas application update --application-id 0b92ce92-f402-4b1c-acef-d931c194a4ee --commit-sha 2b79de876fdd6cb6d5262691b06212b55e16f995
```

or use the interactive one:

```sh
sw-paas application update
```

### Application build

An application build is a representation of a build process for an application. You can have multiple builds in an application. The build also represents the deployed shop in the cluster.

View all application builds:

```sh
sw-paas application build list --organization-id <org-id> --project-id <project-id> --application-id <application-id>
```

or use the interactive one:

```sh
sw-paas application build list
```

#### Show docker logs of a build

To show the docker logs of a build, you can run the following command:

```sh
sw-paas application build logs --organization-id <org-id> --project-id <project-id> --application-id <application-id> --build-id <build-id>
```

or use the interactive one:

```sh
sw-paas application build logs
```

### Vault / Secrets

To add secrets to your application, you can use the following command:

```sh
echo "my secret value" | sw-paas vault create --key "ENV_KEY_LATER_IN_THE_CONTAINER" --type "env" --password-stdin
```

Please don't use echo in the shell and use a proper way of getting secrets like a password manager. You can also use the interactive
one if you want to copy and paste it from somewhere.

### Report an issue

Should you spot a bug, please report it in our [issue tracker](https://github.com/shopware/paas-cli/issues).
