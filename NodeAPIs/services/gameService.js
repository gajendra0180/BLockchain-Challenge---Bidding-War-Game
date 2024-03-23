const { contract } = require("../utils/contract");

async function getCurrentRoundDetails() {
  try {
    const gameStatus = await contract.methods.getCurrentRoundDetails().call();
    return gameStatus;
  } catch (error) {
    throw error;
  }
}

async function distributeRewards(_from) {
  try {
    await contract.methods.distributeRewards().send({ from: _from });
  } catch (error) {
    throw error;
  }
}

async function startGame(_rewardToken, _from) {
  try {
    await contract.methods.startGame(_rewardToken).send({ from: _from });
  } catch (error) {
    throw error;
  }
}

async function startNextRound(_rewardToken, _from) {
  try {
    await contract.methods.nextRound(_rewardToken).send({ from: _from });
  } catch (error) {
    throw error;
  }
}

async function makeBid(_amount, _from) {
  try {
    await contract.methods.bid(_amount).send({ from: _from });
  } catch (error) {
    throw error;
  }
}

async function getRoundEndtime() {
  try {
    const roundEndtime = await contract.methods.getCurrentRoundEndTime().call();
    return roundEndtime;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getCurrentRoundDetails,
  distributeRewards,
  startGame,
  startNextRound,
  makeBid,
  getRoundEndtime,
};
