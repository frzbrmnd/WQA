/* global drawingSource, ol, JSC, reservoir, Env, B1, B2 */
var carlson;
var epa;
var wrv;
                
if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
}
function showCreateProjectModal(){
    document.getElementById("createProjectModal").style.display = "block";
    document.getElementById("disableDiv").style.display = "block";
}
function showDeleteProjectModal(elem){
    document.getElementById("disableDiv").style.display = "block";
    document.getElementById("deleteProjectModal").style.display = "block";
    document.getElementById("deleteModalBody").innerHTML = "Deleting <strong>" + elem.parentNode.childNodes[0].innerHTML + "</strong>. Are you Sure?";
    document.getElementById("deleteProjectName").value = elem.parentNode.childNodes[0].innerHTML;
}
function showEditProjectModal(elem){
    document.getElementById("disableDiv").style.display = "block";
    document.getElementById("editProjectModal").style.display = "block";
    document.getElementById("projectPreviousName").value = elem.parentNode.childNodes[0].innerHTML;
}
function hideModal(elem){
    elem.parentNode.parentNode.parentNode.parentNode.style.display = "none";
    document.getElementById("disableDiv").style.display = "none";
}
function copyInviteLink(){
    var copyText = document.getElementById("inviteLink");
    navigator.clipboard.writeText(copyText.innerHTML);
}
function showInviteModal(){
    document.getElementById("disableDiv").style.display = "block";
    document.getElementById("inviteModal").style.display = "block";
}
window.onload = function() {
    initialize();
};
function initialize(){
    getExistingProjectsByOrder();
}
function getExistingProjectsByOrder(){
    var username = document.getElementById("btnOptions").innerHTML;
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            username: username
        },
        dataType: 'text',
        success : function(response) {
            var projectsIdAndName = JSON.parse(response);
            if(projectsIdAndName.length === 0){
                showCreateProjectModal();
            }else{
                createListOfProjects(projectsIdAndName);
                loadData(projectsIdAndName[0][0]);
                initResultTab(projectsIdAndName[0][1], username);
                loadShapes();
            }
        },
        error: function(xhr) { 
            
        }
    });
}
function createListOfProjects(projectsIdAndName){
    const list = document.getElementById("listOfProjects");
    for (var i=0; i<projectsIdAndName.length; i++){
        var listItem = document.createElement('div');
        if (i===0){
            listItem.setAttribute("class", "row justify-content-between m-0 my-2 ps-3 pe-1 align-items-center currentProject");
        }else{
            listItem.setAttribute("class", "row justify-content-between m-0 my-2 ps-3 pe-1 align-items-center");
        }
        var name = document.createElement('spam');
        name.setAttribute("class", "col-9 p-0 pointerOnHover");
        name.innerHTML = projectsIdAndName[i][1];
        name.setAttribute("onclick", "changeCurrentProject(this)");
        var editButton = document.createElement('div');
        editButton.setAttribute("class", "col-1 p-0 pt-1 pointerOnHover");
        editButton.innerHTML = "<img src=\"./img/editProject.png\">";
        editButton.setAttribute("onclick", "showEditProjectModal(this)");
        var deleteButton = document.createElement('div');
        deleteButton.setAttribute("class", "col-1 p-0 pointerOnHover");
        deleteButton.innerHTML = "<svg xmlns=\"./img/trash.svg\" width=\"16\" height=\"16\" fill=\"red\" viewBox=\"0 0 16 16\"><path d=\"M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z\"/><path fill-rule=\"evenodd\" d=\"M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z\"/></svg>";
        deleteButton.setAttribute("onclick", "showDeleteProjectModal(this)");
        list.appendChild(listItem);
        listItem.appendChild(name);
        listItem.appendChild(editButton);
        listItem.appendChild(deleteButton);
    }
    //initializeResultTab();
}
function changeCurrentProject(element){
    document.getElementsByClassName("currentProject")[0].classList.remove("currentProject");
    element.parentNode.classList.add("currentProject");
    var project_name = element.innerHTML;
    var username = document.getElementById("btnOptions").innerHTML;
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            projectUser: username,
            projectName: project_name
        },
        dataType: 'text',
        success : function(response) {
            var currentProjectId = JSON.parse(response);
            loadData(currentProjectId);
            initResultTab(project_name, username);
            loadShapes();
        },
        error: function(xhr) { 
            
        }
    });
}
function loadData(id){
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            currentProjectId: id
        },
        dataType: 'text',
        success : function(response) {
            var data = JSON.parse(response);
            //fillTables(data[0], "B1SpreadSheet");
            //fillTables(data[1], "B2SpreadSheet");
            //fillTables(data[2], "EnvironmentalSpreadSheet");
            fillTables(data[0], B1);
            fillTables(data[1], B2);
            fillTables(data[2], Env);
        },
        error: function(xhr) { 
            
        }
    });
}

