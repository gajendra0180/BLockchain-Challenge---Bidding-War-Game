//  Write middle ware code here

const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async function (req, res, next) {
  try {
    for (let keys of Object.keys(req.body)) {
      req[keys] = req.body[keys];
    }
    // perform relevant authentication here
    // Approach would be to Sign transaction from frontend
    // send the txn hash to backend which submits it on chain
    // Now we can use the address from the txn hash to authenticate
    // Need to look further into it, never done this before

    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
