# Installation

## General

We provide a Docker based solution, also mainly used by our developers.
These containers are also used in our continuous integration process. The supported functions are for both systems equal if the host system is based on Linux.

If you want to install the B2B Suite for the production environment, your system must fit the defined [system requirements](https://developers.shopware.com/sysadmins-guide/system-requirements/) for the Shopware Core.

### Minimum requirements

The B2B Suite is based on the minimum requirements of the Shopware Core.

These requirements apply from **B2B Suite 4.6.0 and above**:

* Shopware 6.4
* PHP 7.4.3
* MySQL 5.7.21
* MariaDB 10.3.22

**Like in the Shopware 6 core MySQL 8.0.20 and MariaDB 10.3.29, 10.4.19, 10.5.10 are not supported because of technical issues.**

## Installation on a Linux based system

### Docker (recommended)

As a minimum requirement, we need a docker runtime with version 1.12.* or higher. [psh.phar](https://github.com/shopwareLabs/psh) provides the following available Docker commands:

```bash
./psh.phar docker:start     # start & build containers
./psh.phar docker:ssh       # ssh access web server
./psh.phar docker:ssh-mysql # ssh access mysql
./psh.phar docker:status    # show running containers and network bridges
./psh.phar docker:stop      # stop the containers
./psh.phar docker:destroy   # clear the whole docker cache
```

To start the Docker environment, just type in your command line.

```bash
./psh.phar docker:start
```

Several containers are booted. Later you can login into your web container with:

```bash
./psh.phar docker:ssh
```

After that, you can start the initialization process by typing:

```bash
./psh.phar init
```

After a few minutes, our test environment should be available under the address [10.100.200.46](http://10.100.200.46).

To get a complete list of available commands, you can use:

```bash
./psh.phar
```

## Installation on an OS X based system

The following commands are available to create a MAC setup. Apache webserver, MySQL, and Ant are required. You can use the brew package manager to install them.

```bash
./psh.phar mac:init         # build installation
./psh.phar mac:start        # start apache, mysql 
./psh.phar mac:stop         # stop apache, mysql
./psh.phar mac:restart      # restart apache, mysql
```

You can change the database configuration in your own *.psh.yaml* file.

```yaml
mac:
    paths:
      - "dev-ops/mac/actions"
    const:
      DB_USER: "USERNAME"
      DB_PASSWORD: "PASSWORD"
      DB_HOST: "DB_HOST"
      SW_HOST: "SWHost"
```

For a better explanation, use the provided *.psh.yaml.dist* file as an example.

### Common

Once the environment has been booted successfully, you can use the common scripts to setup Shopware.

```bash
./psh.phar clear # remove vendor components and previously set state
./psh.phar init # init Composer, install plugins
./psh.phar unit # execute test suite
```
