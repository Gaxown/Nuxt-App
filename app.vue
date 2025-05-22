<template>
  <div class="min-h-screen bg-gray-100 p-8">
    <UContainer>
      <UCard>
        <template #header>
          <h1 class="text-2xl font-bold">Welcome to Nuxt UI + Tailwind</h1>
        </template>
        
        <p class="text-gray-600">This is a test page to verify that Nuxt UI and Tailwind CSS are working correctly.</p>
        
        <template #footer>
          <UButton color="primary">
            Click me
          </UButton>
        </template>
      </UCard>
    </UContainer>
  </div>
</template>
