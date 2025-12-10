/* global XLSX, jspreadsheet */

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

function closeCalculationContainer(){
    document.getElementById("calculationContainer").style.display = "none";
}

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
            if(tableName === "Branch #1"){
                data_branch_1 = tableData;
            }else if (tableName === "Branch #2"){
                data_branch_2 = tableData;
            }
            alert(response);
        },
        error: function(xhr) { 
            alert(xhr);
        }
    });
}

function checkTable(tableData){
    if (tableData.length%5 !== 0){
        return("Invalid inputs. you need to enter data for 5 days or multiple of 5 days");
    }
    for (var i=0; i<tableData.length; i++){
        for (var j=0; j<tableData[0].length; j++){
            if (tableData[i][j] === ""){
                return("The table is incomplete. Please fill in all values");
            }else if (!isNumeric(tableData[i][j])){
                return("Invalid inputs at row " + i+1 + "and column " + j+1);
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
    defaultColWidth: 110,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    columns: [
        {
            type: 'numeric',
            title:'Q_in (m\u00B3/s)'
        },
        {
            type: 'numeric',
            title:'Temp (\u00B0C)'
        },
        {
            type: 'numeric',
            title:'PO4 (mg/l)'
        },
        {
            type: 'numeric',
            title:'NH4 (mg/l)'
        },
        {
            type: 'numeric',
            title:'NO3 (mg/l)'
        },
        {
            type: 'numeric',
            title:'CBOD (mg/l)'
        },
        {
            type: 'numeric',
            title:'alga (mg/l)'
        },
        {
            type: 'numeric',
            title:'DO (mg/l)'
        }
     ]
});
var B2 = jspreadsheet(document.getElementById('B2_sp'), {
    minDimensions: [4, 5],
    defaultColWidth: 110,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    columns: [
        {
            type: 'numeric',
            title:'Q_in (m\u00B3/s)'
        },{
            type: 'numeric',
            title:'Temp (\u00B0C)'
        },
        {
            type: 'numeric',
            title:'PO4 (mg/l)'
        },
        {
            type: 'numeric',
            title:'NH4 (mg/l)'
        },
        {
            type: 'numeric',
            title:'NO3 (mg/l)'
        },
        {
            type: 'numeric',
            title:'CBOD (mg/l)'
        },
        {
            type: 'numeric',
            title:'alga (mg/l)'
        },
        {
            type: 'numeric',
            title:'DO (mg/l)'
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
            title:'T_air (\u00B0C)'
        },
        {
            type: 'numeric',
            title:'Wind (m/s)'
        },
        {
            type: 'numeric',
            title:'Q_out (m\u00B3/s)'
        },
        {
            type: 'numeric',
            title:'elevation (m)'
        }
     ]
});

var epaTable = jspreadsheet(document.getElementById('epa_sp'), {
    minDimensions: [2, 1],
    defaultColWidth: 150,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    allowInsertRow:false,
    allowDeleteRow:false,
    columns: [
        {
            type: 'text',
            title:'Day'
        },
        {
            type: 'numeric',
            title:'%DO'
        },
        {
            type: 'numeric',
            title:'chlorophyll-a (mg/m3'
        },
        {
            type: 'numeric',
            title:'Trophic State'
        }
     ]
});

var swsiTable = jspreadsheet(document.getElementById('swsi_sp'), {
    defaultColWidth: 250,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    allowInsertRow:false,
    allowDeleteRow:false,
    columns: [
        {
            type: 'text',
            title:'HWSI (people/flow units)'
        },
        {
            type: 'text',
            title:'SWSI (people/flow units)'
        },
        {
            type: 'text',
            title:'Category'
        }
     ]
});

var wrvTable = jspreadsheet(document.getElementById('wrv_sp'), {
    defaultColWidth: 230,
    tableOverflowY: true,
    allowInsertColumn:false,
    allowDeleteColumn:false,
    allowInsertRow:false,
    allowDeleteRow:false,
    columns: [
        {
            type: 'text',
            title:'storage-to-flow'
        },
        {
            type: 'text',
            title:'coef of varaition of percipitation'
        },
        {
            type: 'text',
            title:'import dependence'
        },
        {
            type: 'text',
            title: 'use-to-resource Ratio'
        },
        {
            type: 'text',
            title: 'Coping Capacity'
        },
        {
            type: 'text',
            title: 'Vulnerability Index'
        }
     ],
     
     
    nestedHeaders:[
        {
            title: 'Reliability Index',
            colspan: '3'
        },
        
    ]
});