/* global reservoir, am4core, am4charts */
var carlson;
var wvr;
document.getElementById("btnProcess").addEventListener("click", function(){
    document.getElementById("disableDiv").style.display = "block";
    document.getElementById("waitingSpinner").style.display = "block";
    getDataToProcess();
});
function getDataToProcess(){
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            processUsername: document.getElementById("btnOptions").innerHTML,
            processProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML
        },
        dataType: 'text',
        success : function(response) {
            //alert(response);
            calculate_DO_output(response);
        },
        error: function(xhr) { 
            document.getElementById("disableDiv").style.display = "none";
            document.getElementById("waitingSpinner").style.display = "none";
        }
    });
}
function calculate_DO_output(data){
    $.ajax({
        type : "POST",
        url : "../../cgi-bin/wqa.py",
        data: {
            inputs: data
        },
        dataType: 'text',
        success : function(response) {
            var DO_output = JSON.parse(response);
            if (!DO_output){
                document.getElementById("disableDiv").style.display = "none";
                document.getElementById("waitingSpinner").style.display = "none";
                alert("Error processing inputs1");
            }else{
                calculate_chlorophyll(data, DO_output);
            }
        },
        error: function(xhr) { 
            document.getElementById("disableDiv").style.display = "none";
            document.getElementById("waitingSpinner").style.display = "none";
            alert("Error processing inputs2");
        }
    });
}
function calculate_chlorophyll(data, DO_output){
    $.ajax({
        type : "POST",
        url : "../../cgi-bin/wqa2.py",
        data: {
            inputs: data
        },
        dataType: 'text',
        success : function(response) {
            var CHL_output = JSON.parse(response);
            
            if (!CHL_output){
                document.getElementById("disableDiv").style.display = "none";
                document.getElementById("waitingSpinner").style.display = "none";
                alert("Error processing inputs3");
            }else{
                /*document.getElementById("btnChart").disabled = false;
                document.getElementById("range").disabled = false;
                document.getElementById("range").max = CHL_output.length-1;*/
                //output = calculateFinalOutput(DO_output, CHL_output);
                //insertResultsToDB(output);
                insertResultsToDB(DO_output, CHL_output);
                
            }
        },
        error: function(xhr) { 
            document.getElementById("disableDiv").style.display = "none";
            document.getElementById("waitingSpinner").style.display = "none";
            alert("Error processing inputs4");
        }
    });
}
function insertResultsToDB(DO, Chla){
    var username = document.getElementById("btnOptions").innerHTML;
    var project_name = document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML;
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            insertResultsDO: JSON.stringify(DO),
            insertResultsChla: JSON.stringify(Chla),
            insertResultsUsername: username,
            insertResultsProjectName: project_name
        },
        dataType: 'text',
        success : function(response) {
            
            /*carlson = calculateCarlson(Chla);
            var currentDayNumber = document.getElementById("range").value;
            changeReservoirStyle(carlson[currentDayNumber]*4/100);
            document.getElementById("carlson").checked = true;
            document.getElementById("carlson").disabled = false;
            document.getElementById("wrv").disabled = false;
            document.getElementById("epa").disabled = false;*/
            //initialize result tab
            document.getElementById("disableDiv").style.display = "none";
            document.getElementById("waitingSpinner").style.display = "none";
            initResultTab(project_name, username);
            
        },
        error: function(xhr) { 

        }
    });
}
function initResultTab(project_name, username){
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            activateResultTabUsername: username,
            activateResultTabProjectName: project_name 
        },
        dataType: 'text',
        success : function(response) {
            var results = JSON.parse(response);
            // in case of not having any results: disable all buttons and radios and range
            if (!results){     
                disableResultElements();
            }else{                                                                  
                /*document.getElementById("btnChart").disabled = false;
                document.getElementById("range").disabled = false;
                document.getElementById("range").max = results.length-1;
                output = results;
                changeReservoirStyle(output[0]*4/100);*/
                carlson = calculateCarlson(results[0]);
                epa = epaClass(results[0], results[1]);
                wrv = calculateWRV();
                enableResultElements(carlson, wrv, epa);
            }
        },
        error: function(xhr) { 

        }
    });
}
function disableResultElements(){                                                   
    document.getElementById("epa_class").innerHTML = "-";
    document.getElementById("btnChart").disabled = true;
    document.getElementById("range").disabled = true;
    //document.getElementById("carlson").disabled = true;
    //document.getElementById("wrv").disabled = true;
    var defaultStyle = reservoir.getStyle();
    defaultStyle.getFill().setColor([80,80,80]);
    reservoir.setStyle(defaultStyle);
}

function enableResultElements(carlsonList, wrvList, epaList){                                    //TBA
    document.getElementById("epa_class").innerHTML = epaList[0];
    document.getElementById("btnChart").disabled = false;
    document.getElementById("range").disabled = false;
    //document.getElementById("carlson").disabled = false;
    //document.getElementById("wrv").disabled = false;
    //document.getElementById("carlson").checked = true;
    //document.getElementById("wrv").checked = false;
    document.getElementById("range").value = 0;
    document.getElementById("range").max = carlsonList.length-1;
    changeReservoirStyle(carlsonList[0]);
}

