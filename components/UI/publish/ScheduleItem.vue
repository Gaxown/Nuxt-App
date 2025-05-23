<template>
  <!-- Show scheduled post if exists -->
  <div v-if="post" class="space-y-3">
    <UIPublishPostCard 
      :post="post"
      :scheduled-time="time"
      :profile-image="post.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'"
      @publish-now="$emit('publishNow', post)"
      @edit="$emit('editPost', post)"
      @show-options="$emit('showPostOptions', post)"
    />
  </div>
  
  <!-- Show time slot interface if no post -->
  <div v-else class="flex items-center space-x-4 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
    <div class="w-24">
      <div 
        v-if="!isEditingTime"
        class="text-sm text-gray-700 font-medium cursor-pointer hover:text-blue-600 transition-colors px-2 py-1 rounded hover:bg-blue-50"
        @click="startEditTime"
      >
        {{ time }}
      </div>
      <input
        v-else
        v-model="editedTime"
        type="time"
        class="text-sm text-blue-700 font-semibold bg-blue-50 border-2 border-blue-500 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
        @blur="saveTime"
        @keyup.enter="saveTime"
        @keyup.escape="cancelEdit"
        @input="onTimeInput"
        ref="timeInput"
        placeholder="HH:MM"
      />
    </div>
    <UButton 
      color="gray" 
      variant="outline" 
      icon="i-heroicons-plus"
      class="flex-1 justify-start"
      @click="$emit('createPost', { date, time, slotId })"
    >
      New Post
    </UButton>
    <div class="flex items-center space-x-2">
      <UButton 
        color="blue" 
        variant="soft" 
        icon="i-heroicons-pencil"
        size="sm"
        @click="startEditTime"
      />
      <UButton 
        color="red" 
        variant="soft" 
        icon="i-heroicons-trash"
        size="sm"
        @click="$emit('remove')"
      />
    </div>
  </div>
</template>

<script setup>
// Props
const props = defineProps({
  date: {
    type: String,
    required: true
  },
  time: {
    type: String,
    required: true
  },
  post: {
    type: Object,
    default: null
  },
  slotId: {
    type: [String, Number],
    required: true
  }
})

// Emits
const emit = defineEmits([
  'createPost', 
  'remove', 
  'updateTime', 
  'publishNow', 
  'editPost', 
  'showPostOptions'
])

// Reactive data
const isEditingTime = ref(false)
const editedTime = ref('')
const timeInput = ref(null)

// Methods
const startEditTime = () => {
  isEditingTime.value = true
  editedTime.value = convertToHtml5Time(props.time)
  
  nextTick(() => {
    if (timeInput.value) {
      timeInput.value.focus()
      timeInput.value.select() // Select all text for easy editing
    }
  })
}

const onTimeInput = () => {
  // Auto-save as user types (optional)
  // You can remove this if you want save only on blur/enter
}

const saveTime = () => {
  if (editedTime.value) {
    const newTime = convertFromHtml5Time(editedTime.value)
    emit('updateTime', newTime)
  }
  isEditingTime.value = false
}

const cancelEdit = () => {
  isEditingTime.value = false
  editedTime.value = ''
}

// Conversion functions
const convertToHtml5Time = (time12h) => {
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

const convertFromHtml5Time = (time24h) => {
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
</script> 