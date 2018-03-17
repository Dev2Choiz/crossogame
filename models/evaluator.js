var config = require("../config/parameters");

class Evaluator {

    constructor(nbCol, nbLine, nbBoxesForWin)
    {
        this.maxAllowedAligned = nbBoxesForWin;
        this.largeNumber       = config.largeNumber;
        this.nbLine            = nbLine;
        this.nbCol             = nbCol;
        this.coef              = config.alignmentCoefValue;
        this.maxPoints         = this.calculateMaxPoints();
        this.gamers            = ["player", "bot"];
    }

    getReturn(points, aggregation, pov, matrix, winning) {
        winning = (undefined === winning) ? false : winning;

        let data = {
            points        : points,
            winning       : winning,
            move          : null,
            //aggregation : aggregation,
            //listMoves   : "",
            //matrix      : matrix,
        };

        if (winning) {
            data["aggregation"] = aggregation;
        }

        return data;
    }

    evaluate (matrix, pov, allInfoDirections, lastMoveX, lastMoveY)
    {
        var aggregation = this.aggregate(matrix, allInfoDirections, lastMoveX, lastMoveY);
        let opponent    = ("player" === pov) ? "bot" : "player";
        let diffPoints  = aggregation[pov].points - aggregation[opponent].points;

        switch (true) {
            /**
             * si un des joueurs est gagnamt, renvoyer l'évaluation maximal ou minimal selon le point de vue
             */
            case 1 === aggregation[pov].winningOrderDiff:
                return this.getReturn(this.maxPoints + diffPoints, aggregation, pov, matrix, true);
            case 1 === aggregation[opponent].winningOrderDiff:
                if (1 === aggregation[opponent].winningMinusOneOrderDiff || 1 === aggregation[opponent].winningMinusTwoOrderDiff) {
                    // renvoi ici peu de points pour que le bot essaye de contrer malgres que les carrottes soient cuites
                    return this.getReturn(-diffPoints, aggregation, pov, matrix, true);
                };
                return this.getReturn(-this.maxPoints + diffPoints, aggregation, pov, matrix, true);

            case aggregation[pov].winning :
                return this.getReturn(this.maxPoints / 1.5 + diffPoints, aggregation, pov, matrix, true);
            case aggregation[opponent].winning :
                return this.getReturn(-(this.maxPoints / 1.5) + diffPoints, aggregation, pov, matrix, true);
            /**
             * si un des joueurs est à une case de la victoire, retourner bcp de points
             * on verifie d'abord pour l'adversaire car il a l'avantage que ce soit son tour
             */
            case 1 === aggregation[opponent].winningMinusOneOrderDiff :
                return this.getReturn(-(this.maxPoints / 3.5) + diffPoints, aggregation, pov, matrix);
            case 1 === aggregation[pov].winningMinusOneOrderDiff :
                return this.getReturn(this.maxPoints / 3.5 + diffPoints, aggregation, pov, matrix);
            case aggregation[opponent].winningMinusOne :
                return this.getReturn(-(this.maxPoints / 4) + diffPoints, aggregation, pov, matrix);
            case aggregation[pov].winningMinusOne :
                return this.getReturn(this.maxPoints / 4 + diffPoints, aggregation, pov, matrix);
            /**
             * Si le joueur est à deux cases de la victoire et qu'il a de l'espace aux deux extremités,
             * renvoyer l'évaluation elevée
             */
            case 1 === aggregation[opponent].winningMinusTwoOrderDiff :
                return this.getReturn(-(this.maxPoints / 4.5) + diffPoints, aggregation, pov, matrix);
            case 1 === aggregation[pov].winningMinusTwoOrderDiff :
                return this.getReturn(this.maxPoints / 4.5 + diffPoints, aggregation, pov, matrix);
            case aggregation[opponent].winningMinusTwo :
                return this.getReturn(-(this.maxPoints / 5) + diffPoints, aggregation, pov, matrix);
            case aggregation[pov].winningMinusTwo :
                return this.getReturn(this.maxPoints / 5 + diffPoints, aggregation, pov, matrix);
            /**
             * Sinon renvoyer la difference de points
             */
            default :
                return this.getReturn(diffPoints, aggregation, pov, matrix);
        }
    }

