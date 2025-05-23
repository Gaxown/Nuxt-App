<template>
  <UIPublishDraftsSection @create-post="handleCreatePost" />
</template>

<script setup>
// Use publish layout
definePageMeta({
  layout: 'publish'
})

// Page meta
useHead({
  title: 'Drafts'
})

// Inject methods from layout
const handleCreatePost = inject('createPost')
</script> 