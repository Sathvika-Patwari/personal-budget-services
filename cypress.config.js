const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  integration: [
    {
      baseUrl: "http://localhost:3001",
      viewportWidth: 1440,
      viewportHeight: 900,
      ignoreTestFiles: "**/node_modules/**",
      video: false,
      pluginsFile: false,
      env: {
        "cypress-image-snapshot": {
          experimentalImageSnapshotApi: true,
          customSnapshotsDir: "cypress/snapshots",
          customDiffDir: "cypress/diffs",
        },
      },
    },
    // Add more configurations if needed
  ],
});
