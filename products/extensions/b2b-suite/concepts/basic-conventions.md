# Basic Conventions

This is the list of naming conventions the B2B Suite complies to:

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
| Twig Blocks                                                                                        | <code v-pre>{% block b2b_* %}{% endblock %}</code> empty blocks are in one line |                                                                                     |
| JavaScript                                                                                         | The B2B Suite is written in TypeScript                                              |
| Storefront plugins                                                                                 | File names end with *.plugin.ts                                                     |
| Interfaces                                                                                         | File names start with `I`, e.g., `IAjaxPanelEvent.ts`                                |
| Snippets                                                                                           | The root snippet key is `b2b`                                                       |
