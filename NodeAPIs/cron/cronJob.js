import { CronJob } from "cron";
const { contract } = require("../utils/contract");
const { stringify, filterObj } = require("../utils/helper.js");
const {
  DEFAUTL_REWARD_TOKEN,
  CONTRACT_OWNER_ADDRESS,
} = require("../utils/PRODADDRESS.js");

new CronJob(
  "* /5 * * * *", // cronTime
  async function () {
    let roundEndtime = await contract.methods.getCurrentRoundEndTime().call();
    filterObj(roundEndtime);
    roundEndtime = stringify(roundEndtime);
    if (roundEndtime * 1000 <= Date.now()) {
      // restart the game
      await contract.methods
        .nextRound(DEFAUTL_REWARD_TOKEN)
        .send({ from: CONTRACT_OWNER_ADDRESS }); // probably this won't work because no txn signing is being done. Need to look deep into this if we want to implement this.
    }
  },
  null,
  true,
  "Asia/Kolkata"
);
