<template>
  <div class="flex gap-4">
    <div class="grid grid-cols-5 auto grid-rows-1 auto-cols-auto">
      <div class="col-span-4 self-center text-sm font-bold">
        <div>
          {{ warning.info[0].headline }}
        </div>
        <div class="text-xs pt-1 font-extralight">
          {{ new Date(warning.sent).toLocaleString("de-DE") + " Uhr" }}
        </div>
      </div>
      <button class="self-center mt-1" @click="warning.visible = !warning.visible">
        <span :class="warning.visible ? 'rotate-180': 'rotate-0'"
              class="m-0 p-0 material-symbols-sharp transform transition-transform duration-500 ease-in-out ">expand_more</span>
      </button>
    </div>
    <div v-show="warning.visible" class="flex flex-col gap-2.5">
      <div class="bg-ninaLightOrange rounded py-1 px-2 font-bold text-black text-sm">
        Warnstufe: {{ warning.severity }}
      </div>

      <div>
        <div class="flex gap-1 flex-wrap justify-start justify-items-center ">
          <span class="material-symbols-sharp ">Accessibility</span>
          <div class="flex-auto self-center text-sm font-bold">Handlungsempfehlung</div>
        </div>
        <div class="text-xs pl-1.5" v-html="warning.info[0].instruction"></div>
      </div>


      <div>
        <div class="flex gap-1 flex-wrap justify-start justify-items-center ">
          <span class="material-symbols-sharp ">exclamation</span>
          <div class="flex-auto self-center text-sm font-bold">Weitere Informationen</div>
        </div>
        <div class="text-xs pl-1.5">
          <div v-html="warning.info[0].contact"></div>
          <div  v-for="web in warning.info[0].web">
            <a v-bind:href="web">{{ web }}</a>
          </div>


        </div>


        <div class="flex gap-1 flex-wrap justify-start justify-items-center ">
          <span class="material-symbols-sharp">map</span>
          <div class="flex-auto self-center text-sm font-bold">Betroffene Region(en)</div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const props = defineProps(["warning"])
</script>

<style scoped>

</style>