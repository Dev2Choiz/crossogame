process.on('message', function(data) {
    const CrossoGame = require('./crossogame');
    const crossogame = new CrossoGame();

    crossogame.getNextMove(data, (event, msg) => {
        process.send({
            event : event,
            msg   : msg
        });
    });
});
