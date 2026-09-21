<script setup lang="ts">
import type { NuxtError } from '#app'
const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)
</script>

<template>
  <div class="contours grid min-h-[100svh] place-items-center px-6 text-center">
    <div class="max-w-md space-y-5">
      <img src="/media/mark.webp" alt="" width="344" height="304" class="mx-auto h-10 w-auto opacity-80">
      <h1 class="text-2xl font-medium">
        {{ is404 ? 'That page does not exist' : 'Something went wrong' }}
      </h1>
      <p class="text-sm text-dim">
        {{
          is404
            ? 'Rechitta only has one project on file right now.'
            : (error?.message || 'An unexpected error occurred. Reload and try again.')
        }}
      </p>
      <UiAppButton @click="clearError({ redirect: '/properties' })">Back to Berkeley Square North</UiAppButton>
    </div>
  </div>
</template>
