<script setup lang="ts">
import type { StatTile } from '~~/types'

defineProps<{ tiles: StatTile[] }>()
</script>

<template>
  <!-- No outer card in the design: the tiles sit directly on the page. They
       fill the slide so this card and the unit list share one height. -->
  <section class="h-full w-full">
    <dl class="grid h-full grid-cols-2 auto-rows-fr gap-4">
      <div
        v-for="tile in tiles"
        :key="tile.label"
        class="flex min-h-[91px] flex-col gap-2 rounded border border-[#C9A961]/10 p-2 backdrop-blur-[20px]"
      >
        <dt class="text-[0.75rem] font-medium leading-[1.125rem] text-[#C9A961]">{{ tile.label }}</dt>
        <dd class="font-display text-[1.25rem] font-normal leading-none text-white tabular">
          {{ tile.value }}
        </dd>
        <p class="font-ui text-[0.625rem] font-normal leading-none text-[#7D7D7D]">{{ tile.caption }}</p>
      </div>
    </dl>
  </section>
</template>
