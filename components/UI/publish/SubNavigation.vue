<template>
  <div class="bg-white border-b border-gray-200 px-6">
    <div class="flex items-center justify-between py-4">
      <div class="flex space-x-8">
        <NuxtLink 
          to="/publish" 
          class="flex items-center space-x-2 hover:text-blue-600 transition-colors text-gray-900"
          :class="{ 'text-blue-600 font-medium': $route.path === '/publish' }"
        >
          <span>Queue</span>
          <UBadge color="gray" variant="subtle" class="text-gray-900 bg-gray-100">{{ queueCount }}</UBadge>
        </NuxtLink>
        
        <NuxtLink 
          to="/publish/drafts" 
          class="flex items-center space-x-2 hover:text-blue-600 transition-colors text-gray-900"
          :class="{ 'text-blue-600 font-medium': $route.path === '/publish/drafts' }"
        >
          <span>Drafts</span>
          <UBadge color="gray" variant="subtle" class="text-gray-900 bg-gray-100">{{ draftsCount }}</UBadge>
        </NuxtLink>
        
        <div class="flex items-center space-x-2 text-gray-900">
          <span>Approvals</span>
          <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-purple-600" />
        </div>
        
        <NuxtLink 
          to="/publish/sent" 
          class="flex items-center space-x-2 hover:text-blue-600 transition-colors text-gray-900"
          :class="{ 'text-blue-600 font-medium': $route.path === '/publish/sent' }"
        >
          <span>Sent</span>
          <UBadge color="gray" variant="subtle" class="text-gray-900 bg-gray-100">{{ sentCount }}</UBadge>
        </NuxtLink>
      </div>
      
      <div class="flex items-center space-x-4">
        <UButton color="gray" variant="ghost" icon="i-heroicons-tag" class="text-gray-900">
          <UIcon name="i-heroicons-tag" class="w-4 h-4 text-gray-900" />
          <span>Tags</span>
        </UButton>
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-map-pin" class="w-4 h-4 text-gray-900" />
          <span class="text-sm text-gray-900">Casablanca</span>
        </div>
        <UButton color="gray" variant="ghost" class="text-gray-900">
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

// Inject dependencies
const refreshQueue = inject('refreshQueue')

// Watch route changes to refresh data
const route = useRoute()
watch(() => route.path, (newPath) => {
  if (newPath === '/publish' && refreshQueue) {
    refreshQueue.value++
  }
})
</script> 