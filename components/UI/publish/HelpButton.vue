<template>
  <div class="fixed bottom-6 right-6">
    <UButton 
      color="primary" 
      icon="i-heroicons-question-mark-circle"
      size="lg"
      class="rounded-full shadow-lg"
      @click="$emit('help')"
    />
  </div>
</template>

<script setup>
// Emits
defineEmits(['help'])
</script> 