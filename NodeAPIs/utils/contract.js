const { Web3 } = require("web3");
const contractABI = require("../ABI/ABI_BiddingWar.json");
const { BIDDING_WAR_CONTRACT_ADDRESS } = require("../utils/PRODADDRESS");
const web3Provider = "https://nodeapi.test.energi.network/v1/jsonrpc"; // Energi Testnet JSON RPC endpoint
const wssWeb3Provider = "wss://nodeapi.test.energi.network/ws";

// Create a new Web3 instance using the provided provider
const web3 = new Web3(web3Provider);
const wssWeb3 = new Web3(wssWeb3Provider);

module.exports = {
  contract: new web3.eth.Contract(contractABI, BIDDING_WAR_CONTRACT_ADDRESS),
  contract_wss: new wssWeb3.eth.Contract(contractABI, BIDDING_WAR_CONTRACT_ADDRESS),
};
