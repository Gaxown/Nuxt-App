<template>
  <UModal v-model="isOpen" :ui="{ width: 'max-w-2xl' }">
    <UCard>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ editMode ? 'Edit Post' : 'Create Post' }}</h3>
          <UButton 
            color="gray" 
            variant="ghost" 
            icon="i-heroicons-x-mark"
            @click="closeModal"
          />
        </div>
      </template>
      
      <div class="space-y-6">
        <!-- Add Tags -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <UInput
              v-model="newTag"
              placeholder="Add a tag..."
              @keyup.enter="addTag"
              class="flex-grow"
            >
              <template #trailing>
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-plus"
                  @click="addTag"
                  :disabled="!newTag.trim()"
                />
              </template>
            </UInput>
          </div>
          
          <!-- Tag List -->
          <div v-if="tags.length > 0" class="flex flex-wrap gap-2">
            <div
              v-for="(tag, index) in tags"
              :key="index"
              class="inline-flex items-center gap-1 px-3 py-1 bg-gray-900 rounded-full text-sm"
            >
              <span>#{{ tag }}</span>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark"
                size="xs"
                class="hover:text-red-500"
                @click="removeTag(index)"
              />
            </div>
          </div>
        </div>
        
        <!-- Platform Selection -->
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-sm">t</span>
          </div>
          <span class="font-medium">TikTok</span>
        </div>
        
        <!-- Content Area -->
        <div class="space-y-4">
          <UTextarea 
            v-model="postContent" 
            placeholder="Start writing or 🪄 Use the AI Assistant"
            rows="8"
            class="resize-none"
          />
          
          <!-- Drag & Drop Area -->
          <div 
            class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
            @click="triggerFileInput"
            @drop="handleDrop"
            @dragover.prevent
            @dragenter.prevent
          >
            <input 
              type="file" 
              ref="fileInput" 
              @change="handleFileSelect" 
              accept="image/*,video/*"
              class="hidden"
              multiple
            />
            
            <!-- Show uploaded images -->
            <div v-if="files.length > 0" class="space-y-3">
              <div class="grid grid-cols-3 gap-3">
                <div 
                  v-for="(file, index) in files" 
                  :key="index"
                  class="relative group"
                >
                  <img 
                    v-if="file.type.startsWith('image/')"
                    :src="file.preview" 
                    :alt="file.name"
                    class="w-full h-24 object-contain rounded-lg bg-gray-100 border"
                  />
                  <div 
                    v-else-if="file.type.startsWith('video/')"
                    class="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center"
                  >
                    <UIcon name="i-heroicons-play-circle" class="w-8 h-8 text-white" />
                  </div>
                  
                  <!-- Remove button -->
                  <UButton
                    color="red"
                    variant="solid"
                    size="2xs"
                    icon="i-heroicons-x-mark"
                    class="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    @click.stop="removeFile(index)"
                  />
                </div>
              </div>
              <UButton 
                variant="link" 
                class="text-sm"
                @click.stop="triggerFileInput"
              >
                Add more files
              </UButton>
            </div>
            
            <!-- Default state -->
            <div v-else class="flex flex-col items-center space-y-2">
              <UIcon name="i-heroicons-photo" class="w-8 h-8 text-gray-400" />
              <div class="text-sm text-gray-600">
                <span class="font-medium">Drag & drop</span>
                <br />
                or <UButton variant="link" class="p-0" @click.stop="triggerFileInput">select a file</UButton>
              </div>
            </div>
          </div>
          
          <!-- Toolbar -->
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <UButton 
                color="gray" 
                variant="ghost" 
                icon="i-heroicons-photo" 
                size="sm"
                @click="triggerFileInput"
              />
              <UButton color="gray" variant="ghost" icon="i-heroicons-face-smile" size="sm" />
              <UButton 
                color="primary" 
                variant="ghost" 
                icon="i-heroicons-sparkles" 
                size="sm"
                class="text-purple-600"
              >
                <span class="text-purple-600">#</span>
              </UButton>
              <UButton color="gray" variant="ghost" icon="i-heroicons-hashtag" size="sm" />
              <UButton 
                color="purple" 
                variant="ghost" 
                size="sm"
                class="text-purple-600"
              >
                <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
                AI Assistant
              </UButton>
            </div>
            <div class="text-sm text-gray-500">
              {{ postContent.length }}/2200
            </div>
          </div>
        </div>
        
        <!-- Scheduling Options -->
        <div class="space-y-4 pt-4 border-t">
          <div class="flex items-center space-x-3 mb-4">
            <UIcon name="i-heroicons-calendar" class="w-5 h-5 text-gray-600" />
            <span class="font-medium text-gray-900">Schedule Date & Time</span>
          </div>
          
          <!-- Date Picker -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Date</label>
            <input
              v-model="selectedDate"
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :min="getTodayDate()"
            />
          </div>
          
          <!-- Time Picker -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-gray-700">Time</label>
            <input
              v-model="selectedTime24h"
              type="time"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <!-- Display formatted schedule -->
          <div class="p-3 bg-gray-50 rounded-md">
            <div class="text-sm text-gray-600">
              Scheduled for: <span class="font-medium text-gray-900">{{ formatScheduleDate(selectedDate, selectedTime) }}</span>
            </div>
          </div>
          
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <UIcon name="i-heroicons-cog-6-tooth" class="w-4 h-4 text-blue-600" />
              <span class="text-sm text-blue-600 font-medium">Automatic</span>
              <UButton color="gray" variant="ghost" icon="i-heroicons-chevron-down" size="sm" />
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="flex justify-between">
          <UButton 
            color="gray" 
            variant="outline" 
            @click="saveDraft"
          >
            {{ editMode ? 'Save as Draft' : 'Schedule Draft' }}
          </UButton>
          <UButton 
            color="primary" 
            @click="editMode ? updatePost() : schedulePost()"
            :disabled="!postContent.trim() && files.length === 0"
          >
            {{ editMode ? (editPost?.status === 'draft' || !editPost?.status ? 'Update Draft' : 'Update Post') : 'Schedule Post' }}
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup>
// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  selectedDate: {
    type: String,
    default: ''
  },
  selectedTime: {
    type: String,
    default: ''
  },
  editMode: {
    type: Boolean,
    default: false
  },
  editPost: {
    type: Object,
    default: null
  },
  existingPosts: {
    type: Array,
    default: () => []
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'postScheduled', 'draftSaved', 'postUpdated'])

