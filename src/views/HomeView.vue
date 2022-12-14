<script setup>
import {onBeforeMount, onMounted, ref, watch} from 'vue';
import "leaflet/dist/leaflet.css";
import L from 'leaflet';
import "@/assets/leaflet-sidepanel.css";
import "@/assets/leaflet-sidepanel.min";
import SidePanel from "@/components/SidePanel.vue"
import "leaflet-search";
import "leaflet-search/dist/leaflet-search.min.css"
import "@/utils/mapControls";
import {createMap} from "@/utils/mapManagement";
import * as mapControls from "@/utils/mapControls";
import {
  addCounties,
  addSwissCounties,
  addWarningGeoToMap,
  setAllWarnings
} from "@/utils/geoJsonHandler";
import {getCurrentLayer, setCurrentLayer} from "@/utils/styling";
import {getIcon} from "@/utils/mapControls";
import CountiesSearch from "@/components/CountiesSearch.vue";
import Error from "@/components/Error.vue";
import {getErrors} from "@/utils/ErrorHandler";

let map;

let warningGeo = ref();

let loading = ref(true);


onMounted(async () => {
  map = createMap();

  mapControls.createLayerControl();
  mapControls.createInfo(map);
  mapControls.createSidePanel(map);
  mapControls.createLegend(map);
  mapControls.createFocusButton(map);
  mapControls.createThemeButton(map)
  mapControls.createSearch(map)

  map.doubleClickZoom.disable();

  map.on('baselayerchange', function (e) {
    setCurrentLayer(e.layer)
    getCurrentLayer().bringToBack();
  });

  document.getElementById("focus").onclick = function () {
    let center = [51.1642292, 10.4541194],
        zoom = 6;
    map.flyTo(center, zoom, {duration: 1.5})
  }

  watch(warningGeo, async () => {
    addWarningGeoToMap(map, warningGeo)
  })

  await addCounties(map);
  await addSwissCounties()

  if (mapControls.getLayerControl()._layers.length !== 0) {
    mapControls.getLayerControl().addTo(map)
  }

  loading.value = false;
  console.log(getErrors());
});

onBeforeMount(() => {
  if (map) {
    map.remove();
  }
});

</script>

<template>
  <div v-if="loading" class="absolute animate-pulse h-full w-full loadingScreen">
    <iframe
        class="w-full h-full"
        src="https://www.openstreetmap.org/export/embed.html?bbox=2.6806640625%2C44.902577996288876%2C18.237304687500004%2C56.69244163539978&amp;layer=mapnik"></iframe>
  </div>
  <div id="map" class="z-10  h-full">
    <SidePanel @update:allWarnings="setAllWarnings($event)" @update:warningGeo="warningGeo = $event"/>

    <button id="focus" class="customControl leaflet-bar">
      <span class="material-symbols-sharp">
        crop_free
      </span>
    </button>

    <button
        id="themeSwitch"
        class="customControl leaflet-bar"
        @click="mapControls.switchTheme">
      <span class="material-symbols-sharp">
        {{ getIcon() }}
      </span>
    </button>

    <CountiesSearch/>

    <ul id="errors" class="w-1/2 my-0 mx-auto inset-x-0 bottom-0">
      <li v-for="(error) in getErrors()" v-if="!loading">
        <Error :key="error.cause" :error="error"/>
      </li>
    </ul>

  </div>
</template>

<style>
#errors {
  z-index: 1000;
  position: absolute;
}

</style>
