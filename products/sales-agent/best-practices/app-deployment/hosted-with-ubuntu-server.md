---
nav:
  title: Ubuntu Server with PM2
  position: 10
---

# Deploy with Ubuntu Server with PM2

This guide will walk you through the steps to deploy Sales Agent frontend web application to an Ubuntu server using [PM2](https://nuxt.com/docs/getting-started/deployment#pm2), a process manager for Node.js applications. PM2 will help you keep your app running in the background, restart it automatically when it crashes, and manage logs for easier troubleshooting.

## Prerequisites

- **Ubuntu Server**: This guide assumes you have an Ubuntu server running, and you can access it via SSH.
- **Node.js & npm**: Make sure Node.js and npm (Node package manager) are installed on your server.
- **PM2**: PM2 should be installed globally.

```bash
npm install -g pm2
```

- **pnpm**

```bash
npm install -g pnpm
```

- **Frontend Application**: Clone the frontend source code and push to your GitHub repository.

## Setup Redis

Redis is required for caching. You can either install Redis locally on your Ubuntu server or use a managed Redis service.

### Option 1: Install Redis locally

Install Redis using the package manager:

```bash
sudo apt update
sudo apt install redis-server
```

Configure Redis for production by editing the configuration file:

```bash
sudo nano /etc/redis/redis.conf
```

Key settings to consider:

- Set `supervised systemd` to integrate with systemd.
- Configure `bind` to restrict access (e.g., `bind 127.0.0.1` for local only).
- Set a password with `requirepass your_secure_password`.

Enable and start the Redis service:

```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

Verify Redis is running:

```bash
# If you configured a password with requirepass
redis-cli -a your_secure_password ping

# If no password is set
redis-cli ping
```

You should see `PONG` as a response.

### Option 2: Use a managed Redis service

Alternatively, you can use managed Redis services such as:

- [Upstash](https://upstash.com/) - Serverless Redis with pay-per-request pricing.
- [Redis Cloud](https://redis.com/cloud/overview/) - Managed Redis by Redis Ltd.

These services provide connection details (host, port, password) that you configure in your `.env` file.

### Configure Redis environment variables

Add these Redis environment variables to your `.env` file:

```bash
REDIS_CACHE=true
REDIS_HOST=127.0.0.1  # For local installation, or your managed service endpoint
REDIS_PORT=6379
REDIS_PASSWORD=your_secure_password  # If configured with requirepass
REDIS_TLS=false  # Set to true for managed services that require TLS
```

For managed Redis services like Upstash, use the connection details provided by the service (host, port, password, and set `REDIS_TLS=true` for secure connections).

## Build code

- Please follow instructions here to [set up all necessary things and build the code](../../installation.md#setup-app-server)

## Start the Application with PM2

Now that your app is built, create a file named `ecosystem.config.cjs` in the root of your project with the following content. Ensure that the script path points to your app's build output directory (e.g., `.output/server/index.mjs` for Nuxt 3)

```js
module.exports = {
  apps: [
    {
      name: "SalesAgentApp",
      port: "3000",
      exec_mode: "cluster",
      instances: "max",
      script: "./.output/server/index.mjs",
    },
  ],
};
```

Once saved, you can start the app with:

```bash
pm2 start ecosystem.config.cjs
```
