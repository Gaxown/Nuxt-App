<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Social Media Scheduler
      </h1>
      <p class="text-xl text-gray-600 mb-8">
        Schedule and manage your social media posts efficiently
      </p>
      <NuxtLink to="/publish">
        <UButton color="primary" size="lg" icon="i-heroicons-arrow-right">
          Get Started
        </UButton>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
// Page meta
useHead({
  title: 'Home'
})

// Auto redirect to publish after 3 seconds
onMounted(() => {
  setTimeout(() => {
    navigateTo('/publish')
  }, 3000)
})
</script>
