/* global XLSX, jspreadsheet */

/*var myTable = document.getElementById("B1SpreadSheet");
function createEmptyRows(){
    var numberOfColumns;
    if (myTable.id === "B1SpreadSheet" || myTable.id === "B2SpreadSheet"){
        numberOfColumns = 8;
    }else{
        numberOfColumns = 5;
    }
    var tableRowsNumber = myTable.rows.length;
    for (var i=tableRowsNumber; i<tableRowsNumber+5; i++){
        var newRow = myTable.insertRow(i);
        var dayCell = newRow.insertCell(0);
        dayCell.innerHTML = i+1;
        dayCell.setAttribute("class", "firstColumn");
        for (var j=1; j<numberOfColumns; j++){
            var newCell = newRow.insertCell(j);
            var input = document.createElement("INPUT");
            input.setAttribute("type", "number");
            newCell.appendChild(input);
            newCell.setAttribute("class", "otherColumns");
        }
    }
}
document.getElementById("moreRows").addEventListener("click", createEmptyRows);*/

var myTable = document.getElementById("B1_sp");
function createEmptyRows(){
    if (myTable.id === "B1_sp"){
        B1.insertRow(5);
    }else if(myTable.id === "B2_sp"){
        B2.insertRow(5);
    }else{
        Env.insertRow(5);
    }
}
document.getElementById("moreRows").addEventListener("click", createEmptyRows);

function deleteLastRow(){
    if (myTable.id === "B1_sp"){
        B1.deleteRow();
    }else if(myTable.id === "B2_sp"){
        B2.deleteRow();
    }else{
        Env.deleteRow();
    }
}
document.getElementById("deleteRow").addEventListener("click", deleteLastRow);



document.getElementById("cancel").addEventListener("click", function(){
    document.getElementById("inputContainer").style.display = "none";
});
document.getElementById("close").addEventListener("click", function(){
    document.getElementById("inputContainer").style.display = "none";
});



/*function saveTable(){
    var tableName = document.getElementById("spreadSheetTitle").innerHTML;
    const tableData = new Array();
    if(tableName === "Branch #1"){
        var table = document.getElementById("B1SpreadSheet");
    }else if (tableName === "Branch #2"){
        var table = document.getElementById("B2SpreadSheet");
    }else{
        var table = document.getElementById("EnvironmentalSpreadSheet");
    }
    for (var i=0; i<table.rows.length; i++){
        var tableRow = new Array();
        tableRow.push(table.rows[i].cells[0].innerHTML);
        for (var j=1; j<table.rows[0].cells.length; j++){
            if(table.rows[i].cells[j].childNodes[0].value === ""){
                alert("please complete the table");
                return false;
            }
            tableRow.push(table.rows[i].cells[j].childNodes[0].value);
        }
        tableData.push(tableRow);
    }   
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            tableName: tableName,
            tableData: JSON.stringify(tableData),
            tableUser: document.getElementById("btnOptions").innerHTML,
            tableProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML
        },
        dataType: 'text',
        success : function(response) {
            alert(response);
        },
        error: function(xhr) { 
            alert(xhr);
        }
    });
}
function ExportToExcel(type, fn, dl) {
    var tableName = document.getElementById("spreadSheetTitle").innerHTML;
    var name = "";
    var elt = "";
    if(tableName === "Branch #1"){
        elt = createCopyTable("B1SpreadSheet");
        name = "Branch_1";
    }else if (tableName === "Branch #2"){
        elt = createCopyTable("B2SpreadSheet");
        name = "Branch_2";
    }else{
        elt = createCopyTable("EnvironmentalSpreadSheet");
        name = "Environmental";
    }
    var wb = XLSX.utils.table_to_book(elt, { sheet: "sheet1" });
    elt.remove();
    return dl ?
        XLSX.write(wb, { bookType: type, bookSST: true, type: 'base64' }):
        XLSX.writeFile(wb, fn || ('MySheetName.' + (type || 'xlsx')));
}
document.getElementById("exportInputs").addEventListener("click", function(){
    ExportToExcel('xlsx');
});
 function createCopyTable(tableId){
    var mainTableBody = document.getElementById(tableId);
    var copyTable = document.createElement("table");
    var copyTableHeader = "";
    if(tableId === "EnvironmentalSpreadSheet"){
        var mainTableHeader = document.getElementById("EnvironmentalHeading");
        copyTableHeader = mainTableHeader.cloneNode(true);
    }else{
        var mainTableHeader = document.getElementById("barnchesHeading");
        copyTableHeader = mainTableHeader.cloneNode(true);
    }
    copyTable.append(copyTableHeader);
    for (var i=1; i<=mainTableBody.rows.length; i++){
            var newRow = copyTable.insertRow(i);
            var dayCell = newRow.insertCell(0);
            dayCell.innerHTML = mainTableBody.rows[i-1].cells[0].innerHTML;
            for (var j=1; j<mainTableBody.rows[0].cells.length; j++){
                var newCell = newRow.insertCell(j);
                newCell.innerHTML = mainTableBody.rows[i-1].cells[j].childNodes[0].value;
            }
        }   
    return copyTable;
 }*/


