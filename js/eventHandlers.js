/* global map, selectMeasurement, measurementSource, drawingSource, featureSelect, draw, snap, measurement, select, measurementHelpTooltipElement, bing, rivers, reservoir*/
//keyboard handler for deleting selected features by delete button
window.onkeydown = function(e) {keyboardEventsHandler(e);};
function keyboardEventsHandler(e) {
    if(e.keyCode === 46){
       // alert(selectMeasurement.getFeatures().getLength());
        if(selectMeasurement.getFeatures().getLength()>0){
            measurementSource.removeFeature(selectMeasurement.getFeatures().item(0));
            var measureTooltips = document.getElementsByClassName("measurementTooltip");
            for (var i = measureTooltips.length-1; i >= 0; i--) {
                measureTooltips[i].remove();
            }
        }
        for(var i=featureSelect.getFeatures().getLength()-1; i>=0; i--){
            drawingSource.removeFeature(featureSelect.getFeatures().item(i));
            removeFeatureFromDB(featureSelect.getFeatures().item(i));
        }
    }
}
//drawing and measurment 
var customDropdownItems = document.getElementsByClassName("custom-dropdown-item");
Array.prototype.forEach.call(customDropdownItems, function(element) {
    element.addEventListener('click', function() {   
        var parentId = element.parentNode.id === "measurementTypes" ? "selectMeasurementType" : "selectDrawingType";
        map.removeInteraction(draw);
        map.removeInteraction(snap);
        map.removeInteraction(measurement);
        map.removeInteraction(select);
        map.removeInteraction(selectMeasurement);
        map.removeInteraction(featureSelect);
        if(drawingType === element.id || measurementType === element.id){
            inactivateDrawingAndSelect(element.id, parentId);
        }else{
            activateDrawingAndSelect(element.id, parentId);
        }
    });    
});
function inactivateDrawingAndSelect(idSelf, idParent){
    measurementType = "";
    drawingType = "";
    measurementHelpTooltipElement.remove();
    document.getElementById(idParent).classList.remove("boldBackground");
    document.getElementById(idSelf).classList.remove("boldBackground");
    selectRiver();
    selectMeasurements();
    selectFeatures();
}
function activateDrawingAndSelect(idSelf, idParent){
    if(measurementType !== ""){
        document.getElementById(measurementType).classList.remove("boldBackground");
        document.getElementById("selectMeasurementType").classList.remove("boldBackground");
    }else if (drawingType !== ""){
        document.getElementById(drawingType).classList.remove("boldBackground");
        document.getElementById("selectDrawingType").classList.remove("boldBackground");
    } 
    if(idParent === "selectMeasurementType"){
        measurementType = idSelf;
        drawingType = "";
        addMeasurementInteraction();
        document.getElementById("selectMeasurementTypeImage").src = idSelf === "length" ? "./img/distance.png" : "./img/area.png";
    }else{
        measurementType = "";
        drawingType = idSelf;
        addDrawingInteraction();
        document.getElementById("selectDrawingTypeImage").src = "./img/" + idSelf + ".png";
    }
    document.getElementById(idParent).classList.add("boldBackground");
    document.getElementById(idSelf).classList.add("boldBackground");
}
//toggle input table
document.getElementById("B1Button").addEventListener("click", function(){
    showPopup("B1_sp", "B2_sp", "Env_sp", "Branch #1");
});
document.getElementById("B2Button").addEventListener("click", function(){
    showPopup("B2_sp", "B1_sp", "Env_sp", "Branch #2");
});
document.getElementById("ENVButton").addEventListener("click", function(){
    showPopup("Env_sp", "B2_sp", "B1_sp", "Meteorological and Reservoir Variables");
});
document.getElementById("vulButton").addEventListener("click", function(){
    showVulModal();
});
document.getElementById("socButton").addEventListener("click", function(){
    showSocModal();
});
function showPopup(sp1, sp2, sp3, spreadSheetTitle){
    document.getElementById("inputContainer").style.display = "block";
    myTable = document.getElementById(sp1);
    document.getElementById(sp1).style.display = "block";
    document.getElementById(sp2).style.display = "none";
    document.getElementById(sp3).style.display = "none";
    document.getElementById("vulModal").style.display = "none";
    document.getElementById("socModal").style.display = "none";
    document.getElementById("spreadSheetTitle").innerHTML = spreadSheetTitle;
}

//toggle panel
var panel = document.getElementById("panel");
document.getElementById("togglePanelButton").addEventListener('click', function () {
    document.getElementById("togglePanelIcon").classList.toggle("closePanelIcon");
    document.getElementById("togglePanelIcon").classList.toggle("openPanelIcon");
    if (panel.className.includes("openPanel")) {
        panel.classList.remove("openPanel");
        panel.style.display = "none";
        document.getElementById("panelContainer").className = "";
        document.getElementById("inputContainer").className = "col-10 px-3 wideInputContainer";
    } else {
        panel.classList.add("openPanel");
        panel.style.display = "block";
        document.getElementById("panelContainer").className = "col-lg-3 col-md-4 col-sm-5 forSmallScreens";
        document.getElementById("inputContainer").className = "col-8 px-3 narrowInputContainer";
    }
});
//toggle tab
var tabHeader = document.getElementsByClassName("tabHeader");
var tabBody = document.getElementsByClassName("tabBody");
Array.prototype.forEach.call(tabHeader, function(element) {
    element.addEventListener('click', function() {   
        for(var head of tabHeader){head.classList.remove("currentTabHeader");}
        for(var body of tabBody){body.classList.remove("currentTabBody");}
        element.classList.add("currentTabHeader");
        document.getElementById(element.id + "Body").classList.add("currentTabBody");           
    });    
});
//toggle layers
var toggleLayerCheckbox = document.getElementsByClassName("toggleLayer");
Array.prototype.forEach.call(toggleLayerCheckbox, function(element) {
    element.addEventListener('click', function() {   
        if(element.checked === true){
            
            if(element.id === "bingLayer"){
                map.addLayer(bing);
            }else if(element.id === "riversLayer"){
                map.addLayer(rivers);
            }else{
                map.addLayer(reservoir);
            }
        }else{
            if(element.id === "bingLayer"){
                map.removeLayer(bing);
            }else if(element.id === "riversLayer"){
                map.removeLayer(rivers);
            }else{
                map.removeLayer(reservoir);
            }
        }       
    });    
});