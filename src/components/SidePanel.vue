<template>
  <div id="sidePanel" aria-hidden="false" aria-label="side panel" class="sidepanel">
    <div class="sidepanel-inner-wrapper">
      <nav aria-label="sidepanel tab navigation" class="sidepanel-tabs-wrapper">
        <ul class="sidepanel-tabs">


          <!--            <li class="sidepanel-tab">-->
          <!--              <a class="sidebar-tab-link" data-tab-link="tab-1" href="#" role="tab">-->
          <!--                <span class="material-symbols-sharp">info</span>-->
          <!--              </a>-->
          <!--            </li>-->

          <!--            <SidePanelTab v-for="(symbol,index) in symbolList" :tab-number="index" :symbol="symbol" :title="titles[index]"  />-->

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
          <!--            <div class="sidepanel-tab-content" data-tab-content="tab-1">-->
          <!--              <h2 class="text-2xl text-center mb-6">Allgemeine Informationen</h2>-->
          <!--              <h3 class="text-base font-bold mb-2 border-collapse">{{ currentMunicipality.name }}</h3>-->
          <!--              <table class="w-full table-fixed text-left  border-y-gray-600">-->
          <!--                <tr class="border-y border-y-gray-600">-->
          <!--                  <th>Bezeichnung</th>-->
          <!--                  <td>{{ currentMunicipality.bez }}</td>-->
          <!--                </tr>-->
          <!--                <tr class="border-y border-y-gray-600">-->
          <!--                  <th>Einwohner</th>-->
          <!--                  <td>{{ currentMunicipality.population }}</td>-->
          <!--                </tr>-->
          <!--                <tr class="border-y border-y-gray-600">-->
          <!--                  <th>Allgemeine Notfalltips</th>-->
          <!--                  <td>{{ currentMunicipality.allgNotfall }}</td>-->
          <!--                </tr>-->
          <!--              </table>-->
          <!--            </div>-->

          <div class="sidepanel-tab-content" data-tab-content="tab-2">
            <h2 class="text-2xl text-center mb-3">Warnmeldungen</h2>

            <div v-if="isLoading">
              <LoadingWarning></LoadingWarning>
            </div>

            <div v-else-if="coronaWarnings.size > 0" class="mt-5">
              <Warning v-for="warn in generalWarnings.values()" :warning="warn"
                       class="flex flex-col mb-2 pb-2 gap-2 border-b"/>
            </div>

            <div v-else>

            </div>
          </div>

          <div class="sidepanel-tab-content w-full h-full" data-tab-content="tab-3">
            <h2 class="text-2xl text-center mb-3">Covid-19</h2>

            <div v-if="isLoading">
              <LoadingWarning></LoadingWarning>
            </div>

            <div v-else-if="coronaWarnings.size > 0" class="mt-5">
              <Warning v-for="warn in coronaWarnings.values()" :warning="warn"
                       class="flex flex-col mb-2 pb-2 gap-2 border-b"/>
            </div>

            <div v-else>

            </div>
          </div>

          <div class="sidepanel-tab-content w-full h-full" data-tab-content="tab-4">
            <h2 class="text-2xl text-center">Unwetterwarnungen</h2>
            <div v-if="isLoading">
              <LoadingWarning></LoadingWarning>
            </div>

            <div v-else-if="weatherWarnings.size > 0" class="mt-5">
              <Warning v-for="warn in weatherWarnings.values()" :warning="warn"
                       class="flex flex-col mb-2 pb-2 gap-2 border-b"/>
            </div>

            <div v-else class="flex items-center justify-center flex-col items-stretch h-auto max-h-screen">

            </div>

          </div>

        </div>
      </div>
    </div>

    <div class="sidepanel-toggle-container">
      <button ref="sidebarBtn" aria-label="toggle side panel" class="sidepanel-toggle-button" type="button"></button>
    </div>
  </div>
</template>

<script setup>

import LoadingWarning from "./LoadingWarning.vue"
import Warning from "./Warning.vue"
import {onMounted, ref} from "vue";

let warningGeo = [[], [], []];

const proxyURL = "https://corsproxy.io/?";
const baseURL = "https://nina.api.proxy.bund.dev/api31";

let symbolList = ["warning", "coronavirus", "thunderstorm"]

let props = defineProps(["warningGeo"])
let emit = defineEmits(["update:warningGeo"])
onMounted(() => {
  getWarnings();
})


let warnings = new Map(),
    coronaWarnings = ref(new Map()),
    weatherWarnings = ref(new Map()),
    generalWarnings = ref(new Map()),
    allWarnings = new ref([]);



let isLoading = ref(false);

async function getWarnings() {
  let responses;
  try {
    isLoading.value = true;
    responses = await Promise.allSettled(["katwarn", "biwapp", "mowas", "dwd", "lhp"].map(async source => [
      await fetch(proxyURL + baseURL + `/${source}/mapData.json`, {cache: "reload"}).then(res => res.json()),
    ]));
  } catch (e) {
    console.log(e);
  }
  isLoading.value = false;

  responses.forEach(response => {
    if (response.value[0].length !== 0) {
      response.value[0].forEach(warning => {
        let id = warning.id;
        delete warning.id;
        warnings.set(id, warning);
      });
    }
  });
  await setWarningDetails();
}

async function setWarningDetails() {
  for (let key of warnings.keys()) {
    await fetch(proxyURL + baseURL + `/warnings/${key}.json`).then(res => {
      if (!res.ok) {
        throw new Error("Error: " + res.status);
      }
      return res.json();
    }).then(value => {
      value.severity = warnings.get(value.identifier).severity;
      if (value.info[0].web !== undefined) {
        value.info[0].web = value.info[0].web.split("\n");
        for (let i = 0; i < value.info[0].web.length; i++) {
          if (!value.info[0].web[i].includes("https://") && !value.info[0].web[i].includes("http://")) {
            value.info[0].web[i] = "https://" + value.info[0].web[i];
          }
        }
      }
      switch (key.substring(0, 3)) {
        case "dwd":
          weatherWarnings.value.set(key, value);
          break;

        case "mow":
          generalWarnings.value.set(key, value);
          break;

        case "biw":
          generalWarnings.value.set(key, value);
          break;

        case "kat":
          generalWarnings.value.set(key, value);
          break;

        default:
          generalWarnings.value.set(key, value);
          break;
      }
      allWarnings = [generalWarnings.value, coronaWarnings.value, weatherWarnings.value];

    }).catch(err => {
      console.log(err);
    });
  }

  generalWarnings.value.forEach((value, key) => {
    if (value.info[0].headline.toLowerCase().includes("corona" || "covid")) {
      coronaWarnings.value.set(key, value);
      generalWarnings.value.delete(key);
    }
  });
  await getWarningGeoJSON();
}

async function getWarningGeoJSON() {
  // warningGeoJSONs
  for (let index in allWarnings) {
    let geoJSONS = []
    for (let warning of allWarnings[index]) {
      try {
        geoJSONS.push(await fetch(proxyURL + baseURL + `/warnings/${warning[0]}.geojson`).then(res => res.json()));
      } catch (e) {
        console.log(e)
      }
    }
    warningGeo[index].push(geoJSONS)
  }
  emit("update:warningGeo", warningGeo);
  // props.warningGeo.value = warningGeo;
}


</script>

<style scoped>

</style>