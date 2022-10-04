<script setup>
import {onBeforeMount, onMounted} from 'vue';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
// import "leaflet-sidebar"
import "@/assets/leaflet-sidepanel.css"
import "@/assets/leaflet-sidepanel.min"
// import {toggleSidebar} from "@/components/state";

const proxyURL = "https://corsproxy.io/?";
const baseURL = "https://nina.api.proxy.bund.dev/api31";
const mapDataURL = "https://raw.githubusercontent.com/Ralf-Pauli/Geojson_Files/main/landkreise.geojson"

let mapData,
    countiesMap;

let map,
    osm;

let colors = [],
    conditions = [];

let layerControl,
    baseMaps = {},
    overlayMaps = {};

let info = L.control({position: "bottomright"}),
    legend = L.control({position: "bottomleft"}),
    sidePanel;

onMounted(() => {
  map = L.map("map").setView([51.1642292, 10.4541194], 6);

  osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" >OpenStreetMap</a>'
  }).addTo(map);

  addInfo();
  addSidePanel()
  addLegend();
  addCounties(mapDataURL);
  baseMaps.OpenStreetMap = osm;
  map.doubleClickZoom.disable();
});


function addInfo() {
  info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
  };

  info.update = function (props) {
    this._div.innerHTML = '<h4>Deutschland Landkreise</h4>' + (props ? '<b>' + props.GEN + '</b><br />' + '7 Tage Inzidenz: ' + new Intl.NumberFormat('de-DE', {maximumFractionDigits: 2}).format(props.cases7Per100k) : 'Hover over a Bundesland');
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


async function addCounties(mapDataURL) {
  mapData = await fetch(proxyURL + encodeURIComponent(mapDataURL)).then(value => value.json());
  await addCovidData(mapData)
  countiesMap = L.geoJSON(mapData,
      {
        onEachFeature: onEachFeature,
        style: style
      }
  ).addTo(map);
  overlayMaps.Landkreise = countiesMap;
  addLayerControl()
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

function highlightFeature(e) {
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
  info.update(layer.feature.properties);
}

function resetHighlight(e) {
  countiesMap.resetStyle(e.target);
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
    fillColor: getColor(feature.properties.cases7Per100k),
    weight: 2,
    opacity: 1,
    color: 'black',
    dashArray: '3',
    fillOpacity: 0.7

  };
}

function addLayerControl() {
  layerControl = L.control.layers(baseMaps, overlayMaps).addTo(map);
}

function addSidePanel() {
  sidePanel = L.control.sidepanel('sidePanel', {
    panelPosition: 'right',
    hasTabs: true,
    tabsPosition: 'right',
    pushControls: true,
    darkMode: true,
    startTab: 'tab-5'
  }).addTo(map);
}

function toggleSidebar(e) {
  let sButton = document.getElementsByClassName("sidepanel-toggle-button")[0];
  sButton.click();
}

onBeforeMount(() => {
  if (map) {
    map.remove();
  }
})
</script>

<template>
  <div id="map" class=" z-10 h-full">

    <!--  <Sidebar :map="map"/>-->
    <div id="sidePanel" aria-hidden="false" aria-label="side panel" class="sidepanel">
      <div class="sidepanel-inner-wrapper">

        <nav aria-label="sidepanel tab navigation" class="sidepanel-tabs-wrapper">
          <ul class="sidepanel-tabs">


            <li class="sidepanel-tab">
              <a class="sidebar-tab-link" data-tab-link="tab-1" href="#" role="tab">
                <span class="material-symbols-sharp">info</span>
              </a>
            </li>

            <li class="sidepanel-tab">
              <a class="sidebar-tab-link" data-tab-link="tab-2" href="#" role="tab">
                <span class="material-symbols-sharp">warning</span>
              </a>
            </li>

            <li class="sidepanel-tab">
              <a class="sidebar-tab-link" data-tab-link="tab-3" href="#" role="tab">
                <span class="material-symbols-sharp">coronavirus</span>
              </a>
            </li>

            <li class="sidepanel-tab">
              <a class="sidebar-tab-link" data-tab-link="tab-4" href="#" role="tab">
                <span class="material-symbols-sharp">thunderstorm</span>
              </a>
            </li>

            <!-- [...] -->
          </ul>
        </nav>
        <div class="sidepanel-content-wrapper">

          <div class="sidepanel-content w-full h-full">
            <div class="sidepanel-tab-content" data-tab-content="tab-1">
              <h2 class="text-2xl text-center mb-6">Allgemeine Informationen</h2>

              <div class="grid grid-rows-1 grid-cols-1 grid-flow-row gap-5 text-base">
                <dl>
                  <div class="px-4 py-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6">
                    <dt class="text-lg text-gray-300">Name</dt>
                    <dd class="mt-1 text-lg text-gray-50 sm:mt-0 ">Deggendorf</dd>
                  </div>

                  <div class="px-4 py-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6 sm:auto-rows-max ">
                    <dt class="text-lg text-gray-300">Bezeichnung</dt>
                    <dd class="mt-1 text-lg text-gray-50  sm:mt-0 ">Kreisfreie Stadt</dd>
                  </div>

                  <div class="px-4 py-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6 sm:auto-rows-max ">
                    <dt class="text-lg text-gray-300">Einwohner</dt>
                    <dd class="mt-1 text-lg text-gray-50  sm:mt-0 ">42069</dd>
                  </div>

                  <div class="px-4 py-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6 sm:auto-rows-max ">
                    <dt class="text-lg text-gray-300">Einwohner Männlich</dt>
                    <dd class="mt-1 text-lg text-gray-50  sm:mt-0 ">69</dd>
                  </div>

                  <div class="px-4 py-1 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-6 sm:auto-rows-max ">
                    <dt class="text-lg text-gray-300">Einwohner Weiblich</dt>
                    <dd class="mt-1 text-lg text-gray-50  sm:mt-0 ">420</dd>
                  </div>
                </dl>


              </div>
            </div>
          </div>
          <div class="sidepanel-content w-full h-full">
            <div class="sidepanel-tab-content" data-tab-content="tab-2">
              <h2 class="text-2xl text-center mb-3">Warnmeldungen</h2>

              <div class="grid grid-rows-1 grid-cols-2 grid-flow-row gap-3">
                <div>Event</div>
                <div></div>
                <div>Dringlichkeit</div>
                <div></div>
                <div>Überschrift</div>
                <div></div>
                <div>Beschreibung</div>
                <div></div>
                <div>Weitere Informationen</div>
                <div></div>

              </div>
            </div>

            <div class="sidepanel-tab-content w-full h-full" data-tab-content="tab-3">
              <h2 class="text-2xl text-center mb-3">Covid-19</h2>

              <div class="grid grid-rows-1 grid-cols-2 grid-flow-row gap-3">
                <div>Gesamt</div>
                <div></div>
                <div>Fälle / 100.000 EW</div>
                <div></div>
                <div>Fälle der letzten 7 Tage / 100.000 EW</div>
                <div></div>
                <div>Todesfälle</div>
                <div></div>
              </div>

            </div>

            <div class="sidepanel-tab-content w-full h-full" data-tab-content="tab-4">
              <h2 class="text-2xl text-center">Unwetterwarnungen</h2>

              <div class="grid grid-rows-1 grid-cols-2 grid-flow-row gap-3">

              </div>

            </div>
            <!-- [...] -->
          </div>
        </div>
      </div>
      <div class="sidepanel-toggle-container">
        <button ref="sidebarBtn" aria-label="toggle side panel" class="sidepanel-toggle-button" type="button"
        ></button>
      </div>
    </div>
  </div>
</template>
<style>
.info {
  padding: 6px 8px;
  font: 14px/16px Arial, Helvetica, sans-serif;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px;
}

.info h4 {
  margin: 0 0 5px;
  color: #777;
}

.infoLegend {
  padding: 6px 8px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  border-radius: 5px
}

.infoLegend i {
  width: 30px;
  height: 18px;
  float: left;
  margin-right: 8px;
}

</style>
