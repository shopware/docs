---
nav:
  title: E2E Commands
  position: 20

---

# E2E Commands

| Command                               | Description                                                      |
|:--------------------------------------|:-----------------------------------------------------------------|
| `bin/console e2e:restore-db`          | Sets Shopware back to state of the backup                        |
| `APP_ENV=e2e bin/console e2e:dump-db` | Creates a backup of Shopware's database                          |
| `composer run e2e:setup`              | Prepares Shopware installation and environment for Cypress usage |
| `composer run e2e:open`               | Opens Cypress' e2e tests runner                                  |
| `composer run e2e:prepare`            | Install dependencies and prepare database for Cypress usage      |
| `composer e2e:cypress -- run --spec="cypress/e2e/administration/**/*.cy.js"`          | Runs Cypress' admin e2e tests in CLI                             |
| `composer e2e:cypress -- run --spec="cypress/e2e/storefront/**/*.cy.js"`     | Runs Cypress' storefront e2e tests in CLI                        |
