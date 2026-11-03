# OpenAPI DTO generation handover

This guide explains how to continue development of the PHP request and response DTO generator introduced in [Shopware PR 17858](https://github.com/shopware/shopware/pull/17858).

Status: experimental, PR open when reviewed on November 3, 2026.

Examples and behavior below refer to commit [`b3cf347`](https://github.com/shopware/shopware/tree/b3cf347ded55d6009a2d30d0efdf74c988dd9c03), rather than a released Shopware version.

## Short PR summary

The PR makes OpenAPI schemas the source for generated PHP DTOs, including typed properties, nested objects, enums, validation attributes, and explicit schema default constants.

Generation is opt-in through `x-dto-namespace`, with a command and CI check to keep committed PHP files aligned with schemas.
If the namespace is removed later, the DTOs are not automatically removed.
This is missing for now.

Runtime support maps JSON requests into DTOs and converts returned response DTOs into validated JSON responses, including status codes, headers, cookies, extension events, and media and SEO URL replacement.

The implementation evolved from a generator prototype into an HTTP integration, with a newsletter status V2 route and fixtures covering required, optional, nullable, defaulted, and nested fields.

Symfony JsonStreamer was tried during development and later removed; the current implementation uses Symfony Serializer with `DtoNormalizer`.

The PR remains a proof of concept with unresolved review findings, especially around plugin schema generation, mapping boundaries, error responses, and broader route adoption.

## Start here

Run commands from a checkout of the Shopware PR branch with Composer dependencies installed and its normal development environment configured.

```bash
gh pr checkout 17858 --repo shopware/shopware
bin/console open-api:generate-dtos
bin/console open-api:generate-dtos --check
```

Generation writes missing or changed files and leaves current files untouched, ignoring differences in the generated timestamp.

`--check` writes nothing and returns a failure exit code when expected files are missing or differ.

Commit schema changes and generated PHP together.

Review removed or renamed operations manually because generation does not delete obsolete DTO files and `--check` does not detect them.

## Code map

Paths below are relative to the Shopware repository, with generator classes under `src/Core/Framework/Api/OpenApi/`.

- `OpenApiOperationReader.php` finds operations, including OpenAPI 3.2 `query` operations.
- `OpenApiDtoSchemaParser.php` resolves references and composition, builds DTO definitions, and records property types, constraints, defaults, and response status codes.
- `OpenApiDtoClassRenderer.php` turns definitions into PHP classes or enums, attributes, imports, constructors, and constants.
- `OpenApiDtoGenerator.php` loads schema directories, selects tagged operations and components, resolves output paths, writes files, and checks freshness.
- `src/Core/Framework/Api/Command/OpenApiDtoGenerationCommand.php` exposes generation and check modes.
- `src/Core/Framework/Api/AbstractDto.php` owns field presence checks and plugin extension data.
- `src/Core/Framework/Api/Request/AbstractRequest.php` and `Response/AbstractResponse.php` provide request and response bases.
- `src/Core/Framework/Api/Serializer/DtoNormalizer.php` handles DTO serialization and denormalization.
- `src/Core/Framework/Api/Response/DTOResponseListener.php` handles returned response DTOs on `kernel.view`.
- `src/Core/Framework/DependencyInjection/api.php` wires generator and runtime services.

Read the [DTO contract](https://github.com/shopware/shopware/blob/b3cf347ded55d6009a2d30d0efdf74c988dd9c03/src/Core/Framework/Api/OpenApi/AGENTS.md) before changing generation behavior.

## Add or change a schema

The generator loads `AdminApi` and `StoreApi` separately from `src/Core/Framework/Api/ApiDefinition/Generator/Schema/`.

It uses the core schema directories directly, rather than the merged schema served by a running installation.

An operation needs `operationId` and `x-dto-namespace` to produce operation DTOs.

For example, add this operation inside an existing Store API path document:

```json
{
  "/example": {
    "post": {
      "operationId": "createExample",
      "x-dto-namespace": "Shopware\\Core\\Framework\\Api\\Example",
      "x-dto-package": "framework",
      "requestBody": {
        "required": true,
        "content": {
          "application/json": {
            "schema": {
              "type": "object",
              "required": ["name"],
              "properties": {
                "name": { "type": "string", "minLength": 1 },
                "note": { "type": ["string", "null"], "default": null }
              }
            }
          }
        }
      },
      "responses": {
        "200": {
          "description": "Created example",
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["name"],
                "properties": {
                  "name": { "type": "string" },
                  "note": { "type": ["string", "null"] }
                }
              }
            }
          }
        }
      }
    }
  }
}
```

This produces `CreateExampleRequest.php` and `CreateExampleResponse.php` under `src/Core/Framework/Api/Example/`.

The snippet shows generation metadata and body shapes; complete authentication, error responses, tags, and other API documentation before adopting it as a real endpoint.

- `x-dto-namespace` determines placement, mapping the `Shopware\` prefix to `src/`, rather than resolving arbitrary Composer PSR-4 mappings.
- `x-dto-package` supplies the generated `#[Package(...)]` attribute.
- A component with its own `x-dto-namespace` owns its generated location and can be reused across operation namespaces.
- `x-dto-inline: true` marks a reusable composition fragment that is flattened into referencing DTOs without generating its own class.
- Operation DTO names derive from PascalCase `operationId` plus `Request` or `Response`.

Use OpenAPI `3.2.0` for complete schema documents and test fixtures.

## Preserve field presence and null

Required fields become mandatory constructor arguments, even when nullable or given a schema default.

Optional fields stay uninitialized until explicitly assigned, including fields with `const`, a single-value enum, or a default.

`has('field')` distinguishes an omitted field from one explicitly set to `null`; `isset()` cannot make that distinction.

Access optional properties only after checking presence, because reading an uninitialized typed property throws an error.

Explicit schema defaults generate `DEFAULT_<FIELD_NAME>` constants, including `default: null`, while absent defaults generate no constant.

Business code chooses when to apply these defaults:

```php
$note = $payload->has('note')
    ? $payload->note
    : CreateExampleRequest::DEFAULT_NOTE;

$response = new CreateExampleResponse(name: $payload->name);
$response->note = $note;
```

Serialization omits uninitialized fields and preserves explicitly assigned `null` values.

Keep DTOs mutable so extension listeners can change them.

`extensions` is reserved, inherited, optional plugin data and must never become a required schema field or a redeclared generated property.

## Wire a route

Generating a DTO does not register a route or service.

Register the controller using the normal Shopware route and service configuration, then accept a generated request through `#[MapRequestPayload]` and return the generated response directly.

For the generated example, a controller method can use:

```php
use Shopware\Core\Framework\Api\Example\CreateExampleRequest;
use Shopware\Core\Framework\Api\Example\CreateExampleResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;

public function create(
    #[MapRequestPayload] CreateExampleRequest $payload,
): CreateExampleResponse {
    return new CreateExampleResponse(name: $payload->name);
}
```

The response listener dispatches `<route-name>.encode`, validates the resulting DTO, serializes it, replaces URL placeholders, and builds a `JsonResponse`.

Invalid response DTOs raise a constraint violation exception with HTTP 500.

Use `setStatusCode()`, `setHeader()`, and `addCookie()` on response DTOs for HTTP metadata.

Use `ExtensionDispatcher::publish()` around route business logic and the `AbstractDto` extension helpers for plugin data.

The newsletter example lives in `src/Core/Checkout/Customer/SalesChannel/AccountNewsletterRecipientV2Route.php`, with its extension event and generated response under `NewsletterRecipient/`.

The fuller request example is `tests/integration/Core/Framework/Api/OpenApi/Fixture/DtoFieldsRoute.php`, alongside `schema.json`, generated DTOs, and its route extension.

Do not assume generated path or query properties are automatically populated by `MapRequestPayload`; parameter extraction during generation and HTTP argument mapping are separate concerns.

## Validate changes

Run these checks from the Shopware checkout:

```bash
bin/console open-api:generate-dtos
bin/console open-api:generate-dtos --check
bin/console lint:container
./vendor/bin/phpunit tests/unit/Core/Framework/Api/OpenApi
./vendor/bin/phpunit tests/unit/Core/Framework/Api/Command/OpenApiDtoGenerationCommandTest.php
./vendor/bin/phpunit tests/unit/Core/Framework/Api/AbstractDtoTest.php
./vendor/bin/phpunit tests/integration/Core/Framework/Api/OpenApi/OpenApiDtoTest.php
```

Integration tests require the normal Shopware test database and fixtures.

Generator regression cases live under `tests/unit/Core/Framework/Api/OpenApi/_fixtures/`, pairing schema JSON with expected generated PHP.

`OpenApiDtoGeneratorTest` compares generation against adjacent fixtures while normalizing timestamps, and also checks the integration fixture DTOs.

Add a focused fixture for each generator behavior change and update expected PHP alongside its schema.

The HTTP integration test covers mapping, validation, presence, defaults applied by business code, nested DTOs, and route extension hooks.

## Remaining work

These limits are visible in the reviewed implementation:

- Only the first declared numeric `2xx` response is selected, so additional success shapes and error response DTOs are not generated.
  Telgi: yes, that is true. but at least it is possible to define the response code. but there are no different DTOs for different response codes.
  Not sure, how relevant that is in practice.
- An operation response without extracted properties produces no response DTO.
- Header parameters are excluded from generated request properties.
  Telgi: yes, with the current Symfony version we are using it is not possible to map the header. but this was introduced with Symfony 8.1, so we can build that with SW 6.8
- Generation does not load plugin schema directories or support arbitrary plugin Composer namespace placement.
  Telgi: yes, for now only the core is supported.
  but that should be easily possible.
- Removed schema definitions can leave stale PHP files behind.
  Telgi: yes, that is known issue as already mentioned above.

PR review also raises issues to reproduce and resolve before using this as a general route pattern:

- Align request validation error bodies with existing Store API errors and decide how unknown request fields should behave.
  Telgi: there is already an issue for that https://github.com/shopware/shopware/issues/21687
- Decide how DTO responses should support `includes`, `apiAlias`, entity collections, and DAL criteria mapping.
  Telgi: easy answer: not at all! Future API endpoint should be so well-designed that it is no longer needed to exclude or include specific fields.
  Also the new DTOs have nothing in common with the DAL.
  We need to see that as two separate things.
  The new DTOs are living on the boundary to the outside as input and output.
  In the end, the DAL and the entities should only be used internally by Shopware and not exposed via API directly anymore.
- Check response body fields named `statusCode`, `headers`, or `cookies` for collisions with base response metadata.
  Telgi: yes, still needs to be done similar to extensions
- Fix newsletter service wiring, stored enum handling, extension timing, and missing route tests.
  Telgi: just a POC, not ready to merge
- Add HTTP coverage for the `.encode` event and invalid response DTOs.
- Decide whether generator-specific schema diagnostics should complement `--check`, including reporting all schema errors rather than stopping at the first.

Review comments are findings to verify, not completed fixes or final design decisions.

Recommended next step: get container lint and focused tests green, then add an entity-list route example to settle request criteria handling and entity-to-DTO mapping before converting more endpoints.
