/* global reservoir, am4core, am4charts, data_branch_1, data_branch_2, lineSeries, epaTable, wrv, swsiTable, wrvTable, rivers, riverStroke */
var carlson;
var wvr;
var Do_series;
var Chla_series;
var epa;
var swsi;
var wrvInputs;
var swsiInputs;
var indexType;
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
        url : "../cgi-bin/Output_DO.py",
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
                DO_output = checkForNegativeValues(DO_output);
                calculate_chlorophyll(data, DO_output);
            }
        },
        error: function(xhr) { 
            document.getElementById("disableDiv").style.display = "none";
            document.getElementById("waitingSpinner").style.display = "none";
            alert(xhr.responseText);
        }
    });
}
function calculate_chlorophyll(data, DO_output){
    $.ajax({
        type : "POST",
        url : "../cgi-bin/Output_ChlorophyllA.py",
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
                CHL_output = checkForNegativeValues(CHL_output);
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
function checkForNegativeValues(list){
    var newList = [];
    for (var i=0; i<list.length; i++){
        if (list[i]<0.05){
            newList.push(0.05);
        }else{
            newList.push(list[i]);
        }
    }
    return newList;
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
                Chla_series = results[0];
                Do_series = results[1];
                carlson = calculateCarlson(Chla_series);
                enableResultElements(carlson);
            }
        },
        error: function(xhr) { 

        }
    });
}
function disableResultElements(){                          
    document.getElementById("dayNumber").innerHTML = "-";
    document.getElementById("indexValue").innerHTML = "-"; 
    document.getElementById("ws_indexValue").innerHTML = "-";
    document.getElementById("ws_indexCategory").innerHTML = "-";
    document.getElementById("btnChartCarlson").disabled = true;
    document.getElementById("btnChartDo").disabled = true;
    document.getElementById("btnChartChla").disabled = true;
    document.getElementById("btnDetails").disabled = true;
    document.getElementById("range").disabled = true;
    document.getElementById("carlson").disabled = true;
    document.getElementById("epa").disabled = true;
    document.getElementById("swsi").disabled = true;
    document.getElementById("wrv").disabled = true;
    
    var defaultStyle = reservoir.getStyle();
    defaultStyle.getFill().setColor([80,80,80]);
    reservoir.setStyle(defaultStyle);
    rivers.setStyle(setRiversStyle);
}

function enableResultElements(carlsonList){
    document.getElementById("btnChartCarlson").disabled = false;
    document.getElementById("btnChartDo").disabled = false;
    document.getElementById("btnChartChla").disabled = false;
    document.getElementById("btnDetails").disabled = false;
    document.getElementById("range").disabled = false;
    document.getElementById("carlson").disabled = false;
    document.getElementById("epa").disabled = false;
    document.getElementById("swsi").disabled = false;
    document.getElementById("wrv").disabled = false;
    document.getElementById("carlson").checked = true;
    document.getElementById("detailsButtonRow").style.display = "none";
    document.getElementById("indexValueTitle").innerHTML = "Value: ";
    indexType = "carlson";
    document.getElementById("wrv_swsi").style.display = "none";
    document.getElementById("carlson_epa").style.display = "block";
    document.getElementById("epa").checked = false;
    document.getElementById("swsi").checked = false;
    document.getElementById("wrv").checked = false;
    document.getElementById("range").value = 0;
    document.getElementById("range").max = carlsonList.length-1;
    radioIsCarlson(carlsonList, 0);
}

var riversNewStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
        color: '#001dff',
        width: 5
    })
});

function changeReservoirStyle(value){
    let ReservoirStyle = reservoir.getStyle();    
    if(value === "Eutrophic" || value === "Absolute water stress" || value === "High vulnerability"){
        ReservoirStyle.getFill().setColor([255,0,0]);
        riversNewStyle.getStroke().setColor([255,0,0]);
    }else if(value === "Mesotrophic" || value === "Water scarcity" || value === "Low vulnerability"){
        ReservoirStyle.getFill().setColor([255,255,0]);
        riversNewStyle.getStroke().setColor([255,255,0]);
    }else if(value === "Oligotrophic" || value === "No stress" || value === "No vulnerability"){
        ReservoirStyle.getFill().setColor([0,255,0]);
        riversNewStyle.getStroke().setColor([0,255,0]);
    }else if(value === "Water stress" || value === "Vulnerable"){
        ReservoirStyle.getFill().setColor([255,150,0]);
        riversNewStyle.getStroke().setColor([255,150,0]);
    }else{
        ReservoirStyle.getFill().setColor(value);
        riversNewStyle.getStroke().setColor(value);
    }
    reservoir.setStyle(ReservoirStyle);
    rivers.setStyle(riversNewStyle);
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
        carlson.push(30.56+9.81*Math.log(chla[i])); 
    }
    return carlson;
}

