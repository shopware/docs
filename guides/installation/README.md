# Installation

This section discusses ways to set up Shopware on local machines so you can use it as a foundation for your development.

There are a couple of ways to get Shopware running on your system togehter with the most useful services for data storage and a webserver.

## Declaratively managed

The installation with Devenv ([see the guide](devenv.md)) manages all necessary services. A description file in the source code manages the versions of these services.
This setup works for linux and macOS.

A community powered alternative for this is [Dockware](community/dockware.md).
This is a managed docker setup for Shopware 6 by Shopware agency [dasistweb](https://www.dasistweb.de/).

## Setting up your own environment

Please refer to our [requirements](requirements.md) to install and configure the necessary services
like a database and a webserver to a *nix system like Linux, macOS, wsl etc.

After that you can setup Shopware as a symfony flex project. [Guide](template.md)
