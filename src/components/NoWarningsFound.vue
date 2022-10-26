<template>
  <div class="text-xl gap-2 justify-center flex flex-col text-center w-full h-full mt-8">
    <p>Es liegen keine {{ warnType }}en vor</p>
    <div>
      <span class="material-symbols-sharp text-5xl text-ninaOrange">{{ symbol }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "NoWarningsFound",
  props: ["symbol",
    "warnType"]
}
</script>

<style scoped>

</style>