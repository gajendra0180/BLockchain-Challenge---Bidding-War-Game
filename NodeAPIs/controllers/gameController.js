const gameService = require("../services/gameService.js");

async function getCurrentRoundDetails(req, res) {
  try {
    const roundDetails = await gameService.getCurrentRoundDetails();
    res.json({ round: roundDetails });
  } catch (error) {
    console.error("Error getting game status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
    getCurrentRoundDetails,
};
