
module.exports = [
    // --------------------------------------------------
    // NEW DOCUMENTATION ARTICLES
    // --------------------------------------------------
    {
        id: "new-article",
        name: "New Developer Documentation Article",
        description: "Adds a new developer guide, tutorial, reference, example, or learning resource.",
        priority: "medium",
        detect: {
            status: ["added"],
            paths: [
                /\.md$/i,
                /\.mdx$/i,
                /\.mdoc$/i
            ]
        }
    },
    {
        id: "new-tutorial-guide",
        name: "New Tutorial or Implementation Guide",
        description: "Introduces a new practical guide that helps developers implement a capability.",
        priority: "high",
        detect: {
            status: ["added"],
            paths: [
                /guides?/i,
                /tutorials?/i,
                /examples?/i,
                /how[-_ ]to/i,
                /getting[-_ ]started/i
            ],
            keywords: [
                /\bimplement(ation)?\b/i,
                /\bbuild(ing)?\b/i,
                /\bconfigure\b/i,
                /\bset up\b/i,
                /\bintegrat(e|ion|ing)\b/i,
                /\bcreate\b/i
            ]
        }
    },

    // --------------------------------------------------
    // MCP AND AI INTEGRATIONS
    // --------------------------------------------------
    {
        id: "mcp-capabilities",
        name: "MCP Capabilities",
        description: "Adds or changes MCP tools, resources, prompts, API handles, or server/client behavior.",
        priority: "high",
        detect: {
            paths: [
                /mcp/i,
                /model[-_/ ]context[-_/ ]protocol/i
            ],
            keywords: [
                /\btools\/list\b/i,
                /\btools\/call\b/i,
                /\bresources\/list\b/i,
                /\bresources\/read\b/i,
                /\bprompts\/list\b/i,
                /\bAPI handle\b/i,
                /\btool handler\b/i,
                /\btool registration\b/i,
                /\bMCP server\b/i,
                /\bMCP client\b/i,
                /\bMCP resource\b/i,
                /\bMCP prompt\b/i,
                /\bMCP tool\b/i,
                /\bmodel context protocol\b/i
            ]
        }
    },
    {
        id: "ai-agent-integration",
        name: "AI and Agent Integrations",
        description: "Adds developer-facing AI integrations, agent workflows, or tool-calling capabilities.",
        priority: "high",
        detect: {
            paths: [
                /mcp/i,
                /ai/i,
                /agent/i,
                /integration/i
            ],
            keywords: [
                /\bAI integration\b/i,
                /\bagent workflow\b/i,
                /\btool calling\b/i,
                /\bfunction calling\b/i,
                /\bAI assistant\b/i,
                /\bagent integration\b/i
            ]
        }
    },

    // --------------------------------------------------
    // API AND DATA CONTRACTS
    // --------------------------------------------------
    {
        id: "api-capabilities",
        name: "API Capabilities",
        description: "Adds or changes API endpoints, operations, parameters, schemas, or response behavior.",
        priority: "high",
        detect: {
            paths: [
                /store[-_/]?api/i,
                /admin[-_/]?api/i,
                /api/i,
                /endpoint/i,
                /route/i,
                /openapi/i,
                /swagger/i
            ],
            keywords: [
                /\bnew endpoint\b/i,
                /\bAPI handle\b/i,
                /\bnew API operation\b/i,
                /\brequest parameter\b/i,
                /\bresponse field\b/i,
                /\brequest schema\b/i,
                /\bresponse schema\b/i,
                /\bAPI capability\b/i,
                /\bendpoint added\b/i,
                /\bAPI operation added\b/i
            ]
        }
    },
    {
        id: "api-authentication",
        name: "API Authentication and Authorization",
        description: "Changes API authentication, authorization, scopes, or access requirements.",
        priority: "high",
        detect: {
            paths: [
                /api/i,
                /security/i,
                /auth/i,
                /oauth/i,
                /permission/i,
                /acl/i
            ],
            keywords: [
                /\bOAuth scope\b/i,
                /\bAPI permission\b/i,
                /\bAPI authentication\b/i,
                /\baccess token\b/i,
                /\bauthorization requirement\b/i,
                /\bAPI access\b/i
            ]
        }
    },
    {
        id: "data-model-contract",
        name: "Data Model and Contract Changes",
        description: "Changes entities, fields, relationships, schemas, serialization, or data contracts used by developers.",
        priority: "high",
        detect: {
            paths: [
                /entity/i,
                /definition/i,
                /schema/i,
                /serializer/i,
                /serialization/i,
                /dal/i,
                /data[-_/ ]model/i
            ],
            keywords: [
                /\bnew entity\b/i,
                /\bnew field\b/i,
                /\bnew association\b/i,
                /\bdata contract\b/i,
                /\bserialization format\b/i,
                /\bentity definition\b/i,
                /\bfield added\b/i
            ]
        }
    },

    // --------------------------------------------------
    // EXTENSION DEVELOPMENT
    // --------------------------------------------------
    {
        id: "extension-points",
        name: "Extension Points",
        description: "Adds or changes events, hooks, subscribers, decorators, or other extension mechanisms.",
        priority: "high",
        detect: {
            paths: [
                /extension/i,
                /plugin/i,
                /subscriber/i,
                /event/i,
                /hook/i,
                /decorator/i
            ],
            keywords: [
                /\bnew extension point\b/i,
                /\bnew event\b/i,
                /\bnew hook\b/i,
                /\bnew subscriber\b/i,
                /\bnew decorator\b/i,
                /\bplugin extension\b/i,
                /\bapp extension\b/i,
                /\bextension mechanism\b/i
            ]
        }
    },
    {
        id: "app-system",
        name: "App System Capabilities",
        description: "Adds or changes app lifecycle, manifests, webhooks, app scripts, or app extension capabilities.",
        priority: "high",
        detect: {
            paths: [
                /app/i,
                /manifest/i,
                /webhook/i,
                /app[-_/ ]scripts/i
            ],
            keywords: [
                /\bnew app capability\b/i,
                /\bmanifest option\b/i,
                /\bnew webhook\b/i,
                /\bapp lifecycle\b/i,
                /\bapp script\b/i,
                /\bapp permission\b/i
            ]
        }
    },
    {
        id: "plugin-system",
        name: "Plugin Development",
        description: "Changes plugin lifecycle, plugin APIs, service decoration, or plugin development behavior.",
        priority: "high",
        detect: {
            paths: [
                /plugin/i,
                /bundle/i,
                /service/i
            ],
            keywords: [
                /\bplugin lifecycle\b/i,
                /\bplugin API\b/i,
                /\bplugin configuration\b/i,
                /\bservice decoration\b/i,
                /\bplugin compatibility\b/i
            ]
        }
    },

    // --------------------------------------------------
    // SDK, CLI, AND DEVELOPER TOOLS
    // --------------------------------------------------
    {
        id: "sdk-capabilities",
        name: "SDK Capabilities",
        description: "Adds or changes SDK methods, clients, libraries, or developer APIs.",
        priority: "high",
        detect: {
            paths: [/sdk/i, /client/i, /libraries/i],
            keywords: [
                /\bnew SDK method\b/i,
                /\bSDK capability\b/i,
                /\bnew SDK client\b/i,
                /\bSDK support\b/i,
                /\bclient library\b/i
            ]
        }
    },
    {
        id: "cli-capabilities",
        name: "CLI Capabilities",
        description: "Adds or changes CLI commands, flags, options, or developer workflows.",
        priority: "high",
        detect: {
            paths: [/cli/i, /command/i, /console/i],
            keywords: [
                /\bnew CLI command\b/i,
                /\bnew command\b/i,
                /\bnew command option\b/i,
                /\bnew CLI flag\b/i,
                /\bCLI workflow\b/i
            ]
        }
    },
    {
        id: "integration-capabilities",
        name: "Integration Capabilities",
        description: "Adds or changes supported integrations, connectors, or external service workflows.",
        priority: "high",
        detect: {
            paths: [/integration/i, /connector/i, /webhook/i],
            keywords: [
                /\bnew integration\b/i,
                /\bnew connector\b/i,
                /\bintegration support\b/i,
                /\bexternal service integration\b/i,
                /\bwebhook support\b/i
            ]
        }
    },

    // --------------------------------------------------
    // MIGRATIONS AND COMPATIBILITY
    // --------------------------------------------------
    {
        id: "migration-upgrade",
        name: "Migration and Upgrade Changes",
        description: "Adds or changes migration steps, upgrade procedures, or version requirements.",
        priority: "high",
        detect: {
            paths: [/migration/i, /upgrade/i, /version/i],
            keywords: [
                /\bmigration guide\b/i,
                /\bupgrade guide\b/i,
                /\bupgrade requirement\b/i,
                /\bmigration step\b/i,
                /\bversion upgrade\b/i,
                /\bupgrade procedure\b/i
            ]
        }
    },
    {
        id: "breaking-deprecation",
        name: "Breaking Changes and Deprecations",
        description: "Documents or introduces breaking changes, removals, or deprecations.",
        priority: "high",
        detect: {
            paths: [
                /migration/i,
                /upgrade/i,
                /breaking/i,
                /deprecat/i,
                /changelog/i,
                /api/i,
                /reference/i
            ],
            keywords: [
                /\bbreaking change(s)?\b/i,
                /\bbackward incompatible\b/i,
                /\bdeprecated\b/i,
                /\bdeprecation\b/i,
                /\bremoved API\b/i,
                /\bno longer supported\b/i,
                /\bwill be removed\b/i
            ]
        }
    },

    // --------------------------------------------------
    // SECURITY AND PERMISSIONS
    // --------------------------------------------------
    {
        id: "security-permissions",
        name: "Security and Permissions",
        description: "Changes developer-facing security requirements, permissions, authentication, or access control.",
        priority: "high",
        detect: {
            paths: [
                /security/i,
                /permission/i,
                /authorization/i,
                /authentication/i,
                /oauth/i,
                /acl/i
            ],
            keywords: [
                /\bnew permission\b/i,
                /\bpermission added\b/i,
                /\bsecurity requirement\b/i,
                /\bauthentication requirement\b/i,
                /\baccess control\b/i,
                /\bOAuth scope\b/i,
                /\bcredential requirement\b/i
            ]
        }
    },

    // --------------------------------------------------
    // CONFIGURATION, ENVIRONMENT, AND DEPLOYMENT
    // --------------------------------------------------
    {
        id: "configuration-environment",
        name: "Configuration and Environment Requirements",
        description: "Changes environment variables, configuration options, dependencies, or deployment requirements.",
        priority: "high",
        detect: {
            paths: [
                /config/i,
                /environment/i,
                /deployment/i,
                /installation/i,
                /requirements/i,
                /docker/i,
                /paas/i
            ],
            keywords: [
                /\benvironment variable\b/i,
                /\bnew configuration option\b/i,
                /\brequired dependency\b/i,
                /\bminimum (PHP|Node\.?js|Symfony) version\b/i,
                /\bdeployment requirement\b/i,
                /\bnew requirement\b/i,
                /\bconfiguration default\b/i
            ]
        }
    },

    // --------------------------------------------------
    // PERFORMANCE AND PROCESSING
    // --------------------------------------------------
    {
        id: "performance-processing",
        name: "Performance and Processing Behavior",
        description: "Changes queues, indexing, caching, asynchronous processing, or execution behavior.",
        priority: "high",
        detect: {
            paths: [
                /queue/i,
                /indexing/i,
                /cach(e|ing)/i,
                /performance/i,
                /async/i,
                /processing/i
            ],
            keywords: [
                /\bnew message queue\b/i,
                /\bqueue transport\b/i,
                /\bindexing behavior\b/i,
                /\bcache invalidation\b/i,
                /\basync processing\b/i,
                /\bbackground processing\b/i,
                /\bperformance improvement\b/i,
                /\bprocessing behavior\b/i
            ]
        }
    },

    // --------------------------------------------------
    // FRONTEND, STOREFRONT, AND CMS
    // --------------------------------------------------
    {
        id: "frontend-cms",
        name: "Frontend and CMS Capabilities",
        description: "Adds or changes storefront, frontend, Administration, or CMS extension capabilities.",
        priority: "high",
        detect: {
            paths: [
                /storefront/i,
                /frontend/i,
                /cms/i,
                /administration/i
            ],
            keywords: [
                /\bnew CMS element\b/i,
                /\bnew CMS block\b/i,
                /\bfrontend extension\b/i,
                /\bstorefront event\b/i,
                /\bnew storefront capability\b/i,
                /\bAdministration extension\b/i
            ]
        }
    },

    // --------------------------------------------------
    // COMMERCE AND BUSINESS LOGIC
    // --------------------------------------------------
    {
        id: "commerce-capabilities",
        name: "Commerce Capabilities",
        description: "Adds or changes cart, checkout, rules, promotions, pricing, or Flow Builder capabilities.",
        priority: "high",
        detect: {
            paths: [
                /cart/i,
                /checkout/i,
                /rule/i,
                /flow/i,
                /promotion/i,
                /pricing/i
            ],
            keywords: [
                /\bnew cart capability\b/i,
                /\bcheckout behavior\b/i,
                /\bnew rule condition\b/i,
                /\bnew rule action\b/i,
                /\bFlow Builder\b/i,
                /\bnew promotion capability\b/i,
                /\bpricing behavior\b/i
            ]
        }
    },

    // --------------------------------------------------
    // TESTING AND QUALITY TOOLS
    // --------------------------------------------------
    {
        id: "testing-tooling",
        name: "Developer Testing and Tooling",
        description: "Adds developer-facing testing utilities, test commands, validation tools, or debugging capabilities.",
        priority: "medium",
        detect: {
            paths: [
                /testing/i,
                /test-tools/i,
                /debug/i,
                /validation/i
            ],
            keywords: [
                /\bnew testing tool\b/i,
                /\bnew validation command\b/i,
                /\bdebugging capability\b/i,
                /\btest utility\b/i,
                /\btesting workflow\b/i
            ]
        }
    }
];