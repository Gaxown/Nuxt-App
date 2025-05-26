<template>
  <div class="px-6 py-8">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="flex items-center justify-between mb-8">
        <div class="flex items-center space-x-4">
          <h1 class="text-2xl font-bold text-gray-900">Calendar</h1>
          
          <!-- View Mode Toggle -->
          <div class="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <UButton 
              :color="viewMode === 'weekly' ? 'primary' : 'gray'" 
              :variant="viewMode === 'weekly' ? 'solid' : 'ghost'"
              size="sm"
              @click="viewMode = 'weekly'"
            >
              Week
            </UButton>
            <UButton 
              :color="viewMode === 'monthly' ? 'primary' : 'gray'" 
              :variant="viewMode === 'monthly' ? 'solid' : 'ghost'"
              size="sm"
              @click="viewMode = 'monthly'"
            >
              Month
            </UButton>
          </div>
          
          <!-- Navigation -->
          <div class="flex items-center space-x-2">
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-chevron-left"
              @click="previousPeriod"
            />
            <h2 class="text-lg font-semibold text-gray-700 min-w-[300px] text-center">
              {{ currentPeriodRange }}
            </h2>
            <UButton 
              color="gray" 
              variant="ghost" 
              icon="i-heroicons-chevron-right"
              @click="nextPeriod"
            />
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <UButton 
            color="gray" 
            variant="outline" 
            icon="i-heroicons-calendar"
            @click="goToThisPeriod"
          >
            {{ viewMode === 'weekly' ? 'This Week' : 'This Month' }}
          </UButton>
          <UButton 
            color="primary" 
            icon="i-heroicons-plus"
            @click="createPost"
          >
            New Post
          </UButton>
        </div>
      </div>

      <!-- Calendar Content -->
      <div v-if="viewMode === 'weekly'" class="bg-white rounded-lg shadow border overflow-hidden">
        <!-- Weekly View -->
        <!-- Days of Week Header -->
        <div class="grid grid-cols-8 border-b bg-gray-50">
          <!-- Time column header -->
          <div class="p-4 text-center text-sm font-medium text-gray-500 border-r">
            Time
          </div>
          <!-- Day headers -->
          <div 
            v-for="day in weekDays" 
            :key="day.date"
            class="p-4 text-center border-r last:border-r-0"
            :class="{ 'bg-blue-50': day.isToday }"
          >
            <div class="text-sm font-medium text-gray-900">{{ day.dayName }}</div>
            <div 
              class="text-lg font-semibold mt-1"
              :class="{ 'text-blue-600': day.isToday, 'text-gray-900': !day.isToday }"
            >
              {{ day.dayNumber }}
            </div>
            <div 
              v-if="day.postsCount > 0"
              class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full mt-1 inline-block"
            >
              {{ day.postsCount }} posts
            </div>
            <!-- Add Post Button -->
            <UButton
              size="xs"
              color="primary"
              variant="ghost"
              icon="i-heroicons-plus"
              @click="createPostForDate(day.date)"
              class="mt-2 w-full"
            >
              Add
            </UButton>
          </div>
        </div>

        <!-- Time slots and posts -->
        <div class="max-h-[800px] overflow-y-auto">
          <div 
            v-for="hour in timeSlots" 
            :key="hour.time"
            class="grid grid-cols-8 border-b min-h-[60px]"
          >
            <!-- Time column -->
            <div class="p-2 border-r flex items-start justify-center"
                 :class="{ 
                   'bg-purple-50': hour.hour >= 0 && hour.hour <= 5,
                   'bg-yellow-50': hour.hour >= 6 && hour.hour <= 11,
                   'bg-blue-50': hour.hour >= 12 && hour.hour <= 17,
                   'bg-orange-50': hour.hour >= 18 && hour.hour <= 23
                 }"
            >
              <span class="text-xs font-medium"
                    :class="{ 
                      'text-purple-800': hour.hour >= 0 && hour.hour <= 5,
                      'text-yellow-800': hour.hour >= 6 && hour.hour <= 11,
                      'text-blue-800': hour.hour >= 12 && hour.hour <= 17,
                      'text-orange-800': hour.hour >= 18 && hour.hour <= 23
                    }"
              >{{ hour.display }}</span>
            </div>
            
            <!-- Day columns -->
            <div 
              v-for="day in weekDays" 
              :key="`${day.date}-${hour.time}`"
              class="border-r last:border-r-0 p-1 relative min-h-[60px] drop-zone"
              :class="{ 
                'bg-blue-25': day.isToday,
                'bg-green-100': isDragOver && dragOverSlot === `${day.date}-${hour.time}` && canDropHere(day.date, hour.time),
                'bg-red-100': isDragOver && dragOverSlot === `${day.date}-${hour.time}` && !canDropHere(day.date, hour.time),
                'bg-gray-100': isInThePast(day.date, hour.time),
                'opacity-50': isInThePast(day.date, hour.time)
              }"
              :title="isInThePast(day.date, hour.time) ? 'Cannot schedule posts in the past' : ''"
              @dragover.prevent="handleDragOver($event, day.date, hour.time)"
              @dragleave="handleDragLeave"
              @drop="handleDrop($event, day.date, hour.time)"
            >
              <!-- Posts for this time slot -->
              <div class="space-y-1">
                <div 
                  v-for="post in getPostsForTimeSlot(day.date, hour.time)" 
                  :key="post.id"
                  class="text-xs p-1 rounded-lg border-l-4 cursor-move hover:shadow-md transition-all duration-200 bg-white"
                  :class="[
                    getPostStatusClass(post.status),
                    { 'opacity-50': isDragging && draggedPost?.id === post.id }
                  ]"
                  draggable="true"
                  @dragstart="handleDragStart($event, post)"
                  @dragend="handleDragEnd"
                  @click="openPostDetails(post)"
                >
                  <div class="flex items-start space-x-1">
                    <!-- Drag handle -->
                    <div class="flex-shrink-0 mt-0.5">
                      <UIcon name="i-heroicons-bars-3" class="w-2 h-2 text-gray-400" />
                    </div>
                    
                    <!-- Text content (hidden if images exist) -->
                    <div 
                      v-if="!post.files || post.files.length === 0" 
                      class="flex-1"
                    >
                      <div class="font-semibold text-xs mb-0.5">{{ post.time }}</div>
                      <div class="text-gray-700 text-xs leading-tight line-clamp-2">{{ post.content }}</div>
                    </div>
                    
                    <!-- If images exist, show only time and small image -->
                    <div 
                      v-else 
                      class="flex items-center space-x-1 w-full"
                    >
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-xs text-gray-900">{{ post.time }}</div>
                        <div class="text-gray-500 text-xs truncate">{{ post.files.length }} image{{ post.files.length > 1 ? 's' : '' }}</div>
                      </div>
                      <!-- Small image thumbnail -->
                      <div class="flex-shrink-0">
                        <div v-if="post.files.length === 1">
                          <img 
                            :src="post.files[0].preview" 
                            :alt="post.files[0].name"
                            class="w-8 h-8 object-cover rounded border"
                          />
                        </div>
                        <div v-else class="relative">
                          <img 
                            :src="post.files[0].preview" 
                            :alt="post.files[0].name"
                            class="w-8 h-8 object-cover rounded border"
                          />
                          <div class="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
                            {{ post.files.length }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="viewMode === 'monthly'" class="bg-white rounded-lg shadow border overflow-hidden">
        <!-- Monthly View -->
        <!-- Month Header -->
        <div class="grid grid-cols-7 border-b bg-gray-50">
          <div 
            v-for="dayName in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
            :key="dayName"
            class="p-4 text-center text-sm font-medium text-gray-500 border-r last:border-r-0"
          >
            {{ dayName }}
          </div>
        </div>
        
        <!-- Month Days -->
        <div class="grid grid-cols-7">
          <div 
            v-for="day in monthDays" 
            :key="day.date"
            class="min-h-[120px] border-r border-b last:border-r-0 p-2 relative"
            :class="{ 
              'bg-gray-50': day.isOtherMonth,
              'bg-blue-50': day.isToday && !day.isOtherMonth,
              'bg-white': !day.isOtherMonth && !day.isToday
            }"
          >
            <!-- Day Number -->
            <div class="flex items-center justify-between mb-2">
              <span 
                class="text-sm font-medium"
                :class="{ 
                  'text-gray-400': day.isOtherMonth,
                  'text-blue-600': day.isToday && !day.isOtherMonth,
                  'text-gray-900': !day.isOtherMonth && !day.isToday
                }"
              >
                {{ day.dayNumber }}
              </span>
              
              <!-- Add Post Button -->
              <UButton
                v-if="!day.isOtherMonth"
                size="xs"
                color="primary"
                variant="ghost"
                icon="i-heroicons-plus"
                @click="createPostForDate(day.date)"
                class="opacity-50 hover:opacity-100"
              />
            </div>
            
            <!-- Posts for this day -->
            <div class="space-y-1">
              <div 
                v-for="post in getPostsForDay(day.date).slice(0, 3)" 
                :key="post.id"
                class="text-xs p-1 rounded border-l-2 cursor-pointer hover:shadow-sm transition-all bg-white"
                :class="getPostStatusClass(post.status)"
                @click="openPostDetails(post)"
              >
                <div class="font-medium">{{ post.time }}</div>
                <div class="text-gray-600 truncate">{{ post.content }}</div>
              </div>
              
              <!-- More posts indicator -->
              <div 
                v-if="getPostsForDay(day.date).length > 3"
                class="text-xs text-gray-500 font-medium"
              >
                +{{ getPostsForDay(day.date).length - 3 }} more
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Post Details Modal -->
      <UModal v-model="showPostModal" :ui="{ width: 'max-w-2xl' }">
        <UCard v-if="selectedPost">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">Post Details</h3>
              <UButton 
                color="gray" 
                variant="ghost" 
                icon="i-heroicons-x-mark"
                @click="showPostModal = false"
              />
            </div>
          </template>
          
          <div class="space-y-6">
            <div class="flex items-center space-x-2">
              <UBadge 
                :color="getStatusColor(selectedPost.status)"
                :label="selectedPost.status.toUpperCase()"
              />
              <span class="text-sm text-gray-500">{{ selectedPost.date }} at {{ selectedPost.time }}</span>
            </div>
            
            <div class="p-4 bg-gray-50 rounded-lg">
              <p class="text-sm leading-relaxed">{{ selectedPost.content }}</p>
            </div>
            
            <div v-if="selectedPost.files && selectedPost.files.length > 0" class="space-y-3">
              <p class="text-sm font-medium">Attachments ({{ selectedPost.files.length }}):</p>
              <div 
                v-if="selectedPost.files.length === 1"
                class="w-full"
              >
                <img 
                  :src="selectedPost.files[0].preview" 
                  :alt="selectedPost.files[0].name"
                  class="w-full h-64 object-cover rounded-lg border shadow-sm"
                />
              </div>
              <div 
                v-else-if="selectedPost.files.length === 2" 
                class="grid grid-cols-2 gap-3"
              >
                <img 
                  v-for="file in selectedPost.files" 
                  :key="file.name"
                  :src="file.preview" 
                  :alt="file.name"
                  class="w-full h-40 object-cover rounded-lg border shadow-sm"
                />
              </div>
              <div 
                v-else 
                class="grid grid-cols-3 gap-2"
              >
                <img 
                  v-for="file in selectedPost.files" 
                  :key="file.name"
                  :src="file.preview" 
                  :alt="file.name"
                  class="w-full h-24 object-cover rounded border shadow-sm"
                />
              </div>
            </div>
          </div>

          <template #footer>
            <div class="flex justify-end space-x-2">
              <UButton 
                color="gray" 
                variant="outline"
                @click="showPostModal = false"
              >
                Close
              </UButton>
              <UButton 
                v-if="selectedPost.status !== 'sent'" 
                color="primary"
                @click="editPost(selectedPost)"
              >
                Edit
              </UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </div>
  </div>
