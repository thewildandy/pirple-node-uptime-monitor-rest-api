/*
 * This is the entrypoint for the API.
 * Run it with `node index.js`.
 */

 // Import our dependencies
 const http = require('http');
 const url = require('url');
 const StringDecoder = require('string_decoder').StringDecoder;
 const config = require('./config');

 // Configure a simple server to respond to test requests
 const server = http.createServer((request, response) => {
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
});

// Define our request handlers
const handlers = {};

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

// Start the server, listen on the configured port
server.listen(config.server.port, () => {
  console.log('The server is up, listening on port ' + config.server.port + '.');
});
