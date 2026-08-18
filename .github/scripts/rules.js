module.exports = [

  // ==================================================
  // Rule 1 - New Migration Guide
  // ==================================================

  {
    id: "migration-guide",

    name: "New Migration Guide",

    description:
        "Introduces a new migration or upgrade guide for developers.",

    priority: "high",

    detect: {

        // File must be newly added
        status: [
            "added"
        ],

        // Actual Shopware documentation location
        paths: [
            /guides\/upgrades-migrations/i,
            /upgrades-migrations/i
        ]

    }

},

  // ==================================================
  // Rule 2 - New API Documentation
  // ==================================================

  {
    id: "new-api",

    name: "New API Documentation",

    description:
        "Introduces a new Store API or Admin API capability for developers.",

    priority: "high",

    detect: {

        // New documentation page
        status: [
            "added"
        ],

        // API documentation locations
        paths: [
            /store-api/i,
            /admin-api/i,
            /resources\/references\/api/i
        ]

    }

},

// ==================================================
  // Rule 3 - New Extension Point
  // ==================================================

{
  id: "extension-point",

  name: "New Extension Point",

  description:
      "Introduces a new extension point for app or plugin developers.",

  priority: "high",

  detect: {

      // New documentation page
      status: [
          "added"
      ],

      // Extension-related documentation
      paths: [
          /extensions/i,
          /plugins/i,
          /extension-points/i
      ],

      // Optional keywords inside PR title/body
      keywords: [
          /\bextension point\b/i,
          /\bevent\b/i,
          /\bhook\b/i,
          /\bsubscriber\b/i,
          /\bdecorator\b/i
      ]

  }

}

];
