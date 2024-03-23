const express = require("express");
const gameController = require("../../controllers/gameController");
const router = express.Router();
const auth = require("../../middleware/auth");
// GET requests
router.get("/current-round-details", gameController.getCurrentRoundDetails);
router.get("/round-endtime", gameController.getRoundEndtime);

// POST requests
router.post("/start-game", auth, gameController.startGame);
router.post("/start-next-round", auth, gameController.startNextRound);
router.post("/distribute-rewards", auth, gameController.distributeRewards);
router.post("/make-bid", auth, gameController.makeBid);


module.exports = router;