</template>

<script setup>
// Use localStorage composable
const { loadScheduledPosts, loadDrafts, loadSentPosts, saveDrafts, saveScheduledPosts } = useLocalStorage()

// Inject methods from layout
const createPostFunction = inject('createPost')
const editPostFunction = inject('editPost')
const refreshDrafts = inject('refreshDrafts')
const refreshQueue = inject('refreshQueue')
const refreshSent = inject('refreshSent')
const toast = useToast()

// Reactive data
const currentWeekStart = ref(new Date())
const currentMonthStart = ref(new Date())
const allPosts = ref([])
const showPostModal = ref(false)
const selectedPost = ref(null)
const isDragOver = ref(false)
const dragOverSlot = ref(null)
const isDragging = ref(false)
const draggedPost = ref(null)
const viewMode = ref('weekly') // 'weekly' or 'monthly'

// Time slots (24 hours - 12:00 AM to 11:00 PM)
const timeSlots = computed(() => {
  const slots = []
  for (let hour = 0; hour < 24; hour++) {
    const time24 = `${hour.toString().padStart(2, '0')}:00`
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const display = `${hour12}:00 ${ampm}`
    
    slots.push({
      time: time24,
      display: display,
      hour: hour
    })
  }
  return slots
})

// Get start of week (Sunday)
const getWeekStart = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day
  return new Date(d.setDate(diff))
}

