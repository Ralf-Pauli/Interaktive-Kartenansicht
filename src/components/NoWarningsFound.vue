<template >
  <div class="text-xl gap-2 justify-center flex flex-col  text-center mt-8">
    <p>Es liegen keine {{ warnType }}en vor</p>
    <div>
      <span class="material-symbols-sharp text-5xl text-ninaOrange">{{ symbol }}</span>
    </div>
  </div>
</template>

<script setup>
let props = defineProps(["symbol", "warnType"])

</script>

<style scoped>

</style>