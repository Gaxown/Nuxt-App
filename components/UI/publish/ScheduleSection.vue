<template>
  <div class="px-6 py-8">
    <div class="max-w-4xl mx-auto">
      <!-- Set a posting goal banner -->
      <div class="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div class="flex items-center space-x-2">
          <UIcon name="i-heroicons-plus" class="w-5 h-5 text-blue-600" />
          <span class="text-blue-800 font-medium">Set a posting goal</span>
        </div>
      </div>

      <!-- Schedule -->
      <div class="space-y-8">
        <!-- Dynamic Days -->
        <div v-for="day in schedule" :key="day.id" class="bg-gray-50 rounded-xl p-6">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-semibold text-gray-900">{{ day.title }}</h2>
            <UButton 
              color="green" 
              variant="solid" 
              icon="i-heroicons-plus" 
              size="md"
              class="bg-green-600 hover:bg-green-700 text-white"
              @click="addTimeSlot(day.id)"
            >
              Add Time Slot
            </UButton>
          </div>
          
          <div class="space-y-3">
            <UIPublishScheduleItem 
              v-for="slot in day.timeSlots" 
              :key="slot.id"
              :date="day.date" 
              :time="slot.time"
              :post="slot.post"
              :slot-id="slot.id || ''"
              @create-post="handleCreatePost"
              @remove="removeTimeSlot(day.id, slot.id)"
              @update-time="updateTimeSlot(day.id, slot.id, $event)"
              @publish-now="handlePublishNow"
              @edit-post="handleEditPost"
              @show-post-options="handleShowPostOptions"
              @move-to-draft="moveToDraft"
              @delete-post="deletePost"
              @duplicate-post="handleDuplicatePost"
            />
          </div>
        </div>
        
        <!-- Infinite Scroll Trigger -->
        <div ref="loadTriggerRef" class="flex justify-center py-8">
          <div v-if="isLoading" class="flex items-center space-x-3 text-gray-600">
            <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span class="text-sm">Loading more days...</span>
          </div>
          <div v-else class="flex flex-col items-center space-y-4">
            <div class="text-sm text-gray-500 text-center">
              <UIcon name="i-heroicons-arrow-down" class="w-4 h-4 mx-auto mb-2" />
              Scroll down to load more days
            </div>
            <UButton 
              color="gray" 
              variant="outline" 
              size="sm"
              @click="loadMoreDays"
            >
              Load More Days
            </UButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Use localStorage composable
const { loadScheduledPosts, saveScheduledPosts, getDefaultSchedule } = useLocalStorage()

// Inject dependencies
const queueCount = inject('queueCount')
const draftsCount = inject('draftsCount')
const sentCount = inject('sentCount')
const refreshQueue = inject('refreshQueue')
const toast = useToast()

// Emits
const emit = defineEmits(['createPost', 'editPost'])

// Reactive data
const schedule = ref([])
const allPosts = ref([])
const slotIdCounter = ref(6)
const originatingSlot = ref(null)
const isLoading = ref(false)
const loadTriggerRef = ref(null)

// Method to load all posts - define this first
const loadAllPosts = async () => {
  try {
    const savedSchedule = loadScheduledPosts() || []
    
    // Check if saved data has old dates (before today)
    const today = new Date().toISOString().split('T')[0]
    const hasOldDates = savedSchedule.some(day => day.date < today)
    
    // If data has old dates, reset to default
    if (hasOldDates || !Array.isArray(savedSchedule) || savedSchedule.length === 0) {
      schedule.value = getDefaultSchedule()
      saveScheduledPosts(schedule.value)
    } else {
      schedule.value = savedSchedule
    }
    
    // Initialize slotIdCounter based on existing slots
    let maxId = 0
    schedule.value.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.id > maxId) {
          maxId = slot.id
        }
      })
    })
    slotIdCounter.value = maxId + 1
    
    // Count total scheduled posts for queue
    let totalPosts = 0
    schedule.value.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.post) totalPosts++
      })
    })
    
    // Update queue count
    if (queueCount) {
      queueCount.value = totalPosts
    }
    
    // Update allPosts array for calendar view
    allPosts.value = []
    schedule.value.forEach(day => {
      day.timeSlots.forEach(slot => {
        if (slot.post) {
          allPosts.value.push({
            ...slot.post,
            date: day.date,
            time: slot.time
          })
        }
      })
    })
  } catch (error) {
    console.error('Error loading posts:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load posts. Please try again.',
      color: 'red'
    })
  }
}

