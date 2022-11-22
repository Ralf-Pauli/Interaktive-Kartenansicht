<script setup>
import {nextTick, onBeforeMount, onMounted, ref, watch} from 'vue';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

import "@/assets/leaflet-sidepanel.css";
import "@/assets/leaflet-sidepanel.min";
import SidePanel from "@/components/SidePanel.vue"

import {useDark, useToggle} from '@vueuse/core';

import "leaflet-search";
import "leaflet-search/dist/leaflet-search.min.css"

const proxyURL = "https://corsproxy.io/?";
const baseURL = "https://nina.api.proxy.bund.dev/api31";
const mapDataURL = "https://raw.githubusercontent.com/Ralf-Pauli/Geojson_Files/main/landkreise.geojson";

let mapData,
    countiesMap,
    coronaMap,
    empty,
    warningGeo = ref(),
    allWarnings = ref();

let map,
    osm;

let colors = [],
    conditions = [];

let layerControl,
    baseMaps = {},
    overlayMaps = {},
    currentLayer;

let info = L.control({position: "bottomright"}),
    legend = L.control({position: "bottomleft"}),
    sidePanel,
    focusButton,
    themeButton,
    searchControl;

let titles = ["Allgemeine Warnmeldungen", "Coronawarnungen", "Unwetterwarnungen"],
    warningColors = ["#FB8C00", "#ff5900", "darkblue"],
    previousWarning,
    styles = ["text-ninaOrange"];

let center = [51.1642292, 10.4541194],
    zoom = 6;

const isDark = useDark();
const toggleDark = useToggle(isDark);
let icon = ref("light_mode");

let searchData = [];

onMounted(async () => {
  map = L.map("map").setView(center, zoom);
  osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" >OpenStreetMap</a>',
        zIndex: 1,
        className: "map-tiles"
      },
  ).addTo(map);

  layerControl = L.control.layers(baseMaps, overlayMaps);

  addInfo();
  addSidePanel();
  addLegend();

  addFocusButton();
  addThemeButton()

  map.doubleClickZoom.disable();
  map.on('baselayerchange', function (e) {
    currentLayer = e.layer;
    currentLayer.bringToBack();
  });

  watch(warningGeo, async () => {
    addWarningGeoToMap()
    // previousWarning = document.getElementsByClassName("warning")[0];
  })

  await addCounties(mapDataURL);
});


function addInfo() {
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = '<h4>Deutschland Landkreise</h4>' + (props ? '<b>' + props.GEN + '</b><br />' + '7 Tage Inzidenz: ' + new Intl.NumberFormat('de-DE', {maximumFractionDigits: 2}).format(props.cases7Per100k) : 'Hover over a Landkreis');
  };

  info.addTo(map);
}

function addLegend() {
  legend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'infoLegend'),
        labels = [],
        stringConditions = [];

    fetch(proxyURL + encodeURIComponent(baseURL + '/appdata/covid/covidmap/DE/covidmap.json')).then(value => value.json()).then(value => {
      value.mapLegend.forEach(legendData => {
        labels.push(div.innerHTML += '<i style="background:' + legendData.properties.fillColor + '"></i> ' + legendData.label + ' <br>');
        colors.push(legendData.properties.fillColor);
        stringConditions.push(legendData.label);
      });
      stringConditions.forEach(value => {
        conditions.push(value.match(/\d+/));
      });
      conditions.reverse();
      colors.reverse();
    });
    return div;
  };

  legend.addTo(map);
}

function addFocusButton() {
  L.Control.FocusButton = L.Control.extend({
    onAdd: function (map) {
      this._div = document.getElementById("focus")
      return this._div;
    }
  })

  focusButton = new L.Control.FocusButton({position: "topleft"}).addTo(map);
}

function addThemeButton() {
  L.Control.ThemeButton = L.Control.extend({
    onAdd: function (map) {
      this._div = document.getElementById("themeSwitch")
      return this._div;
    }
  })

  themeButton = new L.Control.ThemeButton({position: "topleft"}).addTo(map);
}

function addSidePanel() {
  sidePanel = L.control.sidepanel('sidePanel', {
    panelPosition: 'right',
    hasTabs: true,
    tabsPosition: 'right',
    pushControls: true,
    darkMode: true,
    startTab: 'tab-2'
  }).addTo(map);
}

function addSearch() {
  searchControl = new L.Control.Search({
    layer: countiesMap,
    moveToLocation: function (latlng, title, map) {
      //map.fitBounds( latlng.layer.getBounds() );
      let zoom = map.getBoundsZoom(latlng.layer.getBounds());
      map.setView(latlng, zoom); // access the zoom
    }
  });

  searchControl.on('search:locationfound', function (e) {

    //console.log('search:locationfound', );

    //map.removeLayer(this._markerSearch)

    // e.layer.setStyle({fillColor: '#3f0', color: '#0f0'});
    // if (e.layer._popup)
    //   e.layer.openPopup();

  }).on('search:collapsed', function (e) {

    // countiesMap.eachLayer(function (layer) {	//restore feature color
    //   countiesMap.resetStyle(layer);
    // });
  });

  map.addControl(searchControl);
}

function switchTheme() {
  icon.value = (icon.value === "light_mode" ? "dark_mode" : "light_mode")
  toggleDark();
  if (isDark._value) {
    document.getElementById("sidePanel").classList.add("sidepanel-dark")
  } else {
    document.getElementById("sidePanel").classList.remove("sidepanel-dark")
  }
}

