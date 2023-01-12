import L from "leaflet";
import {addError} from "./ErrorHandler";

let center = [51.1642292, 10.4541194],
    zoom = 6;

let map;

export function createMap() {
    try {
        // Initialisieren der Karte
        // Festlegen der Ansicht auf die angegeben geografischen Koordinaten und Zoom
        map = L.map("map").setView(center, zoom);
        // Hinzufügen der OpenStreetMap TileLayer
        let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" >OpenStreetMap</a>',
                zIndex: 1,
                className: "map-tiles"
            }
        ).addTo(map);

        return map;
    } catch (e) {
        addError(new Error("Karte konnte nicht geladen werden", {cause: e}))
    }
}

export {map};



