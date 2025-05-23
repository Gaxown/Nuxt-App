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
              { label: 'Schedule', action: 'schedule', icon: 'i-heroicons-calendar' },
              { label: 'Delete', action: 'delete', icon: 'i-heroicons-trash', color: 'red' }
            ]"
            @header-menu-action="handleHeaderMenuAction(draft, $event)"
            @footer-menu-action="handleFooterMenuAction(draft, $event)"
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
const { loadDrafts, saveDrafts } = useLocalStorage()

// Inject dependencies
const postScheduled = inject('postScheduled')
const draftsCount = inject('draftsCount')
const toast = useToast()

// Emits
defineEmits(['createPost'])

// Reactive data
const drafts = ref([])

// Load drafts on mount
onMounted(() => {
  drafts.value = loadDrafts()
})

// Watch drafts and save to localStorage
watch(drafts, (newDrafts) => {
  saveDrafts(newDrafts)
}, { deep: true })

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
  if (action === 'schedule') {
    await moveToSchedule(post)
  } else if (action === 'delete') {
    deleteDraft(post)
  }
}

// Move draft to schedule
const moveToSchedule = async (draft) => {
  try {
    console.log('🟡 DraftsSection: Starting moveToSchedule for draft:', draft.id)
    
    // Create post data for scheduling with default date/time
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    const postData = {
      content: draft.content,
      files: draft.files || [],
      date: tomorrow.toISOString().split('T')[0], // Tomorrow's date
      time: '10:00 AM' // Default time
    }
    
    console.log('🟡 DraftsSection: Calling postScheduled with data:', postData)
    
    // Call the postScheduled function
    if (postScheduled) {
      postScheduled(postData)
    }
    
    // Remove from drafts
    const draftIndex = drafts.value.findIndex(d => d.id === draft.id)
    if (draftIndex > -1) {
      drafts.value.splice(draftIndex, 1)
      console.log('🟡 DraftsSection: Draft removed from drafts array')
    }
    
    // Update drafts count
    if (draftsCount) {
      draftsCount.value = drafts.value.length
      console.log('🟡 DraftsSection: Updated drafts count to:', draftsCount.value)
    }
    
    // Show success message
    toast.add({
      title: 'Draft Scheduled!',
      description: `Your draft has been scheduled for tomorrow at 10:00 AM`,
      color: 'green'
    })
    
    // Add delay before navigation to ensure data is processed
    setTimeout(() => {
      console.log('🟡 DraftsSection: Navigating to /publish/queue')
      navigateTo('/publish/queue')
    }, 300)
    
  } catch (error) {
    console.error('🔴 DraftsSection: Error in moveToSchedule:', error)
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
</script> 