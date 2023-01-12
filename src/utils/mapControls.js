import L from "leaflet";
import {useDark, useToggle} from "@vueuse/core";
import {baseURL, proxyURL} from "@/utils/geoJsonHandler";
import {addError} from "@/utils/ErrorHandler";

export let colors = Array(),
    conditions = Array();

let info = L.control({position: "bottomright"}),
    layerControl;

let icon = "light_mode";

const isDark = useDark();
const toggleDark = useToggle(isDark);

export function toggleStartUpDarkMode(){
    if (isDark) {
        document.querySelector("#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tile-pane > div").classList.add("dark-map-tiles")
    }
}

export function createInfo(map) {
    try {
        info.onAdd = function (map) {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };

        info.update = function (props) {
            if (props) {
                if (props.GEN) {
                    this._div.innerHTML = '<h4>Landkreise</h4>' + '<b>' + props.GEN + '</b><br />' + '7 Tage Inzidenz: ' + new Intl.NumberFormat('de-DE', {maximumFractionDigits: 2}).format(props.cases7Per100k)
                } else {
                    this._div.innerHTML = '<h4>Landkreise</h4>' + '<b>' + props["gemeinde.NAME"] + '</b><br />' + 'Kanton: ' + props["kanton.NAME"];
                }
            } else {
                this._div.innerHTML = '<h4>Landkreise</h4>' + '<b>' + "Hover over a Landkreis" + '</b>';
            }
        };
        info.addTo(map);

        return info;
    } catch (e) {
        addError(new Error("Landkreis Info konnte nicht geladen werden", {cause: e}))
    }
}

export function createLegend(map) {
    let legend = L.control({position: "bottomleft"});
    legend.onAdd = function (map) {
        let div = L.DomUtil.create('div', 'infoLegend'),
            stringConditions = [];
        fetch(proxyURL + encodeURIComponent(baseURL + '/appdata/covid/covidmap/DE/covidmap.json'))
            .then(value => value.json())
            .then(value => {
                value.mapLegend.forEach(legendData => {
                    div.innerHTML += '<i style="background:' + legendData.properties.fillColor + '"></i> ' + legendData.label + ' <br>';
                    colors.push(legendData.properties.fillColor);
                    stringConditions.push(legendData.label);
                });
                stringConditions.forEach(value => {
                    conditions.push(value.match(/\d+/));
                });
            })
            .catch(err => {
                addError(err);
            });
        return div;
    };

    legend.addTo(map);
    return legend;
}

export function createFocusButton(map) {
    L.Control.FocusButton = L.Control.extend({
        onAdd: function (map) {
            this._div = document.getElementById("focus")
            return this._div;
        }
    })

    return new L.Control.FocusButton({position: "topleft"}).addTo(map);
}

export function createThemeButton(map) {
    L.Control.ThemeButton = L.Control.extend({
        onAdd: function (map) {
            this._div = document.getElementById("themeSwitch")
            return this._div;
        }
    })

    return new L.Control.ThemeButton({position: "topleft"}).addTo(map);
}

export function createSidePanel(map) {
    try {
        return L.control.sidepanel('sidePanel', {
            panelPosition: 'right',
            hasTabs: true,
            tabsPosition: 'right',
            pushControls: true,
            darkMode: isDark,
            startTab: 'tab-1'
        }).addTo(map);
    } catch (e) {
        addError(new Error("SidePanel konnte nicht geladen werden", {cause: e}))
        return null;
    }
}

export function createLayerControl() {
    layerControl = L.control.layers({}, {});
}

export function toggleSidebar(e) {
    let sButton = document.getElementsByClassName("sidepanel-toggle-button")[0];
    sButton.click();

    // previousWarning.classList.remove(styles)
}

export function switchTheme() {
    icon = (icon === "light_mode" ? "dark_mode" : "light_mode")
    toggleDark();
    if (isDark._value) {
        document.getElementById("sidePanel").classList.add("sidepanel-dark")
        document.querySelector("#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tile-pane > div").classList.add("dark-map-tiles")
        // for (let element of document.getElementsByClassName("leaflet-tile")) {
        //     element.classList.add("dark-tiles")
        // }
    } else {
        document.getElementById("sidePanel").classList.remove("sidepanel-dark")
        document.querySelector("#map > div.leaflet-pane.leaflet-map-pane > div.leaflet-pane.leaflet-tile-pane > div").classList.remove("dark-map-tiles")

        // for (let element of document.getElementsByClassName("leaflet-tile")) {
        //     element.classList.remove("dark-tiles")
        // }
    }
}

export function getIcon() {
    return icon;
}

export function createSearch(map) {
    L.Control.Search = L.Control.extend({
        onAdd: function (map) {
            this._div = document.getElementById("search")
            return this._div;
        }
    })

    new L.Control.Search({position: "topleft"}).addTo(map);
}

export function getInfo() {
    return info;
}

export function getLayerControl() {
    return layerControl;
}