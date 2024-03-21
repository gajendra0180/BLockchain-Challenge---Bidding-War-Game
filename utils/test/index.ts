// These utils will be provider-aware of the hardhat interface
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Blockchain } from "../common";

chai.use(solidity);

import { ethers } from "hardhat";

// Hardhat-Provider Aware Exports
const provider = ethers.provider;
// HARDHAT / WAFFLE
export const getWaffleExpect = (): Chai.ExpectStatic => {
  return chai.expect;
};

export const addSnapshotBeforeRestoreAfterEach = () => {
  const blockchain = new Blockchain(provider);
  beforeEach(async () => {
    await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertAsync();
  });
};

const SNAPSHOTS: string[] = [];

export function cacheBeforeEach(initializer: Mocha.AsyncFunc): void {
  let initialized = false;
  const blockchain = new Blockchain(provider);

  beforeEach(async function () {
    if (!initialized) {
      await initializer.call(this);
      SNAPSHOTS.push(await blockchain.saveSnapshotAsync());
      initialized = true;
    } else {
      const snapshotId = SNAPSHOTS.pop()!;
      await blockchain.revertByIdAsync(snapshotId);
      SNAPSHOTS.push(await blockchain.saveSnapshotAsync());
    }
  });

  after(async function () {
    if (initialized) {
      SNAPSHOTS.pop();
    }
  });
}
export { getAccounts, getEthBalance, getRandomAccount } from "./accountUtils";