// Setup infinite scroll
const setupInfiniteScroll = () => {
  const observer = new IntersectionObserver((entries) => {
    const [entry] = entries
    if (entry.isIntersecting && !isLoading.value) {
      loadMoreDays()
    }
  }, {
    rootMargin: '100px'
  })
  
  // Wait for DOM to be ready
  nextTick(() => {
    if (loadTriggerRef.value) {
      observer.observe(loadTriggerRef.value)
    }
  })
  
  // Cleanup on unmount
  onUnmounted(() => {
    observer.disconnect()
  })
}

// Initialize data and setup watchers after functions are defined
onMounted(() => {
  loadAllPosts()
  setupInfiniteScroll()
})

// Watch for refresh triggers after functions are defined
watch(refreshQueue, async () => {
  if (refreshQueue.value) {
    await loadAllPosts()
  }
}, { immediate: true })

// Watch schedule changes
watch(schedule, () => {
  // Sort schedule by date before saving
  schedule.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  saveScheduledPosts(schedule.value)
}, { deep: true })

// Load more days
const loadMoreDays = async () => {
  isLoading.value = true
  
  // Get the last date in current schedule
  const lastDay = schedule.value[schedule.value.length - 1]
  const lastDate = new Date(lastDay.date)
  
  // Generate 7 more days
  const newDays = []
  for (let i = 1; i <= 7; i++) {
    const newDate = new Date(lastDate)
    newDate.setDate(lastDate.getDate() + i)
    
    const newDay = {
      id: `day-${Date.now()}-${i}`,
      title: formatDayTitle(newDate.toISOString().split('T')[0]),
      date: newDate.toISOString().split('T')[0],
      timeSlots: [
        {
          id: slotIdCounter.value++,
          time: '9:00 AM',
          post: null
        },
        {
          id: slotIdCounter.value++,
          time: '2:00 PM',
          post: null
        }
      ]
    }
    
    newDays.push(newDay)
  }
  
  // Add new days to schedule
  schedule.value.push(...newDays)
  
  // Simulate loading delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500))
  
  isLoading.value = false
}

// Methods
const handleCreatePost = (data) => {
  // Store originating slot info if slotId is provided
  if (data.slotId) {
    originatingSlot.value = {
      slotId: data.slotId,
      originalDate: data.date,
      originalTime: data.time
    }
  } else {
    originatingSlot.value = null
  }
  
  emit('createPost', data)
}

const addTimeSlot = (dayId) => {
  const day = schedule.value.find(d => d.id === dayId)
  if (day) {
    // Generate random time for demo
    const hours = Math.floor(Math.random() * 12) + 1
    const minutes = Math.floor(Math.random() * 60)
    const ampm = Math.random() > 0.5 ? 'AM' : 'PM'
    const time = `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`
    
    day.timeSlots.push({
      id: slotIdCounter.value++,
      time: time,
      post: null
    })
  }
}

const removeTimeSlot = (dayId, slotId) => {
  const day = schedule.value.find(d => d.id === dayId)
  if (day) {
    const index = day.timeSlots.findIndex(slot => slot.id === slotId)
    if (index > -1) {
      // Check if slot has a post and update counter
      const slot = day.timeSlots[index]
      if (slot.post) {
        // Use already injected queueCount
        if (queueCount && queueCount.value > 0) {
          queueCount.value--
        }
      }
      day.timeSlots.splice(index, 1)
    }
  }
}

const updateTimeSlot = (dayId, slotId, newTime) => {
  const day = schedule.value.find(d => d.id === dayId)
  if (day) {
    const slot = day.timeSlots.find(s => s.id === slotId)
    if (slot) {
      slot.time = newTime
    }
  }
}