// Get start of month
const getMonthStart = (date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

// Initialize current week start
onMounted(() => {
  currentWeekStart.value = getWeekStart(new Date())
  currentMonthStart.value = getMonthStart(new Date())
  loadAllPosts()
})

// Computed week days
const weekDays = computed(() => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentWeekStart.value)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    const dayPosts = allPosts.value.filter(post => post.date === dateStr)
    
    days.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: date.getDate(),
      isToday: date.getTime() === today.getTime(),
      posts: dayPosts,
      postsCount: dayPosts.length
    })
  }
  
  return days
})

// Computed month days
const monthDays = computed(() => {
  const days = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const currentMonth = new Date(currentMonthStart.value)
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
  const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
  
  // Get the first Sunday of the calendar
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())
  
  // Generate 42 days (6 weeks)
  for (let i = 0; i < 42; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]
    
    days.push({
      date: dateStr,
      dayNumber: date.getDate(),
      isToday: date.getTime() === today.getTime(),
      isOtherMonth: date.getMonth() !== currentMonth.getMonth(),
      posts: allPosts.value.filter(post => post.date === dateStr)
    })
  }
  
  return days
})

// Current period range display
const currentPeriodRange = computed(() => {
  if (viewMode.value === 'weekly') {
    const startDate = new Date(currentWeekStart.value)
    const endDate = new Date(currentWeekStart.value)
    endDate.setDate(endDate.getDate() + 6)
    
    const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' })
    const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })
    const year = startDate.getFullYear()
    
    if (startMonth === endMonth) {
      return `${startMonth} ${startDate.getDate()}-${endDate.getDate()}, ${year}`
    } else {
      return `${startMonth} ${startDate.getDate()} - ${endMonth} ${endDate.getDate()}, ${year}`
    }
  } else {
    const month = currentMonthStart.value.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    return month
  }
})

