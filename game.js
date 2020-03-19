var messages = require("./public/javascripts/messages");
var gameStatus = require("./statTracker");


/* every game has four players, identified by their WebSocket */
// basic constructor design pattern
var game = function (gameID) {
  this.players = [null, null, null, null];
  this.noOfPlayers = 0;
  this.id = gameID;
  this.gameState = messages.ST_0_JOINT;
  this.diceValue = 0;
  this.currentPlayer = "0";
  this.pawnNumber = "";
  this.position = 0;
  this.movingPawn = "";


  this.onboard = {
    "0_0": 0, "0_1": 0, "0_2": 0, "0_3": 0,
    "1_0": 0, "1_1": 0, "1_2": 0, "1_3": 0,
    "2_0": 0, "2_1": 0, "2_2": 0, "2_3": 0,
    "3_0": 0, "3_1": 0, "3_2": 0, "3_3": 0
  };

  this.basePosition = {
    "0_0": 0, "0_1": 0, "0_2": 0, "0_3": 0,
    "1_0": 0, "1_1": 0, "1_2": 0, "1_3": 0,
    "2_0": 0, "2_1": 0, "2_2": 0, "2_3": 0,
    "3_0": 0, "3_1": 0, "3_2": 0, "3_3": 0
  };
};

game.prototype.allPlayersJoined = function () {
  return (this.noOfPlayers == 4);
};

game.prototype.handleMsg = function (playerId, msg) {
  console.log(msg);
  msg = JSON.parse(msg);
  if (msg.type == messages.T_C_ABORT_GAME) {
    this.gameState = messages.ST_ABORTED;
    this.sendStatusToAllPlayers();
  } else if (msg.type == messages.T_C_ROLL_DICE) {
    if (playerId == this.currentPlayer && this.gameState == messages.ST_DICE) {
      let diceMsg = messages.O_S_DICE_ROLLED;
      diceMsg.data = this.randomDiceValue();
      diceMsg.playerId = this.currentPlayer;
      this.sendToAllPlayers(JSON.stringify(diceMsg));
      this.gameState = messages.ST_ACTION;

      if (this.basePosition[playerId + "_" + 0] == 0 &&
        this.basePosition[playerId + "_" + 1] == 0 &&
        this.basePosition[playerId + "_" + 2] == 0 &&
        this.basePosition[playerId + "_" + 3] == 0 &&
        this.diceValue != 6) {
        this.currentPlayer = (this.currentPlayer + 1) % 4;
        let playerMsg = messages.O_S_CURRENT_PLAYER;
        playerMsg.data = this.currentPlayer;
        this.sendToAllPlayers(JSON.stringify(playerMsg));
        this.gameState = messages.ST_DICE;
      }
      this.sendStatusToAllPlayers();
    } else {
      console.log("Invalid Roll dice message");
    }
  } else if (msg.type == messages.T_C_MOVE_PAWN) {
    if (playerId == this.currentPlayer && this.gameState == messages.ST_ACTION) {
      this.movePawn(msg.playerId, msg.pawnId);
      console.log(this.diceValue);
      if (this.diceValue != 6) {
        this.currentPlayer = (this.currentPlayer + 1) % 4;
        let playerMsg = messages.O_S_CURRENT_PLAYER;
        playerMsg.data = this.currentPlayer;
        this.sendToAllPlayers(JSON.stringify(playerMsg));
      }

      this.gameState = messages.ST_DICE;
      this.sendStatusToAllPlayers();
    } else {
      console.log("Invalid move pawn message");
    }
  } else if (msg.type == messages.O_S_PAWN_GO_START) {
    this.gameState = messages.ST_ACTION;
    this.sendStatusToAllPlayers();

    let movePawnMsg = messages.O_C_MOVE_PAWN;
    this.movePawn(movePawnMsg.playerId, movePawnMsg.pawnId);
  } else if (msg.type == messages.T_C_PAWN_RESETTED) {
    var resettingPawn = msg.playerId + "_" + msg.pawnId;
    this.onboard[resettingPawn] = 0;
    this.basePosition[resettingPawn] = 0;
  }
};