// Post management methods
const handlePublishNow = (post) => {
  try {
    // Use localStorage to save to sent posts
    const { loadSentPosts, saveSentPosts } = useLocalStorage()
    
    // Load current sent posts
    const currentSentPosts = loadSentPosts()
    
    // Create sent post object
    const sentPost = {
      ...post,
      id: `sent-${Date.now()}`,
      publishedAt: new Date(),
      status: 'sent',
      originalScheduledId: post.id
    }
    
    // Add to sent posts
    currentSentPosts.push(sentPost)
    saveSentPosts(currentSentPosts)
    
    // Update counters
    if (sentCount) {
      sentCount.value = currentSentPosts.length
    }
    if (queueCount && queueCount.value > 0) {
      queueCount.value--
    }
    
    // Remove from schedule
    for (const day of schedule.value) {
      for (const slot of day.timeSlots) {
        if (slot.post && slot.post.id === post.id) {
          slot.post = null
          break
        }
      }
    }
    
    // Add toast notification
    toast.add({
      title: 'Post Published!',
      description: 'Your post has been published immediately.',
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

const handleEditPost = (post) => {
  // Handle post editing
  emit('editPost', post)
}

const handleShowPostOptions = (post) => {
  // Handle post options menu
  // Add functionality here for post options menu
}

// Move scheduled post to drafts
const moveToDraft = (post) => {
  try {
    // Use already injected dependencies (not inject() again)
    const { saveDrafts, loadDrafts } = useLocalStorage()
    
    // Load current drafts
    const currentDrafts = loadDrafts()
    
    // Create draft object
    const draftPost = {
      ...post,
      id: `draft-${Date.now()}`,
      createdAt: new Date(),
      status: 'draft'
    }
    
    // Add to drafts
    currentDrafts.push(draftPost)
    saveDrafts(currentDrafts)
    
    // Remove from schedule
    for (const day of schedule.value) {
      for (const slot of day.timeSlots) {
        if (slot.post && slot.post.id === post.id) {
          slot.post = null
          break
        }
      }
    }
    
    // Update counters using already injected refs
    if (draftsCount) {
      draftsCount.value = currentDrafts.length
    }
    if (queueCount && queueCount.value > 0) {
      queueCount.value--
    }
    
    // Show success message
    toast.add({
      title: 'Moved to Drafts!',
      description: 'Post has been moved to drafts successfully.',
      color: 'blue'
    })
    
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to move post to drafts. Please try again.',
      color: 'red'
    })
  }
}

// Delete scheduled post
const deletePost = (post) => {
  try {
    // Remove from schedule
    for (const day of schedule.value) {
      for (const slot of day.timeSlots) {
        if (slot.post && slot.post.id === post.id) {
          slot.post = null
          break
        }
      }
    }
    
    // Update queue count using already injected ref
    if (queueCount && queueCount.value > 0) {
      queueCount.value--
    }
    
    // Show success message
    toast.add({
      title: 'Post Deleted!',
      description: 'Post has been deleted successfully.',
      color: 'yellow'
    })
    
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to delete post. Please try again.',
      color: 'red'
    })
  }
}

// Duplicate scheduled post
const handleDuplicatePost = (originalPost) => {
  // Instead of directly creating a duplicate, emit createPost with the original post data
  emit('createPost', {
    content: originalPost.content,
    files: originalPost.files,
    tags: originalPost.tags,
    isDuplicate: true,
    originalPost: originalPost
  })
}

