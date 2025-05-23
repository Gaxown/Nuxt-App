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
              color="primary" 
              variant="solid" 
              icon="i-heroicons-plus" 
              size="md"
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
              :slot-id="slot.id"
              @create-post="handleCreatePost"
              @remove="removeTimeSlot(day.id, slot.id)"
              @update-time="updateTimeSlot(day.id, slot.id, $event)"
              @publish-now="handlePublishNow"
              @edit-post="handleEditPost"
              @show-post-options="handleShowPostOptions"
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

// Emits
const emit = defineEmits(['createPost', 'editPost'])

// Reactive schedule data - load from localStorage
const schedule = ref([])

// Counter for unique IDs
const slotIdCounter = ref(6)

// Track originating slot for new posts
const originatingSlot = ref(null)

// Infinite scroll
const isLoading = ref(false)
const loadTriggerRef = ref(null)

// Load data on mount
onMounted(() => {
  const savedSchedule = loadScheduledPosts()
  
  // Check if saved data has old dates (before today)
  const today = new Date().toISOString().split('T')[0]
  const hasOldDates = savedSchedule.some(day => day.date < today)
  
  // If data has old dates, reset to default
  if (hasOldDates || savedSchedule.length === 0) {
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
  
  // Update queue count via provided function
  const queueCount = inject('queueCount')
  if (queueCount) {
    queueCount.value = totalPosts
  }
  
  // Setup infinite scroll observer
  setupInfiniteScroll()
})

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

// Save to localStorage whenever schedule changes
watch(schedule, () => {
  // Sort schedule by date before saving
  schedule.value.sort((a, b) => new Date(a.date) - new Date(b.date))
  saveScheduledPosts(schedule.value)
}, { deep: true })

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
        const queueCount = inject('queueCount')
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
  // Move post to sent
  const sentCount = inject('sentCount')
  const queueCount = inject('queueCount')
  
  if (sentCount) sentCount.value++
  if (queueCount && queueCount.value > 0) queueCount.value--
  
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
  const toast = useToast()
  toast.add({
    title: 'Post Published!',
    description: 'Your post has been published immediately.',
    color: 'green'
  })
}

const handleEditPost = (post) => {
  // Handle post editing
  emit('editPost', post)
}

const handleShowPostOptions = (post) => {
  // Handle post options menu
  // Add functionality here for post options menu
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
          const queueCount = inject('queueCount')
          if (queueCount) {
            queueCount.value++
          }
          
          // Clear originating slot tracking
          originatingSlot.value = null
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
    // Day exists - check if time slot exists
    let existingSlot = targetDay.timeSlots.find(slot => slot.time === postData.time)
    
    if (existingSlot) {
      // Time slot exists - just update the post (replace existing)
      const wasEmpty = !existingSlot.post
      existingSlot.post = newPost
      
      // Update queue count only if slot was empty before
      if (wasEmpty) {
        const queueCount = inject('queueCount')
        if (queueCount) {
          queueCount.value++
        }
      }
    } else {
      // Time slot doesn't exist - create new one
      targetDay.timeSlots.push({
        id: slotIdCounter.value++,
        time: postData.time,
        post: newPost
      })
      
      // Update queue count
      const queueCount = inject('queueCount')
      if (queueCount) {
        queueCount.value++
      }
    }
  } else {
    // Day doesn't exist - create new day with the time slot
    targetDay = {
      id: `day-${Date.now()}`,
      title: formatDayTitle(postData.date),
      date: postData.date,
      timeSlots: [{
        id: slotIdCounter.value++,
        time: postData.time,
        post: newPost
      }]
    }
    schedule.value.push(targetDay)
    
    // Update queue count
    const queueCount = inject('queueCount')
    if (queueCount) {
      queueCount.value++
    }
  }
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
    date: updatedPost.date,  // Make sure to update the date
    time: updatedPost.time,  // Make sure to update the time
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
  clearOriginatingSlot
})
</script> 