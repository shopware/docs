---
nav:
  title: Code quality
  position: 90
---

# Code quality

In the final step, the quality of the extension is checked.  
The extension should adhere to Shopware's standards and avoid duplicating code and functions if they already exist.

## Review process

All extensions are subject to an automated code review (for example, PHPStan, SonarQube) as part of the quality assurance process, with particular focus on potential impacts on the Administration and Storefront.
In addition, a manual review is conducted to assess security, coding standards, user experience, and overall functionality.
The current configurations for automated code reviews (PHPStan and SonarQube) used during app submission via the Shopware Account are publicly available on GitHub.

## SonarQube rules (blocker)

The use of the following statements is strictly prohibited and will result in rejection:

- `die`
- `exit`
- `var_dump`
- Link: [Refer to the list of the already existing blockers](https://s3.eu-central-1.amazonaws.com/wiki-assets.shopware.com/1657519735/blocker.txt).

## Error messages and logging

Error and informational messages may only be recorded within the Shopware log directory (`/var/log/`).
A dedicated logging service must be implemented for the extension. Writing exceptions or log entries to the default Shopware log or to locations outside the Shopware logging system is not permitted.
For payment extensions, it is required to use the provided "plugin logger" service. Logs (for example, debug or error logs) must be written to the `/var/log/` directory.

Log files must follow the naming convention:  
`MyExtension-Year-Month-Day.log`

As an alternative, log data may be stored in the database.

The use of custom log tables should be avoided. If such tables are implemented, a scheduled task must be provided to ensure regular cleanup. Log data must not be retained for longer than six months.

## JavaScript delivery

Uncompiled JavaScript code must be included within the delivered binary. The source code must be stored in a dedicated directory to ensure accessibility and maintainability for developers.

## Cross-domain communication

Cross-domain communication must be limited to explicitly defined and trusted domains.

When using `postMessage()` or similar cross-window messaging APIs, the origin of incoming messages must be verified. Target domains must be explicitly specified; the use of wildcard targets (for example, `*`) is not permitted.
