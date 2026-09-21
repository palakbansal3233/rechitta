<script setup lang="ts">
defineProps<{ body: string; bullets: string[] }>()
</script>

<template>
  <section class="h-full w-full rounded border border-[#C9A961]/10 p-4 backdrop-blur-[20px]">
    <p class="text-sm text-dim">{{ body }}</p>
    <ul class="mt-3.5 space-y-2.5">
      <li v-for="b in bullets" :key="b" class="flex gap-3 text-sm leading-relaxed text-white/82">
        <span class="mt-2 size-1.5 shrink-0 rounded-full bg-gold-400" aria-hidden="true" />
        <span>{{ b }}</span>
      </li>
    </ul>
  </section>
</template>
