# Fonts and Format for Codes

## Code Format

* To mark a block of code such as a lengthy command or a code sample, use a code fence (```) in Markdown.

* In Markdown, use backticks (`) for single line code. The following list includes items that should be in code font:

    * Attribute names and values

    * Command Line (CLI) utility names

    * Class, methods and function names

    * Enum names

    * Command output

    * Data types

    * Environment variable names

    * File names and paths

    * Folders and directories

    * HTTP methods and status codes

    * HTTP status codes

    * Alias names

## Items to put in ordinary (non-code) font

The following list includes items that should not be in code font:

* Email addresses

* Domain names

* URLs

* Names of products, services, and organizations

## HTTP Status Codes

* In general, put the number and the name of status code in code font.

    HTTP `400 Bad Request` status code

* To refer to a range of codes, use the following form:

    `HTTP 2xx` or `200` status code

* If you prefer to specify an exact range, use the following form:

    HTTP status code in the `400-499` range

## Command Prompt

* If your CLI instructions show multiple lines of input, then start each line of input with the `$` prompt symbol

* Don't show the current directory path before the prompt, even if part of the instruction includes changing directories

## Placeholders

* In a code output, explain any placeholder that appear in the sample output the first time. Mention the placeholders in complete capital letters.

```markdown
<code><var>PLACEHOLDER_NAME</var></code>
```

* Don't use *X* as placeholders; rather, use an informative placeholder name.

* In Markdown, wrap inline placeholders in backticks (\`) , and asterisk (\*) to represent them in italicized font and code text (*`PLACEHOLDER_NAME`*).

## API reference code

* The API reference must describe every class, interface, struct, constant, field, enum, and method, with a description for each parameter and the status codes.

* In detailed documentation, elaborate on how to use the API, including how to invoke or instantiate it, what some of the key features are, and any best practices or pitfalls.

## Classes and methods

Describe the class briefly and state the intended function with information that can't be deduced from the class name and signature.

Describe the method briefly about what action the method performs. In subsequent sentences, state any prerequisites that must be met before calling it, explain why and how to use the method, give details about exceptions that may occur, and specify any related APIs.

## Parameters

Capitalize the first word, and end the sentence or phrase with a period.

## Deprecations

When something is deprecated, tell the user what to use as a replacement. For example, If a method is deprecated, tell the reader what to do to make their code work. For example,

{% hint style="" %}
**Deprecated** - Access it using this getProd() method instead.
{% endhint %}

The next section deals with asset management.