// Reactive data
const postContent = ref('')
const files = ref([])
const fileInput = ref(null)

// Date and time management
const selectedDate = ref('')
const selectedTime24h = ref('')
const selectedTime = ref('')

// Add these new refs for tags
const newTag = ref('')
const tags = ref([])

// Initialize with props or default values
onMounted(() => {
  selectedDate.value = props.selectedDate || getTodayDate()
  if (props.selectedTime) {
    selectedTime.value = props.selectedTime
    selectedTime24h.value = convertTo24h(props.selectedTime)
  } else {
    const now = new Date()
    selectedTime24h.value = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    selectedTime.value = convertTo12h(selectedTime24h.value)
  }
})

// Watch for changes in 24h time and convert to 12h
watch(selectedTime24h, (newTime) => {
  if (newTime) {
    selectedTime.value = convertTo12h(newTime)
  }
})

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Methods
const closeModal = () => {
  isOpen.value = false
  resetForm()
}

const resetForm = () => {
  postContent.value = ''
  files.value = []
  tags.value = []
  newTag.value = ''
}

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleDrop = (event) => {
  event.preventDefault()
  const droppedFiles = Array.from(event.dataTransfer.files)
  processFiles(droppedFiles)
}

const handleFileSelect = (event) => {
  const selectedFiles = Array.from(event.target.files)
  processFiles(selectedFiles)
}

const processFiles = (newFiles) => {
  newFiles.forEach(file => {
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        files.value.push({
          name: file.name,
          type: file.type,
          size: file.size,
          preview: e.target.result,
          file: file
        })
      }
      reader.readAsDataURL(file)
    }
  })
}

const removeFile = (index) => {
  files.value.splice(index, 1)
}

const formatScheduleDate = (date, time) => {
  if (!date || !time) return 'Select date and time'
  
  const dateObj = new Date(date + ' ' + time)
  const options = { 
    month: 'short', 
    day: 'numeric', 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  }
  return dateObj.toLocaleDateString('en-US', options)
}

// Get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date()
  return today.toISOString().split('T')[0]
}

// Convert 12h time to 24h format
const convertTo24h = (time12h) => {
  try {
    const [timeStr, ampm] = time12h.trim().split(' ')
    let [hours, minutes] = timeStr.split(':')
    hours = parseInt(hours)
    
    if (ampm === 'PM' && hours !== 12) {
      hours += 12
    } else if (ampm === 'AM' && hours === 12) {
      hours = 0
    }
    
    return `${hours.toString().padStart(2, '0')}:${minutes}`
  } catch (error) {
    return '12:00'
  }
}

// Convert 24h time to 12h format
const convertTo12h = (time24h) => {
  try {
    let [hours, minutes] = time24h.split(':')
    hours = parseInt(hours)
    
    const ampm = hours >= 12 ? 'PM' : 'AM'
    hours = hours % 12
    hours = hours || 12
    
    return `${hours}:${minutes} ${ampm}`
  } catch (error) {
    return '12:00 PM'
  }
}

