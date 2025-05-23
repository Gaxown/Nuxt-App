<template>
  <div class="px-6 py-8">
    <div class="max-w-4xl mx-auto">
      <div class="text-center py-16">
        <UIcon name="i-heroicons-queue-list" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Your Queue</h2>
        <p class="text-gray-600 mb-6">Posts scheduled to be published automatically</p>
        <div class="text-sm text-gray-500">
          {{ queueCount }} posts in queue
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
defineProps({
  queueCount: {
    type: Number,
    default: 0
  }
})
</script> 