/* global ol, map, rivers */
var style_selected = new ol.style.Style({ //style to be added on selected layer
    fill: new ol.style.Fill({
        color: 'rgba(255, 255, 255, 0.2)'
    }),
    stroke: new ol.style.Stroke({
        color: 'red',
        width: 6,
        opacity:1
    }),
    image: new ol.style.Circle({
        radius: 5,
        fill: new ol.style.Fill({
            color: 'red'
        })
    })
});
var select = null;
function selectRiver(){
    if (select !== null) {
        map.removeInteraction(select);
    }
    select = new ol.interaction.Select({
        layers: [rivers]
    });
    map.addInteraction(select);
    select.on('select', function (e) {
        if(e.selected.length>0){
            e.selected[0].setStyle(style_selected);
            if(e.selected[0].get("layer") === "branch_1"){
                showPopup("B1_sp", "B2_sp", "Env_sp", "Branch #1");
            }else{
                showPopup("B2_sp", "B1_sp", "Env_sp", "Branch #2");
            }
            
        }
    });
};
selectRiver();