<script setup>
import {RouterLink, RouterView} from 'vue-router'
import Sidebar from "@/components/Sidebar.vue";
import {sidebarWidth} from '@/components/state.js'
</script>

<template>
  <Sidebar/>
  <div :style="{ 'margin-right': sidebarWidth }" class=" h-full">
    <RouterView/>
  </div>
</template>
