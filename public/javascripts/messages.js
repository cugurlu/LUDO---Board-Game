(function (exports) {

    exports.ST_0_JOINT = 0;
    exports.ST_1_JOINT = 1;
    exports.ST_2_JOINT = 2;
    exports.ST_3_JOINT = 3;
    exports.ST_DICE = 4;
    exports.ST_ABORTED = 5;
    exports.ST_ACTION = 6;

    exports.T_S_STATUS = "STATUS";
    exports.O_S_STATUS = {
        type: exports.T_S_STATUS,
    };

    exports.T_C_ABORT_GAME = "ABORT_GAME";
    exports.O_C_ABORT_GAME = {
        type: exports.T_C_ABORT_GAME
    };
    exports.S_C_ABORT_GAME = JSON.stringify(exports.O_C_ABORT_GAME);

    exports.T_C_ROLL_DICE = "ROLL_DICE";
    exports.O_C_ROLL_DICE = {
        type: exports.T_C_ROLL_DICE,
    };
    exports.S_C_ROLL_DICE = JSON.stringify(exports.O_C_ROLL_DICE);

    exports.T_S_DICE_ROLLED = "DICE_ROLLED";
    exports.O_S_DICE_ROLLED = {
        type: exports.T_S_DICE_ROLLED,
        data: null,
        playerId: null
    };

    exports.T_S_CURRENT_PLAYER = "CURRENT_PLAYER";
    exports.O_S_CURRENT_PLAYER = {
        type: exports.T_S_CURRENT_PLAYER,
        data: null
    };

    exports.T_S_INFORM_PLAYER = "INFORM_PLAYER";
    exports.O_S_INFORM_PLAYER = {
        type: exports.T_S_INFORM_PLAYER,
        data: null
    };

    exports.T_C_STUCK = "STUCK";
    exports.O_C_STUCK = {
        type: exports.T_C_STUCK
    };
    exports.S_C_STUCK = JSON.stringify(exports.O_C_STUCK);

    exports.T_S_PAWN_GO_START = "PAWN_GO_START";
    exports.O_S_PAWN_GO_START = {
        type: exports.T_S_PAWN_GO_START,
        playerId: null,
        pawnId: null
    };

    exports.T_C_MOVE_PAWN = "MOVE_PAWN";
    exports.O_C_MOVE_PAWN = {
        type: exports.T_C_MOVE_PAWN,
        playerId: null,
        pawnId: null
    };

    exports.T_C_PAWN_RESETTED = "PAWN_RESETTED";
    exports.O_C_PAWN_RESETTED = {
        type: exports.T_C_PAWN_RESETTED,
        playerId: null,
        pawnId: null
    };

    exports.T_S_MOVE_AS_DICE = "MOVE_AS_DICE";
    exports.O_S_MOVE_AS_DICE = {
        type: exports.T_S_MOVE_AS_DICE,
        playerId: null,
        pawnId: null,
        diceValue: null
    };

}(typeof exports === "undefined" ? this.Messages = {} : exports));
//if exports is undefined, we are on the client; else the server