function changeReservoirStyle(output){
    let style = reservoir.getStyle();
    style.getFill().setColor(getRGB(output));
    reservoir.setStyle(style);
}
function getRGB(x){
    x = x/50;
    var R, G, B;
    var palete = [[0,255,0],[255,255,0],[255,0,0]];
    var xBottom = parseInt(Math.floor(x));
    var xTop = xBottom + 1;
    if(xBottom === 2){
        R=255; G=0; B=0;
    }else{
        R = (palete[xTop][0] - palete[xBottom][0]) * (x - xBottom) + palete[xBottom][0];
        G = (palete[xTop][1] - palete[xBottom][1]) * (x - xBottom) + palete[xBottom][1];
        B = (palete[xTop][2] - palete[xBottom][2]) * (x - xBottom) + palete[xBottom][2];
    }
    
    return [R, G, B];
}
function calculateCarlson(chla){
    var carlson = [];
    for(var i=0; i<chla.length; i++){
        carlson.push(30.56-9.81*Math.log(chla[i])); 
    }
    return carlson;
}

function calculateWRV(){                                                        //TBA
    return [1.56, 26.78, 93, 51.98, 32, 80.07, 66];
}

function epaClass(Chla, Do){                                                            //TBA
    var classification = [];
    for(var i=0; i<Chla.length; i++){
        if(Chla[i]>10 || Do[i]<10){
		classification.push("Eutrophic");
	}else if((Chla[i]<10 && Chla[i]>4) || (Do[i]<80 && Do[i]>10)){
		classification.push("Mesotrophic");
	}else{
		classification.push("Oligotrophic");
	}
    }
    return classification;
}
/*function calculateFinalOutput(output1, output2){
    var finalResult = [];
    for(var i=0; i<output1.length; i++){
        finalResult.push((output1[i]+output2[i])/2); 
    }
    return finalResult;
}*/



/*function insertResultsToDB(results){
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            insertResultsData: JSON.stringify(results),
            insertResultsUsername: document.getElementById("btnOptions").innerHTML,
            insertResultsProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML
        },
        dataType: 'text',
        success : function(response) {
            
            //saveResultsToDB(results);
            
        },
        error: function(xhr) { 

        }
    });
}*/



document.getElementById("range").addEventListener('change', function(){
    if(!carlson){
        alert("There are no results");
    }else{
        var dayNumber = document.getElementById("range").value;
        var x = carlson[dayNumber];
        changeReservoirStyle(x);
        document.getElementById("epa_class").innerHTML = epa[dayNumber];
    }
});
function hideChart(elem){
    elem.parentNode.style.display = "none";
    document.getElementById("disableDiv").style.display = "none";
}
function showExportChart(){
    document.getElementById("chart").style.display = "flex";
    document.getElementById("disableDiv").style.display = "block";
}

function createChart(output){
    var chart = am4core.create("chartDiv", am4charts.XYChart);
    chart.paddingRight = 25;
    chart.paddingTop = 50;
    chart.paddingBottom = 0;
    chart.height = 500;
    chart.data = output;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "day";
    categoryAxis.title.text = "Day number";
    categoryAxis.renderer.minGridDistance = 50;
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = "Average Carlson"; 
    valueAxis.renderer.minGridDistance = 20;
    var series = chart.series.push(new am4charts.LineSeries());
    series.name = "test";
    series.stroke = am4core.color("#67b7dc");
    series.strokeWidth = 3;
    series.dataFields.valueY = "value";
    series.dataFields.categoryX = "day";
    var circleBullet = series.bullets.push(new am4charts.CircleBullet());
    circleBullet.circle.stroke = am4core.color("#fff");
    circleBullet.circle.strokeWidth = 2;
    var label = chart.chartContainer.createChild(am4core.Label);
    label.text = "Carlson index";
    label.dy = -470;
    label.align = "center";
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.align = "right";
    chart.exporting.menu.verticalAlign = "top";
    chart.exporting.menu.items[0].icon = "./img/download.png";
}
/*function initializeCarlsonChart(){
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            getResultsChartUsername: document.getElementById("btnOptions").innerHTML,
            getResultsChartProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML
        },
        dataType: 'text',
        success : function(response) {
            var results = JSON.parse(response);
            var output = [];
            for(var i=0; i<results.length; i++){
                var item = {day: (i*5+1)+"_"+(i*5+5), value: results[i]};
                output.push(item);
            }
            createChart(output);
        },
        error: function(xhr) { 
            
        }
    });
}*/

/*function initializeCarlsonChart(){
    alert(carlson[2]);
    createChart(carlson);
}*/
document.getElementById("btnChart").addEventListener('click', function(){
    showExportChart();
    var output = [];
    for(var i=0; i<carlson.length; i++){
        var item = {day: (i*5+1)+"_"+(i*5+5), value: carlson[i]};
        output.push(item);
    }
    createChart(output);
    //initializeChart();
});





