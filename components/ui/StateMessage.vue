<script setup lang="ts">
/** One component for every non-happy path: error, empty, offline, blocked. */
withDefaults(
  defineProps<{
    tone?: 'error' | 'empty' | 'info'
    title: string
    body?: string
    compact?: boolean
  }>(),
  { tone: 'info', body: '', compact: false },
)
</script>

<template>
  <div
    :role="tone === 'error' ? 'alert' : 'status'"
    class="surface flex flex-col items-start gap-3 rounded-[var(--radius-card)]"
    :class="compact ? 'p-4' : 'p-5 sm:p-7'"
  >
    <span
      class="grid size-9 shrink-0 place-items-center rounded-full border"
      :class="
        tone === 'error'
          ? 'border-danger-400/30 bg-danger-400/10 text-danger-400'
          : tone === 'empty'
            ? 'border-white/12 bg-white/6 text-white/60'
            : 'border-teal-400/30 bg-teal-400/10 text-teal-300'
      "
      aria-hidden="true"
    >
      <svg viewBox="0 0 20 20" class="size-4.5" fill="none" stroke="currentColor" stroke-width="1.6">
        <template v-if="tone === 'error'">
          <path d="M10 6v5" stroke-linecap="round" />
          <circle cx="10" cy="14" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="10" cy="10" r="7.2" />
        </template>
        <template v-else-if="tone === 'empty'">
          <circle cx="9" cy="9" r="5.6" />
          <path d="m13.2 13.2 3.3 3.3" stroke-linecap="round" />
        </template>
        <template v-else>
          <circle cx="10" cy="10" r="7.2" />
          <path d="M10 9.2v4.4" stroke-linecap="round" />
          <circle cx="10" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
        </template>
      </svg>
    </span>

    <div class="space-y-1.5">
      <p class="text-[0.95rem] font-medium">{{ title }}</p>
      <p v-if="body" class="text-sm text-dim">{{ body }}</p>
    </div>

    <div v-if="$slots.actions" class="mt-1 flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
