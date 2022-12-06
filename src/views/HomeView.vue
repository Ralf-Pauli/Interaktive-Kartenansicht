<script setup>
import {computed, nextTick, onBeforeMount, onMounted, ref, watch} from 'vue';
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
import {addCounties, addSwissCounties, addWarningGeoToMap} from "@/utils/geoJsonHandler";
import {getCurrentLayer, setCurrentLayer} from "@/utils/styling";
import {getLayerControl} from "@/utils/mapControls";
import {
  createSearch, getFilteredCounties,
  getSelectedCountyIndex,
  searchCounties,
  selectNextCounty,
  selectPreviousCounty
} from "@/utils/searchUtil";

let map;

let info,
    legend,
    sidePanel,
    focusButton,
    themeButton;

let countiesMap,
    warningGeo = ref(),
    allWarnings = ref();

let searchTerm = ref("");


let styles = ["text-ninaOrange"];

let center = [51.1642292, 10.4541194],
    zoom = 6;

const isDark = useDark();
const toggleDark = useToggle(isDark);
let icon = ref("light_mode");


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
});

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


// function searchCounties() {
//   if (searchTerm.value.length === 0) {
//     return filteredCounties.value = [];
//   }
//
//   let matches = 0;
//
//   filteredCounties.value = searchData.filter(county => {
//     if (county.properties.name.toLowerCase().startsWith(searchTerm.value.toLowerCase()) && matches < 10) {
//       matches++;
//       if (searchTerm.value.toLowerCase() === county.properties.name.toLowerCase()) {
//         filteredCounties.value = []
//         return filteredCounties.value = [];
//       }
//       selectedCountyIndex.value = "";
//       return county;
//     }
//   })
// }
//
// function selectNextCounty(ev) {
//   if (selectedCountyIndex.value === "") {
//     selectedCountyIndex.value = 0;
//   } else {
//     selectedCountyIndex.value++;
//   }
//
//   if (selectedCountyIndex === filteredCounties.value.length) {
//     selectedCountyIndex = 0;
//   }
//
//   if (selectedCountyIndex.value > filteredCounties.value.length - 1) {
//     selectedCountyIndex.value = filteredCounties.value.length - 1;
//   }
//
//   focusItem(ev);
// }
//
// function selectPreviousCounty(ev) {
//   if (selectedCountyIndex.value === "") {
//     selectedCountyIndex.value = filteredCounties.value.length - 1;
//   } else {
//     selectedCountyIndex.value--;
//   }
//
//   if (selectedCountyIndex.value < 0) {
//     selectedCountyIndex.value = 0;
//     let inputField = document.getElementById("searchInput");
//     window.setTimeout(function () {
//       inputField.setSelectionRange(0, inputField.value.length)
//       inputField.focus()
//     }, 0);
//     return
//   }
//   focusItem(ev);
// }



// function selectCounty(ev) {
//   // countiesMap.toGeoJSON().features.find(value => value.feature.properties.AGS === ev.target.id)
//   let county = countiesMap.getLayers().find(value => value.feature.properties.AGS === ev.target.id);
//   map.fitBounds(county.getBounds());
//   county.setStyle({
//     fillColor: "red",
//     weight: 2,
//     opacity: 1,
//     color: 'black',
//     dashArray: '3',
//     fillOpacity: 0.7
//   });
//   searchTerm.value = ev.target.innerText;
//   filteredCounties.value = [];
// }


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

    <button id="themeSwitch" class="customControl leaflet-bar"
            @click="switchTheme">
      <span class="material-symbols-sharp">
        {{ icon }}
      </span>
    </button>

    <div id="search" class="leaflet-bar">
      <input id="searchInput"
             v-model="searchTerm"
             autocomplete="off"
             placeholder="Landkreis"
             type="text"
             v-on:input="searchCounties(searchTerm)"
             @keydown.down.exact="selectNextCounty"
             @keydown.up.exact="selectPreviousCounty">

      <ul v-if="getFilteredCounties().length > 0">
        <li v-for="(county, index) in getFilteredCounties()"
            :id="county.properties.id"
            :class="{'selectedCounty': index === getSelectedCountyIndex() }"
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
<!--            @click="selectCounty"-->

<style>


</style>
