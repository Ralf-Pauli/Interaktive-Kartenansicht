<template>
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
          <div class="sidepanel-tab-content space-y-1" data-tab-content="tab-1">
            <h2 class="text-2xl text-center mb-6">Allgemeine Informationen</h2>

            <div class="grid grid-rows-1 grid-cols-2 grid-flow-row gap-3">
              <div class="text-base">Name</div>
              <div>1</div>
              <div class="text-base">Einwohner</div>
              <div></div>
              <div class="text-base">Einwohner Männlich</div>
              <div></div>
              <div class="text-base">Einwohner Weiblich</div>
              <div></div>
              <div class="text-base">Bezeichnung</div>
              <div></div>
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
  <!--  </div>-->
</template>

<script>
import L from "leaflet";

export default {
  name: "Sidebar",
  props: ['map'],
  mounted() {
    return L.marker([51.1642292, 10.4541194]).addTo(this.map);
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