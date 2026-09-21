<script setup lang="ts">
defineProps<{ total: number; current: number; label?: string }>()
</script>

<template>
  <div class="flex items-center gap-1" :aria-label="label" role="group">
    <span
      v-for="i in total"
      :key="i"
      class="h-2 rounded-[4px] transition-all duration-500 ease-[var(--ease-out-expo)]"
      :class="i - 1 === current ? 'w-4 bg-[#FFFFFF]' : 'w-2 bg-[#FFFFFF26]'"
    />
  </div>
</template>
