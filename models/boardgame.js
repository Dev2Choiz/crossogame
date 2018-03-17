var config = require("../config/parameters");

class BoardGame {

    constructor(nbCol, nbLine, nbBoxesForWin) {
        this.scopeScanBoundedBoxes = config.scopeScanBoundedBoxes;
        this.matrix                = [];
        this.nbLine                = nbLine;
        this.nbCol                 = nbCol;
        this.nbBoxesForWin         = nbBoxesForWin;
    }

    searchSeries(matrix) {
        let allInfoDirections = [];
        let key;
        for (key in matrix) {
            if (0 === matrix[key].value) {
                allInfoDirections[key] = null;
                continue;
            }
            this.searchAlign(matrix, key, allInfoDirections);
        }

        return allInfoDirections;
    }























    searchAlign(matrix, key, allInfoDirections) {

        var box = matrix[key];
        var params = {cursorX1 : null, cursorY1 : null, cursorX2 : null, cursorY2 : null};
        var scopeScan = this.scopeScanBoundedBoxes;
        var currentMoveKey;
        var currentBox1;
        var currentBox2;
        var currentMoveKey1;
        var currentMoveKey2;
        var tabIsBound, boxBound;
        var listDirections = ["horizontal", "vertical", "diagonal1", "diagonal2"];
        var kSens, sens, k;
        (undefined === allInfoDirections[key]) && (allInfoDirections[key] = []);

        for (kSens in listDirections) {
            sens = listDirections[kSens];

            let alwaysBound1 = true;
            let alwaysBound2 = true;
            let spaceAfterEnd1 = false;
            let spaceAfterEnd2 = false;
            let opponentBoxMet1 = false;
            let opponentBoxMet2 = false;
            let directionUpdated = false;
            let space = 0;

            (undefined === allInfoDirections[key][sens]) && (allInfoDirections[key][sens] = []);
            if (undefined === allInfoDirections[key][sens]["processed"]) {
                allInfoDirections[key][sens]["processed"]          = false;
                allInfoDirections[key][sens]["extremitiesAreFree"] = false;
                allInfoDirections[key][sens]["space"]              = 0;
                allInfoDirections[key][sens]["alignWith"]          = [key];
            }

            if (allInfoDirections[key][sens]["processed"]) {
                continue;
            }

            for (var delta = 1; delta <= scopeScan; ++delta) {

                this.searchCoordinates(box.x, box.y, delta, sens, params);

                currentMoveKey1 = params.cursorX1 + "#" + params.cursorY1;
                currentMoveKey2 = params.cursorX2 + "#" + params.cursorY2;

                currentBox1 = matrix [currentMoveKey1];
                currentBox2 = matrix [currentMoveKey2];

                if (alwaysBound1 && undefined === currentBox1) {
                    // La case courante n'existe pas et la fissure entre les liaisons se situe ici.
                    alwaysBound1    = false;
                    spaceAfterEnd1  = false;
                    opponentBoxMet1 = true; // permet de quitter la boucle si une case adversaire est reperee aussi de l'autre extremite
                } else if (undefined === currentBox1) {
                    alwaysBound1    = false;
                    opponentBoxMet1 = true; // permet de quitter la boucle si une case adversaire est reperee aussi de l'autre extremite
                } else if (alwaysBound1 && (box.owner !== currentBox1.owner)) {
                    // la case superieur courante n'est pas du joueur
                    alwaysBound1 = false;
                    // verifie si l'extremité est disponible
                    spaceAfterEnd1 = (0 === currentBox1.value);
                    // permet de quitter la boucle si une case adversaire est reperee aussi de l'autre extremite
                    opponentBoxMet1 = opponentBoxMet1 ? opponentBoxMet1 : 1 === currentBox1.value;
                }

                if (alwaysBound2 && undefined === currentBox2) {
                    alwaysBound2 = false;
                    spaceAfterEnd2 = false;
                    opponentBoxMet2 = true;
                } else if (undefined === currentBox2) {
                    alwaysBound2 = false;
                    opponentBoxMet2 = true;
                } else if (alwaysBound2 && (box.owner !== currentBox2.owner)) {
                    alwaysBound2 = false;
                    spaceAfterEnd2 = (0 === currentBox2.value);
                    opponentBoxMet2 = opponentBoxMet2 ? opponentBoxMet2 : 1 === currentBox2.value;
                }

                if (undefined !== currentBox1) {
                    if (0 === currentBox1.value && ! opponentBoxMet1) {
                        space++;
                    }
                    if (box.owner !== currentBox1.owner && 1 === currentBox1.value) {
                        opponentBoxMet1 = true;
                    }
                }

                if (undefined !== currentBox2) {
                    if (0 === currentBox2.value && ! opponentBoxMet2) {
                        space++;
                    }
                    if (box.owner !== currentBox2.owner && 1 === currentBox2.value) {
                        opponentBoxMet2 = true;
                    }
                }

                tabIsBound = {};
                alwaysBound1 && (tabIsBound[currentMoveKey1] = alwaysBound1);
                alwaysBound2 && (tabIsBound[currentMoveKey2] = alwaysBound2);

                for (currentMoveKey in tabIsBound) {
                    if (tabIsBound[currentMoveKey]) {
                        //la case "currentMoveKey" est toujours liée à key
                        allInfoDirections[key][sens]["alignWith"].push(currentMoveKey);
                        directionUpdated = true;
                    }
                }

                if (opponentBoxMet1 && opponentBoxMet2) {
                    break;
                }

            }

            if (! directionUpdated) {
                continue;
            }
            allInfoDirections[key][sens]["processed"] = true;
            allInfoDirections[key][sens]["extremitiesAreFree"  ] = spaceAfterEnd1 && spaceAfterEnd2;
            allInfoDirections[key][sens]["space"               ] = space;

            if (this.nbBoxesForWin > allInfoDirections[key][sens]["alignWith"].length + allInfoDirections[key][sens]["space"]) {
                allInfoDirections[key][sens]["extremitiesAreFree"] = false;
                allInfoDirections[key][sens]["alignWith"         ] = [key];
                allInfoDirections[key][sens]["space"             ] = 0;
            }

            // liaison des autres box de la serie
            for (k in allInfoDirections[key][sens]["alignWith"]) {
                boxBound = allInfoDirections[key][sens]["alignWith"][k];
                if (key === boxBound) {
                    continue;
                }
                (undefined === allInfoDirections[boxBound]      ) && (allInfoDirections[boxBound] = []);
                (undefined === allInfoDirections[boxBound][sens]) && (allInfoDirections[boxBound][sens] = []);

                allInfoDirections[boxBound][sens]["extremitiesAreFree"] = allInfoDirections[key][sens]["extremitiesAreFree"];
                allInfoDirections[boxBound][sens]["alignWith"]          = allInfoDirections[key][sens]["alignWith"];
                allInfoDirections[boxBound][sens]["processed"]          = allInfoDirections[key][sens]["processed"];
                allInfoDirections[boxBound][sens]["space"]              = allInfoDirections[key][sens]["space"];
            }
        }
    }

