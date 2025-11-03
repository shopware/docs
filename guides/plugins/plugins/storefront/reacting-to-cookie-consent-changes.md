---
nav:
  title: Reacting to cookie consent changes
  position: 170

---

# Reacting to Cookie Consent Changes

## Overview

This guide explains how to react to changes in cookie consent made by the user via JavaScript. This is essential when your plugin needs to load third-party scripts, tracking codes, or other functionality only when users have given their consent.

## Prerequisites

This guide is built upon both the [Plugin base guide](../plugin-base-guide) as well as the [Adding a cookie to the consent manager](add-cookie-to-manager) guide, so make sure to know those beforehand. Also nice to know is the guide about [Reacting to javascript events](reacting-to-javascript-events), since this will be done here, same as how to [create and load a JavaScript](add-custom-javascript) file in the first place.

::: info
For a comprehensive understanding of Shopware's cookie consent system, see the [Cookie Consent Management Concept](../../../../concepts/commerce/content/cookie-consent-management).
:::

## Reacting to cookie configuration changes via JavaScript

Every time a user saves a cookie configuration, an event is published to the document's event emitter. The event only contains the changeset for the cookie configuration as an object.

In the following example we'll check for a cookie with name `cookie-key-1`, just like we created one of the cookies in our guide about [Adding a cookie to the consent manager](add-cookie-to-manager).

You can listen for this event using the following lines:

```javascript
// <plugin root>/src/Resources/app/storefront/src/reacting-cookie/reacting-cookie.js
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';

document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, eventCallback);

function eventCallback(updatedCookies) {
    if (typeof updatedCookies.detail['cookie-key-1'] !== 'undefined') {
        // The cookie with the cookie attribute "cookie-key-1" either is set active or from active to inactive
        let cookieActive = updatedCookies.detail['cookie-key-1'];

        if (cookieActive) {
            // Cookie was accepted - load your script/feature
            loadThirdPartyScript();
        } else {
            // Cookie was declined - clean up if necessary
            removeThirdPartyScript();
        }
    } else {
        // The cookie with the cookie attribute "cookie-key-1" was not updated
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
    // Example: Remove tracking script
    const script = document.getElementById('cookie-key-1-script');
    if (script) {
        script.remove();
    }
}
```

So first of all we're registering to the event `COOKIE_CONFIGURATION_UPDATE` and apply our own custom callback here. The custom callback then checks for the updated cookies, which are stored in `updatedCookies.detail`. If your cookie is not defined in there, it wasn't changed. If you can find it, it will contain the new active state.

This way you can properly react to cookie consent changes made by the user.

## Cookie Configuration Cookies

The cookie configuration plugin uses special cookies to manage the consent system:

### System Cookies

| Cookie | Purpose | Lifetime |
|--------|---------|----------|
| `cookie-preference` | Stores the user's cookie consent choices | 30 days |
| `cookie-config-hash` | Stores the configuration hash for change detection | 30 days |

These cookies are automatically managed by Shopware and should not be modified manually.

### Protected Cookies

The following cookies are **never removed** by the consent system, even when configurations change or users decline consent:

- `session-*` - All session cookies required for shop functionality
- `timezone` - User's timezone preference

## Detecting Configuration Changes

Since Shopware 6.7, the cookie configuration includes a hash mechanism that automatically detects when cookie configurations change (e.g., when plugins are installed/updated).

When the cookie configuration hash changes:

1. All non-essential cookies are automatically removed
2. The consent flow restarts
3. Protected cookies (`session-*`, `timezone`) remain intact
4. Users see the consent banner again

Your plugin doesn't need to handle this manually - it's done automatically by the core system.

### Example: Checking if Configuration Changed

```javascript
import { COOKIE_CONFIGURATION_UPDATE } from 'src/plugin/cookie/cookie-configuration.plugin';

document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, (event) => {
    const updatedCookies = event.detail;

    // Check if your specific cookie was affected
    if (typeof updatedCookies['my-tracking-cookie'] !== 'undefined') {
        const isAccepted = updatedCookies['my-tracking-cookie'];

        if (isAccepted) {
            initializeTracking();
        } else {
            disableTracking();
        }
    }
});
```

## Advanced: Reading Current Cookie State

