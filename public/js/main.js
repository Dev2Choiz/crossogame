var CrossoGame = (function() {
    "use strict";
    var MODE_HUMAN_VS_IA = 1;
    var MODE_IA_VS_IA    = 2;

    var init = function(mode)
    {
        var that = this;
        this.gameInProgress = false;
        this.currentSocket  = null;
        this.configGame     = new ConfigGame();
        this.boardgame      = new BoardGame();
        this.mode           = mode;
        this.available      = true;
        this.bot = new Bot();
        this.player = new Bot();
        this.bot.name = "bot";
        this.player.name = "player";
        this.bot.boardgame = this.boardgame;
        this.player.boardgame = this.boardgame;
        this.configGame.boardgame = this.boardgame;

        $('#start').hide("fast");
        $('#reinit').hide("fast");

        this.configGame.init();
        this.eventBoardSize();
        this.boardgame.init().done(function() {
            that.initGame();
            that.reinitEvent();
            that.eventChangeMode();
        });
    };

    var initBotsGame = function()
    {
        $('#reinit').show("slow");
        $('#start').hide("slow");

        if (! this.gameInProgress) {
            var that = this;
            that.gameInProgress = true;
            $('#boardgame .box').unbind("click");
            setTimeout(function() {
                that.nextMove(that.currentGamer, true);
            }, 3000);
        }
    };

    var initPlayerGame = function()
    {
        var that = this;
        this.available = true;
        $("#boardgame .box").click(function () {
            if (! that.available) {
                return true;
            }

            that.gameInProgress = true;
            that.available      = false;

            $("#config .sizes").hide("slow");
            $('#reinit').show("slow");
            $('#start').hide("slow");


            var x  = $(this).attr("posx");
            var y  = $(this).attr("posy");
            let ok = that.boardgame.checkBox(x, y, that.currentGamer);

            that.currentGamer = "bot";
            ok && that.nextMove("bot", false);
        });
        this.boardgame.message("Bonne partie.", "dark");
    };

    var manageAjaxReturn = function(socket, gamer, recurive, result)
    {
        console.log(result);
        recurive = (undefined === recurive) ? false : recurive;
        if (null !== result.moveX && null !== result.moveX) {
            this.boardgame.checkBox(result.moveX, result.moveY, gamer);
        }

        if (result.infoGame.gameover) {
            var info = new Info();
            info.breakLine();
            info.writeComment("Le vainceur est " + result.infoGame.infosWinner.name + ".");

            $("#config .sizes").show("slow");
            $('#reinit').show("slow");
            this.boardgame.displayWinner(result);
            return;
        }

        this.currentGamer = ("bot" === gamer) ? "player" : "bot";
        this.available    = true;

        if (recurive) {
            this.nextMove(this.currentGamer, recurive);
        }
    };

    var nextMove = function(gamer, recurive)
    {
        var thisBis = this;
        this.currentSocket = this[gamer].nextMove(function (result) {
            thisBis.manageAjaxReturn(thisBis.currentSocket, thisBis.currentGamer, recurive, result);
        });
    };

    var eventBoardSize = function()
    {
        var thisBis = this;
        $('#config [name=nbCol], #config [name=nbLine]').on("change", function () {
            $('#config #viewNbCol').html($('#config [name=nbCol]').val());
            $('#config #viewNbLine').html($('#config [name=nbLine]').val());

            // redessine le plateau avec les nouvelles tailles
            thisBis.boardgame.drawBoard().done(function () {
                // ré-initialise le jeu
                thisBis.initGame();
            });
        });
    };

    var initGame = function()
    {
        var thisBis = this;
        if (this.MODE_HUMAN_VS_IA === this.mode) {
            $('#reinit').show("slow");
            this.currentGamer = "player";
            this.initPlayerGame();
        } else {
            this.currentGamer = ["bot", "player"][Math.floor(Math.random() * 2)];
            $('#start').show("slow");
            $('#reinit').hide("fast");
            $('#start').on("click", function () {
                // lance la partie des bots
                thisBis.gameInProgress = false;
                thisBis.currentGamer = "player";

                thisBis.initBotsGame();
            });
        }
    };

    var eventChangeMode = function() {
        var that = this;
        $('nav ul li a').on("click", function () {
            that.mode = parseInt($(this).attr("mode"));
            that.gameInProgress = false;
            that.initGame();
            $('nav ul li').removeClass("active");
            $(this).parent("li").addClass("active");
        });
    };

    var reinitEvent = function()
    {
        var thisBis = this;
        $('#reinit').on("click", function () {
            // tente de stop la requete en cours si
            if (null !== thisBis.currentSocket) {
                thisBis.currentSocket.off();
                thisBis.currentSocket = null;
            }

            // redessine le plateau avec les nouvelles tailles
            $("#config .sizes").show("slow");
            let callback;
            if (thisBis.MODE_IA_VS_IA === thisBis.mode) {
                $('#reinit').hide("slow");
                // la ré-initialisation se fera quand on cliquera sur "commencer"
                $('#start').show("slow");
                callback = function () {};
            } else {
                $('#start').hide("fast");
                $('#reinit').show("slow");
                // un callback pour ré-initialiser le jeu apres qu'on ait redessiné le plateau
                callback = function () {
                    thisBis.initGame();
                };
            }
            thisBis.boardgame.drawBoard().done(callback);
        });

    };

    return {
        MODE_HUMAN_VS_IA : MODE_HUMAN_VS_IA,
        MODE_IA_VS_IA : MODE_IA_VS_IA,
        init : init,
        initBotsGame : initBotsGame,
        initPlayerGame : initPlayerGame,
        manageAjaxReturn : manageAjaxReturn,
        nextMove : nextMove,
        eventBoardSize : eventBoardSize,
        initGame : initGame,
        reinitEvent : reinitEvent,
        eventChangeMode : eventChangeMode,
    };
})();
