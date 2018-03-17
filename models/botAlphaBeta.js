var BotAbstract = require("./botAbstract");

class BotAlphaBeta extends BotAbstract {

    play(matrix, pov, deep, lastMoveX, lastMoveY)
    {
        let alpha = -this.largeNumber;
        let beta  =  this.largeNumber;

        return this.alphabeta(matrix, pov, deep, alpha, beta, lastMoveX, lastMoveY);
    }

    alphabeta(matrix, pov, deep, alpha, beta, lastMoveX, lastMoveY)
    {
        if (0 === deep) {
            return this.evaluate(matrix, pov, lastMoveX, lastMoveY);
        }

        var currentEval = null;
        var tmpEval     = null;
        var tabChoices  = [];
        let isMinCase   = ((this.deepReflexion % 2) === (deep % 2)) ? true : false;
        let nbPieces    = (null === lastMoveX) ? 0 : matrix[lastMoveX + "#" + lastMoveY].order;
        var order       = Math.abs(deep - 1 - this.deepReflexion);
        var opponent    = ("player" === pov) ? "bot" : "player";
        let gamer       = isMinCase ? pov : opponent;
        var elagageControl = 2;

        if (isMinCase) {
            currentEval = {points : this.largeNumber, move : null};
            for (let x = 1; x <= this.nbCol; ++x) {
                for (let y = 1; y <= this.nbLine; ++y) {
                    let currentMove = x + "#" + y;
                    if (1 === matrix[currentMove].value) {
                        continue;
                    }

                    this.simulate(matrix, gamer, currentMove, order, nbPieces);

                    tmpEval = this.alphabeta(matrix, pov, deep - 1, alpha, beta, lastMoveX, lastMoveY);
                    tmpEval.move = currentMove;

                    if (tmpEval.points < currentEval.points) {
                        currentEval = tmpEval;
                    }
                    currentEval.move = currentMove;

                    this.sendProgress(currentMove, tmpEval, currentEval, deep, x, y);

                    if (alpha >= currentEval.points) {
                        return currentEval;
                    }

                    if (0 === order % elagageControl) {
                        beta = Math.min(beta, currentEval.points);
                    }

                    if (beta < alpha) {
                        // break
                        x = this.nbCol + 1;
                        y = this.nbCol + 1;
                    }
                }
            }
        } else {
            currentEval = {points : -this.largeNumber, move : null};
            for (let x = 1; x <= this.nbCol; ++x) {
                for (let y = 1; y <= this.nbLine; ++y) {

                    let currentMove = x + "#" + y;
                    if (1 === matrix[currentMove].value) {
                        continue;
                    }

                    this.simulate(matrix, gamer, currentMove, order);

                    tmpEval = this.alphabeta(matrix, pov, deep - 1, alpha, beta, lastMoveX, lastMoveY);
                    tmpEval.move = currentMove;

                    if (tmpEval.points > currentEval.points) {
                        currentEval = tmpEval;
                    }
                    currentEval.move = currentMove;

                    if (currentEval.points >= beta) {
                        return currentEval;
                    }

                    if (0 === order % elagageControl) {
                        alpha = Math.max(alpha, currentEval.points);
                    }

                    if (beta < alpha) {  // break
                        x = this.nbCol + 1;
                        y = this.nbCol + 1;
                    }
                }
            }
        }

        if (1 < tabChoices.length) {
            // choisi au hasard parmi les possibilités ayant des points identiques
            currentEval = tabChoices[Math.floor(Math.random() * tabChoices.length)];
        }

        return currentEval;
    }
}

module.exports = BotAlphaBeta;
