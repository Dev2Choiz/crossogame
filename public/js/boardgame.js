var BoardGame = function () {
    "use strict";

    this.init = function() {
        $('.msgBox').hide("fast");

        return this.drawBoard();
    };

    this.drawBoard = function() {
        var that = this;
        var data = {
            "nbLine" : parseInt($('#config [name=nbLine]').val()),
            "nbCol"  : parseInt($('#config [name=nbCol]').val())
        };

        return $.ajax({
            type:"POST",
            url: "/getBoard",
            data: data,
            dataType: "html"
        }).done(function(result) {
            $('#boardgame').html(result);
            that.addBoxEvents();
        });
    };

    this.displayWinner = function(result) {
        var listSerieBoxes = result.infoGame.infosWinner.listBoxesWinning;
        $("#boardgame .box").unbind("click");

        for (var keySerie in listSerieBoxes) {
            for (var keyBox in listSerieBoxes[keySerie]) {
                var box = listSerieBoxes[keySerie][keyBox];
                var posX = box.split("#")[0];
                var posY = box.split("#")[1];

                var selector = 'div[posx=' + posX + '][posy=' + posY + ']';
                $(selector).addClass("aligned-" + result.infoGame.infosWinner.name);
            }
        }
        this.message("Victoire de " + result.infoGame.infosWinner.name, "dark")
    };

    this.getMatrix = function() {
        let matrix = {};

        $("#boardgame .box").each(function () {
            var value = $(this).hasClass("checked") ? 1 : 0;
            var key   = $(this).attr("posx") + "#" + $(this).attr("posy");
            var owner = null;

            if ($(this).hasClass("playerMove")) {
                owner = "player";
            } else if ($(this).hasClass("botMove")) {
                owner = "bot";
            }

            var dataBox = {
                x     : parseInt($(this).attr("posx")),
                y     : parseInt($(this).attr("posy")),
                value : value,
                owner : owner,
                order : parseInt($(this).attr("order"))
            };
            matrix[key] = dataBox;
        });

        return matrix;
    };

    this.checkBox = function(x, y, gamer) {

        if ($('#boardgame .box[posx="' + x + '"][posy="' + y + '"]').hasClass("checked")) {
            return false;
        }

        $('#boardgame .box[posx="' + x + '"][posy="' + y + '"]').removeClass("unchecked");
        $('#boardgame .box[posx="' + x + '"][posy="' + y + '"]').addClass("checked");
        $('#boardgame .box[posx="' + x + '"][posy="' + y + '"]').addClass(gamer + "Move");

        this.setOrderBox(x, y);
        return true;
    };

    this.setOrderBox = function(x, y) {
        $('#boardgame .box[posx="' + x + '"][posy="' + y + '"]').attr("order", $('#boardgame .box.checked').length);
        return true;
    };

    this.message = function(msg, type, time) {
        time = (undefined === time) ? 5000 : time;
        type = (undefined === type) ? "info" : type;
        var  color = this.getColor(type);
        $('.msgBox').show("fast");
        $('.msgBox').css("background-color", color);
        $('.msgBox').html(msg);

        setTimeout(function(){
            $('.msgBox').hide("slow");
        }, time);

        return true;
    };


    this.getColor = function(name) {
        switch (name) {
            case "success":
                return "#56a156";
            case "info":
                return "#6f81a1";
            case "warning":
                return "#bf303e";
            case "dark":
            default:
                return "#212121";
        }
    };

    this.addBoxEvents = function() {
        $("#boardgame .box").contextmenu(function () {
            $(this).removeClass("checked");
            $(this).addClass("unchecked");
            $(this).removeClass("playerMove");
            $(this).removeClass("botMove");
            $(this).removeClass("aligned-bot");
            $(this).removeClass("aligned-player");
            $(this).removeAttr("order");
        });

        $("#boardgame .box").on("mouseover", function () {
            $(".labelBox").html($(this).attr("posx") + "x" + $(this).attr("posy"));
        });

        $(".mainContainer .labelBox").on("click", function () {
            $(".infoContainer").toggle("slow");
        });
    };
};
