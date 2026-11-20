---
nav:
  title: Existing storefront
  position: 21
---

# Test an existing storefront

Use this option to run selected storefront tests against a deployed shop's real sales channel, including its theme, catalog and channel-specific plugin configuration. The default ATS fixtures continue creating an isolated sales channel per worker.

Start with [Install & Configure](./install-configure.md) for the test workspace and Admin API credentials.

::: info Availability
This guide requires an ATS version containing [existing storefront support](https://github.com/shopware/acceptance-test-suite/pull/741).
Until that version is released, use a PR preview build for development verification.
:::

## Configure a consumer project

Install the ATS release or PR build containing this feature. The package does not load your project's environment or copy this repository's Playwright configuration. Load your environment as usual, then configure the exported worker option in your own `playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';
import type { StorefrontWorkerOptions } from '@shopware-ag/acceptance-test-suite';

const storefrontUrl = process.env.SHOPWARE_STOREFRONT_URL;

export default defineConfig<NonNullable<unknown>, StorefrontWorkerOptions>({
    projects: [
        {
            name: 'generated',
            testIgnore: '**/smoke/**',
            use: { ...devices['Desktop Chrome'] },
        },
        ...(storefrontUrl
            ? [{
                name: 'existing-storefront',
                testMatch: '**/smoke/**/*.spec.ts',
                workers: 1,
                fullyParallel: false,
                retries: 0,
                use: {
                    ...devices['Desktop Chrome'],
                    storefrontTarget: { mode: 'existing' as const, url: storefrontUrl },
                },
            }]
            : []),
    ],
});
```

Keep your existing projects, dependencies and test selection as appropriate; the example only illustrates the two fixture choices. Adding a separate project is optional. A selected project or shared test fixture can supply the worker option instead.

Preview and execute the selected tests:

```sh
npx playwright test --project=existing-storefront --list
npx playwright test --project=existing-storefront --workers=1 --retries=0
```

Setting `SHOPWARE_STOREFRONT_URL` alone does not activate the packaged fixtures. Your consumer config must map it to `use.storefrontTarget`. In the ATS repository's own config, that mapping is provided and the existing-storefront project is absent unless the variable is set. There is no fallback from a missing storefront URL to `APP_URL` for that project.

## URLs and authentication

`APP_URL` remains the backend/application address. `ADMIN_API_URL` and `ADMIN_URL` retain their usual overrides. `storefrontTarget.url` must be an absolute HTTP(S) URL matching exactly one registered storefront domain, including any language or installation path. Trailing slashes are normalized. One domain is supported per project initially.

The channel must be active, have a Store API access key and have complete domain localization and channel configuration. ATS resolves those settings through the Admin API. It does not create a replacement when lookup fails.

Use `SHOPWARE_ACCESS_KEY_ID` / `SHOPWARE_SECRET_ACCESS_KEY` for an existing integration, or `SHOPWARE_ADMIN_USERNAME` / `SHOPWARE_ADMIN_PASSWORD` for user authentication. Existing mode does not bootstrap a new integration. Grant the read permissions needed for channel, domain, language, country, tax and customer lookup, plus write permissions only for the test actions and customer lifecycle you intend to run.

Configure HTTP basic auth and custom user agents through the selected project's `use.httpCredentials` and `use.userAgent`. These are applied to both the storefront browser and Store API contexts, including recreated API contexts after login. Worker API contexts read project-level settings; a test-level override cannot reconfigure a worker context already created. These credentials are separate from customer login and Admin API authentication. They are not forwarded to the Admin API context; that endpoint must remain reachable with its usual authentication.

Browser navigation and Store API requests use the resolved storefront domain, including its host and path. Store API setup applies the domain's language and currency. It performs a context initialization request; existing mode is not a zero-request fixture.

## Customer lifecycle

`StorefrontCustomer` is an overridable worker fixture consumed by `DefaultSalesChannel.customer`. It has no separate mode flag.

| Configuration                                                                    | Behavior                                                                                                                                                        |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SHOPWARE_STOREFRONT_CUSTOMER_EMAIL` and `SHOPWARE_STOREFRONT_CUSTOMER_PASSWORD` | Resolve an active, non-guest account eligible for this channel, then verify its credentials through a Store API login. Never register the account for deletion. |
| Neither credential supplied                                                      | Create one customer per worker in the existing channel and delete its captured owned ID at worker teardown.                                                     |
| Only one credential supplied                                                     | Fail before customer creation; do not fall back to another account.                                                                                             |
| Explicit `use.storefrontCustomer: { email, password }`                           | Override the environment-derived credentials.                                                                                                                   |

`SMOKE_CUSTOMER_EMAIL` / `SMOKE_CUSTOMER_PASSWORD` remain supported as legacy aliases. If either new variable is nonempty, only the new pair is considered; values from the two naming schemes are never combined.

Supplied credentials are validated during fixture setup. An invalid password fails with an error identifying the credential settings. This validation performs a real customer login and creates a Store API session; it does not reset the password or delete the customer.

Missing credentials create a customer even for a browsing-only test. Creation can trigger shop flows. To browse anonymously without provisioning a customer, override the worker fixture:

```ts
import { test as base } from '@shopware-ag/acceptance-test-suite';

export const test = base.extend({
    StorefrontCustomer: [async ({}, use) => { await use(undefined); }, { scope: 'worker' }],
});
```

Alternatively, a project fixture can supply its own customer and own that account's lifecycle. It can depend on `ExistingStorefront` and `AdminApiContext`; depending on `DefaultSalesChannel` or test-scoped `TestDataService` would create a dependency cycle. Accessing `DefaultSalesChannel.customer` when no customer is available throws a clear error. Login tasks that consume this property otherwise retain their API.

## Theme, locale and browser compatibility

Existing mode skips theme compilation checks, assignment, repair and the related cache clearing. It uses the channel's current theme. `Theme.id` has no automatic value in this mode; explicitly override `Theme` if a test needs one.

The browser uses the resolved domain locale instead of `LANG`. Translation-backed page objects and the `Translate` fixture use the active page's translator. Browser setup fails clearly if that language has no bundled or custom translation resources; supply the `CustomTranslationResources` worker fixture for additional languages. A language having resources does not guarantee that every custom-theme label matches the bundled strings.

Existing-mode browser contexts preserve `contextOptions`, basic auth and user agent settings. Generated storefront contexts retain their historical option handling; this feature does not change that behavior.

`AdminSession`, `AdminPage`, and the ATS default `page` / `context` fixtures provision an Admin session and are unavailable in existing mode. Keep Administration tests in a generated project. Neutral setup and verification through `AdminApiContext` remain available.

## Test selection, writes and cleanup

This option changes channel ownership, not the intent of a test. Existing regression specs can still create products, categories, customers and orders through `TestDataService`. They do not automatically become smoke tests or reuse the deployed catalog.

Use an explicit file allowlist (`testMatch`) or eligibility tag (`grep`) after reviewing each test's assumptions about data, navigation, currency, plugins and selectors. Tests against a custom theme may need project-specific page objects. A test that creates a product and expects it on the homepage still needs compatible navigation and listing configuration.

Every worker shares the selected channel. Set the project's `workers: 1` for scenarios that mutate channel state or share a customer's cart/orders. A separate project can still execute concurrently, so also avoid running conflicting projects against the same channel. Parallelism is not forbidden for independent read-only checks, but it must be a deliberate consumer decision; the package does not reject all multi-worker projects.

Borrowed-channel protections apply to `TestDataService` obtained through the ATS fixture:

- `setSystemConfig()` fails before modifying the borrowed channel, because its historical teardown resets keys to `null` rather than restoring existing overrides. Use a generated channel for configuration-changing tests.
- Analytics assignment and cleanup registration that would reset fields on the borrowed channel fail. Registering the borrowed channel for deletion is rejected during cleanup.
- Explicitly created test entities are still cleaned up. Cleanup can flush the delayed cache with `refreshOpenSearch=true`; it is not limited to record deletion.
- An unused borrowed data service performs no cleanup writes or cache flush. Generated-mode cleanup retains its previous behavior.
- A reused customer is not deleted. A default worker-created customer is deleted by captured ID without generic channel-wide cleanup.

Direct Admin API writes and custom cleanup remain the responsibility of the test. ATS does not enforce a read-only policy for arbitrary tests. Methods that explicitly create or associate data may affect the real channel. A production smoke suite must choose non-mutating tests, avoid worker customer creation and review any customer-login side effects separately.

The first tax returned by the backend remains the default when test data needs a tax. It is not necessarily the shop's standard rate. Override the `Tax` fixture when exact tax semantics matter. Browsing with a project-provided or anonymous customer does not require a tax record merely to construct the base fixtures.

## Verification and integration

The committed local regressions cover domain resolution, credential selection, customer ownership and teardown, locale diagnostics, basic auth, routing before/after login, generated-mode compatibility and borrowed-channel cleanup guards. These use local stubs, not proof of compatibility with a deployed shop.

CI contains explicit existing-storefront steps for the Shopware version matrix and SaaS, in addition to the normal generated-mode runs. Check those steps after changing the package; a green generated-mode run does not establish existing-mode compatibility.

When integrating changes such as worker channel deletion or shard-derived IDs, retain this ownership distinction: a generated channel may be owned by the fixture, while the resolved existing channel must never be deleted by fixture teardown. Verify the target shop's version, permissions, custom theme and workflows on a development or staging environment before choosing its smoke coverage.
