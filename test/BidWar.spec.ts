import { Blockchain, ether } from "../utils/common";
var abi = require("ethereumjs-abi");

import { getWaffleExpect, getAccounts } from "../utils/test";
import { BigNumber, Contract } from "ethers";
import { ethers, network } from "hardhat";
import { ADDRESS_ZERO } from "../utils/constant";

const expect = getWaffleExpect();

const { Contract, Signer } = require("ethers");

import {
  StandardTokenMock,
  StandardTokenMock__factory,
} from "../typechain-types";
let deployer = Signer,
  admin = Signer;

describe("BiddingWar", function () {
  let bidWar: Contract;
  let owner: Account;
  let player1: Account;
  let player2: Account;
  let blackhole: Account;
  let rewardToken: StandardTokenMock;
  let blockchain: Blockchain;

  before(async () => {
    [admin, owner, player1, player2, blackhole] = await getAccounts();
    deployer = owner;
    const BidWar = await ethers.getContractFactory("BiddingWar");
    bidWar = await BidWar.connect(owner.wallet).deploy(
      admin.address,
      500,
      3600,
      600,
      ADDRESS_ZERO
    );
    blockchain = new Blockchain(ethers.provider);
  });

  beforeEach(async () => {
    rewardToken = await new StandardTokenMock__factory(deployer.wallet).deploy(
      admin.address,
      0,
      "EnergiToken",
      "NRG",
      18
    );
  });

  const makeBid = async (player: Account, amount: BigNumber) => {
    await rewardToken.mint(player.address, amount);
    await rewardToken.connect(player.wallet).approve(bidWar.address, amount);
    await bidWar.connect(player.wallet).bid(amount);
  };

  const moveTime = async function (secToMove: number) {
    await network.provider.send("evm_increaseTime", [secToMove]);
    await network.provider.send("evm_mine", []);
    console.log("moved seconds: ", secToMove);
  };

  describe("Initialization", async () => {
    it("Initialization should be correct", async () => {
      expect(bidWar.address).to.be.properAddress;
      expect(await bidWar.admin()).to.be.equal(admin.address);
    });
  });

  describe("Admin Functions", function () {
    it("Should fail when Non-Owner Tries to start the game", async function () {
      await expect(
        bidWar.connect(player1.wallet).startGame(rewardToken.address)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should fail when Non-Owner Tries to set commission percent", async function () {
      await expect(
        bidWar.connect(player1.wallet).setCommissionPercent(ether(500))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Should fail when Non-Owner Tries to set round Duration", async function () {
      await expect(
        bidWar.connect(player1.wallet).setRoundDuration(ether(3600))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    it("Can set some other account as admin", async function () {
      await expect(bidWar.connect(owner.wallet).setAdmin(player1.address)).to
        .not.be.reverted;
      expect(await bidWar.admin()).to.equal(player1.address);
    });
  });

  describe("Game Functions", async function () {
    it("Should fail when game is not started", async function () {
      await expect(
        bidWar.connect(player1.wallet).bid(ether(100))
      ).to.be.revertedWith("GameInactive");
    });

    it("Simulate the Game", async function () {
      await bidWar.connect(owner.wallet).startGame(rewardToken.address);
      const roundId = await bidWar.getRoundId();

      await expect(
        (await bidWar.getCurrentRoundDetails()).roundId.toString()
      ).to.equals(roundId);

      const amount = ether(100);
      makeBid(player1, amount);

      await expect(makeBid(player1, amount.add(amount))).to.be.revertedWith(
        "AlreadyBid()"
      );
      rewardToken
        .connect(player1.wallet)
        .transfer(blackhole.address, amount.add(amount));

      await expect(makeBid(player2, amount)).to.be.revertedWith("BidTooLow()");
      rewardToken.connect(player2.wallet).transfer(blackhole.address, amount);

      await expect(makeBid(player1, amount.add(amount))).to.be.revertedWith(
        "AlreadyBid()"
      );
      rewardToken
        .connect(player1.wallet)
        .transfer(blackhole.address, amount.add(amount));

      await expect((await bidWar.getCurrentRoundDetails()).highestBidder).to.eq(
        player1.address
      );

      const roundEndTime = await bidWar.getCurrentRoundEndTime();

      await makeBid(player2, amount.add(amount));

      expect(await bidWar.getCurrentRoundEndTime()).to.be.equals(
        roundEndTime.add(600)
      );

      await expect((await bidWar.getCurrentRoundDetails()).highestBidder).to.eq(
        player2.address
      );
      await expect(makeBid(player2, amount.add(amount))).to.be.revertedWith(
        "BidTooLow()"
      );
      rewardToken
        .connect(player2.wallet)
        .transfer(blackhole.address, amount.add(amount));

      await moveTime(
        roundEndTime
          .add(600)
          .sub(await blockchain.getCurrentTimestamp())
          .toString()
      );

      expect(
        makeBid(player1, amount.add(amount).add(amount))
      ).to.be.revertedWith("GameInactive()");
      rewardToken
        .connect(player1.wallet)
        .transfer(blackhole.address, amount.add(amount).add(amount));

      await bidWar.distributeRewards();

      const rewards = ether(300);
      expect(await rewardToken.balanceOf(player2.address)).to.be.equals(
        rewards.mul(95).div(100)
      );
      expect(await rewardToken.balanceOf(admin.address)).to.be.equals(
        rewards.mul(5).div(100)
      );
      await bidWar.connect(owner.wallet).nextRound(rewardToken.address);
    });
  });
});
