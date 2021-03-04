/*
 * This is the entrypoint for the API.
 * Run it with `node index.js`.
 */

// Import our dependencies
const http = require('http');
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');

// Instantiate a HTTP server
const httpServer = http.createServer((request, response) => {
  restHandler(request, response);
});

// Start the HTTP Server
httpServer.listen(config.server.httpPort, () => {
  console.log('The HTTP server is up, listening on port ' + config.server.httpPort + '.');
});

// Instantiate a HTTPS server
const httpsOptions = {
  key: fs.readFileSync(config.server.sslKeyPath),
  cert: fs.readFileSync(config.server.sslCertPath)
};
const httpsServer = https.createServer(httpsOptions, (request, response) => {
  restHandler(request, response);
});

// Start the HTTPS Server
httpsServer.listen(config.server.httpsPort, () => {
  console.log('The HTTPS server is up, listening on port ' + config.server.httpsPort + '.');
});

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

// Define a simple router to resolve to handlers
const router = {
  'test': handlers.test
};

// Configure how our server will respond to requests
const restHandler = function (request, response) {
  // Parse the request URL (including the query string)
  const parsedUrl = url.parse(request.url, true);

  // Get the path and trim it
  const path = parsedUrl.pathname;
  const trimmedPath = path.replace(/^\/+|\/+$/g, '');

  // Get the request method
  const method = request.method.toLowerCase();

  // Get the headers
  const headers = request.headers;

  // Get query params
  const queryParams = parsedUrl.query;

  // Get the request payload (if any)
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  request.on('data', (data) => {
     buffer += decoder.write(data);
  });

  // When the full payload has been received ...
  request.on('end', () => {
    // Complete the buffer
    buffer += decoder.end();

   // Determine the appropriate request handler
   const handler = typeof(handlers[trimmedPath]) !== 'undefined' ? handlers[trimmedPath] : handlers.notFound;

   // Compose the data to pass to the handler
   const data = {
     'path' : trimmedPath,
     'method': method,
     'headers': headers,
     'queryParams' : queryParams,
     'payload': buffer
   };

   // Call the appropriate response handler
   handler(data, (statusCode, payload) => {
     if(typeof(statusCode) !== 'number') statusCode = 200;
     if(typeof(payload) !== 'object') payload = {};

     // Respond to the request
     response.setHeader('Content-Type', 'application/json');
     response.writeHead(statusCode);
     response.end(JSON.stringify(payload));
   });

   console.log('Received ' + method.toUpperCase() + ' request on path: /' + trimmedPath);
 });
}
