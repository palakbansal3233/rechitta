<script setup lang="ts">
definePageMeta({ layout: 'bare' })

const { property, propertyPending } = useProject()

useHead({ title: 'Meet Rechitta, your AI agent' })
</script>

<template>
  <OnboardingSplashScreen :property="property" :pending="propertyPending" />
</template>
