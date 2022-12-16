<template>
  <div v-if="alertOpen" class="text-white px-6 py-4 border-0 rounded relative mb-4 bg-red-500 w-full ">
    <div><span class="text-xl inline-block mr-5 align-middle">
      <span class="material-symbols-sharp">error</span>
    </span>
      <span class="inline-block align-middle mr-8">
      {{ error.message }}
    </span>
      <button
          class="absolute bg-transparent text-2xl font-semibold leading-none right-0 top-0 mt-4 mr-6 outline-none focus:outline-none"
          @click="closeAlert()">
        <span>×</span>
      </button>
    </div>
    <div class="w-full absolute bottom-0 left-0 mb-0 bg-gray-200 rounded-full h-1 mb-4 dark:bg-gray-700">
      <div id="loadBar" style="width: 100%" class="bg-blue-600 h-1 rounded-full dark:bg-blue-500"></div>
    </div>
  </div>

</template>

<script setup>
import {onMounted, ref} from "vue";

let alertOpen = ref(true)
let progress = 100;
let props = defineProps(["error"])

function closeAlert() {
  alertOpen.value = false;
}


onMounted(() => {
  let pb = document.getElementById("loadBar");
  let interval = setInterval(() => {
    progress--;
    pb.style.width = progress + "%"
  }, 100)

  setTimeout(() => {
    clearInterval(interval);
    closeAlert();
  }, 10 * 1000)

})

</script>

<style scoped>

</style>