    aggregate (matrix, allInfoDirections, lastMoveX, lastMoveY)
    {
        var result = {
            player: { points : 0, maxAligned : null, nbAligns : {}, listBoxesWinning : [],
                winning : false, winningMinusOne: false , winningMinusTwo: false },
            bot:    { points : 0, maxAligned : null, nbAligns : {}, listBoxesWinning : [],
                winning : false, winningMinusOne: false , winningMinusTwo: false }
        };

        let gamer;
        let directions, direction, key, keyGamer, sens;
        let skipList;
        let spaceDir, tabAlignment, diffAlignOrder;
        let lastOrder = (null === lastMoveX || undefined === lastMoveX)
                ? 0
                : matrix[lastMoveX + "#" + lastMoveY].order;

        for(keyGamer in this.gamers) {
            gamer = this.gamers[keyGamer];
            result[gamer].maxAligned = 0;
            skipList = { vertical : [], horizontal : [], diagonal1 : [], diagonal2 : [] };

            for (key in matrix) {
                if (gamer !== matrix[key].owner) {
                    // case vide ou apparetenant à l'adversaire
                    continue;
                }

                directions = allInfoDirections[key];
                for (sens in directions) {
                    direction    = directions[sens];
                    tabAlignment = direction.alignWith;
                    spaceDir     = direction.space;

                    if (
                        1 === tabAlignment.length                                        // pas d'alignement
                        // ou déjà ajoutée par une autre case dont celle-ci est liée
                        // par rapport à la direction "sens"
                        || -1 !== skipList[sens].indexOf(key)
                        || (0 === spaceDir && tabAlignment.length < this.maxAllowedAligned)   // ou bloqué
                        || this.maxAllowedAligned > (spaceDir + tabAlignment.length)          // ou impasse
                    ) {
                        continue;
                    }


                    if (undefined === result[gamer].nbAligns[tabAlignment.length]) {
                        result[gamer].nbAligns[tabAlignment.length] = 0;
                    }

                    result[gamer].nbAligns[tabAlignment.length] += 1;
                    skipList[sens].push(...tabAlignment);

                    if (result[gamer].maxAligned < tabAlignment.length) {
                        result[gamer].maxAligned = tabAlignment.length;
                    }
                    diffAlignOrder = false;
                    if (this.maxAllowedAligned <= tabAlignment.length) {
                        // le joueur a gagné
                        result[gamer].winning = true;
                        result[gamer].listBoxesWinning.push(tabAlignment.slice());
                        result[gamer].winningOrderDiff = this.getDiffPointsOrder(tabAlignment, matrix, lastOrder);

                    } else if (this.maxAllowedAligned - 1 === tabAlignment.length) {
                        // il reste une case à cette suite pour que le joueur gagne
                        result[gamer].winningMinusOne = true;
                        result[gamer].winningMinusOneOrderDiff = this.getDiffPointsOrder(tabAlignment, matrix, lastOrder);
                    }
                    if (this.maxAllowedAligned - 2 === tabAlignment.length && direction.extremitiesAreFree) {
                        // il reste deux cases à cette suite pour que le joueur gagne
                        // et il reste au moins une case disponible de chaque coté de la suite
                        result[gamer].winningMinusTwo = true;
                        result[gamer].winningMinusTwoOrderDiff = this.getDiffPointsOrder(tabAlignment, matrix, lastOrder);
                    }
                }
            }

            result[gamer].points = this.calculatePoints(result[gamer].nbAligns);
        }

        return result;
    }

    calculatePoints (nbAligns)
    {
        let points = 0;
        let alignmentNorm;
        for (alignmentNorm in nbAligns) {
            points += nbAligns[alignmentNorm] * this.coef[parseInt(alignmentNorm)];
        }

        return points;
    }

    /**
     * @returns {number}
     */
    calculateMaxPoints ()
    {
        return this.nbCol * this.coef[this.nbLine] + this.nbLine * this.coef[this.nbCol];
    }

    getDiffPointsOrder (moves, matrix, lastOrder)
    {
        let box, maxOrder = 0;
        for (let key in moves) {
            box = matrix[moves[key]];
            if (maxOrder < box.order) {
                maxOrder = box.order;
            }
        }

        if (maxOrder <= lastOrder + 2) {
            return 1;
        }

        return maxOrder - lastOrder - 1;
    }
}

module.exports = Evaluator;
