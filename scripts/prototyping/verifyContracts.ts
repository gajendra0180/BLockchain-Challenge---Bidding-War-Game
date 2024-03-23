const hre = require("hardhat");

// Array of contract addresses to be verified
import { BiddingWar } from "../PRODADDRESS";

const contractAddresses = [BiddingWar];

async function main() {
  // Loop through all contract addresses and verify them
  for (const contractAddress of contractAddresses) {
    try {
      // Run the hardhat verify task for the current contract address
      await hre.run("verify:verify", {
        address: contractAddress,
      });

      console.log(
        `Contract at address ${contractAddress} verified successfully!`
      );
    } catch (error) {
      console.error(`Failed to verify contract at address ${contractAddress}.`);
      console.error(error);
    }
  }
}

// Call the main function to start verifying contracts
main();