    searchCoordinates(x, y, delta, direction, params)
    {
        switch (direction) {
            case "vertical" :
                params.cursorX1 = x;
                params.cursorY1 = y - delta;
                params.cursorX2 = x;
                params.cursorY2 = y + delta;
                break;
            case "diagonal1" :
                params.cursorX1 = x + delta;
                params.cursorY1 = y - delta;
                params.cursorX2 = x - delta;
                params.cursorY2 = y + delta;
                break;
            case "horizontal" :
                params.cursorX1 = x + delta;
                params.cursorY1 = y;
                params.cursorX2 = x - delta;
                params.cursorY2 = y;
                break;
            case "diagonal2" :
                params.cursorX1 = x + delta;
                params.cursorY1 = y + delta;
                params.cursorX2 = x - delta;
                params.cursorY2 = y - delta;
                break;
            default:
                params.cursorX1 = null;
                params.cursorY1 = null;
                params.cursorX2 = null;
                params.cursorY2 = null;
                break;
        }

        // gestion des debordements
        (null !== params.cursorX1)
            && (params.cursorX1 = (1 > params.cursorX1) ? null : params.cursorX1)
            && (params.cursorX1 = (this.nbCol < params.cursorX1) ? null : params.cursorX1);
        (null !== params.cursorY1)
            && (params.cursorY1 = (1 > params.cursorY1) ? null : params.cursorY1)
            && (params.cursorY1 = (this.nbLine < params.cursorY1) ? null : params.cursorY1);
        (null !== params.cursorX2)
            && (params.cursorX2 = (1 > params.cursorX2) ? null : params.cursorX2)
            && (params.cursorX2 = (this.nbCol < params.cursorX2) ? null : params.cursorX2);
        (null !== params.cursorY2)
            && (params.cursorY2 = (1 > params.cursorY2) ? null : params.cursorY2)
            && (params.cursorY2 = (this.nbLine < params.cursorY2) ? null : params.cursorY2);

        return;
    }

    getLastAdded(matrix)
    {
        let max = -1;
        let maxMove = null;
        for (let move in matrix) {
            if (null !== matrix[move].order && max < matrix[move].order) {
                max = matrix[move].order;
                maxMove = move;
            }
        }
        return maxMove;
    }

    isFull(matrix)
    {
        for (let move in matrix) {
            if (0 === matrix[move].value) {
                return false;
            }
        }
        return true;
    }

    getMatrix() {
        return this.matrix;
    }

    setMatrix(matrix)
    {
        this.matrix = matrix;
    }

}

module.exports = BoardGame;
