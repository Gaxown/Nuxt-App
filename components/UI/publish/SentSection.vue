<template>
  <div class="px-6 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Show sent posts if available -->
      <div v-if="sentPosts.length > 0" class="space-y-6">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Sent Posts</h2>
            <p class="text-gray-600 mt-1">{{ sentPosts.length }} post{{ sentPosts.length === 1 ? '' : 's' }} published</p>
          </div>
        </div>
        
        <!-- Sent Posts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UIPublishPostCard
            v-for="post in sentPosts"
            :key="post.id"
            :post="post"
            :scheduled-time="formatPublishedTime(post.publishedAt)"
            :show-header-menu="false"
            :show-footer-menu="true"
            :show-edit-button="false"
            :footer-menu-items="[
              { label: 'View Analytics', action: 'analytics', icon: 'i-heroicons-chart-bar' },
              { label: 'Delete', action: 'delete', icon: 'i-heroicons-trash', color: 'red' }
            ]"
            @footer-menu-action="handleFooterMenuAction(post, $event)"
          />
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <UIcon name="i-heroicons-paper-airplane" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Sent Posts</h2>
        <p class="text-gray-600 mb-6">Posts that have been successfully published will appear here</p>
        <div class="text-sm text-gray-500">
          No posts sent yet
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use localStorage composable
const { loadSentPosts, saveSentPosts } = useLocalStorage()

// Inject dependencies
const sentCount = inject('sentCount')
const toast = useToast()

// Reactive data
const sentPosts = ref([])

// Load sent posts on mount
onMounted(() => {
  sentPosts.value = loadSentPosts()
  // Update sent count based on loaded posts
  if (sentCount) {
    sentCount.value = sentPosts.value.length
  }
})

// Watch for changes in sentCount to reload posts
watch(sentCount, (newCount) => {
  sentPosts.value = loadSentPosts()
}, { immediate: false })

// Watch sentPosts and save to localStorage
watch(sentPosts, (newSentPosts) => {
  saveSentPosts(newSentPosts)
}, { deep: true })

// Format published time
const formatPublishedTime = (publishedAt) => {
  const date = new Date(publishedAt)
  return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
}

// Handle footer menu actions
const handleFooterMenuAction = (post, action) => {
  if (action === 'analytics') {
    toast.add({
      title: 'Analytics',
      description: 'Post analytics feature coming soon!',
      color: 'blue'
    })
  } else if (action === 'delete') {
    deleteSentPost(post)
  }
}

// Delete sent post
const deleteSentPost = (post) => {
  const postIndex = sentPosts.value.findIndex(p => p.id === post.id)
  if (postIndex > -1) {
    sentPosts.value.splice(postIndex, 1)
    
    // Update sent count
    if (sentCount) {
      sentCount.value = sentPosts.value.length
    }
    
    toast.add({
      title: 'Post Deleted',
      description: 'Sent post has been deleted successfully.',
      color: 'yellow'
    })
  }
}
</script>