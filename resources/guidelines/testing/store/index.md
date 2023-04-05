# Testing Guidelines for Shopware Extensions

This section guides you with the criteria used to test your extension. Detailed information is available on [quality guidelines for apps](../store/quality-guidelines-apps/) and [quality guidelines for plugins](../store/quality-guidelines-plugins/).

Check out the points that affect your extension and go through them before submitting it for testing.

We assign three statuses when testing your extension:

::: tip
OK: This point was tested and passed
:::

::: danger
Failed: This point was tested, and errors were found
:::

::: warning
Not necessary: This point does not need to be tested
:::

## Test criteria

Here is what the test criteria include:

* **[Function availability](../store/quality-guidelines-apps/#every-app-based-on-the-app-system)** - Here, we proceed like a user and check the complete functionality of the app, as well as the logical structure and usability. For instance,

    * Is a general function as described in your extension available?
    * Do the buttons, export, rules, etc., work?
    * Are errors displayed in the console?

* **[Lighthouse audit home/listing/detail](../store/quality-guidelines-apps/#frontend-apps)** - We check:

    * If your extension affects the Storefront or not?  (so that the search engines have no problems with it).
    * If all buttons, labels, etc., are named correctly?

We pay attention to all five audits. The app must not limit these. Like most search engines, we also pay attention to mobile-first.

* **[Rich snippet home/listing/detail](../store/quality-guidelines-apps/#template-tests)** - We check:

    * If the page can be indexed?
    * Is there any incorrect price information being displayed?

Rich snippets have no influence on the ranking of a website. Thus, they do not count among the ranking factors. Nevertheless, search hits enriched with additional information have various SEO advantages: higher attention, higher click-through rate, and greater relevance.

* **[No errors in the Storefront and 503/404 errors](../store/quality-guidelines-apps/#error-messages-must-be-entered-in-the-event-log)** - We check:

    * If the app is active in the Storefront?
    * If it involves display errors and errors of any kind?

The end customer should not receive any misleading error messages. It does not matter whether a function causes the error or the customer does not use the function correctly. For example, the customer can upload a picture using a function, but if the customer tries to upload a video, a clear message should be displayed here.

* **[Cookie check storefront/checkout](../store/quality-guidelines-apps/#register-a-cookie-to-the-cookie-consent-manager)** - Since the GDPR/DSGVO, the classification of cookies is particularly important. We distinguish between three types of cookies.

    * **Technically required**: Only cookies that are really important for the store without which no purchase would be possible.

    * **Comfort functions**: Cookies to display personalized ads as banners, newsletter pop-ups, and content from video and social media platforms.

    * **Statistics and Tracking**: Statistics and everything that has to do with data collection and tracking.

* **[Store description German/English](../store/quality-guidelines-apps/#app-descriptions-in-your-shopware-account)** - The app store description includes several points if the app can be used only in a specific country, so leave this clearly in the description. The German description is only mandatory if the app is to be offered in the German market. Furthermore, there must always be at least two images of the app in English, e.g., of the Storefront and the Admin.

* **[Translations managed admin](../store/quality-guidelines-apps/#fallback-language)** - We check if the app is available in all languages specified in your account. However, it is important that English is fallback if the app does not support any other language.

* **[API validation](../store/quality-guidelines-apps/#api-or-payment-apps)** - If access data is required for the app - for example, an API key; a button must be implemented with which the customer can check the data if this is technically possible.

![api access](../../../../.gitbook/assets/guidelines-test-store-apiValidation.png)

* **[Uninstallation process](../store/quality-guidelines-apps/#extension-manager)** - During the uninstallation process, the app should be able to uninstall and install without any problems. It is also important to check whether the app depends on other apps and whether they must be uninstalled first.

* **Data will be removed from the database after uninstallation** - If the customer selects the option "delete all data" during uninstallation, then all the data has to be removed from the database that was created with the app.

* **Manual code review by a Shopware developer to ensure code quality** - This is the last step. A developer looks at the app's code to ensure it is clean and has no security gaps.
