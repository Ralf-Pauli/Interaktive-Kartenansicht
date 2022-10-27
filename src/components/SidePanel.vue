<template>
  <div id="sidePanel" aria-hidden="false" aria-label="side panel" class="sidepanel">
    <div class="sidepanel-inner-wrapper">
      <nav aria-label="sidepanel tab navigation" class="sidepanel-tabs-wrapper">
        <ul class="sidepanel-tabs">
          <SidePanelTab v-for="(symbol,index) in symbolList" :symbol="symbol" :tab-number="index"/>
        </ul>
      </nav>
    </div>

    <div class="sidepanel-toggle-container">
      <button ref="sidebarBtn" aria-label="toggle side panel" class="sidepanel-toggle-button" type="button"></button>
    </div>
  </div>
</template>

<script setup>
import SidePanelTab from "./SidePanelTab.vue"
import SidePanelTabContent from "./SidePanelTabContent.vue"

let props = defineProps(["allWarnings", "isLoading"])
let symbolList = ["warning", "coronavirus", "thunderstorm"]

</script>

<style scoped>

</style>