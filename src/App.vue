<script setup>
import LeafletMap from './components/LeafletMap.vue';
</script>

<template>
  <LeafletMap/>
  <div id="sidebar-wrapper">
    <div id="sidebar">
    </div>
  </div>
</template>

<style scoped>
#sidebar, #sidebar-wrapper {
  background: white;
  width: 25%;
  float: right;
  z-index: 2;
}

</style>