// Listen for post creation events
const handlePostScheduled = (postData) => {
  // Create the post object first
  const newPost = {
    ...postData,
    id: `post-${Date.now()}`,
    createdAt: new Date(),
    status: 'scheduled',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    username: 'huntergon077'
  }
  
  // Check if this post came from an existing slot
  if (originatingSlot.value && originatingSlot.value.slotId) {
    // Find the originating slot
    let foundOriginatingSlot = false
    
    for (const day of schedule.value) {
      for (const slot of day.timeSlots) {
        if (slot.id === originatingSlot.value.slotId) {
          // Update the slot's time and add the post
          slot.time = postData.time
          slot.post = newPost
          foundOriginatingSlot = true
          
          // Update queue count
          if (queueCount) {
            queueCount.value++
          }
          
          // Clear originating slot tracking
          originatingSlot.value = null
          
          // Force immediate save to localStorage
          saveScheduledPosts(schedule.value)
          return
        }
      }
    }
    
    // If originating slot wasn't found, fall back to normal logic
    if (!foundOriginatingSlot) {
      originatingSlot.value = null
    }
  }
  
  // Normal logic for when no originating slot or slot not found
  // Try to find the day first
  let targetDay = schedule.value.find(d => d.date === postData.date)
  
  if (targetDay) {
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
          id: slotIdCounter.value++,
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
              id: slotIdCounter.value++,
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
    
    // Update queue count
    if (queueCount) {
      queueCount.value++
    }
  } else {
    // Day doesn't exist - create new day with the time slot
    const formattedTitle = formatDayTitle(postData.date)
    
    targetDay = {
      id: `day-${Date.now()}`,
      title: formattedTitle,
      date: postData.date,
      timeSlots: [{
        id: slotIdCounter.value++,
        time: postData.time,
        post: newPost
      }]
    }
    
    schedule.value.push(targetDay)
    
    // Sort schedule by date to maintain proper order
    schedule.value.sort((a, b) => new Date(a.date) - new Date(b.date))
    
    // Update queue count
    if (queueCount) {
      queueCount.value++
    }
  }
  
  // Force immediate save to localStorage after any changes
  saveScheduledPosts(schedule.value)
}

// Handle post updates
const handlePostUpdated = (updatedPost) => {
  // Find the original post in schedule
  let originalDay = null
  let originalSlot = null
  
  for (const day of schedule.value) {
    for (const slot of day.timeSlots) {
      if (slot.post && slot.post.id === updatedPost.id) {
        originalDay = day
        originalSlot = slot
        break
      }
    }
    if (originalDay) break
  }
  
  if (!originalDay || !originalSlot) return
  
  // Create updated post object with ALL updated data
  const updatedPostObj = {
    ...originalSlot.post,
    content: updatedPost.content,
    files: updatedPost.files,
    tags: updatedPost.tags,
    date: updatedPost.date,
    time: updatedPost.time,
    updatedAt: new Date()
  }
  
  // Check if date or time changed
  if (updatedPost.date !== originalDay.date || updatedPost.time !== originalSlot.time) {
    // Remove post from original slot
    originalSlot.post = null
    
    // Find or create target day
    let targetDay = schedule.value.find(d => d.date === updatedPost.date)
    
    if (targetDay) {
      // Day exists - check if time slot exists
      let existingSlot = targetDay.timeSlots.find(slot => slot.time === updatedPost.time)
      
      if (existingSlot) {
        // Time slot exists - replace the post
        existingSlot.post = updatedPostObj
      } else {
        // Time slot doesn't exist - create new one
        targetDay.timeSlots.push({
          id: slotIdCounter.value++,
          time: updatedPost.time,
          post: updatedPostObj
        })
      }
    } else {
      // Day doesn't exist - create new day with the time slot
      targetDay = {
        id: `day-${Date.now()}`,
        title: formatDayTitle(updatedPost.date),
        date: updatedPost.date,
        timeSlots: [{
          id: slotIdCounter.value++,
          time: updatedPost.time,
          post: updatedPostObj
        }]
      }
      schedule.value.push(targetDay)
    }
  } else {
    // Same date/time - just update the content in place
    originalSlot.post = updatedPostObj
  }
  
  // Force immediate save to localStorage
  saveScheduledPosts(schedule.value)
}

// Helper function to format day title
const formatDayTitle = (date) => {
  const dateObj = new Date(date)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  
  // Calculate days difference
  const timeDiff = dateObj.getTime() - today.getTime()
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24))
  
  if (dateObj.toDateString() === today.toDateString()) {
    return `Today, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else if (dateObj.toDateString() === tomorrow.toDateString()) {
    return `Tomorrow, ${dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
  } else if (daysDiff > 0 && daysDiff <= 7) {
    // Show day name for this week
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    })
  } else {
    // Show date with year for far future dates
    return dateObj.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: dateObj.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    })
  }
}

// Clear originating slot tracking
const clearOriginatingSlot = () => {
  originatingSlot.value = null
}

// Expose method to parent component
defineExpose({
  handlePostScheduled,
  handlePostUpdated,
  clearOriginatingSlot,
  moveToDraft,
  deletePost,
  handleDuplicatePost,
  loadAllPosts
})
</script> 