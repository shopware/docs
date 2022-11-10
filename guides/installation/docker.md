# Docker

Docker is **not** the recommended way to install Shopware 6 on a Mac when it comes to the default way, due to performance issues. You still can have a look at the following possibilities though.

When it comes to using Windows, it's recommended to use [Dockware](dockware) or other ways to install Shopware. See "next steps" paragraph for further reference.

## Default way

At least on Linux operating systems, docker installation is the easiest way to get a running Shopware 6. This way you can set up Shopware 6 with just three easy commands:

1. Build and start the containers:

```sh
./psh.phar docker:start
```

1. Access the application container:

```sh
./psh.phar docker:ssh
```

1. Execute the installer inside the docker container:

```sh
./psh.phar install
```

This may take a while since many caches need to be generated on first execution, but only on first execution.

<!-- markdown-link-check-disable-next-line -->

To be sure the installation succeeded, just open the following url in your favorite browser: `http://localhost:8000/`

After exploring Shopware 6 you can terminate it with these two commands:

1. Leave the shell:

```sh
exit
```

1. Stop the containers:

```sh
./psh.phar docker:stop
```

## Possibilities to use Docker on Mac

### Using native mounting with Docker Volumes and docker-sync

If you are working with Mac/OSX and are facing performance issues, you should use [docker-sync](http://docker-sync.io/) instead of the default mounting strategy.

### Preparation

Download & install `docker-sync` from [http://docker-sync.io/](http://docker-sync.io/), which supports OSX, Windows, Linux and FreeBSD. `docker-sync` uses Ruby, which is pre-installed on OSX. On other operating systems, you might have to [install Ruby](https://www.ruby-lang.org/en/) separately.

- For OSX, see [OSX](https://docker-sync.readthedocs.io/en/latest/getting-started/installation.html#installation-osx).
- For Windows, see [Windows](https://docker-sync.readthedocs.io/en/latest/getting-started/installation.html#installation-windows).
- For Linux, see [Linux](https://docker-sync.readthedocs.io/en/latest/getting-started/installation.html#installation-linux).
- See the list of alternatives [here](https://docker-sync.readthedocs.io/en/latest/miscellaneous/alternatives.html)

### Enable the use of docker-sync in PSH Console

By default, the usage of `docker-sync` is disabled in PSH. To use Docker Volumes with Docker Sync, you must set `DOCKER_SYNC_ENABLED` to `true` in your `.psh.yaml.override`. Create a new entry in the `const` section like so:

```yaml
const:
  #..
  DOCKER_SYNC_ENABLED: true
```

That's it. Continue to install Shopware 6 as usual:

1. Build and start the containers:

```sh
./psh.phar docker:start
```

This command creates and starts the containers, watchers, and the sync itself. Running start the first time takes several minutes to complete. Subsequent starts are a lot faster since the images and volumes are reused.

1. Access the application container:

```sh
./psh.phar docker:ssh
```

1. Execute the installer inside the Docker container:

```sh
./psh.phar install
```

For more information about Shopware Installation, take a look at the [Installation overview](overview).

## Next steps

As next step, you might want to start writing your very own plugin. Head over to [Plugin base guide](../plugins/plugins/plugin-base-guide) to learn about that topic. Would you like to explore alternative ways to install Shopware? You can install Shopware on Mac with the help of other tools:

- [Dockware](dockware)
- [Vagrant](vagrant)
- [MAMP](mamp)
