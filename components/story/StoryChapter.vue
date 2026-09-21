<script setup lang="ts">
import type { Chapter } from '~~/types'

/**
 * One chapter of the project story. The whole card is the control: it opens
 * that chapter as a single property view. The circle is an affordance, not a
 * separate button, so there is only one target and one tab stop.
 */
const props = defineProps<{ chapter: Chapter; index: number; priority?: boolean }>()

const inView = ref(false)

/* The card's root is a NuxtLink, and a template ref on a component hands back
   an instance, not the anchor it renders. The card already carries an id for
   deep links, so the observer resolves its element through that instead. */
let io: IntersectionObserver | null = null
onMounted(() => {
  const el = document.getElementById(`chapter-${props.chapter.id}`)
  if (!el) return

  io = new IntersectionObserver(
    ([e]) => {
      if (e?.isIntersecting) {
        inView.value = true
        io?.disconnect()
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.12 },
  )
  io.observe(el)
})
onBeforeUnmount(() => io?.disconnect())

const to = computed(() => `/ask?q=${encodeURIComponent(props.chapter.query)}`)
</script>

<template>
  <NuxtLink
    :id="`chapter-${chapter.id}`"
    :to="to"
    :aria-label="`${chapter.eyebrow}: ${chapter.title}`"
    class="group relative block -mx-[var(--shell-gutter)] overflow-hidden border-y-2 border-white bg-ink-900 shadow-[0_20px_40px_0_#00000066] transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)] motion-reduce:transition-none lg:mx-0 lg:shrink-0 lg:snap-start lg:rounded-2xl lg:border-2"
    :class="[
      inView ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0 motion-reduce:translate-y-0 motion-reduce:opacity-100',
      /* Cards sit flush. Every card after the first is pulled up by its own
         border width so its top rule lands on the previous card's bottom rule
         and the two read as the single 2px line the design has. */
      index > 0 ? '-mt-0.5 lg:mt-0' : 'border-t-0 lg:border-t-2',
      /* The overview leads the strip the way it leads the stack on a phone,
         and the widths leave a sliver of the next card showing so the row
         reads as continuing before anyone touches an arrow. */
      index === 0 ? 'lg:w-[36%]' : 'lg:w-[26%]',
    ]"
    :style="{ transitionDelay: inView ? `${Math.min(index, 3) * 60}ms` : '0ms' }"
  >
    <!-- The frame gives the card 401px on a 400px artboard at left -1, i.e.
         deliberately full bleed, so it breaks out of the shell gutter and
         carries no corner radius or side borders. 480 + the two 2px rules is
         the frame's 484, since Figma draws the stroke inside the frame. -->
    <div class="relative h-[480px] lg:h-[clamp(9rem,30svh,19rem)]">
      <UiMediaImage
        :asset="chapter.image"
        :priority="priority"
        sizes="(min-width: 64rem) 32vw, 100vw"
        class="h-full w-full transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
      />
      <div
        class="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(4,7,10,0.94)_0%,rgba(4,7,10,0.55)_28%,rgba(4,7,10,0.05)_62%)]"
        aria-hidden="true"
      />

      <!-- Caption. The arrow, eyebrow and title are one left-hand column so
           the 4px rhythm between them comes from the flow, and the stat sits
           in its own right-aligned column. -->
      <div class="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-6">
        <div class="min-w-0">
          <span
            class="mb-1 grid size-[31px] place-items-center rounded-full border border-[#C5A059]/30 text-[#C5A059] transition-colors duration-300 group-hover:border-[#C5A059]/70 group-hover:bg-[#C5A059]/10"
            aria-hidden="true"
          >
            <svg class="size-[10px]" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1.4 8.6 8.6 1.4M3 1.4h5.6V7" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>

          <p class="mb-1 text-[0.625rem] font-normal uppercase leading-[0.9375rem] tracking-[2.5px] text-[#C5A059]">
            {{ chapter.eyebrow }}
          </p>
          <h2 class="truncate text-[1.25rem] font-normal leading-7 text-[#F2EFE9]">
            {{ chapter.title }}
          </h2>
        </div>

        <div class="shrink-0 text-right">
          <p class="mb-1 text-[0.625rem] font-normal uppercase leading-[0.9375rem] tracking-[2.5px] text-[#D9D3C7]/60">
            {{ chapter.statLabel }}
          </p>
          <p class="tabular text-[0.75rem] font-medium leading-6 text-[#F2EFE9]">
            {{ chapter.statValue }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>
