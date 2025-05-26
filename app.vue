<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
// Get router instance
const router = useRouter()

// Handle route changes
router.beforeEach(async (to, from, next) => {
  try {
    // If trying to access root, redirect to /publish
    if (to.path === '/') {
      await navigateTo('/publish')
    }
    next()
  } catch (error) {
    console.error('Navigation error:', error)
    next(false)
  }
})

// Error handling
onErrorCaptured((err, instance, info) => {
  console.error('Error captured:', err)
  return false // Prevent error from propagating
})
</script>
