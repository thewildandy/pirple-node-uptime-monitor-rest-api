// Define environments
const environments = {};

environments.staging = {
  environmentName: 'staging',
  server: {
    httpPort: 3000,
    httpsPort: 3001,
    sslKeyPath: './https/key.pem',
    sslCertPath: './https/cert.pem',
  },
  hashingSecret: 'weaksecret',
};

environments.production = {
  environmentName: 'production',
  server: {
    httpPort: 5000,
    httpsPort: 5001,
    sslKeyPath: './https/key.pem',
    sslCertPath: './https/cert.pem',
  },
  hashingSecret: 'superstrongsecret',
};

// Export the relevant environment config
const chosenEnv = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';
const environmentToExport = typeof(environments[chosenEnv]) == 'object' ? environments[chosenEnv] : environments.staging;
module.exports = environmentToExport;
