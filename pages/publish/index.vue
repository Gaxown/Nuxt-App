<template>
  <UIPublishScheduleSection ref="scheduleSection" @create-post="handleCreatePost" @edit-post="handleEditPost" />
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

// Component ref
const scheduleSection = ref(null)

// Methods
const handleCreatePost = (data) => {
  createPost(data)
}

const handleEditPost = (post) => {
  editPost(post)
}

// Register schedule section with layout
onMounted(async () => {
  // Wait for next tick to ensure component is fully rendered
  await nextTick()
  
  if (scheduleSection.value && setScheduleSection) {
    setScheduleSection(scheduleSection.value)
  }
})
</script> 