function saveTable(){
    var tableName = document.getElementById("spreadSheetTitle").innerHTML;
    var table;
    if(tableName === "Branch #1"){
        table = B1;
    }else if (tableName === "Branch #2"){
        table = B2;
    }else{
        table = Env;
    }
    var tableData = table.getData();
    var errorMessage = checkTable(tableData);
    if (errorMessage){
        alert(errorMessage);
        return false;
    }
    /*for (var i=0; i<table.getData().length; i++){
        var tableRow = new Array();
        tableRow.push(i+1);
        for (var j=1; j<table.rows[0].cells.length; j++){
            if(table.rows[i].cells[j].childNodes[0].value === ""){
                alert("please complete the table");
                return false;
            }
            tableRow.push(table.rows[i].cells[j].childNodes[0].value);
        }
        tableData.push(tableRow);
    }*/   
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            tableName: tableName,
            tableData: JSON.stringify(tableData),
            tableUser: document.getElementById("btnOptions").innerHTML,
            tableProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML
        },
        dataType: 'text',
        success : function(response) {
            alert(response);
        },
        error: function(xhr) { 
            alert(xhr);
        }
    });
}

function checkTable(tableData){
    alert(tableData[0].length);
    if (tableData.length%5 !== 0){
        return("Invalid inputs. you need to enter data for 5 days or multiple of 5 days");
    }
    var pattern = /[^0-9.]/g;
    for (var i=0; i<tableData.length; i++){
        for (var j=0; j<tableData[0].length; j++){
            if (tableData[i][j] === ""){
                return("The table is incomplete. Please fill in all values");
            }else if (!isNumeric(tableData[i][j])){
                return("Invalid inputs");
            }                
        }
    }
    return false;
}

function isNumeric(str) {
    if (typeof str !== "string") return false;
    return !isNaN(str) && 
        !isNaN(parseFloat(str)); 
}

var B1 = jspreadsheet(document.getElementById('B1_sp'), {
    minDimensions: [4, 5],
    defaultColWidth: 130,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    columns: [
        {
            type: 'numeric',
            title:'Temp'
        },
        {
            type: 'numeric',
            title:'PO4'
        },
        {
            type: 'numeric',
            title:'NH4'
        },
        {
            type: 'numeric',
            title:'NO3'
        },
        {
            type: 'numeric',
            title:'CBOD'
        },
        {
            type: 'numeric',
            title:'alga'
        },
        {
            type: 'numeric',
            title:'DO'
        }
     ]
});
var B2 = jspreadsheet(document.getElementById('B2_sp'), {
    minDimensions: [4, 5],
    defaultColWidth: 130,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    columns: [
        {
            type: 'numeric',
            title:'Temp'
        },
        {
            type: 'numeric',
            title:'PO4'
        },
        {
            type: 'numeric',
            title:'NH4'
        },
        {
            type: 'numeric',
            title:'NO3'
        },
        {
            type: 'numeric',
            title:'CBOD'
        },
        {
            type: 'numeric',
            title:'alga'
        },
        {
            type: 'numeric',
            title:'DO'
        }
     ]
});
var Env = jspreadsheet(document.getElementById('Env_sp'), {
    minDimensions: [4, 5],
    defaultColWidth: 230,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    columns: [
        {
            type: 'numeric',
            title:'T_air'
        },
        {
            type: 'numeric',
            title:'Wind'
        },
        {
            type: 'numeric',
            title:'Q_out'
        },
        {
            type: 'numeric',
            title:'elevation'
        }
     ]
});