function calculateWRV(inputs){                                                        //TBA
    var storageToFlow = inputs[0]/inputs[1];
    var storageToFlowClass;
    if(storageToFlow>0.6){
        storageToFlowClass = 1;
    }else if(storageToFlow>0.3 && storageToFlow<=0.6){
        storageToFlowClass = 2;
    }else if(storageToFlow>0.2 && storageToFlow<=0.3){
        storageToFlowClass = 3;
    }else{
        storageToFlowClass = 4;
    }
    
    var COV = inputs[6]/inputs[2];
    var COVClass;
    if(COV<0.06){
        COVClass = 1;
    }else if(COV>=0.06 && COV<0.12){
        COVClass = 2;
    }else if(COV>=0.12 && COV<0.18){
        COVClass = 3;
    }else{
        COVClass = 4;
    }
    
    var importDependence = inputs[3];
    var importDependenceClass;
    if(importDependence<0.06){
        importDependenceClass = 1;
    }else if(importDependence>=0.06 && importDependence<0.12){
        importDependenceClass = 2;
    }else if(importDependence>=0.12 && importDependence<0.18){
        importDependenceClass = 3;
    }else{
        importDependenceClass = 4;
    }
    
    var compositeScore = storageToFlowClass + COVClass + importDependenceClass;
    var reliabilityIndex;
    if(compositeScore<=3){
        reliabilityIndex = 1;
    }else if(compositeScore>=4 && compositeScore<=6){
        reliabilityIndex = 2;
    }else if(compositeScore>=7 && compositeScore<=9){
        reliabilityIndex = 3;
    }else{
        reliabilityIndex = 4;
    }
    
    var useToResourceRatio = inputs[4]/inputs[7];
    var useToResourceRatioClass;
    if(useToResourceRatio<0.1){
        useToResourceRatioClass = 1;
    }else if(useToResourceRatio>=0.1 && useToResourceRatio<0.2){
        useToResourceRatioClass = 2;
    }else if(useToResourceRatio>=0.2 && useToResourceRatio<0.4){
        useToResourceRatioClass = 3;
    }else{
        useToResourceRatioClass = 4;
    }
    
    
    var copingCapacityIndex = inputs[5];
    var copingCapacityIndexClass;
    if(copingCapacityIndex>8625){
        copingCapacityIndexClass = 1;
    }else if(copingCapacityIndex<=8625 && copingCapacityIndex>2786){
        copingCapacityIndexClass = 2;
    }else if(copingCapacityIndex<=2786 && copingCapacityIndex>695){
        copingCapacityIndexClass = 3;
    }else{
        copingCapacityIndexClass = 4;
    }
    
    var wrv = Math.max(reliabilityIndex, useToResourceRatioClass, copingCapacityIndexClass);
    var wrvClass;
    if(wrv === 1){
        wrvClass = "No vulnerability";
    }else if(wrv === 2){
        wrvClass = "Low vulnerability";
    }else if(wrv === 3){
        wrvClass = "Vulnerable";
    }else{
        wrvClass = "High vulnerability";
    }
    var output = [wrvClass, wrv, storageToFlowClass, storageToFlow, COVClass, COV, importDependenceClass, importDependence, reliabilityIndex, compositeScore, useToResourceRatioClass, useToResourceRatio, copingCapacityIndexClass, copingCapacityIndex];
    return output;
}

function calculateSWSI(inputs){
    var output = [];
    var SWSI = 1000000/(inputs[0]*inputs[1]*2);
    var SWSIClass;
    if(SWSI<600){
        SWSIClass = "No stress"; 
    }else if(SWSI>=600 && SWSI<1000){
        SWSIClass = "Water scarcity";
    }else if(SWSI>=1000 && SWSI<2000){
        SWSIClass = "Water stress";
    }else{
        SWSIClass = "Absolute water stress";
    }
    var HWSI = 1000000/inputs[0];
    var HWSIClass;
    if(HWSI<600){
        HWSIClass = "No stress"; 
    }else if(HWSI>=600 && HWSI<1000){
        HWSIClass = "Water scarcity";
    }else if(HWSI>=1000 && HWSI<2000){
        HWSIClass = "Water stress";
    }else{
        HWSIClass = "Absolute water stress";
    }
    var output = [SWSIClass, SWSI, HWSIClass, HWSI];
    return output;
}

