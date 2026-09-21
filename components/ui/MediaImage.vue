<script setup lang="ts">
import type { ImageAsset } from '~~/types'

/**
 * Responsive image with a blur-up placeholder.
 *
 * The mock server ships a ~1KB inline JPEG per asset, so there is something
 * on screen before the network answers, and the swap is a cross-fade rather
 * than a pop. Width/height are always set to reserve layout (zero CLS).
 */
const props = withDefaults(
  defineProps<{
    asset: ImageAsset
    sizes?: string
    priority?: boolean
    class?: string
  }>(),
  { sizes: '100vw', priority: false, class: '' },
)

const loaded = ref(false)

const srcset = computed(() =>
  [800, 1280, 1920].map((w) => `/media/${props.asset.name}-${w}.webp ${w}w`).join(', '),
)
const src = computed(() => `/media/${props.asset.name}-1280.webp`)
</script>

<template>
  <div class="relative overflow-hidden bg-ink-850" :class="props.class">
    <img
      v-if="asset.lqip"
      :src="asset.lqip"
      alt=""
      aria-hidden="true"
      class="absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-700"
      :class="loaded ? 'opacity-0' : 'opacity-100'"
    >
    <img
      :src="src"
      :srcset="srcset"
      :sizes="sizes"
      :alt="asset.alt"
      :width="asset.width"
      :height="asset.height"
      :loading="priority ? 'eager' : 'lazy'"
      :fetchpriority="priority ? 'high' : 'auto'"
      decoding="async"
      class="relative h-full w-full object-cover transition-opacity duration-700"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      @load="loaded = true"
      @error="loaded = true"
    >
  </div>
</template>
