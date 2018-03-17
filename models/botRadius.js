var BotAbstract = require("./botAbstract");

class BotRadius extends BotAbstract {

    constructor(deepReflexion, nbCol, nbLine, nbBoxesForWin)
    {
        super(deepReflexion, nbCol, nbLine, nbBoxesForWin);
        this.nbBoxesForWin = nbBoxesForWin;
    }

    play(matrix, pov, deep, lastMoveX, lastMoveY)
    {
        if (0 === deep) {
            return this.evaluate(matrix, pov, lastMoveX, lastMoveY);
        }

        let currentEval = null;
        let bestEval    = null;
        let currentMove = null;
        let tabChoices  = [];
        let isMinCase   = ((this.deepReflexion % 2) === (deep % 2)) ? true : false;
        let nbPieces    = (null === lastMoveX) ? 0 : matrix[lastMoveX + "#" + lastMoveY].order;
        let order       = Math.abs(deep - 1 - this.deepReflexion);
        let opponent    = ("player" === pov) ? "bot" : "player";
        let gamer       = isMinCase ? pov : opponent;

        let x, y;
        for (x = 1; x <= this.nbCol; ++x) {
            for (y = 1; y <= this.nbLine; ++y) {
                currentMove = x + "#" + y;
                if (1 === matrix[currentMove].value || ! this.radiusFilter(matrix, lastMoveX, lastMoveY, currentMove)) {
                    continue;
                }

                this.simulate(matrix, gamer, currentMove, order, nbPieces);

                currentEval = this.play(matrix, pov, deep - 1, lastMoveX, lastMoveY);
                currentEval.move = currentMove;
                this.cancelMove(matrix, currentMove);

                if (
                    null === bestEval
                    || (! isMinCase && bestEval.points > currentEval.points)
                    || (isMinCase && bestEval.points < currentEval.points)
                ) { // premiere evaluation
                    bestEval   = currentEval;
                    tabChoices = [currentEval];
                } else if ( bestEval.points === currentEval.points ) {
                    tabChoices.push(currentEval);
                }

                this.sendProgress(currentMove, currentEval, bestEval,deep, x, y);
            }
        }

        if (1 < tabChoices.length) {
            // choisi au hasard parmi les possibilités ayant des points identiques
            bestEval = tabChoices[Math.floor(Math.random() * tabChoices.length)];
        }

        // debut ou fin de la partie
        if (null === currentEval) {
            bestEval = this.evaluate(matrix, pov);
            if (null === bestEval.move) {
                // choix du premier coup
                bestEval.move = Math.ceil(Math.random() * this.nbCol) + "#" + Math.ceil(Math.random() * this.nbLine);
            }
        }

        return bestEval;
    }

    radiusFilter(matrix, lastMoveX, lastMoveY, currentMove)
    {
        let limit = this.nbBoxesForWin + 2;
        let currentBox = matrix[currentMove];
        switch (true) {
            case (null === lastMoveX || null === lastMoveY):
            case Math.abs(lastMoveX - currentBox.x) > limit:
            case Math.abs(lastMoveY - currentBox.y) > limit:
                return false;
            default:
                return true;
        }
    }

}

module.exports = BotRadius;
