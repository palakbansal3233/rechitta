<script setup lang="ts">
import type { Chapter, Property } from '~~/types'
import type { NormalisedError } from '~/composables/useApi'

const props = defineProps<{
  chapters: Chapter[]
  property: Property | null
  pending: boolean
  error: NormalisedError | null
}>()
defineEmits<{ retry: [] }>()

/**
 * A vertical stack on a phone. From 64rem the same cards become a carousel of
 * three, paged by the arrows. The arrow state is read back off the element's
 * own scroll position rather than tracked separately, so a trackpad swipe and
 * a button press stay in agreement.
 */
const strip = useTemplateRef<HTMLElement>('strip')
const canPrev = ref(false)
const canNext = ref(false)

function syncArrows() {
  const el = strip.value
  if (!el) return
  canPrev.value = el.scrollLeft > 8
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 8
}

function page(direction: 1 | -1) {
  const el = strip.value
  if (!el) return
  /* Measured against the strip's own box, not offsetLeft: the strip is not a
     positioned ancestor, so offsetLeft resolves to the wrapper and the paging
     drifts by that offset. */
  const box = el.getBoundingClientRect()
  const pad = Number.parseFloat(getComputedStyle(el).paddingLeft) || 0
  const edges = [...el.querySelectorAll<HTMLElement>('a')].map(
    (c) => c.getBoundingClientRect().left - box.left + el.scrollLeft - pad,
  )
  const here = el.scrollLeft
  const next =
    direction === 1
      ? edges.find((x) => x > here + 8)
      : [...edges].reverse().find((x) => x < here - 8)
  el.scrollTo({ left: next ?? (direction === 1 ? el.scrollWidth : 0), behavior: 'smooth' })
}

/* The strip's own box does not change when cards arrive, only its scrollWidth,
   so a ResizeObserver on it never fires. The chapter count is the real signal. */
watch(
  () => props.chapters.length,
  () => nextTick(syncArrows),
  { immediate: true },
)

let ro: ResizeObserver | null = null
onMounted(() => {
  nextTick(syncArrows)
  ro = new ResizeObserver(syncArrows)
  if (strip.value) ro.observe(strip.value)
})
onBeforeUnmount(() => ro?.disconnect())
</script>

<template>
  <div>
    <!-- Error -->
    <UiStateMessage
      v-if="error"
      tone="error"
      title="The project file didn't load"
      :body="error.message"
    >
      <template #actions>
        <UiAppButton size="sm" @click="$emit('retry')">Try again</UiAppButton>
      </template>

    </UiStateMessage>

    <!-- Empty -->
    <UiStateMessage
      v-else-if="!pending && !chapters.length"
      tone="empty"
      title="Nothing published yet"
      body="The developer has not released the project story for this listing. Ask Rechitta a question instead, or request a viewing below."
    />

    <div v-else class="relative">
      <div
        ref="strip"
        class="strip lg:flex lg:snap-x lg:snap-mandatory lg:gap-4 lg:overflow-x-auto lg:overflow-y-hidden lg:px-[var(--shell-gutter)] lg:pb-[clamp(0.75rem,3svh,1.75rem)] lg:[scroll-padding-inline:var(--shell-gutter)] lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden"
        @scroll.passive="syncArrows"
      >
        <template v-if="pending">
          <div
            v-for="i in 3"
            :key="`s${i}`"
            class="skeleton -mx-[var(--shell-gutter)] h-[484px] not-first:-mt-0.5 lg:mx-0 lg:h-[clamp(9rem,30svh,19rem)] lg:w-[26%] lg:shrink-0 lg:first:w-[36%] lg:rounded-2xl"
          />
        </template>

        <StoryChapter
          v-for="(chapter, i) in chapters"
          :key="chapter.id"
          :chapter="chapter"
          :index="i"
          :priority="i < 3"
        />
      </div>

      <!-- Carousel controls, desktop only: the phone pages by scrolling. -->
      <button
        v-for="dir in ([-1, 1] as const)"
        :key="dir"
        type="button"
        class="absolute top-[calc(50%-clamp(0.75rem,3svh,1.75rem)/2)] z-10 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/20 bg-ink-1000/80 text-white shadow-[0_8px_24px_rgba(0,0,0,0.5)] backdrop-blur-md transition disabled:pointer-events-none disabled:opacity-0 hover:scale-105 hover:border-white/45 hover:bg-ink-1000 lg:grid"
        :class="dir === -1 ? 'left-3' : 'right-3'"
        :disabled="dir === -1 ? !canPrev : !canNext"
        :aria-label="dir === -1 ? 'Previous chapters' : 'Next chapters'"
        @click="page(dir)"
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
          <path
            :d="dir === -1 ? 'M14.5 5.5 8 12l6.5 6.5' : 'M9.5 5.5 16 12l-6.5 6.5'"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </div>

    <!-- Closing card, from the last frame of the design -->
    <StoryViewingCard :property="property" />
  </div>
</template>

<style scoped>
/* The trailing edge fades so the card peeking past it reads as more to come
   rather than as something clipped by accident. */
@media (min-width: 64rem) {
  .strip {
    -webkit-mask-image: linear-gradient(to right, #000 0 92%, transparent 100%);
    mask-image: linear-gradient(to right, #000 0 92%, transparent 100%);
  }
}
</style>
