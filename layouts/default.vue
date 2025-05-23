<template>
  <div>
    <!-- Main Content -->
    <slot />
  </div>
</template>

<script setup>
// Global head configuration
useHead({
  titleTemplate: '%s - Social Media Scheduler',
  meta: [
    { name: 'description', content: 'Professional social media scheduling platform' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ]
})
</script> 