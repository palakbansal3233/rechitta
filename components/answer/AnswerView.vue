<script setup lang="ts">
/**
 * The answer screen, laid out to match the "Project Overview" frames: the hero
 * runs full bleed behind everything, the query bar sits on top of it, and the
 * heading plus a single card sit at the bottom over a darkened gradient.
 *
 * It is its own screen rather than a panel, so the back arrow in the bar is
 * the way out.
 */
const agent = useAgent()

/*
 * The bar is a live control, not a caption: the question stays editable so a
 * follow-up is one keystroke away, and the orb is the microphone. `draft`
 * mirrors the answered query but is not bound to it, so typing never rewrites
 * the answer you are still reading.
 */
const draft = ref('')
const listening = computed(() => agent.mode.value === 'listening')
const thinking = computed(() => agent.mode.value === 'thinking')

function reask() {
  const q = draft.value.trim()
  if (!q || q === agent.answer.value?.query) return
  void agent.submit(q)
}

function toggleMic() {
  if (listening.value) void agent.stopListening()
  else void agent.startListening()
}

const track = ref<HTMLElement | null>(null)
const active = ref(0)
const answer = computed(() => agent.answer.value)
const cards = computed(() => answer.value?.cards ?? [])

function goTo(i: number) {
  const el = track.value
  const child = el?.children[i] as HTMLElement | undefined
  if (!el || !child) return
  el.scrollTo({ left: child.offsetLeft - el.offsetLeft, behavior: 'smooth' })
  active.value = i
}

function onScroll() {
  const el = track.value
  if (!el) return
  const mid = el.scrollLeft + el.clientWidth / 2
  let best = 0
  let bestDist = Infinity
  Array.from(el.children).forEach((c, i) => {
    const child = c as HTMLElement
    const centre = child.offsetLeft - el.offsetLeft + child.clientWidth / 2
    const d = Math.abs(centre - mid)
    if (d < bestDist) {
      bestDist = d
      best = i
    }
  })
  active.value = best
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'ArrowRight') goTo(Math.min(active.value + 1, cards.value.length - 1))
  if (e.key === 'ArrowLeft') goTo(Math.max(active.value - 1, 0))
}


/* A new answer resets the field to the question that produced it. */
watch(
  () => answer.value?.query,
  (q) => {
    draft.value = q ?? ''
  },
  { immediate: true },
)

watch(answer, () => {
  active.value = 0
  nextTick(() => track.value?.scrollTo({ left: 0 }))
})
</script>

