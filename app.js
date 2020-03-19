var express = require("express");
var http = require("http");
var websocket = require("ws");

var indexRouter = require("./routes/index");
var messages = require("./public/javascripts/messages");

var gameStatus = require("./statTracker");
var Game = require("./game");

var port = process.argv[2];
var app = express();

// Set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/', indexRouter);

var server = http.createServer(app);
const wss = new websocket.Server({ server });

var connIdToGameMapping = {};//property: websocket, value: game

/*
 * regularly clean up the connIdToGameMapping object
 */
setInterval(function () {
    for (let i in connIdToGameMapping) {
        if (connIdToGameMapping.hasOwnProperty(i)) {
            let gameObj = connIdToGameMapping[i];
            //if the gameObj has a final status, the game is complete/aborted
            if (gameObj.isEnded() != null) {
                console.log("\tDeleting game " + gameObj.id);
                delete connIdToGameMapping[i];
            }
        }
    }
}, 50000);

var currentGame = new Game(gameStatus.gamesInitialized++);
var connectionID = 0;//each websocket receives a unique ID

wss.on("connection", function connection(ws) {

    /*
     * four-player game: every four players are added to the same game
     */
    let con = ws;
    con.id = connectionID++;
    currentGame.addPlayer(con);
    connIdToGameMapping[con.id] = currentGame;

    console.log("Player %s connected to game %s wıth connection %s", con.playerId, currentGame.id, con.id);

    /*
     * once we have four players, there is no way back;
     * a new game object is created;
     * if a player now leaves, the game is aborted (player is not preplaced)
     */
    if (currentGame.allPlayersJoined()) {
        currentGame = new Game(gameStatus.gamesInitialized++);
    }

    con.on("message", function incoming(message) {
        let gameObj = connIdToGameMapping[con.id];
        console.log("Received from player " + con.playerId + " of game " + gameObj.id + " msg: " + message);
        gameObj.handleMsg(con.playerId, message);
        if (!gameObj.allPlayersJoined() && gameObj.isEnded() && gameObj == currentGame) {
            currentGame = new Game(gameStatus.gamesInitialized++);
        }
    });

    con.on("close", function (code) {
        let gameObj = connIdToGameMapping[con.id];
        console.log("Disconnect by player " + con.playerId + " of game " + gameObj.id);
        if (!gameObj.allPlayersJoined() && gameObj == currentGame) {
            currentGame = new Game(gameStatus.gamesInitialized++);
        }

        /*
           * code 1001 means almost always closing initiated by the client;
           * source: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
           */
        if (code == "1001") {
            gameObj.disconnectAllPlayers(con.playerId);
        }
    });
});

server.listen(port);
