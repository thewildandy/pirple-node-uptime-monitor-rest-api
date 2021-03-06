const _data = require('./data');
const helpers = require('./helpers');

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

handlers.users = (data, callback) => {
  const acceptedMethods = ['get', 'post', 'put', 'delete'];
  if (acceptedMethods.indexOf(data.method) > -1) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
}

handlers._users = {};

// todo: only allow auth'd access to the user's own data
handlers._users.get = function (data, cb) {
  const phoneNumber = typeof(data.queryParams.phoneNumber) == 'string' && data.queryParams.phoneNumber.trim().length >= 10 ? data.queryParams.phoneNumber : false;
  if (phoneNumber) {
    _data.read('user', phoneNumber, (err, user) => {
      if(!err && user) {
        delete user.password;
        cb(200, user);
      } else {
        cb(404);
      }
    });
  } else {
    cb(400, { message: 'Missing required parameter: Phone Number' });
  }
}

handlers._users.post = function (data, cb) {
  const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName : false;
  const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName : false;
  const phoneNumber = typeof(data.payload.phoneNumber) == 'string' && data.payload.phoneNumber.trim().length >= 10 ? data.payload.phoneNumber : false;
  const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password : false;
  const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

  if (firstName && lastName && phoneNumber && password && tosAgreement) {
    // Check that the user doesn't already exist
    _data.read('user', phoneNumber, (err, data) => {
      if(err) {
        // Hash the password
        const hashedPassword = helpers.hash(password);
        if (!hashedPassword) {
          cb(500, { message: 'Unable to hash the user\'s password', error: err });
          return;
        }

        // Create a new user object
        const user = {
          firstName,
          lastName,
          phoneNumber,
          password: hashedPassword,
          tosAgreement
        };

        // Persist the user
        _data.create('user', phoneNumber, user, (err, data) => {
          if(!err) {
            cb(200, { message: 'User successfully created.', user: user });
          } else {
            cb(400, { message: 'Unable to create user.', error: err });
          }
        });
      } else {
        cb(400, { 'error': 'A user with that phone number already exists.' });
      }
    });
  } else {
    cb(400, {'error': 'One or more required fields was not provided or was not acceptable.', validatedFields: {
      firstName,
      lastName,
      phoneNumber,
      password,
      tosAgreement
    }});
  }
}

handlers._users.put = function (data, cb) {

}

handlers._users.delete = function (data, cb) {

}

handlers.notFound = (data, callback) => {
  callback(404);
};

module.exports = handlers;
