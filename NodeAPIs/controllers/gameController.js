const gameService = require("../services/gameService.js");
const { stringify, filterObj } = require("../utils/helper.js");
const logger = require("../utils/logger.js");

async function getCurrentRoundDetails(req, res) {
  try {
    const roundDetails = await gameService.getCurrentRoundDetails();
    filterObj(roundDetails);
    res.json({ round: stringify(roundDetails) });
  } catch (error) {
    logger.error("Error getting game status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function distributeRewards(req, res) {
  try {
    await gameService.distributeRewards(req.address);
    res.json({ message: "Rewards distributed" });
  } catch (error) {
    logger.error("Error distributing rewards:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function startGame(req, res) {
  try {
    await gameService.startGame(req.reward_token, req.address, req.privateKey);
    res.json({ message: "Game started" });
  } catch (error) {
    logger.error("Error starting game:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function startNextRound(req, res) {
  try {
    await gameService.startNextRound(
      req.reward_token,
      req.address,
      req.private_key
    );
    res.json({ message: "Next round started" });
  } catch (error) {
    logger.error("Error starting next round:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function makeBid(req, res) {
  try {
    await gameService.makeBid(req.amount, req.address, req.private_key);
    res.json({ message: "Bid placed" });
  } catch (error) {
    logger.error("Error placing bid:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function makeNativeBid(req, res) {
  try {
    await gameService.makeNativeBid(req.amount, req.address, req.private_key);
    res.json({ message: "Bid placed" });
  } catch (error) {
    logger.error("Error placing bid:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

async function getRoundEndtime(req, res) {
  try {
    const roundEndtime = await gameService.getRoundEndtime();
    filterObj(roundEndtime);
    res.json({ endtime: stringify(roundEndtime) });
  } catch (error) {
    logger.error("Error getting round endtime:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  getCurrentRoundDetails,
  distributeRewards,
  startGame,
  startNextRound,
  makeBid,
  makeNativeBid,
  getRoundEndtime,
};
