<script setup>
import {onBeforeMount, onMounted, ref, watch} from 'vue';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';

import "@/assets/leaflet-sidepanel.css";
import "@/assets/leaflet-sidepanel.min";
import SidePanel from "@/components/SidePanel.vue"

import {useDark, useToggle} from '@vueuse/core';

import "leaflet-search";
import "leaflet-search/dist/leaflet-search.min.css"
import "@/utils/mapControls";
import {createMap} from "@/utils/mapManagement";
import * as mapControls from "@/utils/mapControls";
import {
  addCounties,
  addSwissCounties,
  addWarningGeoToMap,
  getCountiesMap,
  getSearchData,
  setAllWarnings
} from "@/utils/geoJsonHandler";
import {getCurrentLayer, setCurrentLayer} from "@/utils/styling";
import {getLayerControl, resetFocus, switchTheme} from "@/utils/mapControls";
import {createSearch} from "@/utils/searchUtil";
import {getIcon} from "@/utils/mapControls";


let map;

let info,
    legend,
    sidePanel,
    focusButton,
    themeButton;

let warningGeo = ref();

let searchTerm = ref("");

let filteredCounties = ref([]),
    selectedCountyIndex = ref("");

let loading = ref(true);

onMounted(async () => {
  map = createMap();

  mapControls.createLayerControl();
  info = mapControls.createInfo(map);
  sidePanel = mapControls.createSidePanel(map);
  legend = mapControls.createLegend(map);
  focusButton = mapControls.createFocusButton(map);
  themeButton = mapControls.createThemeButton(map)

  map.doubleClickZoom.disable();

  map.on('baselayerchange', function (e) {
    setCurrentLayer(e.layer)
    getCurrentLayer().bringToBack();
  });

  watch(warningGeo, async () => {
    addWarningGeoToMap(map, warningGeo)
  })

  await addCounties(map);
  await addSwissCounties()

  getLayerControl().addTo(map)
  createSearch(map);
  loading.value = false;
});


function searchCounties() {
  if (searchTerm.value.length === 0) {
    return filteredCounties.value = [];
  }
  console.log(searchTerm.value)
  let matches = 0;

  filteredCounties.value = getSearchData().filter(county => {
    if (county.properties.name.toLowerCase().startsWith(searchTerm.value.toLowerCase()) && matches < 10) {
      matches++;
      if (searchTerm.value.toLowerCase() === county.properties.name.toLowerCase()) {
        filteredCounties.value = []
        return filteredCounties.value = [];
      }
      selectedCountyIndex.value = "";
      return county;
    }
  })
  console.log(filteredCounties.value)
}

function selectNextCounty(ev) {
  if (selectedCountyIndex.value === "") {
    selectedCountyIndex.value = 0;
  } else {
    selectedCountyIndex.value++;
  }

  if (selectedCountyIndex === filteredCounties.value.length) {
    selectedCountyIndex = 0;
  }

  if (selectedCountyIndex.value > filteredCounties.value.length - 1) {
    selectedCountyIndex.value = filteredCounties.value.length - 1;
  }

  focusItem(ev);
}

function selectPreviousCounty(ev) {
  if (selectedCountyIndex.value === "") {
    selectedCountyIndex.value = filteredCounties.value.length - 1;
  } else {
    selectedCountyIndex.value--;
  }

  if (selectedCountyIndex.value < 0) {
    selectedCountyIndex.value = 0;
    let inputField = document.getElementById("searchInput");
    window.setTimeout(function () {
      inputField.setSelectionRange(0, inputField.value.length)
      inputField.focus()
    }, 0);
    return
  }
  focusItem(ev);
}

function focusItem(ev) {
  if (filteredCounties.value.length > 0) {
    let selectedCounty = document.getElementsByClassName("county").item(selectedCountyIndex.value);
    selectedCounty.focus();
  }
}

function selectCounty(ev) {
  // countiesMap.toGeoJSON().features.find(value => value.feature.properties.AGS === ev.target.id)
  let county = getCountiesMap().getLayers().find(value => value.feature.properties.AGS === ev.target.id);
  map.fitBounds(county.getBounds());
  county.setStyle({
    fillColor: "red",
    weight: 2,
    opacity: 1,
    color: 'black',
    dashArray: '3',
    fillOpacity: 0.7
  });
  searchTerm.value = ev.target.innerText;
  filteredCounties.value = [];
}


onBeforeMount(() => {
  if (map) {
    map.value.remove();
  }
});
</script>

<template>
  <div v-if="loading" class="absolute h-full w-full bg-white loadingScreen">
    <iframe
        class="w-full h-full"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-0.06591796875000001%2C44.762336674810996%2C15.490722656250002%2C56.78884524518923&amp;layer=mapnik"></iframe>
  </div>
  <div id="map" class=" z-10 h-full">
    <SidePanel @update:allWarnings="setAllWarnings($event)" @update:warningGeo="warningGeo = $event"/>

    <button id="focus" class=" customControl leaflet-bar"
            @click="resetFocus(map)">
      <span class="material-symbols-sharp">
        crop_free
      </span>
    </button>

    <button id="themeSwitch"
            class="customControl leaflet-bar"
            @click="switchTheme">
      <span class="material-symbols-sharp">
        {{ getIcon() }}
      </span>
    </button>

    <div id="search" class="leaflet-bar">
      <input id="searchInput"
             v-model="searchTerm"
             autocomplete="off"
             placeholder="Landkreis"
             type="text"
             v-on:input="searchCounties"
             @keydown.down.exact="selectNextCounty"
             @keydown.up.exact="selectPreviousCounty">

      <ul v-if="filteredCounties.length > 0">
        <li v-for="(county, index) in filteredCounties"
            :id="county.properties.id"
            :class="{'selectedCounty': index === selectedCountyIndex.value }"
            :tabindex="index"
            class="cursor-pointer county"
            @keydown.down.exact="selectNextCounty"
            @keydown.up.exact="selectPreviousCounty"
            @keydown.enter.exact="selectCounty">
          {{ county.properties.name }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style>


</style>