function epaClass(Chla, Do_calculated){    
    var Do_saturation = [];
    var Do = [];
    if(data_branch_1.length !== data_branch_2.length || data_branch_1.length/5 !== Chla.length){
        return false;
    }
    for (var i=0; i<data_branch_1.length; i++){
        var t = (data_branch_1[i][0]*data_branch_1[i][1]+data_branch_2[i][0]*data_branch_2[i][1])/(data_branch_1[i][0]+data_branch_2[i][0]);
        Do_saturation.push(0.8615*Math.E^(7.7117-1.31403*Math.log(t+45.93)));
    }
    for (var i=0; i<Do_calculated.length; i++){
        Do.push(Do_calculated[i]*5/(Do_saturation[i*5]+Do_saturation[i*5+1]+Do_saturation[i*5+2]+Do_saturation[i*5+3]+Do_saturation[i*5+4])*100);
    }
    var classification = [];
    for(var i=0; i<Chla.length; i++){
        if(Chla[i]>10 || Do[i]<10){
            classification.push("Eutrophic");
            continue;
	}else if((Chla[i]<=10 && Chla[i]>=4) || (Do[i]<=80 && Do[i]>=10)){
            classification.push("Mesotrophic");
            continue;
	}else{
            classification.push("Oligotrophic");
	}
    }
    return classification;
}

document.getElementById("range").addEventListener('change', function(){
    var dayNumber = document.getElementById("range").value;
    if(document.getElementById("carlson").checked){
        radioIsCarlson(carlson, dayNumber);
    }else if (document.getElementById("epa").checked){
        radioIsEPA(epa, dayNumber);
    }
});
function changeRadioIndexType(radio) {
    indexType = radio.value;
    if(radio.value === "epa" || radio.value === "carlson"){
        document.getElementById("carlson_epa").style.display = "block";
        document.getElementById("wrv_swsi").style.display = "none";
        var dayNumber = document.getElementById("range").value;
        if(radio.value === "epa"){
            document.getElementById("detailsButtonRow").style.display = "flex";
            document.getElementById("indexValueTitle").innerHTML = "EPA Classname: ";
            epa = epaClass(Chla_series, Do_series);
            radioIsEPA(epa, dayNumber);
        }else if (radio.value === "carlson"){
            document.getElementById("detailsButtonRow").style.display = "none";
            document.getElementById("indexValueTitle").innerHTML = "Value: ";
            radioIsCarlson(carlson, dayNumber);
        }
    }else{
        document.getElementById("carlson_epa").style.display = "none";
        document.getElementById("wrv_swsi").style.display = "block";
        document.getElementById("detailsButtonRow").style.display = "flex";
        if(radio.value === "swsi"){
            document.getElementById("ws_indexValue").innerHTML = swsi[1].toFixed(2);
            document.getElementById("ws_indexCategory").innerHTML = swsi[0];
            changeReservoirStyle(swsi[0]);
        }else if(radio.value === "wrv"){
            document.getElementById("ws_indexValue").innerHTML = wrv[1];
            document.getElementById("ws_indexCategory").innerHTML = wrv[0];
            changeReservoirStyle(wrv[0]);
        }
    }
}

function radioIsEPA(epa, dayNumber){
    if (!epa){
        alert("Invalid inputs. You need to enter data for 5 days or multiple of 5 days. Make sure you have saved all the tables and clicked the \"Start the Calculation\" button.");
        return false;
    }
    document.getElementById("dayNumber").innerHTML = dayNumber*5+1 + "-" + (dayNumber*5+5);
    document.getElementById("indexValue").innerHTML = epa[dayNumber];
    changeReservoirStyle(epa[dayNumber]);
}
function radioIsCarlson(carlson, dayNumber){
    if (!carlson){
        alert("Invalid inputs. You need to enter data for 5 days or multiple of 5 days. Make sure you have saved all the tables and clicked the \"Start the Calculation\" button.");
        return false;
    }
    document.getElementById("dayNumber").innerHTML = dayNumber*5+1 + "-" + (dayNumber*5+5);
    document.getElementById("indexValue").innerHTML = carlson[dayNumber].toFixed(2);
    changeReservoirStyle(getRGB(carlson[dayNumber]));
}

function hideChart(elem){
    elem.parentNode.style.display = "none";
    document.getElementById("disableDiv").style.display = "none";
}
function showExportChart(){
    document.getElementById("chart").style.display = "flex";
    document.getElementById("disableDiv").style.display = "block";
}

