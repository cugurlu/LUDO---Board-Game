var express = require('express');
var gameStatus = require("../statTracker");
var router = express.Router();

router.use(express.static("public"));

/* Pressing the 'START' button, returns this page */
router.get("/start", (req, res) => {
  res.sendFile("gameScreen.html", {root: "./public"});
});

/* Home page */
router.get("/", (req, res) => {
    res.render("splash.ejs", { gamesInitialized: gameStatus.gamesInitialized,
                               gamesAborted: gameStatus.gamesAborted,
                               gamesCompleted: gameStatus.gamesCompleted });
});

module.exports = router

