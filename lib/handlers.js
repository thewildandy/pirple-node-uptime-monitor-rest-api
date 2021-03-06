// Define our request handlers
const handlers = {};

// Define a low-impact handler to use to monitor uptime of this server
// Very meta.
handlers.ping = (data, callback) => {
  callback(200, { message: 'The service is up.' });
}

handlers.test = (data, callback) => {
  // Return all the data we interpretted from the request as the response
  callback(200, data);
};

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
