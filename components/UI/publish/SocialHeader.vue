<template>
  <header class="bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <div class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
            <span class="text-white font-semibold text-sm">H</span>
          </div>
          <span class="font-semibold text-lg text-gray-900">huntergon077</span>
          <UIcon name="i-heroicons-cog-6-tooth" class="w-5 h-5 text-gray-900" />
        </div>
      </div>
      
      <div class="flex items-center space-x-4">
        <UButton color="gray" variant="ghost" class="text-gray-900">
          <UIcon name="i-heroicons-share" class="w-5 h-5 text-gray-900 mr-2" />
          <span>Share Feedback</span>
        </UButton>
        <UButton 
          color="gray" 
          variant="ghost"
          @click="navigateTo('/publish')"
          class="text-gray-900"
        >
          <UIcon name="i-heroicons-list-bullet" class="w-5 h-5 text-gray-900 mr-2" />
          <span>List</span>
        </UButton>
        <UButton 
          color="gray" 
          variant="ghost"
          @click="$router.push('/publish/calendar')"
          class="text-gray-900"
        >
          <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-gray-900 mr-2" />
          <span>Calendar</span>
        </UButton>
        <UButton 
          color="primary" 
          @click="$emit('newPost')" 
          class="text-white font-medium"
        >
          <UIcon name="i-heroicons-plus" class="w-5 h-5 text-white mr-2" />
          <span>New Post</span>
        </UButton>
      </div>
    </div>
  </header>
</template>

<script setup>
// Emits
defineEmits(['newPost'])
</script> 