// Methods
const loadAllPosts = () => {
  const posts = []
  
  try {
    console.log('Loading all posts for calendar')
    // Load scheduled posts with better error handling
    const scheduledData = loadScheduledPosts()
    console.log('Loaded scheduled posts:', scheduledData)
    
    if (scheduledData && Array.isArray(scheduledData)) {
      scheduledData.forEach(day => {
        if (day.timeSlots && Array.isArray(day.timeSlots)) {
          day.timeSlots.forEach(slot => {
            if (slot.post && slot.post.id) {
              posts.push({
                ...slot.post,
                status: 'scheduled',
                date: day.date,
                time: slot.time
              })
            }
          })
        }
      })
    }
    
    // Load drafts with date/time
    const drafts = loadDrafts()
    console.log('Loaded drafts:', drafts)
    
    if (drafts && Array.isArray(drafts)) {
      drafts.forEach(draft => {
        if (draft.date && draft.time && draft.id) {
          posts.push({
            ...draft,
            status: 'draft'
          })
        }
      })
    }
    
    // Load sent posts
    const sentPosts = loadSentPosts()
    console.log('Loaded sent posts:', sentPosts)
    
    if (sentPosts && Array.isArray(sentPosts)) {
      sentPosts.forEach(sent => {
        if (sent.publishedAt && sent.id) {
          const publishDate = new Date(sent.publishedAt).toISOString().split('T')[0]
          const publishTime = new Date(sent.publishedAt).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true 
          })
          posts.push({
            ...sent,
            status: 'sent',
            date: publishDate,
            time: publishTime
          })
        }
      })
    }
    
    console.log('Final posts array:', posts)
    allPosts.value = posts
    
  } catch (error) {
    console.error('Error loading posts:', error)
    allPosts.value = []
  }
}

