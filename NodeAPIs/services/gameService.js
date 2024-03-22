const { Web3 } = require("web3");
const contractABI = require("../ABI/ABI_BiddingWar.json");
const { BIDDING_WAR_CONTRACT_ADDRESS } = require("../utils/PRODADDRESS");
const web3Provider = "https://nodeapi.test.energi.network/v1/jsonrpc"; // Energi Testnet JSON RPC endpoint
const webSocket = "wss://nodeapi.test.energi.network/ws";

// Create a new Web3 instance using the provided provider
const web3 = new Web3(web3Provider);

const contract = new web3.eth.Contract(
  contractABI,
  BIDDING_WAR_CONTRACT_ADDRESS
);
async function getCurrentRoundDetails() {
  try {
    const gameStatus = await contract.methods.getCurrentRoundDetails().call();
    return gameStatus;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getCurrentRoundDetails,
};
