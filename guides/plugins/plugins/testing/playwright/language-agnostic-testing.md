---
nav:
    title: Language Agnostic Testing
    position: 19
---

# Language Agnostic Testing

Language agnostic testing in @shopware-ag/acceptance-test-suite allows you to write acceptance tests that work across different languages without hard-coding text strings. Tests use translation keys instead of hard-coded strings and automatically adapt to different locales via environment variables.

## translate() Function

Use the `translate()` function in page objects to replace hardcoded strings with translation keys.

### Usage in Page Objects

```typescript
import { translate } from '../../services/LanguageHelper';

export class CategoryListing implements PageObject {
    constructor(page: Page) {
        this.createButton = page.getByRole('button', {
            name: translate('administration:category:actions.createCategory'),
        });
    }
}
```

## Translate Fixture

The `Translate` fixture provides translation functionality in tests.

### Usage in Tests

```typescript
import { test, expect } from '@shopware-ag/acceptance-test-suite';

test('Category creation', async ({ AdminPage, Translate }) => {
    const saveText = Translate('administration:category:general.save');
    await AdminPage.getByRole('button', { name: saveText }).click();
});
```

## Environment Control

Switch test language using environment variables:

```bash
LANG=de-DE npm run test  # German
LANG=en-GB npm run test  # English (default)
```

## Translation Keys

Translation keys follow the pattern: `area:module:section.key`

### Examples

```typescript
'administration:category:general.save';
'administration:category:actions.createCategory';
'storefront:account:fields.firstName';
'storefront:checkout:payment.invoice';
```

### Locale Files

Translations are stored in JSON files organized by language and area:

- `locales/en/administration/category.json`
- `locales/de/administration/category.json`
- `locales/en/storefront/account.json`
- `locales/de/storefront/account.json`

### Example Translation Files

**English (`locales/en/administration/category.json`):**

```json
{
    "general": {
        "save": "Save",
        "cancel": "Cancel"
    },
    "actions": {
        "createCategory": "Create category"
    }
}
```

**German (`locales/de/administration/category.json`):**

```json
{
    "general": {
        "save": "Speichern",
        "cancel": "Abbrechen"
    },
    "actions": {
        "createCategory": "Kategorie erstellen"
    }
}
```

## Supported Locales

**Translation Resources**: `en` (English), `de` (German)  
**Browser UI**: `en`, `de`, `fr`, `es`, `it`, `nl`, `pt`

## Common Issues

**Translation key not found:**

- Verify key exists in both EN/DE locale files
- Check import in `locales/index.ts`
- Ensure proper namespace structure

**Tests fail with LANG changes:**

- Move `translate()` calls inside constructors/functions, not at module level
- Ensure translation resources are properly loaded

**JSON import errors:**

- Always use `with { type: 'json' }` import attribute
- Check file paths and naming conventions

**Browser locale not matching:**

- Verify locale mapping in `playwright.config.ts`
- Check browser args configuration
- Ensure language detection is working correctly

## Using in Your Own Project

If you want to use the `@shopware-ag/acceptance-test-suite` in your own project with custom translations, you can extend the base test suite with your own translation fixture.

### Installation

First, install the required dependencies:

```bash
npm install @shopware-ag/acceptance-test-suite @playwright/test
npm install -D @types/node
```

### Create Custom Translation Fixture

Create a new fixture file (e.g., `fixtures/CustomTranslation.ts`):

```typescript
import {
    test as base,
    LanguageHelper,
    TranslationKey,
    TranslateFn,
    BUNDLED_RESOURCES,
    baseNamespaces,
} from '@shopware-ag/acceptance-test-suite';
import { LOCALE_RESOURCES, enNamespaces } from '../locales';

// Merge base BUNDLED_RESOURCES with your custom LOCALE_RESOURCES
const MERGED_RESOURCES = {
    en: { ...BUNDLED_RESOURCES.en, ...LOCALE_RESOURCES.en },
    de: { ...BUNDLED_RESOURCES.de, ...LOCALE_RESOURCES.de },
} as const;

// Merge base and custom namespaces
const mergedNamespaces = {
    ...baseNamespaces,
    ...enNamespaces,
} as const;

type CustomTranslationKey = TranslationKey<typeof mergedNamespaces>;

interface CustomTranslateFixture {
    Translate: TranslateFn<CustomTranslationKey>;
}

export const test = base.extend<CustomTranslateFixture>({
    Translate: async ({}, use) => {
        let lang = process.env.lang || process.env.LANGUAGE || process.env.LANG || 'en';
        let language = lang.split(/[_.-]/)[0].toLowerCase();

        if (!MERGED_RESOURCES[language as keyof typeof MERGED_RESOURCES]) {
            console.warn(
                `⚠️  Translation resources for '${language}' not available. Supported: ${Object.keys(
                    MERGED_RESOURCES
                ).join(', ')}. Falling back to 'en'.`
            );
            language = 'en';
        }

        const languageHelper = await LanguageHelper.createInstance(
            language,
            MERGED_RESOURCES as unknown as typeof BUNDLED_RESOURCES
        );

        const translate: TranslateFn<CustomTranslationKey> = (key, options) => {
            return languageHelper.translate(key as TranslationKey, options);
        };

        await use(translate);
    },
});

export * from '@shopware-ag/acceptance-test-suite';
export type { CustomTranslationKey };
```

