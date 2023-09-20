---
nav:
  title: Code
  position: 20

---

# Fonts and Format for Code

Fonts and formats for inline code, code blocks, non-code items, API reference, classes and methods are detailed below:

## Inline code

* Inline code is a short snippet of code. Use ``backticks (`)`` for single-line code/ inline code.

* The following are examples of inline code:

  * Attribute names and values

  * Command Line (CLI) utility names

  * Class, methods, and function names

  * Enum names

  * Command output

  * Data types

  * Environment variable names

  * File names and paths

  * Folders and directories

  * HTTP methods and status codes

  * HTTP status codes

  * Alias names

  * Parameter values

Below are a few more instances:

### HTTP status codes

* In general, put the number and the name of the status code in code font:

    HTTP `400 Bad Request` status code

* To refer to a range of codes, use the following form:

    `HTTP 2xx` or `200` status code

* If you prefer to specify an exact range, use the following form:

    HTTP status code in the `400-499` range

### Command prompt

* If your CLI instructions show single-line or multi-line input, start each line of input with the `$` prompt symbol.

* Don't show the current directory path before the prompt, even if part of the instruction includes changing directories.

### Placeholders

* In a code output, explain any placeholder that appears in the sample output the first time.

* Mention the placeholders in complete capital and italicized code font.

* In markdown, wrap inline placeholders in ``backticks (`)`` and `asterisk (*)`.

 ```markdown
 (*`PLACEHOLDER_NAME`*)
 ```

* Don't use *X* as a placeholder; instead, use an informative placeholder name.

## Code blocks

* Code blocks are used for code snippets longer than a single line or terminal commands containing sample output when executed.

* In markdown, code blocks are represented using a `code fence (```)`.

* Mention language identifier to enable syntax highlighting in your fenced code block.

 ````markdown

  ```markdown
  Language identifier is markdown here.  
  ```

 ````

* When using code blocks within lists, use correct indention to avoid breaking the list. For example,

::: tip

* Payment

  ```jsx
  const pay_type = <Payment type=COD />;
  ```

* Transaction

:::

::: danger

* Payment

```jsx
const pay_type = <Payment type=COD />;
```

* Transaction

:::

* Don't use tabs to indent text within a code block; use two spaces.

* Use three dots (...) on a separate line to indicate that more lines of output are omitted from the sample output.

* Refer to [Syntax & Guidelines](https://handbook.shopware.com/Product/Guides/Development/DeveloperDocumentation#syntax--guidelines) for more examples.

## Items to put in ordinary (non-code) font

The following list includes items that should not be in code font:

* Email addresses

* Domain names

* URLs

* Names of products, services, and organizations

## API reference

* The API reference code must describe every class, interface, struct, constant, field, enum, and method, with a description for each parameter and the status codes.

* Capitalize the API method names such as `GET`, `PUT`, `PATCH,` etc.

* Provide meaningful information about the request parameters. Link them to other sections of the documentation for more explanations.

* Include any valid and default value at the end of the parameter description. For example, *Valid values are `true` and `false`. The default is `false`.*

* In detailed documentation, elaborate on how to use the API, including invoking or instantiating it, the key features, and best practices or pitfalls.

## Classes and methods

* Describe the class briefly and state the intended function with information that can't be deduced from the class name and signature.

* Describe the method briefly and what action the method performs. In subsequent sentences, state any pre-requisites that must be met before calling it, explain why and how to use the method, give details about exceptions that may occur, and specify any related APIs.

* Method names should be followed by a pair of parentheses `()`.

* You may also cross-link parameters, classes, and methods.

## Deprecations

When something is deprecated, tell the user what to use as a replacement or what to do to make their code work. For example,

::: warning

**Deprecated** - Access it using this getProd() method instead.

:::

The following section deals with asset (files, images, and videos) management.
