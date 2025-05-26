<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <UIPublishSocialHeader @new-post="openNewPostModal" />

    <!-- Sub Navigation - Hide on calendar page -->
    <UIPublishSubNavigation 
      v-if="!isCalendarPage"
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

// Use route to check current page
const route = useRoute()
const isCalendarPage = computed(() => route.path === '/publish/calendar')

// Use localStorage composable
const { loadCounters, saveCounters, loadDrafts, saveDrafts, loadScheduledPosts, saveScheduledPosts } = useLocalStorage()

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
const refreshDrafts = ref(0) // Counter to trigger refresh
const refreshQueue = ref(0) // Counter to trigger queue refresh
const refreshSent = ref(0) // Counter to trigger sent refresh

// Load data on mount
onMounted(() => {
  // Load initial data
  drafts.value = loadDrafts()
  draftsCount.value = drafts.value.length
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
  // If data is provided (from calendar or duplicate), use it
  if (data && typeof data === 'object') {
    selectedDate.value = data.date || ''
    selectedTime.value = data.time || ''
    
    // If this is a duplicate post, set the edit post data
    if (data.isDuplicate && data.originalPost) {
      editingPost.value = {
        content: data.content,
        files: data.files,
        tags: data.tags,
        date: selectedDate.value,
        time: selectedTime.value,
        status: 'draft'
      }
    } else {
      editingPost.value = null
    }
  } else {
    selectedDate.value = ''
    selectedTime.value = ''
    editingPost.value = null
  }
  
  isEditMode.value = false
  showNewPostModal.value = true
  
  // Force refresh of calendar if we're on that view
  const route = useRoute()
  if (route.path.includes('/publish/calendar')) {
    refreshQueue.value++
  }
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
  // Load current scheduled posts
  let scheduledPosts = loadScheduledPosts() || []
  
  // Create new post object
  const newPost = {
    ...postData,
    id: postData.id || `post-${Date.now()}`,
    createdAt: new Date(),
    status: 'scheduled'
  }
  
  // If scheduledPosts is not an array, initialize it
  if (!Array.isArray(scheduledPosts)) {
    scheduledPosts = []
  }
  
  // Find target day
  let targetDay = scheduledPosts.find(d => d.date === postData.date)
  
  if (targetDay) {
    // Ensure timeSlots exists
    if (!Array.isArray(targetDay.timeSlots)) {
      targetDay.timeSlots = []
    }
    
    // Check if there's an existing empty slot at this time
    let existingSlot = targetDay.timeSlots.find(slot => slot.time === postData.time && !slot.post)
    
    if (existingSlot) {
      // Use existing empty slot
      existingSlot.post = newPost
    } else {
      // Check if there's a slot with this time but has a post
      let occupiedSlot = targetDay.timeSlots.find(slot => slot.time === postData.time && slot.post)
      
      if (!occupiedSlot) {
        // No slot at this time exists at all, create new one
        const newSlot = {
          id: Date.now(),
          time: postData.time,
          post: newPost
        }
        targetDay.timeSlots.push(newSlot)
      } else {
        // Find next available time slot
        let time = new Date(`${postData.date} ${postData.time}`)
        let found = false
        
        while (!found) {
          time.setMinutes(time.getMinutes() + 30)
          const newTimeStr = time.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })
          
          // Check if this new time is available
          if (!targetDay.timeSlots.some(slot => slot.time === newTimeStr)) {
            const newSlot = {
              id: Date.now(),
              time: newTimeStr,
              post: newPost
            }
            targetDay.timeSlots.push(newSlot)
            found = true
          }
        }
      }
    }
    
    // Sort time slots by time
    targetDay.timeSlots.sort((a, b) => {
      const timeA = new Date(`2000/01/01 ${a.time}`).getTime()
      const timeB = new Date(`2000/01/01 ${b.time}`).getTime()
      return timeA - timeB
    })
  } else {
    // Create new day
    targetDay = {
      id: `day-${Date.now()}`,
      title: formatDayTitle(postData.date),
      date: postData.date,
      timeSlots: [{
        id: Date.now(),
        time: postData.time,
        post: newPost
      }]
    }
    scheduledPosts.push(targetDay)
  }
  
  // Sort scheduledPosts by date
  scheduledPosts.sort((a, b) => new Date(a.date) - new Date(b.date))
  
  // Save to localStorage
  saveScheduledPosts(scheduledPosts)
  
  // Update queue count
  queueCount.value++
  
  // Close modal
  showNewPostModal.value = false
  
  // Force immediate refresh of the schedule section
  const scheduleSection = scheduleSectionRef.value
  if (scheduleSection?.loadAllPosts) {
    scheduleSection.loadAllPosts()
  }
  
  // Increment refresh counter to trigger watchers
  refreshQueue.value++
  
  // Show success toast
  const toast = useToast()
  toast.add({
    title: 'Post Scheduled!',
    description: `Your post has been scheduled for ${postData.time}`,
    color: 'green'
  })
}

const handleDraftSaved = (draftData) => {
  // Load current drafts
  const currentDrafts = loadDrafts()
  
  // Create new draft object
  const newDraft = {
    ...draftData,
    id: draftData.id || `draft-${Date.now()}`,
    createdAt: new Date(),
    status: 'draft'
  }
  
  // Add to drafts
  currentDrafts.push(newDraft)
  
  // Save to localStorage
  saveDrafts(currentDrafts)
  
  // Update drafts count
  draftsCount.value = currentDrafts.length
  
  // Close modal and refresh views
  showNewPostModal.value = false
  refreshDrafts.value++
  
  // Show success toast
  const toast = useToast()
  toast.add({
    title: 'Draft Saved!',
    description: 'Your draft has been saved successfully.',
    color: 'blue'
  })
}

const handlePostUpdated = (postData) => {
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
      tags: postData.tags,
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
provide('draftSaved', handleDraftSaved)
provide('refreshDrafts', refreshDrafts)
provide('refreshQueue', refreshQueue)
provide('refreshSent', refreshSent)
provide('setScheduleSection', (ref) => { 
  scheduleSectionRef.value = ref 
})
provide('queueCount', queueCount)
provide('draftsCount', draftsCount)
provide('sentCount', sentCount)

// Watch for schedule section changes and refresh data
watch(refreshQueue, async () => {
  // Get schedule section and refresh its data
  const scheduleSection = scheduleSectionRef.value
  if (scheduleSection?.loadAllPosts) {
    await scheduleSection.loadAllPosts()
  }
}, { immediate: true })

// Helper function to format day title
const formatDayTitle = (date) => {
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  const targetDate = new Date(date)
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  if (targetDate.toDateString() === today.toDateString()) {
    return `Today, ${months[targetDate.getMonth()]} ${targetDate.getDate()}`
  } else if (targetDate.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${months[targetDate.getMonth()]} ${targetDate.getDate()}`
  } else {
    return `${dayNames[targetDate.getDay()]}, ${months[targetDate.getMonth()]} ${targetDate.getDate()}`
  }
}
</script> 