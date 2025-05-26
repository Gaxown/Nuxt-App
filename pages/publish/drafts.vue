<template>
  <UIPublishDraftsSection @create-post="handleCreatePost" @edit-post="handleEditPost" />
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
const createPost = inject('createPost')
const editPost = inject('editPost')

// Methods
const handleCreatePost = (data) => {
  createPost(data)
}

const handleEditPost = (post) => {
  editPost(post)
}
</script> 