const { web3js } = require("../utils/contract");
const logger = require("../utils/logger");

module.exports = {
  stringify: (value) => {
    // Works the same as JSON.stringify,
    // but also handles BigInt type:
    if (value !== undefined) {
      return JSON.parse(
        JSON.stringify(value, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      );
    }
  },
  filterObj: (roundDetails) => {
    for (key in roundDetails) {
      if (!isNaN(key)) {
        delete roundDetails[key];
      }
    }
  },
  sendTransaction: async (transactionObj, privateKey) => {
    await web3js.eth.accounts
      .signTransaction(transactionObj, Buffer.from(privateKey, "hex"))
      // signing transaction using the sender's private key
      // probably not the best way to do , but as we do not have any access to metamask for signing the transaction, this is the best way I can think of
      .then(function (value) {
        web3js.eth
          .sendSignedTransaction(value.rawTransaction)
          .then(function (response) {
            logger.info("Transaction Successful", response);
          })
          .catch((err) => {
            logger.error(err);
          });
      })
      .catch((err) => {
        logger.error(err);
      });
  },
};
