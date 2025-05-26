<template>
  <div class="px-6 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Show drafts if available -->
      <div v-if="drafts.length > 0" class="space-y-6">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">Your Drafts</h2>
            <p class="text-gray-600 mt-1">{{ drafts.length }} draft{{ drafts.length === 1 ? '' : 's' }} ready to schedule</p>
          </div>
          <UButton color="primary" @click="$emit('createPost')">
            Create New Draft
          </UButton>
        </div>
        
        <!-- Drafts Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <UIPublishPostCard
            v-for="draft in drafts"
            :key="draft.id"
            :post="draft"
            :show-header-menu="true"
            :show-footer-menu="true"
            :footer-menu-items="[
              { label: 'Publish Now', action: 'publish', icon: 'i-heroicons-paper-airplane', class: 'bg-gray-900 text-white rounded-lg px-2' },
              { label: 'Schedule', action: 'schedule', icon: 'i-heroicons-calendar', class: 'bg-gray-900 text-white rounded-lg px-2' },
              { label: 'Delete', action: 'delete', icon: 'i-heroicons-trash', class: 'bg-gray-900 text-white rounded-lg px-2' }
            ]"
            @header-menu-action="handleHeaderMenuAction(draft, $event)"
            @footer-menu-action="handleFooterMenuAction(draft, $event)"
            @edit="handleEditDraft"
          />
        </div>
      </div>
      
      <!-- Empty state -->
      <div v-else class="text-center py-16">
        <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Your Drafts</h2>
        <p class="text-gray-600 mb-6">Create and save draft posts to schedule later</p>
        <UButton color="primary" @click="$emit('createPost')">
          Create New Draft
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use localStorage composable
const { loadDrafts, saveDrafts, loadSentPosts, saveSentPosts } = useLocalStorage()

// Inject dependencies
const postScheduled = inject('postScheduled')
const editPost = inject('editPost')
const refreshDrafts = inject('refreshDrafts')
const draftsCount = inject('draftsCount')
const sentCount = inject('sentCount')
const toast = useToast()

// Emits
const emit = defineEmits(['createPost', 'edit-post'])

// Reactive data
const drafts = ref([])

// Load drafts on mount
onMounted(() => {
  drafts.value = loadDrafts()
})

// Watch refresh trigger to reload drafts when updated
watch(refreshDrafts, async () => {
  drafts.value = loadDrafts()
  
  // Wait for next tick to ensure DOM updates
  await nextTick()
}, { immediate: false })

// Handle header menu actions (like duplicate)
const handleHeaderMenuAction = (post, action) => {
  if (action === 'duplicate') {
    const duplicatedDraft = {
      ...post,
      id: `draft-${Date.now()}`,
      createdAt: new Date(),
      content: post.content + ' (Copy)'
    }
    
    drafts.value.push(duplicatedDraft)
    
    // Save updated drafts to localStorage immediately
    saveDrafts(drafts.value)
    
    // Update drafts count
    if (draftsCount) {
      draftsCount.value = drafts.value.length
    }
    
    toast.add({
      title: 'Draft Duplicated',
      description: 'Draft has been duplicated successfully.',
      color: 'blue'
    })
  }
}

// Handle footer menu actions
const handleFooterMenuAction = async (post, action) => {
  if (action === 'publish') {
    handlePublishNow(post)
  } else if (action === 'schedule') {
    await moveToSchedule(post)
  } else if (action === 'delete') {
    deleteDraft(post)
  }
}

// Move draft to schedule
const moveToSchedule = async (draft) => {
  try {
    // Use date and time from draft if available
    let scheduleDate = draft.date
    let scheduleTime = draft.time
    
    // Fallback to tomorrow 10:00 AM if draft doesn't have date/time
    if (!scheduleDate || !scheduleTime) {
      const today = new Date()
      const tomorrow = new Date(today)
      tomorrow.setDate(today.getDate() + 1)
      scheduleDate = tomorrow.toISOString().split('T')[0]
      scheduleTime = '10:00 AM'
    }
    
    const postData = {
      content: draft.content,
      files: draft.files || [],
      date: scheduleDate,
      time: scheduleTime
    }
    
    // Call the postScheduled function
    if (postScheduled) {
      postScheduled(postData)
    } else {
      throw new Error('postScheduled function not available')
    }
    
    // Remove from drafts
    const draftIndex = drafts.value.findIndex(d => d.id === draft.id)
    if (draftIndex > -1) {
      drafts.value.splice(draftIndex, 1)
    }
    
    // Save updated drafts to localStorage immediately
    saveDrafts(drafts.value)
    
    // Update drafts count
    if (draftsCount) {
      draftsCount.value = drafts.value.length
    }
    
    // Show success message
    toast.add({
      title: 'Draft Scheduled!',
      description: `Your draft has been scheduled for ${scheduleDate} at ${scheduleTime}`,
      color: 'green'
    })
    
    // Add longer delay before navigation to ensure data is processed and saved
    setTimeout(() => {
      navigateTo('/publish')
    }, 1000)
    
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to schedule draft. Please try again.',
      color: 'red'
    })
  }
}

// Delete draft
const deleteDraft = (draft) => {
  const draftIndex = drafts.value.findIndex(d => d.id === draft.id)
  if (draftIndex > -1) {
    drafts.value.splice(draftIndex, 1)
    
    // Save updated drafts to localStorage immediately
    saveDrafts(drafts.value)
    
    // Update drafts count
    if (draftsCount) {
      draftsCount.value = drafts.value.length
    }
    
    toast.add({
      title: 'Draft Deleted',
      description: 'Draft has been deleted successfully.',
      color: 'yellow'
    })
  }
}

// Handle publish now for drafts
const handlePublishNow = (draft) => {
  try {
    // Load current sent posts
    const currentSentPosts = loadSentPosts()
    
    // Create sent post object
    const sentPost = {
      ...draft,
      id: `sent-${Date.now()}`,
      publishedAt: new Date(),
      status: 'sent',
      originalDraftId: draft.id
    }
    
    // Add to sent posts
    currentSentPosts.push(sentPost)
    saveSentPosts(currentSentPosts)
    
    // Remove from drafts
    const draftIndex = drafts.value.findIndex(d => d.id === draft.id)
    if (draftIndex > -1) {
      drafts.value.splice(draftIndex, 1)
    }
    
    // Save updated drafts to localStorage immediately
    saveDrafts(drafts.value)
    
    // Update counters
    if (draftsCount) {
      draftsCount.value = drafts.value.length
    }
    if (sentCount) {
      sentCount.value = currentSentPosts.length
    }
    
    // Show success message
    toast.add({
      title: 'Post Published!',
      description: 'Your draft has been published immediately.',
      color: 'green'
    })
    
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to publish post. Please try again.',
      color: 'red'
    })
  }
}

// Handle edit draft
const handleEditDraft = (draft) => {
  emit('edit-post', draft)
}
</script> 