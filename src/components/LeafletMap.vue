<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import path from "path";

export default {
  name: "LeafletMap",
  data() {
    return {
      map: null,
    };
  },
  mounted: async function () {
    const proxy = "https://corsproxy.io/?";
    const baseURL = "https://nina.api.proxy.bund.dev/api31"

    this.map = L.map("map").setView([51.1642292, 10.4541194], 6);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(this.map);

    let info = L.control();
    let legend = L.control({position: "bottomleft"});
    let colors = [],
        conditions = [];

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    info.update = function (props) {
      this._div.innerHTML = '<h4>Deutschland Landkreise</h4>' + (props ? '<b>' + props.NAME_3 + '</b><br />' + 'Bundesland: ' + props.NAME_1 : 'Hover over a Bundesland');
    };
    info.addTo(this.map);

    legend.onAdd = function (map) {

      let div = L.DomUtil.create('div', 'infoLegend'),
          labels = [],
          stringConditions = [];

      fetch(proxy + encodeURIComponent(baseURL + '/appdata/covid/covidmap/DE/covidmap.json')).then(value => value.json()).then(value => {
        value.mapLegend.forEach(legendData => {
          labels.push(div.innerHTML += '<i style="background:' + legendData.properties.fillColor + '"></i> ' + legendData.label + ' <br>');
          colors.push(legendData.properties.fillColor);
          stringConditions.push(legendData.label)
        });
        stringConditions.forEach(value => {
          conditions.push(value.match(/\d+/));
        });
        conditions.reverse();
        colors.reverse();
      });
      return div;
    };
    legend.addTo(this.map);

    // let data = await fetch("src/assets/landkreise.geojson").then(value => value.json());
    let data = await fetch(proxy + encodeURIComponent("https://raw.githubusercontent.com/isellsoap/deutschlandGeoJSON/main/4_kreise/1_sehr_hoch.geo.json")).then(value => value.json());

    let geojson = L.geoJSON(data, {style: style, onEachFeature: onEachFeature}).addTo(this.map);


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

    const url = proxy + encodeURIComponent('https://warnung.bund.de/assets/json/converted_corona_kreise.json');

    (await fetch(url)).json().then(obj => {
      Object.entries(obj).forEach(([key, value]) => {
        console.log(`${key} ${value.n}`);

      });
    });

    function style(feature) {
      // mit hilfe des namens den index finden und casesPer7 als fillcolor
      return {
        fillColor: getColor(feature.properties.ID_3),
        weight: 2,
        opacity: 1,
        color: 'black',
        dashArray: '3',
        fillOpacity: 0.7
      };
    }

    function highlightFeature(e) {
      let layer = e.target;

      layer.setStyle({
        weight: 5, color: '#666', dashArray: '', fillOpacity: 0.7
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
      }
      info.update(layer.feature.properties);
    }

    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      info.update();
    }

    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature, mouseout: resetHighlight
      });
    }


  },
  onBeforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
};


</script>

<template>
  <div id="map"/>
</template>

<style scoped>

</style>
