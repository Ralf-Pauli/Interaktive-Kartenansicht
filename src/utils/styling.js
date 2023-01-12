import L from "leaflet";
import {colors, conditions, getInfo, toggleSidebar} from "@/utils/mapControls";

let currentLayer;

export function onEachFeature(feature, layer) {
    if (layer.feature.geometry.type === "MultiPolygon" || layer.feature.geometry.type === "Polygon") {
        layer.on({
            mouseover: highlightFeature, mouseout: resetHighlight, click: toggleSidebar
        });
    }
}

export function highlightFeature(e) {
    let layer = e.target;
    layer.setStyle({
        weight: 3,
        color: 'black',
        dashArray: '',
        fillOpacity: 0.7
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
    getInfo().update(layer.feature.properties);
}

export function resetHighlight(e) {
    getCurrentLayer().resetStyle(e.target);
    getInfo().update();
}

export function getColor(value) {
    let color;
    conditions.forEach((condition, index) => {
        if (value > condition) {
            color = colors[index];
        }
    });
    return color || colors[colors.length - 1];
}

export function style() {

    return {
        fillColor: "rgba(255, 0, 0, 0)",
        weight: 2,
        opacity: 1,
        color: "black",
        dashArray: '3',
        fillOpacity: 0.7
    };
}

export function coronaStyle(feature) {
    return {
        fillColor: getColor(feature.properties.cases7Per100k),
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

export function setCurrentLayer(layer) {
    currentLayer = layer;
}

export function getCurrentLayer() {
    return currentLayer;
}