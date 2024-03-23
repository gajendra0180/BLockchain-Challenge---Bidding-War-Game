const { contract, web3js, contractAddress } = require("../utils/contract");
const { sendTransaction } = require("../utils/helper");

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
    let distributeRewardsTransactionObj = {
      from: _from,
      gasPrice: web3js.utils.toHex(20 * 1e9),
      gasLimit: web3js.utils.toHex(2100000),
      to: contractAddress,
      data: contract.methods.distributeRewards().encodeABI(),
    };
    await sendTransaction(distributeRewardsTransactionObj, _fromPrivateKey);
  } catch (error) {
    throw error;
  }
}

async function startGame(_rewardToken, _from, _fromPrivateKey) {
  try {
    let startGameTransactionObj = {
      from: _from,
      gasPrice: web3js.utils.toHex(20 * 1e9),
      gasLimit: web3js.utils.toHex(2100000),
      to: contractAddress,
      data: contract.methods.startGame(_rewardToken).encodeABI(),
    };
    await sendTransaction(startGameTransactionObj, _fromPrivateKey);
  } catch (error) {
    throw error;
  }
}

async function startNextRound(_rewardToken, _from, _fromPrivateKey) {
  try {
    let startNextRoundTransactionObj = {
      from: _from,
      gasPrice: web3js.utils.toHex(20 * 1e9),
      gasLimit: web3js.utils.toHex(2100000),
      to: contractAddress,
      data: contract.methods.nextRound(_rewardToken).encodeABI(),
    };
    await sendTransaction(startNextRoundTransactionObj, _fromPrivateKey);
  } catch (error) {
    throw error;
  }
}

async function makeBid(_amount, _from, _fromPrivateKey) {
  try {
    let makeBidTransactionObj = {
      from: _from,
      gasPrice: web3js.utils.toHex(20 * 1e9),
      gasLimit: web3js.utils.toHex(2100000),
      to: contractAddress,
      data: contract.methods.bid(_amount).encodeABI(),
    };
    await sendTransaction(makeBidTransactionObj, _fromPrivateKey);
  } catch (error) {
    throw error;
  }
}

async function makeNativeBid(_amount, _from, _fromPrivateKey) {
  try {
    let makeBidTransactionObj = {
      from: _from,
      gasPrice: web3js.utils.toHex(20 * 1e9),
      gasLimit: web3js.utils.toHex(2100000),
      to: contractAddress,
      value: "0xb1a2bc2ec50000", // 0.1 NRG, use the _amount here
      data: contract.methods.bidNative().encodeABI(),
    };
    await sendTransaction(makeBidTransactionObj, _fromPrivateKey);
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
  makeNativeBid,
  getRoundEndtime,
};
