var Evaluator = require("./evaluator");
var config    = require("../config/parameters");

class BotAbstract {

    constructor(deepReflexion, nbCol, nbLine, nbBoxesForWin)
    {
        this.deepReflexion = deepReflexion;
        this.nbCol         = nbCol;
        this.nbLine        = nbLine;
        this.largeNumber   = config.largeNumber;
        this.boardgame     = null;
        this.evaluator     = new Evaluator(nbCol, nbLine, nbBoxesForWin);
    }

    simulate (matrix, pov, move, order, nbPieces)
    {
        matrix[move].value = 1;
        matrix[move].owner = pov;
        matrix[move].order = nbPieces + order;
        return true;
    }

    cancelMove (matrix, move)
    {
        matrix[move].value = 0;
        matrix[move].owner = null;
        matrix[move].order = null;
        return true;
    }

    evaluate(matrix, pov, lastMoveX, lastMoveY)
    {
        let allInfoDirections = this.boardgame.searchSeries(matrix);
        return this.evaluator.evaluate(matrix, pov, allInfoDirections, lastMoveX, lastMoveY);;
    }

    sendProgress(currentMove, currentEval, bestEval,deep, x, y)
    {
        if (deep === this.deepReflexion) {
            this.cbSocket("progressNextMove", {
                "currentMove": currentMove,
                "currentEval": currentEval.points,
                "currentBestMove": bestEval.move,
                "progress": Math.ceil(((x -1) * this.nbCol + y) / (this.nbCol * this.nbLine) * 100)
            });
        }
    }

    setBoardGame(boardgame)
    {
        this.boardgame = boardgame;
    }
}

module.exports = BotAbstract;
