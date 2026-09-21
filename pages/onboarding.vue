<script setup lang="ts">
definePageMeta({ layout: 'bare' })

useHead({ title: 'Speak to Discover · Rechitta' })

function toProject() {
  return navigateTo('/properties')
}
</script>

<template>
  <OnboardingMicrophoneScreen @granted="toProject" @skipped="toProject" />
</template>
