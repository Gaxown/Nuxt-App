<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <UIPublishSocialHeader @new-post="openNewPostModal" />

    <!-- Sub Navigation -->
    <UIPublishSubNavigation 
      :queue-count="queueCount"
      :drafts-count="draftsCount" 
      :sent-count="sentCount"
    />

    <!-- Main Content Slot -->
    <slot />

    <!-- Floating Help Button -->
    <UIPublishHelpButton @help="openHelp" />

    <!-- Create Post Modal -->
    <UIPublishCreatePostModal 
      v-model="showNewPostModal"
      :selected-date="selectedDate"
      :selected-time="selectedTime"
      :edit-mode="isEditMode"
      :edit-post="editingPost"
      @post-scheduled="handlePostScheduled"
      @draft-saved="handleDraftSaved"
      @post-updated="handlePostUpdated"
    />
  </div>
</template>

<script setup>
// Page meta
useHead({
  title: 'Social Media Scheduler - Publish'
})

// Use localStorage composable
const { loadCounters, saveCounters, loadDrafts, saveDrafts } = useLocalStorage()

// Reactive data
const queueCount = ref(0)
const draftsCount = ref(0)
const sentCount = ref(0)

const showNewPostModal = ref(false)
const selectedDate = ref('')
const selectedTime = ref('')

// Edit mode data
const isEditMode = ref(false)
const editingPost = ref(null)

// Reference to schedule section
const scheduleSectionRef = ref(null)

// Drafts storage
const drafts = ref([])

// Load data on mount
onMounted(() => {
  const counters = loadCounters()
  queueCount.value = counters.queue
  draftsCount.value = counters.drafts
  sentCount.value = counters.sent
  
  drafts.value = loadDrafts()
})

// Save counters whenever they change
watch([queueCount, draftsCount, sentCount], () => {
  saveCounters({
    queue: queueCount.value,
    drafts: draftsCount.value,
    sent: sentCount.value
  })
})

// Watch modal close to clear originating slot tracking
watch(showNewPostModal, (isOpen) => {
  if (!isOpen) {
    // Modal closed - clear originating slot tracking
    const scheduleSection = scheduleSectionRef.value
    if (scheduleSection?.clearOriginatingSlot) {
      scheduleSection.clearOriginatingSlot()
    }
  }
})

// Methods
const openNewPostModal = () => {
  // Reset date and time to defaults when opening from header
  selectedDate.value = ''
  selectedTime.value = ''
  isEditMode.value = false
  editingPost.value = null
  showNewPostModal.value = true
}

const handleCreatePost = (data) => {
  selectedDate.value = data.date
  selectedTime.value = data.time
  isEditMode.value = false
  editingPost.value = null
  showNewPostModal.value = true
}

const handleEditPost = (post) => {
  // Ensure we use the most up-to-date post data
  selectedDate.value = post.date
  selectedTime.value = post.time
  isEditMode.value = true
  // Create a fresh copy of the post to avoid reference issues
  editingPost.value = { ...post }
  showNewPostModal.value = true
}

const handlePostScheduled = (postData) => {
  // Get schedule section from provided reference
  const scheduleSection = scheduleSectionRef.value
  if (scheduleSection?.handlePostScheduled) {
    scheduleSection.handlePostScheduled(postData)
  }
  
  // Don't manually increment queue count - let ScheduleSection handle it
  
  // Show success notification
  const toast = useToast()
  toast.add({
    title: 'Post Scheduled!',
    description: `Your post has been scheduled for ${postData.date} at ${postData.time}`,
    color: 'green'
  })
}

const handleDraftSaved = (draftData) => {
  console.log('Draft saved:', draftData)
  
  // Add unique ID and timestamp to draft
  const draft = {
    ...draftData,
    id: `draft-${Date.now()}`,
    createdAt: new Date(),
    status: 'draft'
  }
  
  // Add to drafts array
  drafts.value.push(draft)
  
  // Save to localStorage
  saveDrafts(drafts.value)
  
  // Update drafts count
  draftsCount.value = drafts.value.length
  
  // Show success notification
  const toast = useToast()
  toast.add({
    title: 'Draft Saved!',
    description: 'Your post has been saved to drafts.',
    color: 'blue'
  })
}

const handlePostUpdated = (postData) => {
  console.log('Post updated:', postData)
  
  // Get schedule section and update the post
  const scheduleSection = scheduleSectionRef.value
  if (scheduleSection?.handlePostUpdated) {
    scheduleSection.handlePostUpdated(postData)
  }
  
  // If the currently editing post is the same one being updated, refresh its reference
  if (editingPost.value && editingPost.value.id === postData.id) {
    editingPost.value = {
      ...editingPost.value,
      content: postData.content,
      files: postData.files,
      date: postData.date,
      time: postData.time,
      updatedAt: new Date()
    }
  }
  
  // Show success notification
  const toast = useToast()
  toast.add({
    title: 'Post Updated!',
    description: `Your post has been updated for ${postData.date} at ${postData.time}`,
    color: 'blue'
  })
}

const openHelp = () => {
  const toast = useToast()
  toast.add({
    title: 'Help & Support',
    description: 'Need help? Check our documentation or contact support.',
    color: 'blue'
  })
}

// Provide methods to child pages
provide('createPost', handleCreatePost)
provide('editPost', handleEditPost)
provide('postScheduled', handlePostScheduled)
provide('setScheduleSection', (ref) => { 
  scheduleSectionRef.value = ref 
})
provide('queueCount', queueCount)
provide('draftsCount', draftsCount)
provide('sentCount', sentCount)
</script> 