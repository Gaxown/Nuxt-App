<template>
  <div class="bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-100">
      <div class="text-base text-gray-900 font-medium">{{ scheduledTime }}</div>
      
      <!-- Header Menu -->
      <UDropdown 
        v-if="showHeaderMenu && headerDropdownItems.length > 0" 
        :items="headerDropdownItems" 
        :popper="{ placement: 'bottom-end' }"
      >
        <UButton 
          color="green" 
          variant="ghost" 
          size="sm"
          class="text-green-600 hover:bg-green-50"
        >
          <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6" />
        </UButton>
        
        <template #item="{ item }">
          <span class="truncate text-base" :class="item.class || 'text-gray-900'">{{ item.label }}</span>
          <UIcon 
            :name="item.icon" 
            class="flex-shrink-0 h-5 w-5 ms-auto"
            :class="item.class?.includes('bg-gray-900') ? 'text-white' : 'text-green-600'" 
          />
        </template>
      </UDropdown>
      
      <!-- Default header button (when no menu) -->
      <UButton 
        v-else
        color="green" 
        variant="ghost" 
        size="sm"
        class="text-green-600 hover:bg-green-50"
        @click="$emit('showOptions')"
      >
        <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6" />
      </UButton>
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
        <span class="font-medium text-gray-900 text-base">{{ username }}</span>
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
              <UIcon name="i-heroicons-play-circle" class="w-16 h-16 text-white" />
            </div>
          </div>
        </div>
      </div>
      
      <!-- Post Text Content -->
      <div v-if="post.content" class="mb-4">
        <p class="text-gray-900 leading-relaxed text-base">{{ post.content }}</p>
      </div>
      
      <!-- Tags -->
      <div v-if="post.tags && post.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
        <div
          v-for="tag in post.tags"
          :key="tag"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-gray-900 text-white"
        >
          #{{ tag }}
        </div>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="px-4 pb-4">
      <div class="flex items-center justify-between">
        <div class="text-base text-gray-900">
          {{ post.status === 'sent' ? `Published ${timeAgo}` : `You created this ${timeAgo}` }}
        </div>
        
        <!-- Footer Actions -->
        <div class="flex items-center space-x-2">
          <!-- Publish Now Button (for scheduled posts or when explicitly enabled) -->
          <UButton 
            v-if="post.status === 'scheduled' || showPublishNow"
            color="green" 
            variant="solid" 
            size="sm"
            class="text-white font-medium bg-green-600 hover:bg-green-700"
            @click="$emit('publishNow')"
          >
            <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5 mr-2" />
            Publish Now
          </UButton>
          
          <!-- Edit Button -->
          <UButton 
            v-if="showEditButton"
            color="green" 
            variant="ghost" 
            size="sm"
            class="text-green-600 hover:bg-green-50"
            @click="$emit('edit', post)"
          >
            <UIcon name="i-heroicons-pencil" class="w-6 h-6" />
          </UButton>
          
          <!-- Footer Menu -->
          <UDropdown 
            v-if="showFooterMenu && footerDropdownItems.length > 0" 
            :items="footerDropdownItems" 
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton 
              color="green" 
              variant="ghost" 
              size="sm"
              class="text-green-600 hover:bg-green-50"
            >
              <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6" />
            </UButton>
            
            <template #item="{ item }">
              <span 
                class="truncate text-base" 
                :class="item.class || 'text-gray-900'"
              >
                {{ item.label }}
              </span>
              <UIcon 
                :name="item.icon" 
                class="flex-shrink-0 h-5 w-5 ms-auto"
                :class="item.class?.includes('bg-gray-900') ? 'text-white' : 'text-green-600'"
              />
            </template>
          </UDropdown>
          
          <!-- Default footer button (when no menu) -->
          <UButton 
            v-else
            color="green" 
            variant="ghost" 
            size="sm"
            class="text-green-600 hover:bg-green-50"
            @click="$emit('showOptions')"
          >
            <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6" />
          </UButton>
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
    default: ''
  },
  username: {
    type: String,
    default: 'huntergon077'
  },
  profileImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  },
  showHeaderMenu: {
    type: Boolean,
    default: false
  },
  showFooterMenu: {
    type: Boolean,
    default: false
  },
  headerMenuItems: {
    type: Array,
    default: () => []
  },
  footerMenuItems: {
    type: Array,
    default: () => []
  },
  showPublishNow: {
    type: Boolean,
    default: false
  },
  showEditButton: {
    type: Boolean,
    default: true
  }
})

// Emits
const emit = defineEmits(['publishNow', 'edit', 'showOptions', 'headerMenuAction', 'footerMenuAction'])

// Computed
const userInitial = computed(() => {
  return props.username.charAt(0).toLowerCase()
})

const timeAgo = computed(() => {
  // Use publishedAt for sent posts, createdAt for others
  const timeReference = props.post.status === 'sent' && props.post.publishedAt 
    ? props.post.publishedAt 
    : props.post.createdAt

  if (timeReference) {
    const now = new Date()
    const created = new Date(timeReference)
    const diffMs = now - created
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  return '1 second ago'
})

// Computed for header menu
const headerDropdownItems = computed(() => {
  if (!props.showHeaderMenu) {
    return []
  }
  
  if (props.headerMenuItems.length === 0) {
    return [[{
      label: 'Duplicate',
      icon: 'i-heroicons-document-duplicate',
      class: 'bg-gray-900 text-white rounded-lg px-2',
      click: () => {
        emit('headerMenuAction', 'duplicate')
      }
    }]]
  }
  
  return [props.headerMenuItems.map(item => ({
    label: item.label,
    icon: item.icon,
    class: item.action === 'duplicate' ? 'bg-gray-900 text-white rounded-lg px-2' : '',
    click: () => {
      emit('headerMenuAction', item.action)
    }
  }))]
})

// Computed for footer menu
const footerDropdownItems = computed(() => {
  if (!props.showFooterMenu || props.footerMenuItems.length === 0) {
    return []
  }
  
  return [props.footerMenuItems.map(item => ({
    label: item.label,
    icon: item.icon,
    class: 'bg-gray-900 text-white rounded-lg px-2',
    click: () => {
      emit('footerMenuAction', item.action)
    }
  }))]
})
</script> 