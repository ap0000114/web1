function roadGrid(sheetNumber, gridID, roomNumberDisplay) {


    var key = "1RQOftwtHKWPRShK27VcjWgX9AOUTuRPV63Lm9IJEqRg";
    var GSSurl = "https://spreadsheets.google.com/feeds/list/" + key + "/" + sheetNumber + "/public/basic?alt=json-in-script&callback=?";
    var grid = document.getElementById(gridID);

    $("#" + gridID).empty();
    $(roomNumberDisplay).empty();
    $(roomNumberDisplay).append(sheetNumber - 1 + "번 방");

    $.getJSON(GSSurl, function (data) {

        var entry = data.feed.entry;
        var subEndtry;

        var table = document.createElement("table");

        for (var i = 0; i < entry.length; i++) {

            var tr = document.createElement("tr");

            if (i == 0) {
                subEndtry = entry[i].content.$t.split(",");
            } else {
                subEndtry = entry[i].content.$t.split(":");
                subEndtry.shift();
            }

            for (var j = 0; j <= subEndtry.length; j++) {

                var td = document.createElement("td");
                var boxNode;
                var textNode;
                var pasingTempCellData;

                if (i == 0 && j == 0) {
                    boxNode = document.createElement("div");
                    pasingTempCellData = entry[i].title.$t;

                } else if (j == 0) {
                    boxNode = document.createElement("div");
                    pasingTempCellData = entry[i].title.$t;

                } else if (i == 0) {
                    boxNode = document.createElement("div");
                    pasingTempCellData = subEndtry[j - 1].substring(8);

                } else if (j == subEndtry.length) {
                    boxNode = document.createElement("input");
                    boxNode.type = "checkBox";
                    boxNode.id = "checkBox";
                    pasingTempCellData = subEndtry[j - 1];

                } else {
                    boxNode = document.createElement("input");
                    boxNode.type = "checkBox";
                    boxNode.id = "checkBox";
                    pasingTempCellData = subEndtry[j - 1].slice(0, -8);

                }

                pasingTempCellData = pasingTempCellData.trim();
                //console.log("[" + pasingTempCellData + "]   i : " + i + "   j : " + j);

                if (pasingTempCellData == "NULL") {
                    textNode = document.createTextNode("");

                } else {
                    textNode = document.createTextNode(pasingTempCellData);
                }

                boxNode.value = i + "a" + j;

                td.appendChild(boxNode);
                td.appendChild(textNode);

                tr.appendChild(td);

            }

            table.appendChild(tr);
        }
        
        grid.append(table);
    });

}

function submit(roomNumber, gridID, nameTextBoxId) {

    var playAlert = setInterval(function () { }, 10000);

    var inputTextBoxName = document.getElementById(nameTextBoxId).value;

    var checkDateTimeXYString = "";

    inputTextBoxName = inputTextBoxName.trim();
    if (inputTextBoxName == "") inputTextBoxName = "NULL";


    $(gridID).find("#checkBox:checked").each(function () {
        
        var a = $(this).val().indexOf("a");
        var rowsDate = $(this).val().substring(0, a);
        var columnsTime = $(this).val().substring(a + 1);

        checkDateTimeXYString += "d" +
            rowsDate + "t" + columnsTime;

        //alert(checkDateTimeXYString);

    });

    //alert("checkDateTimeXYString :" + checkDateTimeXYString);

    if (checkDateTimeXYString != "") {


        $.ajax({

            url: "https://script.google.com/macros/s/AKfycbyyv9c9rdm8fNudFl0LNkN-IPgI9ESulmPOv0R1jjj5AmhDmy8/exec",

            data: { NAME: inputTextBoxName, TIME: checkDateTimeXYString, ROOM: roomNumber },

            type: "POST",
            dataType: "text",
            success: function (data) {

                clearInterval(playAlert);

                var postResponse = JSON.parse(data);
                if (postResponse.result == "error") {
                    $(gridID).empty();
                    $(gridID).append(postResponse.error);

                } else {
                    var divPosition = $('#' + document.getElementById(nameTextBoxId).id).closest('div');
                    
                    console.log(document.getElementById(nameTextBoxId).id);
                    var sheetId = divPosition[0].id;
                    var gridId = divPosition.find('p')[0].id;
                    var roomNumDisplayId = divPosition.find('[name="roomNumberDisplay"]')[0].id;

                    sheetId = sheetId.substr(4);

                    roadGrid(sheetId, gridId, "#" + roomNumDisplayId);

                    //console.log(divPosition);
                }
            },
            error: function (data) {

                clearInterval(playAlert);
                $(gridID).empty();
                $(gridID).append("connect error");
            }
        });

        $(gridID).empty();
        $(gridID).append("wating.");


        playAlert = setInterval(function () {
            $(gridID).append(".");
        }, 100);

        setTimeout(function () {
            clearInterval(playAlert);

        }, 30000);

    }
}

function roadAllGrid() {

    for (var i = 1; i < 9; i++) {

        $(".tabs").append($('<li/>', {
            class: 'tab-link',
            'data-tab': 'tab-' + String(i + 1),
            text: i + '번 방'
        }));


        $("#tabBody").append($('<div/>', {
            id: 'tab-' + String(i + 1),
            class: 'tab-content',
            name: 'tabBodyChild'
        }));
    }




    $("#tabBody div").append($('<ul/>'));
    $("#tabBody div ul").append($('<li/>', {id: 'text'}));
    $("#tabBody div ul").append($('<li/>', { id: 'button' }));
    $("#tabBody div ul").append($('<li/>', { id: 'display' }));

    $("#tabBody div").append($('<hr/>'));







    $("#tabBody div").each(function () {
        var random = Math.floor(Math.random() * 1000) + 1;
        $(this).append($('<p/>', {
            id: 'grid' + String(random)
        }))
    });

    $("#tabBody ul li#text").each(function () {
        var random = Math.floor(Math.random() * 1000) + 1;
        $(this).append($('<input/>', {
            type: 'text',
            value: '이름',
            id: 'nameTextBox' + String(random)
        }))
    });
    $("#tabBody ul li#button").each(function () {
        var random = Math.floor(Math.random() * 1000) + 1;
        $(this).append($('<input/>', {
            type: 'button',
            value: '입력',
            id: 'input' + String(random)
    }))
    });

    $("#tabBody ul li#display").each(function () {
        var random = Math.floor(Math.random() * 1000) + 1;
        $(this).append($('<div/>', {
            name : 'roomNumberDisplay',
            id: 'roomNumberDisplay' + String(random)
        }))
    });
    $("#tabBody ul li#display").each(function () {
        var random = Math.floor(Math.random() * 1000) + 1;
        $(this).append($('<div/>', {
            name: 'testDisplay',
            id: 'testDisplay' + String(random)
        }))
    });

    $("#tabBody div[name='tabBodyChild']").each(function () {
        var sheetId = $(this)[0].id;
        var gridId = $(this).find('p')[0].id;
        //var textBoxId = $(this).find(':text')[0].id;
        //var buttonId = $(this).find(':button')[0].id;
        var roomNumDisplayId = $(this).find('[name="roomNumberDisplay"]')[0].id;
        //var testDisplayId = $(this).find('[name="testDisplay"]')[0].id;

        sheetId = sheetId.substr(4);

        /*
        console.log(sheetId);
        console.log(gridId);
        console.log(textBoxId);
        console.log(buttonId);
        console.log(roomNumDisplayId);
        console.log(testDisplayId);

        console.log("");
        */

        roadGrid(sheetId, gridId, "#" + roomNumDisplayId);
    });
}



