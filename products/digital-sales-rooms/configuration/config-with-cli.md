---
nav:
   title: Configuration with CLI
   position: 30

---

## Configuration with CLI

Using the CLI for configuration is significantly faster than performing each setup manually. By executing below command, you streamline the entire process, ensuring that all necessary configurations are applied efficiently and correctly in one go.

In the root folder of plugin, run:

```bash
composer dsr:config
```

By running it, you ensure that all necessary configurations are applied in a single step, streamlining the setup process for your Digital Sales Rooms environment. Make sure to run this command in the root directory of your project where the `composer.json` file is located.

This command will automatically execute the following setup commands (If you prefer, you can also execute each setup command separately to configure specific parts individually):

1. **Domain Setup**
   - `composer dsr:domain-setup`
   - This command sets up the necessary domain configurations for the Digital Sales Rooms.

2. **Daily.co Setup**
   - `composer dsr:daily-setup`
   - This command sets up Daily.co, which is essential for real-time video/audio calling within the Digital Sales Rooms.

3. **Mercure Setup**
   - `composer dsr:mercure-setup`
   - This command sets up the Mercure hub, which is essential for real-time updates and notifications within the Digital Sales Rooms.
