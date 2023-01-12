import L from "leaflet";
import {getLayerControl, toggleSidebar} from "@/utils/mapControls";
import {coronaStyle, onEachFeature, setCurrentLayer, style} from "@/utils/styling";
import {addError} from "@/utils/ErrorHandler";

export const proxyURL = "https://corsproxy.io/?",
    baseURL = "https://nina.api.proxy.bund.dev/api31",
    germanMapDataURL = "https://raw.githubusercontent.com/Ralf-Pauli/Geojson_Files/main/landkreise.geojson",
    swissMapDataURL = "https://raw.githubusercontent.com/cividi/ch-municipalities/main/data/gemeinden.geojson";

let baseMaps = Array();
export let countiesMap,
    swissCountiesMap;

let titles = ["Allgemeine Warnmeldungen", "Coronawarnungen", "Unwetterwarnungen", "Flutwarnungen"],
    warningColors = ["#FB8C00", "#ff5900", "darkblue", "#0ea5e9"];
let styles = ["text-ninaOrange"];

let searchData = [];
let allWarnings;

export async function addCounties(map) {
    let mapData
    let layerControl = getLayerControl();
    let coronaMap;
    try {
        // hole deutsche landkreis Daten aus dem privaten GitHub Repository
        mapData = await fetch(proxyURL + germanMapDataURL).then(value => value.json());
        // Füge die Landkreise in das SuchArray hinein
        mapData.features.forEach(feature => {
            searchData.push({
                geometry: feature.geometry,
                properties: {
                    name: feature.properties.GEN,
                    id: feature.properties.AGS,
                }
            })
        })
    } catch (e) {
        addError(new Error("Deutsche Landkreise konnten nicht abgerufen", {cause: e}));
    }

    try {
        await addCovidData(mapData);
    } catch (e) {
        addError(Error("Corona Daten konnten nicht abgerufen werden", {cause: e}))
    }
    // Wenn die Kartendaten vorhanden sind
    if (mapData) {
        // Setze Events (onEachFeature), style und zIndex (höhe) auf jeden Landkreis
        countiesMap = L.geoJSON(mapData, {
            onEachFeature: onEachFeature,
            style: style,
            zIndex: 2,
        }).addTo(map);
        layerControl.addBaseLayer(countiesMap, "Deutschland Landkreise");

        if (mapData.features[0].properties.cases) {
            coronaMap = L.geoJSON(mapData, {
                onEachFeature: onEachFeature,
                style: coronaStyle,
                zIndex: 2,
            });
            layerControl.addBaseLayer(coronaMap, "Corona");
        }
    }

    let empty = L.geoJSON(null, {style: style});
    layerControl.addBaseLayer(empty, "Empty");

    baseMaps.push(empty, countiesMap, coronaMap);

    setCurrentLayer(baseMaps[0]);
}

export async function addSwissCounties() {
    try {
        let swissMapData = await fetch(proxyURL + swissMapDataURL).then(value => value.json());
        swissCountiesMap = L.geoJSON(swissMapData, {
            onEachFeature: onEachFeature,
            style: style,
            zIndex: 2,
        });
        getLayerControl().addBaseLayer(swissCountiesMap, "Schweiz Landkreise")
        baseMaps.push(swissCountiesMap)
    } catch (e) {

        addError(new Error("Schweizer Landkreise konnten nicht geladen werden", {cause: e}))
    }
}

export async function addCovidData(mapData) {
    // hole Corona Daten aus der NINA API
    let covidData = await fetch(proxyURL + baseURL + '/appdata/covid/covidmap/DE/covidmap.json')
        .then(value => value.json());
    // Loope durch jeden Landkreis
    mapData.features.forEach(feature => {
        // Finde die Corona-Daten zum jeweiligen Landkreis
        let covid = covidData.mapData.find(value => value.rs === feature.properties.RS);

        // Wenn nicht Berlin
        // Füge die Coronazahlen als Attribute hinzu
        if (feature.properties.RS === "11000") {
            feature.properties = JSON.parse(JSON.stringify(feature.properties))
        } else {
            feature.properties.cases = covid.cases;
            feature.properties.cases7Per100k = covid.cases7Per100k;
            feature.properties.cases_per_100k = covid.cases_per_100k;
            feature.properties.deaths = covid.deaths;
        }
        // Kombiniere Corona Daten von Berlin
        combineBerlin(covidData, mapData);
    });
}