const getPostsForTimeSlot = (date, timeSlot) => {
  // Convert timeSlot (24h format) to check against post times
  const [hour] = timeSlot.split(':')
  const hourNum = parseInt(hour)
  
  return allPosts.value.filter(post => {
    if (post.date !== date) return false
    
    // Parse post time to get hour
    const postTime = post.time
    if (!postTime) return false
    
    // Convert 12h format to 24h for comparison
    const timeMatch = postTime.match(/(\d+):(\d+)\s*(AM|PM)/i)
    if (!timeMatch) return false
    
    let postHour = parseInt(timeMatch[1])
    const ampm = timeMatch[3].toUpperCase()
    
    if (ampm === 'PM' && postHour !== 12) postHour += 12
    if (ampm === 'AM' && postHour === 12) postHour = 0
    
    return postHour === hourNum
  })
}

const getPostsForDay = (date) => {
  return allPosts.value.filter(post => post.date === date)
}

const previousPeriod = () => {
  if (viewMode.value === 'weekly') {
    const newDate = new Date(currentWeekStart.value)
    newDate.setDate(newDate.getDate() - 7)
    currentWeekStart.value = newDate
  } else {
    const newDate = new Date(currentMonthStart.value)
    newDate.setMonth(newDate.getMonth() - 1)
    currentMonthStart.value = newDate
  }
}

const nextPeriod = () => {
  if (viewMode.value === 'weekly') {
    const newDate = new Date(currentWeekStart.value)
    newDate.setDate(newDate.getDate() + 7)
    currentWeekStart.value = newDate
  } else {
    const newDate = new Date(currentMonthStart.value)
    newDate.setMonth(newDate.getMonth() + 1)
    currentMonthStart.value = newDate
  }
}

const goToThisPeriod = () => {
  if (viewMode.value === 'weekly') {
    currentWeekStart.value = getWeekStart(new Date())
  } else {
    currentMonthStart.value = getMonthStart(new Date())
  }
}

const createPost = () => {
  if (createPostFunction) {
    createPostFunction()
  }
}

const createPostForDate = (date) => {
  if (createPostFunction) {
    // Pass the date and default time to the create function
    createPostFunction({
      date: date,
      time: '9:00 AM'
    })
  }
}

const editPost = (post) => {
  showPostModal.value = false
  if (editPostFunction) {
    editPostFunction(post)
  }
}

const openPostDetails = (post) => {
  selectedPost.value = post
  showPostModal.value = true
}

const getPostStatusClass = (status) => {
  switch (status) {
    case 'scheduled':
      return 'border-blue-400 bg-blue-50 text-blue-800'
    case 'draft':
      return 'border-yellow-400 bg-yellow-50 text-yellow-800'
    case 'sent':
      return 'border-green-400 bg-green-50 text-green-800'
    default:
      return 'border-gray-400 bg-gray-50 text-gray-800'
  }
}

