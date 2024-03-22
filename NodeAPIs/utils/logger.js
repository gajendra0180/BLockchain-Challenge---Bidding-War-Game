const fs = require("fs");
const path = require("path");

module.exports = {
  info: (message) => {
    console.log(`INFO: ${message}`);
  },
  error: (message) => {
    console.log(`ERROR: ${message}`);
  },
  warn: (message) => {
    console.log(`WARN: ${message}`);
  },
  debug: (message) => {
    console.log(`DEBUG: ${message}`);
  },
  log: (message) => {
    console.log(message);
  },
  logToFile: (event,message) => {
    // Implement log to file functionality here
    const filePath = path.join(__dirname, "../logs/log.txt");
    fs.appendFile(filePath, `Event: ${event} ${message}\n`, (err) => {
      if (err) {
        console.log("Error writing to log file");
      }
    });
  },
};
