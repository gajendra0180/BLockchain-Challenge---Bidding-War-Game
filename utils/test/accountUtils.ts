import { ethers, network } from "hardhat";
import { BigNumber } from "ethers";
import { Address, Account } from "../types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";

const provider = ethers.provider;

export const getAccounts = async (): Promise<Account[]> => {
  const accounts: Account[] = [];

  const wallets = await getWallets();
  for (let i = 0; i < wallets.length; i++) {
    accounts.push({
      wallet: wallets[i],
      address: await wallets[i].getAddress(),
    });
  }

  return accounts;
};

// Use the last wallet to ensure it has Ether
export const getRandomAccount = async (offset?: number): Promise<Account> => {
  if (offset == undefined || offset == 0) offset = 1;
  const accounts = await getAccounts();
  return accounts[accounts.length - offset];
};

export const getEthBalance = async (account: Address): Promise<BigNumber> => {
  return await provider.getBalance(account);
};

// NOTE ethers.signers may be a hardhat specific function
export const getWallets = async (): Promise<SignerWithAddress[]> => {
  return (await ethers.getSigners()) as SignerWithAddress[];
};