const getStatusColor = (status) => {
  switch (status) {
    case 'scheduled':
      return 'blue'
    case 'draft':
      return 'yellow'
    case 'sent':
      return 'green'
    default:
      return 'gray'
  }
}

const handleDragOver = (event, date, timeSlot) => {
  event.preventDefault()
  isDragOver.value = true
  dragOverSlot.value = `${date}-${timeSlot}`
}

const handleDragLeave = () => {
  isDragOver.value = false
  dragOverSlot.value = null
}

const canDropHere = (date, timeSlot) => {
  // Check if the date/time is in the past
  if (isInThePast(date, timeSlot)) {
    return false
  }
  
  // Don't allow dropping on sent posts' time slots
  const existingPosts = getPostsForTimeSlot(date, timeSlot)
  return !existingPosts.some(post => post.status === 'sent')
}

const isInThePast = (date, timeSlot) => {
  const now = new Date()
  const targetDate = new Date(date)
  
  // Convert timeSlot to 24h format for comparison
  const [hour] = timeSlot.split(':')
  const hourNum = parseInt(hour)
  
  // Set the target time
  targetDate.setHours(hourNum, 0, 0, 0)
  
  // Check if target date/time is in the past
  return targetDate < now
}

const formatTimeFromSlot = (timeSlot) => {
  // Convert 24h format to 12h format
  const [hour] = timeSlot.split(':')
  const hourNum = parseInt(hour)
  const hour12 = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum
  const ampm = hourNum >= 12 ? 'PM' : 'AM'
  return `${hour12}:00 ${ampm}`
}

const handleDrop = async (event, date, timeSlot) => {
  event.preventDefault()
  isDragOver.value = false
  dragOverSlot.value = null
  
  if (!draggedPost.value) {
    return
  }
  
  // Check if trying to drop in the past
  if (isInThePast(date, timeSlot)) {
    toast.add({
      title: 'Invalid Time',
      description: 'Cannot schedule posts in the past!',
      color: 'red'
    })
    return
  }
  
  if (!canDropHere(date, timeSlot)) {
    toast.add({
      title: 'Invalid Location',
      description: 'Cannot place post in this location.',
      color: 'red'
    })
    return
  }
  
  const post = draggedPost.value
  const oldDate = post.date
  const oldTime = post.time
  const newTime = formatTimeFromSlot(timeSlot)
  
  try {
    if (post.status === 'draft') {
      // Update draft
      const drafts = loadDrafts()
      const draftIndex = drafts.findIndex(d => d.id === post.id)
      
      if (draftIndex > -1) {
        drafts[draftIndex] = {
          ...drafts[draftIndex],
          date: date,
          time: newTime,
          updatedAt: new Date()
        }
        
        saveDrafts(drafts)
        refreshDrafts.value++
        
        toast.add({
          title: 'Draft Moved!',
          description: `Draft moved to ${date} at ${newTime}`,
          color: 'blue'
        })
      }
    } else if (post.status === 'scheduled') {
      // Update scheduled post - improved logic
      let scheduledData = loadScheduledPosts()
      let postFound = false
      
      console.log('Moving scheduled post from:', oldDate, oldTime, 'to:', date, newTime)
      console.log('Current scheduled data:', scheduledData)
      
      // Remove from old slot
      scheduledData.forEach(day => {
        if (day.date === oldDate) {
          day.timeSlots.forEach(slot => {
            if (slot.time === oldTime && slot.post?.id === post.id) {
              console.log('Found and removing post from old slot')
              slot.post = null
              postFound = true
            }
          })
        }
      })
      
      if (!postFound) {
        // If not found in old format, try to find it anyway
        console.log('Post not found in old location, will create new entry')
        postFound = true // Continue with moving
      }
      
      // Find or create the target day
      let targetDay = scheduledData.find(day => day.date === date)
      
      if (!targetDay) {
        console.log('Creating new day for:', date)
        // Create new day with all time slots
        targetDay = {
          date: date,
          timeSlots: []
        }
        
        // Create all time slots for the day (24 hours)
        for (let hour = 0; hour < 24; hour++) {
          const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
          const ampm = hour >= 12 ? 'PM' : 'AM'
          const timeDisplay = `${hour12}:00 ${ampm}`
          
          targetDay.timeSlots.push({
            time: timeDisplay,
            post: null
          })
        }
        
        scheduledData.push(targetDay)
      }
      
      // Find or create the target time slot
      let targetSlot = targetDay.timeSlots.find(slot => slot.time === newTime)
      
      if (!targetSlot) {
        console.log('Creating new time slot for:', newTime)
        // Create the time slot if it doesn't exist
        targetSlot = {
          time: newTime,
          post: null
        }
        targetDay.timeSlots.push(targetSlot)
        
        // Sort time slots to maintain order
        targetDay.timeSlots.sort((a, b) => {
          const timeA = convertTo24Hour(a.time)
          const timeB = convertTo24Hour(b.time)
          return timeA.localeCompare(timeB)
        })
      }
      
      // Add post to new slot
      targetSlot.post = {
        ...post,
        date: date,
        time: newTime,
        updatedAt: new Date()
      }
      
      console.log('Post moved successfully, saving data:', scheduledData)
      
      // Save the updated data
      saveScheduledPosts(scheduledData)
      refreshQueue.value++
      
      toast.add({
        title: 'Post Moved!',
        description: `Scheduled post moved to ${date} at ${newTime}`,
        color: 'green'
      })
    }
    
    // Reload calendar data
    loadAllPosts()
    
  } catch (error) {
    console.error('Error moving post:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to move post. Please try again.',
      color: 'red'
    })
  }
}

