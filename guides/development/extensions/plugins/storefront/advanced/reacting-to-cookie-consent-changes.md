---
nav:
  title: Reacting to cookie consent changes
  position: 170

---

# Reacting to Cookie Consent Changes

## Overview

This guide explains how to react to changes in cookie consent made by the user via JavaScript. This is essential when your plugin needs to load third-party scripts, tracking codes, or other functionality only when users have given their consent.

## Prerequisites

This guide is built upon both the [Plugin base guide](../plugin-base-guide) and the [Adding a cookie to the consent manager](add-cookie-to-manager) guide, so make sure to know those beforehand. Also, nice to know is the guide about [Reacting to javascript events](reacting-to-javascript-events), since this will be done here, same as how to [create and load a JavaScript](add-custom-javascript) file in the first place.

::: info
For a comprehensive understanding of Shopware's cookie consent system, see the [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management).
:::

## Key Principles

To create a cookie-aware plugin, you need to handle two main scenarios:

1. **Initial Page Load**: When a page loads, you must check if the user has already given consent for your cookie.
2. **Consent Changes**: If the user changes their cookie settings while on the site, your plugin must react to that change in real-time, enabling or disabling its functionality accordingly.
3. **Cleaning Up**: If a user withdraws consent, it's crucial to clean up any resources your plugin has loaded, such as scripts, tracking cookies, or data in local storage.

This guide will walk you through implementing these principles.

## Step 1: Checking for Consent on Page Load

If you need to check the current state of a cookie on page load, you can do so by checking for the existence of the specific cookie. When a user gives consent, Shopware creates a cookie with the name you defined.

```javascript
import CookieStorage from 'src/helper/storage/cookie-storage.helper';

// Check for the existence of a specific cookie
function checkCookieConsent(cookieName) {
    const cookieStorage = new CookieStorage();
    return !!cookieStorage.getItem(cookieName);
}

// Usage
if (checkCookieConsent('cookie-key-1')) {
    // Cookie is accepted, load your feature
    loadThirdPartyScript();
}
```

## Step 2: Reacting to Consent Changes

Every time a user saves a cookie configuration, Shopware fires a `COOKIE_CONFIGURATION_UPDATE` event. You can listen for this event to react in real-time when a user accepts or declines your cookie.

The event detail contains an object with the names of the cookies that were changed and their new state (`true` for active, `false` for inactive).

```javascript
// <plugin root>/src/Resources/app/storefront/src/reacting-cookie/reacting-cookie.js
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';

document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, eventCallback);

function eventCallback(updatedCookies) {
    if (typeof updatedCookies.detail['cookie-key-1'] !== 'undefined') {
        const cookieActive = updatedCookies.detail['cookie-key-1'];

        if (cookieActive) {
            // Cookie was accepted - load your script/feature
            loadThirdPartyScript();
        } else {
            // Cookie was declined - clean up if necessary
            removeThirdPartyScript();
        }
    }
}

function loadThirdPartyScript() {
    // Example: Load tracking script
    const script = document.createElement('script');
    script.src = 'https://example.com/tracking.js';
    script.id = 'cookie-key-1-script';
    document.head.appendChild(script);
}

function removeThirdPartyScript() {
    // Example: Remove tracking script and clean up related cookies/storage
    const script = document.getElementById('cookie-key-1-script');
    if (script) {
        script.remove();
    }
    // Also clear any cookies set by the script
    document.cookie = 'tracking-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    // And any storage items
    localStorage.removeItem('tracking-data');
}
```

Notice the `removeThirdPartyScript` function. It's crucial to not only remove the script but also clean up any cookies or storage items it might have created.

## Step 3: Complete Implementation Example

Here's a complete example of a plugin that combines both principles: it checks for consent on page load and reacts to changes from the consent manager.

```javascript
// <plugin root>/src/Resources/app/storefront/src/plugin/cookie-aware-tracking.plugin.js
import Plugin from 'src/plugin-system/plugin.class';
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';
import CookieStorage from 'src/helper/storage/cookie-storage.helper';

export default class CookieAwareTrackingPlugin extends Plugin {
    static options = {
        cookieName: 'my-tracking-cookie',
        trackingUrl: 'https://tracking.example.com/script.js'
    };

    init() {
        this.cookieStorage = new CookieStorage();

        this._registerEvents();

        // Check initial consent on page load
        if (this.hasConsent()) {
            this.enableTracking();
        }
    }

    _registerEvents() {
        this.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, this.onConsentChange.bind(this));
    }

    onConsentChange(event) {
        const updatedCookies = event.detail;

        if (typeof updatedCookies[this.options.cookieName] === 'undefined') {
            return;
        }

        if (updatedCookies[this.options.cookieName]) {
            this.enableTracking();
        } else {
            this.disableTracking();
        }
    }

    hasConsent() {
        return !!this.cookieStorage.getItem(this.options.cookieName);
    }

    enableTracking() {
        if (this.isTrackingEnabled) {
            return;
        }

        console.log('Enabling tracking');

        // Load tracking script
        const script = document.createElement('script');
        script.src = this.options.trackingUrl;
        script.id = 'tracking-script';
        script.dataset.trackingScript = 'true';
        document.head.appendChild(script);

        this.isTrackingEnabled = true;
    }

    disableTracking() {
        if (!this.isTrackingEnabled) {
            return;
        }

        console.log('Disabling tracking');

        // Remove tracking script
        const script = document.getElementById('tracking-script');
        if (script) {
            script.remove();
        }

        // Clean up tracking cookies
        document.cookie = 'tracking-session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

        this.isTrackingEnabled = false;
    }
}
```

## Step 4: Loading the JavaScript Plugin

Finally, you have to load your new plugin in your plugin's main entry file, which is the `main.js`. For better performance, it is recommended to load plugins asynchronously using a dynamic import. This ensures the plugin is only loaded on pages where it's actually needed (i.e., where its selector is present).

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
const PluginManager = window.PluginManager;
PluginManager.register('CookieAwareTracking', () => import('./plugin/cookie-aware-tracking.plugin'), '[data-cookie-aware-tracking]');
```
