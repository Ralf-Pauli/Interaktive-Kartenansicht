<template>
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
          :class="{'selectedCounty': index === selectedCountyIndex }"
          :tabindex="index"
          class="cursor-pointer county"
          @click="selectCounty"
          @keydown.down.exact="selectNextCounty"
          @keydown.up.exact="selectPreviousCounty"
          @keydown.enter.exact="selectCounty">
        {{ county.properties.name }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import {getCountiesMap, getSearchData} from "@/utils/geoJsonHandler";
import {ref} from "vue";
import {map} from "@/utils/mapManagement";

let searchTerm = ref(""),
    filteredCounties = ref([]),
    selectedCountyIndex = ref("");

function searchCounties() {
  if (searchTerm.value.length === 0) {
    return filteredCounties.value = [];
  }
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
}

function selectNextCounty() {
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

  focusItem();
}

function selectPreviousCounty() {
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
  focusItem();
}

function focusItem() {
  if (filteredCounties.value.length > 0) {
    let selectedCounty = document.getElementsByClassName("county").item(selectedCountyIndex.value);
    selectedCounty.focus();
  }
}

function selectCounty(ev) {
  let startTime = performance.now();
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
  let endTime = performance.now();
  console.log(`Call to doSomething took ${endTime - startTime} milliseconds`)
}

</script>

<style scoped>

</style>