function createChart(chartTitle, output, valueAxisTitle, seriesName1, value1, seriesName2, value2){
    var chart = am4core.create("chartDiv", am4charts.XYChart);
    chart.paddingRight = 25;
    chart.paddingTop = 50;
    chart.paddingBottom = 0;
    chart.height = 500;
    chart.data = output;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "day";
    categoryAxis.title.text = "Day";
    categoryAxis.renderer.minGridDistance = 50;
    var xLabel = categoryAxis.renderer.labels.template;
    xLabel.maxWidth = 40;
    categoryAxis.events.on("sizechanged", function(ev) {
        var axis = ev.target;
        var cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
        
        if (cellWidth < axis.renderer.labels.template.maxWidth) {
            axis.renderer.labels.template.rotation = -65;
            axis.renderer.labels.template.horizontalCenter = "middle";
            axis.renderer.labels.template.verticalCenter = "middle";
        }
        else {
            axis.renderer.labels.template.rotation = 0;
            axis.renderer.labels.template.horizontalCenter = "middle";
            axis.renderer.labels.template.verticalCenter = "top";
        }
    });
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = valueAxisTitle; 
    valueAxis.renderer.minGridDistance = 20;
    createSeries(chart, seriesName1, value1, "#67b7dc");
    if(seriesName2 !== undefined && value2 !== undefined){
        createSeries(chart, seriesName2, value2, "#FF0000");
    }
    var label = chart.chartContainer.createChild(am4core.Label);
    label.text = chartTitle;
    label.dy = -470;
    label.align = "center";
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.align = "right";
    chart.exporting.menu.verticalAlign = "top";
    chart.exporting.menu.items[0].icon = "./img/download.png";
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.maxTooltipDistance = 20;
}

function createSeries(chart, seriesName, value, color){
    var series = chart.series.push(new am4charts.LineSeries());
    series.name = seriesName;
    series.stroke = am4core.color(color);
    series.strokeWidth = 3;
    series.dataFields.valueY = value;
    series.dataFields.categoryX = "day";
    series.tooltipText = "[bold]Days: {categoryX}\n Value: {valueY}[/]";
    var circleBullet = series.bullets.push(new am4charts.CircleBullet());
    circleBullet.circle.stroke = am4core.color("#fff");
    circleBullet.circle.fill = am4core.color(color);
    circleBullet.circle.strokeWidth = 2;
    return series;
}

function createChartWithRange(chartTitle, output, valueAxisTitle, seriesName1, value1){
    var chart = am4core.create("chartDiv", am4charts.XYChart);
    chart.paddingRight = 25;
    chart.paddingTop = 50;
    chart.paddingBottom = 0;
    chart.height = 500;
    chart.data = output;
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "day";
    categoryAxis.title.text = "Day";
    categoryAxis.renderer.minGridDistance = 50;
    var xLabel = categoryAxis.renderer.labels.template;
    xLabel.maxWidth = 40;
    categoryAxis.events.on("sizechanged", function(ev) {
        var axis = ev.target;
        var cellWidth = axis.pixelWidth / (axis.endIndex - axis.startIndex);
        
        if (cellWidth < axis.renderer.labels.template.maxWidth) {
            axis.renderer.labels.template.rotation = -65;
            axis.renderer.labels.template.horizontalCenter = "middle";
            axis.renderer.labels.template.verticalCenter = "middle";
        }
        else {
            axis.renderer.labels.template.rotation = 0;
            axis.renderer.labels.template.horizontalCenter = "middle";
            axis.renderer.labels.template.verticalCenter = "top";
        }
    });
    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.title.text = valueAxisTitle; 
    valueAxis.renderer.minGridDistance = 20;
    var series = createSeries(chart, seriesName1, value1, "#67b7dc");
    
    
    var range = valueAxis.createSeriesRange(series);
    range.value = 40;
    range.endValue = 60;
    range.contents.stroke = am4core.color("#ffff00");
    var range1 = valueAxis.createSeriesRange(series);
    range1.value = 0;
    range1.endValue = 40;
    range1.contents.stroke = am4core.color("#00ff00");
    var range2 = valueAxis.createSeriesRange(series);
    range2.value = 60;
    range2.endValue = 100;
    range2.contents.stroke = am4core.color("#ff0000");
    var label = chart.chartContainer.createChild(am4core.Label);
    label.text = chartTitle;
    label.dy = -470;
    label.align = "center";
    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.align = "right";
    chart.exporting.menu.verticalAlign = "top";
    chart.exporting.menu.items[0].icon = "./img/download.png";
    
    var bullet = series.bullets.push(new am4charts.Bullet());
    var arrow = bullet.createChild(am4core.Circle);
    arrow.horizontalCenter = "middle";
    arrow.verticalCenter = "middle";
    arrow.stroke = am4core.color("#fff");
    arrow.direction = "top";
    arrow.width = 12;
    arrow.height = 12;
    arrow.adapter.add("fill", function(fill, target) {
        if (!target.dataItem) {
            return fill;
        }
        var values = target.dataItem.values;
        if (values.valueY.value<40){
            return am4core.color("#00ff00"); 
        }else if (values.valueY.value>=40 && values.valueY.value<=60){
            return am4core.color("#ffff00");
        }else{
            return am4core.color("#ff0000");
        }
    });
    chart.cursor = new am4charts.XYCursor();
    chart.cursor.maxTooltipDistance = 20;
}

