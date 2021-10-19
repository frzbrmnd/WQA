/* global ol, map, style_selected, drawingSource, drawingFeaturesLayer */
var drawingType = "";
var drawSketch;
var existingIds = [];
const modify = new ol.interaction.Modify({
    source: drawingSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#e9ff00',
            lineDash: [10, 10],
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 6,
            fill: new ol.style.Fill({
                color: '#e9ff00'
            })
        })
    })
});
map.addInteraction(modify);
modify.on("modifyend", function(event){
    modifyFeature(event.features.item(0));
});
let draw, snap;
function addDrawingInteraction() {
    let type;
    switch (drawingType) {
        case "drawingPoint":
            type = "Point";
            break;
        case "drawingLine":
            type = "LineString";
            break;
        case "drawingPolygon":
            type = "Polygon";
            break;
        case "drawingCircle":
            type = "Circle";
    }
    draw = new ol.interaction.Draw({
        source: drawingSource,
        type: type,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#e9ff00',
                lineDash: [10, 10],
                width: 2
            })
        })
        //freehand: true, in case of nedding freehand
    });
    map.addInteraction(draw);
    snap = new ol.interaction.Snap({source: drawingSource});
    map.addInteraction(snap);
    createMeasurementHelpTooltip();
    draw.on('drawstart', function (evt) {     
        drawSketch = evt.feature;
    });
    draw.on('drawend', function (event) {
        var id = idGenerator(existingIds);
        drawSketch.setId(id);
        insertFeatureIntoDB(drawSketch);
        drawSketch = null;
    });
}
var featureSelect = null;
function selectFeatures(){
    if (featureSelect !== null) {
        map.removeInteraction(featureSelect);
    }
    featureSelect = new ol.interaction.Select({
        layers: [drawingFeaturesLayer]
    });
    map.addInteraction(featureSelect);
    featureSelect.on('select', function (e) {
        if(e.selected.length>0){
            e.selected[0].setStyle(style_selected);
        }
    });
};
selectFeatures();
function insertFeatureIntoDB(feature){
    var type = feature.getGeometry().getType();
    if (type === "Circle"){
        $.ajax({
            type : "POST",
            url : "index_ajax_handler.php",
            data: {
                type: feature.getGeometry().getType(),
                center: JSON.stringify(feature.getGeometry().getCenter()),
                radius: feature.getGeometry().getRadius(),
                drawingUsername: document.getElementById("btnOptions").innerHTML,
                drawingProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML,
                featureId: feature.getId()
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
                type: feature.getGeometry().getType(),
                coords: JSON.stringify(feature.getGeometry().getCoordinates()),
                drawingUsername: document.getElementById("btnOptions").innerHTML,
                drawingProjectName: document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML,
                featureId: feature.getId()
            },
            dataType: 'text',
            success : function(response) {
                
            },
            error: function(xhr) { 

            }
        });
    }
}
function idGenerator(){
    var index = drawingSource.getFeatures().length;
    var username = document.getElementById("btnOptions").innerHTML;
    var projectName = document.getElementsByClassName("currentProject")[0].childNodes[0].innerHTML;
    var id = username + "_" + projectName +  "_" + index;
    while(existingIds.includes(id)){
        index += 1;
        id = username + "_" + projectName +  "_" + index;
    } 
    existingIds.push(id);
    return id;
}