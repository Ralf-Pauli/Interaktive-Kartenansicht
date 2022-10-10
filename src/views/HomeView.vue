<script setup>
import {onBeforeMount, onMounted, reactive, ref} from 'vue';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import "@/assets/leaflet-sidepanel.css"
import "@/assets/leaflet-sidepanel.min"
import Warning from "../components/Warning.vue";

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

let warnings = [
      {
        "id": "biw.BIWAPP-71189",
        "version": 3,
        "startDate": "2022-09-28T12:35:05+02:00",
        "severity": "Minor",
        "type": "Alert",
        "i18nTitle": {
          "de": "Geflügelpest-Ausbruch in einem Putenbetrieb im Landkreis Cloppenburg"
        }
      }
    ],
    warningDetails = [{
      "identifier": "biw.BIWAPP-71189",
      "sender": "CAP@biwapp.de",
      "sent": "2022-09-28T12:35:05+02:00",
      "status": "Actual",
      "msgType": "Alert",
      "scope": "Public",
      "code": [
        "DVN:3",
        "BIWAPP"
      ],
      "info": [
        {
          "language": "DE",
          "category": [
            "Other"
          ],
          "event": "4",
          "urgency": "Unknown",
          "severity": "Minor",
          "certainty": "Unknown",
          "expires": "2022-10-07T12:32:00+02:00",
          "headline": "Geflügelpest-Ausbruch in einem Putenbetrieb im Landkreis Cloppenburg",
          "description": "Landkreis Cloppenburg. In der Gemeinde Lastrup wurde ein Ausbruch der hochpathogenen Aviären Influenza mit dem Erreger H5N1 in einem Putenbetrieb nachgewiesen. Den Ausbruch hat das Friedrich-Loeffler-Institut (FLI) amtlich bestätigt. Der Bestand mit 8.700 Puten wurde heute tierschutzgerecht getötet und wird nun geräumt.<br>&nbsp;<br>Somit sind im Landkreis Cloppenburg seit September zwei Ausbruchsbetriebe mit insgesamt 39.700 Puten betroffen.<br>&nbsp;<br>Um den Nutzgeflügelbestand mit dem positiven Virusnachweis werden ab Donnerstag (29. September 2022, 0.00 Uhr) &nbsp;als Sperrzone eine Schutzzone (ehemals Sperrbezirk) und eine Überwachungszone (ehemals Beobachtungsgebiet) festgelegt. Als Schutzzone (ehemals Sperrbezirk) wird das Gebiet um den Seuchenbestand in der Gemeinde Lastrup mit einem Radius von mindestens drei Kilometern festgelegt. Um die Schutzzone wird mit einem Radius von mindestens zehn Kilometern um den Seuchenbestand eine Überwachungszone (ehemals Beobachtungsgebiet) festgelegt.<br>&nbsp;<br>Parallel ordnet der Landkreis Cloppenburg ab Donnerstag (29. September 2022, 0.00 Uhr) eine Aufstallungspflicht in der Schutz- und Überwachungszone an. Tierhaltende Betriebe haben alle gehaltenen Vögel (Aves) von freilebenden Vögeln abzusondern. Gehaltene Vögel sind mit Ausnahme von Tauben in geschlossenen Ställen oder unter einer Schutzvorrichtung zu halten, die aus einer überstehenden, nach oben gegen Einträge gesicherten dichten Abdeckung und mit einer gegen das Eindringen von Wildvögeln gesicherten Seitenbegrenzung bestehen muss.<br>&nbsp;<br>Der Landkreis Cloppenburg wird ferner eine tierseuchenrechtliche Allgemeinverfügung zur Anordnung eines Verbots der Wiedereinstallung zum Schutz gegen die Aviäre Influenza erlassen. Geflügelbestände (Truthühner) in einem Radius von 25 Kilometern um den Seuchenbestand in der Gemeinde Lastrup dürfen ab Donnerstag (29. September 2022, 0.00 Uhr) frühestens 30 Tage nach einer Entfernung des Geflügels aus dem jeweiligen Bestand oder der jeweiligen Vogelhaltung oder im Falle leerstehender Gebäude oder Einrichtungen zur Haltung von Vögeln frühestens 30 Tage nach Inkrafttreten dieser Allgemeinverfügung wiederbelegt werden.",
          "parameter": [
            {
              "valueName": "sender_langname",
              "value": "Landkreis Cloppenburg"
            },
            {
              "valueName": "PHGEM",
              "value": "35,37,267,270+13,291,294,681,100001"
            },
            {
              "valueName": "GRID",
              "value": "115366+1,115979+12,116592+13,117205+13,117818+13,118431+13,119043+15,119060,119656+18,120269+20,120881+21,121494+22,122107+27,122720+28,123333+29,123947+28,124562+27,125176+27,125791+26,126404+26,127017+26,127630+26,128243+26,128856+26,129470+25,130084+24,130700+23,131315+21,131928+22,132540+24,133152+26,133765+27,133794+1,134376+31,134987+33,135598+35,136211+34,136824+35,137436+36,138049+36,138661+36,139274+34,139888+33,140502+26,140530+4,141114+26,141726+25,142337+26,142949+27,143562+28,144176+27,144790+9,144804+9,145404+7,145419+2,145425+1,146017+6,500001"
            }
          ],
          "area": [
            {
              "areaDesc": "Bakum, Barßel, Bösel, Cappeln (Oldenburg), Cloppenburg, Edewecht, Emstek, Essen (Oldenburg), Friesoythe, Garrel, Großenkneten, Lastrup, Lindern (Oldenburg), Löningen, Menslage, Molbergen, Quakenbrück, Saterland, Visbek, Wardenburg",
              "geocode": [
                {
                  "valueName": "AreaId",
                  "value": "0"
                }
              ]
            }
          ]
        }
      ]
    }],
    currentMunicipality = reactive({name: "", bez: "", population: 0, allgNotfall: ""});


