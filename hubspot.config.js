module.exports = {
  // HubSpot Project Configuration
  project: {
    name: "NOBA ATS Integration",
    version: "1.0.0",
    platformVersion: "2025.1"
  },

  // OAuth Configuration
  oauth: {
    clientId: process.env.HUBSPOT_CLIENT_ID || "1f511560-e8a1-4e5f-a192-5e960797f9ea",
    clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
    redirectUri: process.env.HUBSPOT_REDIRECT_URI || "http://localhost:3000/auth/callback",
    scopes: [
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.companies.read",
      "crm.objects.companies.write",
      "crm.objects.deals.read",
      "crm.objects.deals.write",
      "oauth"
    ]
  },

  // Build Configuration
  build: {
    entry: "./src/index.js",
    outputDir: "./dist"
  },

  // Development Configuration
  development: {
    port: 3000,
    dashboardPort: 5173
  }
};