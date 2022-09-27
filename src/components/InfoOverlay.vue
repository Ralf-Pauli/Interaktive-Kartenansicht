<template>
  <TransitionRoot :show="open" as="template">
    <Dialog as="div" class="relative z-10" @close="open = false">
      Gray out surrounding area
      <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0" enter-to="opacity-100"
                       leave="ease-in-out duration-500" leave-from="opacity-100" leave-to="opacity-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"/>
      </TransitionChild>
      <div class="fixed inset-0 overflow-hidden">
        <div class="absolute inset-0 overflow-hidden">
          <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
            <TransitionChild as="template" enter="transform transition ease-in-out duration-500 sm:duration-700"
                             enter-from="translate-x-full" enter-to="translate-x-0"
                             leave="transform transition ease-in-out duration-500 sm:duration-700"
                             leave-from="translate-x-0" leave-to="translate-x-full">
              <DialogPanel class="pointer-events-auto relative w-screen max-w-md">
                <!--                Button-->
                <TransitionChild as="template" enter="ease-in-out duration-500" enter-from="opacity-0"
                                 enter-to="opacity-100" leave="ease-in-out duration-500" leave-from="opacity-100"
                                 leave-to="opacity-0">
                  <div class="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 sm:-ml-10 sm:pr-4">
                    <button
                        class="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        type="button"
                        @click="open = false">
                      <span class="sr-only">Close panel</span>
                      <XMarkIcon aria-hidden="true" class="h-6 w-6"/>
                    </button>
                  </div>
                </TransitionChild>
                <!-- overflow-y-scroll-->
                <div class="flex h-full flex-col bg-white py-6 shadow-xl ">
                  <div class="px-4 sm:px-6 self-center">
                    <DialogTitle class="text-lg font-medium text-gray-900">Informationen</DialogTitle>
                  </div>

                  <div class=" max-w-md mx-2 py-16 sm:px-0">
                    <TabGroup>
                      <TabList class="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                        <Tab>
                          <button class="rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2" >KS
                          </button>
                        </Tab>
                        <Tab>
                          <button class="rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2" >KS
                          </button>
                        </Tab>
                        <Tab>
                          <button class=" rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2" >KS
                          </button>
                        </Tab>

                      </TabList>

                      <TabPanels class="mt-2">
                        <TabPanel class="rounded-xl bg-amber-50 p-3 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2">

                          <a class="absolute inset-0 rounded-md ring-blue-400 focus:z-10 focus:outline-none focus:ring-2" href="#"/>
                        </TabPanel>
                      </TabPanels>
                    </TabGroup>
                  </div>

                  <div class="relative mt-6 flex-1 px-4 sm:px-6">
                    <!-- Replace with your content -->
                    <div class="absolute inset-0 px-4 sm:px-6">
                      <div aria-hidden="true" class="h-full border-2 border-dashed border-gray-200"/>
                    </div>
                    <!-- /End replace -->
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
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