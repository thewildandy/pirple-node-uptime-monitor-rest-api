/*
 * Library for storing and editing data
 */

// Dependencies
const fs = require('fs');
const path = require('path');

// Container for the module (to be exported)
const lib = {};

// Define the base directory for our data folder
lib.baseDir = path.join(__dirname, '/../.data');

// Write data to a file
lib.create = function (dir, file, data, cb) {
  // Attempt to open the file for writing
  fs.open(path.join(lib.baseDir, dir, file + '.json'), 'wx', (err, fileDescriptor) => {
    if (err || !fileDescriptor) {
      cb('Could not create new file. It may already exist, or its parent directory may not.');
      return;
    }

    const stringData = JSON.stringify(data);
    fs.writeFile(fileDescriptor, stringData, (err) => {
      if(err) {
        cb('Error writing to new file');
        return;
      }

      fs.close(fileDescriptor, (err) => {
        if(err) {
          cb('Error closing new file');
          return;
        }
        cb(false);
      })
    });

    // Convert input data to a string
    console.log('so far so good');
  });
};

lib.read = function (dir, file, cb) {
  fs.readFile(path.join(lib.baseDir, dir, file + '.json'), 'utf8', function (err, data) {
    cb(err, data);
  });
}

lib.update = function (dir, file, data, cb) {
  fs.open(path.join(lib.baseDir, dir, file + '.json'), 'r+', (err, fileDescriptor) => {
    if (err || !fileDescriptor) {
      cb('Could not update file. It might not exist yet.');
      return;
    }

    const stringData = JSON.stringify(data);
    fs.ftruncate(fileDescriptor, (err) => {
      if(!err) {
        fs.writeFile(fileDescriptor, stringData, (err) => {
          if(!err) {
            fs.close(fileDescriptor, (err) => {
              if(!err) {
                cb(false);
                return;
              } else {
                cb('Error closing file.');
              }
            })
          } else {
            cb('Error writing file');
          }
        })
      } else {
        cb('Error truncating file');
      }
    })
  });
}

lib.delete = function (dir, file, cb) {
  fs.unlink(path.join(lib.baseDir, dir, file + '.json'), (err) => {
    if(!err) {
      cb(false);
    } else {
      cb('Error deleting file');
    }
  });
}

// Export the module
module.exports = lib;
