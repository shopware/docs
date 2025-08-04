---
nav:
  title: Static System Configuration
  position: 30

---

# Static System Configuration

::: info
This feature is available since Shopware 6.6.4.0
:::

The static system configuration is a feature that allows you to configure system configurations inside the `config/packages` directory and **overwrite** the configuration set in the database. This is useful for setting up configurations that should not be changed by the user, or properly configuring the system for different environments without the need to change the database.

## How it works

The statically set configuration is an overlay of the database loaded configuration. This means that the configuration in the database is loaded first, and then the configuration set in the `config/packages` directory is loaded. If a configuration key is set in both places, the value from the `config/packages` directory will be used. Additionally, when the configuration is overwritten, the user is not able to change the configuration in the administration anymore.

## Why to use?

- When the configuration should be fixed and should not be changed by the user
- When you want to have the configuration versioned in the repository
- When you want to have different configurations for different environments (e.g., development, staging, production)

## Usage

To use this feature, you will need to create a new file at `config/packages/<name>.yaml`

The file should contain the configuration in the following format:

```yaml
shopware:
  system_config:
    default:
      core.listing.allowBuyInListing: true
    # Disable it for the specific sales channel
    0188da12724970b9b4a708298259b171:
      core.listing.allowBuyInListing: false
```

In this example, the `core.listing.allowBuyInListing` configuration is set to `true` by default. However, for the sales channel with the ID `0188da12724970b9b4a708298259b171`, the configuration is set to `false`.

You can also use regular Symfony Configuration processors like the usage of environment variables:

```yaml
shopware:
  system_config:
    default:
      core.listing.allowBuyInListing: '%env(bool:ALLOW_BUY_IN_LISTING)%'
```

and then set the environment variable in your `.env` file:

```dotenv
# .env.local
ALLOW_BUY_IN_LISTING=true
```
