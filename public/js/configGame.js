var ConfigGame = function () {
    "use strict";

    this.init = function() {
        this.addEvents();
        $('#config [name=deep], #config [name=nbCol], #config [name=nbLine], #config [name=nbBoxesForWin]').trigger("change");
    };

    this.addEvents = function() {
        var thisBis = this;
        $('#config [name=deep]').on("change", function () {
            $('#config #viewDeep').html($(this).val());
            thisBis.deep = $(this).val();
        });
        $('#config [name=nbBoxesForWin]').on("change", function () {
            $('#config #viewNbBoxesForWin').html($(this).val());
            thisBis.deep = $(this).val();
        });
        $('#config #viewNbCol').html($('#config [name=nbCol]').val());
        $('#config #viewNbLine').html($('#config [name=nbLine]').val());
    };
};
