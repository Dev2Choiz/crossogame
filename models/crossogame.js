var BoardGame    = require("./boardgame");
var timer        = require("./timer");
// bots
var BotAlphaBeta = require("./botAlphaBeta");
var BotMinimax   = require("./botMinimax");
var BotRadius    = require("./botRadius");


class CrossoGame {

    getNextMove(body, cbSocket) {

        let nextMove;
        var matrix         = JSON.parse(body.matrix);
        this.pov           = body.gamer;
        this.deep          = parseInt(body.deep);
        this.nbCol         = parseInt(body.nbCol);
        this.nbLine        = parseInt(body.nbLine);
        this.nbBoxesForWin = parseInt(body.nbBoxesForWin);
        this.bot           = this.getBot(body.algorithm, this.deep, this.nbCol, this.nbLine, this.nbBoxesForWin);
        var boardgame      = new BoardGame(this.nbCol, this.nbLine, this.nbBoxesForWin);

        boardgame.setMatrix(matrix);
        this.bot.setBoardGame(boardgame);
        this.bot.cbSocket = cbSocket;
        let lastMove = boardgame.getLastAdded(matrix);
        let lastMoveX = (null === lastMove) ? null : lastMove.split("#")[0];
        let lastMoveY = (null === lastMove) ? null : lastMove.split("#")[1];
        // verifie si la grille est gagnante
        let evaluation = this.bot.evaluate(matrix, this.pov, lastMoveX, lastMoveY);
        let infoGame   = this.infoGame(evaluation, matrix);
        let execTime   = 0;

        if ( infoGame.gameover && ("infosWinner" in infoGame) ) {
            nextMove = evaluation;
        } else {
            let start = timer.get();
            nextMove  = this.bot.play(matrix, this.pov, this.deep, lastMoveX, lastMoveY);
            execTime  = timer.diff(start);
            infoGame  = this.infoGame(nextMove, matrix);
        }

        let moveX = (null === nextMove.move) ? null : nextMove.move.split("#")[0];
        let moveY = (null === nextMove.move) ? null : nextMove.move.split("#")[1];
        nextMove = {
            moveX    : moveX,
            moveY    : moveY,
            infoGame : infoGame,
            execTime : execTime,
        };

        cbSocket("resultNextMove", nextMove);
    }


    infoGame (nextMove, matrix) {

        if (undefined === nextMove.aggregation) {
            return { gameover : false };
        }
        let aggregations = nextMove.aggregation;
        let winner = this.getWinnerFromAggregation(aggregations);
        if (null === winner) {
            return { gameover : false };
        }

        // verifie si toutes les cases gagantes sont cochées
        let listBoxes;
        let listSeries = [];
        for (let keySerie in aggregations[winner].listBoxesWinning) {
            let winning = true;
            listBoxes = [];
            for (let keyBox in aggregations[winner].listBoxesWinning[keySerie]) {
                let box = aggregations[winner].listBoxesWinning[keySerie][keyBox];
                if (0 === matrix[box].value && box !== nextMove.move) {
                    winning = false;
                    break;
                }
                listBoxes.push(box);
            }

            if (this.nbBoxesForWin <= listBoxes.length) {
                listSeries.push(listBoxes);
            }
        }

        if (0 === listSeries.length) {
            // victoire anticipée, ce n'est pas encore la fin
            return { gameover : false };
        }

        let infos = {
            gameover : true,
            infosWinner : {
                name : winner,
                listBoxesWinning : listSeries
            }
        };

        return infos;
    }

    getWinnerFromAggregation (aggregations) {
        let winner = null;
        if ( aggregations["bot"].winning ) {
            winner = "bot";
        } else if ( aggregations["player"].winning ) {
            winner = "player";
        }
        return winner;
    }

    getBot (algorithm, deepReflexion, nbCol, nbLine, nbBoxesForWin) {
        switch (algorithm) {
            case "AlphaBeta":
                return new BotAlphaBeta(deepReflexion, nbCol, nbLine, nbBoxesForWin);
            case "Radius":
                return new BotRadius(deepReflexion, nbCol, nbLine, nbBoxesForWin);
            case "Minimax":
            default:
                return new BotMinimax(deepReflexion, nbCol, nbLine, nbBoxesForWin);
        }
    }
}

module.exports = CrossoGame;
