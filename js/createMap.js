/* global ol, Infinity */
const bing = new ol.layer.Tile({
      preload: Infinity,
      zIndex: 0,
      source: new ol.source.BingMaps({
        key: 'AudsBZ_uT9DN3PECvgnmzwQRPSkVOwalsp7ZwqfHvu1RU6nP_eh-8lCJja5FGnPq',
        imagerySet: "AerialWithLabelsOnDemand"
      })
    });
var riverStroke = new ol.style.Stroke({
    width: 5
});
var riverStyle = new ol.style.Style({
    stroke: riverStroke
});

const setRiversStyle = function (feature) {
    const layer = feature.get("layer");
    riverStroke.setColor(layer === 'branch_1' ? "#1e83ff" : '#0000FF');
    return riverStyle;
};
//layers defenition
const rivers = new ol.layer.Vector({
    zIndex: 2,
    source: new ol.source.Vector({
        projection: 'EPSG:32638',
        url: 'data/branches_epsg3857.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: setRiversStyle
});
//alert(rivers.getSource().getFeatures().length);


const reservoir = new ol.layer.Vector({
    zIndex: 1,
    source: new ol.source.Vector({
        projection: 'EPSG:32638',
        url: 'data/reservoir_epsg3857.geojson',
        format: new ol.format.GeoJSON()
    }),
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(80, 80, 80, 0.6)'
        }),
        stroke: new ol.style.Stroke({
            color: '#001dff',
            width: 1
        })
    })
});
//display curser position
var mousePositionControl = new ol.control.MousePosition({
    coordinateFormat: ol.coordinate.createStringXY(),
    //projection: 'EPSG:32638',
    projection: 'EPSG:3857',
    // comment the following two lines to have the mouse position
    // be placed within the map.
    className: 'custom-mouse-position',
    target: document.getElementById("coordinate"),
    undefinedHTML: '&nbsp;'
});
var controls = ol.control.defaults({rotate: false}).extend([mousePositionControl]); 
var interactions = ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false});
var map = new ol.Map({
    layers: [bing, reservoir, rivers],
    target: 'map',
    view: new ol.View({
        center: [5218800, 4177000],
        zoom: 12.5
    }),
    controls: controls,
    interactions: interactions
});
var drawingSource = new ol.source.Vector({wrapX: false});
var drawingFeaturesLayer = new ol.layer.Vector({
    zIndex: 2,
    source: drawingSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#e9ff00',
            width: 2
        }),
        image: new ol.style.Circle({
            radius: 5,
            fill: new ol.style.Fill({
                color: '#e9ff00'
            })
        })
    })
});
map.addLayer(drawingFeaturesLayer);
var measurementSource = new ol.source.Vector();
var measurementLayer = new ol.layer.Vector({
    zIndex: 3,
    source: measurementSource,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffd400',
            width: 2
        }),
    })
});
map.addLayer(measurementLayer);