var Info = function () {
    "use strict";

    this.getHtml = function(type, data) {
        switch (type) {
            case "variable":
                return '<div class="infoLine">' +
                          '<span class="infoVariable">' + data.name + '</span> = <span class="infoValue">' + data.value + '</span>' +
                       '</div>';
            case "comment":
                return '<div class="infoLine">' +
                           '<span class="infoComment">// ' + data.comment + '</span>' +
                       '</div>';
            case "break":
                return '<div class="infoLine"></div>';
            default:
                return false;
        }
    };

    this.setProgress = function(progress) {
        $('.infoContainer .progress').html(progress + "%");
    };
    this.writeVariable = function(name, value) {
        var html = this.getHtml("variable", {name: name, value: value});
        $('.infoContainer .info').append(html);
    };
    this.writeComment = function(comment) {
        var html = this.getHtml("comment", {comment: comment});
        $('.infoContainer .info').append(html);
    };
    this.breakLine = function() {
        var html = this.getHtml("break");
        $('.infoContainer .info').append(html);
    };

    this.scroll = function() {
        document.querySelector('.infoContainer .info').scrollTop = document.querySelector('.infoContainer .info').scrollHeight;
    };
    this.erase = function() {
        document.querySelector('.infoContainer .info').innerHTML = "";
    };
};
