<template>
  <nav class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-8">
        <div class="flex items-center space-x-2">
          <div
            class="w-8 h-8 bg-blue-600 rounded flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">SB</span>
          </div>
          <span class="text-xl font-semibold text-gray-900">Social Buffer</span>
        </div>

        <div class="hidden md:flex space-x-6">
          <button
            v-for="tab in navigationTabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 hover:text-gray-900',
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
      </div>

      <div class="flex items-center space-x-4">
        <button
          @click="$emit('new-post')"
          class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          + New
        </button>
        <div class="w-8 h-8 bg-gray-300 rounded-full"></div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, withDefaults } from "vue";


defineEmits(["new-post"]);

const activeTab = ref("publish");

const navigationTabs = [
  { id: "create", name: "Create" },
  { id: "publish", name: "Publish" },
  { id: "analyze", name: "Analyze" },
  { id: "engage", name: "Engage" },
];
</script>
