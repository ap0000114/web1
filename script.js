function roadGrid(sheetNumber, gridID, roomNumberDisplay, columnNum) {


    var key = "1RQOftwtHKWPRShK27VcjWgX9AOUTuRPV63Lm9IJEqRg";
    var GSSurl = "https://spreadsheets.google.com/feeds/list/" + key + "/" + sheetNumber + "/public/basic?alt=json-in-script&callback=?";
    var grid = document.getElementById(gridID);

    $("#" + gridID).empty();
    //$(roomNumberDisplay).empty();
    //$(roomNumberDisplay).append(sheetNumber - 1 + "번 방");

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

            if (columnNum > entry.length) columnNum = subEndtry.length;

            for (var j = 0; j <= columnNum; j++) {

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

function submit(roomNumber, gridID, nameTextBoxId, columnNum) {
    
    var inputTextBoxName = document.getElementById(nameTextBoxId).value;

    var checkDateTimeXYString = "";

    var lastRow = document.getElementById("lastRowVaule").value;

    inputTextBoxName = inputTextBoxName.trim();
    if (inputTextBoxName == "") inputTextBoxName = "NULL";


    $(gridID).find("#checkBox:checked").each(function () {
        
        var a = $(this).val().indexOf("a");
        var rowsTime = $(this).val().substring(0, a);
        var columnsDate = $(this).val().substring(a + 1);

        checkDateTimeXYString += "d" +
            columnsDate + "t" + rowsTime;

    });

    $.ajax({

        url: "https://script.google.com/macros/s/AKfycbyyv9c9rdm8fNudFl0LNkN-IPgI9ESulmPOv0R1jjj5AmhDmy8/exec",

        data: { NAME: lastRow, TIME: checkDateTimeXYString, ROOM: roomNumber, FUNCTION: "checkOtherUserDataOverlap" },

        type: "POST",
        dataType: "text",
        success: function (data) {

            var postResponse = JSON.parse(data);
            if (postResponse.result == "error") {

                $("body").append(postResponse.error);


            } else if (postResponse.result == "success") {

                if (postResponse.functionResult == "ok") {
                    console.log(postResponse);
                    if (checkDateTimeXYString != "" ) {


                        $.ajax({

                            url: "https://script.google.com/macros/s/AKfycbyyv9c9rdm8fNudFl0LNkN-IPgI9ESulmPOv0R1jjj5AmhDmy8/exec",

                            data: { NAME: inputTextBoxName, TIME: checkDateTimeXYString, ROOM: roomNumber },

                            type: "POST",
                            dataType: "text",
                            success: function (data) {

                                var postResponse = JSON.parse(data);
                                if (postResponse.result == "error") {
                                    $("body").empty();
                                    $("body").append(postResponse.error);

                                } else {
                                    roadAllGrid(5, false);
                                    submitGridLoadLog();
                                    hideLoadingWithMask();
                                    /*
                                    var divPosition = $('#' + document.getElementById(nameTextBoxId).id).closest('div');

                                    var sheetId = divPosition[0].id;
                                    var gridId = divPosition.find('p')[0].id;
                                    var roomNumDisplayId = divPosition.find('[name="roomNumberDisplay"]')[0].id;

                                    sheetId = sheetId.substr(4);

                                    roadGrid(sheetId, gridId, "#" + roomNumDisplayId, columnNum);
                                    */
                                }
                            },
                            error: function (data) {
                                $("body").empty();
                                $("body").append(postResponse.error);
                            }
                        });
                    }

                } else {
                    var overlapMessage = "";

                    var functionResult = JSON.parse(data).functionResult;

                    var timeSplitArray = functionResult.split("*time*");

                    for (var i = 0; i < timeSplitArray.length - 1; i++) {
                        
                        var dateSplitArray = timeSplitArray[i].split("*date*");
                        var nameSplitArray = dateSplitArray[0].split("*name*");

                        var time = timeSplitArray[i].substr(timeSplitArray[i].indexOf("*date*") + 6); //substr
                        var date = dateSplitArray[0].substr(timeSplitArray[i].indexOf("*name*") + 6);
                        var name = nameSplitArray[0];

                        overlapMessage += name + "님이 방금 " + date + " " + time + "에 예약하신것과 겹칩니다! "
                    }

                    alert(overlapMessage);

                    console.log(data);
                    
                    roadAllGrid(5, false);
                    submitGridLoadLog();
                    hideLoadingWithMask();

                }
            }
        },
        error: function (data) {

            $("body").empty();
            $("body").append("connect error");
        }
    });

    
}

function roadAllGrid(columnNum, isFirst) {
    
    if (isFirst == true) {

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




        $("#tabBody div[name='tabBodyChild']").append($('<ul/>'));
        $("#tabBody div[name='tabBodyChild'] ul").append($('<li/>', { id: 'text' }));
        $("#tabBody div[name='tabBodyChild'] ul").append($('<li/>', { id: 'button' }));
        $("#tabBody div[name='tabBodyChild'] ul").append($('<li/>', { id: 'display' }));

        $("#tabBody div[name='tabBodyChild']").append($('<hr/>'));



        $("#tabBody div[name='tabBodyChild']").each(function () {
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
                name: 'roomNumberDisplay',
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
    }

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

        roadGrid(sheetId, gridId, "#" + roomNumDisplayId, columnNum);
    });

}

function submitGridLoadLog() {

    $.ajax({

        url: "https://script.google.com/macros/s/AKfycbyyv9c9rdm8fNudFl0LNkN-IPgI9ESulmPOv0R1jjj5AmhDmy8/exec",

        data: { NAME: "load", TIME: "load", ROOM: 0 },

        type: "POST",
        dataType: "text",
        success: function (data) {

            var postResponse = JSON.parse(data);
            if (postResponse.result == "error") {

                $("body").empty();
                $("body").append(postResponse.error);


            } else if (postResponse.result == "success") {
                document.getElementById("lastRowVaule").value = postResponse.row;
            }
        },
        error: function (data) {

            $("body").empty();
            $("body").append("connect error");
        }
    });

}

function LoadingWithMask(gif) {

    //화면의 높이와 너비를 구합니다.
    var maskHeight = window.innerHeight || document.body.clientHeight;
    var maskWidth = window.innerWidth || document.body.clientWidth;

    //화면에 출력할 마스크를 설정해줍니다.
    var mask = "<div id='mask' style='position:absolute; z-index:9000; background-color:#000000; display:none; left:0; top:0;'><img src='" + gif + "' style='position: absolute; display: block; margin: 0px auto; top:20%;  left:33%; width:30vw; height:30vw;'/></div>";


    //화면에 레이어 추가
    $('body')
        .append(mask)

    //마스크의 높이와 너비를 화면 것으로 만들어 전체 화면을 채웁니다.
    $('#mask').css({
        'width': '100vw',
        'height': '100vh',
        'opacity': '0.3'
    });

    $('#mask').hide();
}

function showLoadingWithMask() {
    $('#mask').show();
}

function hideLoadingWithMask() {
    $('#mask').hide();
    //$('#mask').empty();
}


