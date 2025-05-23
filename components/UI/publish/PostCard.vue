<template>
  <div class="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <div class="text-sm text-gray-600 font-medium">{{ scheduledTime }}</div>
      <UButton 
        color="gray" 
        variant="ghost" 
        icon="i-heroicons-ellipsis-vertical"
        size="sm"
      />
    </div>
    
    <!-- Post Content -->
    <div class="p-4">
      <!-- User Info -->
      <div class="flex items-center space-x-3 mb-4">
        <img 
          :src="profileImage" 
          :alt="username"
          class="w-10 h-10 rounded-full object-cover flex-shrink-0"
        />
        <span class="font-medium text-gray-900">{{ username }}</span>
      </div>
      
      <!-- Post Media -->
      <div v-if="post.files && post.files.length > 0" class="mb-4">
        <div class="grid grid-cols-1 gap-2">
          <div v-for="(file, index) in post.files" :key="index" class="relative">
            <img 
              v-if="file.type.startsWith('image/')"
              :src="file.preview" 
              :alt="file.name"
              class="w-full max-h-96 object-contain rounded-lg bg-gray-100"
            />
            <div 
              v-else-if="file.type.startsWith('video/')"
              class="w-full h-64 bg-gray-800 rounded-lg flex items-center justify-center"
            >
              <UIcon name="i-heroicons-play-circle" class="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Post Text Content -->
      <div v-if="post.content" class="mb-4">
        <p class="text-gray-900 leading-relaxed">{{ post.content }}</p>
      </div>
      
      <!-- Repost Icon (if applicable) -->
      <div class="flex items-center mb-4">
        <UButton 
          color="gray" 
          variant="ghost" 
          icon="i-heroicons-arrow-path-rounded-square"
          size="sm"
        />
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-4 pb-4">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-500">
          You created this {{ timeAgo }}
        </div>
        <div class="flex items-center space-x-2">
          <UButton 
            color="primary" 
            variant="outline" 
            icon="i-heroicons-paper-airplane"
            size="sm"
            @click="$emit('publishNow')"
          >
            Publish Now
          </UButton>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-pencil"
            size="sm"
            @click="$emit('edit')"
          />
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-ellipsis-vertical"
            size="sm"
            @click="$emit('showOptions')"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  post: {
    type: Object,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  username: {
    type: String,
    default: 'huntergon077'
  },
  profileImage: {
    type: String,
    default: 'https://via.placeholder.com/100'
  }
})

// Emits
const emit = defineEmits(['publishNow', 'edit', 'showOptions'])

// Computed
const userInitial = computed(() => {
  return props.username.charAt(0).toLowerCase()
})

const timeAgo = computed(() => {
  // For now, show "1 second ago" as in the image
  // In real app, you'd calculate actual time difference
  return '1 second ago'
})
</script> 