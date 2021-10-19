/* global ol, map, drawingType, drawSketch, measurementSource, measurementLayer, style_selected*/
var measurementSketch;
var measurementHelpTooltipElement;
var measurementHelpTooltip;
var measureTooltipElement;
var measureTooltip;
var continueMeasurementMsg = 'Click to continue';  
var measurementType = "";
var measurementPointerMoveHandler = function (evt) {
    if (evt.dragging) {
        return;
    }
    if (!measurementType && !drawingType) {
        return;
    }
    var helpMsg;
    if (!measurementType && drawingType){
        var helpMsg = 'Click to start drawing';
    }
    if (measurementType && !drawingType){
        var helpMsg = 'Click to start measurement';
    }
    if (measurementSketch || drawSketch) {
        helpMsg = continueMeasurementMsg;
    }
    measurementHelpTooltipElement.innerHTML = helpMsg;
    measurementHelpTooltip.setPosition(evt.coordinate);
    measurementHelpTooltipElement.classList.remove('hidden');
};
map.addEventListener('pointermove', measurementPointerMoveHandler);
map.getViewport().addEventListener('mouseout', function () {
    if(measurementType || drawingType){
        measurementHelpTooltipElement.classList.add('hidden');
    }
});
var formatLength = function (line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
        output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
    } else {
        output = Math.round(length * 100) / 100 + ' ' + 'm';
    }
    return output;
};
var formatArea = function (polygon) {
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
        output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
    } else {
        output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
    }
    return output;
};
var measurement;
function addMeasurementInteraction() {
    var type = measurementType === 'area' ? 'Polygon' : 'LineString';
    measurement = new ol.interaction.Draw({
        source: measurementSource,
        type: type,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ffd400',
                lineDash: [10, 10],
                width: 2
            })
        })
    });
    map.addInteraction(measurement);
    createMeasureTooltip();
    createMeasurementHelpTooltip();
    var listener;
    measurement.on('drawstart', function (evt) {
        var measureTooltips = document.getElementsByClassName("ol-tooltip-static");
        for (var i = measureTooltips.length-1; i >= 0; i--) {
            measureTooltips[i].remove();
        }
        measurementSource.clear();
        measurementSketch = evt.feature;
        var tooltipCoord = evt.coordinate;
        listener = measurementSketch.getGeometry().on('change', function (evt) {
            var geom = evt.target;
            var output;
            if (geom instanceof ol.geom.Polygon) {
                output = formatArea(geom);
                tooltipCoord = geom.getInteriorPoint().getCoordinates();
            } else if (geom instanceof ol.geom.LineString) {
                output = formatLength(geom);
                tooltipCoord = geom.getLastCoordinate();
            }
            measureTooltipElement.innerHTML = output;
            measureTooltip.setPosition(tooltipCoord);
        });
    });
    measurement.on('drawend', function () {
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-static measurementTooltip';
        measureTooltip.setOffset([0, -7]);
        measurementSketch = null;
        measureTooltipElement = null;
        createMeasureTooltip();
        ol.Observable.unByKey(listener);
    });
}
function createMeasurementHelpTooltip() {
    if (measurementHelpTooltipElement) {
        measurementHelpTooltipElement.remove();
    }
    measurementHelpTooltipElement = document.createElement('div');
    measurementHelpTooltipElement.setAttribute("id", "measurementHelpTooltipElement");
    measurementHelpTooltipElement.className = 'ol-tooltip hidden';
    measurementHelpTooltip = new ol.Overlay({
        element: measurementHelpTooltipElement,
        offset: [15, 0],
        positioning: 'center-left'
    });
    map.addOverlay(measurementHelpTooltip);
}
function createMeasureTooltip() {
    if (measureTooltipElement) {
        measureTooltipElement.parentNode.removeChild(measureTooltipElement);
    }
    measureTooltipElement = document.createElement('div');
    measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
    measureTooltip = new ol.Overlay({
        element: measureTooltipElement,
        offset: [0, -15],
        positioning: 'bottom-center'
    });
    map.addOverlay(measureTooltip);
}
var selectMeasurement = null;
function selectMeasurements(){
    if (selectMeasurement !== null) {
        map.removeInteraction(selectMeasurement);
    }
    selectMeasurement = new ol.interaction.Select({
        layers: [measurementLayer]
    });
    map.addInteraction(selectMeasurement);
    selectMeasurement.on('select', function (e) {
        if(e.selected.length>0){
            e.selected[0].setStyle(style_selected);
        }
    });
};
selectMeasurements();