// Helper function to convert 12h format to 24h for sorting
const convertTo24Hour = (time12h) => {
  const [time, modifier] = time12h.split(' ')
  let [hours, minutes] = time.split(':')
  
  if (hours === '12') {
    hours = '00'
  }
  
  if (modifier === 'PM') {
    hours = parseInt(hours, 10) + 12
  }
  
  return `${hours.toString().padStart(2, '0')}:${minutes}`
}

const handleDragStart = (event, post) => {
  isDragging.value = true
  draggedPost.value = { ...post }
  event.dataTransfer.setData('text', JSON.stringify(post))
}

const handleDragEnd = () => {
  isDragging.value = false
  draggedPost.value = null
}

// Watch for data changes and reload
watch([refreshDrafts, refreshQueue, refreshSent], () => {
  console.log('Refreshing calendar data')
  loadAllPosts()
}, { immediate: true })
</script>

<style scoped>
.bg-blue-25 {
  background-color: rgba(239, 246, 255, 0.3);
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Improved hover effects */
.hover\:shadow-md:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* Better transition */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Drag and drop styles */
.drop-zone {
  transition: background-color 0.2s ease;
}

.cursor-move:hover {
  cursor: grab;
}

.cursor-move:active {
  cursor: grabbing;
}

/* Dragging state */
[draggable="true"]:hover {
  transform: scale(1.02);
}

/* Drop zone indicators */
.bg-green-100 {
  background-color: rgba(34, 197, 94, 0.1);
  border: 2px dashed #22c55e;
}

.bg-red-100 {
  background-color: rgba(239, 68, 68, 0.1);
  border: 2px dashed #ef4444;
}

/* Past time slots styling */
.bg-gray-100 {
  background-color: rgba(156, 163, 175, 0.1);
  position: relative;
}

.bg-gray-100::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 5px,
    rgba(156, 163, 175, 0.1) 5px,
    rgba(156, 163, 175, 0.1) 10px
  );
  pointer-events: none;
}

/* Disabled cursor for past time slots */
.opacity-50 {
  cursor: not-allowed;
}
</style>