function combineBerlin(covidData, mapData) {
    try {
        let berlinParts = covidData.mapData.filter(value => Number(value.rs) > 11000 && Number(value.rs) < 12000);
        let berlin = mapData.features.find(value => value.properties.RS === "11000")
        berlinParts.forEach(value => {
            berlin.properties.cases += value.cases
            berlin.properties.cases7Per100k = value.cases7Per100k;
            berlin.properties.cases_per_100k += value.cases_per_100k;
            berlin.properties.deaths += value.deaths;
        })
    } catch (e) {
        addError(new Error("Berlin could not be combined", {cause: e}))
    }
}

export function addWarningGeoToMap(map, warningGeo) {
    try {
        for (let index in warningGeo.value) {
            let warningLayer = L.layerGroup();
            for (let warning of warningGeo.value[index]) {
                let warn = L.geoJSON(warning, {
                    style: {
                        fillColor: warningColors[index],
                        weight: 2,
                        opacity: 1,
                        color: 'black',
                        dashArray: '3',
                        fillOpacity: 0.7
                    },
                    onEachFeature: function (feature, layer) {
                        if (layer.feature.geometry.type === "MultiPolygon" || layer.feature.geometry.type === "Polygon") {
                            layer.on({
                                mouseover: mouseover,
                                mouseout: function (feature, layer) {
                                    warn.resetStyle(layer)
                                }, click: click
                            })
                        }
                    },
                })
                warn.bringToFront()
                warningLayer.addLayer(warn).addTo(map);
            }
            // warningLayer.bringToFront();
            getLayerControl().addOverlay(warningLayer, titles[index])
        }
    } catch (e) {
        addError(new Error("GeoJsons für Warnungen konnten nicht geladen werden", {cause: e}));
    }
}

function mouseover(e) {
    let layer = e.target;
    layer.setStyle({
        weight: 3,
        opacity: 1,
        color: 'black',
        dashArray: '',
        fillOpacity: 0.7,
    });
    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function click(feature) {
    if (!document.getElementById("sidePanel").classList.contains("opened")) {
        toggleSidebar()
    }
    let currentWarning;
    allWarnings.forEach(warnType => {
        if (warnType.has(feature.target.feature.properties.warnId)) {
            currentWarning = warnType.get(feature.target.feature.properties.warnId)
            findWarning(currentWarning);
        }
    })
}

function findWarning(warning) {
    for (let element of document.getElementsByClassName("headline")) {
        if (element.innerHTML.includes(warning.info[0].headline)) {
            for (let tab of document.getElementsByClassName("sidepanel-tab-content")) {
                for (let child of tab.children) {
                    if (child.innerHTML.includes(element.innerHTML)) {
                        let hTab = tab.attributes.getNamedItem("data-tab-content").value;
                        for (let tabLink of document.getElementsByClassName("sidebar-tab-link")) {
                            if (tabLink.attributes.getNamedItem("data-tab-link").value === hTab) {
                                tabLink.click()
                            }
                        }
                    }
                }
            }
        }
    }
    for (let element of document.getElementsByClassName("warning")) {
        element.classList.remove("order-first");
        element.children.item(0).children.item(0).children.item(0).classList.remove(styles);

        if (element.id === warning.identifier) {
            element.children.item(0).children.item(0).children.item(0).classList.add(styles);
            element.classList.add("order-first");
            if (element.children.item(1).style.display === "none") {
                element.children.item(0).children.item(1).click();
            }
        }
    }
}

export function getSearchData() {
    return searchData;
}

export function getCountiesMap() {
    return countiesMap;
}

export function setAllWarnings(warnings) {
    allWarnings = warnings;
}