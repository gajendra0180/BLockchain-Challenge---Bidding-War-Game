import { ethers, network } from "hardhat";
import { BiddingWar } from "../PRODADDRESS";
import { BiddingWar__factory } from "../../typechain-types";
const main = async () => {
  const [admin] = await ethers.getSigners();

  const biddingWar = BiddingWar__factory.connect(BiddingWar, admin);

  const roundDetails = await biddingWar.getCurrentRoundDetails();
  const adminAddr = await biddingWar.getAdmin();

  console.log(roundDetails, "This is the round details");
  console.log(adminAddr, "This is the admin address");
};

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