game.prototype.isEnded = function () {
  this.gameState == messages.ST_ABORTED;
  gameStatus.gamesAborted++;

}

game.prototype.send = function (p, msg) {
  console.log("Sending message to player " + p.playerId + " of game " + this.id + " msg:" + msg);
  p.send(msg);
}

game.prototype.sendToAllPlayers = function (msg) {
  for (i = 0; i < 4; i++) {
    if (this.players[i] != null) {
      this.send(this.players[i], msg);
    }
  }
}

game.prototype.sendStatusToAllPlayers = function () {
  let statusMsg = messages.O_S_STATUS;
  statusMsg.data = this.gameState;
  this.sendToAllPlayers(JSON.stringify(statusMsg));
}

game.prototype.addPlayer = function (p) {
  console.assert(p instanceof Object, "%s: Expecting an object (WebSocket), got a %s", arguments.callee.name, typeof p);

  if (this.noOfPlayers === 4) {
    return new Error("Already 4 players");
  }

  let newPlayerId = this.noOfPlayers;
  p.playerId = newPlayerId;
  p.pawns = [0, 1, 2, 3];

  this.players[newPlayerId] = p;

  let informMsg = messages.O_S_INFORM_PLAYER;
  informMsg.data = newPlayerId;
  this.send(p, JSON.stringify(informMsg));

  this.noOfPlayers++;
  this.gameState = messages.ST_0_JOINT + this.noOfPlayers;

  this.sendStatusToAllPlayers();

  if (this.allPlayersJoined()) {
    this.currentPlayer = 0;
    let playerMsg = messages.O_S_CURRENT_PLAYER;
    playerMsg.data = this.currentPlayer;
    this.sendToAllPlayers(JSON.stringify(playerMsg));
  }

};

game.prototype.disconnectAllPlayers = function (playerId) {
  this.gameState = messages.ST_ABORTED;
  this.players[playerId] = null;
  this.sendStatusToAllPlayers();
}

game.prototype.randomDiceValue = function () {
  this.diceValue = Math.floor((Math.random() * 6) + 1);
  return this.diceValue;
}

game.prototype.movePawn = function (playerId, pawnId) {
  this.movingPawn = playerId + "_" + pawnId;
  this.position = this.onboard[this.movingPawn];
  if (this.diceValue + this.position >= 44) {
    console.log("stuck");
  } else {
    if (this.basePosition[this.movingPawn] == 1 || this.diceValue == 6) {
      if (this.basePosition[this.movingPawn] === 0) {
        let startingMsg = messages.O_S_PAWN_GO_START;
        startingMsg.playerId = playerId;
        startingMsg.pawnId = pawnId;
        this.sendToAllPlayers(JSON.stringify(startingMsg));
        this.basePosition[this.movingPawn] = 1;
      }
      else {
        let movingMsg = messages.O_S_MOVE_AS_DICE;
        movingMsg.playerId = playerId;
        movingMsg.pawnId = pawnId;
        movingMsg.diceValue = this.diceValue;
        this.sendToAllPlayers(JSON.stringify(movingMsg));
        this.onboard[this.movingPawn] = this.position;
      }
    }
  }
}

game.prototype.maxPlayers = function () {
  for (var i = 1; i <= 4; i++) {
    if (basePosition[this.currentPlayer + "pawn" + i] == 1 || onboard[this.currentPlayer + "pawn" + i] + this.diceValue >= 44) {
      return false;
    }
  }
  return true;
}

game.prototype.Stuck = function () {
  var movingPawn = this.currentPlayer + "pawn" + this.pawnNumber;
  if (basePosition[movingPawn] == 0 || this.position + this.diceValue >= 44) {
    if (this.maxPlayers() || this.position + this.diceValue > 44) {
      this.gameState = messages.ST_STUCK;
      this.sendStatusToAllPlayers();
      window.setTimeout(changePlayer, 1000);
    }
  }
}

module.exports = game;
