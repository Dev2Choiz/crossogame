var Bot = function() {
    "use strict";

    this.name;
    this.boardgame;

    this.nextMove = function(callback) {
        var data = {
            "algorithm"     : $('#config #algorithm').val(),
            "gamer"         : this.name,
            "deep"          : parseInt($('#config [name=deep]').val()),
            "nbCol"         : parseInt($('#config [name=nbCol]').val()),
            "nbLine"        : parseInt($('#config [name=nbLine]').val()),
            "nbBoxesForWin" : parseInt($('#config [name=nbBoxesForWin]').val()),
            "matrix"        : JSON.stringify(this.boardgame.getMatrix())
        };

        var info = new Info();
        info.erase();
        info.writeComment("Estimation de chaque coup possible.");
        var socket = io.connect(baseUrl);
        socket.on('progressNextMove', function (data) {
            info.setProgress(data.progress);
            info.writeVariable("Mouvement courant", data.currentMove.replace("#", "x"));
            info.writeVariable("Evaluation courante", data.currentEval);
            info.writeVariable("Meilleur mouvement actuel", data.currentBestMove.replace("#", "x"));
            info.breakLine();
            info.scroll();
        });

        socket.on('resultNextMove', function (data) {
            info.setProgress(100);
            info.writeComment("Fin de calcul.");
            info.writeVariable("Coup selectionné", (null === data.moveX) ? null : data.moveX + "#" + data.moveY);
            info.writeVariable("temps de calcul", data.execTime);
            info.breakLine();
            info.scroll();

            callback(data);
        });

        socket.emit('nextMove', data);

        return socket;
    };
};
