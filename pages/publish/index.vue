<template>
  <Suspense>
    <UIPublishScheduleSection 
      ref="scheduleSection" 
      @create-post="handleCreatePost" 
      @edit-post="handleEditPost" 
    />
    <template #fallback>
      <div class="flex items-center justify-center min-h-screen">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    </template>
  </Suspense>
</template>

<script setup>
// Use publish layout
definePageMeta({
  layout: 'publish'
})

// Page meta
useHead({
  title: 'Queue'
})

// Inject methods from layout
const createPost = inject('createPost')
const editPost = inject('editPost')
const setScheduleSection = inject('setScheduleSection')
const refreshQueue = inject('refreshQueue')

// Component ref
const scheduleSection = ref(null)

// Methods
const handleCreatePost = (data) => {
  createPost(data)
}

const handleEditPost = (post) => {
  editPost(post)
}

// Register schedule section with layout and load data
onMounted(async () => {
  // Wait for next tick to ensure component is fully rendered
  await nextTick()
  
  if (scheduleSection.value && setScheduleSection) {
    setScheduleSection(scheduleSection.value)
    // Force a refresh of the queue data
    if (refreshQueue) {
      refreshQueue.value++
    }
    // Load posts if the method exists
    if (scheduleSection.value.loadAllPosts) {
      await scheduleSection.value.loadAllPosts()
    }
  }
})
</script> 