function resetFocus() {
  map.flyTo(center, zoom, {duration: 1.5})
}

function toggleSidebar(e) {
  let sButton = document.getElementsByClassName("sidepanel-toggle-button")[0];
  sButton.click();
  // previousWarning.classList.remove(styles)
}


async function addCounties(mapDataURL) {
  mapData = await fetch(proxyURL + mapDataURL).then(value => value.json());
  mapData.features.forEach(feature => {
    searchData.push({
      geometry: feature.geometry,
      properties: {
        AGS: feature.properties.AGS,
        Name: feature.properties.GEN,
      }
    })
  })
  await addCovidData(mapData);

  countiesMap = L.geoJSON(mapData, {
    onEachFeature: onEachFeature,
    style: style,
    zIndex: 2,
  }).addTo(map);
  coronaMap = L.geoJSON(mapData, {
    onEachFeature: onEachFeature,
    style: coronaStyle,
    zIndex: 2,
  });
  empty = L.geoJSON(null, {style: style});

  addSearch();

  layerControl.addBaseLayer(empty, "Empty");
  layerControl.addBaseLayer(countiesMap, "Landkreise");
  layerControl.addBaseLayer(coronaMap, "Corona");

  layerControl.addTo(map)

  baseMaps = [empty, countiesMap, coronaMap]
  baseMaps[Object.keys(baseMaps)[0]].bringToFront()
  currentLayer = baseMaps[0];
}

async function addCovidData(mapData) {
  let covidData = await fetch(proxyURL + encodeURIComponent(baseURL + '/appdata/covid/covidmap/DE/covidmap.json')).then(value => value.json());
  mapData.features.forEach(feature => {
    let covid = covidData.mapData.find(value => value.rs === feature.properties.RS) || 0;
    feature.properties.cases = covid.cases;
    feature.properties.cases7Per100k = covid.cases7Per100k;
    feature.properties.cases_per_100k = covid.cases_per_100k;
    feature.properties.deaths = covid.deaths;
  });
}

function addWarningGeoToMap() {
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
              mouseover: function () {
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
              }, mouseout: function (feature, layer) {
                warn.resetStyle(layer)
              }, click: function (feature, layer) {
                if (!document.getElementById("sidePanel").classList.contains("opened")) {
                  toggleSidebar()
                }
                let currentWarning;
                allWarnings.value.forEach(warnType => {
                  if (warnType.has(feature.target.feature.properties.warnId)) {
                    currentWarning = warnType.get(feature.target.feature.properties.warnId)
                    findWarning(currentWarning);
                  }
                })
              }
            })
          }
        },
      })
      warningLayer.addLayer(warn).addTo(map);
    }

    layerControl.addOverlay(warningLayer, titles[index])
  }
}

function highlightFeature(e) {
  let layer = e.target;
  layer.setStyle({
    weight: 3,
    color: 'black',
    dashArray: '',
    fillOpacity: 0.7
  });
  if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
    // layer.bringToFront();
  }
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  currentLayer.resetStyle(e.target);
  info.update();
}

function onEachFeature(feature, layer) {
  if (layer.feature.geometry.type === "MultiPolygon" || layer.feature.geometry.type === "Polygon") {
    layer.on({
      mouseover: highlightFeature, mouseout: resetHighlight, click: toggleSidebar
    });
  }
}

function getColor(d) {
  return d > conditions[0] ? colors[0] :
      d > conditions[1] ? colors[1] :
          d > conditions[2] ? colors[2] :
              d > conditions[3] ? colors[3] :
                  d > conditions[4] ? colors[4] :
                      d > conditions[5] ? colors[5] :
                          d > conditions[6] ? colors[6] :
                              colors[7];

}


function style(feature) {
  return {
    fillColor: "rgba(255, 0, 0, 0)",
    weight: 2,
    opacity: 1,
    color: 'black',
    dashArray: '3',
    fillOpacity: 0.7
  };
}

function coronaStyle(feature) {
  return {
    fillColor: getColor(feature.properties.cases7Per100k),
    weight: 2,
    opacity: 1,
    color: 'black',
    dashArray: '3',
    fillOpacity: 0.7
  };
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
    element.classList.remove("order-first")
    element.children.item(0).children.item(0).children.item(0).classList.remove(styles)
    // if (previousWarning !== undefined) {
    //   previousWarning.children.item(0).children.item(1).click();
    // }

    if (element.id === warning.identifier) {
      element.children.item(0).children.item(0).children.item(0).classList.add(styles);
      element.classList.add("order-first");
      if (element.children.item(1).style.display === "none") {
        element.children.item(0).children.item(1).click();
        console.log(true)
      }
      previousWarning = element;
    }
  }
}

onBeforeMount(() => {
  if (map) {
    map.value.remove();
  }
});

</script>

<template>
  <div id="map" class=" z-10 h-full">
    <SidePanel @update:allWarnings="allWarnings = $event" @update:warningGeo="warningGeo = $event"/>

    <button id="focus" class=" customControl leaflet-bar"
            @click="resetFocus">
      <span class="material-symbols-sharp">
        crop_free
      </span>
    </button>

    <button id="themeSwitch" class=" customControl leaflet-bar"
            @click="switchTheme">
      <span class="material-symbols-sharp">
        {{ icon }}
      </span>
    </button>

  </div>
</template>

<style>


</style>
