<script setup lang="ts">
import type { PaymentMilestone } from '~~/types'
const props = defineProps<{ milestones: PaymentMilestone[]; footnote: string }>()
const total = computed(() => props.milestones.reduce((sum, m) => sum + m.percent, 0))
</script>

<template>
  <section class="h-full w-full rounded border border-[#C9A961]/10 p-4 backdrop-blur-[20px]">
    <!-- Proportional bar -->
    <div class="flex h-2.5 gap-1 overflow-hidden rounded-full" role="img" :aria-label="`Payment split across ${milestones.length} milestones`">
      <span
        v-for="(m, i) in milestones"
        :key="m.label"
        class="rounded-full"
        :class="i === milestones.length - 1 ? 'bg-gold-300' : 'bg-teal-400'"
        :style="{ width: `${(m.percent / total) * 100}%`, opacity: 0.45 + (i / milestones.length) * 0.55 }"
      />
    </div>

    <ol class="mt-4 space-y-3">
      <li v-for="m in milestones" :key="m.label" class="flex items-baseline gap-3">
        <span class="w-11 shrink-0 text-[0.95rem] tabular text-white">{{ m.percent }}%</span>
        <span class="min-w-0 flex-1 truncate text-sm text-white/82">{{ m.label }}</span>
        <span class="shrink-0 text-xs text-dimmer">{{ m.due }}</span>
      </li>
    </ol>

    <p class="mt-4 border-t border-white/8 pt-3 text-xs leading-relaxed text-dimmer">{{ footnote }}</p>
  </section>
</template>
