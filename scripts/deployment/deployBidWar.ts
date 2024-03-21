const hre = require("hardhat");

async function main() {
  const deployer = (await hre.ethers.getSigners())[0];
  const BiddingWar = await hre.ethers.getContractFactory("BiddingWar");
  const bidwar = await BiddingWar.deploy(
    deployer.address,
    500,
    3600,
    600,
    "0x0000000000000000000000000000000000000000"
  );

  await bidwar.deployed();

  console.log("Bidwar deployed to:", bidwar.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
