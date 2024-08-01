---
nav:
   title: Domain Configuration
   position: 10

---

# Domain Configuration for Front-end app
When you run the Front-end app server (in both development or production). You will always have a specific domain (eg: `https://dsr-frontends.com`). This section will show how to add this domain to sales channel.

## Setup sales channel for Digital Sales Rooms
- Based on the business use case, the merchant can decide to add *Digital Sales Rooms* to their existing sales channel or new sales channel.
- After specifying the sales channel, head to the *Domains section* and add the proper *Digital Sales Rooms* domains with the proper languages. *Digital Sales Rooms* can switch languages by the path, so please add the domains with the format below.
```
dsr-frontends.com - English
dsr-frontends.com/de-DE - Deutsch
```
![ ](../../../assets/setup-domain-for-sales-channel-DSR.png)

The *Digital Sales Rooms* domain (eg: `https://dsr-frontends.com`) should be selected as *Default appointment domain* in [Configuration Page - Appointments](./plugin-config.md#appointments)
