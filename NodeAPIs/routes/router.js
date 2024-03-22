const express = require("express");
const gameRouter = require("./v1/gameRouter");
const router = express.Router();

router.use("/v1/game", gameRouter);

module.exports = router;