/*function initializeResultTab(){                                                       //TBA
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            activateResultTabUsername: document.getElementById("btnOptions").innerHTML,
            activateResultTabProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML
        },
        dataType: 'text',
        success : function(response) {
            var results = JSON.parse(response);
            if (!results){
                document.getElementById("btnChart").disabled = true;
                document.getElementById("range").disabled = true;
            }else{
                document.getElementById("btnChart").disabled = false;
                document.getElementById("range").disabled = false;
                document.getElementById("range").max = results.length-1;
                output = results;
                changeReservoirStyle(output[0]*4/100);
            }
        },
        error: function(xhr) { 

        }
    });
}*/
/*function fillTables(data, tableId){
    var myTable = document.getElementById(tableId);
    myTable.innerHTML = "";
    for (var i=0; i<data.length; i++){
        var newRow = myTable.insertRow(i);
        var dayCell = newRow.insertCell(0);
        dayCell.innerHTML = data[i][2];
        dayCell.setAttribute("class", "firstColumn");
        for (var j=3; j<data[0].length; j++){
            var newCell = newRow.insertCell(j-2);
            var input = document.createElement("INPUT");
            input.setAttribute("type", "number");
            input.value = data[i][j];
            newCell.appendChild(input);
            newCell.setAttribute("class", "otherColumns");
        }
    }
}*/
function fillTables(data, myTable){
    myTable.setData([]);
    if(data.length === 0){
    }else{
        var mainData = new Array();
        for (var i=0; i<data.length; i++){        
            var rowData = new Array();
            for (var j=3; j<data[0].length; j++){
                rowData.push(data[i][j]);
            }
            mainData.push(rowData);
        }
        myTable.setData(mainData);
    }
}

function loadShapes(){
    drawingSource.clear();
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            retrievedrawingUsername: document.getElementById("btnOptions").innerHTML,
            retrievedrawingProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML
        },
        dataType: 'text',
        success : function(response) {
            var features = JSON.parse(response);
            createPoint(features.points);
            createLine(features.lines);
            createPolygon(features.polygons);
            createCircle(features.circles);
        },
        error: function(xhr) { 
            
        }
    });
}
function createPoint(points){
    for (const [key, value] of Object.entries(points)) {
        var coords = value.split(",");
        var pointGeometry = new ol.geom.Point([parseFloat(coords[0].slice(1)),parseFloat(coords[1].slice(0,-1))]);
        var pointFeature = new ol.Feature(pointGeometry);
        pointFeature.setId(key);
        drawingSource.addFeature(pointFeature);
    }
}
function createLine(lines){
    for (const [key, value] of Object.entries(lines)) {
        coords = value.replaceAll("(", "").replaceAll(")", "").split(",");
        var lineGeometry = new ol.geom.LineString([[parseFloat(coords[0]),parseFloat(coords[1])],[parseFloat(coords[2]),parseFloat(coords[3])]]);
        for (var i=2; i<(coords.length)/2; i++){
            lineGeometry.appendCoordinate([parseFloat(coords[i*2]),parseFloat(coords[i*2+1])]);
        }
        var lineFeature = new ol.Feature(lineGeometry);
        lineFeature.setId(key);
        drawingSource.addFeature(lineFeature);
    }
}
function createPolygon(polygons){
    for (const [key, value] of Object.entries(polygons)) {
        coords = value.replaceAll("(", "").replaceAll(")", "").split(",");
        var polygonCoordinates = [];
        for (var i=0; i<(coords.length)/2; i++){
            polygonCoordinates.push([parseFloat(coords[i*2]),parseFloat(coords[i*2+1])]);
        }
        var polygonGeometry = new ol.geom.Polygon([polygonCoordinates]);
        var polygonFeature = new ol.Feature(polygonGeometry);
        polygonFeature.setId(key);
        drawingSource.addFeature(polygonFeature);
    }
}
function createCircle(circles){
    for (const [key, value] of Object.entries(circles)) {
        params = value.replaceAll("(", "").replaceAll(")", "").replaceAll("<", "").replaceAll(">", "").split(",");
        var circleGeometry = new ol.geom.Circle([parseFloat(params[0]), parseFloat(params[1])], parseFloat(params[2]));
        var circleFeature = new ol.Feature(circleGeometry);
        circleFeature.setId(key);
        drawingSource.addFeature(circleFeature);
    }
}
function removeFeatureFromDB(feature){
    $.ajax({
        type : "POST",
        url : "index_ajax_handler.php",
        data: {
            deleteDrawingUsername: document.getElementById("btnOptions").innerHTML,
            deleteDrawingProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML,
            deleteFeatureId: feature.getId(),
            deleteFeatureType: feature.getGeometry().getType()
        },
        dataType: 'text',
        success : function(response) {
            
        },
        error: function(xhr) { 
            
        }
    });
}
function modifyFeature(feature){
    var type = feature.getGeometry().getType();
    if (type === "Circle"){
        $.ajax({
            type : "POST",
            url : "index_ajax_handler.php",
            data: {
                modifyFeatureType: feature.getGeometry().getType(),
                modifyFeatureId: feature.getId(),
                modifyDrawingUsername: document.getElementById("btnOptions").innerHTML,
                modifyDrawingProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML,
                modifyCenter: JSON.stringify(feature.getGeometry().getCenter()),
                modifyRadius: feature.getGeometry().getRadius()
            },
            dataType: 'text',
            success : function(response) {
                
            },
            error: function(xhr) { 

            }
        });
    }else{
        $.ajax({
            type : "POST",
            url : "index_ajax_handler.php",
            data: {
                modifyFeatureType: feature.getGeometry().getType(),
                modifyFeatureId: feature.getId(),
                modifyDrawingUsername: document.getElementById("btnOptions").innerHTML,
                modifyDrawingProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML,
                modifyCoords: JSON.stringify(feature.getGeometry().getCoordinates())
                
            },
            dataType: 'text',
            success : function(response) {
                
            },
            error: function(xhr) { 

            }
        });
    } 
}