If you need to check the current state of a cookie on page load (not just on changes):

```javascript
import CookieStorage from 'src/helper/storage/cookie-storage.helper';

// Read the stored cookie preferences
function checkCookieConsent(cookieName) {
    const cookieStorage = new CookieStorage();
    const preferences = cookieStorage.getItem('cookie-preference');

    if (!preferences) {
        // No preferences set yet
        return false;
    }

    try {
        const cookiePreferences = JSON.parse(preferences);
        return cookiePreferences[cookieName] === true;
    } catch (e) {
        console.error('Failed to parse cookie preferences', e);
        return false;
    }
}

// Usage
if (checkCookieConsent('cookie-key-1')) {
    // Cookie is accepted, load your feature
    loadThirdPartyScript();
}
```

## Best Practices

### 1. Check Consent Before Loading Scripts

Always verify consent before loading third-party scripts:

```javascript
function initializePlugin() {
    if (checkCookieConsent('google-analytics')) {
        loadGoogleAnalytics();
    }

    // Listen for future changes
    document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, (event) => {
        if (event.detail['google-analytics']) {
            loadGoogleAnalytics();
        }
    });
}
```

### 2. Clean Up Properly

When users decline consent, clean up any loaded resources:

```javascript
function disableTracking() {
    // Remove scripts
    const scripts = document.querySelectorAll('[data-tracking-script]');
    scripts.forEach(script => script.remove());

    // Clear cookies
    document.cookie = 'tracking-cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Clear storage
    localStorage.removeItem('tracking-data');
}
```

### 3. Handle Initial Page Load

Check consent state on initial page load:

```javascript
class MyTrackingPlugin {
    init() {
        // Check initial consent state
        if (checkCookieConsent('my-tracking-cookie')) {
            this.enable();
        }

        // Listen for changes
        document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, this.onConsentChange.bind(this));
    }

    onConsentChange(event) {
        const isAccepted = event.detail['my-tracking-cookie'];

        if (isAccepted) {
            this.enable();
        } else {
            this.disable();
        }
    }

    enable() {
        console.log('Tracking enabled');
        // Initialize tracking
    }

    disable() {
        console.log('Tracking disabled');
        // Clean up tracking
    }
}
```

### 4. Respect Cookie Categories

Be aware that cookies belong to different categories:

```javascript
// Comfort functions (e.g., video embeds)
if (checkCookieConsent('youtube-cookie')) {
    embedYouTubeVideo();
}

// Marketing (e.g., advertising pixels)
if (checkCookieConsent('marketing-pixel')) {
    loadMarketingPixel();
}

// Statistics and tracking (e.g., analytics)
if (checkCookieConsent('analytics-cookie')) {
    initializeAnalytics();
}
```

## Example: Complete Implementation

Here's a complete example of a plugin that respects cookie consent:

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

        // Check initial consent
        if (this.hasConsent()) {
            this.enableTracking();
        }

        // Listen for consent changes
        this.registerEvents();
    }

    registerEvents() {
        document.$emitter.subscribe(COOKIE_CONFIGURATION_UPDATE, this.onConsentChange.bind(this));
    }

    onConsentChange(event) {
        const updatedCookies = event.detail;

        if (typeof updatedCookies[this.options.cookieName] !== 'undefined') {
            if (updatedCookies[this.options.cookieName]) {
                this.enableTracking();
            } else {
                this.disableTracking();
            }
        }
    }

    hasConsent() {
        const preferences = this.cookieStorage.getItem('cookie-preference');

        if (!preferences) {
            return false;
        }

        try {
            const cookiePreferences = JSON.parse(preferences);
            return cookiePreferences[this.options.cookieName] === true;
        } catch (e) {
            return false;
        }
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

### Loading the JavaScript file

Just like with every custom JavaScript file, you have to load this one as well in your plugin's main entry file, which is the `main.js`.

```javascript
// <plugin root>/src/Resources/app/storefront/src/main.js
import CookieAwareTrackingPlugin from './plugin/cookie-aware-tracking.plugin';

// Register plugin
const PluginManager = window.PluginManager;
PluginManager.register('CookieAwareTracking', CookieAwareTrackingPlugin, '[data-cookie-aware-tracking]');
```
