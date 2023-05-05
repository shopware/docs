# Basic Conventions

## Codebase conventions

List of naming conventions the B2B Suite complies to:

| Group                                                                                              | Practice                                                                            |
|----------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------|
| DI Container                                                                                       | All container ids look like `b2b_*.*`                                               |
| The first asterisk is the component name                                                            |                                                                                     |
| The second asterisk is a class name abbreviation                                                   |                                                                                     |
| Database                                                                                           | All table names start with `b2b_`                                                   |
| All table names are in singular                                                                |                                                                                     |
| All field and table names are in snake case                                                         |                                                                                     |
| Attributes                                                                                         | All attribute names start with `swag_b2b_`                                          |
| Subscriber                                                                                         | All subscriber methods are named in accordance with their function, not to the event  |
| Tests                                                                                              | All test methods are in snake case                                                  |
| All test methods start with `test_`                                                                |                                                                                     |
| Templates                                                                                          | All new layout modules are wrapped in `b2b--*` class containers                     |
| Modules reuse the template style of Shopware                                                       |                                                                                     |
| CSS Selectors                                                                                      | Three levels of selector depth as max                                                   |
| Twig Blocks                                                                                        | {% raw %}`{% block b2b_* %}{% endblock %}`{% endraw %} empty blocks are in one line |                                                                                     |
| JavaScript                                                                                         | The B2B Suite is written in TypeScript                                              |
| Storefront plugins                                                                                 | File names end with *.plugin.ts                                                     |
| Interfaces                                                                                         | File names start with `I`, e.g., `IAjaxPanelEvent.ts`                                |
| Snippets                                                                                           | The root snippet key is `b2b`                                                       |

## Entity naming conventions

In order to make a more comprehensible B2B UI for English storefronts, some domain entities (i.e: Contact, Contingent Rule) do not have parallel naming conventions between the B2B GUI and the codebase:

| English term (Display name)                        | B2B-Suite term (Entity name)                      |
|----------------------------------------------------|---------------------------------------------------|
| Company Administrator                              | Debtor                                            |
| Employee                                           | Contact                                           |
| Cart details                                       | Positions                                         |
| Quick order                                        | Fastorder                                         |
| Quote                                              | Offers                                            |
| Purchase restriction                               | Contingent                                        |
| Order restriction                                  | Contingent rule                                   |
| Product restriction                                | Contingent restrictions                           |

You can use the table above as a reference to identify a domain entity in the codebase when working with the B2B storefront.
