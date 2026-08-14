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

          // Must live in migration/upgrade documentation
          paths: [
              /guides\/upgrade/i,
              /migration/i
          ],

          // PR title or description should indicate migration work
          keywords: [
              /\bmigration\b/i,
              /\bupgrade\b/i
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
          "Introduces a new Store API or Admin API capability.",

      priority: "high",

      detect: {

          // New documentation page
          status: [
              "added"
          ],

          // API documentation folders
          paths: [
              /store-api/i,
              /admin-api/i,
              /api/i
          ],

          // PR title or description
          keywords: [
              /\bnew api\b/i,
              /\badd api\b/i,
              /\bintroduce api\b/i,
              /\bstore api\b/i,
              /\badmin api\b/i
          ]

      }

  }

];
