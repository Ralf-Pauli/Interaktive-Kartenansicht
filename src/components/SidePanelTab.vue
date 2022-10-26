<template>
  <li class="sidepanel-tab">
    <a class="sidebar-tab-link" data-tab-link="tab-1" href="#" role="tab">
      <span class="material-symbols-sharp">{{ symbol }}</span>
    </a>
  </li>
</template>

<script>
export default {
  name: "SidePanelTab",
  props: ["tabNumber", "symbol"]
}
</script>

<style scoped>

</style>