const addTag = () => {
  const tag = newTag.value.trim().toLowerCase()
  if (tag && !tags.value.includes(tag)) {
    tags.value.push(tag)
    newTag.value = ''
  }
}

const removeTag = (index) => {
  tags.value.splice(index, 1)
}

const schedulePost = () => {
  if (!postContent.value.trim() && files.value.length === 0) return
  
  // Get today's date if none selected
  if (!selectedDate.value) {
    selectedDate.value = getTodayDate()
  }
  
  // Default to next available time if none selected
  if (!selectedTime.value) {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    selectedTime.value = `${now.getHours() % 12 || 12}:00 ${now.getHours() >= 12 ? 'PM' : 'AM'}`
  }

  // Check if there's already a post at this time slot
  const isTimeSlotTaken = props.existingPosts?.some(post => 
    post.date === selectedDate.value && 
    post.time === selectedTime.value &&
    post.status === 'scheduled'
  )

  // If time slot is taken, find next available slot
  if (isTimeSlotTaken) {
    const currentTime = new Date(`${selectedDate.value} ${convertTo24h(selectedTime.value)}`)
    let nextSlot = new Date(currentTime.getTime() + 30 * 60000) // Add 30 minutes

    // Keep checking until we find an available slot
    while (props.existingPosts?.some(post => {
      const postTime = new Date(`${post.date} ${convertTo24h(post.time)}`)
      return postTime.getTime() === nextSlot.getTime() && post.status === 'scheduled'
    })) {
      nextSlot = new Date(nextSlot.getTime() + 30 * 60000)
    }

    // Update the selected date and time
    selectedDate.value = nextSlot.toISOString().split('T')[0]
    selectedTime.value = convertTo12h(nextSlot.getHours().toString().padStart(2, '0') + ':' + nextSlot.getMinutes().toString().padStart(2, '0'))
  }
  
  const postData = {
    id: `post-${Date.now()}`,
    content: postContent.value,
    files: files.value,
    tags: tags.value,
    date: selectedDate.value,
    time: selectedTime.value,
    createdAt: new Date(),
    status: 'scheduled',
    username: 'huntergon077',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
  
  emit('postScheduled', postData)
  closeModal()
}

const saveDraft = () => {
  if (!postContent.value.trim() && files.value.length === 0) return
  
  const draftData = {
    id: props.editMode && props.editPost?.id ? props.editPost.id : `draft-${Date.now()}`,
    content: postContent.value,
    files: files.value,
    tags: tags.value,
    date: selectedDate.value || getTodayDate(),
    time: selectedTime.value || '12:00 PM',
    createdAt: new Date(),
    status: 'draft',
    username: 'huntergon077',
    profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
  }
  
  emit('draftSaved', draftData)
  closeModal()
}

const updatePost = () => {
  if (props.editPost && (props.editPost.status === 'draft' || !props.editPost.status)) {
    const draftData = {
      content: postContent.value,
      files: files.value,
      tags: tags.value,
      date: selectedDate.value,
      time: selectedTime.value,
      id: props.editPost.id
    }
    
    emit('draftSaved', draftData)
  } else {
    const postData = {
      id: props.editPost.id,
      content: postContent.value,
      files: files.value,
      tags: tags.value,
      date: selectedDate.value,
      time: selectedTime.value
    }
    
    emit('postUpdated', postData)
  }
  
  closeModal()
}

// Watch for edit post changes
watch(() => props.editPost, (newPost) => {
  if (newPost) {
    postContent.value = newPost.content || ''
    files.value = newPost.files ? [...newPost.files] : []
    tags.value = newPost.tags ? [...newPost.tags] : []
    selectedDate.value = newPost.date || getTodayDate()
    selectedTime.value = newPost.time || '12:00 PM'
    selectedTime24h.value = convertTo24h(selectedTime.value)
    
    // If it's a new post (duplicate), append (Copy) to the content
    if (!props.editMode && newPost.status === 'draft') {
      postContent.value += ' (Copy)'
    }
  }
}, { immediate: true, deep: true })

// Watch for modal open/close
watch(() => props.modelValue, (isOpen) => {
  if (isOpen && !props.editMode) {
    resetForm()
  }
}, { immediate: true })

// Watch for selectedDate and selectedTime props changes
watch(() => [props.selectedDate, props.selectedTime], ([newDate, newTime]) => {
  if (newDate && !props.editMode) {
    selectedDate.value = newDate
  }
  if (newTime && !props.editMode) {
    selectedTime.value = newTime
    selectedTime24h.value = convertTo24h(newTime)
  }
}, { immediate: true })
</script> 