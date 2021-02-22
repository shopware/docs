# Vagrant

{% hint style="info" %}
This is not an officially supported installation method. 
{% endhint %}

{% hint style="info" %}
This guide has been migrated from the old documentation and is subject to change. Feel free to give input using the "Edit page on Github" button.
{% endhint %}

## Overview

If using docker is not an option for you, vagrant is another great technology to quickly get a local Shopware up and 
running. Other than with the docker or local setup, with vagrant you will have a complete separate server on your 
machine.

Because of technical reasons, the vagrant machine acts like a remote web server, so with this setup, you'll develop 
your code on your PC and then upload/synchronize it to the vagrant machine. For this, the vagrant machine supports 
SCP/SSH, which is integrated in Editors like PhpStorm or Visual Studio Code.

## Prerequisites

A basic knowledge of using Vagrant is necessary to understand this guide. As this is considered a basic requirement
is won't be taught in this guide. 

## Requirements

Please make sure to fullfill the following requirements before starting to set up your environment:
* Use Vagrant v2.2.4 or later
* Install VirtualBox in a Vagrant compatible version
* Install Git
* Optional: Vagrant Hostsupdater (optional)

The IP address `192.168.33.10` is used by the vagrant box, so it must not be in use in the network already. 
If this is not possible, you manually have to change the IP address in the `Vagrantfile` you'll clone in the next step.

## Using Shopware in Vagrant

This section explains the basic setup of the virtual machine, as well as an advanced setup, using a reverse proxy 
and SSL.

### Basic setup

Start by cloning the repository [shopwareLabs/shopware-platform-vagrant](https://github.com/shopwareLabs/shopware-platform-vagrant):

```bash
> git clone git@github.com:shopwareLabs/shopware-platform-vagrant.git
> cd shopware-platform-vagrant
```

Next, execute vagrant up and wait while Vagrant downloads a virtual box image, clones the Shopware platform code 
and configures the server.

```bash
> vagrant up
```

{% hint style="info" %}
Note: This will take quite a while on first execution. However, caches will be created and used on any further `up` call.
{% endhint %}

#### Accessing shopware

This configuration will be the result of the following setup:
```text
( ansible vars: proxy_enabled = no, proxy_hostname = shopware.local, proxy_ssl = no )
```

| URL | UI | 
| --- | --- | 
| http://192.168.33.10 | Storefront | 
| http://192.168.33.10 | --- | 

The default credentials are admin/shopware. Credentials for ssh access are vagrant/vagrant.
You connect via vagrant ssh or use credentials and ssh with the following command 
(make sure ssh known_hosts is correct):

```bash
$ ssh vagrant@192.168.33.10
```

### Advanced setup

If you would like to access the Shopware instance using a hostname, rather than the IP address, you can enable the 
reverse proxy and - if you like - SSL encryption.

Both proxy and SSL can be enabled by editing the `ansible/vars/all.yml`. In this file, you will find the following 
options and be able to modify them accordingly.

| Variable | Type | Default | Description |
| --- | --- | --- | --- |
| proxy_enabled | Boolean (yes/no) | no | Enables the installation of nginx as a reverse proxy |
| proxy_hostname | Hostname | "shopware.local" | Defines the hostname that will be used to access the Shopware instance |
| proxy_ssl | Boolean (yes/no) | no | Enables SSL |

Please notice that you will have to modify your hosts file or use the Vagrant Hostsupdater plugin, when using a 
reverse proxy setup.

Given the hosts entry is set, you can access the Shopware instance via `https://<proxy_hostname>`, whereas 
`<proxy_hostname>` is a placeholder for the configured hostname (shopware.local per default).

#### Accessing Shopware

Along these lines, you can see the configuration which is the result of the following setuo:

```text
proxy_enabled = yes, proxy_hostname = shopware.local, proxy_ssl = yes
```

Keep in mind that in this case local hosts file need to be modified or the Vagrant Hostupdater plugin is in use

| URL | UI | 
| --- | --- | 
| https://shopware.local | Storefront | 
| https://shopware.local/admin | Administration | 

#### Accessing Shopware via terminal

Another possibility can be using the terminal and access the virtual machine via the commands below:

```bash
> vagrant ssh
> cd shopware-dev/
> bin/console
```

{% hint style="warning" %}
You should regularly update the box by executing `vagrant provision` - this will reset the box to it's stock
state meaning **Content inside the box is wiped and deleted**
{% endhint %}

## Switching shopware versions

By editing the `ansible/vars/all.yml` file you are able to set the `shopware_version variable`. 
This variable references the branch name of the `development` template which is used to build the vagrant VM. 
This can be the literal string HEAD, a branch name or a tag name of this repository: 
https://github.com/shopware/development

By default this variable is set to the `trunk` branch. To use a specific version you can set the corresponding 
git tag: e.g. `v6.2.2`

{% hint style="info" %}
In it's current state this setup cannot be used to update a running shopware instance via `shopware_version`
variable and re-provisioning via vagrant.
{% endhint %}

## Connecting your IDE

The Vagrant box fully encapsulates the whole Shopware 6 with all its sources. So the development process works just 
like with any other foreign system. The machine supports **SCP** with the following credentials:

| Key | Setting | 
| --- | --- | 
| Host | 192.168.33.10 | 
| User | vagrant | 
| Password | vagrant | 
| Path | ~/shopware-dev |

## Useful vagrant commands

| Commands | Description | 
| --- | --- | 
| vagrant ssh | Connect to your VM via ssh | 
| vagrant provision | (Re-)provision your environment | 
| vagrant destroy | Delete your VM | 
| vagrant status | Get information on the status of your VM |



