<template>
  <div :data-tab-content="`tab-${tabNumber}`" class="sidepanel-tab-content">
    <h2 class="text-2xl text-center mb-3">{{ title }}</h2>

    <div v-if="isLoading">
      <LoadingWarning></LoadingWarning>
    </div>

    <div v-else-if="warnings.size > 0" class="mt-5">
      <Warning v-for="warn in warnings.values()" :warning="warn"
               class="flex flex-col mb-2 pb-2 gap-2 border-b"/>
    </div>

    <div v-else>
      <NoWarningsFound/>
    </div>
  </div>
</template>

<script setup>
import LoadingWarning from "@/components/LoadingWarning.vue";
import Warning from "@/components/Warning.vue";
import NoWarningsFound from "@/components/NoWarningsFound.vue";


const props = defineProps(["tabNumber", "title", "warnings", "isLoading"]);
</script>

<style scoped>

</style>