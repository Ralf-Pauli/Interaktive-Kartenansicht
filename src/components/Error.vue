<template>
  <div v-if="alertOpen" class="text-white px-6 py-4 border-0 rounded relative mb-4 bg-red-500 w-full ">
    <span class="text-xl inline-block mr-5 align-middle">
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
</template>

<script setup>
import {ref} from "vue";

let alertOpen = ref(true)

let props = defineProps(["error"])

function closeAlert() {
  alertOpen.value = false;
}

</script>

<style scoped>

</style>