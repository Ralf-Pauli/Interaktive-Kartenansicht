<template>
  <div class=" bg-gray-100">
  <h3>sd</h3>
  </div>
</template>

<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
  TabGroup,
  TabList,
  Tab,
  TabPanels,
  TabPanel
} from '@headlessui/vue'
import {XMarkIcon} from '@heroicons/vue/24/outline'

let props = defineProps({
  open: Boolean
})

</script>