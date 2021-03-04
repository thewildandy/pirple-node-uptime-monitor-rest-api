// Define environments
const environments = {};

environments.staging = {
  environmentName: 'staging',
  server: {
    port: 3000
  }
};

environments.production = {
  environmentName: 'production',
  server: {
    port: 5000
  }
};

// Export the relevant environment config
const chosenEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = typeof(environments[chosenEnv]) == 'object' ? environments[chosenEnv] : environments.staging;
module.exports = environmentToExport;
