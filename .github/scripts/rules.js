
module.exports = [
    {
        id: "migration-upgrade",
        name: "Migration and Upgrade Changes",
        description: "Introduces or changes migration instructions, upgrade procedures, or migration requirements.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed"],
            paths: [
                /upgrades?[-_/]migrations?/i,
                /migration/i,
                /upgrade/i
            ],
            keywords: [
                /\bmigration(s)?\b/i,
                /\bupgrade(s|d|ing)?\b/i,
                /\bmigrate\b/i,
                /\bversion upgrade\b/i
            ]
        }
    },
    {
        id: "api-capability",
        name: "API Capabilities",
        description: "Documents a new or changed API capability, endpoint, operation, or request/response behavior.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed"],
            paths: [
                /store[-_/]?api/i,
                /admin[-_/]?api/i,
                /references?\/api/i,
                /api[-_/](reference|guides?)/i
            ],
            keywords: [
                /\bAPI\b/i,
                /\bendpoint\b/i,
                /\brequest(s)?\b/i,
                /\bresponse(s)?\b/i,
                /\bAPI operation\b/i,
                /\bAPI capability\b/i
            ]
        }
    },
    {
        id: "extension-point",
        name: "New or Changed Extension Points",
        description: "Documents an extension point or a change affecting app and plugin developers.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed"],
            paths: [
                /extension[-_/]?points?/i,
                /plugin[-_/]?system/i,
                /app[-_/]?system/i,
                /extensions?/i,
                /plugins?/i
            ],
            keywords: [
                /\bextension point\b/i,
                /\bnew event\b/i,
                /\bnew hook\b/i,
                /\bsubscriber\b/i,
                /\bdecorator\b/i,
                /\bextend(ing|s)?\b/i,
                /\bplugin developers?\b/i,
                /\bapp developers?\b/i
            ]
        }
    },
    {
        id: "breaking-deprecation",
        name: "Breaking Changes and Deprecations",
        description: "Documents a breaking change, removed behavior, or deprecated feature relevant to developers.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed", "removed"],
            paths: [
                /upgrades?[-_/]migrations?/i,
                /migration/i,
                /breaking[-_/]?changes?/i,
                /deprecat/i,
                /references?/i,
                /changelog/i
            ],
            keywords: [
                /\bbreaking change(s)?\b/i,
                /\bbackward incompatible\b/i,
                /\bdeprecated?\b/i,
                /\bdeprecation\b/i,
                /\bremoved\b/i,
                /\bno longer supported\b/i,
                /\bwill be removed\b/i
            ]
        }
    },
    {
        id: "security-permissions",
        name: "Security and Permissions",
        description: "Documents a developer-relevant change to authentication, authorization, permissions, or security requirements.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed"],
            paths: [
                /security/i,
                /permission/i,
                /authorization/i,
                /authentication/i,
                /oauth/i,
                /acl/i,
                /user[-_/]?management/i
            ],
            keywords: [
                /\bsecurity\b/i,
                /\bauthentication\b/i,
                /\bauthorization\b/i,
                /\bpermissions?\b/i,
                /\baccess control\b/i,
                /\bOAuth\b/i,
                /\bcredentials?\b/i,
                /\bsecurity requirement(s)?\b/i
            ]
        }
    },
    {
        id: "developer-capabilities",
        name: "New Developer Capabilities",
        description: "Introduces or changes developer tools, SDKs, CLI commands, integrations, or app development capabilities.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed"],
            paths: [
                /sdk/i,
                /\bcli\b/i,
                /command[-_/]?line/i,
                /developer[-_/]?tools?/i,
                /integrations?/i,
                /app[-_/]?system/i,
                /plugin[-_/]?system/i
            ],
            keywords: [
                /\bSDK\b/i,
                /\bCLI\b/i,
                /\bcommand[- ]line\b/i,
                /\bnew command\b/i,
                /\bintegration\b/i,
                /\bdeveloper tool\b/i,
                /\bapp development\b/i,
                /\bplugin development\b/i
            ]
        }
    },
    {
        id: "configuration-environment",
        name: "Configuration and Environment Requirements",
        description: "Documents a developer-relevant configuration, environment variable, dependency, or deployment requirement.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed"],
            paths: [
                /configuration/i,
                /config(?:uration)?/i,
                /environment/i,
                /deployment/i,
                /installation/i,
                /requirements?/i,
                /docker/i,
                /paas/i
            ],
            keywords: [
                /\benvironment variable(s)?\b/i,
                /\bconfiguration\b/i,
                /\brequired dependency\b/i,
                /\bminimum (PHP|Node\.?js|Symfony) version\b/i,
                /\bdeployment requirement(s)?\b/i,
                /\bconfiguration option\b/i,
                /\bnew requirement\b/i,
                /\binstallation requirement(s)?\b/i
            ]
        }
    },
    {
        id: "performance-processing",
        name: "Performance and Processing Behavior",
        description: "Documents a developer-relevant change to queues, indexing, caching, asynchronous processing, or processing behavior.",
        priority: "high",
        detect: {
            status: ["added", "modified", "renamed"],
            paths: [
                /message[-_/]?queues?/i,
                /queue/i,
                /indexing/i,
                /cach(e|ing)/i,
                /performance/i,
                /async/i,
                /asynchronous/i,
                /processing/i
            ],
            keywords: [
                /\bmessage queue(s)?\b/i,
                /\bqueue(s)?\b/i,
                /\bindexing\b/i,
                /\bcaching\b/i,
                /\bperformance\b/i,
                /\basynchronous\b/i,
                /\basync processing\b/i,
                /\bprocessing behavior\b/i,
                /\bbackground processing\b/i
            ]
        }
    }
];