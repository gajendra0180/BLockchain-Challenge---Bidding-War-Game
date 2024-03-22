const express = require('express');
const gameController = require('../../controllers/gameController');
const router = express.Router();

router.get('/current-round-details', gameController.getCurrentRoundDetails);

module.exports = router;
