var express    = require('express');
var app        = express();
var bodyParser = require('body-parser');
var config     = require("./config/parameters");
var path       = require("path");

app.set('view engine', 'ejs');
app.set('json spaces', 40);
app.use('/assets', express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// index
app.get('/', (request, response) => {
    let baseUrl = request.protocol + '://' + request.get('host');
    response.render('page/index', {baseUrl: baseUrl, defaultNbLine: config.nbLine, defaultNbCol: config.nbCol, defaultDeep: config.deepReflexion, defaultNbBoxesForWin: config.nbBoxesForWin});
});

// ajax pour recuperer le plateau de jeu
app.post('/getBoard', (request, response) => {
    response.render('page/boardgame', {nbLine: request.body.nbLine, nbCol: request.body.nbCol});
});

var server = app.listen(8080);
var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    console.log('Connection');

    const fork = require('child_process').fork;
    const file = path.resolve('./models/worker.js');
    var childProcess = fork(file);
    // configuration debbugger
    if (undefined !== childProcess.spawnargs[3]) {
        childProcess.spawnargs[1] = "--inspect=9228";
        childProcess.spawnargs[3] = childProcess.spawnargs[2];
        childProcess.spawnargs[2] = "--debug-brk";
    }

    // evenement sur le processus fils pour communiquer avec
    childProcess.on('message', function(msg) {
        socket.emit(msg.event, msg.msg);
    });

    // ecoute de l'evement "nextMove"
    socket.on('nextMove', function (data) {
        console.log("nextNove");
        childProcess.send(data);
    });
});
