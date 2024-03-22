const { Web3 } = require("web3");
const contractABI = require("../ABI/ABI_BiddingWar.json");
const contractAddress = "0x1dC4c1cEFEF38a777b15aA20260a54E584b16C48";
const { BIDDING_WAR_CONTRACT_ADDRESS } = require("../utils/PRODADDRESS");
const web3Provider = "wss://nodeapi.test.energi.network/ws";
const logger = require("../utils/logger");

// Create a new Web3 instance using the provided provider
const web3 = new Web3(web3Provider);
logger.log("Listening for events...");

const contract = new web3.eth.Contract(
  contractABI,
  BIDDING_WAR_CONTRACT_ADDRESS
);

// using contract.methods to get value
const bidEvent = contract.events.BidMade();
bidEvent.on("data", () => {
  logger.info("New bid made!");
  logger.logToFile(
    "bidEvent",
    `New bid made! ${bidEvent.returnValues._bidder} bid ${bidEvent.returnValues._bidAmount}`
  );
});

const RewardsDistributedEvent = contract.events.RewardsDistributed();
RewardsDistributedEvent.on("data", () => {
  logger.info("Rewards distributed!");
  logger.logToFile(
    "RewardsDistributedEvent",
    `Rewards distributed! ${RewardsDistributedEvent.returnValues._lastRewardedRound}`
  );
});