document.getElementById("btnChartCarlson").addEventListener('click', function(){
    showExportChart();
    var output = [];
    for(var i=0; i<carlson.length; i++){
        var item = {day: (i*5+1)+"_"+(i*5+5), value: carlson[i]};
        output.push(item);
    }
    createChartWithRange("Carlson Trophic State Index", output, "Carlson TSI", "Carlson", "value");
});

document.getElementById("btnChartDo").addEventListener('click', function(){
    showExportChart();
    var output = [];
    for(var i=0; i<Do_series.length; i++){
        var item = {day: (i*5+1)+"_"+(i*5+5), Do: Do_series[i]};
        output.push(item);
    }
    createChart("DO Concentration", output, "Concentration (mg/l)", "Do", "Do");
});

document.getElementById("btnChartChla").addEventListener('click', function(){
    showExportChart();
    var output = [];
    for(var i=0; i<Chla_series.length; i++){
        var item = {day: (i*5+1)+"_"+(i*5+5), Chla: Chla_series[i]};
        output.push(item);
    }
    createChart("Chlorophyll-a Concentration", output, "Concentration (mg/m[baseline-shift: super;]3)", "Chla", "Chla");
});

document.getElementById("btnDetails").addEventListener("click", function(){
    if(indexType === "epa"){
        createDetailsEPA();
    }else if(indexType === "wrv"){
        createDetailsWRV();
    }else if (indexType === "swsi"){
        createDetailsSWSI();
    }
});

function createDetailsEPA(){
    document.getElementById("calculationContainer").style.display = "block";
    document.getElementById("epa_sp").style.display = "block";
    document.getElementById("calculationSpreadSheetTitle").innerHTML = "EPA Trophic State Classification";
    document.getElementById("wrv_sp").style.display = "none";
    document.getElementById("swsi_sp").style.display = "none";
    var data = new Array();
    for (var i=0; i<epa.length; i++){
        var row = new Array();
        row.push((i*5+1)+"-"+(i*5+5));
        row.push(Do_series[i].toFixed(2));
        row.push(Chla_series[i].toFixed(2));
        row.push(epa[i]);
        data.push(row);
    }
    epaTable.setData(data);
}

function createDetailsWRV(){
    document.getElementById("calculationContainer").style.display = "block";
    document.getElementById("epa_sp").style.display = "none";
    document.getElementById("wrv_sp").style.display = "block";
    document.getElementById("calculationSpreadSheetTitle").innerHTML = "Water Resource Vulnerability Index";
    document.getElementById("swsi_sp").style.display = "none";
    var data = new Array();
    var row = new Array();
    row.push(wrv[3].toFixed(2));
    row.push(wrv[5].toFixed(2));
    row.push(Number(wrv[7]).toFixed(2));
    row.push(wrv[11].toFixed(2));
    row.push(Number(wrv[13]).toFixed(2));
    row.push(wrv[0]);
    data.push(row);
    wrvTable.setData(data);
}

function createDetailsSWSI(){
    document.getElementById("calculationContainer").style.display = "block";
    document.getElementById("epa_sp").style.display = "none";
    document.getElementById("wrv_sp").style.display = "none";
    document.getElementById("swsi_sp").style.display = "block";
    document.getElementById("calculationSpreadSheetTitle").innerHTML = "Social Water Stress Index";
    var data = new Array();
    var row = new Array();
    row.push(swsi[3].toFixed(2));
    row.push(swsi[1].toFixed(2));
    row.push(swsi[0]);
    data.push(row);
    swsiTable.setData(data);
}