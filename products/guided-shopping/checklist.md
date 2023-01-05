# Checklist

## Requirements for default basic stack

<aside>
💡 This checklist does not cover the project specific configuration like cms pages, specific presentation. The only intention of the checklist is to provide plugin fully working at every stack and make it ready to be used in terms of administration stuff and end-user experience.

</aside>

### Shopware fundamentals

- [ ] 🌐Shopware 6 is available on the web over https
- [ ] PWA plugin for Shopware 6 is installed
- [ ] 🌐Shopware PWA is generated and available in public under some URL over https

### Required external services

- [ ] [Mercure.rocks](http://Mercure.rocks) service is available on the web over https with required settings
- [ ] [Daily.co](http://Daily.co) service is available on the web with default settings

### Setup

- [ ] the plugin is installed with no errors and it’s available in the “Marketing” section
  ![Untitled](assets/checklist.png)
- [ ] the plugin is set up with settings based on the configuration of external services

### Refresh Shopware PWA

- [ ] an instance is rebuilt (`yarn build`) and redeployed

**👌🏼 Great! Now it’s time to setup the presentations and prepare the appointments in order to start using the Guided Shopping.**
