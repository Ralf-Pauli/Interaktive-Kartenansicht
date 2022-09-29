<template>
  <div
      class="bg-white right fixed z-30 right-0 top-0 bottom-0 p-0.5 flex flex-col  content-center items-center">
    <div class="m-3">
      <h1 class="text-xl font-bold">
        Interaktive Kartenansicht
      </h1>
    </div>
    <div class="m-3 flex flex-col font-bold items-center space-y-3 divide-y-2">
      <div class="m-3 flex flex-col font-bold  items-center space-y-3 ">
        <h2 class="text-lg">
          Covid-19
        </h2>
        <div>
          <h3>
            Allgemeine Informationen
          </h3>
        </div>

        <div>
          <h3>
            Aktuelle Regeln
          </h3>
        </div>
      </div>
      <div>
        <h2 class="text-lg font-bold">
          Unwetterwarnungen
        </h2>
      </div>
    </div>


  </div>
</template>

<script>
import {collapsed, toggleSidebar, sidebarWidth} from './state'

export default {
  name: "Sidebar",
  setup() {
    return {collapsed, toggleSidebar, sidebarWidth}
  }
}
</script>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
  transition: 0.2s linear;
}

.collapse-icon {
  position: absolute;
  bottom: 0;
  padding: 0.75em;
  color: rgba(255, 255, 255, 0.7);
  transition: 0.2s linear;
}
</style>