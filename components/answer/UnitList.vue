<script setup lang="ts">
import type { Unit } from '~~/types'
defineProps<{ units: Unit[] }>()
</script>

<template>
  <section
    class="flex h-full min-h-[211px] w-full flex-col rounded border border-[#C9A961]/10 p-4 backdrop-blur-[20px]"
  >
    <UiStateMessage
      v-if="!units.length"
      tone="empty"
      compact
      title="Nothing released right now"
      body="Every unit on this stack is under offer. Your advisor can add you to the release list."
    />

    <!-- Rows are spread over the card's height rather than stacked at the top,
         so the list fills the same 211px the design gives it at any width. -->
    <ul v-else class="flex flex-1 flex-col justify-between gap-4">
      <li v-for="unit in units" :key="unit.id" class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-1 flex-col gap-1">
          <p class="flex items-center gap-2 font-display text-[1rem] font-normal leading-none text-white">
            <span class="truncate">Unit {{ unit.code }}</span>
            <span
              v-if="!unit.available"
              class="rounded-full border border-white/14 px-2 py-0.5 font-ui text-[0.625rem] uppercase tracking-wide text-white/55"
            >
              Under offer
            </span>
          </p>
          <p class="truncate font-ui text-[0.75rem] font-normal leading-none text-[#7D7D7D]">
            {{ unit.beds }} Bed · {{ unit.floor }} · {{ unit.sqft.toLocaleString('en-GB') }} sqft
          </p>
        </div>
        <p
          class="shrink-0 text-right font-display text-[1rem] font-normal leading-none tabular"
          :class="unit.available ? 'text-white' : 'text-white/52 line-through'"
        >
          {{ unit.price }}
        </p>
      </li>
    </ul>
  </section>
</template>
