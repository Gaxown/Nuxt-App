<template>
  <UIPublishSentSection :sent-count="sentCount" />
</template>

<script setup>
// Use publish layout
definePageMeta({
  layout: 'publish'
})

// Page meta
useHead({
  title: 'Sent'
})

// Inject data from layout
const sentCount = inject('sentCount')
</script> 