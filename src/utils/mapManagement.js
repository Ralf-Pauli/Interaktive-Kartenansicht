import L from "leaflet";

let center = [51.1642292, 10.4541194],
    zoom = 6;

let map;

export function createMap() {
    map = L.map("map").setView(center, zoom);
    let osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" >OpenStreetMap</a>',
            zIndex: 1,
            className: "map-tiles"
        },
    ).addTo(map);

    return map;
}

export {map};