### Create Locale Files Structure

Organize your translation files by language and area:

```text
project-root/
├── locales/
│   ├── en/
│   │   ├── administration/
│   │   │   ├── common.json
│   │   │   └── product.json
│   │   └── storefront/
│   │       ├── account.json
│   │       └── checkout.json
│   ├── de/
│   │   ├── administration/
│   │   │   ├── common.json
│   │   │   └── product.json
│   │   └── storefront/
│   │       ├── account.json
│   │       └── checkout.json
│   └── index.ts
├── fixtures/
│   └── CustomTranslation.ts
├── types/
│   └── TranslationTypes.ts
└── tests/
    └── your-test.spec.ts
```

### Create Locales Index

Create `locales/index.ts` to import and export your translation files:

```typescript
// Import all locale files
import enAdministrationCommon from './en/administration/common.json' with { type: 'json' };
import enStorefrontAccount from './en/storefront/account.json' with { type: 'json' };

import deAdministrationCommon from './de/administration/common.json' with { type: 'json' };
import deStorefrontAccount from './de/storefront/account.json' with { type: 'json' };

// Export the bundled resources for i18next
export const LOCALE_RESOURCES = {
    en: {
        'administration/common': enAdministrationCommon,
        'storefront/account': enStorefrontAccount,
    },
    de: {
        'administration/common': deAdministrationCommon,
        'storefront/account': deStorefrontAccount,
    },
} as const;

export const enNamespaces = {
    administration: {
        common: enAdministrationCommon,
    },
    storefront: {
        account: enStorefrontAccount,
    },
} as const;
```

### Create Translation Types

Create `types/TranslationTypes.ts` to define your custom translation types. This provides:

- **Type Safety**: Ensures translation keys exist in your locale files
- **IntelliSense**: Auto-completion for available translation keys
- **Compile-time Validation**: Catches typos and missing keys before runtime

```typescript
import { TranslationKey, TranslateFn } from '@shopware-ag/acceptance-test-suite';
import { enNamespaces } from '../locales';

export type CustomTranslationKey = TranslationKey<typeof enNamespaces>;

export type CustomTranslateFn = TranslateFn<CustomTranslationKey>;
```

### Merge with Base Test Suite

Create your main test fixture that merges the base test suite with your custom translation:

```typescript
import { test as ShopwareTestSuite, mergeTests } from '@shopware-ag/acceptance-test-suite';
import { test as CustomTranslation } from './fixtures/CustomTranslation';

export * from '@shopware-ag/acceptance-test-suite';

export const test = mergeTests(ShopwareTestSuite, CustomTranslation);
```

**Note**: Save this as `test.ts` or `index.ts` in your project root and import it in your test files.

### Usage in Your Tests

Now you can use the `Translate` fixture in your tests:

```typescript
import { test } from './your-main-test-fixture';

test('My localized test', async ({ Translate, AdminPage }) => {
    const saveText = Translate('administration:common:button.save');
    await AdminPage.getByRole('button', { name: saveText }).click();
});
```

### Environment Configuration

Set up your Playwright configuration to support language switching:

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

const LOCALES = { de: 'de-DE', en: 'en-US', fr: 'fr-FR' };

function getLanguage(): string {
    let lang = process.env.lang || process.env.LANGUAGE || process.env.LANG || 'en';
    return lang.split(/[_.-]/)[0].toLowerCase();
}

function getLocaleConfig() {
    const lang = getLanguage();
    const browserLocale = LOCALES[lang as keyof typeof LOCALES] || 'en-US';
    const browserArgs =
        lang !== 'en' && LOCALES[lang as keyof typeof LOCALES]
            ? [`--lang=${browserLocale}`, `--accept-lang=${browserLocale},${lang};q=0.9,en;q=0.8`]
            : [];

    return { lang, browserLocale, browserArgs };
}

export default defineConfig({
    use: {
        locale: getLocaleConfig().browserLocale,
    },
    projects: [
        {
            name: 'Platform',
            use: {
                ...devices['Desktop Chrome'],
                launchOptions: {
                    args: [...getLocaleConfig().browserArgs],
                },
            },
        },
    ],
});
```

### Running Tests with Different Languages

```bash
# German
LANG=de-DE npx playwright test

# English (default)
npx playwright test
```
