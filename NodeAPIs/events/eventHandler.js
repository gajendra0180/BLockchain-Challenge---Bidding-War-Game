const logger = require("../utils/logger");
const { contract_wss } = require("../utils/contract");

logger.log("Listening for events...");

const bidEvent = contract_wss.events.BidMade();
bidEvent.on("data", () => {
  logger.info("New bid made!");
  logger.logToFile(
    "bidEvent",
    `New bid made! ${bidEvent.returnValues._bidder} bid ${bidEvent.returnValues._bidAmount}`
  );
});

const RewardsDistributedEvent = contract_wss.events.RewardsDistributed();
RewardsDistributedEvent.on("data", () => {
  logger.info("Rewards distributed!");
  logger.logToFile(
    "RewardsDistributedEvent",
    `Rewards distributed! ${RewardsDistributedEvent.returnValues._lastRewardedRound}`
  );
});
