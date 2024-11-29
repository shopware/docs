---
nav:
   title: Domain Configuration
   position: 10

---

::: warning
Based on the business use case, the merchant can decide to add *Digital Sales Rooms* to their existing sales channel or new sales channel.
When you run the frontend app server (in both development or production), you will always have a specific domain (eg: `http://localhost:3000`)
:::

# Domain Configuration for frontend app

This section will show you how to add these domains to sales channel.

## Setup domains for Digital Sales Rooms

::: warning
Please redeploy or rerun your frontend app to apply the domains changes into it.
:::

- After specifying the sales channel, head to the *Domains section* and add appropriate *Digital Sales Rooms* domains with  appropriate languages. *Digital Sales Rooms* can switch languages by the path, you can choose your domain path represents for a language. Here is our recommendation:

```
http://localhost:3000 - English
http://localhost:3000/de-DE - Deutsch
http://localhost:3000/en-US - English (US)
```

![ ](../../../assets/setup-domain-for-sales-channel-DSR.png)

- These *Digital Sales Rooms* domains should be selected as *Available domains* in [Configuration Page - Appointments](./plugin-config.md#appointments)

![ ](../../../assets/fill-domain-into-configuration.png)
