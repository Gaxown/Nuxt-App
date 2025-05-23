<template>
  <div class="bg-white border-b border-gray-200 px-6">
    <div class="flex items-center justify-between py-4">
      <div class="flex space-x-8">
        <NuxtLink 
          to="/publish" 
          class="flex items-center space-x-2 hover:text-blue-600 transition-colors"
          :class="{ 'text-blue-600 font-medium': $route.path === '/publish' }"
        >
          <span>Queue</span>
          <UBadge color="gray" variant="subtle">{{ queueCount }}</UBadge>
        </NuxtLink>
        
        <NuxtLink 
          to="/publish/drafts" 
          class="flex items-center space-x-2 hover:text-blue-600 transition-colors"
          :class="{ 'text-blue-600 font-medium': $route.path === '/publish/drafts', 'text-gray-600': $route.path !== '/publish/drafts' }"
        >
          <span>Drafts</span>
          <UBadge color="gray" variant="subtle">{{ draftsCount }}</UBadge>
        </NuxtLink>
        
        <div class="flex items-center space-x-2 text-gray-600">
          <span>Approvals</span>
          <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-purple-500" />
        </div>
        
        <NuxtLink 
          to="/publish/sent" 
          class="flex items-center space-x-2 hover:text-blue-600 transition-colors"
          :class="{ 'text-blue-600 font-medium': $route.path === '/publish/sent', 'text-gray-600': $route.path !== '/publish/sent' }"
        >
          <span>Sent</span>
          <UBadge color="gray" variant="subtle">{{ sentCount }}</UBadge>
        </NuxtLink>
      </div>
      
      <div class="flex items-center space-x-4">
        <UButton color="gray" variant="ghost" icon="i-heroicons-tag">
          Tags
        </UButton>
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4" />
          <span class="text-sm">Casablanca</span>
        </div>
        <UButton color="gray" variant="ghost">
          More
        </UButton>
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
  },
  draftsCount: {
    type: Number,
    default: 0
  },
  sentCount: {
    type: Number,
    default: 0
  }
})
</script> 