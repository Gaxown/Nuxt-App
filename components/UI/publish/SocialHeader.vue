<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <span class="text-white font-semibold text-sm">H</span>
          </div>
          <span class="font-semibold text-lg">huntergon077</span>
          <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-gray-400" />
        </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <UButton color="gray" variant="ghost" icon="i-heroicons-share">
          Share Feedback
        </UButton>
        <UButton color="gray" variant="ghost" icon="i-heroicons-list-bullet">
          List
        </UButton>
        <UButton color="gray" variant="ghost" icon="i-heroicons-calendar">
          Calendar
        </UButton>
        <UButton color="primary" icon="i-heroicons-plus" @click="$emit('newPost')">
          New Post
        </UButton>
      </div>
    </div>
  </header>
</template>

<script setup>
// Emits
defineEmits(['newPost'])
</script> 