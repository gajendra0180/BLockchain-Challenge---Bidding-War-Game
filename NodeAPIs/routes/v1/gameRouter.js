const express = require("express");
const gameController = require("../../controllers/gameController");
const router = express.Router();
const preProcesor = require("../../middleware/preProcessor");
// GET requests
router.get("/current-round-details", gameController.getCurrentRoundDetails);
router.get("/round-endtime", gameController.getRoundEndtime);

// POST requests
router.post("/start-game", preProcesor, gameController.startGame);
router.post("/start-next-round", preProcesor, gameController.startNextRound);
router.post(
  "/distribute-rewards",
  preProcesor,
  gameController.distributeRewards
);
router.post("/make-bid", preProcesor, gameController.makeBid);
router.post("/make-native-bid", preProcesor, gameController.makeNativeBid);

module.exports = router;
