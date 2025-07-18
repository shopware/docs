---
nav:
   title: Configuration with CLI
   position: 30

---

## Configuration with CLI

Using the CLI for configuration is significantly faster than performing each setup manually. By executing the below command, you streamline the entire process, ensuring that all necessary configurations are applied efficiently and correctly in one go.

Make sure you are in the root folder of the plugin, run:

```bash
composer dsr:config
```

This command will automatically execute the following setup commands (If you prefer, you can also execute each setup command separately to configure specific parts individually):

1. **Domain Setup**
   - `composer dsr:domain-setup`
   - This command sets up the necessary domain configurations for **Digital Sales Rooms**.

2. **Daily.co Setup**
   - `composer dsr:daily-setup`
   - This command sets up Daily.co, which is essential for real-time video/audio calling within **Digital Sales Rooms**.

3. **Mercure Setup**
   - `composer dsr:mercure-setup`
   - This command sets up the Mercure hub, which is essential for real-time updates and notifications within **Digital Sales Rooms**.