warningDetails.forEach((e) => {
  e.visible = false;
  e.severity = warnings.find((w) => w.id === e.identifier).severity;
})

warnings = ref(warningDetails);


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

  updateCurrentMunicipality(layer.feature.properties);
}

function resetHighlight(e) {
  countiesMap.resetStyle(e.target);
  info.update();
  updateCurrentMunicipality()
}

function updateCurrentMunicipality(props) {
  currentMunicipality.name = (props ? props.GEN : "");
  currentMunicipality.bez = (props ? props.BEZ : "");
  currentMunicipality.population = (props ? props.destatis.population : 0);
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
  layerControl = L.control.Layers(baseMaps, overlayMaps).addTo(map);
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

              <h3 class="text-base font-bold mb-2 border-collapse">{{ currentMunicipality.name }}</h3>
              <table class="w-full table-fixed text-left  border-y-gray-600">
                <tr class="border-y border-y-gray-600">
                  <th>Bezeichnung</th>
                  <td>{{ currentMunicipality.bez }}</td>
                </tr>
                <tr class="border-y border-y-gray-600">
                  <th>Einwohner</th>
                  <td>{{ currentMunicipality.population }}</td>
                </tr>
                <tr class="border-y border-y-gray-600">
                  <th>Allgemeine Notfalltips</th>
                  <td>name</td>
                </tr>
              </table>
            </div>
          </div>
          <div class="sidepanel-content w-full h-full ">
            <div class="sidepanel-tab-content" data-tab-content="tab-2">
              <h2 class="text-2xl text-center mb-3">Warnmeldungen</h2>
              <div class="mt-5">
                <Warning v-for="warn in warnings" :warning="warn" class="flex flex-col mb-2 pb-2 gap-2 border-b"/>
              </div>
            </div>

            <div class="sidepanel-tab-content w-full h-full" data-tab-content="tab-3">
              <h2 class="text-2xl text-center mb-3">Covid-19</h2>

              <div class="mt-5">
                <Warning v-for="warn in warnings" :warning="warn" class="flex flex-col mb-2 pb-2 gap-2 border-b"/>
              </div>
            </div>

            <div class="sidepanel-tab-content w-full h-full" data-tab-content="tab-4">
              <h2 class="text-2xl text-center">Unwetterwarnungen</h2>

              <div class="mt-5">
                <Warning v-for="warn in warnings" :warning="warn" class="flex flex-col mb-2 pb-2 gap-2 border-b"/>
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