<template>
  <section
    v-if="answer"
    class="relative -mx-[var(--shell-gutter)] flex min-h-[calc(100svh-var(--header-h)-1.5rem)] flex-col overflow-hidden lg:mx-0 lg:grid lg:min-h-0 lg:grid-cols-[minmax(0,46%)_minmax(0,1fr)] lg:items-start lg:gap-x-8 lg:gap-y-5 lg:overflow-visible lg:px-[var(--shell-gutter)] lg:py-6"
    aria-label="Rechitta's answer"
  >
    <!-- On a phone the hero runs full bleed behind everything. From 64rem it
         becomes the left half of a two-column detail view, with the heading
         set on the image the way the frame has it. -->
    <div
      class="absolute inset-0 lg:relative lg:inset-auto lg:col-start-1 lg:row-start-2 lg:h-[min(60svh,34rem)] lg:overflow-hidden lg:rounded-2xl"
    >
      <UiMediaImage
        :asset="answer.hero"
        priority
        sizes="(min-width: 64rem) 46vw, 100vw"
        class="h-full w-full"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(4,7,10,0.55)_0%,rgba(4,7,10,0.12)_22%,rgba(4,7,10,0.62)_55%,rgba(4,7,10,0.96)_78%,#04070a_100%)] lg:bg-[linear-gradient(to_top,rgba(4,7,10,0.9)_0%,rgba(4,7,10,0.25)_38%,transparent_70%)]"
        aria-hidden="true"
      />
      <h2 class="absolute inset-x-0 bottom-0 hidden p-7 text-[clamp(1.75rem,2.4vw,2.5rem)] font-normal leading-tight text-[#F2EFE9] lg:block">
        {{ answer.heading }}
      </h2>
    </div>

    <!-- Query bar -->
    <div
      class="sticky top-[calc(var(--header-h)+10px)] z-20 mx-4 mt-[10px] flex min-h-[66px] items-center justify-between gap-3 rounded-lg border border-white/10 bg-ink-1000/60 px-4 py-[14px] backdrop-blur-[16px] lg:static lg:col-span-2 lg:row-start-1 lg:mx-0 lg:mt-0"
    >
      <button
        type="button"
        class="grid size-9 shrink-0 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/12 hover:text-white"
        aria-label="Back to the project"
        @click="agent.dismissAnswer()"
      >
        <svg class="size-[1.15rem]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
          <path d="M16 10H5m0 0 4.5-4.5M5 10l4.5 4.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="min-w-0 flex-1">
        <label for="answer-query" class="flex items-center gap-1.5 text-[0.75rem] font-medium leading-4 text-[#9CA3AF]">
          <!-- The supplied mark, inline so it stays crisp at any density. -->
          <svg class="h-[10px] w-[11px] shrink-0" viewBox="0 0 11 10" fill="none" aria-hidden="true">
            <path d="M6.62624 5.71849H6.6101C8.11389 5.71849 9.33233 4.43813 9.33233 2.85963C9.33307 1.28036 8.11389 0 6.6101 0H0.0146712L5.39239 5.71849H0L4.09252 9.9987H10.7129L6.62624 5.71849Z" fill="#AEAEAE" />
          </svg>
          <span><span class="sr-only">Ask </span>Rechitta</span>
        </label>
        <input
          id="answer-query"
          v-model="draft"
          type="text"
          autocomplete="off"
          spellcheck="false"
          :placeholder="listening ? 'Listening…' : thinking ? 'Thinking…' : answer.query"
          class="block w-full truncate border-0 bg-transparent p-0 text-[0.875rem] font-semibold leading-5 text-white outline-none placeholder:text-white/70 focus-visible:outline-none"
          @keydown.enter.prevent="reask"
          @keydown.esc.prevent="draft = answer?.query ?? ''"
        >
      </div>

      <!-- The orb is the microphone, as in the design -->
      <button
        type="button"
        class="relative -my-[5px] grid h-[46px] w-[49px] shrink-0 place-items-center rounded-full transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-300"
        :aria-pressed="listening"
        :aria-label="listening ? 'Stop listening and ask' : 'Ask with your voice'"
        @click="toggleMic"
      >
        <span
          v-if="listening"
          class="absolute inset-0 rounded-full border border-white/50 motion-safe:animate-[ping-soft_1.8s_ease-out_infinite]"
          aria-hidden="true"
        />
        <span class="absolute inset-0 rotate-180 opacity-90 mix-blend-screen" aria-hidden="true">
          <OrbCanvas
            :bands="agent.mic.bands"
            :mode="thinking ? 'thinking' : listening ? 'listening' : 'idle'"
            :gain="0.5"
          />
        </span>
        <svg class="absolute size-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          <rect x="9.5" y="3.5" width="5" height="10" rx="2.5" />
          <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5v3" stroke-linecap="round" />
        </svg>
      </button>
    </div>

    <!-- Content, anchored to the bottom over the darkened half -->
    <div
      class="relative mt-auto px-[var(--spacing-gutter)] pb-[var(--spacing-gutter)] pt-[28vh] lg:col-start-2 lg:row-start-2 lg:mt-0 lg:px-0 lg:pb-0 lg:pt-0"
    >
      <h2 class="mb-4 font-display text-[1.5rem] font-normal leading-none text-white lg:hidden">{{ answer.heading }}</h2>

      <!-- The design carries no prose here: the cards are the answer. The
           spoken reply stays available to assistive tech. -->
      <p class="sr-only">{{ answer.summary }}</p>

      <div v-if="cards.length" class="lg:mt-0">
        <div
          ref="track"
          role="group"
          aria-roledescription="carousel"
          aria-label="Answer details"
          tabindex="0"
          class="no-scrollbar -mx-[var(--spacing-gutter)] flex snap-x snap-mandatory items-stretch gap-3 overflow-x-auto scroll-smooth px-[var(--spacing-gutter)] lg:mx-0 lg:block lg:space-y-4 lg:overflow-visible lg:px-0"
          @scroll.passive="onScroll"
          @keydown="onKeydown"
        >
          <div
            v-for="(card, i) in cards"
            :key="i"
            class="flex w-full shrink-0 snap-center"
            :aria-label="`${i + 1} of ${cards.length}`"
          >
            <AnswerStatGrid v-if="card.kind === 'stats'" :tiles="card.tiles" />
            <AnswerUnitList v-else-if="card.kind === 'units'" :units="card.units" />
            <AnswerPaymentPlan
              v-else-if="card.kind === 'payment'"
              :milestones="card.milestones"
              :footnote="card.footnote"
            />
            <AnswerNoteCard v-else :body="card.body" :bullets="card.bullets" />
          </div>
        </div>

        <div class="mt-4 flex items-center justify-between lg:hidden">
          <div class="flex gap-1.5">
            <button
              v-for="(_, i) in cards"
              :key="i"
              type="button"
              class="h-1.5 rounded-full transition-all duration-400"
              :class="i === active ? 'w-6 bg-white' : 'w-1.5 bg-white/30'"
              :aria-label="`Go to card ${i + 1}`"
              :aria-current="i === active"
              @click="goTo(i)"
            />
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="grid size-9 place-items-center rounded-full border border-white/14 text-white/75 transition-colors enabled:hover:bg-white/10 disabled:opacity-35"
              :disabled="active === 0"
              aria-label="Previous card"
              @click="goTo(active - 1)"
            >
              <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 5 7 10l5 5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
            <button
              type="button"
              class="grid size-9 place-items-center rounded-full border border-white/14 text-white/75 transition-colors enabled:hover:bg-white/10 disabled:opacity-35"
              :disabled="active === cards.length - 1"
              aria-label="Next card"
              @click="goTo(active + 1)"
            >
              <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m8 5 5 5-5 5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Nothing matched: the reply itself becomes the content -->
      <div v-else class="mt-4 space-y-4">
        <p class="max-w-[60ch] text-sm leading-relaxed text-dim">{{ answer.summary }}</p>
        <div v-if="answer.followUps.length" class="space-y-2.5">
          <p class="eyebrow">I can answer these</p>
          <ul class="flex flex-wrap gap-2">
            <li v-for="q in answer.followUps" :key="q">
              <button
                type="button"
                class="rounded-full border border-white/14 bg-white/6 px-3.5 py-1.5 text-xs text-white/80 transition-colors hover:border-white/30 hover:bg-white/12 hover:text-white"
                @click="agent.submit(q)"
              >
                {{ q }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>
