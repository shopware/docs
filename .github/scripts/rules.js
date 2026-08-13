module.exports = [

  // =====================================================
  // New Documentation
  // =====================================================

  {
      id: "new-doc-page",
      name: "New Documentation Page",
      description: "A completely new documentation page has been added.",
      priority: "high",
      detect: {
          status: ["added"]
      }
  },

  // =====================================================
  // Migration
  // =====================================================

  {
      id: "migration-guide",
      name: "Migration Guide",
      description: "Introduces migration or upgrade guidance.",
      priority: "high",
      detect: {
          paths: [
              /guides\/upgrade/i,
              /migration/i
          ],
          keywords: [
              /\bmigration\b/i,
              /\bupgrade\b/i
          ]
      }
  },

  // =====================================================
  // Breaking Changes
  // =====================================================

  {
      id: "breaking-change",
      name: "Breaking Changes",
      description: "Documents a breaking change.",
      priority: "high",
      detect: {
          keywords: [
              /\bbreaking\b/i,
              /\bbreaking changes\b/i,
              /\bbackward incompatible\b/i,
              /\bBC\b/
          ]
      }
  },

  // =====================================================
  // Deprecation
  // =====================================================

  {
      id: "deprecation",
      name: "Deprecation",
      description: "Documents a deprecated feature.",
      priority: "high",
      detect: {
          keywords: [
              /\bdeprecated\b/i,
              /\bdeprecation\b/i
          ]
      }
  },

  // =====================================================
  // Store API
  // =====================================================

  {
      id: "store-api",
      name: "Store API",
      description: "Introduces Store API documentation.",
      priority: "high",
      detect: {
          paths: [
              /store-api/i
          ],
          keywords: [
              /GET\s+\/store-api/i,
              /POST\s+\/store-api/i,
              /PATCH\s+\/store-api/i,
              /DELETE\s+\/store-api/i
          ]
      }
  },

  // =====================================================
  // Admin API
  // =====================================================

  {
      id: "admin-api",
      name: "Admin API",
      description: "Introduces Admin API documentation.",
      priority: "high",
      detect: {
          paths: [
              /admin-api/i
          ],
          keywords: [
              /GET\s+\/api/i,
              /POST\s+\/api/i,
              /PATCH\s+\/api/i,
              /DELETE\s+\/api/i
          ]
      }
  },

  // =====================================================
  // Extension Points
  // =====================================================

  {
      id: "extension-point",
      name: "Extension Point",
      description: "Introduces a new extension point.",
      priority: "high",
      detect: {
          keywords: [
              /\bextension point\b/i,
              /\bhook\b/i,
              /\bevent\b/i,
              /\bdecorator\b/i,
              /\bsubscriber\b/i
          ]
      }
  },

  // =====================================================
  // SDK
  // =====================================================

  {
      id: "sdk",
      name: "SDK",
      description: "Introduces SDK documentation.",
      priority: "high",
      detect: {
          keywords: [
              /\bSDK\b/,
              /\bMeteor\b/,
              /\bApp SDK\b/i,
              /\bAdmin SDK\b/i
          ]
      }
  },

  // =====================================================
  // Security
  // =====================================================

  {
      id: "security",
      name: "Security",
      description: "Security related documentation.",
      priority: "medium",
      detect: {
          keywords: [
              /\bOAuth\b/i,
              /\bauthentication\b/i,
              /\bauthorization\b/i,
              /\bpermissions?\b/i,
              /\bsecurity\b/i
          ]
      }
  },

  // =====================================================
  // Performance
  // =====================================================

  {
      id: "performance",
      name: "Performance",
      description: "Performance related documentation.",
      priority: "medium",
      detect: {
          keywords: [
              /\bperformance\b/i,
              /\bcache\b/i,
              /\bindexer\b/i,
              /\bqueue\b/i,
              /\basync\b/i
          ]
      }
  }

];
